// User data API: prediction history.
// Talks to the Flask backend (same base URL as auth).
import { getToken } from "./auth";
import type { PredictPayload, PredictResponse } from "./api-types";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:5000";

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.error || j?.message || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type HistoryItem = {
  id: string;
  timestamp: string;
  input: PredictPayload;
  result: PredictResponse;
  note?: string | null;
};

export const listHistory = () => req<HistoryItem[]>("/history");

export const addHistory = (input: PredictPayload, result: PredictResponse) =>
  req<HistoryItem>("/history", {
    method: "POST",
    body: JSON.stringify({ input, result }),
  });

export const deleteHistory = (id: string) =>
  req<{ ok: true }>(`/history/${id}`, { method: "DELETE" });

export const clearHistory = () =>
  req<{ ok: true }>("/history/clear", { method: "POST" });

export const updateHistory = (id: string, patch: { note?: string }) =>
  req<HistoryItem>(`/history/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

