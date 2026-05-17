## Goals

1. Show the four KPI cards (TOTAL RECORDS, YEAR COVERAGE, REGIONS, DISEASE CATEGORIES) **only on the Overview tab**, not on every tab.
2. On the Geographic tab, give the map its own full-width section and move "Regional Breakdown" below it.
3. Upgrade the Philippines map into the dashboard's hero feature — interactive, advanced, with real controls.

---

## 1. KPI scoping (Overview only)

In `src/routes/dashboard.tsx`:
- Remove `<KpiRow data={data} />` from the shared body wrapper.
- Render `<KpiRow />` as the first block inside `OverviewTab` only.
- Leave the per-tab StatCard rows on Geographic / Demographic / Institutional alone (those are tab-specific KPIs, not the global four).

## 2. Geographic tab layout

Restructure the Geographic tab into three vertical sections:

```text
[ Top region · Coverage · Total tests ]   ← existing 3 stat cards
──────────────────────────────────────────
[ PHILIPPINES MAP — full width, solo ]
──────────────────────────────────────────
[ Regional Breakdown (bar chart, full width) ]
──────────────────────────────────────────
[ Region × Test Type (existing) ]
```

- Drop the `lg:grid-cols-12` split that put map+breakdown side-by-side.
- Map panel becomes full-width, taller (h-[600px]) so it reads as the highlight.
- Breakdown bar chart sits on its own row below.

## 3. Advanced interactive map

Rewrite `src/components/PhilippinesMap.tsx` to be the dashboard's centerpiece. All work stays in this component plus its panel wrapper.

### Visualization modes (toggle in a control bar overlaid on the map)
- **Bubbles** — current island-group circles, sized by volume (default).
- **Heat** — proportional radial gradients per island group (CSS/SVG-rendered overlay, no extra deps if possible; otherwise `leaflet.heat`).
- **Choropleth** — fill Luzon / Visayas / Mindanao polygons by volume using a 5-step purple ramp. Use a small inlined GeoJSON of the three island-group hulls (lightweight, hand-defined coordinates — no external fetch).

### Controls (floating panel, top-right of map)
- Mode switcher (Bubbles / Heat / Choropleth) — segmented control.
- Metric switcher (Total records / Targeted only / Comprehensive only / % share) — requires passing `region_vs_test` into the map.
- Year filter — segmented `All · 2021 · 2022 · 2023 · 2024 · 2025` (requires passing year-broken regional data; if backend doesn't expose it, fall back to "All" only and hide the year segmented control gracefully).
- Basemap toggle — Light / Dark / Satellite (CARTO light, CARTO dark, Esri World Imagery tile URLs).
- Reset view button.
- Fullscreen toggle (CSS-only: expand the map container to `fixed inset-4 z-50`).

### On-map interactivity
- Click an island group → "selected" state: ring highlight + detail card slides in from the left of the map showing name, total, share, top disease (if available), top facility (if available).
- Hover → richer tooltip card (name, count, share, mini sparkline of yearly trend if year data available, else just count + share).
- Region context dots (existing 17 dots) become clickable with name labels on hover.
- Enable `scrollWheelZoom` (currently disabled), add `zoomControl` styled to match theme (bottom-right).
- Smooth fly-to animation on selection (`map.flyTo`).

### Legend
- Bottom-left card: gradient bar with min/max counts, current metric label, current year label.

### Performance / safety
- Keep the dynamic `import("react-leaflet")` client-only pattern.
- All extra layers (choropleth polygons, heat overlay) live inside the same client-only effect — no SSR access to `window`.
- Use design tokens (`--ink`, `--purple`, `--paper`, `--coral`) for all colors; no hardcoded brand colors.

### Data plumbing
- `PhilippinesMap` props expand to: `{ data, regionByTest?, regionByYear? }`. Pass `data.region_vs_test` and (if present) `data.region_by_year` from the Geographic tab. If a prop is missing, the related control is hidden — no crash.

---

## Files touched

- `src/routes/dashboard.tsx` — move KPI row into Overview tab; restructure Geographic tab layout; pass extra data to the map.
- `src/components/PhilippinesMap.tsx` — full rewrite with modes, controls, selection, legend, fullscreen.

No new dependencies required for the core (modes built with react-leaflet primitives + inline GeoJSON). If heat mode proves too heavy without `leaflet.heat`, I'll skip Heat and ship Bubbles + Choropleth only — will note before installing anything.

## Out of scope

- Backend / API changes. If `region_by_year` doesn't exist in the EDA payload, the year filter is hidden; I won't add new endpoints.
- Other tabs' charts, fonts, color tokens, navbar.
