# Plan: Map polish, heading highlights, kill pink hover

## 1. Fix the lingering pink hover (`src/styles.css`)

`--coral` was rethemed to `--purple`, but two hovers still hard-code pink:
- L247: `.pill-coral:hover { background: oklch(0.78 0.1 12); }` → change to a darker purple (e.g. `color-mix(in oklab, var(--purple) 80%, black)`).
- L291: `*::-webkit-scrollbar-thumb:hover` → same purple-dark mix.

## 2. Section heading highlights (match hero `.hl`)

Currently only the landing hero uses `<span className="hl">…</span>`. Other section headings (dashboard `h1`, About, History, Performance, Predict, plus the inner section titles inside each dashboard tab) use plain inline color.

- Update `src/routes/dashboard.tsx` L207: wrap "a glance." in `<span className="hl">` instead of inline `color: ACCENT`.
- Audit `src/routes/{about,history,performance,predict}.tsx` and the inner tab headings (`OverviewTab`, `GeographicTab`, etc.) and wrap the accent word(s) of each `h1`/`h2` in `<span className="hl">`.
- Also update `src/components/SectionHeader.tsx` so the `title` prop can accept JSX (already does) — no code change, just consistent usage.
- Verify `.hl` token in `styles.css` reads well on both cream and white backgrounds; if needed, add a `.hl-soft` variant using `color-mix(in oklab, var(--purple) 35%, var(--paper))` for dashboard headings on white.

## 3. Map overhaul (`src/components/PhilippinesMap.tsx`)

### Remove visual clutter
- **Hide Leaflet attribution**: pass `attribution=""` to `TileLayer` and add `attributionControl={false}` to `MapContainer` (or render `.leaflet-control-attribution { display:none }` scoped to the map wrapper). Add a tiny "Map data © OSM/CARTO" line into the page footer instead (legal compliance, off-canvas).
- **Remove the bottom-left legend ribbon** ("7 – 77 · Targeted · All years"). Move the min–max gradient into the new Layers panel as a passive caption under the active metric.

### Bigger, cleaner, more usable controls
Replace the current cramped bottom pill toolbar with a two-zone layout:

```text
┌─────────────────────────────────────────────┐
│ [Selected]                          [☰ Layers & Filters]
│                                              
│              MAP                             
│                                              
│ [● Bubbles] [◆ Regions] [≋ Heat]    [⛶]      
└─────────────────────────────────────────────┘
```

- **Bottom-left mode switcher**: large 40px-tall segmented control, 14px display font, icon + label, clear active state (filled ink, white text). Three modes stay.
- **Bottom-right floating action stack**: Reset (home icon), Fullscreen (expand icon), Zoom +/− (replace Leaflet's tiny default with custom 40px buttons). All same visual language.
- **Top-right "Layers & Filters" drawer (expanded by default on desktop ≥1024px, collapsed on mobile)**: a 300px wide card containing
  - **Metric** (radio list of 4, with sticker icons): Total / Targeted / Comprehensive / Share
  - **Year** (chip row: All · 2021 · 2022 · 2023 · 2024 · 2025) — replaces the tiny `<select>`
  - **Basemap** (3 visual swatches: Light / Dark / Satellite) — replaces the tiny `<select>`
  - **NEW Region filter** (multi-select: Luzon / Visayas / Mindanao) — dims unselected island groups
  - **NEW Test-type filter** (Targeted / Comprehensive toggles for bubble sizing)
  - **NEW Min value slider** — hide islands below a threshold
  - **NEW Label toggle** — show/hide permanent labels on bubbles
  - **NEW Region dots toggle** — show/hide the 17-region context dots
  - Passive caption at bottom of drawer: gradient bar with min–max for the active metric
- **Top-left Selected Region card**: keep, slightly larger (260px), with sticker.

### New interactive features
- **Hover halo**: islands lift/scale on hover (CSS on Leaflet path via class).
- **Compare mode toggle**: split-screen overlay of two years (year A vs year B) — bubble sizes shown side by side.
- **Animated year scrubber** (optional play/pause button next to the year chips): auto-cycles through 2021→2025 with 1.2s/frame.
- **Export PNG button** in the action stack (uses `leaflet-image` or `html-to-image`; if adding deps is undesirable, use `domtoimage` via `bun add dom-to-image-more`).
- **Keyboard shortcuts**: `1/2/3` for modes, `F` fullscreen, `R` reset, `←/→` cycle years. Show a `?` help popover listing them.
- **Tooltip upgrade**: on bubble hover, show a mini stat block (Total / Targeted / Comprehensive / Share) instead of a single number.

### Type/font consistency
- Display font (Anton) for control labels, Poppins tabular-nums for numbers, all controls 13–14px (was 10–12px).

## Out of scope
- Backend/data layer, other dashboard tabs' charts, navbar, color tokens beyond the two hover fixes.

## Files touched
- `src/styles.css` — 2 hover lines, optional `.hl-soft` variant.
- `src/components/PhilippinesMap.tsx` — full controls refactor + new features.
- `src/routes/dashboard.tsx` — `<span className="hl">` wrap on tab/section headings.
- `src/routes/{about,history,performance,predict}.tsx` — `.hl` wrap on hero/section headings.
- `package.json` — possibly `dom-to-image-more` if Export PNG is kept.
