import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";


type Props = {
  eyebrow: string;
  headline: ReactNode; // supports <span className="hl"> for highlight
  intro: string;
  brandTagline?: ReactNode;
  brandNote?: ReactNode; // extra text below the tagline on the left slab
  showBackHome?: boolean;
  children: ReactNode; // form
  footer: ReactNode;
};

export function AuthSplitShell({ eyebrow, headline, intro, brandTagline, brandNote, showBackHome = true, children, footer }: Props) {

  return (
    <div
      className="min-h-dvh w-full md:grid md:h-dvh md:grid-cols-2 md:overflow-hidden"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      {/* LEFT — brand slab */}
      <aside
        className="relative hidden h-full overflow-hidden p-8 md:grid md:grid-rows-[auto_minmax(0,1fr)_auto] xl:p-14"
        style={{ background: "var(--ink)", color: "var(--cream)" }}
      >
        <img
          src={stickerHelix}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-10 top-10 w-18 opacity-65 xl:right-14 xl:top-14 xl:w-24"
          style={{ transform: "rotate(-10deg)" }}
        />

        <Link to="/" className="relative inline-flex items-center gap-3 w-fit">
          <img src={logo} alt="GeneScope" className="h-9 w-9 object-contain" />
          <span className="font-brand text-2xl">GeneScope</span>
        </Link>

        <div className="relative self-center py-5">
          <div className="eyebrow mb-4 opacity-75">Clinical decision-support</div>
          <h1 className="display-lg leading-[0.95]">
            {brandTagline ?? (
              <>
                Decisions
                <br />
                <span className="hl">without</span>
                <br />
                the guesswork.
              </>
            )}
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed opacity-80">
            {brandNote ?? "Restricted workspace for authorized partner clinicians and developers."}
          </p>

        </div>

        <div className="relative text-xs leading-none opacity-60">
          © 2026 Data Sheet Group · RA 10173-aligned
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="relative flex min-h-dvh flex-col md:h-dvh md:min-h-0 md:grid md:grid-rows-[auto_minmax(0,1fr)_auto] md:overflow-hidden md:p-8 xl:p-14">


        {/* Top bar — back link so users can leave auth pages */}
        <div className="relative mx-auto flex w-full max-w-md items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8 md:max-w-lg md:px-0 md:pt-0">
          {showBackHome ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition hover:opacity-70"
              style={{ color: "color-mix(in oklab, var(--ink) 70%, transparent)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
          ) : (
            <span className="hidden md:block" aria-hidden="true" />
          )}
          <Link to="/" className="inline-flex items-center gap-2 md:hidden">
            <img src={logo} alt="GeneScope" className="h-7 w-7 object-contain" />
            <span className="font-brand text-lg">GeneScope</span>
          </Link>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-3 pt-4 sm:px-10 md:min-h-0 md:max-w-lg md:px-0 md:py-4">
          <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
            {eyebrow}
          </div>
          <h2 className="mt-2 display-md">{headline}</h2>
          <p className="mt-2 text-sm" style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}>
            {intro}
          </p>

          <div className="mt-4 lg:mt-5">{children}</div>
        </div>

        <div className="relative mx-auto w-full max-w-md px-6 pb-5 text-center text-xs leading-none sm:px-10 sm:pb-6 md:max-w-lg md:px-0 md:pb-0" style={{ color: "color-mix(in oklab, var(--ink) 65%, transparent)" }}>
          {footer}
        </div>

      </section>
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl bg-white px-4 py-2.5 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60";

export const authInputStyle = {
  border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)",
} as const;

export const authLabelClass =
  "block text-xs font-semibold uppercase tracking-wider mb-1.5";

export const authLabelStyle = {
  color: "color-mix(in oklab, var(--ink) 75%, transparent)",
} as const;

export const authSubmitClass =
  "group w-full rounded-full py-3 font-display uppercase tracking-wider text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";

export const authSubmitStyle = {
  background: "var(--ink)",
  color: "var(--cream)",
} as const;
