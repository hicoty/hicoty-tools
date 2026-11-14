import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 font-black text-white">
              J
            </span>
            <span className="font-bold">Jeremy Tools</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
            讓日常小事變得更簡單、更有趣的小工具箱。免註冊、免安裝，打開就能用。
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">工具</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-500">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="transition hover:text-zinc-900 dark:hover:text-white"
                >
                  {tool.icon} {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">關於</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-500">
            <li>資料只存在你的瀏覽器</li>
            <li>支援深色模式</li>
            <li>手機、電腦都能用</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-zinc-500">
          © 2026 Jeremy Tools. Made with ☕ and Next.js.
        </p>
      </div>
    </footer>
  );
}
