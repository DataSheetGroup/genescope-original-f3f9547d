import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import logo from "@/assets/genescope-logo.png";
import helix from "@/assets/illustrations/helix-doodle.png";
import microscope from "@/assets/illustrations/microscope-doodle.png";
import dnaStrand from "@/assets/illustrations/dna-strand.png";
import testTube from "@/assets/illustrations/test-tube.png";
import labFlask from "@/assets/illustrations/lab-flask.png";
import dropper from "@/assets/illustrations/dropper.png";

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
    <div
      className="hero-green relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ borderRadius: 0 }}
    >
      {/* ────── scattered stickers, exactly like the home hero ────── */}
      <img src={helix} alt="" aria-hidden className="hidden md:block absolute -top-6 -left-6 w-40 opacity-90 animate-drift" style={{ ["--rot" as never]: "-14deg" }} />
      <img src={microscope} alt="" aria-hidden className="hidden md:block absolute top-10 right-10 w-32 opacity-90 animate-float" style={{ ["--rot" as never]: "10deg" }} />
      <img src={dnaStrand} alt="" aria-hidden className="hidden md:block absolute bottom-16 left-12 w-28 opacity-90 animate-float" style={{ ["--rot" as never]: "-8deg" }} />
      <img src={testTube} alt="" aria-hidden className="hidden md:block absolute bottom-24 right-24 w-20 opacity-90 animate-drift" style={{ ["--rot" as never]: "14deg" }} />
      <img src={labFlask} alt="" aria-hidden className="hidden lg:block absolute top-1/2 -left-4 w-24 opacity-80 animate-drift" style={{ ["--rot" as never]: "18deg" }} />
      <img src={dropper} alt="" aria-hidden className="hidden lg:block absolute top-1/3 right-4 w-16 opacity-80 animate-float" style={{ ["--rot" as never]: "-12deg" }} />

      {/* ────── minimal top bar ────── */}
      <header className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-6 md:pt-8 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={logo} alt="GeneScope" className="h-8 w-8 object-contain" />
          <span className="font-brand text-xl">GeneScope</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/70 hidden sm:inline">
          Restricted access
        </span>
      </header>

      {/* ────── centered card ────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-5">
            <div className="font-display text-xs md:text-sm mb-3">
              A confident clinical decision
            </div>
            <h1 className="display-md uppercase leading-[1]">
              Welcome <span className="hl">back</span>
            </h1>
          </div>

          <div
            className="rounded-[2rem] bg-white p-7 md:p-9"
            style={{ boxShadow: "0 30px 80px -30px rgba(0,0,0,0.45)" }}
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5"
                  style={{ color: "var(--green-deep)", opacity: 0.75 }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={submitting || success}
                  placeholder="you@clinic.org"
                  className="w-full rounded-xl bg-[var(--cream)] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[var(--green-deep)] disabled:opacity-60"
                  style={{
                    color: "var(--green-deep)",
                    border: "1.5px solid color-mix(in oklab, var(--green-deep) 14%, transparent)",
                  }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--green-deep)", opacity: 0.75 }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold hover:underline underline-offset-4"
                    style={{ color: "var(--coral)" }}
                  >
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
                    className="w-full rounded-xl bg-[var(--cream)] px-4 py-3 pr-11 outline-none transition focus:ring-2 focus:ring-[var(--green-deep)] disabled:opacity-60"
                    style={{
                      color: "var(--green-deep)",
                      border: "1.5px solid color-mix(in oklab, var(--green-deep) 14%, transparent)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "color-mix(in oklab, var(--green-deep) 55%, transparent)" }}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label
                className="flex items-center gap-2 text-sm cursor-pointer select-none"
                style={{ color: "var(--green-deep)", opacity: 0.78 }}
              >
                <input type="checkbox" className="h-4 w-4 rounded accent-[var(--green-deep)]" />
                Keep me signed in
              </label>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
                  style={{
                    background: "color-mix(in oklab, var(--destructive) 10%, transparent)",
                    color: "var(--destructive)",
                    border: "1px solid color-mix(in oklab, var(--destructive) 30%, transparent)",
                  }}
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
                  style={{
                    background: "color-mix(in oklab, var(--teal) 15%, transparent)",
                    color: "var(--teal-deep)",
                    border: "1px solid color-mix(in oklab, var(--teal) 30%, transparent)",
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Signed in. Redirecting…</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || success}
                className="pill pill-coral w-full justify-center"
                style={{ padding: "0.95rem 1.5rem" }}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Signing in…" : success ? "Success" : "Sign in"}
              </button>

              <div className="text-center text-sm pt-1" style={{ color: "var(--green-deep)", opacity: 0.7 }}>
                No account?{" "}
                <Link
                  to="/register"
                  className="font-semibold underline underline-offset-4"
                  style={{ color: "var(--green-deep)" }}
                >
                  Request access
                </Link>
              </div>
            </form>
          </div>

          <p className="mt-5 text-center text-[11px] text-cream/60">
            © 2026 Data Sheet Group · Authorized clinicians and developers only
          </p>
        </div>
      </main>
    </div>
  );
}
