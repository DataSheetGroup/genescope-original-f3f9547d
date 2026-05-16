## Goals
1. Make every illustration match the quality of the helix/microscope used in "Stay up to date" and "And your case?" cards (no cropping/trimming, generous padding, full sticker look).
2. Stop illustrations from overlapping text on every page (especially history).
3. Break the symmetry of the hero — both layout and illustration placement — and shrink content so it fits the initial viewport.

## 1. Regenerate illustrations (consistent style)

Re-render all 8 newer assets with a unified prompt so they look like the "helix-doodle / microscope-doodle" reference:
- Same bold deep-green outline (#0F3D2E), flat cream/coral/teal fills, transparent PNG.
- 1024x1024, subject centered, generous ~15% padding on all sides (prevents the "cut/trimmed" look).
- Friendly cartoon sticker, slightly thicker outline, soft rounded corners.

Files to regenerate (same paths, overwrite):
`dna-strand.png`, `test-tube.png`, `clipboard.png`, `pill-capsule.png`, `heart-pulse.png`, `lab-flask.png`, `chromosome.png`, `petri-dish.png`.

## 2. Fix collisions

- **history.tsx**: remove the two floating illustrations on top of the heading/table; move them OUT of overlap. Put one tucked bottom-right of the page (below the table), one as a small inline mark inside the heading block — not absolutely positioned over content. Keep both `hidden lg:block` so mobile is clean.
- **Audit other pages** (`about.tsx`, `dashboard.tsx`, `performance.tsx`, `predict.tsx`, `index.tsx`) for any FloatingIllustration whose absolute position lands over a text container; nudge each into true safe-zones (outside max-w-3xl content column, or only on xl+ screens with `opacity-90 z-0` and confirmed clearance).

## 3. Hero asymmetry + viewport fit (`src/routes/index.tsx`)

Current hero: text dead-center, illustrations mirrored left/right top + left/right bottom, `min-h-[78vh]` plus large `display-xl` clamp → overflow on 634px viewport.

Changes:
- **Layout**: switch from centered single column to an asymmetric 2-column grid on `lg+`: headline + CTAs left-aligned (cols 1-7), a single illustration cluster offset to the right (cols 8-12). On mobile, single column, left-aligned.
- **Illustration placement (asymmetric)**: keep only 2 illustrations in the hero, both on the right side at different sizes/rotations (e.g. large microscope upper-right, smaller dna-strand lower-right offset inward). Remove the 4-corner mirrored setup.
- **Fit initial viewport**: drop `min-h-[78vh]`, tighten paddings (`pt-8 md:pt-14 pb-16 md:pb-24`), shrink `display-xl` clamp to `clamp(2rem, 6vw, 4.75rem)`, reduce body paragraph max-width and margin-top, and reduce CTA top margin. Goal: full hero (eyebrow, headline, paragraph, CTAs) visible within ~600px tall viewport without scroll.
- Headline copy stays the same; alignment becomes left (not center) to support the asymmetric grid.

## Out of scope
No backend, routing, data, or component-API changes. Pure visual + asset work.
