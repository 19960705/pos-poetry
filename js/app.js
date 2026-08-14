(function () {
  const boot = document.getElementById("boot");
  const bootLog = document.getElementById("boot-log");
  const clockEl = document.getElementById("clock");
  const shiftEl = document.getElementById("shift");
  const muteBtn = document.getElementById("btn-mute");
  const swipeBtn = document.getElementById("btn-swipe");
  const drawerBtn = document.getElementById("btn-drawer");
  const drawer = document.getElementById("drawer");
  const stash = document.getElementById("stash");
  const paperStage = document.getElementById("paper-stage");
  const receiptView = document.getElementById("receipt-view");
  const pad = document.getElementById("pad");

  const state = {
    booted: false,
    amount: "",
    txn: 217,
    busy: false,
    current: null,
    kept: [],
    drawerOpen: false,
  };

  function pad2(n) { return String(n).padStart(2, "0"); }

  function nowStamp() {
    const d = new Date();
    return (
      d.getFullYear() +
      pad2(d.getMonth() + 1) +
      pad2(d.getDate()) +
      "-" +
      pad2(d.getHours()) +
      pad2(d.getMinutes()) +
      pad2(d.getSeconds())
    );
  }

  function clockText() {
    const d = new Date();
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  }

  function amountDisplay() {
    if (!state.amount) return "0.00";
    if (state.amount.endsWith(".")) return state.amount + "0";
    if (!state.amount.includes(".")) {
      return state.amount + ".00";
    }
    const [a, b = ""] = state.amount.split(".");
    return a + "." + (b + "00").slice(0, 2);
  }

  function lcd(status) {
    window.PosRig.drawLCD({
      amount: amountDisplay(),
      line: state.amount ? "金额已输入" : "请将心灵靠近感应区",
      status: status || (state.busy ? "出票中" : "等待确认"),
      txn: String(state.txn).padStart(6, "0"),
    });
  }

  function typeBoot() {
    const lines = [
      "初始化财政模块 .............. OK",
      "热敏头温度 58°C ............. OK",
      "纸卷余量  还够写几首 ........ OK",
      "诗人模块  已连接",
      "收银员    机",
      "商户号    POET-0217",
      "",
      "本机不找零。本机只出诗。",
    ];
    let i = 0;
    bootLog.textContent = "";
    const timer = setInterval(() => {
      if (i >= lines.length) {
        clearInterval(timer);
        return;
      }
      bootLog.textContent += lines[i] + "\n";
      i += 1;
    }, 180);
  }

  function enterStore() {
    if (state.booted) return;
    state.booted = true;
    window.PosAudio.unlock();
    boot.classList.add("hide");
    setTimeout(() => { boot.style.display = "none"; }, 720);
    lcd("夜班开始");
  }

  function feed(ch) {
    if (state.busy) return;
    if (ch === "." && state.amount.includes(".")) return;
    if (ch === "00") {
      if (!state.amount) state.amount = "0";
      if (!state.amount.includes(".")) {
        if (state.amount.length >= 5) return;
        state.amount += "00";
      }
      window.PosAudio.key();
      lcd();
      return;
    }
    if (/^\d$/.test(ch)) {
      const [a, b] = state.amount.split(".");
      if (state.amount.includes(".")) {
        if ((b || "").length >= 2) return;
      } else if ((a || "").length >= 5) return;
      if (state.amount === "0" && ch !== ".") state.amount = "";
      state.amount += ch;
      window.PosAudio.key();
      lcd();
      return;
    }
    if (ch === ".") {
      if (!state.amount) state.amount = "0";
      state.amount += ".";
      window.PosAudio.key();
      lcd();
    }
  }

  function clearAmt() {
    if (state.busy) return;
    state.amount = "";
    window.PosAudio.key();
    lcd("已清除");
  }

  function voidAmt() {
    if (state.busy) return;
    if (!state.amount) {
      window.PosAudio.err();
      printNow(true);
      return;
    }
    state.amount = "";
    window.PosAudio.err();
    lcd("此单作废");
  }

  async function printNow(forceVoid, pay) {
    if (state.busy) return;
    state.busy = true;
    window.PosAudio.ok();
    lcd("正在出票");

    const amount = amountDisplay();
    const cardPay = pay === "挥卡" || pay === "刷卡";
    let picked;
    if (forceVoid) {
      picked = { id: "voided", poem: window.POS_POEMS.catalog.voided, special: true };
    } else if (cardPay && amount === "0.00") {
      const extras = ["rain", "member", "change", "smoke"];
      const id = extras[state.txn % extras.length];
      picked = { id, poem: window.POS_POEMS.catalog[id], special: false };
    } else {
      picked = window.pickPoem(amount);
    }
    const meta = {
      poem: picked.poem,
      amount,
      txn: nowStamp() + "-" + String(state.txn).padStart(4, "0"),
      when: new Date().toLocaleString("zh-CN", { hour12: false }),
      pay: forceVoid ? "作废" : (pay || "柜台"),
      voided: !!forceVoid,
      special: picked.special,
      id: picked.id,
    };
    state.current = meta;
    state.txn += 1;

    const used = window.ReceiptPress.render(meta);
    window.PosRig.attachReceiptCanvas(window.ReceiptPress.canvas);
    await new Promise((resolve) => {
      window.PosRig.startPrint(used, resolve);
    });

    showPaper(used);
    lcd(picked.special ? "特殊金额 · 已出诗" : "打印完成");
    state.busy = false;
    state.amount = "";
  }

  function showPaper(used) {
    const src = window.ReceiptPress.canvas;
    const h = Math.min(used + 8, src.height);
    receiptView.width = src.width;
    receiptView.height = h;
    const ctx = receiptView.getContext("2d");
    ctx.drawImage(src, 0, 0, src.width, h, 0, 0, src.width, h);
    window.PosRig.hideReceipt();
    paperStage.classList.add("active");
  }

  function hidePaper() {
    paperStage.classList.remove("active");
    window.PosRig.hideReceipt();
  }

  function keepCurrent() {
    if (!state.current) return;
    window.PosAudio.tear();
    state.kept.unshift({
      ...state.current,
      preview: receiptView.toDataURL("image/png"),
    });
    renderStash();
    hidePaper();
    state.current = null;
    drawerBtn.textContent = "已撕小票 " + state.kept.length;
  }

  function renderStash() {
    if (!state.kept.length) {
      stash.innerHTML = '<p class="stash-empty">柜台抽屉是空的。出一张票，再撕下来。</p>';
      return;
    }
    stash.innerHTML = "";
    state.kept.forEach((item, i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "stash-item";
      el.style.setProperty("--tilt", ((i % 5) - 2) * 1.1 + "deg");
      el.innerHTML = "<strong>" + item.poem.title + "</strong><small>¥ " + item.amount + " · " + item.txn.slice(-10) + "</small>";
      el.addEventListener("click", () => {
        const img = new Image();
        img.onload = () => {
          receiptView.width = img.width;
          receiptView.height = img.height;
          receiptView.getContext("2d").drawImage(img, 0, 0);
          paperStage.classList.add("active");
        };
        img.src = item.preview;
      });
      stash.appendChild(el);
    });
  }

  function handle(code) {
    if (!state.booted) {
      enterStore();
      return;
    }
    window.PosRig.pressKeyByCode(code);
    if (code === "ok") return printNow(false, "确认键");
    if (code === "clr") return clearAmt();
    if (code === "void") return voidAmt();
    if (code === "card") return swipe();
    feed(code);
  }

  function swipe() {
    if (state.busy) return;
    window.PosAudio.swipe();
    lcd("感应成功");
    setTimeout(() => printNow(false, "挥卡"), 220);
  }

  function bind() {
    window.__pos = {
      state,
      feed,
      printNow,
      swipe,
      keepCurrent,
      amountDisplay,
    };

    document.addEventListener("keydown", (e) => {
      window.__lastKey = e.key + "|" + e.code;
      if (!state.booted) {
        enterStore();
        return;
      }
      if (e.key === "Escape") {
        if (paperStage.classList.contains("active")) hidePaper();
        else voidAmt();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        printNow(false, "键盘");
        return;
      }
      if (e.key === "Backspace") {
        if (state.busy) return;
        state.amount = state.amount.slice(0, -1);
        window.PosAudio.key();
        lcd();
        return;
      }
      if (e.key === "." || e.key === "Period" || e.code === "Period" || e.code === "NumpadDecimal") feed(".");
      else if (/^\d$/.test(e.key)) feed(e.key);
    });

    boot.addEventListener("click", enterStore);
    document.getElementById("paper-dim").addEventListener("click", hidePaper);
    document.getElementById("btn-keep").addEventListener("click", keepCurrent);
    document.getElementById("btn-drop").addEventListener("click", keepCurrent);

    muteBtn.addEventListener("click", () => {
      const next = !window.PosAudio.muted;
      window.PosAudio.setMuted(next);
      muteBtn.textContent = next ? "声音 关" : "声音 开";
      muteBtn.setAttribute("aria-pressed", next ? "true" : "false");
    });

    swipeBtn.addEventListener("click", () => {
      if (!state.booted) enterStore();
      swipe();
    });

    drawerBtn.addEventListener("click", () => {
      state.drawerOpen = !state.drawerOpen;
      drawer.classList.toggle("open", state.drawerOpen);
      drawer.setAttribute("aria-hidden", state.drawerOpen ? "false" : "true");
    });

    pad.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      handle(btn.dataset.k);
    });

    window.PosRig.on("key", handle);
    window.PosRig.on("swipe", swipe);
  }

  function tickClock() {
    clockEl.textContent = clockText();
    const h = new Date().getHours();
    const label = h >= 22 || h < 6 ? "夜班中" : h < 12 ? "早班也出诗" : "白班假装忙碌";
    shiftEl.textContent = label + " · 终端 POET-0217";
  }

  async function start() {
    typeBoot();
    tickClock();
    setInterval(tickClock, 1000);
    window.PosRig.init(document.getElementById("three-root"));
    await document.fonts.ready.catch(() => {});
    await window.ReceiptPress.init();
    bind();
    lcd("待机");
    window.__posReady = true;
  }

  start();
})();
