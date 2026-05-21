## 1. Fix diagonal x-axis labels

In `src/routes/dashboard.tsx` (line 471, the **Disease Category × Test Type** chart), the XAxis is `angle={-15}` with `height={80}`. The labels (Pediatrics, Neurology, Others, Metabolic) are short enough to sit horizontally.

Change to: `angle={0}`, `textAnchor="middle"`, `height={40}`.

## 2. Add a proper "Pioneers" section on the home page

Not a small eyebrow tag — a real, dedicated section so the claim reads with weight.

**Placement:** new section inserted between the green hero and the cream MISSION section in `src/routes/index.tsx` (after line 72, before line 74). It will sit on its own band so it feels intentional, not tacked on.

**Treatment:**
- Full-width band using the existing cream/teal palette (matches the surrounding sections, no new tokens)
- Centered layout, max-width ~960px
- Small uppercase eyebrow: **PIONEERING RESEARCH**
- Large display headline using existing `display-lg uppercase` class:
  > **The first locally-built decision-support system for genetic testing in the Philippines.**
  with `<span class="hl">first</span>` highlight for emphasis
- Supporting paragraph (~2 lines):
  > "GeneScope is pioneering work at the intersection of clinical genetics and machine learning in the Philippine setting — built locally, validated locally, and designed to keep patient data on the workstation where it belongs."
- Three small credibility chips/stats in a row underneath (using existing pill styling), e.g.:
  - **First of its kind** · PH-built genetic testing DSS
  - **Locally trained** · on Philippine clinical indicators
  - **RA 10173 by design** · nothing leaves the machine

This matches the visual rhythm of the existing landing page (eyebrow → display headline → supporting copy → chips/CTAs) and gives the "pioneers" claim the prominence the user asked for, rather than burying it as a note.

## Technical details
- Files touched: `src/routes/index.tsx`, `src/routes/dashboard.tsx`
- No new dependencies, no new design tokens — reuses `display-lg`, `hl`, `pill`, `slab-cream`/`hero-green`-style classes already in the project
