## Fixes to apply

**1. Remove top confidentiality bar**
- Remove `<ConfidentialityBanner />` from `src/routes/__root.tsx`. Keep the file but unused (or delete).

**2. Wordmark — drop the decorative dots**
- In `src/components/Navbar.tsx` `Wordmark`, render plain `GENESCOPE` (no `••` overlays). Same treatment anywhere else dots appear.

**3. Bolder cartoonish display font**
- Swap `Bowlby One SC` → **Titan One** (chunkier, rounder cartoon feel) in `src/styles.css` `@import` + `--font-display`.
- Bump `.display-xl/lg/md` weights/tracking slightly for chunkier feel.
- Apply display font to nav links + tab section headings (currently uppercase Inter) so all section titles share the cartoon style.

**4. Fix pink highlight overlap**
- Current `.hl` uses `box-decoration-break: clone` with vertical padding that stacks per-line and overlaps with `line-height`.
- Rewrite using `display: inline` + `padding: 0.05em 0.25em`, `line-height: 1.15` on parent headings that use `.hl`, and add a small `margin-right` so consecutive highlighted words don't collide. Also remove negative letter-spacing on highlighted runs.
- Audit `index.tsx` usages — wrap only short phrases, not entire multi-line headings.

**5. Navigation hover style**
- Remove the coral underline bar (`after:` pseudo) in `NavLink`.
- Replace with a simple pill hover: on hover/active, link gets a cream rounded-full background with green text. No animation slide. No underline.

**6. Footer giant wordmark too big / overflowing**
- Reduce `clamp(4rem, 22vw, 22rem)` → `clamp(3rem, 14vw, 12rem)`.
- Add `overflow-hidden` and `px-6` padding container; ensure no horizontal scroll on 634px viewport.

**7. Illustrations look bad / uncolored**
- Regenerate the 4 PNGs in `src/assets/illustrations/` with explicit color instructions: cream/coral/teal flat fills with bold deep-green outlines (cartoon sticker look), transparent background, premium quality.
  - `helix-doodle.png`, `microscope-doodle.png`, `magnifier-strand.png`, `helix-check.png`
- Slightly increase displayed size and reduce float amplitude so they read as illustrations, not floaters.

**8. Layout pass on all sections**
- Home (`index.tsx`): verify section paddings (`py-20 md:py-28`), max-width `1200px`, consistent gutter `px-6 lg:px-10`. Fix any overflowing highlight headings by allowing wrap.
- Predict / Dashboard / Performance / History / About: same gutter + section header treatment using the new display font; ensure cards don't bleed on mobile (634px viewport).
- `SectionHeader`: use `font-display` for eyebrow too (smaller, coral).

**Files touched**
- `src/routes/__root.tsx` (remove banner)
- `src/components/Navbar.tsx` (wordmark, hover)
- `src/components/Footer.tsx` (wordmark size)
- `src/components/SectionHeader.tsx`
- `src/styles.css` (font swap, `.hl` rewrite, hover pill utility)
- `src/routes/index.tsx`, `about.tsx`, `dashboard.tsx`, `predict.tsx`, `performance.tsx`, `history.tsx` (layout audit, headings)
- `src/assets/illustrations/*.png` (regenerate, premium, colored)

No backend / api / hook changes.