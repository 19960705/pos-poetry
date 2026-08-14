/* 夜班诗铺 · 机打诗库存
   每首诗都按小票明细写，不当成“文学排版”。 */

window.POS_POEMS = {
  store: {
    name: "夜班诗铺",
    sub: "24H · 热敏纸专印未出口的话",
    merchant: "POET-0217",
    cashier: "机",
    address: "柜台内侧 · 感应区以下",
  },

  special: {
    "0.01": "fen",
    "0.00": "empty",
    "4.00": "si",
    "6.66": "shunlu",
    "8.88": "fa",
    "12.00": "midnight",
    "13.14": "yisheng",
    "18.80": "yaofa",
    "20.25": "year",
    "20.26": "nextyear",
    "52.00": "wulai",
    "99.99": "almost",
  },

  catalog: {
    night: {
      sku: "夜班001",
      title: "未命名顾客",
      lines: [
        ["一瓶常温水", "3.50"],
        ["一整晚没说的话", "0.00"],
        ["塑料袋", "0.10"],
        ["门口那阵风", "—"],
      ],
      total: "你还是走了",
      footer: "找零：一声很轻的门响",
    },
    fen: {
      sku: "尊严001",
      title: "一分钱",
      lines: [
        ["被找回的自尊", "0.01"],
        ["收银员低头的那一下", "赠"],
        ["硬币在托盘里转了两圈", "—"],
      ],
      total: "0.01",
      footer: "最小面额，也是一次认真的结束",
    },
    empty: {
      sku: "空单000",
      title: "零元购",
      lines: [
        ["什么都没买", "0.00"],
        ["在门口站了很久", "0.00"],
        ["空调出风口的冷", "赠"],
      ],
      total: "0.00",
      footer: "本机允许空车离开",
    },
    si: {
      sku: "避讳004",
      title: "四块",
      lines: [
        ["店里不爱报这个数", "4.00"],
        ["你还是报了", "—"],
        ["荧光灯闪了一下", "赠"],
      ],
      total: "4.00",
      footer: "数字只是数字。人比数字胆小。",
    },
    shunlu: {
      sku: "顺路666",
      title: "顺路",
      lines: [
        ["你说你只是顺路", "6.66"],
        ["冰柜灯把你照得很亮", "—"],
        ["我把找零放得很慢", "赠"],
      ],
      total: "6.66",
      footer: "顺路的人，很少看收银员的眼睛",
    },
    fa: {
      sku: "发财888",
      title: "发",
      lines: [
        ["大家图这个数吉利", "8.88"],
        ["热敏头却只负责发热", "—"],
        ["纸卷越来越短", "损耗"],
      ],
      total: "8.88",
      footer: "机器不会发财。它只会出纸。",
    },
    midnight: {
      sku: "午夜120",
      title: "十二点整",
      lines: [
        ["日期跳了一格", "12.00"],
        ["你还站在昨天", "—"],
        ["我已经打印今天", "赠"],
      ],
      total: "12.00",
      footer: "跨过零点的人，小票上会多一条杠",
    },
    yisheng: {
      sku: "终身1314",
      title: "一生一世",
      lines: [
        ["输入框里的情话", "13.14"],
        ["打印出来只是数字", "—"],
        ["热敏字会在三个月后变淡", "损耗"],
      ],
      total: "13.14",
      footer: "请尽快拍照。纸比誓言先忘。",
    },
    yaofa: {
      sku: "要发188",
      title: "要发",
      lines: [
        ["尾数很吉祥", "18.80"],
        ["袋子里是泡面和电池", "—"],
        ["夜班没有红包", "0.00"],
      ],
      total: "18.80",
      footer: "祝你要发。先把泡面泡了。",
    },
    year: {
      sku: "本年2025",
      title: "这一年",
      lines: [
        ["过期的会员积分", "20.25"],
        ["没兑完的夜", "清零"],
        ["新的一页还没切齐", "—"],
      ],
      total: "20.25",
      footer: "积分无法转结到下辈子",
    },
    nextyear: {
      sku: "明年2026",
      title: "明年",
      lines: [
        ["你提前把明年买走了", "20.26"],
        ["货架上还是今年的面包", "临期"],
        ["我按了确认", "赠"],
      ],
      total: "20.26",
      footer: "预售不退。请亲自来取。",
    },
    wulai: {
      sku: "我爱520",
      title: "我爱",
      lines: [
        ["这三个字被输入过太多次", "52.00"],
        ["键帽上的字已经磨白", "损耗"],
        ["机器仍会如实打印", "—"],
      ],
      total: "52.00",
      footer: "本机不审核真伪，只负责出纸",
    },
    almost: {
      sku: "将满999",
      title: "差一分满",
      lines: [
        ["差一分就整数了", "99.99"],
        ["你犹豫要不要再拿一颗糖", "—"],
        ["我等着", "赠"],
      ],
      total: "99.99",
      footer: "满的人很少回来。差一分的人会再来。",
    },
    rain: {
      sku: "雨夜014",
      title: "淋湿的卡",
      lines: [
        ["磁条有水", "重刷"],
        ["你袖口也是湿的", "—"],
        ["我把纸递出柜面", "赠"],
      ],
      total: "请收好",
      footer: "小票怕潮。人更怕。",
    },
    member: {
      sku: "会员000",
      title: "未注册",
      lines: [
        ["要办会员吗", "摇头"],
        ["积分可以换一包纸巾", "—"],
        ["你说不用了", "0.00"],
      ],
      total: "散客",
      footer: "散客也给小票。这是店规。",
    },
    last: {
      sku: "打烊2359",
      title: "最后一单",
      lines: [
        ["灯管开始发出细响", "损耗"],
        ["卷纸还剩半指宽", "预警"],
        ["你买走了店里最后一瓶牛奶", "售罄"],
      ],
      total: "已打烊",
      footer: "门开着。机还热着。",
    },
    change: {
      sku: "找零207",
      title: "零钱盘",
      lines: [
        ["一块，一块，五角", "点钞"],
        ["你的手指碰了一下我的托盘", "—"],
        ["凉的", "赠"],
      ],
      total: "两块七",
      footer: "找零是今晚唯一的身体接触",
    },
    smoke: {
      sku: "柜面009",
      title: "柜面以下",
      lines: [
        ["你只看见我的手", "—"],
        ["键帽、扫码器、一盘硬币", "标配"],
        ["脸在荧光灯下面", "未扫描"],
      ],
      total: "未识别顾客",
      footer: "本机工作范围：感应区到撕纸齿",
    },
    voided: {
      sku: "作废XXX",
      title: "此单作废",
      lines: [
        ["按错了", "VOID"],
        ["字还是印出来了", "—"],
        ["作废章盖不住热敏的黑", "损耗"],
      ],
      total: "作废",
      footer: "作废的话也会留在纸上",
    },
    late: {
      sku: "后夜030",
      title: "后半夜",
      lines: [
        ["货架自己发光", "—"],
        ["没有人值得叫醒", "0.00"],
        ["冰柜还在数自己的秒", "损耗"],
      ],
      total: "未打烊",
      footer: "这个点来的人，多半不是来买东西",
    },
    handover: {
      sku: "交班054",
      title: "交班",
      lines: [
        ["钥匙还热着", "赠"],
        ["早班会以为这些票是机器自己出的", "—"],
        ["你不是来买东西", "确认"],
      ],
      total: "待交接",
      footer: "把抽屉关严。字会自己淡。",
    },
    query: {
      sku: "查询条码",
      title: "此单已查询",
      lines: [
        ["条码被读过一次", "OK"],
        ["诗还是原来那首", "—"],
        ["纸却已经不是那张", "损耗"],
      ],
      total: "副本",
      footer: "查询不收费。遗忘也不收费。",
    },
  },

  shifts: {
    night: {
      label: "夜班中",
      greet: "请将心灵靠近感应区",
      sub: "24H · 热敏纸专印未出口的话",
      fallback: ["night", "rain", "change", "smoke"],
    },
    late: {
      label: "后半夜",
      greet: "这个点，机比人清醒",
      sub: "02-05 · 纸更短，话更少",
      fallback: ["late", "empty", "smoke", "rain"],
    },
    dawn: {
      label: "交班在即",
      greet: "早班钥匙已经在路上",
      sub: "05-08 · 最后几寸纸",
      fallback: ["handover", "last", "year", "member"],
    },
    day: {
      label: "白班假装忙碌",
      greet: "日光让数字显得诚实",
      sub: "日间也出诗，只是没人信",
      fallback: ["member", "fa", "yaofa", "night"],
    },
    dusk: {
      label: "晚高峰",
      greet: "袋子比话多",
      sub: "17-22 · 顺路的人最多",
      fallback: ["shunlu", "change", "rain", "night"],
    },
  },
};

window.getShiftName = function getShiftName(date) {
  const h = (date || new Date()).getHours();
  if (h >= 22 || h < 2) return "night";
  if (h < 5) return "late";
  if (h < 8) return "dawn";
  if (h < 17) return "day";
  return "dusk";
};

window.pickPoem = function pickPoem(amountText, shiftName) {
  const map = window.POS_POEMS.special;
  const key = map[amountText];
  if (key && window.POS_POEMS.catalog[key]) {
    return { id: key, poem: window.POS_POEMS.catalog[key], special: true };
  }
  const shift = window.POS_POEMS.shifts[shiftName] || window.POS_POEMS.shifts.night;
  const order = shift.fallback;
  const n = window.__poemCursor || 0;
  window.__poemCursor = (n + 1) % order.length;
  const id = order[n];
  return { id, poem: window.POS_POEMS.catalog[id], special: false };
};

window.rewriteReceipt = function rewriteReceipt(raw) {
  const rows = String(raw || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, 16);
  const items = [];
  let total = "";
  for (const ln of rows) {
    const m = ln.match(/^(.+?)\s+[¥￥$]?\s*(-?\d+\.\d{1,2}|\d+)$/);
    if (m) {
      const name = m[1].replace(/^[0-9]+[\.、.\s]+/, "").replace(/\s{2,}/g, " ").slice(0, 18);
      if (/合计|总额|应付|实付|总计|total|amount/i.test(name)) {
        total = m[2];
        continue;
      }
      if (/电话|地址|欢迎|谢谢|商户|单号/.test(name)) continue;
      items.push([name || "未命名商品", m[2]]);
    } else if (ln.length < 22 && !/小票|欢迎光临|电话|地址|谢谢惠顾|扫码/.test(ln)) {
      items.push([ln.slice(0, 18), "—"]);
    }
  }
  if (!items.length) {
    items.push([rows[0] ? rows[0].slice(0, 18) : "无法识别的字", "—"]);
    items.push(["机把它当成一句话收下了", "赠"]);
  }
  if (items.length > 5) items.length = 5;
  items.push(["没印出来的那一行", "赠"]);
  const title = (items[0][0] || "外来单据").slice(0, 8);
  return {
    id: "intake",
    special: true,
    custom: true,
    poem: {
      sku: "投入" + String(Date.now()).slice(-4),
      title: title,
      lines: items,
      total: total || "已改写",
      footer: "外来单据已改写。原件不必退回。",
    },
  };
};

window.encodeSlip = function encodeSlip(meta) {
  if (meta.id && window.POS_POEMS.catalog[meta.id] && !meta.custom) {
    return "p=" + encodeURIComponent(meta.id) + "&a=" + encodeURIComponent(meta.amount || "0.00");
  }
  const payload = {
    i: meta.id || "intake",
    a: meta.amount || "0.00",
    t: meta.poem.title,
    s: meta.poem.sku,
    f: meta.poem.footer,
    tot: meta.poem.total,
    l: meta.poem.lines,
  };
  const bin = unescape(encodeURIComponent(JSON.stringify(payload)));
  return "r=" + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

window.decodeSlip = function decodeSlip(search) {
  const q = new URLSearchParams(search || location.search);
  const pid = q.get("p");
  const amount = q.get("a") || "0.00";
  if (pid && window.POS_POEMS.catalog[pid]) {
    return {
      id: pid,
      poem: window.POS_POEMS.catalog[pid],
      amount,
      special: true,
      fromLink: true,
    };
  }
  const r = q.get("r");
  if (!r) return null;
  try {
    let b64 = r.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const payload = JSON.parse(decodeURIComponent(escape(atob(b64))));
    return {
      id: payload.i || "intake",
      custom: true,
      special: true,
      fromLink: true,
      amount: payload.a || amount,
      poem: {
        title: payload.t,
        sku: payload.s,
        footer: payload.f,
        total: payload.tot,
        lines: payload.l || [],
      },
    };
  } catch (err) {
    return null;
  }
};
