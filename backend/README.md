# Genescope Flask Backend

Flask + PostgreSQL + JWT auth for the Genescope frontend.

## 1. Prerequisites

- Python 3.11+
- PostgreSQL 14+ running locally (or a hosted Postgres URL)

## 2. Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env       # Windows: copy .env.example .env
# then edit .env and set DATABASE_URL, JWT_SECRET, ALLOWED_EMAILS, CORS_ORIGINS
```

## 3. Create the database

Open psql (or pgAdmin) and run once:

```sql
CREATE DATABASE genescope;
```

Then create the tables:

```bash
python -c "from app import create_app; from models import db; app=create_app(); ctx=app.app_context(); ctx.push(); db.create_all(); print('tables created')"
```

## 4. Create your first developer account

```bash
python seed_admin.py you@datasheetgroup.com YourStrongPassword "Your Name"
```

## 5. Run the server

```bash
python app.py
```

Server runs on `http://localhost:5000`.

## 6. Connect the frontend

In the project root, create a `.env` file:

```
VITE_API_URL=http://localhost:5000
```

Then start the frontend as usual:

```bash
bun run dev
```

## Endpoints

| Method | Path                   | Auth | Purpose                     |
|--------|------------------------|------|-----------------------------|
| POST   | /auth/register         | no   | Create account (allowlist)  |
| POST   | /auth/login            | no   | Get JWT                     |
| GET    | /auth/me               | yes  | Current user                |
| POST   | /auth/logout           | yes  | Client-side token discard   |
| POST   | /auth/forgot-password  | no   | Request reset token         |
| POST   | /auth/reset-password   | no   | Set new password with token |
| POST   | /predict               | yes  | Run prediction              |
| GET    | /health                | no   | Health check                |

## Deploying to your custom domain

- Host on Render / Railway / Fly.io / a VPS with gunicorn behind nginx:
  `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
- Point `api.yourdomain.com` at the backend.
- Point `yourdomain.com` at the frontend (Lovable publish or your host).
- In `.env` on the server, set `CORS_ORIGINS=https://yourdomain.com`.
- In the frontend `.env`, set `VITE_API_URL=https://api.yourdomain.com`.
