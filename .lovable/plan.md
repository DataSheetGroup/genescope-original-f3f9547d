
## Restyle GeneScope in the Phamily aesthetic

Keep every feature, route, API integration, and content block from the existing build. Replace the visual layer entirely so GeneScope reads like a Phamily-style editorial site applied to a clinical research project.

### Visual language (matched, not copied)
- **Canvas**: deep forest green `#0F3D2E` as the dominant background; cream `#F5EFE0` as foreground text/cards
- **Accent**: warm coral-pink `#F5B9C9` reserved for primary CTA pills and tiny highlight tags only
- **Secondary accent**: a soft teal `#7FC9B8` (subtle nod to medical, used sparingly for status dots & data)
- **No gradients, no glows, no emojis**, no neon — exactly as you asked
- **Type system**:
  - Display: **Bowlby One SC** (free Google Font, the closest legal match for that thick rounded display look with dot accents). Wordmark "GẸNẸSCÖPẸ" uses combining diacritics, mirroring Phamily's "PHÄMÏLŸ" trick.
  - Body: **Inter** in 400/500
  - Section eyebrows: tracked-out uppercase, small
  - Headings mix weight + style: regular phrase **bold phrase** on the same line
- **Buttons**: full pill (rounded-full), cream background with deep-green text for primary; outlined cream for secondary; coral fill for the single "hero" action on each page
- **Cards**: cream panels on green, sharp 12px radius, hard 2px borders, no shadow — flat editorial
- **Illustrations**: I'll generate a small set of minimal, hand-drawn, cream-on-green line illustrations themed to genetics (DNA helix doodle, microscope sketch, magnifier on a strand, helix-with-checkmark). These will be generated with `imagegen` (transparent PNGs) and placed floating in negative space like Phamily's hands.
- **Motion**: subtle — sections fade-up on enter, illustrations have a slow idle float (CSS keyframes, 6s ease-in-out), pill buttons have a 200ms hover that slightly enlarges and shifts background.

### Tokens (`src/styles.css`)
Replace the current oklch palette with:
- `--background` deep green
- `--foreground` cream
- `--card` cream
- `--card-foreground` deep green
- `--primary` coral pink (pill highlight)
- `--primary-foreground` deep green
- `--accent` cream (outlined buttons)
- `--muted` slightly lighter green for inner panels
- `--warning` keeps amber for the top banner — but tuned to match (mustard) so it doesn't jar
- Add `--font-display` for Bowlby One SC, keep Inter as `--font-sans`
- Add idle-float keyframes + fade-up

### Per-page restyle (no functional changes)

**Global shell** (`__root.tsx`, `Navbar`, `Footer`, `ConfidentialityBanner`):
- Top mustard banner stays slim
- Navbar: centered cream wordmark with decorated chars; nav links left (Home/Predict/Dashboard) and right (Performance/History/About) split around the wordmark on desktop; mobile collapses to hamburger
- Active link gets a small coral underline pill
- Status pill (Model Online / Server Offline) moves to a small cream chip in the right corner
- Footer: oversized green/cream editorial block with FEU + Molave + RA10173 line

**Home** (`index.tsx`):
- Massive hero headline like Phamily's "L'Achat et Vente…" pattern, but our copy:
  > "Genetic Testing Decisions, **without the guesswork.**"
  - Followed by your existing subtitle paragraph
  - Two pill CTAs: coral "Start Prediction", outlined cream "View Dashboard"
  - Two generated floating illustrations (DNA helix doodle top-right, microscope bottom-left), with slow idle float
- "Our mission" 3-column block matching Phamily's 3-icon mission pattern, but with your three pillars: *A confident decision · Streamlined indicators · Local & private*
- Numbered process block ("01 / 02 / 03") for "Enter indicators → Run local model → Interpret result"
- Stats strip pulling from `/eda-data`, presented as oversized cream numerals on green
- CTA band before the footer

**Predict** (`predict.tsx`):
- Left form on a cream card with green labels and pill-shaped Selects (override Shadcn select trigger to rounded-full)
- "Generate Prediction" = coral pill
- Right output stays the same structure (result badge → confidence ring → probability bar → Knowledge Card → feature importance) but restyled with cream cards on green
- The **Result Knowledge Card** becomes the largest, most striking block — coral border, oversized display heading, big quote-mark display character, kept visually dominant per your spec

**Dashboard** (`dashboard.tsx`):
- Cream chart cards on the green canvas, recharts repalette to: deep green / cream / coral / soft teal / mustard
- Section labels in tracked-out uppercase eyebrows
- Same chart inventory, same layout grid

**Performance** (`performance.tsx`):
- Primary Model card becomes a hero block: huge display heading "Binary **Logistic Regression**" with the logit formula in a cream code panel
- Comparison table in cream, model cards as cream panels, confusion matrices using coral/cream intensity instead of teal
- ROC + grouped bar charts repaletted

**History** (`history.tsx`):
- Cream table on green, filter pills, coral "Export CSV" pill
- Badges: cream-outlined for Targeted, coral-filled for Comprehensive (kept distinct without using bright green/blue dots)

**About** (`about.tsx`):
- Two oversized editorial cards on green
- Researcher list as a clean stacked list with display weights

### Generated assets
Use `imagegen` to create 3–4 transparent-PNG illustrations under `src/assets/illustrations/`:
1. `helix-doodle.png` — minimalist cream DNA helix hand-drawn line art, with subtle shadow, on transparent background
2. `microscope-doodle.png` — same style microscope sketch
3. `magnifier-strand.png` — magnifying glass over a DNA strand
4. `helix-check.png` — DNA strand with a checkmark
Each prompted to match a flat, two-color (cream + black outline), cartoon-editorial style — never resembling Phamily's hands.

### Technical notes
- Pure presentation refactor: no changes to `src/lib/api.ts`, `src/hooks/useHistory.ts`, route logic, or Flask integration
- Add Google Font import (Bowlby One SC) at the top of `styles.css`
- Update Recharts color references via CSS variables so dashboard/performance pick up the new palette automatically
- Mobile responsiveness preserved; oversized display headings clamp via `clamp()` so they don't overflow on small screens
- Files touched: `src/styles.css`, `src/routes/__root.tsx`, `src/components/{Navbar,Footer,ConfidentialityBanner,SectionHeader,ChartCard,BackendOfflineNotice}.tsx`, all six route files, plus new `src/assets/illustrations/*.png` and a small `src/components/FloatingIllustration.tsx` helper

### What I will NOT do
- Reproduce Phamily's logo, illustrations, copy, or French text
- Reuse their wordmark with the same diacritic pattern — I'll use a different decoration on "GENESCOPE"
- Pull any asset from their site

### Deliverable checklist
- [ ] Tokens + Bowlby One SC wired
- [ ] Banner / Navbar / Footer restyled (centered wordmark, split nav)
- [ ] Home: editorial hero with floating illustrations, mission row, numbered process, stats band
- [ ] Predict: cream card form + pill selects + dominant Knowledge Card
- [ ] Dashboard: green canvas, cream chart cards, repaletted charts
- [ ] Performance: editorial primary-model hero, repaletted comparisons
- [ ] History: cream editorial table, pill filters
- [ ] About: oversized editorial cards
- [ ] 4 generated illustrations placed and animated
- [ ] Mobile pass with `clamp()` typography
