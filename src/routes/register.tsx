import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isAuthenticated } from "@/lib/auth";

import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";
import stickerMicroscope from "@/assets/stickers/microscope.png";

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

  const inputStyle = { border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)" } as const;
  const inputClass =
    "w-full rounded-xl bg-white px-4 py-3.5 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60 [@media(max-height:700px)]:py-2.5";
  const labelStyle = { color: "color-mix(in oklab, var(--ink) 75%, transparent)" } as const;
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-2 [@media(max-height:700px)]:mb-1";

  return (
    <div
      className="h-screen w-full grid lg:grid-cols-2 overflow-hidden animate-in fade-in duration-300"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      {/* LEFT — brand slab */}
      <aside
        className="relative hidden lg:flex flex-col justify-between p-12 xl:p-14 overflow-hidden"
        style={{ background: "var(--ink)", color: "var(--cream)" }}
      >
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
          <div className="eyebrow mb-5 opacity-75">Partner onboarding</div>
          <h1 className="display-lg leading-[0.95]">
            Join the
            <br />
            <span className="hl">restricted</span>
            <br />
            workspace.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-80">
            Request access using your approved partner-domain email.
          </p>
        </div>

        <div className="relative text-xs opacity-60">
          © 2026 Data Sheet Group · RA 10173-aligned
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="relative flex flex-col justify-between h-full p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden [@media(max-height:700px)]:p-5 sm:[@media(max-height:700px)]:p-7 lg:[@media(max-height:700px)]:p-10">
        <img
          src={stickerMicroscope}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-10 top-10 w-24 opacity-70 sm:right-16 sm:top-12 lg:right-20 lg:top-20"
          style={{ transform: "rotate(8deg)" }}
        />

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
          <Link to="/" className="lg:hidden mb-6 inline-flex items-center gap-2 [@media(max-height:700px)]:mb-4">
            <img src={logo} alt="GeneScope" className="h-8 w-8 object-contain" />
            <span className="font-brand text-xl">GeneScope</span>
          </Link>

          <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
            Request access
          </div>
          <h2 className="mt-3 display-md">
            Create <span className="hl">account</span>.
          </h2>
          <p className="mt-4 text-sm lg:text-base [@media(max-height:700px)]:mt-2" style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}>
            Approved partner emails only.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 lg:mt-10 space-y-5 [@media(max-height:700px)]:mt-5 [@media(max-height:700px)]:space-y-3">
            <div>
              <label htmlFor="fullName" className={labelClass} style={labelStyle}>Full name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting || success}
                placeholder="Dr. Jane Doe"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass} style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting || success}
                placeholder="you@partner.org"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass} style={labelStyle}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting || success}
                placeholder="At least 8 characters"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || success}
              className="group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 [@media(max-height:700px)]:py-3"
              style={{ background: "var(--ink)", color: "var(--cream)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating…" : success ? "Success" : "Create account"}
              {!submitting && !success && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-5 min-h-[58px] [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:min-h-12">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm animate-in fade-in duration-200" style={{ background: "color-mix(in oklab, var(--destructive) 12%, transparent)", color: "var(--destructive)", border: "1px solid color-mix(in oklab, var(--destructive) 35%, transparent)" }}>
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div role="status" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm animate-in fade-in duration-200" style={{ background: "color-mix(in oklab, var(--teal) 15%, transparent)", color: "var(--teal-deep)", border: "1px solid color-mix(in oklab, var(--teal) 35%, transparent)" }}>
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Account created. Redirecting…</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg text-center text-sm" style={{ color: "color-mix(in oklab, var(--ink) 65%, transparent)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
