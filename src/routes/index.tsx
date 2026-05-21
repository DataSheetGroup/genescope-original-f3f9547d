import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowDown } from "lucide-react";
import { getEdaData } from "@/lib/api";
import helix from "@/assets/illustrations/helix-doodle.png";
import microscope from "@/assets/illustrations/microscope-doodle.png";
import magnifier from "@/assets/illustrations/magnifier-strand.png";
import helixCheck from "@/assets/illustrations/helix-check.png";
import dnaStrand from "@/assets/illustrations/dna-strand.png";
import testTube from "@/assets/illustrations/test-tube.png";
import clipboard from "@/assets/illustrations/clipboard.png";
import dropper from "@/assets/illustrations/dropper.png";
import pillCap from "@/assets/illustrations/pill-capsule.png";
import heartPulse from "@/assets/illustrations/heart-pulse.png";
import labFlask from "@/assets/illustrations/lab-flask.png";
import chromosome from "@/assets/illustrations/chromosome.png";
import petriDish from "@/assets/illustrations/petri-dish.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeneScope" },
      {
        name: "description",
        content:
          "Locally-hosted decision-support system predicting Targeted Testing vs Comprehensive Profiling for Philippine patients.",
      },
      { property: "og:title", content: "GeneScope" },
      {
        property: "og:description",
        content: "Predicting Genetic Testing Utilization in the Philippines.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useQuery({ queryKey: ["eda"], queryFn: getEdaData, retry: 0 });
  const totalRecords = data?.total_records ?? "—";

  return (
    <div className="">
      {/* ───────────── HERO (green) — centered, asymmetric illustrations ───────────── */}
      <section className="hero-green relative overflow-hidden -mt-px">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-8 md:pt-12 pb-14 md:pb-20 relative">
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="font-display text-sm md:text-base mb-4">
              A confident clinical decision
            </div>
            <h1 className="display-xl uppercase">
              Genetic testing
              <br />
              decisions <span className="hl">without</span>
              <br />
              the <span className="hl">guesswork</span>
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              GeneScope pairs every result with plain-language context, calibrated probabilities,
              and feature attribution — so clinicians decide with clarity.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
          <div
            className="font-display text-base md:text-lg text-teal-soft"
            style={{ color: "var(--green-deep)" }}
          >
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
                img: dropper,
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
                  <h3
                    className="font-display text-2xl md:text-3xl leading-tight"
                    style={{ color: "var(--green-deep)" }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="mt-5 text-sm md:text-base leading-relaxed"
                    style={{ color: "var(--green-deep)" }}
                  >
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
              <img src={labFlask} alt="" className="w-20 md:w-24 object-contain mb-5" />
              <div
                className="font-display text-base md:text-lg mb-6"
                style={{ color: "var(--green-deep)" }}
              >
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
                  <div
                    className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-coral flex items-center justify-center font-display text-xl md:text-2xl"
                    style={{ color: "var(--green-deep)" }}
                  >
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-display text-2xl md:text-[2rem] leading-[1.05]"
                      style={{ color: "var(--green-deep)" }}
                    >
                      {s.t}
                    </h3>
                    <p
                      className="mt-4 text-sm md:text-base leading-relaxed"
                      style={{ color: "var(--green-deep)" }}
                    >
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
            <div
              className="font-display text-base md:text-lg"
              style={{ color: "var(--green-deep)" }}
            >
              And you?
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                img: magnifier,
                eyebrow: "Run a prediction",
                title: (
                  <>
                    Ready to see <br /> a result?
                  </>
                ),
                to: "/predict",
                cta: "Open the predictor",
              },
              {
                img: heartPulse,
                eyebrow: "Explore the model",
                title: (
                  <>
                    Curious about <br /> performance?
                  </>
                ),
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
                <div
                  className="font-display text-sm md:text-base mb-4"
                  style={{ color: "var(--green-deep)" }}
                >
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

      {/* ───────────── HIGHLIGHTS / STATS (cream) — editorial magazine grid ───────────── */}
      <section className="slab-cream relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pb-32 relative">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-end mb-12 lg:mb-16">
            <div className="lg:col-span-7">
              <span
                className="block font-display uppercase tracking-[0.2em] text-xs sm:text-sm mb-4 opacity-60"
                style={{ color: "var(--green-deep)" }}
              >
                The dataset behind the model
              </span>
              <h2 className="display-lg uppercase leading-[0.95]">
                Our <span className="hl inline-block">highlights</span>
                <br />
                of the moment
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-2">
              <p
                className="text-base md:text-lg leading-relaxed max-w-md"
                style={{ color: "var(--green-deep)" }}
              >
                A snapshot of what powers every GeneScope prediction — the data, the models, and the
                indicators behind each calibrated probability.
              </p>
            </div>
          </div>

          {/* Magazine stat grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
            {/* Featured: 01 Records */}
            <div className="lg:col-span-8 bg-green-deep text-cream rounded-[2.5rem] p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[360px] md:min-h-[440px] shadow-2xl shadow-[var(--green-deep)]/10">
              <div className="flex justify-between items-start gap-4">
                <div className="font-display text-base md:text-lg tracking-widest opacity-50 uppercase">
                  01 — Records
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-cream/20 flex items-center justify-center shrink-0">
                  <ArrowRight
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ color: "var(--teal-soft)" }}
                  />
                </div>
              </div>
              <div className="mt-10">
                <div
                  className="font-display tabular-nums leading-[0.8] tracking-tighter mb-4 text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem]"
                  style={{ color: "var(--teal-soft)" }}
                >
                  {totalRecords}
                </div>
                <p className="text-base md:text-xl lg:text-2xl font-light opacity-80 max-w-sm leading-snug">
                  De-identified Philippine patient records powering the locally-trained model.
                </p>
              </div>
            </div>

            {/* Secondary stack */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-5 md:gap-6">
              {/* 02 Coverage */}
              <div className="bg-coral text-cream rounded-[2rem] p-6 md:p-8 flex flex-col justify-between min-h-[160px] shadow-xl shadow-[var(--coral)]/10">
                <div className="font-display text-xs md:text-sm tracking-widest opacity-70 uppercase mb-4">
                  02 — Coverage
                </div>
                <div>
                  <div className="font-display text-4xl md:text-5xl tabular-nums leading-none mb-2">
                    2021–25
                  </div>
                  <div className="text-xs md:text-sm font-medium uppercase tracking-wider opacity-80">
                    Years covered
                  </div>
                </div>
              </div>

              {/* 03 Benchmarks */}
              <div
                className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col justify-between min-h-[160px] border shadow-lg"
                style={{
                  color: "var(--green-deep)",
                  borderColor: "color-mix(in oklab, var(--green-deep) 8%, transparent)",
                }}
              >
                <div className="font-display text-xs md:text-sm tracking-widest uppercase mb-4 opacity-40">
                  03 — Benchmarks
                </div>
                <div>
                  <div className="font-display text-6xl md:text-7xl tabular-nums leading-none mb-2">
                    3
                  </div>
                  <div className="text-xs md:text-sm font-medium uppercase tracking-wider opacity-60">
                    Models compared
                  </div>
                </div>
              </div>

              {/* 04 Inputs */}
              <div
                className="rounded-[2rem] p-6 md:p-8 flex flex-col justify-between min-h-[160px] shadow-xl"
                style={{
                  background: "var(--teal-soft)",
                  color: "var(--green-deep)",
                  boxShadow:
                    "0 20px 40px -20px color-mix(in oklab, var(--teal-soft) 40%, transparent)",
                }}
              >
                <div className="font-display text-xs md:text-sm tracking-widest uppercase mb-4 opacity-50">
                  04 — Inputs
                </div>
                <div className="flex items-end gap-4">
                  <div className="font-display text-6xl md:text-7xl tabular-nums leading-none">
                    6
                  </div>
                  <div className="text-xs md:text-sm font-semibold uppercase leading-tight pb-1">
                    Structured clinical
                    <br />
                    indicators per prediction
                  </div>
                </div>
              </div>
            </div>
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
              <div key={i} className="rounded-[2.5rem] bg-green-deep text-cream p-10 md:p-14">
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
