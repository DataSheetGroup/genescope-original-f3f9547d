import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, FileText, Lock, UserCheck } from "lucide-react";

import logo from "@/assets/genescope-logo.png";
import stickerHelix from "@/assets/stickers/molecule.png";
import stickerPotion from "@/assets/stickers/potion-blue.png";

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
  {
    icon: ShieldCheck,
    title: "Authorized use only",
    text: "GeneScope is a restricted clinical decision-support workspace. Access is limited to approved partner clinicians, researchers, and developers.",
  },
  {
    icon: Lock,
    title: "Data responsibility",
    text: "Users must keep credentials private and report suspected unauthorized access immediately. Do not share accounts or export patient-identifiable data.",
  },
  {
    icon: FileText,
    title: "Decision-support, not diagnosis",
    text: "Predictions are statistical aids. Final clinical decisions remain the responsibility of licensed healthcare providers and supervising institutions.",
  },
  {
    icon: UserCheck,
    title: "Compliance",
    text: "Use of the platform must follow RA 10173 (Data Privacy Act), institutional policies, and applicable healthcare regulations.",
  },
];

function TermsPage() {
  return (
    <div
      className="h-screen w-full grid lg:grid-cols-2 overflow-hidden"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      {/* LEFT — terms content */}
      <aside
        className="relative hidden lg:flex flex-col p-12 xl:p-14 overflow-y-auto"
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

        <div className="relative flex-1 flex flex-col justify-center my-8 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <div className="eyebrow mb-5 opacity-75">Legal</div>
          <h1 className="display-lg leading-[0.95]">
            Terms &
            <br />
            <span className="hl">Conditions</span>.
          </h1>

          <div className="mt-8 space-y-5 max-w-md">
            {TERMS.map((item, i) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl p-4 animate-fade-up"
                style={{
                  background: "color-mix(in oklab, var(--paper) 8%, transparent)",
                  animationDelay: `${0.16 + i * 0.06}s`,
                }}
              >
                <item.icon className="h-5 w-5 mt-0.5 shrink-0 opacity-80" />
                <div>
                  <h3 className="font-display text-sm uppercase tracking-wide">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed opacity-75">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs opacity-60 animate-fade-up" style={{ animationDelay: "0.44s" }}>
          © 2026 Data Sheet Group · RA 10173-aligned
        </div>
      </aside>

      {/* RIGHT — back link */}
      <section className="relative flex flex-col h-full p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden">
        <img
          src={stickerPotion}
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

          {/* mobile terms summary */}
          <div className="lg:hidden mb-8 space-y-4">
            <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
              Legal
            </div>
            <h2 className="display-md">
              Terms & <span className="hl">Conditions</span>.
            </h2>
            <div className="space-y-3">
              {TERMS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: "color-mix(in oklab, var(--ink) 5%, transparent)" }}
                >
                  <item.icon className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />
                  <div>
                    <h3 className="font-display text-xs uppercase tracking-wide">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed opacity-70">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="eyebrow" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
            Done reading?
          </div>
          <h2 className="mt-3 display-md">
            Go <span className="hl">back</span>.
          </h2>
          <p className="mt-4 text-sm lg:text-base" style={{ color: "color-mix(in oklab, var(--ink) 68%, transparent)" }}>
            Return to request access to continue creating your account.
          </p>

          <Link
            to="/register"
            className="mt-8 lg:mt-10 group w-full rounded-full py-4 font-display uppercase tracking-wider text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "var(--ink)", color: "var(--cream)" }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to request access
          </Link>
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
