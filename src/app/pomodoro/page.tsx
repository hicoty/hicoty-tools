import type { Metadata } from "next";
import PomodoroTimer from "./pomodoro-timer";

export const metadata: Metadata = {
  title: "蕃茄鐘",
  description: "專注工作與休息交替的蕃茄鐘計時器",
};

export default function PomodoroPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">蕃茄鐘</h1>
      <PomodoroTimer />
    </main>
  );
}
