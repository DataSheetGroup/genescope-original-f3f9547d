
## GeneScope — Build Plan

A locally-hosted clinical decision-support frontend for a FEU thesis. React + TanStack Start + Tailwind, talking to a Flask backend at `http://localhost:5000`. Six pages, persistent confidentiality banner, sticky nav, fully responsive.

### A note on the reference site
I will take strong **stylistic inspiration** from phamilypharma.com (clean medical minimalism, calm whitespace, soft section transitions, simple illustrative accents, sober sans-serif typography, restrained motion) but will not reproduce its copy, exact layouts, brand assets, or proprietary illustrations. The result will *feel* like a polished pharma/health site, applied to GeneScope's own content and the navy/teal palette you specified.

### Design system
- Font: Inter (Google Fonts), tight tracking on headings
- Tokens in `src/styles.css` (oklch): `--background` light gray `#F8FAFC`, `--foreground` navy `#0A1628`, `--primary` teal `#0D9488`, `--accent` blue `#2563EB`, plus amber for the banner. No gradients, no glow, no emoji decoration beyond the lock glyph you explicitly requested in the banner/badge.
- Cards: white, rounded-2xl, 1px border, soft shadow
- Motion: subtle fade/slide-up on section enter, 200ms hover transitions. No flashy effects.
- Recharts for all charts (teal/navy/blue/amber palette, no rainbow)
- Lucide React for icons

### Global shell
- `src/routes/__root.tsx`: amber slim banner ("Private & Confidential — For Internal Use Only") + sticky navbar (GeneScope wordmark + small "Local" badge, links: Home/Predict/Dashboard/Performance/History/About, active link teal, mobile hamburger via Sheet) + `<Outlet />` + footer.
- Health ping (`GET /health`) runs from a small `useHealth` hook; status dot lives in the navbar so every page shows Online/Offline.
- Global API client `src/lib/api.ts` with one error shape; failed requests render a reusable `<BackendOfflineNotice />`: "Unable to reach GeneScope backend. Please ensure the Flask server is running at localhost:5000."
- TanStack Query for all GETs; mutation for `/predict`.

### Routes (file-based, each with its own `head()` meta)
1. `src/routes/index.tsx` — Home: hero (title, subtitle, description), two CTAs (Start Prediction → /predict, View Dashboard → /dashboard), stats strip fed by `/eda-data` (Total Records, 2021–2025 Coverage, 3 ML Models, 6 Indicators), footer attribution.
2. `src/routes/predict.tsx` — Two-column layout.
   - Left: form with 6 Shadcn `Select` dropdowns (Sex, Geographic Region, Location Type, Disease Category, Facility Type, Year). Each label has muted indicator-type subtext. Generate button disabled until all six set. Reset button. Disclaimer.
   - Right: hidden until response. On submit, POST `/predict`; show spinner; on error show retry. On success render: result badge (green Comprehensive / blue Targeted), large circular confidence ring, dual probability bar, then the **prominent Result Knowledge Card** (teal-bordered, DNA icon, conditional definition + 5 example bullets), then Indicator Influence horizontal bar chart from `/feature-importance`, then Save to History + New Prediction buttons.
3. `src/routes/dashboard.tsx` — All charts from `/eda-data` in a responsive grid, grouped under Descriptive / Comparative / Stacked sections. Donut, bar+line combo, grouped line, horizontal bar, pie, bars, grouped bars, correlation heatmap (custom Recharts/SVG), stacked bars. Skeletons while loading.
4. `src/routes/performance.tsx` — `/metrics` + `/feature-importance`. Comparison table, 3 model cards with horizontal metric bars, grouped bar across all metrics, three 2×2 confusion-matrix heatmaps, overlaid ROC curve, feature importance bar. Primary Model card with the logit formula rendered cleanly (KaTeX-free, styled span). 5-fold CV block. Testing Methods checklist card.
5. `src/routes/history.tsx` — localStorage-backed audit log. Table with No./Timestamp/Sex/Region/Disease/Facility/Year/Result/Confidence, colored result badges, filters (Result, Year, Disease), Export CSV, empty state, RA 10173 notice. `useHistory` hook in `src/hooks/useHistory.ts`.
6. `src/routes/about.tsx` — Research Info card + Compliance card. Static content only.

### State & data
- `src/lib/api.ts`: typed wrappers for `health`, `edaData`, `metrics`, `featureImportance`, `predict`.
- `src/hooks/useHealth.ts`, query keys centralized in `src/lib/queryKeys.ts`.
- History persisted in `localStorage` under `genescope.history.v1`.

### Technical details
- Stack: existing TanStack Start template, add `recharts`. Lucide already available.
- Backend base URL via `VITE_API_BASE_URL` (default `http://localhost:5000`) for portability.
- No Lovable Cloud — purely a frontend to the user's local Flask server.
- No SSR data fetching for `/predict` etc. (loaders skipped; Query in components) since the Flask server is only reachable from the user's machine.
- Accessibility: labeled selects, focus rings, color-contrast safe badges, aria-live on prediction result.

### Out of scope
- No auth, no backend changes, no Supabase, no payment.
- Not literally cloning phamilypharma.com markup/assets — inspiration only.

### Deliverable checklist
- [ ] Tokens + Inter wired in `src/styles.css`
- [ ] Root shell: banner, navbar, footer, health dot
- [ ] API client + Query setup with `defaultPreloadStaleTime: 0`
- [ ] 6 route files with `head()` meta
- [ ] Reusable: BackendOfflineNotice, StatCard, SectionHeader, ChartCard, ConfidenceRing, ProbabilityBar, ResultKnowledgeCard, ConfusionMatrix, Heatmap
- [ ] History hook + CSV export
- [ ] Loading skeletons + empty/error states everywhere
- [ ] Mobile pass on all six pages
