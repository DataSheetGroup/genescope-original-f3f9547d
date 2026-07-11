import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { forgotPassword } from "@/lib/auth";

import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";
import stickerMicroscope from "@/assets/stickers/microscope.png";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot password · GeneScope" }],
  }),
  ssr: false,
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)" } as const;
  const inputClass =
    "w-full rounded-xl bg-white px-4 py-3.5 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60";

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
          <div className="eyebrow mb-5 opacity-75">Account recovery</div>
          <h1 className="display-lg leading-[0.95]">
            Forgot
            <br />
            your <span className="hl">password</span>?
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-80">
            We'll send a secure reset link to your registered email.
          </p>
        </div>

        <div className="relative text-xs opacity-60">
          © 2026 Data Sheet Group · RA 10173-aligned
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="relative flex flex-col justify-between h-full p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden">
        <img
          src={stickerMicroscope}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-10 top-10 w-24 opacity-70 sm:right-16 sm:top-12 lg:right-20 lg:top-20"
          style={{ transform: "rotate(8deg)" }}
        />

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
          <Link to="/" className="lg:hidden mb-6 inline-flex items-center gap-2">
            <img src={logo} alt="GeneScope" className="h-8 w-8 object-contain" />
            <span className="font-brand text-xl">GeneScope</span>
          </Link>

          <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
            Reset password
          </div>
          <h2 className="mt-3 display-md">
            Send <span className="hl">reset</span> link.
          </h2>
          <p className="mt-4 text-sm lg:text-base" style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}>
            Enter your account email.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 lg:mt-10 space-y-5">
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
                disabled={submitting || sent}
                placeholder="you@partner.org"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || sent}
              className="group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "var(--ink)", color: "var(--cream)" }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Sending…" : sent ? "Sent" : "Send reset link"}
              {!submitting && !sent && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-5 min-h-[58px]">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm animate-in fade-in duration-200" style={{ background: "color-mix(in oklab, var(--destructive) 12%, transparent)", color: "var(--destructive)", border: "1px solid color-mix(in oklab, var(--destructive) 35%, transparent)" }}>
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {sent && (
              <div role="status" className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm animate-in fade-in duration-200" style={{ background: "color-mix(in oklab, var(--teal) 15%, transparent)", color: "var(--teal-deep)", border: "1px solid color-mix(in oklab, var(--teal) 35%, transparent)" }}>
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>If that email exists, a reset link is on its way.</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg text-center text-sm" style={{ color: "color-mix(in oklab, var(--ink) 65%, transparent)" }}>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
            Back to sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
