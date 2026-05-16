import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — GeneScope" },
      { name: "description", content: "Research information and compliance for the GeneScope thesis project." },
    ],
  }),
  component: AboutPage,
});

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 py-2.5 border-b last:border-b-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-sm text-foreground">{v}</dd>
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up space-y-8">
      <div>
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2">About</div>
        <h1 className="text-3xl md:text-4xl font-semibold">Research Information</h1>
      </div>

      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Project</h2>
        <dl>
          <Row k="System" v="GeneScope v1.0" />
          <Row k="Study" v={"Predicting Genetic Testing Utilization in the Philippines Using Binary Logistic Regression Through Indicators"} />
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

      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Compliance</h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {compliance.map((c) => (
            <li key={c} className="flex items-center gap-2.5 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
