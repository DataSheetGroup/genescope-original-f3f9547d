## Goal

When someone registers with an email that isn't on the `ALLOWED_EMAILS` allowlist, don't reject them. Instead, create a **pending** account you can approve or deny directly in Neon. Approved users can log in; pending/denied users cannot. No changes to the login/register page UI.

## Backend changes

### 1. `backend/models.py` — add a status field to `User`

Add:
```python
status = db.Column(db.String(16), default="active", nullable=False)
# values: "active" | "pending" | "denied"
```

Include `status` in `to_public()` so the frontend knows (optional; used only for a clearer error).

### 2. `backend/auth.py` — change registration + login gates

**`/auth/register`:**
- Remove the `403 "This email is not authorized"` rejection.
- If email is on the allowlist → create user with `status="active"` (current behavior).
- If NOT on allowlist → create user with `status="pending"`, do **not** issue a token, return `202` with a message like `"Your access request has been submitted for review."`

**`/auth/login`:**
- After password check, before issuing token:
  - `status == "pending"` → `403 "Your access request is still pending approval."`
  - `status == "denied"` → `403 "Your access request was denied."`
  - `status == "active"` → proceed normally.
- Keep the existing `is_active` check as-is.

The frontend already surfaces `error` strings from these endpoints in the existing red alert box, so no UI change is needed — the same alert will show "pending approval" / "submitted for review" messages.

### 3. Migration for existing rows

One-time SQL you run in Neon (also documented in `backend/README.md`):
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'active';
```
Existing users stay `active`. `db.create_all()` handles new installs.

## How you approve/deny in Neon

Just run SQL in the Neon console:
```sql
-- see pending requests
SELECT id, email, full_name, created_at FROM users WHERE status = 'pending';

-- approve
UPDATE users SET status = 'active' WHERE email = 'someone@example.com';

-- deny
UPDATE users SET status = 'denied' WHERE email = 'someone@example.com';
```

No admin UI is built in this pass — you asked to manage it from the Neon database directly.

## Out of scope (per your request)

- No changes to `src/routes/login.tsx` or `src/routes/register.tsx` UI/layout.
- No admin dashboard route.
- No email notifications on approval (can add later if you want).

## Files touched

- `backend/models.py` — add `status` column
- `backend/auth.py` — update `/register` and `/login` logic
- `backend/README.md` — document the `ALTER TABLE` and approval SQL
