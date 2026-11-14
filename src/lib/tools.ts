export type Tool = {
  href: string;
  icon: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  /** Tailwind 漸層色，用於圖示底色與卡片光暈 */
  gradient: string;
  /** 卡片 hover 光暈顏色 */
  glow: string;
};

export const TOOLS: Tool[] = [
  {
    href: "/lottery",
    icon: "🎡",
    name: "抽獎轉盤",
    tagline: "公平、刺激、一鍵開獎",
    description: "貼上名單，轉盤幫你決定誰是幸運兒。尾牙、團購、午餐吃什麼都適用。",
    features: ["一行一個名字，貼上就能用", "抽中可自動移出名單", "保留每一次的抽獎紀錄"],
    gradient: "from-indigo-500 to-fuchsia-500",
    glow: "group-hover:shadow-fuchsia-500/20",
  },
  {
    href: "/pomodoro",
    icon: "🍅",
    name: "蕃茄鐘",
    tagline: "25 分鐘，只做一件事",
    description: "專注與休息交替進行，用節奏對抗分心，讓工作效率穩穩提升。",
    features: ["專注／短休息／長休息自動輪替", "時間到響鈴＋桌面通知", "記錄每個完成的蕃茄"],
    gradient: "from-rose-500 to-orange-400",
    glow: "group-hover:shadow-rose-500/20",
  },
  {
    href: "/fortune",
    icon: "🎋",
    name: "好運抽籤",
    tagline: "今天，適合做什麼？",
    description: "搖一搖籤筒，從大吉到大凶，看看今天的工作、財運、感情與健康。",
    features: ["七種籤等，機率各不相同", "四大面向運勢與星等", "幸運色與幸運數字"],
    gradient: "from-emerald-500 to-teal-400",
    glow: "group-hover:shadow-emerald-500/20",
  },
];
