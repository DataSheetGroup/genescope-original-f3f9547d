import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import heartPulse from "@/assets/illustrations/heart-pulse.png";
import clipboard from "@/assets/illustrations/clipboard.png";
import fireFlask from "@/assets/illustrations/fire-flask.png";
import testTube from "@/assets/illustrations/test-tube.png";
import petriDish from "@/assets/illustrations/petri-dish.png";
import magnifier from "@/assets/illustrations/magnifier-strand.png";
import pillCap from "@/assets/illustrations/pill-capsule.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "GeneScope" },
      { name: "description", content: "Research information and compliance for the GeneScope thesis project." },
    ],
  }),
  component: AboutPage,
});

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-4 border-b border-card-foreground/10 last:border-b-0">
      <dt className="eyebrow text-card-foreground/60">{k}</dt>
      <dd className="text-sm leading-relaxed">{v}</dd>
    </div>
  );
}

function AboutPage() {
  const compliance = [
    "MOA Signed",
    "NDA Executed",
    "Ethical Clearance",
    "RA 10173 Compliant",
    "Anonymized Data",
    "No PII Collected",
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-16 space-y-10 z-10">
      <div className="max-w-3xl">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="eyebrow text-coral mb-4">About</div>
            <h1 className="display-lg">
              A thesis built
              <br />
              <span className="hl">with care.</span>
            </h1>
          </div>
        </div>
      </div>

        <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
          <img src={fireFlask} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
          <div className="eyebrow text-coral mb-2">Project</div>
          <h2 className="font-display text-3xl mb-6">Research <span className="hl">information</span></h2>
          <dl>
            <Row k="System" v="GeneScope v1.0" />
            <Row k="Study" v="Predicting Genetic Testing Utilization in the Philippines Using Binary Logistic Regression Through Indicators" />
            <Row k="Institution" v="FEU Institute of Technology · November 2025" />
            <Row k="Degree" v="BS Computer Science with Specialization in Data Science" />
            <Row
              k="Researchers"
              v={
                <ul className="space-y-1">
                  <li>Maricor, Hassan C.</li>
                  <li>Mikunug, Abdul Aziz</li>
                  <li>Parente, Harvey Benedict C.</li>
                  <li>Taguinod, John Michael S.</li>
                </ul>
              }
            />
            <Row k="Thesis Adviser" v="Mr. Jeneffer A. Sabonsolin" />
            <Row k="Data Partner" v="Molave Trading Inc. (Confidential — MOA & NDA)" />
          </dl>
        </div>

        <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
          <img src={heartPulse} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
          <div className="eyebrow text-coral mb-2">Compliance</div>
          <h2 className="font-display text-3xl mb-6">A clear <span className="hl">ethical perimeter</span></h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {compliance.map((c) => (
              <li key={c} className="flex items-center gap-3 rounded-2xl bg-cream-dim px-5 py-4 text-sm">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-coral shrink-0">
                  <Check className="h-3.5 w-3.5 text-card-foreground" />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
