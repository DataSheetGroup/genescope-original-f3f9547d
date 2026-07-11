import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";
import stickerMicroscope from "@/assets/stickers/microscope.png";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions · GeneScope" },
      { name: "description", content: "GeneScope terms and conditions for authorized partner access." },
    ],
  }),
  ssr: false,
  component: TermsPage,
});

const TERMS = [
  "Authorized partners only — keep credentials private.",
  "Predictions are decision aids, not clinical diagnoses.",
  "Use must follow RA 10173 and institutional policies.",
];

function TermsPage() {
  return (
    <div
      className="h-screen w-full grid lg:grid-cols-2 overflow-hidden"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      {/* LEFT — brand slab */}
      <aside
        className="relative hidden lg:flex flex-col p-12 xl:p-14"
        style={{ background: "var(--ink)", color: "var(--cream)" }}
      >
        <img
          src={stickerHelix}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-16 top-16 w-24 opacity-60 animate-float"
          style={{ transform: "rotate(-10deg)", ["--rot" as string]: "-10deg" }}
        />

        <div className="animate-fade-up">
          <Link to="/" className="inline-flex items-center gap-3 w-fit">
            <img src={logo} alt="GeneScope" className="h-9 w-9 object-contain" />
            <span className="font-brand text-2xl">GeneScope</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center my-8 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <div className="eyebrow mb-5 opacity-75">Legal</div>
          <h1 className="display-lg leading-[0.95]">
            Terms &
            <br />
            <span className="hl">Conditions</span>.
          </h1>
          <p className="mt-6 max-w-sm text-base opacity-75 leading-relaxed">
            Short, clear rules for safe and responsible use of the platform.
          </p>
        </div>

        <div className="text-xs opacity-60 animate-fade-up" style={{ animationDelay: "0.16s" }}>
          © 2026 Data Sheet Group · RA 10173-aligned
        </div>
      </aside>

      {/* RIGHT — terms summary */}
      <section className="relative flex flex-col h-full p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden">
        <img
          src={stickerMicroscope}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute right-10 top-10 w-24 opacity-70 sm:right-16 sm:top-12 lg:right-20 lg:top-20 animate-drift"
          style={{ transform: "rotate(8deg)", ["--rot" as string]: "8deg" }}
        />

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg flex-1 flex flex-col justify-center min-h-0">
          {/* mobile brand */}
          <Link to="/" className="lg:hidden mb-6 inline-flex items-center gap-2">
            <img src={logo} alt="GeneScope" className="h-8 w-8 object-contain" />
            <span className="font-brand text-xl">GeneScope</span>
          </Link>

          <div className="lg:hidden mb-6 animate-fade-up">
            <div className="eyebrow mb-3 opacity-60">Legal</div>
            <h2 className="display-md">
              Terms & <span className="hl">Conditions</span>.
            </h2>
          </div>

          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.08s" }}>
            {TERMS.map((text) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-2xl p-4"
                style={{ background: "color-mix(in oklab, var(--ink) 5%, transparent)" }}
              >
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                <p className="text-sm lg:text-base leading-relaxed" style={{ color: "color-mix(in oklab, var(--ink) 80%, transparent)" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/register"
            className="mt-8 lg:mt-10 group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "var(--ink)", color: "var(--cream)" }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to request access
          </Link>
        </div>

        <div className="relative w-full max-w-md mx-auto lg:max-w-lg text-center text-sm animate-fade-up" style={{ animationDelay: "0.16s", color: "color-mix(in oklab, var(--ink) 65%, transparent)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
