// Chapter 4 (Results and Discussion) — numbers taken verbatim from the
// GeneScope paper (Tables 5–11, Sections 4.1 – 4.12) and verified against
// src/data/genetic_testing_data.csv (N = 447, 2021 – 2025).

export const CH4 = {
  dataset: {
    total: 447,
    train: 357,
    test: 90,
    features: 14,
    years: "2021 – 2025",
    balance: { Comprehensive: 339, Targeted: 108 }, // 75.8% / 24.2% (Table 5)
    uniqueCombos: 84,
    duplicates: 363,
    missing: 0,
  },
  // Table 5 — Class distribution
  testType: [
    { name: "Comprehensive", value: 339, pct: 75.8 },
    { name: "Targeted", value: 108, pct: 24.2 },
  ],
  // Table 6 — Annual distribution
  annual: [
    { year: "2021", count: 19, cumulative: 19 },
    { year: "2022", count: 53, cumulative: 72 },
    { year: "2023", count: 115, cumulative: 187 },
    { year: "2024", count: 126, cumulative: 313 },
    { year: "2025", count: 134, cumulative: 447 },
  ],
  yearByTest: [
    { year: "2021", Comprehensive: 11, Targeted: 8 },
    { year: "2022", Comprehensive: 42, Targeted: 11 },
    { year: "2023", Comprehensive: 82, Targeted: 33 },
    { year: "2024", Comprehensive: 99, Targeted: 27 },
    { year: "2025", Comprehensive: 105, Targeted: 29 },
  ],
  // 4.2.1 Sex
  sex: [
    { name: "Male", value: 244, pct: 54.59 },
    { name: "Female", value: 203, pct: 45.41 },
  ],
  // 4.2.2 Region
  region: [
    { name: "Luzon", value: 392, pct: 87.70 },
    { name: "Visayas", value: 47, pct: 10.51 },
    { name: "Mindanao", value: 8, pct: 1.79 },
  ],
  // 4.2.3 Disease
  disease: [
    { name: "Pediatrics", value: 323, pct: 72.26 },
    { name: "Neurology", value: 91, pct: 20.36 },
    { name: "Others", value: 18, pct: 4.03 },
    { name: "Metabolic", value: 15, pct: 3.36 },
  ],
  // 4.2.4 Facility
  facility: [
    { name: "Private", value: 443, pct: 99.11 },
    { name: "Public", value: 4, pct: 0.89 },
  ],
  // Cross-tabs (verified against CSV)
  regionXTest: [
    { name: "Luzon", Comprehensive: 315, Targeted: 77 },
    { name: "Visayas", Comprehensive: 23, Targeted: 24 },
    { name: "Mindanao", Comprehensive: 1, Targeted: 7 },
  ],
  diseaseXTest: [
    { name: "Pediatrics", Comprehensive: 296, Targeted: 27 },
    { name: "Neurology", Comprehensive: 39, Targeted: 52 },
    { name: "Others", Comprehensive: 4, Targeted: 14 },
    { name: "Metabolic", Comprehensive: 0, Targeted: 15 },
  ],
  sexXTest: [
    { name: "Male", Comprehensive: 179, Targeted: 65 },
    { name: "Female", Comprehensive: 160, Targeted: 43 },
  ],
  facilityXTest: [
    { name: "Private", Comprehensive: 338, Targeted: 105 },
    { name: "Public", Comprehensive: 1, Targeted: 3 },
  ],
  // Table 7 — Optimal hyperparameters selected by GridSearchCV
  hyperparameters: [
    { model: "Binary Logistic Regression", params: "C = 10.0, L1 (Lasso), balanced weights, liblinear", cvRoc: 0.8275 },
    { model: "Decision Tree", params: "criterion = entropy, max_depth = 5, min_samples_split = 5", cvRoc: 0.8267 },
    { model: "Random Forest", params: "n_estimators = 100, max_features = sqrt, min_samples_split = 10", cvRoc: 0.8241 },
  ],
  // Table 10 — Logistic Regression coefficients & odds ratios (verbatim)
  coefficients: [
    { feature: "Disease Category: Pediatrics", coef: 3.1104, or: 22.4300 },
    { feature: "Disease Category: Neurology", coef: 1.8288, or: 6.2265 },
    { feature: "Disease Category: Others", coef: 0.6793, or: 1.9726 },
    { feature: "Visayas × Pediatrics", coef: 0.1864, or: 1.2049 },
    { feature: "Years since 2021", coef: 0.1070, or: 1.1129 },
    { feature: "Visayas × Others (int.)", coef: 0.0098, or: 1.0099 },
    { feature: "Geographic Region: Visayas", coef: 0.0000, or: 1.0000 },
    { feature: "Geographic Region: Mindanao", coef: 0.0000, or: 1.0000 },
    { feature: "Mindanao × Others", coef: 0.0000, or: 1.0000 },
    { feature: "Facility Type: Public", coef: -0.0101, or: 0.9899 },
    { feature: "Visayas × Others", coef: -0.0184, or: 0.9817 },
    { feature: "Sex: Male", coef: -0.0532, or: 0.9482 },
    { feature: "Visayas × Neurology", coef: -0.2243, or: 0.7991 },
    { feature: "Mindanao × Neurology", coef: -0.7688, or: 0.4636 },
  ],
  interceptLR: 0.3198,
  // Table 11 — Mean feature importance across all three models
  featureImportanceAll: [
    { feature: "Disease Cat.: Pediatrics", lr: 3.1104, dt: 0.7233, rf: 0.5095, mean: 1.4477 },
    { feature: "Disease Cat.: Neurology", lr: 1.8288, dt: 0.0430, rf: 0.1438, mean: 0.6719 },
    { feature: "Mindanao × Neurology", lr: 0.7688, dt: 0.0390, rf: 0.0309, mean: 0.2796 },
    { feature: "Disease Cat.: Others", lr: 0.6793, dt: 0.0248, rf: 0.0508, mean: 0.2517 },
    { feature: "Years since 2021", lr: 0.1070, dt: 0.1203, rf: 0.1279, mean: 0.1184 },
    { feature: "Sex: Male", lr: 0.0532, dt: 0.0061, rf: 0.0181, mean: 0.0258 },
  ],
  // Figure 5 — Correlation matrix (key values highlighted in Section 4.9)
  correlations: [
    { pair: "Pediatrics ↔ Test Type", r: 0.60, note: "Strongest positive association with the target" },
    { pair: "Neurology ↔ Test Type", r: -0.39, note: "Moderate negative association" },
    { pair: "Mindanao × Neurology ↔ Mindanao", r: 0.93, note: "Interaction term — expected multicollinearity" },
    { pair: "Visayas × Neurology ↔ Visayas", r: 0.72, note: "Interaction term — expected multicollinearity" },
    { pair: "Pediatrics ↔ Neurology", r: -0.82, note: "Structural artifact of one-hot encoding" },
  ],
  // 5-fold CV ROC-AUC per fold (Section 4.6, from model-from-pkl.json)
  cvFolds: {
    "Binary Logistic Regression": [0.7947, 0.7984, 0.7560, 0.9003, 0.8883],
    "Decision Tree": [0.7658, 0.8066, 0.7565, 0.9058, 0.8987],
    "Random Forest": [0.7914, 0.8230, 0.6999, 0.8960, 0.9101],
  },
  // Section 4.7.1 — Per-class performance on the 90-record test set
  perClass: [
    {
      model: "Binary Logistic Regression",
      comprehensive: { precision: 0.8824, recall: 0.8824, f1: 0.8824 },
      targeted: { precision: 0.6364, recall: 0.6364, f1: 0.6364 },
      macroF1: 0.7594,
      weightedF1: 0.8222,
    },
    {
      model: "Decision Tree",
      comprehensive: { precision: 0.8553, recall: 0.9559, f1: 0.9028 },
      targeted: { precision: 0.7857, recall: 0.5000, f1: 0.6111 },
      macroF1: 0.7569,
      weightedF1: 0.8315,
    },
    {
      model: "Random Forest",
      comprehensive: { precision: 0.8592, recall: 0.8971, f1: 0.8777 },
      targeted: { precision: 0.6316, recall: 0.5455, f1: 0.5854 },
      macroF1: 0.7315,
      weightedF1: 0.8062,
    },
  ],
} as const;
