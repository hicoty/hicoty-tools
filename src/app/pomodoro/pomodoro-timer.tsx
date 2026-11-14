"use client";

import { useEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/use-persistent-state";

type Mode = "work" | "short" | "long";

const MODE_LABEL: Record<Mode, string> = {
  work: "專注",
  short: "短休息",
  long: "長休息",
};

const MODE_COLOR: Record<Mode, string> = {
  work: "#ef4444",
  short: "#22c55e",
  long: "#3b82f6",
};

const DEFAULT_SETTINGS = {
  work: 25,
  short: 5,
  long: 15,
  longEvery: 4,
};

type Settings = typeof DEFAULT_SETTINGS;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = [880, 988, 1175][i];
      const t = ctx.currentTime + offset;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // 瀏覽器不支援音效就略過
  }
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

const RING_R = 130;
const RING_C = 2 * Math.PI * RING_R;

export default function PomodoroTimer() {
  const [settings, setSettings] = usePersistentState<Settings>(
    "pomodoro:settings",
    DEFAULT_SETTINGS,
  );
  const [mode, setMode] = useState<Mode>("work");
  const [remaining, setRemaining] = useState(DEFAULT_SETTINGS.work * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = usePersistentState("pomodoro:completed", 0);
  const [task, setTask] = usePersistentState("pomodoro:task", "");
  const [log, setLog] = usePersistentState<{ task: string; time: string }[]>(
    "pomodoro:log",
    [],
  );
  const [showSettings, setShowSettings] = useState(false);
  const endAt = useRef<number | null>(null);

  const total = settings[mode] * 60;
  const progress = total > 0 ? 1 - remaining / total : 0;

  function switchMode(next: Mode, s: Settings = settings) {
    setRunning(false);
    endAt.current = null;
    setMode(next);
    setRemaining(s[next] * 60);
  }

  /** counted=false 代表「跳過」：不播音效、不算一個蕃茄 */
  function finishSession(counted = true) {
    setRunning(false);
    endAt.current = null;
    if (counted) playChime();

    if (mode === "work" && !counted) {
      const next: Mode =
        (completed + 1) % settings.longEvery === 0 ? "long" : "short";
      setMode(next);
      setRemaining(settings[next] * 60);
    } else if (mode === "work") {
      const done = completed + 1;
      setCompleted(done);
      const now = new Date();
      setLog((l) => [
        {
          task: task.trim() || "（未命名）",
          time: now.toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...l,
      ]);
      const next: Mode = done % settings.longEvery === 0 ? "long" : "short";
      notify("專注時段結束", `休息一下吧（${MODE_LABEL[next]}）`);
      setMode(next);
      setRemaining(settings[next] * 60);
    } else {
      if (counted) notify("休息結束", "準備開始下一個專注時段");
      setMode("work");
      setRemaining(settings.work * 60);
    }
  }

  // 計時器裡永遠呼叫最新的 finishSession，避免拿到舊的 state
  const finishRef = useRef(finishSession);
  useEffect(() => {
    finishRef.current = finishSession;
  });

  // 以結束時間戳計算剩餘秒數，分頁在背景時也不會越跑越慢
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (endAt.current === null) return;
      const left = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) finishRef.current();
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  // 在瀏覽器分頁標題顯示倒數
  useEffect(() => {
    const original = "蕃茄鐘";
    document.title = running
      ? `${formatTime(remaining)} · ${MODE_LABEL[mode]}`
      : original;
    return () => {
      document.title = original;
    };
  }, [remaining, running, mode]);

  function toggle() {
    if (running) {
      setRunning(false);
      endAt.current = null;
      return;
    }
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
    endAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  }

  function reset() {
    switchMode(mode);
  }

  function updateSetting(key: keyof Settings, value: number) {
    const max = key === "longEvery" ? 12 : 180;
    const v = Math.min(max, Math.max(1, Math.round(value) || 1));
    const next = { ...settings, [key]: v };
    setSettings(next);
    if (!running && key === mode) setRemaining(v * 60);
  }

  const color = MODE_COLOR[mode];
  const roundInCycle = (completed % settings.longEvery) + 1;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 模式切換 */}
      <div className="flex gap-2 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
        {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              mode === m
                ? "text-white shadow"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            }`}
            style={mode === m ? { backgroundColor: MODE_COLOR[m] } : undefined}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      {/* 計時圓環 */}
      <div className="relative w-full max-w-[300px]">
        <svg viewBox="0 0 300 300" className="h-auto w-full -rotate-90">
          <circle
            cx={150}
            cy={150}
            r={RING_R}
            fill="none"
            strokeWidth={12}
            className="stroke-zinc-200 dark:stroke-zinc-800"
          />
          <circle
            cx={150}
            cy={150}
            r={RING_R}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold" style={{ color }}>
            {MODE_LABEL[mode]}
            {mode === "work" &&
              ` · 第 ${roundInCycle}/${settings.longEvery} 輪`}
          </span>
          <span className="font-mono text-6xl font-bold tabular-nums">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-zinc-300 px-5 py-3 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          重設
        </button>
        <button
          type="button"
          onClick={toggle}
          className="min-w-36 rounded-full px-10 py-3 text-lg font-bold text-white shadow transition hover:brightness-110"
          style={{ backgroundColor: color }}
        >
          {running ? "暫停" : remaining < total ? "繼續" : "開始"}
        </button>
        <button
          type="button"
          onClick={() => finishSession(false)}
          className="rounded-full border border-zinc-300 px-5 py-3 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          跳過
        </button>
      </div>

      {/* 目前任務 */}
      <div className="w-full max-w-md">
        <label htmlFor="task" className="mb-2 block text-sm font-semibold">
          現在要專注做什麼？
        </label>
        <input
          id="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="例如：寫週報"
          className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700"
        />
      </div>

      {/* 設定 */}
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          {showSettings ? "▾" : "▸"} 時間設定
        </button>
        {showSettings && (
          <div className="mt-3 grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            {(
              [
                ["work", "專注（分鐘）"],
                ["short", "短休息（分鐘）"],
                ["long", "長休息（分鐘）"],
                ["longEvery", "幾輪後長休息"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1 text-sm">
                {label}
                <input
                  type="number"
                  min={1}
                  value={settings[key]}
                  onChange={(e) => updateSetting(key, Number(e.target.value))}
                  className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 今日紀錄 */}
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">
            已完成 <span style={{ color: MODE_COLOR.work }}>{completed}</span>{" "}
            個蕃茄
          </h2>
          {log.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setLog([]);
                setCompleted(0);
              }}
              className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              清除
            </button>
          )}
        </div>
        {log.length > 0 && (
          <ol className="space-y-1 text-sm">
            {log.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-zinc-500 tabular-nums">{item.time}</span>
                <span>🍅 {item.task}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
