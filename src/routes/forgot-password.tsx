import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { forgotPassword } from "@/lib/auth";
import {
  AuthSplitShell,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authLabelStyle,
  authSubmitClass,
  authSubmitStyle,
} from "@/components/AuthSplitShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot password · GeneScope" }],
  }),
  ssr: false,
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
    <AuthSplitShell
      eyebrow="Forgot password"
      headline={<>Reset your <span className="hl">access</span>.</>}
      intro="Enter your account email and we'll send a link to reset your password."
      brandTagline={<>Back to<br /><span className="hl">certainty</span><br />in a click.</>}
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className={authLabelClass} style={authLabelStyle}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={submitting || sent}
            placeholder="you@clinic.org"
            className={authInputClass}
            style={authInputStyle}
          />
        </div>

        <button type="submit" disabled={submitting || sent} className={authSubmitClass} style={authSubmitStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Sending…" : sent ? "Sent" : "Send reset link"}
          {!submitting && !sent && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      <div className="mt-3 min-h-[44px]">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm" style={{ background: "color-mix(in oklab, var(--destructive) 12%, transparent)", color: "var(--destructive)", border: "1px solid color-mix(in oklab, var(--destructive) 35%, transparent)" }}>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {sent && (
          <div role="status" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm" style={{ background: "color-mix(in oklab, var(--teal) 15%, transparent)", color: "var(--teal-deep)", border: "1px solid color-mix(in oklab, var(--teal) 35%, transparent)" }}>
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>If an account exists for that email, a reset link is on its way.</span>
          </div>
        )}
      </div>
    </AuthSplitShell>
  );
}
