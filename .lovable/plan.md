## Goal

Panelists want the system to visibly show it is processing in real time. Right now a user fills 6 dropdowns, clicks Generate, waits ~1s, and a static result appears — nothing on screen communicates "the model is working right now." We'll make prediction feel alive by (a) auto-running the prediction as inputs change and (b) adding visible real-time activity cues around the result.

## What changes

### 1. Auto-predict as inputs change (`src/routes/_authenticated/predict.tsx`)
- When all 6 fields are filled, trigger `postPredict` automatically (debounced ~350ms).
- Changing any field after that immediately re-runs → panelists see the result update in real time.
- Keep the **Generate Prediction** button as a manual re-run trigger (some users want the click).
- Every request bumps a `runId` counter shown as `Run #007` next to the result — makes it obvious the model just ran again.

### 2. Live processing indicators
- **Activity pulse dot** near "Your Result" that pulses cyan while a request is in-flight, green when complete, coral on error.
- Replace static "Running model on local server…" with a **live status line** that cycles through real steps as they happen:
  - "Encoding indicators…" → "Sending to model…" → "Computing probabilities…" → "Done in 428ms"
- Show the actual round-trip time (measured client-side) after each run — proves the model really ran.

### 3. Animated result values
- Confidence % **counts up** from 0 → final value over ~600ms (using `requestAnimationFrame`) instead of snapping in.
- Probability bar widths animate from 0 → target on every new prediction (already partly there, but reset properly per run).
- Confidence ring stroke animates on each new run.

### 4. "Live" badge in the header of the result card
- Small pill: `● LIVE` (pulsing green dot) that stays visible whenever auto-predict is active — signals to panelists that this panel is reactive, not static.

### 5. Backend timing (`backend/predict.py`)
- Include `elapsed_ms` in the JSON response so the frontend can display real server-side compute time (e.g. "Model computed in 12ms").

## Technical notes

- Debounce via a simple `setTimeout` in a `useEffect` watching the form.
- Cancel stale requests with `AbortController` so the last-typed value wins.
- Count-up uses `requestAnimationFrame` with `easeOutCubic`.
- No new dependencies.

## Out of scope

- WebSockets / true server-push (not needed — model runs in ~20ms server-side, HTTP is already "real-time" enough).
- Changing the prediction logic or model.
- Layout redesign of the predict page.

## Files touched

- `src/routes/_authenticated/predict.tsx` — auto-run, count-up, status line, LIVE badge, run counter
- `backend/predict.py` — add `elapsed_ms` to response
- `src/lib/api-types.ts` — add optional `elapsed_ms` field
- `src/lib/api.ts` — pass `elapsed_ms` through, measure round-trip

After approval I'll implement and you can demo it live to panelists on genescope.online.
