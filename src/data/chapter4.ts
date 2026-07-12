// Chapter 4 (Results and Discussion) — values sourced from the paper and
// verified against src/data/genetic_testing_data.csv (N=447, 2021–2025).
// Kept static so the About / Visualization tab renders the paper's
// reference figures without recomputing at runtime.

export const CH4 = {
  dataset: {
    total: 447,
    train: 357,
    test: 90,
    features: 14,
    years: "2021 – 2025",
    balance: { Comprehensive: 339, Targeted: 108 }, // 75.84% / 24.16%
  },
  // 4.1 Class distribution
  testType: [
    { name: "Comprehensive", value: 339, pct: 75.84 },
    { name: "Targeted", value: 108, pct: 24.16 },
  ],
  // 4.2.5 Temporal trends (Table 6)
  annual: [
    { year: "2021", count: 19, cumulative: 19 },
    { year: "2022", count: 53, cumulative: 72 },
    { year: "2023", count: 115, cumulative: 187 },
    { year: "2024", count: 126, cumulative: 313 },
    { year: "2025", count: 134, cumulative: 447 },
  ],
  // 4.2.5 Yearly by test type
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
  // 4.2.3 Disease category
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
  // Cross-tabs (Comprehensive vs Targeted per group)
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
  // 4.8 Logistic Regression coefficients / odds ratios (Table 10, key rows)
  coefficients: [
    { feature: "Disease Category: Pediatrics", coef: 2.41, or: 11.14 },
    { feature: "Disease Category: Neurology", coef: 0.62, or: 1.86 },
    { feature: "Disease Category: Others", coef: -1.89, or: 0.15 },
    { feature: "Region: Mindanao × Neurology", coef: -0.78, or: 0.46 },
    { feature: "Region: Visayas × Neurology", coef: -0.74, or: 0.48 },
    { feature: "Facility: Public", coef: -1.32, or: 0.27 },
    { feature: "Sex: Male", coef: 0.11, or: 1.12 },
    { feature: "Year (since 2021)", coef: 0.08, or: 1.08 },
  ],
  // 4.6 Cross-validation (5-fold, ROC-AUC) — from model-from-pkl.json
  cvFolds: {
    "Binary Logistic Regression": [0.7947, 0.7984, 0.7560, 0.9003, 0.8883],
    "Decision Tree": [0.7658, 0.8066, 0.7565, 0.9058, 0.8987],
    "Random Forest": [0.7914, 0.8230, 0.6999, 0.8960, 0.9101],
  },
} as const;
