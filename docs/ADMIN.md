# Admin cheat-sheet — GeneScope

You approve or block users by running SQL directly against your Neon
database. There is no in-app admin UI (intentional — the database is your
control surface).

## 0. One-time migration

Run this **once** after pulling these changes:

```bash
psql "$DATABASE_URL" -f backend/migrations/add_user_approval_queue.sql
```

Existing users are auto-marked `approved` so you don't lock yourself out.
New sign-ups from that point on land as `pending`.

## 1. How access works

Every user row has a `status` column:

| status     | Can log in? | Meaning                                          |
| ---------- | ----------- | ------------------------------------------------ |
| `pending`  | No          | Requested access, waiting on you                 |
| `approved` | Yes         | You approved them                                |
| `rejected` | No          | You said no                                      |
| `disabled` | No          | Was approved, later revoked                      |

The login endpoint returns a clear error message to the user for each
non-approved state.

## 2. Daily SQL

Open the Neon SQL editor (or `psql "$DATABASE_URL"`) and use these:

### See who's waiting
```sql
SELECT id, email, full_name, affiliation, reason, requested_at
FROM   users
WHERE  status = 'pending'
ORDER  BY requested_at;
```

### Approve someone
```sql
UPDATE users
SET    status = 'approved',
       reviewed_at = now(),
       reviewed_by = 'admin'
WHERE  email = 'person@example.com';
```

### Reject
```sql
UPDATE users
SET    status = 'rejected',
       reviewed_at = now(),
       reviewed_by = 'admin'
WHERE  email = 'person@example.com';
```

### Disable an approved user later
```sql
UPDATE users SET status = 'disabled' WHERE email = 'person@example.com';
```

### Re-enable
```sql
UPDATE users SET status = 'approved' WHERE email = 'person@example.com';
```

### List everyone by status
```sql
SELECT email, status, requested_at, reviewed_at
FROM   users
ORDER  BY status, requested_at DESC;
```

### Delete an account entirely
```sql
DELETE FROM users WHERE email = 'person@example.com';
```

## 3. Notes

- You can register with **any** email — nobody gets in until you flip their
  `status` to `approved`. That's the whole gate.
- Wrong-email registrations are harmless: they sit in `pending` and can be
  rejected or deleted with one query.
- If you ever want an email allowlist on top of this, add a check in
  `backend/auth.py :: register()` before the insert.
