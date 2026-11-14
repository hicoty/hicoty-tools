"use client";

import { useEffect, useState } from "react";
import { usePersistentState } from "@/lib/use-persistent-state";
import { drawFortune, levelInfo, todayKey, type Fortune } from "./fortunes";

const SHAKE_MS = 1600;
const STICK_MS = 600;

type Phase = "idle" | "shaking" | "stick";

const TONE_STYLE = {
  good: "text-red-600 dark:text-red-400",
  neutral: "text-amber-600 dark:text-amber-400",
  bad: "text-zinc-700 dark:text-zinc-300",
};

function Stars({ count }: { count: number }) {
  return (
    <span aria-label={`${count} 顆星`} className="tracking-tight">
      <span className="text-amber-500">{"★".repeat(count)}</span>
      <span className="text-zinc-300 dark:text-zinc-700">
        {"★".repeat(5 - count)}
      </span>
    </span>
  );
}

export default function FortuneDraw() {
  const [fortune, setFortune] = usePersistentState<Fortune | null>(
    "fortune:today",
    null,
  );
  const [phase, setPhase] = useState<Phase>("idle");

  // 存的是昨天（或更早）的籤就清掉，讓今天重新抽
  useEffect(() => {
    if (fortune && fortune.date !== todayKey()) {
      setFortune(null);
    }
  }, [fortune, setFortune]);

  function draw() {
    if (phase !== "idle") return;
    setFortune(null);
    setPhase("shaking");
    setTimeout(() => setPhase("stick"), SHAKE_MS);
    setTimeout(() => {
      setFortune(drawFortune());
      setPhase("idle");
    }, SHAKE_MS + STICK_MS + 200);
  }

  const busy = phase !== "idle";
  const level = fortune ? levelInfo(fortune.level) : null;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 籤筒 */}
      {!fortune && (
        <div className="flex flex-col items-center gap-6 pt-16">
          <div
            className={`relative ${phase === "shaking" ? "animate-shake" : ""}`}
            style={{ transformOrigin: "50% 100%" }}
          >
            {/* 跳出來的那支籤 */}
            <div
              className={`absolute left-1/2 top-2 h-28 w-3 -translate-x-1/2 rounded-t-sm bg-amber-200 shadow ${
                phase === "stick" ? "animate-stick-out" : "opacity-0"
              }`}
            >
              <div className="h-4 rounded-t-sm bg-red-600" />
            </div>
            {/* 筒裡的籤 */}
            <div className="absolute -top-10 left-1/2 flex -translate-x-1/2 gap-1">
              {[-12, -5, 2, 9, 15].map((r, i) => (
                <div
                  key={i}
                  className="h-24 w-2.5 rounded-t-sm bg-amber-200"
                  style={{ transform: `rotate(${r}deg)`, transformOrigin: "bottom" }}
                >
                  <div className="h-3 rounded-t-sm bg-red-600" />
                </div>
              ))}
            </div>
            {/* 筒身 */}
            <div className="relative flex h-44 w-32 items-center justify-center rounded-b-2xl rounded-t-md border-4 border-red-900 bg-gradient-to-b from-red-700 to-red-800 shadow-lg">
              <span className="text-4xl font-bold text-amber-300 [writing-mode:vertical-rl]">
                籤
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={draw}
            disabled={busy}
            className="rounded-full bg-red-600 px-10 py-3 text-lg font-bold text-white shadow transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
          >
            {phase === "shaking"
              ? "誠心搖籤中…"
              : phase === "stick"
                ? "籤出來了！"
                : "抽今日運勢"}
          </button>
          <p className="text-sm text-zinc-500">心中默想今天想問的事，再按下抽籤</p>
        </div>
      )}

      {/* 籤詩結果 */}
      {fortune && level && (
        <div className="flex w-full flex-col items-center gap-6 animate-reveal">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-red-800/30 bg-amber-50 shadow-lg dark:border-red-400/30 dark:bg-zinc-900">
            <div className="flex items-center justify-between bg-red-700 px-5 py-2 text-sm text-amber-100">
              <span>第 {fortune.number} 籤</span>
              <span>{fortune.date}</span>
            </div>

            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <span
                className={`text-7xl font-black tracking-widest ${TONE_STYLE[level.tone]}`}
              >
                {fortune.level}
              </span>
              <Stars count={level.stars} />
              <p className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">
                {fortune.message}
              </p>
            </div>

            <dl className="grid grid-cols-1 gap-px bg-red-800/10 dark:bg-zinc-800 sm:grid-cols-2">
              {fortune.aspects.map((a) => (
                <div key={a.name} className="bg-amber-50 px-5 py-3 dark:bg-zinc-900">
                  <dt className="flex items-center justify-between text-sm font-semibold">
                    {a.name}
                    <Stars count={a.stars} />
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {a.text}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex justify-around px-5 py-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">幸運色</span>
                <span
                  className="inline-block size-4 rounded-full border border-zinc-300 dark:border-zinc-600"
                  style={{ backgroundColor: fortune.luckyColor.hex }}
                />
                <span className="font-semibold">{fortune.luckyColor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">幸運數字</span>
                <span className="font-semibold">{fortune.luckyNumber}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-500">
            今天的籤已經保存，重新整理也會留著，明天就能再抽新的一支。
          </p>
          <button
            type="button"
            onClick={draw}
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            不滿意？再抽一次
          </button>
        </div>
      )}
    </div>
  );
}
