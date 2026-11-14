import Link from "next/link";
import { TOOLS } from "@/lib/tools";

const HIGHLIGHTS = [
  {
    icon: "⚡",
    title: "打開就能用",
    text: "不用註冊、不用下載，點進去馬上開始。",
  },
  {
    icon: "🔒",
    title: "資料留在你身邊",
    text: "名單、紀錄只存在你的瀏覽器，不會上傳到任何地方。",
  },
  {
    icon: "🌗",
    title: "淺色深色都好看",
    text: "自動跟隨系統主題，手機和電腦都順手。",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* 背景光暈與格線 */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/40 via-fuchsia-400/30 to-orange-300/40 blur-3xl dark:from-violet-600/25 dark:via-fuchsia-600/20 dark:to-orange-500/20" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(128_128_128/0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgb(128_128_128/0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-1.5 text-sm text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <span className="size-2 rounded-full bg-emerald-500" />
            {TOOLS.length} 個小工具・免費使用
          </span>

          <h1 className="mx-auto mt-8 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl sm:leading-tight">
            讓日常小事，
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">
              變得有趣一點
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            抽獎、專注、看運勢——把那些不想多花心思的小事，交給 Jeremy Tools。
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="#tools"
              className="rounded-full bg-zinc-900 px-7 py-3 font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              探索工具 ↓
            </a>
            <Link
              href="/fortune"
              className="rounded-full border border-zinc-300 bg-white/60 px-7 py-3 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-zinc-500"
            >
              🎋 抽今日運勢
            </Link>
          </div>

          {/* 漂浮的工具圖示 */}
          <div aria-hidden className="mt-16 flex justify-center gap-5 sm:gap-8">
            {TOOLS.map((tool, i) => (
              <div
                key={tool.href}
                className={`flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-3xl shadow-xl sm:size-20 sm:text-4xl ${
                  ["rotate-[-6deg]", "-translate-y-4", "rotate-[6deg]"][i % 3]
                }`}
              >
                {tool.icon}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 工具介紹 */}
      <section id="tools" className="scroll-mt-20 border-t border-zinc-200 bg-zinc-50/60 py-24 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-widest text-fuchsia-500">
              TOOLS
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              挑一個，現在就開始
            </h2>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${tool.glow} dark:border-zinc-800 dark:bg-zinc-900`}
                >
                  <div
                    aria-hidden
                    className={`absolute -top-16 -right-16 size-40 rounded-full bg-gradient-to-br ${tool.gradient} opacity-10 blur-2xl transition group-hover:opacity-30`}
                  />
                  <span
                    className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-3xl shadow-lg`}
                    aria-hidden
                  >
                    {tool.icon}
                  </span>
                  <h3 className="mt-6 text-xl font-bold">{tool.name}</h3>
                  <p
                    className={`mt-1 bg-gradient-to-r ${tool.gradient} bg-clip-text text-sm font-semibold text-transparent`}
                  >
                    {tool.tagline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {tool.description}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {tool.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="text-emerald-500">✓</span>
                        <span className="text-zinc-700 dark:text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-8 text-sm font-semibold">
                    立即使用{" "}
                    <span className="inline-block transition group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 特色 */}
      <section className="py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="text-center sm:text-left">
              <span className="text-3xl" aria-hidden>
                {h.icon}
              </span>
              <h3 className="mt-4 font-bold">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {h.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
