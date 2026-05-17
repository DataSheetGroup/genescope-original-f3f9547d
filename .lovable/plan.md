## Decisions locked in

- **Fonts (from phamilypharma.com)**: **Anton** for display (headlines, tab labels, KPI numbers, panel titles, table headers) + **Poppins** 400/500/600 for body, labels, table cells, axis ticks.
- **Icons (sticker style)**: switch from Lucide to **Fluent Emoji Flat** via `@iconify/react`. These are Microsoft's free sticker-emoji set — chunky, colorful, sticker-like. Used inside the rounded badge tiles on KPI cards and tab pills.
- **Body text size**: step up from `text-xs/text-sm` to `text-sm/text-base`. KPI numbers stay display-sized.

## What ships

### 1. Fonts
- Load Anton + Poppins from Google Fonts in `src/routes/__root.tsx`'s `head()` (same place existing fonts are loaded — verify there or add).
- In `src/styles.css`:
  - `--font-sans: "Poppins", ...` (replaces Fredoka as the default)
  - `--font-display: "Anton", ...` (replaces Bagel Fat One — Anton is the Phamily display face)
  - Keep Bagel Fat One available for the wordmark / home hero so the brand identity outside the dashboard stays intact. New utility class `.font-brand` for that.
- Adjust `display-lg` / `display-md` letter-spacing — Anton is condensed, so tighten line-height and add a touch of letter-spacing (~0.01em) for legibility.

### 2. Icons
- Install `@iconify/react`.
- Build a tiny `<StickerIcon name="fluent-emoji-flat:bar-chart" />` wrapper at the dashboard top — keeps imports clean.
- Mapping for the dashboard:
  - Tab bar: `bar-chart` (Overview), `world-map` (Geographic), `bust-in-silhouette` (Demographic), `hospital` (Institutional), `chart-increasing` (Temporal).
  - KPIs: `card-file-box` (Total Records), `spiral-calendar` (Year Coverage), `round-pushpin` (Regions), `dna` (Disease Categories), `man` / `woman`, etc.
- Drop the colored bordered tile around the icon — the sticker icon IS the visual interest. Just render at 28px.

### 3. Layout polish (minimalist, perfectly aligned)
- Page max-width stays 1400; horizontal padding bumps to `px-6 sm:px-8 lg:px-12` for breathing room.
- Section vertical rhythm: `space-y-8` between blocks (was 6), `gap-6` inside grids.
- Cards: `p-7` instead of `p-6`. Hairline border stays. Equal heights across each row via `grid auto-rows-fr` so KPI cards and chart panels never jitter.
- KPI cards: number → label → sub on a single left-aligned column, sticker icon top-right corner (not left) — feels editorial, mirrors Phamily's confident left-aligned numbers.
- Tab bar: full-width with evenly-distributed pills on desktop (`flex-1 justify-center` per pill), horizontal scroll on mobile. Active = solid ink, inactive = transparent.
- Toolbar (search + filters) right-aligned on the same row as tabs at desktop; stacks below on mobile.
- Charts: lock every chart to `h-80` (was 72 / mixed). Consistent left/right margins via Recharts `margin={{ top: 8, right: 16, bottom: 0, left: 0 }}`.
- Table: row height `py-4`, font-size `text-base`, zebra rows, header in Anton uppercase, numeric columns `tabular-nums` and right-aligned.
- Drop the page sub-paragraph from `text-sm` (currently muted) to `text-base` so it reads at conversational size.

### 4. Files touched
- `src/styles.css` — swap `--font-sans` / `--font-display`, add `.font-brand`, retune display utility tracking.
- `src/routes/__root.tsx` — add Google Fonts links for Anton + Poppins (and keep Bagel Fat One link for the brand mark).
- `src/routes/dashboard.tsx` — replace Lucide icons with `<StickerIcon>` wrappers, bump paddings and text sizes, tighten grid alignment, restructure StatCard with icon top-right.
- `package.json` — add `@iconify/react`.

### 5. What I won't touch
- The home page's Bagel Fat One wordmark stays via `.font-brand`.
- Color tokens, dashboard structure, data engine, navbar — all unchanged.
- Other routes (Predict, Performance, About, History) — only inherit the new default Poppins body, which is the point.

Approve and I'll install Iconify, wire the fonts, and rebuild the dashboard surfaces in one pass.