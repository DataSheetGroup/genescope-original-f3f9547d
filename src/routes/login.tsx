import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import {
  AuthSplitShell,
  authInputClass,
  authInputStyle,
  authLabelClass,
  authLabelStyle,
  authSubmitClass,
  authSubmitStyle,
} from "@/components/AuthSplitShell";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · GeneScope" },
      { name: "description", content: "Sign in to GeneScope — restricted clinical decision-support workspace." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      throw redirect({ to: (search as Search).redirect ?? "/" });
    }
  },
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      setSuccess(true);
      const target = search.redirect ?? "/";
      setTimeout(() => navigate({ to: target }), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitShell
      eyebrow="Sign in"
      headline={<>Welcome <span className="hl">back</span>.</>}
      intro="Enter your credentials to continue."
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
            Request access
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div>
          <label htmlFor="email" className={authLabelClass} style={authLabelStyle}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={submitting || success}
            placeholder="you@clinic.org"
            className={authInputClass}
            style={authInputStyle}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider" style={authLabelStyle}>
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold hover:underline underline-offset-4" style={{ color: "var(--ink)" }}>
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting || success}
              placeholder="••••••••"
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

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "color-mix(in oklab, var(--ink) 78%, transparent)" }}>
          <input type="checkbox" className="h-4 w-4 rounded accent-[var(--ink)]" />
          Keep me signed in
        </label>

        <button type="submit" disabled={submitting || success} className={authSubmitClass} style={authSubmitStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Signing in…" : success ? "Success" : "Sign in"}
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
            <span>Signed in. Redirecting…</span>
          </div>
        )}
      </div>
    </AuthSplitShell>
  );
}
