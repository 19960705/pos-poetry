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
  const closed = document.getElementById("closed");

  const mem = window.PosMemory.load();
  const incoming = window.decodeSlip(location.search);

  const state = {
    booted: false,
    amount: "",
    txn: 217 + (mem.points || 0),
    busy: false,
    current: null,
    kept: mem.kept || [],
    drawerOpen: false,
    closed: false,
    closing: false,
    shift: window.getShiftName(),
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
    if (!state.amount.includes(".")) return state.amount + ".00";
    const [a, b = ""] = state.amount.split(".");
    return a + "." + (b + "00").slice(0, 2);
  }

  function shiftInfo() {
    return window.POS_POEMS.shifts[state.shift] || window.POS_POEMS.shifts.night;
  }

  function idleLine() {
    if (state.closed) return "已打烊";
    if (mem.visits > 1 && !state.amount) return "又是你。积分 " + mem.points;
    return shiftInfo().greet;
  }

  function lcd(status) {
    window.PosRig.drawLCD({
      amount: amountDisplay(),
      line: state.amount ? "金额已输入" : idleLine(),
      status: status || (state.closed ? "明日再来" : state.busy ? "出票中" : "等待确认"),
      txn: String(state.txn).padStart(6, "0"),
    });
  }

  function shareUrl(meta) {
    const q = window.encodeSlip(meta);
    return location.origin + location.pathname + "?" + q;
  }

  function applyShift() {
    state.shift = window.getShiftName();
    const info = shiftInfo();
    window.POS_POEMS.store.sub = info.sub;
    window.PosRig.setShift(state.shift);
    document.body.dataset.shift = state.shift;
    tickClock();
  }

  function typeBoot() {
    const lines = [
      "初始化财政模块 .............. OK",
      "热敏头温度 58°C ............. OK",
      mem.visits > 1
        ? "回头客识别 .............. 第" + mem.visits + "次"
        : "纸卷余量  还够写几首 ........ OK",
      "诗人模块  已连接",
      "班次      " + shiftInfo().label,
      "商户号    POET-0217",
      incoming ? "外来查询单  已挂起" : "",
      "本机不找零。本机只出诗。",
    ].filter(Boolean);
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
    window.PosMemory.touchVisit(mem);
    window.PosAudio.unlock();
    boot.classList.add("hide");
    setTimeout(() => { boot.style.display = "none"; }, 720);
    applyShift();
    if (mem.visits > 1) lcd("又是你");
    else lcd("夜班开始");
    drawerBtn.textContent = "已撕小票 " + state.kept.length;
    renderStash();
    if (incoming) {
      setTimeout(() => replayIncoming(incoming), 700);
    }
  }

  function replayIncoming(picked) {
    const meta = {
      poem: picked.poem,
      amount: picked.amount || "0.00",
      txn: nowStamp() + "-Q" + String(state.txn).padStart(3, "0"),
      when: new Date().toLocaleString("zh-CN", { hour12: false }),
      pay: "查询",
      voided: false,
      special: true,
      id: picked.id,
      custom: !!picked.custom,
      fromLink: true,
    };
    state.current = meta;
    const used = window.ReceiptPress.render(meta);
    showPaper(used);
    lcd("此单已查询");
  }

  function feed(ch) {
    if (state.busy || state.closed) return;
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
    if (state.busy || state.closed) return;
    state.amount = "";
    window.PosAudio.key();
    lcd("已清除");
  }

  function voidAmt() {
    if (state.busy || state.closed) return;
    if (!state.amount) {
      window.PosAudio.err();
      printNow(true);
      return;
    }
    state.amount = "";
    window.PosAudio.err();
    lcd("此单作废");
  }

  async function printNow(forceVoid, pay, forcedPick) {
    if (state.busy) return;
    if (state.closed) {
      window.PosAudio.err();
      lcd("已打烊");
      return;
    }

    const willClose = !forceVoid && !forcedPick && mem.printsToday >= 6;
    state.busy = true;
    window.PosAudio.ok();
    lcd(willClose ? "最后一单" : "正在出票");

    const amount = amountDisplay();
    const cardPay = pay === "挥卡" || pay === "刷卡";
    let picked = forcedPick;
    if (!picked) {
      if (willClose) {
        picked = { id: "last", poem: window.POS_POEMS.catalog.last, special: true };
      } else if (forceVoid) {
        picked = { id: "voided", poem: window.POS_POEMS.catalog.voided, special: true };
      } else if (cardPay && amount === "0.00") {
        const extras = mem.visits > 1 ? ["member", "change", "rain", "query"] : ["rain", "member", "change", "smoke"];
        const id = extras[state.txn % extras.length];
        picked = { id, poem: window.POS_POEMS.catalog[id], special: false };
      } else {
        picked = window.pickPoem(amount, state.shift);
      }
    }

    const meta = {
      poem: picked.poem,
      amount,
      txn: nowStamp() + "-" + String(state.txn).padStart(4, "0"),
      when: new Date().toLocaleString("zh-CN", { hour12: false }),
      pay: forceVoid ? "作废" : (pay || "柜台"),
      voided: !!forceVoid,
      special: !!picked.special,
      id: picked.id,
      custom: !!picked.custom,
    };
    state.current = meta;
    state.txn += 1;
    if (!forcedPick || !forcedPick.fromLink) window.PosMemory.addPrint(mem);
    if (willClose) state.closing = true;

    const used = window.ReceiptPress.render(meta);
    window.PosRig.attachReceiptCanvas(window.ReceiptPress.canvas);
    await new Promise((resolve) => {
      window.PosRig.startPrint(used, resolve);
    });

    showPaper(used);
    lcd(willClose ? "已打烊" : picked.special ? "特殊金额 · 已出诗" : "打印完成");
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
    if (state.closing) closeStore();
  }

  function keepCurrent() {
    if (!state.current) return;
    window.PosAudio.tear();
    const slip = {
      id: state.current.id,
      amount: state.current.amount,
      txn: state.current.txn,
      when: state.current.when,
      pay: state.current.pay,
      title: state.current.poem.title,
      sku: state.current.poem.sku,
      footer: state.current.poem.footer,
      total: state.current.poem.total,
      lines: state.current.poem.lines,
      voided: !!state.current.voided,
      custom: !!state.current.custom,
      keptAt: Date.now(),
    };
    state.kept.unshift(slip);
    window.PosMemory.keep(mem, slip);
    renderStash();
    hidePaper();
    state.current = null;
    drawerBtn.textContent = "已撕小票 " + state.kept.length;
  }

  function restoreSlip(item) {
    const poem = item.custom || !window.POS_POEMS.catalog[item.id]
      ? {
          title: item.title,
          sku: item.sku,
          footer: item.footer,
          total: item.total,
          lines: item.lines || [],
        }
      : window.POS_POEMS.catalog[item.id];
    const meta = {
      poem,
      amount: item.amount,
      txn: item.txn,
      when: item.when,
      pay: item.pay || "抽屉",
      voided: !!item.voided,
      id: item.id,
      custom: !!item.custom,
    };
    state.current = meta;
    const used = window.ReceiptPress.render(meta);
    showPaper(used);
  }

  function renderStash() {
    if (!state.kept.length) {
      stash.innerHTML = '<p class="stash-empty">柜台抽屉是空的。出一张票，再撕下来。热敏字会自己变淡。</p>';
      return;
    }
    stash.innerHTML = "";
    state.kept.forEach((item, i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "stash-item";
      const fade = window.PosMemory.fade(item.keptAt);
      el.style.setProperty("--tilt", ((i % 5) - 2) * 1.1 + "deg");
      el.style.opacity = fade.toFixed(2);
      el.style.filter = fade < 0.7 ? "grayscale(" + Math.round((1 - fade) * 80) + "%)" : "none";
      el.innerHTML = "<strong>" + item.title + "</strong><small>¥ " + item.amount + " · " + String(item.txn).slice(-10) + "</small>";
      el.addEventListener("click", () => restoreSlip(item));
      stash.appendChild(el);
    });
  }

  function toast(text) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.tid);
    toast.tid = setTimeout(() => el.classList.remove("show"), 1600);
  }

  async function copyLink() {
    if (!state.current) return;
    const url = shareUrl(state.current);
    try {
      history.replaceState({}, "", "?" + window.encodeSlip(state.current));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
      if (navigator.share) {
        try { await navigator.share({ title: state.current.poem.title, url: url }); } catch (e) {}
      }
      toast("链接已抄好。纸可以走了。");
    } catch (err) {
      toast(url);
    }
  }

  function saveImage() {
    if (!receiptView.width) return;
    const a = document.createElement("a");
    a.href = receiptView.toDataURL("image/png");
    const name = (state.current && state.current.poem.title) || "小票";
    a.download = "夜班诗铺-" + name + ".png";
    a.click();
    toast("图已存。热敏字比相册先忘。");
  }

  function closeStore() {
    if (state.closed) return;
    state.closed = true;
    state.closing = false;
    hidePaper();
    window.PosRig.flicker(8, () => {
      closed.classList.add("show");
      lcd("已打烊");
    });
  }

  function reopenShift() {
    state.closed = false;
    mem.printsToday = 0;
    window.PosMemory.save(mem);
    closed.classList.remove("show");
    applyShift();
    lcd("再值一班");
  }

  function handle(code) {
    if (!state.booted) {
      enterStore();
      return;
    }
    if (state.closed && code !== "clr") {
      window.PosAudio.err();
      lcd("已打烊");
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
    if (state.busy || state.closed) return;
    window.PosAudio.swipe();
    lcd("感应成功");
    setTimeout(() => printNow(false, "挥卡"), 220);
  }

  function bind() {
    window.__pos = {
      state,
      mem,
      feed,
      printNow,
      swipe,
      keepCurrent,
      amountDisplay,
    };

    document.addEventListener("keydown", (e) => {
      if (e.target && /textarea|input/i.test(e.target.tagName)) return;
      if (!state.booted) {
        enterStore();
        return;
      }
      if (e.key === "Escape") {
        if (paperStage.classList.contains("active")) hidePaper();
        else if (state.closed) return;
        else voidAmt();
        return;
      }
      if (state.closed) return;
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

    document.addEventListener("paste", (e) => {
      if (!state.booted || state.busy || state.closed) return;
      const text = (e.clipboardData && e.clipboardData.getData("text")) || "";
      if (!text || text.length < 8) return;
      if (!/[\n\r]/.test(text) && !/\d+\.\d{2}/.test(text) && text.length < 24) return;
      e.preventDefault();
      const picked = window.rewriteReceipt(text);
      printNow(false, "投入", picked);
    });

    boot.addEventListener("click", enterStore);
    document.getElementById("paper-dim").addEventListener("click", hidePaper);
    document.getElementById("btn-keep").addEventListener("click", keepCurrent);
    document.getElementById("btn-save").addEventListener("click", saveImage);
    document.getElementById("btn-share").addEventListener("click", copyLink);
    document.getElementById("live-receipt").addEventListener("click", copyLink);
    document.getElementById("btn-reopen").addEventListener("click", reopenShift);

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
    const info = shiftInfo();
    const extra = mem.visits > 1 ? " · 回头客" : "";
    shiftEl.textContent = info.label + extra + " · POET-0217";
  }

  async function start() {
    applyShift();
    typeBoot();
    tickClock();
    setInterval(() => {
      const next = window.getShiftName();
      if (next !== state.shift && !state.closed) applyShift();
      else tickClock();
    }, 1000);
    window.PosRig.init(document.getElementById("three-root"));
    window.PosRig.setShift(state.shift);
    await document.fonts.ready.catch(() => {});
    await window.ReceiptPress.init();
    bind();
    lcd("待机");
    window.__posReady = true;
  }

  start();
})();
