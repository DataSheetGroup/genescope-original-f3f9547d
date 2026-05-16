import { useCallback, useEffect, useState } from "react";
import type { PredictPayload, PredictResponse } from "@/lib/api";

const KEY = "genescope.history.v1";

export type HistoryItem = {
  id: string;
  timestamp: string;
  input: PredictPayload;
  result: PredictResponse;
};

function read(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const add = useCallback((input: PredictPayload, result: PredictResponse) => {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      input,
      result,
    };
    const next = [item, ...read()];
    localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
    return item;
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setItems([]);
  }, []);

  return { items, add, clear };
}
