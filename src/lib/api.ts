// Local-only API. The dataset and model run entirely in the browser
// from the bundled CSV — no Flask backend required.
import {
  buildEdaData,
  getFeatureImportanceLocal,
  getMetricsLocal,
  predictLocal,
} from "./local-data";
import type {
  EdaData,
  FeatureImportance,
  HealthResponse,
  MetricsResponse,
  ModelMetrics,
  PredictPayload,
  PredictResponse,
} from "./api-types";

export type {
  EdaData,
  FeatureImportance,
  HealthResponse,
  MetricsResponse,
  ModelMetrics,
  PredictPayload,
  PredictResponse,
};

const delay = <T,>(value: T, ms = 120) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export const getHealth = (): Promise<HealthResponse> =>
  delay({ status: "ok", model: "local-naive-bayes" });

export const getEdaData = (): Promise<EdaData> => delay(buildEdaData());

export const getMetrics = (): Promise<MetricsResponse> =>
  delay({ models: getMetricsLocal() });

export const getFeatureImportance = (): Promise<FeatureImportance> =>
  delay(getFeatureImportanceLocal());

import { getToken } from "./auth";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:5000";

export const postPredict = async (
  payload: PredictPayload,
  opts?: { signal?: AbortSignal },
): Promise<PredictResponse> => {
  const t0 = performance.now();
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: opts?.signal,
    });
    if (!res.ok) throw new Error(`Predict failed (${res.status})`);
    const data = await res.json();
    const roundtrip_ms = Math.round(performance.now() - t0);
    if (data?.model && data.model !== "unavailable") {
      // Backend returns probabilities in 0–1 range; UI expects 0–100.
      const toPct = (v: unknown) => {
        const n = Number(v) || 0;
        return n <= 1 ? n * 100 : n;
      };
      return {
        prediction: data.prediction,
        confidence: toPct(data.confidence),
        probability_comprehensive: toPct(data.probability_comprehensive),
        probability_targeted: toPct(data.probability_targeted),
        elapsed_ms: Number(data.elapsed_ms) || undefined,
        roundtrip_ms,
      } as PredictResponse;
    }
    // model unavailable on server → fall back
  } catch (e) {
    if ((e as any)?.name === "AbortError") throw e;
    console.warn("[predict] backend unavailable, using local fallback", e);
  }
  const local = await predictLocal(payload);
  return { ...local, roundtrip_ms: Math.round(performance.now() - t0) };
};
