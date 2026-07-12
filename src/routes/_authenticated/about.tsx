import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import heartPulse from "@/assets/illustrations/heart-pulse.png";
import fireFlask from "@/assets/illustrations/fire-flask.png";
import testTube from "@/assets/illustrations/test-tube.png";
import petriDish from "@/assets/illustrations/petri-dish.png";
import magnifier from "@/assets/illustrations/magnifier-strand.png";
import pillCap from "@/assets/illustrations/pill-capsule.png";
import modelData from "@/data/model-from-pkl.json";

export const Route = createFileRoute("/_authenticated/about")({
  head: () => ({
    meta: [
      { title: "About · GeneScope" },
      {
        name: "description",
        content:
          "Research information, compliance, Chapter 4 results, and Chapter 6 recommendations for the GeneScope thesis project.",
      },
    ],
  }),
  component: AboutPage,
});

type TabKey = "research" | "compliance" | "viz" | "recs";

const TABS: { key: TabKey; label: string }[] = [
  { key: "research", label: "Research" },
  { key: "compliance", label: "Compliance" },
  { key: "viz", label: "Visualization" },
  { key: "recs", label: "Recommendations" },
];

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-4 border-b border-card-foreground/10 last:border-b-0">
      <dt className="eyebrow text-card-foreground/60">{k}</dt>
      <dd className="text-sm leading-relaxed">{v}</dd>
    </div>
  );
}

function AboutPage() {
  const [tab, setTab] = useState<TabKey>("research");

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-16 space-y-10 z-10">
        <div className="max-w-3xl">
          <div className="eyebrow text-coral mb-4">About</div>
          <h1 className="display-lg">
            A thesis built
            <br />
            <span className="hl">with care.</span>
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "eyebrow px-4 py-2 rounded-full border transition-colors " +
                  (active
                    ? "bg-coral text-card-foreground border-coral"
                    : "bg-transparent text-foreground/70 border-foreground/20 hover:border-foreground/40")
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "research" && <ResearchCard />}
        {tab === "compliance" && <ComplianceCard />}
        {tab === "viz" && <VisualizationCard />}
        {tab === "recs" && <RecommendationsCard />}
      </div>
    </div>
  );
}

function ResearchCard() {
  return (
    <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
      <img src={fireFlask} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
      <div className="eyebrow text-coral mb-2">Project</div>
      <h2 className="font-display text-3xl mb-6">
        Research <span className="hl">information</span>
      </h2>
      <dl>
        <Row k="System" v="GeneScope v1.0" />
        <Row
          k="Study"
          v="Predicting Genetic Testing Utilization in the Philippines Using Binary Logistic Regression Through Indicators"
        />
        <Row k="Institution" v="FEU Institute of Technology · May 2026" />
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
        <Row k="Thesis Group" v="Data Sheet Group" />
      </dl>
    </div>
  );
}

function ComplianceCard() {
  const compliance = [
    "MOA Signed",
    "NDA Executed",
    "Ethical Clearance",
    "RA 10173 Compliant",
    "Anonymized Data",
    "No PII Collected",
  ];
  return (
    <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
      <img src={heartPulse} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
      <div className="eyebrow text-coral mb-2">Compliance</div>
      <h2 className="font-display text-3xl mb-6">
        A clear <span className="hl">ethical perimeter</span>
      </h2>
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
  );
}

/* ------------------------ Visualization (Chapter 4) ------------------------ */

function VisualizationCard() {
  const info = modelData.dataset_info;
  const models = modelData.models as unknown as Record<
    string,
    { results: Record<string, number>; cv: Record<string, number>; feature_importance: { feature: string; importance: number }[] }
  >;
  const rows = Object.entries(models).map(([name, m]) => ({
    name,
    accuracy: m.results.Accuracy,
    precision: m.results.Precision,
    recall: m.results.Recall,
    f1: m.results["F1-Score"],
    roc: m.results["ROC-AUC"],
  }));
  const best = modelData.best_model_name as string;
  const fi = models[best].feature_importance;

  const fmt = (n: number) => (n * 100).toFixed(1) + "%";

  const edaCallouts = [
    { k: "Total records", v: `${info.total_records}` },
    { k: "Year coverage", v: "2021 – 2025" },
    { k: "Train / Test split", v: `${info.train_records} / ${info.test_records}` },
    { k: "Engineered features", v: `${info.n_features}` },
    { k: "Private facilities", v: "99.11%" },
    { k: "Luzon share", v: "87.70%" },
    { k: "Volume growth", v: "19 → 134 (2021–2025)" },
    { k: "Best model", v: best },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
        <img src={testTube} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
        <div className="eyebrow text-coral mb-2">Chapter 4</div>
        <h2 className="font-display text-3xl mb-6">
          Results at <span className="hl">a glance</span>
        </h2>
        <p className="text-sm leading-relaxed text-card-foreground/80 mb-6 max-w-2xl">
          Key findings from the paper's Results and Discussion. Live, interactive charts are on the Dashboard —
          this view mirrors the static figures cited in the manuscript.
        </p>
        <ul className="grid sm:grid-cols-2 gap-3">
          {edaCallouts.map((c) => (
            <li key={c.k} className="rounded-2xl bg-cream-dim px-5 py-4">
              <div className="eyebrow text-card-foreground/60 text-[10px]">{c.k}</div>
              <div className="text-sm font-medium mt-1">{c.v}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
        <img src={petriDish} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
        <div className="eyebrow text-coral mb-2">Section 4.10</div>
        <h2 className="font-display text-3xl mb-6">
          Model <span className="hl">comparison</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-card-foreground/10">
                <th className="py-3 pr-4 eyebrow text-card-foreground/60">Model</th>
                <th className="py-3 pr-4 eyebrow text-card-foreground/60">Accuracy</th>
                <th className="py-3 pr-4 eyebrow text-card-foreground/60">Precision</th>
                <th className="py-3 pr-4 eyebrow text-card-foreground/60">Recall</th>
                <th className="py-3 pr-4 eyebrow text-card-foreground/60">F1</th>
                <th className="py-3 pr-0 eyebrow text-card-foreground/60">ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-card-foreground/10 last:border-b-0">
                  <td className="py-3 pr-4 font-medium">
                    {r.name}
                    {r.name === best && (
                      <span className="ml-2 text-[10px] eyebrow text-coral">Best</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">{fmt(r.accuracy)}</td>
                  <td className="py-3 pr-4">{fmt(r.precision)}</td>
                  <td className="py-3 pr-4">{fmt(r.recall)}</td>
                  <td className="py-3 pr-4">{fmt(r.f1)}</td>
                  <td className="py-3 pr-0">{fmt(r.roc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
        <img src={magnifier} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
        <div className="eyebrow text-coral mb-2">Section 4.9</div>
        <h2 className="font-display text-3xl mb-6">
          Feature <span className="hl">importance</span>
        </h2>
        <p className="text-sm text-card-foreground/70 mb-5 max-w-2xl">
          Clinical referral pathways (Disease Category) dominate predictive signal across all three models — the
          strongest driver of test-type selection reported in Chapter 4.
        </p>
        <ul className="space-y-3">
          {fi.map((f) => (
            <li key={f.feature}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{f.feature}</span>
                <span className="text-card-foreground/60">{(f.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-cream-dim overflow-hidden">
                <div
                  className="h-full bg-coral"
                  style={{ width: `${Math.max(2, f.importance * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------ Recommendations (Chapter 6) ------------------------ */

type Rec = { title: string; body: string; ref?: string };

const PROVIDERS: Rec[] = [
  {
    title: "Guideline support in neurology & pediatrics",
    body: "Update clinical referral pathways so targeted vs. comprehensive profiling reflects evidence-based need, not institutional default.",
    ref: "Table 10 · Table 11",
  },
  {
    title: "Regional education for Mindanao & Visayas",
    body: "Neurology patients in these regions were less likely to receive comprehensive testing (OR = 0.46). Target referral support and CME here.",
    ref: "Table 10",
  },
];

const INSTITUTIONS: Rec[] = [
  {
    title: "Expand beyond private-Luzon dominance",
    body: "99.11% of records came from private facilities and 87.70% from Luzon. Build formal partnerships with public and regional providers.",
    ref: "Table 5",
  },
  {
    title: "Capacity-building in underserved regions",
    body: "Prioritize Mindanao and Visayas for lab training, sequencing infrastructure, and referral networks with genomic centers.",
  },
];

const POLICYMAKERS: Rec[] = [
  {
    title: "Extend the Rare Disease Act",
    body: "Expand implementation to public facilities and underserved regions; establish publicly funded programs that lower out-of-pocket cost.",
    ref: "Section 4.12.2",
  },
  {
    title: "Include public-facility records in registries",
    body: "Require national health registries to capture genetic testing from public facilities and rural health units.",
  },
  {
    title: "Anticipate continued growth",
    body: "Testing volume grew from 19 records in 2021 to 134 in 2025. Policy responses should plan for continued expansion.",
    ref: "Table 6",
  },
];

const RESEARCHERS: Rec[] = [
  {
    title: "Dataset expansion",
    body: "Incorporate multi-institutional data, public facility records, and rural populations. At minimum, report performance stratified by region and facility type.",
    ref: "Section 4.12.2",
  },
  {
    title: "Feature expansion",
    body: "Add patient income, insurance coverage, physician specialty, referral volume, turnaround time, test cost, and patient-reported outcomes.",
  },
  {
    title: "Modeling improvements",
    body: "Explore deep learning and ensemble stacking to raise minority-class recall (Targeted recall ranged 0.50 – 0.64 across models).",
    ref: "Section 4.7.1",
  },
  {
    title: "System refinement",
    body: "Address output-consistency concerns (WM 4.59) via confidence intervals or model ensembling.",
    ref: "Table 13 · Section 4.13",
  },
  {
    title: "Deployment extension",
    body: "Extend GeneScope with a real-time prediction interface for analysts — already implemented in the current build's Predict page.",
    ref: "Section 4.12.7",
  },
];

function RecGroup({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: Rec[];
}) {
  return (
    <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
      <img src={icon} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
      <div className="eyebrow text-coral mb-2">For</div>
      <h2 className="font-display text-3xl mb-6">
        <span className="hl">{title}</span>
      </h2>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.title} className="rounded-2xl bg-cream-dim px-5 py-4">
            <div className="flex items-start justify-between gap-4 mb-1">
              <div className="text-sm font-medium">{r.title}</div>
              {r.ref && (
                <div className="eyebrow text-[10px] text-card-foreground/50 shrink-0">{r.ref}</div>
              )}
            </div>
            <p className="text-sm leading-relaxed text-card-foreground/80">{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationsCard() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
        <img src={pillCap} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
        <div className="eyebrow text-coral mb-2">Chapter 6</div>
        <h2 className="font-display text-3xl mb-2">
          Actionable <span className="hl">recommendations</span>
        </h2>
        <p className="text-sm leading-relaxed text-card-foreground/80 max-w-2xl">
          Directed at healthcare providers, institutions, policymakers, and researchers — drawn from the paper's
          findings, limitations, and system-evaluation results.
        </p>
      </div>

      <RecGroup title="Healthcare Providers" icon={heartPulse} items={PROVIDERS} />
      <RecGroup title="Healthcare Institutions" icon={testTube} items={INSTITUTIONS} />
      <RecGroup title="Policymakers" icon={fireFlask} items={POLICYMAKERS} />
      <RecGroup title="Researchers" icon={magnifier} items={RESEARCHERS} />
    </div>
  );
}
