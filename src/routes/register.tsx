import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isAuthenticated } from "@/lib/auth";
import {
  AuthSplitShell,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authLabelStyle,
  authSubmitClass,
  authSubmitStyle,
} from "@/components/AuthSplitShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Request access · GeneScope" },
      { name: "description", content: "Request access to the GeneScope clinical decision-support workspace." },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  ssr: false,
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ email: email.trim(), password, full_name: fullName.trim() || undefined });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitShell
      eyebrow="Request access"
      headline={<>Join the <span className="hl">workspace</span>.</>}
      intro="Only emails on the approved partner-domain allowlist will be granted access."
      brandTagline={<>Precision<br /><span className="hl">partnerships</span><br />start here.</>}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <div>
          <label htmlFor="fullName" className={authLabelClass} style={authLabelStyle}>Full name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting || success}
            placeholder="Dr. Jane Doe"
            className={authInputClass}
            style={authInputStyle}
          />
        </div>
        <div>
          <label htmlFor="email" className={authLabelClass} style={authLabelStyle}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={submitting || success}
            placeholder="you@partner.org"
            className={authInputClass}
            style={authInputStyle}
          />
        </div>
        <div>
          <label htmlFor="password" className={authLabelClass} style={authLabelStyle}>Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={submitting || success}
              placeholder="At least 8 characters"
              className={`${authInputClass} pr-11`}
              style={authInputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[color-mix(in_oklab,var(--ink)_55%,transparent)] hover:text-[var(--ink)]"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting || success} className={authSubmitClass} style={authSubmitStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Creating account…" : success ? "Success" : "Create account"}
          {!submitting && !success && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      <div className="mt-3 min-h-[44px]">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm" style={{ background: "color-mix(in oklab, var(--destructive) 12%, transparent)", color: "var(--destructive)", border: "1px solid color-mix(in oklab, var(--destructive) 35%, transparent)" }}>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm" style={{ background: "color-mix(in oklab, var(--teal) 15%, transparent)", color: "var(--teal-deep)", border: "1px solid color-mix(in oklab, var(--teal) 35%, transparent)" }}>
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Account created. Redirecting…</span>
          </div>
        )}
      </div>
    </AuthSplitShell>
  );
}
