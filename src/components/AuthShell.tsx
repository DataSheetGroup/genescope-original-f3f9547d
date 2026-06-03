import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/genescope-logo.png";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--teal) 35%, var(--ink)) 0%, var(--ink) 55%, color-mix(in oklab, var(--purple) 40%, var(--ink)) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1400px] grid lg:grid-cols-2 gap-10 px-6 sm:px-10 lg:px-16 py-12 lg:py-20 items-center">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <Link to="/login" className="font-brand text-2xl tracking-wide text-cream/90 mb-12 inline-block">
            GeneScope
          </Link>
          <h1 className="display-xl uppercase text-cream leading-[0.95]">{title}</h1>
          {subtitle && <p className="mt-4 text-sm md:text-base text-cream/70">{subtitle}</p>}
          <div className="mt-10 space-y-6">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-cream/60">{footer}</div>}
        </div>

        <div className="relative hidden lg:block">
          <div
            className="relative rounded-[2.5rem] p-14 overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--ink) 88%, transparent), color-mix(in oklab, var(--purple-deep) 80%, transparent))",
              border: "1px solid color-mix(in oklab, var(--teal) 25%, transparent)",
            }}
          >
            <div className="flex justify-center mb-8">
              <div
                className="w-40 h-40 rounded-3xl flex items-center justify-center p-5"
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
              <div className="font-display text-4xl leading-tight text-cream uppercase">
                Restricted
                <br />
                access portal
              </div>
              <p className="mt-6 text-base text-cream/75 leading-relaxed">
                Access is limited to authorized partner clinicians and the GeneScope development team.
                Unauthorized use is prohibited under RA 10173.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const authInputClass =
  "w-full rounded-full bg-white/5 border border-white/15 px-5 py-3.5 text-cream placeholder:text-cream/35 outline-none transition focus:border-[var(--teal)] focus:bg-white/10 disabled:opacity-60";

export const authLabelClass = "block text-sm font-medium text-cream mb-2";

export const authButtonClass =
  "w-full rounded-full py-4 font-display tracking-wide uppercase text-base text-cream transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";
