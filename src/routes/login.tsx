import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";
import stickerPotion from "@/assets/stickers/potion-blue.png";

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
      className="h-screen w-full grid lg:grid-cols-2 overflow-hidden"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      {/* LEFT — brand slab (matches hero-green) */}
      <aside
        className="relative hidden lg:flex flex-col justify-between p-12 xl:p-14 overflow-hidden"
        style={{ background: "var(--ink)", color: "var(--cream)" }}
      >
        {/* One quiet sticker placed in unused space, not on the edge or seam */}
        <img
          src={stickerHelix}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-20 top-20 w-24 opacity-70"
          style={{ transform: "rotate(-10deg)" }}
        />

        <Link to="/" className="relative inline-flex items-center gap-3 w-fit">
          <img src={logo} alt="GeneScope" className="h-9 w-9 object-contain" />
          <span className="font-brand text-2xl">GeneScope</span>
        </Link>

        <div className="relative">
          <div className="eyebrow mb-5 opacity-75">Clinical decision-support</div>
          <h1 className="display-lg leading-[0.95]">
            Decisions
            <br />
            <span className="hl">without</span>
            <br />
            the guesswork.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-80">
            Sign in to access the restricted workspace for authorized partner
            clinicians and developers.
          </p>
        </div>

        <div className="relative text-xs opacity-60">
          © 2026 Data Sheet Group · RA 10173-aligned
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="relative flex flex-col justify-between h-full p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden">
        {/* One quiet sticker placed inside the empty upper area */}
        <img
          src={stickerPotion}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-10 top-10 w-16 opacity-70 sm:right-16 sm:top-12 sm:w-20 lg:right-20 lg:top-20"
          style={{ transform: "rotate(8deg)" }}
        />

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
          {/* mobile brand */}
          <Link to="/" className="lg:hidden mb-6 inline-flex items-center gap-2">
            <img src={logo} alt="GeneScope" className="h-8 w-8 object-contain" />
            <span className="font-brand text-xl">GeneScope</span>
          </Link>

          <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
            Sign in
          </div>
          <h2 className="mt-3 display-md">
            Welcome <span className="hl">back</span>.
          </h2>
          <p className="mt-4 text-sm lg:text-base" style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}>
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 lg:mt-10 space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "color-mix(in oklab, var(--ink) 75%, transparent)" }}>
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
                className="w-full rounded-xl bg-white px-4 py-3.5 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60"
                style={{ border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)" }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "color-mix(in oklab, var(--ink) 75%, transparent)" }}>
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
                  className="w-full rounded-xl bg-white px-4 py-3.5 pr-11 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60"
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

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "color-mix(in oklab, var(--ink) 78%, transparent)" }}>
              <input type="checkbox" className="h-4 w-4 rounded accent-[var(--ink)]" />
              Keep me signed in
            </label>

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

            <button
              type="submit"
              disabled={submitting || success}
              className="group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "var(--ink)", color: "var(--cream)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Signing in…" : success ? "Success" : "Sign in"}
              {!submitting && !success && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </div>

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg pt-6 text-center text-sm" style={{ color: "color-mix(in oklab, var(--ink) 65%, transparent)" }}>
          No account?{" "}
          <Link to="/register" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
            Request access
          </Link>
        </div>
      </section>
    </div>
  );
}
