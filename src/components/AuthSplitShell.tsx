import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";
import stickerMicroscope from "@/assets/stickers/microscope.png";

type Props = {
  eyebrow: string;
  headline: ReactNode; // supports <span className="hl"> for highlight
  intro: string;
  brandTagline?: ReactNode;
  children: ReactNode; // form
  footer: ReactNode;
};

export function AuthSplitShell({ eyebrow, headline, intro, brandTagline, children, footer }: Props) {
  return (
    <div
      className="h-screen w-full grid lg:grid-cols-2 overflow-hidden"
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
          <div className="eyebrow mb-5 opacity-75">Clinical decision-support</div>
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
          <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-80">
            Restricted workspace for authorized partner clinicians and developers.
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
            {eyebrow}
          </div>
          <h2 className="mt-3 display-md">{headline}</h2>
          <p className="mt-4 text-sm lg:text-base" style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}>
            {intro}
          </p>

          <div className="mt-8 lg:mt-10">{children}</div>
        </div>

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg text-center text-sm" style={{ color: "color-mix(in oklab, var(--ink) 65%, transparent)" }}>
          {footer}
        </div>
      </section>
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl bg-white px-4 py-3.5 text-[var(--ink)] placeholder:text-[color-mix(in_oklab,var(--ink)_35%,transparent)] outline-none transition focus:ring-2 focus:ring-[var(--ink)] disabled:opacity-60";

export const authInputStyle = {
  border: "1.5px solid color-mix(in oklab, var(--ink) 15%, transparent)",
} as const;

export const authLabelClass =
  "block text-xs font-semibold uppercase tracking-wider mb-2";

export const authLabelStyle = {
  color: "color-mix(in oklab, var(--ink) 75%, transparent)",
} as const;

export const authSubmitClass =
  "group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";

export const authSubmitStyle = {
  background: "var(--ink)",
  color: "var(--cream)",
} as const;
