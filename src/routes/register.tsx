import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import helixCheck from "@/assets/illustrations/helix-check.png";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }
    setSubmitting(true);
    try {
      await register({ email: email.trim(), password });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col justify-center mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-10 py-12 space-y-8 z-10">
        <div className="max-w-3xl">
          <div className="eyebrow text-coral mb-3">Partner onboarding</div>
          <h1 className="display-lg">
            Request
            <br />
            <span className="hl">access.</span>
          </h1>
        </div>

        <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
          <img
            src={helixCheck}
            alt=""
            aria-hidden
            className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90"
          />
          <div className="eyebrow text-coral mb-2">Account</div>
          <h2 className="font-display text-3xl mb-6">
            Create <span className="hl">workspace.</span>
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-xl">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-2 text-card-foreground/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting || success}
                placeholder="you@partner.org"
                className="w-full rounded-xl bg-cream-dim px-4 py-3.5 text-card-foreground placeholder:text-card-foreground/40 outline-none transition focus:ring-2 focus:ring-ink disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-2 text-card-foreground/70">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={submitting || success}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl bg-cream-dim px-4 py-3.5 pr-11 text-card-foreground placeholder:text-card-foreground/40 outline-none transition focus:ring-2 focus:ring-ink disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-card-foreground/60 hover:text-card-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer select-none text-card-foreground/80">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={submitting || success}
                className="mt-0.5 h-4 w-4 rounded accent-ink shrink-0"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="font-semibold hover:underline underline-offset-4 text-card-foreground">
                  Terms and Conditions
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || success}
              className="group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-ink text-cream"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating…" : success ? "Success" : "Create account"}
              {!submitting && !success && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-5 min-h-[58px] max-w-xl">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm bg-destructive/10 text-destructive border border-destructive/30">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div role="status" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm bg-success/15 text-success-foreground border border-success/30">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Account created. Redirecting…</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline underline-offset-4 text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
