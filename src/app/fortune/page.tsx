import type { Metadata } from "next";
import FortuneDraw from "./fortune-draw";

export const metadata: Metadata = {
  title: "好運抽籤",
  description: "抽一支籤，看看今天的運勢",
};

export default function FortunePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">好運抽籤</h1>
      <FortuneDraw />
    </main>
  );
}
