export type Tone = "good" | "neutral" | "bad";

export type Level = {
  name: string;
  /** 抽中的相對權重 */
  weight: number;
  tone: Tone;
  /** 1–5 顆星 */
  stars: number;
  messages: string[];
};

export const LEVELS: Level[] = [
  {
    name: "大吉",
    weight: 10,
    tone: "good",
    stars: 5,
    messages: [
      "萬事亨通，心想事成。今天就是你大展身手的日子！",
      "貴人相助，順風順水。勇敢去做想了很久的事吧。",
      "福星高照，好運連連。記得把好心情分享給身邊的人。",
    ],
  },
  {
    name: "中吉",
    weight: 15,
    tone: "good",
    stars: 4,
    messages: [
      "運勢穩健上升，努力會被看見。",
      "今天適合推進重要的事，成果會比預期好。",
      "好事正在醞釀，保持耐心，順勢而為。",
    ],
  },
  {
    name: "小吉",
    weight: 20,
    tone: "good",
    stars: 4,
    messages: [
      "小小的幸運藏在日常裡，留意身邊的驚喜。",
      "踏實做好手邊的事，就會有不錯的收穫。",
      "今天會有讓人會心一笑的小事發生。",
    ],
  },
  {
    name: "吉",
    weight: 20,
    tone: "neutral",
    stars: 3,
    messages: [
      "平穩順利的一天，按部就班就好。",
      "沒有大起大落，適合整理思緒、規劃下一步。",
      "保持平常心，今天會平平安安。",
    ],
  },
  {
    name: "末吉",
    weight: 15,
    tone: "neutral",
    stars: 2,
    messages: [
      "開頭或許不太順，但越晚越好，別太早放棄。",
      "好運姍姍來遲，先把基礎打穩。",
      "小心細節，慢一點反而比較快。",
    ],
  },
  {
    name: "凶",
    weight: 12,
    tone: "bad",
    stars: 2,
    messages: [
      "今天容易有小阻礙，凡事多確認一次。",
      "說話前先想三秒，可以避開不必要的誤會。",
      "不宜衝動做決定，重要的事可以緩一緩。",
    ],
  },
  {
    name: "大凶",
    weight: 8,
    tone: "bad",
    stars: 1,
    messages: [
      "諸事不順也別灰心，否極泰來，低谷之後就是上坡。",
      "今天低調行事、照顧好自己最重要。",
      "把大凶當成提醒：放慢腳步，明天會更好。",
    ],
  },
];

export const ASPECTS = ["工作", "財運", "感情", "健康"] as const;

const ASPECT_TEXT: Record<(typeof ASPECTS)[number], Record<Tone, string[]>> = {
  工作: {
    good: ["表現亮眼，提案容易通過", "效率超高，待辦清單一路清空", "有機會得到主管或客戶讚賞"],
    neutral: ["穩定推進，按計畫走就好", "適合處理例行事務", "多跟同事溝通會更順利"],
    bad: ["容易出小錯，送出前再檢查一次", "會議可能卡關，先準備好備案", "別一次接太多工作"],
  },
  財運: {
    good: ["有意外之財的機會", "適合規劃投資理財", "買東西容易遇到好價格"],
    neutral: ["收支平穩，量入為出", "可以順手整理一下帳目", "小額消費無妨，大額再想想"],
    bad: ["容易衝動購物，先放購物車冷靜一下", "不宜借錢給別人", "注意帳單與扣款日期"],
  },
  感情: {
    good: ["桃花朵朵開，人緣特別好", "和重要的人關係升溫", "適合表達心意"],
    neutral: ["平淡但溫暖，簡單的陪伴就很好", "多聽少說，對方會感受到", "可以約朋友吃個飯"],
    bad: ["容易因小事起摩擦，多點包容", "說話語氣放軟一點", "給彼此一些空間"],
  },
  健康: {
    good: ["精神飽滿，適合運動", "身體狀態很好，元氣滿滿", "睡眠品質佳"],
    neutral: ["記得多喝水、起來走動", "適度休息，別久坐", "飲食清淡一點會更舒服"],
    bad: ["容易疲累，今晚早點睡", "注意保暖與腸胃", "別硬撐，累了就休息"],
  },
};

export const LUCKY_COLORS = [
  { name: "朱紅", hex: "#dc2626" },
  { name: "橘黃", hex: "#f59e0b" },
  { name: "金色", hex: "#ca8a04" },
  { name: "翠綠", hex: "#16a34a" },
  { name: "天藍", hex: "#0ea5e9" },
  { name: "靛青", hex: "#4f46e5" },
  { name: "紫羅蘭", hex: "#9333ea" },
  { name: "櫻花粉", hex: "#ec4899" },
  { name: "米白", hex: "#e7e5e4" },
  { name: "墨黑", hex: "#27272a" },
];

export type Fortune = {
  date: string;
  number: number;
  level: string;
  message: string;
  aspects: { name: string; text: string; stars: number }[];
  luckyColor: { name: string; hex: string };
  luckyNumber: number;
};

function randomInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function pick<T>(arr: readonly T[]) {
  return arr[randomInt(arr.length)];
}

function pickLevel() {
  const total = LEVELS.reduce((sum, l) => sum + l.weight, 0);
  let r = randomInt(total);
  for (const level of LEVELS) {
    if (r < level.weight) return level;
    r -= level.weight;
  }
  return LEVELS[LEVELS.length - 1];
}

/** 各項運勢圍繞總運勢上下浮動，偶爾會有落差 */
function aspectStars(base: number) {
  const delta = randomInt(3) - 1; // -1, 0, +1
  return Math.min(5, Math.max(1, base + delta));
}

function toneOf(stars: number): Tone {
  return stars >= 4 ? "good" : stars >= 3 ? "neutral" : "bad";
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function drawFortune(): Fortune {
  const level = pickLevel();
  return {
    date: todayKey(),
    number: randomInt(100) + 1,
    level: level.name,
    message: pick(level.messages),
    aspects: ASPECTS.map((name) => {
      const stars = aspectStars(level.stars);
      return { name, stars, text: pick(ASPECT_TEXT[name][toneOf(stars)]) };
    }),
    luckyColor: pick(LUCKY_COLORS),
    luckyNumber: randomInt(99) + 1,
  };
}

export function levelInfo(name: string) {
  return LEVELS.find((l) => l.name === name) ?? LEVELS[3];
}
