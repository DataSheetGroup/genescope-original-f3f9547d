import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from "@/components/AuthShell";
import { forgotPassword } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot password · GeneScope" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your account email and we'll send you a link to reset your password."
      footer={
        <Link to="/login" className="font-medium text-cream underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div>
          <label className={authLabelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={submitting || sent}
            placeholder="you@partner.org"
            className={authInputClass}
          />
        </div>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {sent && (
          <div role="status" className="flex items-start gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>If an account exists for that email, a reset link is on its way.</span>
          </div>
        )}
        <button type="submit" disabled={submitting || sent} className={authButtonClass} style={{ background: "var(--gradient-brand)" }}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Sending…" : sent ? "Sent" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
