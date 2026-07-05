import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { DEMO_EMAIL, DEMO_PASSWORD, isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import logo from "@/assets/genescope-logo.png";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in | GeneScope" },
      {
        name: "description",
        content: "Sign in to GeneScope to access the clinical decision-support workspace.",
      },
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
  component: LoginPage,
});

const TESTIMONIALS = [
  {
    quote:
      "GeneScope gave our clinicians a calibrated, explainable second opinion without ever exposing patient data to the cloud.",
    name: "Dr. A. Reyes",
    title: "Clinical Geneticist",
  },
  {
    quote:
      "Six structured inputs, a probability you can defend, and a knowledge card the team actually reads. That's the workflow we needed.",
    name: "M. Cruz, MSc",
    title: "Genetic Counselor",
  },
  {
    quote:
      "Locally hosted and RA 10173 compliant by design. It fits the realities of Philippine practice today.",
    name: "Data Sheet Group",
    title: "Thesis Research Team",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [idx, setIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = TESTIMONIALS[idx];

  const fillDemoAccount = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

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
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--teal) 35%, var(--ink)) 0%, var(--ink) 55%, color-mix(in oklab, var(--purple) 40%, var(--ink)) 100%)",
      }}
    >
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-20">
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <div className="mb-12 font-brand text-2xl tracking-wide text-cream/90">GeneScope</div>

          <h1 className="display-xl uppercase leading-[0.95] text-cream">Welcome back</h1>
          <p className="mt-4 text-sm text-cream/70 md:text-base">
            Please enter your account details to continue.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-cream">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting || success}
                placeholder={DEMO_EMAIL}
                className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-cream outline-none transition placeholder:text-cream/35 focus:border-[var(--teal)] focus:bg-white/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-cream">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={submitting || success}
                  placeholder="********"
                  className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 pr-12 text-cream outline-none transition placeholder:text-cream/35 focus:border-[var(--teal)] focus:bg-white/10 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/60 hover:text-cream"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer select-none items-center gap-2 text-cream/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/30 bg-white/5 accent-[var(--teal)]"
                />
                Keep me logged in
              </label>
              <Link
                to="/forgot-password"
                className="font-medium underline underline-offset-4"
                style={{ color: "var(--teal)" }}
              >
                Forgot password
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Signed in. Redirecting...</span>
              </div>
            )}

            <div className="rounded-3xl border border-white/15 bg-white/5 p-4 text-sm text-cream/75">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-cream">Demo access</div>
                  <div className="mt-1 text-xs text-cream/60">
                    {DEMO_EMAIL} / {DEMO_PASSWORD}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  disabled={submitting || success}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream transition hover:bg-white/10 disabled:opacity-60"
                >
                  <KeyRound className="h-4 w-4" />
                  Use demo account
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || success}
              className="flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-base uppercase tracking-wide text-cream transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "var(--gradient-brand)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Signing in..." : success ? "Success" : "Sign in"}
            </button>

            <p className="text-center text-sm text-cream/60">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-cream underline underline-offset-4">
                Request access
              </Link>
            </p>

            <p className="text-center text-[11px] text-cream/40">
              Restricted system. Access limited to authorized partner clinicians and developers.
            </p>
          </form>
        </div>

        <div className="relative">
          <div
            className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-14"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--ink) 88%, transparent), color-mix(in oklab, var(--purple-deep) 80%, transparent))",
              border: "1px solid color-mix(in oklab, var(--teal) 25%, transparent)",
            }}
          >
            <div className="mb-8 flex justify-center">
              <div
                className="flex h-32 w-32 items-center justify-center rounded-3xl p-5 md:h-40 md:w-40"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--teal) 30%, transparent), transparent 70%)",
                  border: "1px solid color-mix(in oklab, var(--teal) 30%, transparent)",
                }}
              >
                <img src={logo} alt="GeneScope" className="h-full w-full object-contain" />
              </div>
            </div>

            <div className="text-center">
              <div className="font-display text-4xl uppercase leading-tight text-cream md:text-5xl">
                What clinicians
                <br />
                are saying.
              </div>

              <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-cream/80 md:text-lg">
                "{t.quote}"
              </p>

              <div className="mt-8">
                <div className="font-display text-xl text-cream">{t.name}</div>
                <div className="mt-1 text-sm text-cream/60">{t.title}</div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition hover:opacity-90"
                  style={{
                    background: "color-mix(in oklab, var(--teal) 85%, var(--ink))",
                    color: "var(--ink)",
                  }}
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i + 1) % TESTIMONIALS.length)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition hover:opacity-90"
                  style={{ background: "var(--purple)", color: "var(--cream)" }}
                  aria-label="Next testimonial"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex justify-center gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === idx ? 24 : 6,
                      background:
                        i === idx
                          ? "var(--teal)"
                          : "color-mix(in oklab, var(--cream) 30%, transparent)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
