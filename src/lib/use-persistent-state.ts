"use client";

import { useEffect, useState } from "react";

/**
 * 跟 useState 一樣，但會把值存在 localStorage，重新整理後還在。
 * 第一次 render 先用預設值（避免 hydration 不一致），掛載後才讀出存檔；
 * 讀完存檔之前不會寫入，避免預設值蓋掉存檔。
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 掛載後同步外部存檔
        setValue((prev) =>
          isPlainObject(prev) && isPlainObject(parsed)
            ? ({ ...prev, ...parsed } as T)
            : parsed,
        );
      }
    } catch {
      // 存檔壞掉或無法存取就用預設值
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 無痕模式等情況可能無法寫入，忽略
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
