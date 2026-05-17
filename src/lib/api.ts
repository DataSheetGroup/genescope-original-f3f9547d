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

export const postPredict = (payload: PredictPayload): Promise<PredictResponse> =>
  delay(predictLocal(payload), 200);
