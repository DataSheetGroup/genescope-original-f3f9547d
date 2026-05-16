import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, ShieldCheck, Database, Microscope } from "lucide-react";
import { getEdaData } from "@/lib/api";
import logo from "@/assets/genescope-logo.png";

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

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-3xl md:text-4xl font-semibold text-foreground tabular-nums">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Home() {
  const { data } = useQuery({ queryKey: ["eda"], queryFn: getEdaData, retry: 0 });

  const totalRecords = data?.total_records ?? "—";

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                FEU Institute of Technology · Thesis Research
              </div>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground">
                GeneScope
              </h1>
              <p className="mt-4 text-lg md:text-xl text-foreground/80 font-medium">
                Predicting Genetic Testing Utilization in the Philippines Using
                Binary Logistic Regression Through Indicators
              </p>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-xl">
                A locally-hosted clinical decision-support system developed by
                FEU Institute of Technology in partnership with Molave Trading
                Inc. GeneScope predicts whether a patient undergoes Targeted
                Testing or Comprehensive Profiling based on six patient
                indicators.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/predict"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Start Prediction <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl rotate-3" />
              <div className="relative rounded-3xl border bg-card p-8 shadow-sm">
                <img src={logo} alt="GeneScope" className="w-full max-w-xs mx-auto" />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <Microscope className="h-5 w-5 text-primary" />
                    <div className="mt-2 text-xs font-semibold">Binary Logistic Regression</div>
                    <div className="text-xs text-muted-foreground">Primary Model</div>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <Database className="h-5 w-5 text-accent" />
                    <div className="mt-2 text-xs font-semibold">2021–2025 Records</div>
                    <div className="text-xs text-muted-foreground">Anonymized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem label="Total Patient Records" value={totalRecords} />
            <StatItem label="Coverage Period" value="2021–2025" />
            <StatItem label="ML Models Compared" value={3} />
            <StatItem label="Patient Indicators" value={6} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
            How GeneScope works
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold">
            From six indicators to one evidence-based recommendation
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Enter indicators", d: "Six structured fields: sex, region, location, disease category, facility, and year of testing." },
            { n: "02", t: "Run the local model", d: "Your trained Binary Logistic Regression model returns a class and a calibrated probability." },
            { n: "03", t: "Interpret the result", d: "A knowledge card explains the recommendation; feature importance shows what drove it." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="text-sm font-mono text-primary">{s.n}</div>
              <div className="mt-3 text-lg font-semibold">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            to="/performance"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <BarChart3 className="h-4 w-4" /> See model performance details
          </Link>
        </div>
      </section>
    </div>
  );
}
