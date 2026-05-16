import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { getEdaData } from "@/lib/api";
import { FloatingIllustration } from "@/components/FloatingIllustration";
import helix from "@/assets/illustrations/helix-doodle.png";
import microscope from "@/assets/illustrations/microscope-doodle.png";
import magnifier from "@/assets/illustrations/magnifier-strand.png";
import helixCheck from "@/assets/illustrations/helix-check.png";

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
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-10 md:pt-16 pb-24 md:pb-32 min-h-[80vh] flex flex-col justify-center relative">
          {/* floating illustrations */}
          <FloatingIllustration
            src={helix}
            className="hidden md:block absolute left-2 lg:left-12 top-24 w-32 lg:w-48"
            rotate={-12}
          />
          <FloatingIllustration
            src={microscope}
            className="hidden md:block absolute right-4 lg:right-16 bottom-24 w-44 lg:w-64"
            rotate={8}
            variant="drift"
          />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="eyebrow text-coral mb-6">A confident decision</div>
            <h1 className="display-xl">
              Genetic Testing,
              <br />
              <span className="text-coral">without the guesswork.</span>
            </h1>
            <p className="mt-8 mx-auto max-w-2xl text-base md:text-lg text-foreground/80 leading-relaxed">
              A locally-hosted clinical decision-support system predicting whether a
              Philippine patient undergoes <strong>Targeted Testing</strong> or{" "}
              <strong>Comprehensive Profiling</strong>, from six structured
              indicators — using Binary Logistic Regression.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/predict" className="pill pill-coral">
                Start a Prediction <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="pill pill-outline">
                View the Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── MISSION ───────────── */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-24">
        <div className="max-w-3xl mb-16">
          <div className="eyebrow text-coral mb-4">Our mission</div>
          <h2 className="display-lg">
            Beyond a single number:
            <br />
            <span className="text-coral">clarity, context, and craft.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              img: helixCheck,
              title: "A confident decision",
              body: "Every prediction is paired with a knowledge card that explains what the result means in plain clinical language.",
            },
            {
              img: magnifier,
              title: "Streamlined indicators",
              body: "Just six structured fields — sex, region, location, disease, facility, year — produce a calibrated probability in milliseconds.",
            },
            {
              img: helix,
              title: "Local & private",
              body: "Everything runs against your own Flask backend. No patient data leaves the machine. RA 10173 compliant.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl bg-card text-card-foreground p-8 flex flex-col">
              <img src={c.img} alt="" className="w-20 h-20 object-contain mb-6" />
              <h3 className="font-display text-2xl mb-3">{c.title}</h3>
              <p className="text-sm text-card-foreground/75 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── PROCESS ───────────── */}
      <section className="border-t border-foreground/15">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
            <div>
              <div className="eyebrow text-coral mb-4">Your needs, our solution</div>
              <h2 className="display-lg">
                A workflow for the
                <br />
                <span className="text-coral">forward-thinking</span> clinician.
              </h2>
              <Link to="/predict" className="mt-8 pill pill-cream">
                Try it now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ol className="space-y-3">
              {[
                { n: "01", t: "Enter the six indicators", d: "Structured dropdowns — no free text, no PII." },
                { n: "02", t: "Run the local model", d: "Your trained Binary Logistic Regression model returns a class and a calibrated probability." },
                { n: "03", t: "Interpret the result", d: "A knowledge card explains the recommendation; feature importance shows what drove it." },
              ].map((s) => (
                <li key={s.n} className="group rounded-2xl bg-card text-card-foreground p-7 flex items-start gap-6 hover:bg-cream-dim transition-colors">
                  <div className="font-display text-5xl text-coral leading-none">{s.n}</div>
                  <div className="flex-1">
                    <div className="font-display text-2xl mb-1">{s.t}</div>
                    <p className="text-sm text-card-foreground/75 leading-relaxed">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────── STATS ───────────── */}
      <section className="border-t border-foreground/15">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { v: totalRecords, l: "Patient records" },
              { v: "2021–25", l: "Coverage" },
              { v: 3, l: "Models compared" },
              { v: 6, l: "Indicators" },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-display text-5xl md:text-6xl text-coral tabular-nums">{s.v}</div>
                <div className="eyebrow text-foreground/65 mt-3">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
