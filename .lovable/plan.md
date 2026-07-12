
# Admin Approval Queue (SQL-Managed)

You control access directly from Neon. No admin page in the app — you approve, reject, or disable users by running SQL queries against your Neon database.

## How it will work (user's perspective)

1. Visitor hits **Request Access** → fills name, email, password, affiliation, reason.
2. Account is created in Neon with `status = 'pending'`. They see a "Your request is under review" confirmation.
3. Visitor tries to **Log in** while pending → gets a clear message: *"Your account is awaiting approval."*
4. You (in Neon) run one `UPDATE` to approve them → next login works.
5. Rejected or disabled users get *"Your account is not active. Contact the administrator."*

The regular `/login` page still works normally for approved users. The `/register` page will be repurposed to point at Request Access (or removed) so there's no bypass around the queue.

## Database changes (one migration)

Add to `users` table:
- `status` — text, one of `pending | approved | rejected | disabled`, default `pending`
- `affiliation` — text, nullable (from the request form)
- `reason` — text, nullable (why they want access)
- `requested_at` — timestamp, default now()
- `reviewed_at` — timestamp, nullable
- `reviewed_by` — text, nullable (your note to yourself)

Existing users get backfilled to `status = 'approved'` so you don't lock yourself out.

## Backend changes (`backend/`)

- **`models.py`** — add the 5 fields above to the `User` model.
- **`auth.py`**
  - `POST /api/auth/register` → sets `status='pending'`, accepts `affiliation` and `reason`, returns *"Request submitted, pending approval."* Does NOT return a JWT.
  - `POST /api/auth/login` → after password check, gate on `status`:
    - `pending` → 403 *"Awaiting approval"*
    - `rejected` / `disabled` → 403 *"Account not active"*
    - `approved` → issue JWT as normal.
- No new admin endpoints — you manage via SQL.

## Frontend changes

- **`src/routes/register.tsx`** — rename form purpose to "Request Access," add **Affiliation** and **Reason for access** fields, show success screen *"Request submitted — we'll notify you when approved"* instead of auto-login.
- **`src/routes/_authenticated/...`** untouched.
- **`src/lib/api.ts`** — surface the new 403 messages from login so `/login` shows *"Awaiting approval"* cleanly (no adjusting layout — matches your existing error-message pattern).
- If a standalone "Request Access" route already exists, we consolidate so there's one queue-driven entry point and no bypass.

## Your admin cheat-sheet (SQL against Neon)

You'll get a `docs/ADMIN.md` file with copy-paste queries:

```sql
-- See who's waiting
SELECT id, email, affiliation, reason, requested_at
FROM users WHERE status = 'pending' ORDER BY requested_at;

-- Approve someone
UPDATE users
SET status = 'approved', reviewed_at = now(), reviewed_by = 'you'
WHERE email = 'person@example.com';

-- Reject
UPDATE users SET status = 'rejected', reviewed_at = now() WHERE email = '...';

-- Disable an approved user later
UPDATE users SET status = 'disabled' WHERE email = '...';

-- Re-enable
UPDATE users SET status = 'approved' WHERE email = '...';

-- List everyone by status
SELECT email, status, requested_at, reviewed_at FROM users ORDER BY status, requested_at;
```

## Files touched

- `backend/models.py` — add fields
- `backend/auth.py` — register/login logic
- `backend/migrations/` (or a new `add_user_status.sql`) — schema migration + backfill
- `src/routes/register.tsx` — Request Access form
- `src/lib/api.ts` — error message passthrough
- `src/routes/login.tsx` — display pending/disabled messages
- `docs/ADMIN.md` — SQL cheat-sheet (new)

## Out of scope (say the word if you want these later)

- Email notification when approved
- Email allowlist / domain restrictions
- In-app admin dashboard
- Roles (admin vs. user) — not needed since you manage via Neon directly
