## Goal

Lock down the entire app behind a `/login` page. Only users with emails on an approved domain list can sign in. Backend stays Flask + your own Postgres. After login, users land on the existing app; without a session every URL bounces to `/login`.

## What you need to provide on the Flask side

This plan assumes Flask exposes (or will expose) these JSON endpoints. We'll wire the frontend to them:

- `POST /auth/login` → `{ access_token }` (already used)
- `POST /auth/register` → `{ access_token }` *(optional — only if you want self-signup)*
- `GET  /auth/me` → `{ id, email, role, full_name }` (called with `Authorization: Bearer <token>`) — used to validate the session on refresh and to know the user's role
- `POST /auth/logout` → 204 *(optional; we can also just drop the token client-side)*
- `POST /auth/forgot-password` → 204
- `POST /auth/reset-password` → 204

The allowlist enforcement (e.g. only `@feu.edu.ph`, `@partner.com`) lives in Flask — both `/auth/login` and `/auth/register` must reject any other email with `403`. The frontend will surface that error nicely, but Flask is the source of truth so it can't be bypassed.

### Postgres schema (reference, for your Flask side)

```text
users (
  id            uuid pk
  email         text unique not null
  password_hash text not null
  role          text not null default 'client'  -- 'developer' | 'client'
  full_name     text
  is_active     boolean default true
  created_at    timestamptz default now()
)
allowed_domains (
  domain text primary key   -- e.g. 'feu.edu.ph'
)
password_resets (
  token_hash text pk, user_id uuid, expires_at timestamptz
)
```

Flask checks `split(email,'@')[1] IN allowed_domains` on register/login.

## Frontend changes (this is what I will build)

### 1. Auth context + route guard

- New `src/lib/auth-context.tsx` — React context exposing `{ user, isAuthenticated, login, logout, register }`. On mount it reads the token from `localStorage`, calls `/auth/me` to validate it, and populates `user`. If `/auth/me` fails, it clears the token.
- Extend `src/lib/auth.ts` with `register`, `me`, `logout`, `forgotPassword`, `resetPassword` helpers (same shape as existing `login`).
- Wire the context into the router via `createRootRouteWithContext<{ auth, queryClient }>()` so route guards can read auth state.

### 2. Pathless `_authenticated` layout — gates everything

- Create `src/routes/_authenticated/route.tsx` with a `beforeLoad` that redirects to `/login?redirect=<current>` whenever `context.auth.isAuthenticated` is false. This is the standard TanStack pattern and prevents the flash-of-protected-content.
- Move every existing protected page under that layout by renaming the route files (TanStack picks them up automatically):

```text
src/routes/index.tsx          → src/routes/_authenticated/index.tsx
src/routes/dashboard.tsx      → src/routes/_authenticated/dashboard.tsx
src/routes/predict.tsx        → src/routes/_authenticated/predict.tsx
src/routes/history.tsx        → src/routes/_authenticated/history.tsx
src/routes/performance.tsx    → src/routes/_authenticated/performance.tsx
src/routes/about.tsx          → src/routes/_authenticated/about.tsx
```

Each file's `createFileRoute("/...")` string updates to `/_authenticated/...`.

Public routes stay at top level: `/login`, `/register`, `/forgot-password`, `/reset-password`. That's it.

Result: an unauthenticated visit to `/`, `/dashboard`, or anything else → instant redirect to `/login`.

### 3. Login page — finish wiring

`src/routes/login.tsx` already calls `login()`. Upgrades:

- Use the auth context instead of calling `login()` directly, so `user` becomes available app-wide right after sign-in.
- Read `?redirect=` from search params and send the user there after success (default `/`).
- If already signed in, `beforeLoad` redirects them out of `/login`.
- Wire the "Forgot password" link to `/forgot-password`, "Sign up" link to `/register`, and remove the Google/Apple social buttons (not part of your Flask backend).
- Surface `403` errors from Flask with a clear "Your email domain is not authorized for this system" message.

### 4. New auxiliary auth pages

- `src/routes/register.tsx` — email/password/full name form, calls `POST /auth/register`, shows the same domain-rejection error if Flask responds 403. (If you want strict invite-only with no self-signup, say the word and I'll skip this page and add a developer-only "Invite user" page under `/_authenticated/admin/users` instead.)
- `src/routes/forgot-password.tsx` — single email field → `POST /auth/forgot-password`.
- `src/routes/reset-password.tsx` — reads token from URL, posts new password to `POST /auth/reset-password`.

### 5. Navbar / Footer

- Hide nav links and the Navbar entirely on `/login`, `/register`, `/forgot-password`, `/reset-password` (so the auth pages stay clean two-column layouts).
- When authenticated, show user email + a Sign out button in the Navbar. Sign out clears the token and navigates to `/login`.

### 6. Environment + CORS

- `VITE_API_URL` points to your Flask host (already supported in `auth.ts`).
- For production / custom domain, this will be set at deploy time. Flask must enable CORS for the custom domain origin and allow the `Authorization` header.

## Custom domain + deploy

- Lovable lets you connect a custom domain after the project is published, under **Project Settings → Domains** (or **Publish → Add custom domain**). Two A records to `185.158.133.1` (root + `www`) plus a TXT record; SSL is auto-provisioned. Full instructions appear in the connect-domain dialog. We don't need code changes for this.
- The gate above is what enforces "no unauthorized logins" on the custom domain — every URL on the domain redirects to `/login` until a valid Flask token is present.

## Out of scope (call out so we agree)

- Implementing the Flask endpoints themselves and the Postgres schema — that lives in your Flask repo, not here. I've spec'd the contract above.
- A user-management admin UI (create/disable users, edit allowed domains) — easy to add later as `/_authenticated/admin/*` routes restricted to `role === 'developer'`. Say the word.
- OAuth (Google/Apple). You chose Flask + Postgres, so social buttons are removed.

## Files I will touch when you approve

Create:
- `src/lib/auth-context.tsx`
- `src/routes/_authenticated/route.tsx`
- `src/routes/register.tsx`
- `src/routes/forgot-password.tsx`
- `src/routes/reset-password.tsx`

Move (rename, content largely unchanged):
- `src/routes/{index,dashboard,predict,history,performance,about}.tsx` → `src/routes/_authenticated/<same>.tsx` with updated `createFileRoute` paths.

Edit:
- `src/lib/auth.ts` (add `me`, `register`, `logout`, `forgotPassword`, `resetPassword`)
- `src/routes/__root.tsx` (auth context provider, hide Navbar/Footer on auth routes, root context typing)
- `src/router.tsx` (inject auth into router context)
- `src/routes/login.tsx` (use context, redirect-back, drop social buttons, link to new pages)
- `src/components/Navbar.tsx` (sign-out + user email when authed)
