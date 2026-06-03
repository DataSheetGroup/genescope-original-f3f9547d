import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import logo from "@/assets/genescope-logo.png";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · GeneScope" },
      { name: "description", content: "Sign in to GeneScope to access the clinical decision-support workspace." },
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
      "GeneScope gave our clinicians a calibrated, explainable second opinion — without ever exposing patient data to the cloud.",
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
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--teal) 35%, var(--ink)) 0%, var(--ink) 55%, color-mix(in oklab, var(--purple) 40%, var(--ink)) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1400px] grid lg:grid-cols-2 gap-10 px-6 sm:px-10 lg:px-16 py-12 lg:py-20 items-center">
        {/* LEFT — form */}
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="font-brand text-2xl tracking-wide text-cream/90 mb-12">
            GeneScope
          </div>

          <h1 className="display-xl uppercase text-cream leading-[0.95]">
            Welcome back
          </h1>
          <p className="mt-4 text-sm md:text-base text-cream/70">
            Please enter your account details to continue.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit} noValidate>

            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting || success}
                placeholder="johndoe@gmail.com"
                className="w-full rounded-full bg-white/5 border border-white/15 px-5 py-3.5 text-cream placeholder:text-cream/35 outline-none transition focus:border-[var(--teal)] focus:bg-white/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={submitting || success}
                  placeholder="••••••••"
                  className="w-full rounded-full bg-white/5 border border-white/15 px-5 py-3.5 pr-12 text-cream placeholder:text-cream/35 outline-none transition focus:border-[var(--teal)] focus:bg-white/10 disabled:opacity-60"
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
              <label className="flex items-center gap-2 text-cream/80 cursor-pointer select-none">
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
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Signed in. Redirecting…</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || success}
              className="w-full rounded-full py-4 font-display tracking-wide uppercase text-base text-cream transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "var(--gradient-brand)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Signing in…" : success ? "Success" : "Sign in"}
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

        {/* RIGHT — logo + testimonial card */}
        <div className="relative">
          <div
            className="relative rounded-[2.5rem] p-10 md:p-14 overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--ink) 88%, transparent), color-mix(in oklab, var(--purple-deep) 80%, transparent))",
              border: "1px solid color-mix(in oklab, var(--teal) 25%, transparent)",
            }}
          >
            {/* Logo block — right side as requested */}
            <div className="flex justify-center mb-8">
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl flex items-center justify-center p-5"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--teal) 30%, transparent), transparent 70%)",
                  border: "1px solid color-mix(in oklab, var(--teal) 30%, transparent)",
                }}
              >
                <img src={logo} alt="GeneScope" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="text-center">
              <div
                className="font-display text-4xl md:text-5xl leading-tight text-cream uppercase"
              >
                What clinicians
                <br />
                are saying.
              </div>

              <p className="mt-8 text-base md:text-lg text-cream/80 leading-relaxed max-w-md mx-auto">
                "{t.quote}"
              </p>

              <div className="mt-8">
                <div className="font-display text-xl text-cream">{t.name}</div>
                <div className="text-sm text-cream/60 mt-1">{t.title}</div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="h-12 w-12 rounded-2xl flex items-center justify-center transition hover:opacity-90"
                  style={{ background: "color-mix(in oklab, var(--teal) 85%, var(--ink))", color: "var(--ink)" }}
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i + 1) % TESTIMONIALS.length)}
                  className="h-12 w-12 rounded-2xl flex items-center justify-center transition hover:opacity-90"
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
                      background: i === idx ? "var(--teal)" : "color-mix(in oklab, var(--cream) 30%, transparent)",
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
