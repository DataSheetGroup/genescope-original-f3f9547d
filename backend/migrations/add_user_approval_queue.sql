-- Admin approval queue migration
-- Run this once against your Neon database.
--
-- psql "$DATABASE_URL" -f backend/migrations/add_user_approval_queue.sql

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status       VARCHAR(16),
  ADD COLUMN IF NOT EXISTS affiliation  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reason       TEXT,
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reviewed_at  TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reviewed_by  VARCHAR(255);

-- Backfill: everyone who already exists is trusted (that's you + your test users).
UPDATE users
   SET status = 'approved'
 WHERE status IS NULL;

UPDATE users
   SET requested_at = COALESCE(created_at, now())
 WHERE requested_at IS NULL;

ALTER TABLE users
  ALTER COLUMN status       SET NOT NULL,
  ALTER COLUMN status       SET DEFAULT 'pending',
  ALTER COLUMN requested_at SET NOT NULL,
  ALTER COLUMN requested_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

COMMIT;
