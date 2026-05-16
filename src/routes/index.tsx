import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowDown } from "lucide-react";
import { getEdaData } from "@/lib/api";
import { FloatingIllustration } from "@/components/FloatingIllustration";
import helix from "@/assets/illustrations/helix-doodle.png";
import microscope from "@/assets/illustrations/microscope-doodle.png";
import magnifier from "@/assets/illustrations/magnifier-strand.png";
import helixCheck from "@/assets/illustrations/helix-check.png";
import dnaStrand from "@/assets/illustrations/dna-strand.png";
import testTube from "@/assets/illustrations/test-tube.png";
import clipboard from "@/assets/illustrations/clipboard.png";
import pillCap from "@/assets/illustrations/pill-capsule.png";
import heartPulse from "@/assets/illustrations/heart-pulse.png";
import labFlask from "@/assets/illustrations/lab-flask.png";
import chromosome from "@/assets/illustrations/chromosome.png";
import petriDish from "@/assets/illustrations/petri-dish.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeneScope — Genetic Testing Clinical Decision Support" },
      {
        name: "description",
        content:
          "Locally-hosted decision-support system predicting Targeted Testing vs Comprehensive Profiling for Philippine patients.",
      },
      { property: "og:title", content: "GeneScope" },
      { property: "og:description", content: "Predicting Genetic Testing Utilization in the Philippines." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useQuery({ queryKey: ["eda"], queryFn: getEdaData, retry: 0 });
  const totalRecords = data?.total_records ?? "—";

  return (
    <div className="animate-fade-up">
      {/* ───────────── HERO (green) ───────────── */}
      <section className="hero-green relative overflow-hidden -mt-px">
        {/* Corner illustrations — kept in safe margins, never under text */}
        <FloatingIllustration
          src={dnaStrand}
          className="hidden lg:block absolute left-4 xl:left-10 top-24 w-28 xl:w-36 z-0 opacity-95"
          rotate={-12}
        />
        <FloatingIllustration
          src={microscope}
          className="hidden lg:block absolute right-4 xl:right-10 top-24 w-32 xl:w-40 z-0 opacity-95"
          rotate={10}
          variant="drift"
        />
        <FloatingIllustration
          src={testTube}
          className="hidden xl:block absolute left-10 bottom-16 w-24 z-0"
          rotate={8}
          variant="drift"
        />
        <FloatingIllustration
          src={chromosome}
          className="hidden xl:block absolute right-10 bottom-16 w-28 z-0"
          rotate={-6}
        />

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-10 md:pt-20 pb-28 md:pb-40 min-h-[78vh] flex flex-col justify-center relative">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="font-display text-base md:text-lg mb-8">
              A confident clinical decision
            </div>
            <h1 className="display-xl uppercase">
              Genetic testing
              <br />
              decisions{" "}
              <span className="hl">without the</span>
              <br />
              <span className="hl">guesswork</span>
            </h1>
            <p className="mt-10 mx-auto max-w-2xl text-base md:text-lg leading-relaxed">
              GeneScope does more than return a single prediction. We pair every result
              with plain-language context, calibrated probabilities, and feature
              attribution — so clinicians decide with clarity, not guesswork.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/predict" className="pill pill-coral">
                Start a prediction
              </Link>
              <Link to="/dashboard" className="pill pill-cream">
                View the dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── MISSION header (cream) ───────────── */}
      <section className="slab-cream">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-32 pb-12 text-center">
          <div className="font-display text-base md:text-lg text-teal-soft" style={{ color: "var(--green-deep)" }}>
            Your clinic, with peace of mind
          </div>
          <h2 className="display-lg uppercase mt-6">
            Beyond a single probability:
            <br />
            <span className="hl">our mission</span>
          </h2>
        </div>

        {/* Mission cards row */}
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pb-28">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
            {[
              {
                img: helixCheck,
                title: "A confident decision",
                body: "Total transparency, the right context to understand every output, and a knowledge card built to help clinicians act with certainty.",
                rotate: 3,
                offset: "md:-translate-y-6 md:-rotate-2",
              },
              {
                img: magnifier,
                title: "Streamlined indicators",
                body: "Six structured fields and a calibrated probability in milliseconds — built for the realities of busy Philippine practice today.",
                rotate: -2,
                offset: "md:translate-y-10 md:rotate-2",
              },
            ].map((c) => (
              <div
                key={c.title}
                className={`rounded-[2rem] bg-white shadow-[0_10px_40px_-20px_rgba(15,61,46,0.25)] p-10 lg:p-12 flex items-start gap-6 ${c.offset}`}
              >
                <div className="flex-1">
                  <h3 className="font-display text-2xl md:text-3xl leading-tight" style={{ color: "var(--green-deep)" }}>
                    {c.title}
                  </h3>
                  <p className="mt-5 text-sm md:text-base leading-relaxed" style={{ color: "var(--green-deep)" }}>
                    {c.body}
                  </p>
                </div>
                <img src={c.img} alt="" className="w-24 md:w-32 shrink-0 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── NUMBERED PROCESS (cream) ───────────── */}
      <section className="slab-cream">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pb-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
            <div className="lg:sticky lg:top-28 relative">
              <div className="font-display text-base md:text-lg mb-6" style={{ color: "var(--green-deep)" }}>
                Your needs, our solution
              </div>
              <h2 className="display-lg uppercase leading-[0.95]">
                A workflow
                <br />
                for the bold.
                <br />
                <span className="hl">Not the bewildered.</span>
              </h2>
              <Link to="/predict" className="mt-10 pill pill-coral inline-flex">
                Discover the concept
              </Link>
              <FloatingIllustration
                src={helix}
                className="hidden lg:block absolute -right-10 top-1/2 w-44"
                rotate={-8}
              />
            </div>

            <ol className="space-y-7">
              {[
                {
                  n: "01",
                  t: "Personalized guidance for a solid project",
                  d: "Predicting and choosing a genetic test can be daunting. GeneScope gives you the keys to stay in control — with calibrated probabilities, clear explanations, and an output you can act on with confidence.",
                },
                {
                  n: "02",
                  t: "Predict and interpret in seconds",
                  d: "Enter six structured indicators. The locally-trained Binary Logistic Regression returns a class, a probability, and the features that drove it — no patient data leaves the machine.",
                },
                {
                  n: "03",
                  t: "Need a second opinion?",
                  d: "Compare your case against the dataset and the model performance dashboard. Our evaluation surface helps you stress-test every decision before acting.",
                },
                {
                  n: "04",
                  t: "Local, private, auditable",
                  d: "Every prediction is logged to your local history with a CSV export. RA 10173 compliant by design — nothing leaves your workstation.",
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="rounded-[2rem] bg-white shadow-[0_10px_40px_-20px_rgba(15,61,46,0.25)] p-8 lg:p-10 flex items-start gap-6 md:gap-8"
                >
                  <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-coral flex items-center justify-center font-display text-xl md:text-2xl" style={{ color: "var(--green-deep)" }}>
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl md:text-[2rem] leading-[1.05]" style={{ color: "var(--green-deep)" }}>
                      {s.t}
                    </h3>
                    <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--green-deep)" }}>
                      {s.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────── AND YOU? (cream w/ pink cards) ───────────── */}
      <section className="slab-cream">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pb-32">
          <div className="text-center mb-14">
            <div className="font-display text-base md:text-lg" style={{ color: "var(--green-deep)" }}>
              And you?
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                img: magnifier,
                eyebrow: "Run a prediction",
                title: (<>Ready to see <br /> a result?</>),
                to: "/predict",
                cta: "Open the predictor",
              },
              {
                img: helixCheck,
                eyebrow: "Explore the model",
                title: (<>Curious about <br /> performance?</>),
                to: "/performance",
                cta: "View metrics",
              },
            ].map((c, i) => (
              <Link
                key={i}
                to={c.to}
                className="group rounded-[2.5rem] bg-coral p-10 md:p-14 flex flex-col items-center text-center transition-transform hover:-translate-y-1"
              >
                <img src={c.img} alt="" className="w-32 md:w-44 object-contain mb-6" />
                <div className="font-display text-sm md:text-base mb-4" style={{ color: "var(--green-deep)" }}>
                  {c.eyebrow}
                </div>
                <h3 className="display-md uppercase mb-8" style={{ color: "var(--green-deep)" }}>
                  {c.title}
                </h3>
                <span className="pill pill-cream">{c.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── HIGHLIGHTS / STATS (cream) ───────────── */}
      <section className="slab-cream">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pb-32">
          <div className="text-center mb-14">
            <div className="font-display text-base md:text-lg" style={{ color: "var(--green-deep)" }}>
              The dataset behind the model
            </div>
            <h2 className="display-lg uppercase mt-6">
              Our <span className="hl">highlights</span>
              <br /> of the moment
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { v: totalRecords, l: "Patient records" },
              { v: "2021–25", l: "Years covered" },
              { v: "3", l: "Models compared" },
              { v: "6", l: "Indicators" },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-[2rem] bg-white shadow-[0_10px_40px_-20px_rgba(15,61,46,0.25)] p-8 text-center"
              >
                <div className="font-display text-5xl md:text-6xl tabular-nums" style={{ color: "var(--green-deep)" }}>
                  {s.v}
                </div>
                <div className="mt-3 text-sm font-semibold" style={{ color: "var(--green-deep)" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 rounded-full bg-green-deep text-cream px-6 py-3 font-display text-sm"
            >
              <span>So this project — let's talk?</span>
              <span className="h-9 w-9 rounded-full bg-coral flex items-center justify-center" style={{ color: "var(--green-deep)" }}>
                <ArrowDown className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── GREEN CTA CARDS (on cream) ───────────── */}
      <section className="slab-cream">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pb-32">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                img: helix,
                title: "Stay up to date",
                body: "Every month, our latest research notes and upcoming thesis review dates.",
                cta: "Subscribe to updates",
                to: "/about",
              },
              {
                img: microscope,
                title: "And your case?",
                body: "We're here to walk through your scenario, indicators, and interpretation needs.",
                cta: "Talk to a researcher",
                to: "/about",
              },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-[2.5rem] bg-green-deep text-cream p-10 md:p-14"
              >
                <img src={c.img} alt="" className="w-28 md:w-36 object-contain mb-6" />
                <h3 className="display-md uppercase mb-5">{c.title}</h3>
                <p className="text-base leading-relaxed mb-8 text-cream/85 max-w-md">{c.body}</p>
                <Link to={c.to} className="pill pill-coral">
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
