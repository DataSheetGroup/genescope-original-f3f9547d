## Goals

1. Stop packing every map control into one drawer — distribute them as small framed pods around the map's edges.
2. Make fullscreen actually fill the viewport reliably.
3. Use the science stickers as glyphs on map controls.
4. Fix the "at a glance" highlight so the word "at" is inside the marker too.

## 1. Highlight fix (`src/routes/dashboard.tsx`, line 213)

Change:
```
The dataset, at <span className="hl">a glance.</span>
```
to:
```
The dataset, <span className="hl">at a glance.</span>
```

## 2. Map control layout (`src/components/PhilippinesMap.tsx`)

Replace the single "Layers & Filters" drawer with discrete pods anchored to the map frame. Each pod is its own small `absolute` panel with hairline border, solid paper bg, no shadow:

```text
┌─────────────────────────────────────────────────────┐
│ [🧪 Metric ▾]                       [🥽 Basemap ▾] │ top row
│                                                     │
│                    MAP CANVAS                       │
│                                                     │
│ [🧫 Bubbles|Regions|Heat]          [⊖ Min ──●── ⊕] │ mid-low
│                                                     │
│ [⟲ Reset] [⛶ Fullscreen]    [− 100% +]  [▶ Year ‣]│ bottom row
└─────────────────────────────────────────────────────┘
```

- Top-left pod: Metric switcher (sticker: `flask-purple` as leading glyph).
- Top-right pod: Basemap chips Light/Dark/Satellite (sticker: `goggles`).
- Middle-left pod: Mode switcher Bubbles / Regions / Heat (sticker: `molecule`).
- Middle-right pod: Min-value slider only (sticker: `magnet`).
- Bottom-left pod: Reset + Fullscreen text buttons (stickers: `dropper` for reset, `microscope` for fullscreen).
- Bottom-center pod: Zoom `[ − | + ]`.
- Bottom-right pod: Year scrubber with Play/Pause and chips (sticker: `flask-green`).
- Island-group toggles and label/dot toggles fold into the Basemap pod as a tiny secondary row (still framed, still small).

Each pod uses the same primitive:
```tsx
<div className="absolute … rounded-xl border bg-[var(--paper)] px-2 py-1.5 flex items-center gap-2">
  <img src={sticker} className="h-4 w-4" alt="" />
  …controls…
</div>
```
No gradients, no backdrop-blur, no shadow — matches the prior "flat" pass.

Remove the existing drawer state, drawer container, and color-ramp caption (caption moves under the Metric pod as a single muted line).

## 3. Fullscreen fix

Current code only toggles `position: fixed` + a backdrop, which can be clipped by ancestor `overflow:hidden` / transforms and doesn't escape sticky headers reliably.

Switch to the native Fullscreen API on the map wrapper ref:
```tsx
const wrapRef = useRef<HTMLDivElement>(null);
const toggleFs = () => {
  if (!document.fullscreenElement) wrapRef.current?.requestFullscreen();
  else document.exitFullscreen();
};
useEffect(() => {
  const onChange = () => setFullscreen(!!document.fullscreenElement);
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}, []);
```
- Drop the manual `position: fixed` overlay and backdrop div.
- When `fullscreen` is true, the wrapper gets `h-screen w-screen bg-[var(--paper)]` so Leaflet fills the real fullscreen surface.
- Call `map.invalidateSize()` after the fullscreen change so tiles re-layout.
- Keep `Esc` handling via the browser (no custom listener needed); keep `F` shortcut calling `toggleFs`.

## Out of scope

Data, chart panels, color tokens, navbar, other routes.
