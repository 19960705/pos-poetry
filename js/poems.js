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
  },

  fallbackOrder: ["night", "rain", "member", "last", "change", "smoke"],
};

window.pickPoem = function pickPoem(amountText) {
  const map = window.POS_POEMS.special;
  const key = map[amountText];
  if (key && window.POS_POEMS.catalog[key]) {
    return { id: key, poem: window.POS_POEMS.catalog[key], special: true };
  }
  const order = window.POS_POEMS.fallbackOrder;
  const n = window.__poemCursor || 0;
  window.__poemCursor = (n + 1) % order.length;
  const id = order[n];
  return { id, poem: window.POS_POEMS.catalog[id], special: false };
};
