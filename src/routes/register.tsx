import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isAuthenticated } from "@/lib/auth";

import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";
import stickerMicroscope from "@/assets/stickers/microscope.png";

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrors({});

    const next: FieldErrors = {};
    if (!email.trim()) next.email = "Please enter your email.";
    if (!password) next.password = "Please enter a password.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (password && password !== confirmPassword) next.confirmPassword = "Passwords do not match.";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      await register({ email: email.trim(), password, full_name: fullName.trim() || undefined });
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 400);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Registration failed." });
      setSubmitting(false);
    }
  };

  const inputStyle = { border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)" } as const;
  const inputClass =
    "w-full rounded-xl bg-white px-4 py-3.5 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60 [@media(max-height:700px)]:py-2";
  const labelStyle = { color: "color-mix(in oklab, var(--ink) 75%, transparent)" } as const;
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-2 [@media(max-height:700px)]:mb-0.5";

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
      <section className="relative flex flex-col h-full p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden [@media(max-height:700px)]:p-5 sm:[@media(max-height:700px)]:px-7 sm:[@media(max-height:700px)]:py-5 lg:[@media(max-height:700px)]:px-10 lg:[@media(max-height:700px)]:py-5">
        <img
          src={stickerMicroscope}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-10 top-10 w-24 opacity-70 sm:right-16 sm:top-12 lg:right-20 lg:top-20"
          style={{ transform: "rotate(8deg)" }}
        />

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg flex-1 flex flex-col justify-center min-h-0">
          <Link to="/" className="lg:hidden mb-6 inline-flex items-center gap-2 [@media(max-height:700px)]:mb-4">
            <img src={logo} alt="GeneScope" className="h-8 w-8 object-contain" />
            <span className="font-brand text-xl">GeneScope</span>
          </Link>

          <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
            Request access
          </div>
          <h2 className="mt-3 display-md [@media(max-height:700px)]:mt-2">
            Create <span className="hl">account</span>.
          </h2>
          <p className="mt-4 text-sm lg:text-base [@media(max-height:700px)]:mt-1" style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}>
            Approved partner emails only.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 lg:mt-10 space-y-4 [@media(max-height:700px)]:mt-5 [@media(max-height:700px)]:space-y-2">
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
                className={`${inputClass} ${errors.email || errors.general ? "border-[var(--destructive)] focus:ring-[var(--destructive)]" : ""}`}
                style={{ ...inputStyle, border: errors.email || errors.general ? "1.5px solid var(--destructive)" : inputStyle.border }}
              />
              {(errors.email || errors.general) && (
                <div className="mt-1 text-xs [@media(max-height:700px)]:text-[11px]" style={{ color: "var(--destructive)" }}>
                  {errors.email || errors.general}
                </div>
              )}
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
                className={`${inputClass} ${errors.password ? "border-[var(--destructive)] focus:ring-[var(--destructive)]" : ""}`}
                style={{ ...inputStyle, border: errors.password ? "1.5px solid var(--destructive)" : inputStyle.border }}
              />
              {errors.password && (
                <div className="mt-1 text-xs [@media(max-height:700px)]:text-[11px]" style={{ color: "var(--destructive)" }}>
                  {errors.password}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass} style={labelStyle}>Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting || success}
                placeholder="Re-enter your password"
                className={`${inputClass} ${errors.confirmPassword ? "border-[var(--destructive)] focus:ring-[var(--destructive)]" : ""}`}
                style={{ ...inputStyle, border: errors.confirmPassword ? "1.5px solid var(--destructive)" : inputStyle.border }}
              />
              {errors.confirmPassword && (
                <div className="mt-1 text-xs [@media(max-height:700px)]:text-[11px]" style={{ color: "var(--destructive)" }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || success}
              className="group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 [@media(max-height:700px)]:py-2.5"
              style={{ background: "var(--ink)", color: "var(--cream)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating…" : success ? "Success" : "Create account"}
              {!submitting && !success && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
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
