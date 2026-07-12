## Goal
Use `role` as the single access gate. New accounts get `role = "pending"` by default. Editing the row in Neon to `viewer` / `client` / `developer` grants login access. No more `status` column involved in the decision.

## Backend (`backend/`)

**`auth.py` — `register`:**
- Create user with `role="pending"` (drop the `status="pending"` line).
- Keep the 202 pending response.

**`auth.py` — `login`:**
- Replace all `user.status` checks with a single check:
  - If `user.role == "pending"` → 403 "Your access request is still pending administrator approval."
  - If `user.role == "denied"` → 403 "Your access request was denied…"
  - Allow login for any other role (`viewer`, `client`, `developer`, or future roles).

**`auth.py` — `require_auth`:**
- Same swap: gate on `user.role in {"pending","denied"}` instead of `status`.

**`models.py`:**
- Change `role` default to `"pending"`.
- Leave the `status` column in place (harmless) so existing rows don't break; it's just no longer consulted.

**Token payload:** keep `role` (already there); it will now reflect the pending/granted value.

## Frontend

- `src/lib/auth.ts` / `src/lib/auth-context.tsx` / `_authenticated/route.tsx` / `login.tsx` / `register.tsx`: replace `user.status !== "active"` checks with `user.role === "pending" || user.role === "denied"` → treat as not-approved. Any other role = approved.
- No UI/copy redesign; just the predicate swap.

## How you grant access in Neon
```sql
UPDATE users SET role = 'viewer' WHERE email = 'someone@example.com';
-- or 'client' / 'developer'
```
To revoke: `UPDATE users SET role = 'denied' …` or back to `'pending'`.

## Deployment note
Render backend must be redeployed for the server-side gate to switch from `status` to `role`. Until then, the frontend predicate change alone will block pending users on the client, but the API would still accept the old `status`-based logic.
