"use client";

import { useMemo, useRef, useState } from "react";
import { usePersistentState } from "@/lib/use-persistent-state";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const SPIN_MS = 5000;
const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 4;

function parseNames(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 角度以正上方為 0，順時針增加 */
function point(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return [CENTER + r * Math.sin(rad), CENTER - r * Math.cos(rad)] as const;
}

function segmentPath(start: number, end: number) {
  const [x1, y1] = point(start, RADIUS);
  const [x2, y2] = point(end, RADIUS);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function segmentColor(i: number, n: number) {
  // 避免最後一格跟第一格同色
  if (n > 1 && i === n - 1 && i % COLORS.length === 0) {
    return COLORS[Math.floor(COLORS.length / 2)];
  }
  return COLORS[i % COLORS.length];
}

function truncate(name: string, max: number) {
  return name.length > max ? name.slice(0, max) + "…" : name;
}

function randomInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

export default function LotteryWheel() {
  const [text, setText] = usePersistentState("lottery:names", "");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = usePersistentState<string[]>(
    "lottery:history",
    [],
  );
  const [removeWinner, setRemoveWinner] = usePersistentState(
    "lottery:removeWinner",
    false,
  );
  const pendingWinner = useRef<string | null>(null);

  const names = useMemo(() => parseNames(text), [text]);
  const n = names.length;
  const seg = n > 0 ? 360 / n : 360;
  const fontSize = n <= 6 ? 20 : n <= 12 ? 16 : n <= 24 ? 12 : 9;
  const maxChars = n <= 12 ? 10 : 8;

  function spin() {
    if (spinning || n < 2) return;
    const index = randomInt(n);
    // 停在該格中間附近（留一點邊界，避免看起來壓線）
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const target = index * seg + seg / 2 + jitter;
    const current = ((rotation % 360) + 360) % 360;
    const delta = (((-target - current) % 360) + 360) % 360;
    const extraTurns = 6 + randomInt(3);

    pendingWinner.current = names[index];
    setWinner(null);
    setSpinning(true);
    setRotation(rotation + extraTurns * 360 + delta);
  }

  function handleSpinEnd() {
    if (!spinning) return;
    const name = pendingWinner.current;
    setSpinning(false);
    if (!name) return;
    setWinner(name);
    setHistory((h) => [name, ...h]);
    if (removeWinner) {
      const lines = text.split("\n");
      const idx = lines.findIndex((l) => l.trim() === name);
      if (idx !== -1) {
        lines.splice(idx, 1);
        setText(lines.join("\n"));
      }
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_auto]">
      {/* 名單輸入 */}
      <section className="flex flex-col gap-3">
        <label htmlFor="names" className="font-semibold">
          抽獎名單（一行一個）
          <span className="ml-2 text-sm font-normal text-zinc-500">
            共 {n} 人
          </span>
        </label>
        <textarea
          id="names"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={spinning}
          rows={14}
          placeholder={"王小明\n李小華\n陳大文"}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-transparent p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 dark:border-zinc-700"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={removeWinner}
            onChange={(e) => setRemoveWinner(e.target.checked)}
            className="size-4"
          />
          抽中後從名單移除
        </label>

        {history.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">抽獎紀錄</h2>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                清除
              </button>
            </div>
            <ol className="space-y-1 text-sm">
              {history.map((name, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-8 text-right text-zinc-500">
                    #{history.length - i}
                  </span>
                  <span>{name}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* 轉盤 */}
      <section className="flex flex-col items-center gap-6">
        <div className="relative w-full max-w-[400px]">
          {/* 指針 */}
          <div
            aria-hidden
            className="absolute left-1/2 -top-3 z-10 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[28px] border-x-transparent border-t-zinc-800 drop-shadow dark:border-t-zinc-100"
          />
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-auto w-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 1)`
                : "none",
            }}
            onTransitionEnd={handleSpinEnd}
          >
            {n === 0 && (
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                className="fill-zinc-200 dark:fill-zinc-800"
              />
            )}
            {n === 1 && (
              <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={COLORS[0]} />
            )}
            {n > 1 &&
              names.map((_, i) => (
                <path
                  key={i}
                  d={segmentPath(i * seg, (i + 1) * seg)}
                  fill={segmentColor(i, n)}
                  stroke="white"
                  strokeWidth={n > 40 ? 0.5 : 2}
                />
              ))}
            {names.map((name, i) => {
              const mid = n === 1 ? 0 : i * seg + seg / 2;
              const tx = CENTER;
              const ty = CENTER - RADIUS * 0.9;
              return (
                <g key={i} transform={`rotate(${mid} ${CENTER} ${CENTER})`}>
                  <text
                    x={tx}
                    y={ty}
                    transform={n > 1 ? `rotate(-90 ${tx} ${ty})` : undefined}
                    textAnchor={n > 1 ? "end" : "middle"}
                    dominantBaseline={n > 1 ? "middle" : "hanging"}
                    fill="white"
                    fontSize={fontSize}
                    fontWeight={600}
                    style={{ paintOrder: "stroke" }}
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth={2}
                  >
                    {truncate(name, maxChars)}
                  </text>
                </g>
              );
            })}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={18}
              fill="white"
              stroke="#27272a"
              strokeWidth={3}
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning || n < 2}
          className="rounded-full bg-blue-600 px-10 py-3 text-lg font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {spinning ? "抽獎中…" : "開始抽獎"}
        </button>
        {n < 2 && !spinning && (
          <p className="text-sm text-zinc-500">請至少輸入 2 個名字</p>
        )}

        <div className="flex min-h-16 items-center" aria-live="polite">
          {winner && (
            <p className="text-center text-2xl">
              🎉 恭喜 <span className="font-bold text-blue-600">{winner}</span>{" "}
              中獎！
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
