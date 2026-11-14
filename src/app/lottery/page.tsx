import type { Metadata } from "next";
import LotteryWheel from "./lottery-wheel";

export const metadata: Metadata = {
  title: "抽獎轉盤",
  description: "輸入名單，轉動轉盤抽出得獎者",
};

export default function LotteryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">抽獎轉盤</h1>
      <LotteryWheel />
    </main>
  );
}
