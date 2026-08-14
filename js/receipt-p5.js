window.ReceiptPress = (function () {
  const W = 384;
  const H = 1100;
  let sketch = null;
  let ready = false;
  let job = null;

  function wrapText(p, text, maxW) {
    const chars = String(text).split("");
    const lines = [];
    let cur = "";
    for (const ch of chars) {
      const next = cur + ch;
      if (p.textWidth(next) > maxW && cur) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function compose(p, meta) {
    const store = window.POS_POEMS.store;
    const poem = meta.poem;
    const amount = meta.amount;
    const txn = meta.txn;
    const when = meta.when;
    const pay = meta.pay || "现金/刷卡";

    p.background(236, 226, 196);
    p.noStroke();

    for (let i = 0; i < 280; i++) {
      p.fill(210, 190, 150, p.random(10, 26));
      p.rect(p.random(W), p.random(H), p.random(10, 26), 1);
    }
    for (let i = 0; i < 24; i++) {
      p.fill(200, 170, 120, 16);
      p.ellipse(p.random(W), p.random(H), p.random(18, 50), p.random(8, 16));
    }

    let y = 36;
    p.fill(38, 32, 24);
    p.textAlign(p.CENTER, p.TOP);

    p.textFont("ZCOOL QingKe HuangYou");
    p.textSize(28);
    p.text(store.name, W / 2, y);
    y += 34;
    p.textFont("Noto Sans SC");
    p.textSize(11);
    p.text(store.sub, W / 2, y);
    y += 22;
    p.textSize(10);
    p.text(store.address, W / 2, y);
    y += 26;

    dash(p, y);
    y += 16;

    p.textAlign(p.LEFT, p.TOP);
    p.textFont("Share Tech Mono");
    p.textSize(12);
    pair(p, "商户", store.merchant, y); y += 18;
    pair(p, "单号", txn, y); y += 18;
    pair(p, "收银", store.cashier, y); y += 18;
    pair(p, "时间", when, y); y += 18;
    pair(p, "支付", pay, y); y += 22;

    dash(p, y);
    y += 18;

    p.textAlign(p.CENTER, p.TOP);
    p.textFont("Zhi Mang Xing");
    p.textSize(30);
    p.text(poem.title, W / 2, y);
    y += 38;
    p.textFont("Share Tech Mono");
    p.textSize(11);
    p.text("SKU  " + poem.sku, W / 2, y);
    y += 24;

    p.textAlign(p.LEFT, p.TOP);
    p.textFont("Noto Sans SC");
    p.textSize(11);
    p.fill(80, 68, 50);
    pair(p, "商品", "金额", y);
    y += 18;
    p.fill(38, 32, 24);

    p.textSize(14);
    for (const [name, price] of poem.lines) {
      const nameLines = wrapText(p, name, 240);
      const top = y;
      for (const ln of nameLines) {
        p.textAlign(p.LEFT, p.TOP);
        p.text(ln, 28, y);
        y += 22;
      }
      p.textAlign(p.RIGHT, p.TOP);
      p.text(price, W - 28, top);
      y += 6;
    }

    y += 6;
    dash(p, y);
    y += 18;

    p.textFont("Noto Sans SC");
    p.textSize(13);
    pair(p, "输入金额", "¥ " + amount, y);
    y += 22;
    p.textSize(16);
    pair(p, "合计", String(poem.total), y);
    y += 30;

    p.textAlign(p.CENTER, p.TOP);
    p.textFont("Zhi Mang Xing");
    p.textSize(22);
    const foot = wrapText(p, poem.footer, 300);
    for (const ln of foot) {
      p.text(ln, W / 2, y);
      y += 28;
    }

    y += 10;
    // barcode from txn + title
    const seed = hash(txn + poem.title + amount);
    drawBarcode(p, 40, y, W - 80, 52, seed);
    y += 62;
    p.textFont("Share Tech Mono");
    p.textSize(11);
    p.fill(38, 32, 24);
    p.text(txn.replace(/-/g, " "), W / 2, y);
    y += 28;

    p.textFont("Noto Sans SC");
    p.textSize(10);
    p.fill(70, 60, 46);
    p.text("热敏字约九十日后淡去", W / 2, y);
    y += 16;
    p.text("谢谢惠顾 · 小票即诗 · 不开发票", W / 2, y);
    y += 36;

    if (meta.voided) {
      p.push();
      p.translate(W / 2, 280);
      p.rotate(-0.32);
      p.noFill();
      p.stroke(176, 48, 32);
      p.strokeWeight(6);
      p.rect(-92, -28, 184, 64);
      p.noStroke();
      p.fill(176, 48, 32);
      p.textFont("ZCOOL QingKe HuangYou");
      p.textSize(36);
      p.text("作  废", 0, -10);
      p.pop();
    }

    return Math.min(H, y + 20);
  }

  function pair(p, left, right, y) {
    p.textAlign(p.LEFT, p.TOP);
    p.text(left, 28, y);
    p.textAlign(p.RIGHT, p.TOP);
    p.text(right, W - 28, y);
  }

  function dash(p, y) {
    p.stroke(38, 32, 24);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([3, 4]);
    p.line(28, y, W - 28, y);
    p.drawingContext.setLineDash([]);
    p.noStroke();
  }

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function drawBarcode(p, x, y, w, h, seed) {
    p.noStroke();
    p.fill(38, 32, 24);
    let rng = seed || 1;
    const next = () => {
      rng = (rng * 1664525 + 1013904223) >>> 0;
      return rng / 4294967296;
    };
    let cx = x;
    while (cx < x + w) {
      const bar = 1 + Math.floor(next() * 3);
      const gap = 1 + Math.floor(next() * 2);
      if (next() > 0.35) p.rect(cx, y, bar, h);
      cx += bar + gap;
    }
  }

  function create() {
    return new Promise((resolve) => {
      sketch = new p5((p) => {
        p.setup = () => {
          const c = p.createCanvas(W, H);
          c.parent("receipt-host");
          p.pixelDensity(1);
          p.noLoop();
          ready = true;
          resolve(p);
        };
      });
    });
  }

  return {
    width: W,
    height: H,
    async init() {
      if (!ready) await create();
      return sketch;
    },
    get canvas() {
      return sketch ? sketch.canvas : null;
    },
    render(meta) {
      if (!sketch) return 700;
      const used = compose(sketch, meta);
      job = { meta, used, head: used };
      return used;
    },
    reveal(head) {
      if (!job) return;
      job.head = head;
    },
    lastUsed() {
      return job ? job.used : 700;
    },
  };
})();
