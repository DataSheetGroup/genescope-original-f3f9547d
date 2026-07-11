import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import logo from "@/assets/genescope-logo.png";
import stickerFlask from "@/assets/stickers/flask-green.png";
import stickerMicroscope from "@/assets/stickers/microscope.png";

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
      className="relative h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "var(--ink)", color: "var(--cream)" }}
    >
      {/* Top bar — centered logo like phamily */}
      <header className="relative z-10 flex items-center justify-center pt-6 sm:pt-8 shrink-0">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src={logo} alt="GeneScope" className="h-8 w-8 object-contain" />
          <span className="font-brand text-xl sm:text-2xl tracking-wide">GeneScope</span>
        </Link>
      </header>

      {/* Decorative stickers — anchored to outer corners with generous margin,
          hidden on very small screens so they never collide with the card */}
      <img
        src={stickerMicroscope}
        alt=""
        aria-hidden
        className="pointer-events-none select-none hidden md:block absolute w-28 lg:w-40 xl:w-52 opacity-90"
        style={{ left: "3.5rem", bottom: "3rem", transform: "rotate(-8deg)" }}
      />
      <img
        src={stickerFlask}
        alt=""
        aria-hidden
        className="pointer-events-none select-none hidden md:block absolute w-28 lg:w-40 xl:w-52 opacity-90"
        style={{ right: "3.5rem", top: "6rem", transform: "rotate(10deg)" }}
      />

      {/* Center — form card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5">
        <div
          className="w-full max-w-md rounded-3xl p-7 sm:p-9 shadow-2xl"
          style={{
            background: "var(--cream)",
            color: "var(--ink)",
            border: "1px solid color-mix(in oklab, var(--ink) 12%, transparent)",
          }}
        >
          <div className="text-left">
            <div
              className="eyebrow"
              style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}
            >
              Restricted access
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl leading-tight">
              Welcome <span className="hl">back</span>.
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}
            >
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "color-mix(in oklab, var(--ink) 75%, transparent)" }}
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
                className="w-full rounded-xl bg-white px-4 py-3 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60"
                style={{ border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)" }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "color-mix(in oklab, var(--ink) 75%, transparent)" }}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold hover:underline underline-offset-4"
                  style={{ color: "var(--ink)" }}
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
                  className="w-full rounded-xl bg-white px-4 py-3 pr-11 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60"
                  style={{ border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)" }}
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

            <label
              className="flex items-center gap-2 text-sm cursor-pointer select-none"
              style={{ color: "color-mix(in oklab, var(--ink) 78%, transparent)" }}
            >
              <input type="checkbox" className="h-4 w-4 rounded accent-[var(--ink)]" />
              Keep me signed in
            </label>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
                style={{
                  background: "color-mix(in oklab, var(--destructive) 12%, transparent)",
                  color: "var(--destructive)",
                  border: "1px solid color-mix(in oklab, var(--destructive) 35%, transparent)",
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
                  border: "1px solid color-mix(in oklab, var(--teal) 35%, transparent)",
                }}
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Signed in. Redirecting…</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || success}
              className="group w-full rounded-full py-3 font-display uppercase tracking-wider text-xs transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "var(--ink)", color: "var(--cream)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Signing in…" : success ? "Success" : "Sign in"}
              {!submitting && !success && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>

            <div
              className="text-right text-sm"
              style={{ color: "color-mix(in oklab, var(--ink) 65%, transparent)" }}
            >
              No account?{" "}
              <Link
                to="/register"
                className="font-semibold underline underline-offset-4"
                style={{ color: "var(--ink)" }}
              >
                Request access
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Footer note */}
      <footer className="relative z-10 pb-5 text-center text-[11px] opacity-70 shrink-0">
        © 2026 Data Sheet Group · RA 10173-aligned · Authorized personnel only
      </footer>
    </div>
  );
}
