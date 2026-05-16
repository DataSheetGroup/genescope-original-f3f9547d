## 1. Replace all fonts with puffy cartoon fonts

In `src/styles.css`:
- Swap the Google Fonts import to: **Bagel Fat One** (display) + **Fredoka** wght 300–700 (body + small text). Drop Titan One and Nunito.
- Update CSS variables:
  - `--font-display: "Bagel Fat One", "Fredoka", system-ui, sans-serif;`
  - `--font-sans: "Fredoka", system-ui, sans-serif;`
- Apply `font-family: var(--font-sans)` to `html, body` and **all** form controls (`input, select, textarea, button`) so labels, inputs, badges, tables, footers, pills, and small text inherit Fredoka (puffy rounded).
- Keep `.font-display`, `.display-xl/lg/md` on Bagel Fat One for big headings.
- Loosen `letter-spacing` slightly (`-0.005em`) and bump body weight to 500 so Fredoka reads as "puffy" rather than thin.

Result: every piece of text on the site — headings, paragraphs, navbar, buttons, form labels, table cells, footer, tooltips — uses a puffy rounded cartoon font.

## 2. Smooth route/tab transitions

Currently each route mounts with `animate-fade-up` but there's no exit animation and no consistent timing, which causes the "delay/pop" feel between nav clicks.

In `src/routes/__root.tsx`:
- Wrap the `<Outlet />` in a `RouteTransition` component keyed by `useRouterState().location.pathname`.
- Use a lightweight CSS approach (no new deps): on key change, the wrapper applies a `animate-page-in` class (fade + 6px upward translate, 220ms, ease-out). No exit blocker — instant swap with smooth spawn-in, so navigation feels immediate.

In `src/styles.css`:
- Add a single keyframe `page-in` (opacity 0→1, translateY 8px→0, 220ms cubic-bezier(0.22, 1, 0.36, 1)) and the `.animate-page-in` utility.
- Update existing `.animate-fade-up` to the same shorter curve so internal sections feel consistent.

In each route file:
- Remove the per-route `animate-fade-up` wrapper div (the root now handles it) to avoid double animation / stagger delays.

## Out of scope
No component/library changes, no router restructure, no content edits.
