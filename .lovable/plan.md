# Plan: Highlight headings everywhere + simpler flat map controls

## 1. `.hl` highlight on all route headings

Several routes still use `text-coral` (plain colored text) for the accent word instead of the hero-style `.hl` marker block. Swap them so every page matches the hero treatment.

**`src/routes/about.tsx`**
- L50: `<span className="text-coral">with care.</span>` → `<span className="hl">with care.</span>`
- L59: wrap "information" in `.hl` → `Research <span className="hl">information</span>`
- L84: wrap "ethical perimeter" in `.hl`

**`src/routes/history.tsx`**
- L67: `text-coral` → `hl` on "accountable."

**`src/routes/performance.tsx`**
- L169: `text-coral` → `hl` on "one chosen for the job."
- L184: `text-coral` → `hl` on "Logistic Regression"
- L201, L303, L319: wrap the last 1–2 words of each `<h2>` in `.hl` (e.g. `…side by <span className="hl">side</span>`, `5-Fold Mean ± <span className="hl">SD</span>`, `Testing <span className="hl">methods</span>`).

**`src/routes/predict.tsx`**
- L305 `<h3 className="display-md">`: wrap the prediction text (or its last word) in `.hl`.
- L328: wrap "prediction" in `.hl`.

No new tokens needed — `.hl` already exists and now uses purple.

## 2. Simpler, flatter map controls (`src/components/PhilippinesMap.tsx`)

User wants cleaner controls and **no gradient color**. Strip every gradient/translucent treatment and move to a flat, single-tone surface.

### Surface treatment
- Remove `bg-white/95 backdrop-blur` on every floating panel → use solid `background: var(--paper)` (off-white).
- Remove `shadow-xl` / `shadow-2xl` → use a single hairline border only.
- Remove the purple metric ramp `linear-gradient(90deg, ...)` swatch in the Layers drawer. Replace with a single-line caption: `"{minV} – {maxV}  ·  {metricLabel}"` in muted text. No color bar.
- Remove the gradient previews on the basemap swatches (`preview: "linear-gradient(...)"`). Replace with plain labeled buttons (3 text pills): Light / Dark / Satellite. Active = filled ink, inactive = bordered.

### Layout simplification
- Collapse the Layers & Filters drawer to **5 sections** (down from 6) by merging "Display" toggles into a single inline row at the bottom: `[Labels] [Region dots]` as small flat chips.
- Replace the custom `Toggle` switch with a flat chip-style on/off button (purple-filled when on, hairline-bordered when off). No animated knob.
- Reduce drawer width 320 → 280; reduce internal padding 16 → 12.
- Drop the min-threshold slider header value (`"Minimum value: 1,234"`) and use a simpler `"Min value"` label with the number to the right.

### Bottom controls
- Bottom-left mode switcher: keep 3 pills but flatten — remove backdrop-blur, single hairline border, smaller height (36 px), no symbol glyphs (just labels). Active = filled ink, inactive = transparent.
- Bottom-right action stack: flatten zoom in/out into a single horizontal pill `[ − | + ]`, and put Reset and Fullscreen as two adjacent text buttons (`Reset`, `Fullscreen`). All same hairline-bordered paper surface, no shadows.

### Selected region card
- Solid paper background, hairline border, no shadow, no backdrop blur.

### Keep as-is
- Keyboard shortcuts, play/pause year scrubber, island toggles, label/dot toggles, hidden Leaflet attribution.

## Out of scope
- Data layer, dashboard tabs other than headings, navbar, color tokens, removal of map features (compare mode is not being added).

## Files touched
- `src/routes/about.tsx`, `src/routes/history.tsx`, `src/routes/performance.tsx`, `src/routes/predict.tsx` — swap `text-coral` accents for `.hl`, wrap remaining h2/h3 accent words.
- `src/components/PhilippinesMap.tsx` — strip gradients/shadows/blur, flatten controls, simplify drawer.
