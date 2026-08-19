/* DESIGN (v2): Missão Aratuba — persistência local (app estático, sem backend). */
import { useEffect, useState } from "react";

/** Estado persistente em localStorage com SSR-safe defaults. */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage indisponível — ignorar silenciosamente */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
