import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from "@/components/AuthShell";
import { resetPassword } from "@/lib/auth";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset password · GeneScope" }],
  }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!token) {
      setError("Missing or invalid reset token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reset password.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Set new password"
      subtitle="Choose a strong password to finish resetting your account."
      footer={
        <Link to="/login" className="font-medium text-cream underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div>
          <label className={authLabelClass}>New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting || done}
            placeholder="At least 8 characters"
            className={authInputClass}
          />
        </div>
        <div>
          <label className={authLabelClass}>Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={submitting || done}
            placeholder="Re-enter password"
            className={authInputClass}
          />
        </div>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {done && (
          <div role="status" className="flex items-start gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Password updated. Redirecting to sign in…</span>
          </div>
        )}
        <button type="submit" disabled={submitting || done} className={authButtonClass} style={{ background: "var(--gradient-brand)" }}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Updating…" : done ? "Updated" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
