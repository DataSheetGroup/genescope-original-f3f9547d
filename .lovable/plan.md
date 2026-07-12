## Plan

1. **Stop pending registrations from being treated as logged in**
   - Ensure `/register` clears any existing token before creating a new access request.
   - If the backend returns `202 pending`, show the pending message and keep the user on the request-access page instead of redirecting.

2. **Strengthen the auth gate**
   - Update protected-route access so it does not trust only “a token exists”.
   - Use the authenticated user state when available, so a stale/old token cannot immediately open the dashboard after a pending registration.

3. **Block pending/denied users even if they already have an old token**
   - Update the backend auth check used by protected endpoints so `pending` and `denied` users are rejected, not just login/register.
   - This prevents old sessions from continuing after you change a user to pending/denied in Neon.

4. **Clean up outdated allowlist wording**
   - Remove old frontend/backend text that still says “approved partner emails/domain only,” because the new rule is: every account starts pending until approved.

5. **Add clear deployment/database reminder**
   - Keep the code compatible with the current Neon `status` column.
   - After applying, you will still need to redeploy the Flask backend on Render and make sure new rows show `status = 'pending'` in Neon.