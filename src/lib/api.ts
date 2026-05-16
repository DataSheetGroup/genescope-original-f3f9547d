export const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "http://localhost:5000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export type HealthResponse = { status?: string; model?: string } & Record<string, unknown>;
export const getHealth = () => request<HealthResponse>("/health");

export type EdaData = {
  total_records?: number;
  year_coverage?: string;
  model_count?: number;
  indicator_count?: number;
  test_type_distribution?: { name: string; value: number }[];
  annual_volume?: { year: number | string; count: number; cumulative?: number }[];
  yearly_by_test_type?: { year: number | string; Targeted: number; Comprehensive: number }[];
  disease_category?: { name: string; value: number }[];
  region_distribution?: { name: string; value: number }[];
  sex_distribution?: { name: string; value: number }[];
  facility_distribution?: { name: string; value: number }[];
  sex_vs_test?: { name: string; Targeted: number; Comprehensive: number }[];
  region_vs_test?: { name: string; Targeted: number; Comprehensive: number }[];
  disease_vs_test?: { name: string; Targeted: number; Comprehensive: number }[];
  facility_vs_test?: { name: string; Targeted: number; Comprehensive: number }[];
  correlation_matrix?: { labels: string[]; values: number[][] };
  stacked_region?: { name: string; Targeted: number; Comprehensive: number }[];
  stacked_disease?: { name: string; Targeted: number; Comprehensive: number }[];
  stacked_facility?: { name: string; Targeted: number; Comprehensive: number }[];
} & Record<string, unknown>;
export const getEdaData = () => request<EdaData>("/eda-data");

export type ModelMetrics = {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  cv_mean?: number;
  cv_std?: number;
  confusion_matrix?: number[][];
  roc_curve?: { fpr: number[]; tpr: number[] };
};
export type MetricsResponse = { models: ModelMetrics[] } | ModelMetrics[];
export const getMetrics = () => request<MetricsResponse>("/metrics");

export type FeatureImportance = { feature: string; importance: number }[];
export const getFeatureImportance = () => request<FeatureImportance>("/feature-importance");

export type PredictPayload = {
  Sex: string;
  Geographic_Region: string;
  Location_Type: string;
  Disease_Category: string;
  Facility_Type: string;
  Year: number;
};
export type PredictResponse = {
  prediction: "Comprehensive Profiling" | "Targeted Testing" | string;
  confidence: number;
  probability_comprehensive: number;
  probability_targeted: number;
};
export const postPredict = (payload: PredictPayload) =>
  request<PredictResponse>("/predict", { method: "POST", body: JSON.stringify(payload) });
