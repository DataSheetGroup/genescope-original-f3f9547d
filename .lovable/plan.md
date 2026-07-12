## Goal

Rebuild the **Visualization** tab in `/about` so it faithfully reproduces Chapter 4 "Results and Discussion" from the paper — every table, chart, and figure — each paired with the paper's own interpretation paragraph. No invented numbers, no summarized-away findings.

## Source of truth

Re-parse `DataSheet_Genescope.docx.pdf` with `document--parse_document` and extract Chapter 4 verbatim (Sections 4.1 → 4.12). Every label, number, and caption in the UI comes from that parse. Model-metric tables (4.12) continue to read from `src/data/model-from-pkl.json`, which already matches the paper.

## Chapter 4 sections to render (paper order)

Each block = **Figure/Table X.Y title** → the visual → the paper's interpretation directly below.

1. **4.1 Dataset overview** — 447 records, 2021–2025, 14 engineered features, 357/90 split. Small stat grid + narrative.
2. **4.2 Test Type distribution** — Comprehensive vs Targeted. Donut + text.
3. **4.3 Annual testing volume 2021–2025** — line/bar (19 → 134 growth). Chart + interpretation.
4. **4.4 Yearly volume by test type** — stacked bars per year + text.
5. **4.5 Disease Category distribution** — Neurology / Pediatrics / Others (/ Metabolic). Horizontal bars + text.
6. **4.6 Geographic Region distribution** — Luzon 87.70%, Visayas, Mindanao + interpretation on Luzon dominance.
7. **4.7 Sex distribution** — Male vs Female. Donut + text.
8. **4.8 Facility Type distribution** — Private 99.11% vs Public + text on private-sector reliance.
9. **4.9 Cross-tab: Region × Test Type** — grouped bars + commentary (incl. OR ≈ 0.46 Mindanao/Visayas).
10. **4.10 Cross-tab: Disease Category × Test Type** — grouped bars + text.
11. **4.11 Correlation / feature association matrix** — heatmap (if present in paper) + text.
12. **4.12 Model results**
    - **4.12.1 Model comparison table** — Accuracy, Precision, Recall, F1, ROC-AUC for BLR / Decision Tree / Random Forest.
    - **4.12.2 Feature importance** — horizontal bars for the best model + "Disease Category dominant, clinical referral pathway strongest predictor" text.
    - **4.12.3 Confusion matrix** — 2×2 grid + text.
    - **4.12.4 Cross-validation** — CV mean ± std / fold list + text.

If the PDF parse shows a listed section doesn't exist, drop it; if there's one we missed, add it. The final tab mirrors the paper's actual figure list.

## UI/UX rules (consistent, not overloaded)

- Stays inside the existing Visualization tab — no new routes, no new nav.
- One vertical stack of "figure cards", each with:
  - eyebrow `Figure 4.x` / `Table 4.x`
  - card title (paper caption)
  - the visual
  - muted-caption interpretation quoting/paraphrasing the paper
- Reuse existing tokens + `ChartCard`. Charts use Recharts (already in project) with `--chart-1..5`; no new chart libs.
- Small sticky sub-nav at the top of the tab: `Dataset · Distributions · Cross-tabs · Model` (anchor links) so panelists can jump.
- Research / Compliance / Recommendations tabs untouched.

## Data wiring

- 4.1–4.11 values live inline as a typed `chapter4` constants object sourced from the parsed PDF. No backend calls, no runtime PDF parsing.
- 4.12 continues to read from `src/data/model-from-pkl.json`.
- No backend / route / other-page changes.

## Files touched

- `src/routes/_authenticated/about.tsx` — replace the current Visualization tab body.
- Optional `src/data/chapter4.ts` — extract constants only if the block gets long.

## Out of scope

- Chapter 6 Recommendations tab (already done).
- Live re-computation from the CSV — dashboard already handles live charts.
- New illustrations/stickers.

## Implementation order

1. Parse the PDF, capture Chapter 4 numbers + interpretation text.
2. Draft the `chapter4` constants.
3. Rebuild the tab section-by-section, verifying each figure against the paper.
4. Visual pass to match existing About styling.
