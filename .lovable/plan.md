
## Goal

Add the panelist-required **Visualization (Chapter 4)** and **Recommendation (Chapter 6)** content directly inside `/about` — no new top-level nav tab, no new route. Everything stays in the same editorial card style already used on About (Research Information + Compliance).

## Where it goes

Single file: `src/routes/_authenticated/about.tsx`. Two new cards appended below the existing ones, matching current styling (rounded-3xl bg-card, eyebrow + display heading, sticker illustration in the corner, cream-dim inner tiles).

To keep the page from getting long, add a small in-page tab switcher at the top of the About page: **Research · Compliance · Visualization · Recommendations**. Same look as the eyebrow chips already in the design; clicking scrolls to / reveals the matching section. No new routes, no new nav item.

## Section 1 — Visualization (from Chapter 4)

Compact, read-only summary of the paper's key results. Pulled straight from the PDF, not a live re-computation (dashboard already handles live charts).

Content blocks:
- **Dataset composition** — 447 records, 2021→2025, 14 engineered features, 357 train / 90 test
- **Class distribution** — Comprehensive vs Targeted split (from Section 4.1)
- **Model comparison table** — Accuracy, Precision, Recall, F1, ROC-AUC for the three models (numbers already in `src/data/model-from-pkl.json`)
- **Feature importance ranking** — top 6 features (Disease Category dominant), rendered as horizontal bars using the existing tokens
- **Key EDA callouts** — 99.11% private facilities, 87.70% Luzon, temporal growth 19 → 134

All numeric values come from the parsed paper (Chapter 4) and the existing `model-from-pkl.json`. No new dependencies; reuse `ChartCard` or plain divs with tokens.

## Section 2 — Recommendations (from Chapter 6)

Four grouped cards, one per audience, using the same cream-dim tile pattern as the Compliance list:

1. **For Healthcare Providers** — clinical guidelines for neurology/pediatrics; targeted support for Mindanao/Visayas (OR=0.46 finding)
2. **For Healthcare Institutions** — expand public/regional partnerships; capacity-building in Mindanao/Visayas
3. **For Policymakers** — Rare Disease Act expansion; publicly funded programs; national registry inclusion
4. **For Researchers** — 5 sub-items: Dataset expansion, Feature expansion, Modeling improvements, System refinement, Deployment extension

Each item shows a short 1-2 line summary drawn verbatim-ish from Chapter 6, with the paper section reference (e.g. "Section 4.12.2") as a small muted caption for traceability.

Stickers reused from existing About assets (`heartPulse`, `clipboard`, `fireFlask`, `testTube`, `petriDish`, `magnifier`, `pillCap`) — no new image generation.

## Technical notes

- One file changed: `src/routes/_authenticated/about.tsx`.
- Add a small local `useState` for the active tab (`"research" | "compliance" | "viz" | "recs"`), default `"research"`. Renders one section at a time to keep the page short — matches the user's "don't overload the UI" ask.
- All content typed inline as constants in the component file — no backend, no new data files, no PDF parsing at runtime.
- Head metadata title/description updated to reflect the expanded scope ("About · Research, results, and recommendations").
- No changes to Navbar, routes, or backend.

## Out of scope

- No new route or nav tab.
- No live chart re-implementation (dashboard already covers live charts; this is the paper's static reference figures).
- No PDF viewer embed.
