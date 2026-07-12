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
import { CH4 } from "@/data/chapter4";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

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

type TabKey = "research" | "compliance" | "viz" | "eval" | "sysval" | "recs";

const TABS: { key: TabKey; label: string }[] = [
  { key: "research", label: "Research" },
  { key: "compliance", label: "Compliance" },
  { key: "viz", label: "Results & Discussion" },
  { key: "eval", label: "Model Evaluation" },
  { key: "sysval", label: "System Evaluation" },
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
        {tab === "eval" && <SystemEvaluationCard />}
        {tab === "sysval" && <SurveyEvaluationCard />}
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

// Chart tokens (card body is on cream, so use dark ink + brand accents)
const INK = "var(--ink)";
const PURPLE = "var(--purple)";
const TEAL = "var(--teal)";
const MUSTARD = "var(--mustard)";
const GRID = "color-mix(in oklab, var(--ink) 10%, transparent)";
const tooltipStyle = {
  background: "var(--paper)",
  color: INK,
  border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)",
  borderRadius: 10,
  fontSize: 12,
  padding: "8px 12px",
  fontFamily: "Poppins, sans-serif",
};
const axisTick = { fontSize: 11, fill: INK, opacity: 0.65, fontFamily: "Poppins, sans-serif" };
const legendStyle = { fontSize: 12, color: INK, fontFamily: "Poppins, sans-serif" };

function FigureCard({
  ref_, title, subtitle, children, interpretation,
}: {
  ref_: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  interpretation?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-card text-card-foreground p-6 md:p-8 relative overflow-hidden scroll-mt-24">
      <div className="flex items-baseline justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="eyebrow text-coral text-[11px] mb-1">{ref_}</div>
          <h3 className="font-display text-xl md:text-2xl leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-card-foreground/60 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="rounded-2xl bg-cream-dim p-4 md:p-5 mb-4">{children}</div>
      <p className="text-sm leading-relaxed text-card-foreground/80">{interpretation}</p>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl bg-cream-dim px-5 py-4">
      <div className="eyebrow text-card-foreground/60 text-[10px]">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
      {sub && <div className="text-xs text-card-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

function DonutPct({ data, colors }: { data: { name: string; value: number; pct: number }[]; colors: string[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            label={((e: unknown) => {
              const p = e as { name: string; pct: number };
              return `${p.name} · ${p.pct.toFixed(2)}%`;
            }) as never}
            labelLine={false}
            stroke="var(--paper)"
            strokeWidth={2}
          >
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown, _n: unknown, p: { payload?: { pct?: number; name?: string } }) => [`${v} (${(p.payload?.pct ?? 0).toFixed(2)}%)`, p.payload?.name ?? ""]) as never} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarsHoriz({ data, color }: { data: { name: string; value: number; pct: number }[]; color: string }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 20 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={axisTick} stroke={INK} />
          <YAxis type="category" dataKey="name" tick={axisTick} stroke={INK} width={90} />
          <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown, _n: unknown, p: { payload?: { pct?: number } }) => [`${v} (${(p.payload?.pct ?? 0).toFixed(2)}%)`, "Records"]) as never} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GroupedBars({ data, keys }: { data: Record<string, string | number>[]; keys: [string, string] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" tick={axisTick} stroke={INK} />
          <YAxis tick={axisTick} stroke={INK} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={legendStyle} />
          <Bar dataKey={keys[0]} fill={PURPLE} radius={[6, 6, 0, 0]} />
          <Bar dataKey={keys[1]} fill={TEAL} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function VisualizationCard() {
  // dataset_info shown inline via CH4.dataset below
  const best = modelData.best_model_name as string;

  const sections: { id: string; label: string }[] = [
    { id: "sec-dataset", label: "Dataset" },
    { id: "sec-dist", label: "Distributions" },
    { id: "sec-cross", label: "Cross-tabs" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
        <img src={testTube} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
        <div className="eyebrow text-coral mb-2">Chapter 4</div>
        <h2 className="font-display text-3xl mb-3">
          Results & <span className="hl">discussion</span>
        </h2>
        <p className="text-sm leading-relaxed text-card-foreground/80 max-w-2xl mb-5">
          The paper's Chapter 4 figures and tables, each with its own interpretation. Numbers are
          sourced from the manuscript and verified against the 447-record anonymized dataset used to
          train the model.
        </p>
        <nav className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="eyebrow text-[11px] px-3 py-1.5 rounded-full bg-cream-dim hover:bg-coral hover:text-card-foreground transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      {/* ───────────── DATASET ───────────── */}
      <div id="sec-dataset" className="scroll-mt-24">
        <FigureCard
          ref_="Section 4.1 · Table 5"
          title={<>Dataset composition & <span className="hl">class balance</span></>}
          interpretation={
            <>
              The study analyzed <b>{CH4.dataset.total}</b> anonymized records spanning{" "}
              <b>{CH4.dataset.years}</b> with <b>{CH4.dataset.features}</b> engineered features,
              split <b>{CH4.dataset.train}/{CH4.dataset.test}</b> for training and testing. The
              target variable is imbalanced — <b>Comprehensive testing</b> dominates
              ({CH4.dataset.balance.Comprehensive} vs {CH4.dataset.balance.Targeted}), which
              motivated ROC-AUC and F1 as primary evaluation metrics rather than raw accuracy.
            </>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Total records" value={CH4.dataset.total} />
            <StatTile label="Year coverage" value={CH4.dataset.years} />
            <StatTile label="Train / Test" value={`${CH4.dataset.train} / ${CH4.dataset.test}`} />
            <StatTile label="Features" value={CH4.dataset.features} sub="after one-hot encoding" />
            <StatTile label="Comprehensive" value={CH4.dataset.balance.Comprehensive} sub="75.84%" />
            <StatTile label="Targeted" value={CH4.dataset.balance.Targeted} sub="24.16%" />
            <StatTile label="Location" value="Urban" sub="100% (single stratum)" />
            <StatTile label="Best model" value={best} />
          </div>
        </FigureCard>
      </div>

      {/* ───────────── DISTRIBUTIONS ───────────── */}
      <div id="sec-dist" className="scroll-mt-24 space-y-6">
        <FigureCard
          ref_="Figure 1 (Results) · Section 4.1"
          title={<>Test type <span className="hl">distribution</span></>}
          subtitle="Comprehensive vs Targeted profiling — the classifier's target variable"
          interpretation={
            <>
              Comprehensive profiling accounts for <b>75.84%</b> of records and Targeted testing for{" "}
              <b>24.16%</b>. This ≈3:1 imbalance is why per-class recall is reported alongside
              overall accuracy in Section 4.7.1.
            </>
          }
        >
          <DonutPct data={[...CH4.testType]} colors={[PURPLE, TEAL]} />
        </FigureCard>

        <FigureCard
          ref_="Figure 2 (Results) · Table 6 · Section 4.2.5"
          title={<>Annual testing <span className="hl">volume</span> (2021 – 2025)</>}
          interpretation={
            <>
              Testing volume grew from <b>19</b> records in 2021 to <b>134</b> in 2025 — a{" "}
              <b>~7×</b> increase. The steepest jump is 2022 → 2023 (53 → 115) coinciding with
              post-pandemic clinical activity resuming. The cumulative curve reaches 447 by 2025.
            </>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={[...CH4.annual]} margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={axisTick} stroke={INK} />
                <YAxis tick={axisTick} stroke={INK} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Line type="monotone" dataKey="count" name="Yearly count" stroke={PURPLE} strokeWidth={3} dot={{ r: 4, fill: PURPLE }} />
                <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke={TEAL} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: TEAL }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FigureCard>

        <FigureCard
          ref_="Section 4.2.5"
          title={<>Yearly volume by <span className="hl">test type</span></>}
          interpretation={
            <>
              Comprehensive profiling has driven the growth (11 → 105), while Targeted testing has
              stayed roughly flat around 27–33 per year since 2023. This widening gap is a key
              structural feature the model has to learn from.
            </>
          }
        >
          <GroupedBars data={[...CH4.yearByTest]} keys={["Comprehensive", "Targeted"]} />
        </FigureCard>

        <FigureCard
          ref_="Section 4.2.2"
          title={<>Geographic <span className="hl">region</span></>}
          interpretation={
            <>
              Luzon accounts for <b>87.70%</b> of records (392 of 447), Visayas 10.51%, and
              Mindanao just 1.79%. The paper flags this as a <b>representational bias</b> in the
              training data (Section 4.12.2) — model behavior outside Luzon should be interpreted
              with caution.
            </>
          }
        >
          <BarsHoriz data={[...CH4.region]} color={PURPLE} />
        </FigureCard>

        <FigureCard
          ref_="Section 4.2.3"
          title={<>Disease <span className="hl">category</span></>}
          interpretation={
            <>
              Pediatric indications dominate at <b>72.26%</b>, followed by Neurology (20.36%). This
              distribution mirrors real referral patterns for genetic testing in the Philippines
              and turns out to be the strongest predictor of test type (Section 4.9).
            </>
          }
        >
          <BarsHoriz data={[...CH4.disease]} color={TEAL} />
        </FigureCard>

        <FigureCard
          ref_="Section 4.2.4"
          title={<>Facility <span className="hl">type</span></>}
          interpretation={
            <>
              <b>99.11%</b> of records come from private facilities. The paper treats this as a
              fairness caveat (Section 4.12.3): the model's public-facility behavior is
              extrapolated from only 4 records and should not be used to make institutional
              decisions.
            </>
          }
        >
          <DonutPct data={[...CH4.facility]} colors={[PURPLE, MUSTARD]} />
        </FigureCard>

        <FigureCard
          ref_="Section 4.2.1"
          title={<>Sex <span className="hl">distribution</span></>}
          interpretation={
            <>
              Male <b>54.59%</b>, Female <b>45.41%</b> — approximately balanced. Sex is a weak
              predictor in Table 10 (OR ≈ 1.12, not statistically significant).
            </>
          }
        >
          <DonutPct data={[...CH4.sex]} colors={[TEAL, PURPLE]} />
        </FigureCard>
      </div>

      {/* ───────────── CROSS-TABS ───────────── */}
      <div id="sec-cross" className="scroll-mt-24 space-y-6">
        <FigureCard
          ref_="Cross-tab · Section 4.2.2"
          title={<>Region × <span className="hl">test type</span></>}
          interpretation={
            <>
              In Luzon, Comprehensive dominates (315 vs 77). In Visayas and Mindanao the pattern
              inverts — Targeted testing is <i>more</i> common than Comprehensive. This regional
              inversion is what produces the <b>OR ≈ 0.46</b> interaction term for Mindanao ×
              Neurology in Table 10.
            </>
          }
        >
          <GroupedBars data={[...CH4.regionXTest]} keys={["Comprehensive", "Targeted"]} />
        </FigureCard>

        <FigureCard
          ref_="Cross-tab · Section 4.2.3"
          title={<>Disease category × <span className="hl">test type</span></>}
          interpretation={
            <>
              Pediatrics is overwhelmingly Comprehensive (296 vs 27). Neurology is nearly split
              (39 vs 52). Metabolic is <b>100% Targeted</b> in this dataset, and "Others" leans
              Targeted (14 of 18). Clinical referral pathway therefore carries most of the
              predictive signal.
            </>
          }
        >
          <GroupedBars data={[...CH4.diseaseXTest]} keys={["Comprehensive", "Targeted"]} />
        </FigureCard>

        <FigureCard
          ref_="Cross-tab · Section 4.2.1"
          title={<>Sex × <span className="hl">test type</span></>}
          interpretation={
            <>
              Male: 179 Comprehensive / 65 Targeted. Female: 160 / 43. The ratios are close, which
              is consistent with sex being a weak predictor in the logistic regression.
            </>
          }
        >
          <GroupedBars data={[...CH4.sexXTest]} keys={["Comprehensive", "Targeted"]} />
        </FigureCard>

        <FigureCard
          ref_="Table 10 · Section 4.8"
          title={<>Logistic regression <span className="hl">coefficients</span></>}
          subtitle="Selected coefficients and odds ratios from the primary Binary Logistic Regression model"
          interpretation={
            <>
              Positive coefficients push predictions toward Comprehensive profiling; negative
              coefficients push toward Targeted. Pediatric disease category has the strongest
              positive effect (OR ≈ 11.14). Interaction terms for Mindanao × Neurology (OR ≈ 0.46)
              and Visayas × Neurology (OR ≈ 0.48) show these regional neurology cases are far less
              likely to receive Comprehensive testing — a key equity finding.
            </>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-card-foreground/15">
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Feature</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Coefficient</th>
                  <th className="py-2 pr-0 eyebrow text-card-foreground/60 text-[10px]">Odds Ratio</th>
                </tr>
              </thead>
              <tbody>
                {CH4.coefficients.map((c) => (
                  <tr key={c.feature} className="border-b border-card-foreground/10 last:border-b-0">
                    <td className="py-2 pr-4 font-medium">{c.feature}</td>
                    <td className={"py-2 pr-4 tabular-nums " + (c.coef < 0 ? "text-coral" : "")}>
                      {c.coef > 0 ? "+" : ""}{c.coef.toFixed(2)}
                    </td>
                    <td className="py-2 pr-0 tabular-nums">{c.or.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FigureCard>

        <FigureCard
          ref_="Figure 5 · Section 4.9"
          title={<>Correlation <span className="hl">matrix</span></>}
          subtitle="Key associations between encoded predictors and the target variable"
          interpretation={
            <>
              The strongest correlation with the target is <b>Pediatrics (r = 0.60)</b>, confirming
              disease category as the dominant predictor. Interaction terms correlate with their
              parent variables (Mindanao × Neurology ↔ Mindanao at 0.93) as expected — the paper
              notes this is a mathematical artifact, not a modeling problem, and L1 regularization
              in Logistic Regression handles the redundancy through coefficient shrinkage. The
              −0.82 between Pediatrics and Neurology is a one-hot encoding artifact (a record
              cannot belong to both).
            </>
          }
        >
          <ul className="space-y-2">
            {CH4.correlations.map((c) => {
              const width = Math.min(100, Math.abs(c.r) * 100);
              const positive = c.r >= 0;
              return (
                <li key={c.pair} className="rounded-xl bg-card-foreground/5 px-4 py-3">
                  <div className="flex items-center justify-between text-xs mb-1.5 gap-4">
                    <span className="font-medium truncate">{c.pair}</span>
                    <span className={"tabular-nums font-semibold shrink-0 " + (positive ? "text-teal-600" : "text-coral")}>
                      {c.r > 0 ? "+" : ""}{c.r.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card-foreground/10 overflow-hidden">
                    <div
                      className={"h-full " + (positive ? "bg-teal" : "bg-coral")}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-card-foreground/60 mt-1.5">{c.note}</div>
                </li>
              );
            })}
          </ul>
        </FigureCard>
      </div>
    </div>
  );
}

/* ------------------------ System Evaluation (Chapter 4 · §4.5–4.10) ------------------------ */

function SystemEvaluationCard() {
  const best = modelData.best_model_name as string;
  const models = modelData.models as unknown as Record<
    string,
    {
      results: Record<string, number> & { cm: number[][] };
      cv: { cv_roc_mean: number; cv_roc_std: number; cv_acc_mean: number; cv_acc_std: number };
      feature_importance: { feature: string; importance: number }[];
    }
  >;
  const rows = Object.entries(models).map(([name, m]) => ({
    name,
    accuracy: m.results.Accuracy,
    precision: m.results.Precision,
    recall: m.results.Recall,
    f1: m.results["F1-Score"],
    roc: m.results["ROC-AUC"],
  }));
  const fi = models[best].feature_importance;
  const cm = models[best].results.cm; // [[TN,FP],[FN,TP]]
  const fmt = (n: number) => (n * 100).toFixed(1) + "%";

  const sections: { id: string; label: string }[] = [
    { id: "eval-compare", label: "Comparison" },
    { id: "eval-tuning", label: "Tuning" },
    { id: "eval-perclass", label: "Per-class" },
    { id: "eval-importance", label: "Importance" },
    { id: "eval-cm", label: "Confusion" },
    { id: "eval-cv", label: "Cross-validation" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
        <img src={magnifier} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
        <div className="eyebrow text-coral mb-2">Chapter 4 · §4.5 – §4.10</div>
        <h2 className="font-display text-3xl mb-3">
          Model <span className="hl">evaluation</span>
        </h2>
        <p className="text-sm leading-relaxed text-card-foreground/80 max-w-2xl mb-5">
          How the three candidate models were tuned, tested, and compared — with every table and
          figure from the paper's evaluation sections. The deployed model is{" "}
          <b>{best}</b>, chosen for its strongest ROC-AUC and stability across folds.
        </p>
        <nav className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="eyebrow text-[11px] px-3 py-1.5 rounded-full bg-cream-dim hover:bg-coral hover:text-card-foreground transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      <div id="eval-compare" className="scroll-mt-24">
        <FigureCard
          ref_="Table 9 · Section 4.10 · Figure 6 (Results)"
          title={<>Model <span className="hl">comparison</span></>}
          subtitle="Test-set performance on 90 held-out records"
          interpretation={
            <>
              All three models cluster in the 81–84% accuracy band. Decision Tree edges out on
              accuracy and recall; <b>Random Forest</b> is selected as the deployed model for its
              strongest <b>ROC-AUC (0.796)</b> and most stable feature-importance profile. Binary
              Logistic Regression remains the primary interpretive model (Table 10).
            </>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-card-foreground/15">
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Model</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Accuracy</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Precision</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Recall</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">F1</th>
                  <th className="py-2 pr-0 eyebrow text-card-foreground/60 text-[10px]">ROC-AUC</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-card-foreground/10 last:border-b-0">
                    <td className="py-2 pr-4 font-medium">
                      {r.name}
                      {r.name === best && (
                        <span className="ml-2 text-[10px] eyebrow text-coral">Deployed</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{fmt(r.accuracy)}</td>
                    <td className="py-2 pr-4 tabular-nums">{fmt(r.precision)}</td>
                    <td className="py-2 pr-4 tabular-nums">{fmt(r.recall)}</td>
                    <td className="py-2 pr-4 tabular-nums">{fmt(r.f1)}</td>
                    <td className="py-2 pr-0 tabular-nums">{fmt(r.roc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FigureCard>
      </div>

      <div id="eval-tuning" className="scroll-mt-24">
        <FigureCard
          ref_="Table 7 · Section 4.5"
          title={<>Optimal <span className="hl">hyperparameters</span></>}
          subtitle="Selected by GridSearchCV with 5-fold stratified CV and ROC-AUC as the scoring metric"
          interpretation={
            <>
              All three models were tuned on the training partition only. Logistic Regression's L1
              penalty automatically zeros out weak predictors, and its <i>balanced</i> class-weight
              setting compensates for the 75.8 / 24.2 imbalance. The three best CV ROC-AUC scores
              lie within 0.004 of each other, confirming a genuine — but modest — predictive
              signal.
            </>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-card-foreground/15">
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Model</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Best parameters</th>
                  <th className="py-2 pr-0 eyebrow text-card-foreground/60 text-[10px]">CV ROC-AUC</th>
                </tr>
              </thead>
              <tbody>
                {CH4.hyperparameters.map((h) => (
                  <tr key={h.model} className="border-b border-card-foreground/10 last:border-b-0">
                    <td className="py-2 pr-4 font-medium">{h.model}</td>
                    <td className="py-2 pr-4 text-card-foreground/80">{h.params}</td>
                    <td className="py-2 pr-0 tabular-nums">{(h.cvRoc * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FigureCard>
      </div>

      <div id="eval-perclass" className="scroll-mt-24">
        <FigureCard
          ref_="Section 4.7.1"
          title={<>Per-class <span className="hl">performance</span></>}
          subtitle="Precision, recall, and F1 broken out by class on the 90-record test set"
          interpretation={
            <>
              Aggregate accuracy hides an imbalance in minority-class handling. Decision Tree posts
              the highest recall on Comprehensive (0.9559) but only <b>0.50 recall on Targeted</b>,
              missing half of the minority-class cases. Logistic Regression provides the most
              symmetric behaviour (Targeted recall 0.6364) and the highest <b>macro F1 (0.7594)</b>,
              which weights both classes equally. This is why the paper reports the full metric
              suite rather than headline accuracy.
            </>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left border-b border-card-foreground/15">
                  <th rowSpan={2} className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px] align-bottom">Model</th>
                  <th colSpan={3} className="py-1 pr-4 eyebrow text-card-foreground/60 text-[10px] text-center border-l border-card-foreground/10">Comprehensive</th>
                  <th colSpan={3} className="py-1 pr-4 eyebrow text-card-foreground/60 text-[10px] text-center border-l border-card-foreground/10">Targeted</th>
                  <th rowSpan={2} className="py-2 pr-2 eyebrow text-card-foreground/60 text-[10px] align-bottom border-l border-card-foreground/10">Macro F1</th>
                  <th rowSpan={2} className="py-2 pr-0 eyebrow text-card-foreground/60 text-[10px] align-bottom">Weighted F1</th>
                </tr>
                <tr className="text-left border-b border-card-foreground/15">
                  <th className="py-1 pr-3 eyebrow text-card-foreground/50 text-[10px] border-l border-card-foreground/10">P</th>
                  <th className="py-1 pr-3 eyebrow text-card-foreground/50 text-[10px]">R</th>
                  <th className="py-1 pr-4 eyebrow text-card-foreground/50 text-[10px]">F1</th>
                  <th className="py-1 pr-3 eyebrow text-card-foreground/50 text-[10px] border-l border-card-foreground/10">P</th>
                  <th className="py-1 pr-3 eyebrow text-card-foreground/50 text-[10px]">R</th>
                  <th className="py-1 pr-4 eyebrow text-card-foreground/50 text-[10px]">F1</th>
                </tr>
              </thead>
              <tbody>
                {CH4.perClass.map((r) => (
                  <tr key={r.model} className="border-b border-card-foreground/10 last:border-b-0">
                    <td className="py-2 pr-4 font-medium">{r.model}</td>
                    <td className="py-2 pr-3 tabular-nums border-l border-card-foreground/10">{r.comprehensive.precision.toFixed(3)}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.comprehensive.recall.toFixed(3)}</td>
                    <td className="py-2 pr-4 tabular-nums">{r.comprehensive.f1.toFixed(3)}</td>
                    <td className="py-2 pr-3 tabular-nums border-l border-card-foreground/10">{r.targeted.precision.toFixed(3)}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.targeted.recall.toFixed(3)}</td>
                    <td className="py-2 pr-4 tabular-nums">{r.targeted.f1.toFixed(3)}</td>
                    <td className="py-2 pr-2 tabular-nums border-l border-card-foreground/10">{r.macroF1.toFixed(3)}</td>
                    <td className="py-2 pr-0 tabular-nums">{r.weightedF1.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FigureCard>
      </div>

      <div id="eval-importance" className="scroll-mt-24 space-y-6">
        <FigureCard
          ref_="Table 11 · Section 4.9"
          title={<>Feature importance <span className="hl">across all models</span></>}
          subtitle="Absolute coefficients (LR) and built-in importance (DT, RF), averaged for consensus ranking"
          interpretation={
            <>
              Disease Category variables occupy the top four positions on the mean ranking, exactly
              matching the coefficient story in Table 10. <b>Mindanao × Neurology</b> reaches the
              third spot because Logistic Regression's L1 penalty preserves it while zeroing out
              the standalone regional coefficients — evidence that the region effect is
              conditional on clinical specialty rather than uniform.
            </>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-card-foreground/15">
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Feature</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">LR</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">DT</th>
                  <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">RF</th>
                  <th className="py-2 pr-0 eyebrow text-card-foreground/60 text-[10px]">Mean</th>
                </tr>
              </thead>
              <tbody>
                {CH4.featureImportanceAll.map((f) => (
                  <tr key={f.feature} className="border-b border-card-foreground/10 last:border-b-0">
                    <td className="py-2 pr-4 font-medium">{f.feature}</td>
                    <td className="py-2 pr-4 tabular-nums">{f.lr.toFixed(4)}</td>
                    <td className="py-2 pr-4 tabular-nums">{f.dt.toFixed(4)}</td>
                    <td className="py-2 pr-4 tabular-nums">{f.rf.toFixed(4)}</td>
                    <td className="py-2 pr-0 tabular-nums font-semibold">{f.mean.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FigureCard>

        <FigureCard
          ref_="Table 11 · Section 4.9"
          title={<>Feature <span className="hl">importance</span></>}
          subtitle={`Ranked from ${best} — the deployed model`}
          interpretation={
            <>
              <b>Disease Category</b> is the dominant predictor across all three models,
              consistent with the cross-tabs in Section 4.2.3. Year and Region × Disease
              interactions provide meaningful secondary signal; Sex and Facility Type are
              near-zero. This ranking is what justifies focusing recommendations on{" "}
              <i>clinical referral pathway</i> as the primary lever (Chapter 6).
            </>
          }
        >
          <ul className="space-y-3">
            {fi.map((f) => (
              <li key={f.feature}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{f.feature}</span>
                  <span className="text-card-foreground/60 tabular-nums">
                    {(f.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-card-foreground/10 overflow-hidden">
                  <div
                    className="h-full bg-coral"
                    style={{ width: `${Math.max(2, f.importance * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </FigureCard>
      </div>

      <div id="eval-cm" className="scroll-mt-24">
        <FigureCard
          ref_="Figure 3 (Results) · Section 4.7"
          title={<>Confusion <span className="hl">matrix</span></>}
          subtitle={`${best} on the 90-record test set`}
          interpretation={
            <>
              The model correctly classifies <b>{cm[0][0]}</b> Targeted and <b>{cm[1][1]}</b>{" "}
              Comprehensive cases. It misses <b>{cm[1][0]}</b> Comprehensive cases (predicted
              Targeted) and misclassifies <b>{cm[0][1]}</b> Targeted cases as Comprehensive. The
              paper notes minority-class recall (Targeted) as the main improvement target — see
              Section 4.7.1.
            </>
          }
        >
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-xs">
              <div />
              <div className="eyebrow text-card-foreground/60 text-center text-[10px]">
                Pred. Targeted
              </div>
              <div className="eyebrow text-card-foreground/60 text-center text-[10px]">
                Pred. Comprehensive
              </div>

              <div className="eyebrow text-card-foreground/60 text-[10px] flex items-center">
                Actual Targeted
              </div>
              <div className="rounded-xl bg-teal p-4 text-center">
                <div className="text-2xl font-semibold text-[var(--ink)]">{cm[0][0]}</div>
                <div className="text-[10px] text-[var(--ink)]/70 uppercase tracking-wider">
                  True Neg.
                </div>
              </div>
              <div className="rounded-xl bg-card-foreground/10 p-4 text-center">
                <div className="text-2xl font-semibold">{cm[0][1]}</div>
                <div className="text-[10px] text-card-foreground/60 uppercase tracking-wider">
                  False Pos.
                </div>
              </div>

              <div className="eyebrow text-card-foreground/60 text-[10px] flex items-center">
                Actual Compreh.
              </div>
              <div className="rounded-xl bg-card-foreground/10 p-4 text-center">
                <div className="text-2xl font-semibold">{cm[1][0]}</div>
                <div className="text-[10px] text-card-foreground/60 uppercase tracking-wider">
                  False Neg.
                </div>
              </div>
              <div className="rounded-xl bg-coral p-4 text-center">
                <div className="text-2xl font-semibold text-card-foreground">{cm[1][1]}</div>
                <div className="text-[10px] text-card-foreground/80 uppercase tracking-wider">
                  True Pos.
                </div>
              </div>
            </div>
          </div>
        </FigureCard>
      </div>

      <div id="eval-cv" className="scroll-mt-24">
        <FigureCard
          ref_="Table 8 · Section 4.6"
          title={<>Cross-validation <span className="hl">stability</span></>}
          subtitle="5-fold ROC-AUC on the training set"
          interpretation={
            <>
              All models converge to a similar cross-validated ROC-AUC of ~0.82–0.83 with modest
              variance (± 0.06 – 0.08). The overlap across folds indicates the ranking between
              models is not driven by a single fortunate split — supporting the choice of Random
              Forest as the deployed model.
            </>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart
                data={Object.entries(CH4.cvFolds).flatMap(([m, folds]) =>
                  folds.map((v, i) => ({ name: `F${i + 1}`, [m]: v }))
                    .reduce((acc, r) => {
                      const found = acc.find((x) => x.name === r.name);
                      if (found) Object.assign(found, r);
                      else acc.push(r);
                      return acc;
                    }, [] as Record<string, string | number>[])
                ).reduce((acc, r) => {
                  const found = acc.find((x) => x.name === r.name);
                  if (found) Object.assign(found, r);
                  else acc.push(r);
                  return acc;
                }, [] as Record<string, string | number>[])}
                margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
              >
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={axisTick} stroke={INK} />
                <YAxis domain={[0.6, 1]} tick={axisTick} stroke={INK} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip contentStyle={tooltipStyle} formatter={((v: unknown) => (typeof v === "number" ? v.toFixed(3) : String(v))) as never} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="Binary Logistic Regression" fill={PURPLE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Decision Tree" fill={TEAL} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Random Forest" fill={MUSTARD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FigureCard>
      </div>
    </div>
  );
}

/* ------------------------ System Evaluation Survey (Chapter 4 · §4.13) ------------------------ */

type SurveyItem = { label: string; mean: number; sd: number };
type SurveyCategory = {
  key: string;
  table: string;
  name: string;
  mean: number;
  sd: number;
  interpretation: string;
  items: SurveyItem[];
  summary: string;
};

const SURVEY: SurveyCategory[] = [
  {
    key: "functionality",
    table: "Table 12",
    name: "System Functionality",
    mean: 4.87,
    sd: 0.30,
    interpretation:
      "Respondents strongly affirmed that the system correctly processes all indicators, performs without errors, and effectively distinguishes between test types.",
    items: [
      { label: "The system correctly processes input data", mean: 4.94, sd: 0.24 },
      { label: "The predictive model generates accurate and reliable results", mean: 4.65, sd: 0.49 },
      { label: "The system effectively distinguishes between targeted and comprehensive testing", mean: 4.94, sd: 0.24 },
      { label: "The system performs its intended functions without errors", mean: 4.94, sd: 0.24 },
    ],
    summary: "Category Weighted Mean · 4.87",
  },
  {
    key: "performance",
    table: "Table 13",
    name: "Performance and Efficiency",
    mean: 4.76,
    sd: 0.40,
    interpretation:
      "Respondents affirmed the appropriateness of the evaluation metrics and the system's capacity to support decision-making.",
    items: [
      { label: "The outputs of the system are consistent and dependable", mean: 4.59, sd: 0.51 },
      { label: "The model evaluation metrics are appropriate", mean: 4.94, sd: 0.24 },
      { label: "The system provides meaningful insights for decision-making", mean: 4.76, sd: 0.44 },
    ],
    summary: "Category Weighted Mean · 4.76",
  },
  {
    key: "security",
    table: "Table 14",
    name: "Security and Data Privacy",
    mean: 4.91,
    sd: 0.29,
    interpretation:
      "Highest category mean — reflects strong evaluator confidence in the system's compliance with RA 10173 and its data protection framework.",
    items: [
      { label: "The system ensures data confidentiality and protects sensitive information", mean: 4.88, sd: 0.33 },
      { label: "The system implements proper authentication and access control", mean: 4.94, sd: 0.24 },
      { label: "The system complies with data privacy and security standards", mean: 4.94, sd: 0.24 },
      { label: "The system securely stores and manages user and patient data", mean: 4.88, sd: 0.33 },
    ],
    summary: "Category Weighted Mean · 4.91",
  },
  {
    key: "maintainability",
    table: "Table 15",
    name: "Maintainability",
    mean: 4.87,
    sd: 0.32,
    interpretation:
      "Respondents affirmed that the system is adaptable to future data requirements and flexible enough to accommodate additional features.",
    items: [
      { label: "The system can be easily updated and improved when necessary", mean: 4.88, sd: 0.33 },
      { label: "The system can adapt to future changes in healthcare data requirements", mean: 4.94, sd: 0.24 },
      { label: "The system structure is organized and manageable for future development", mean: 4.71, sd: 0.47 },
      { label: "The system is flexible enough to support additional features or modules", mean: 4.94, sd: 0.24 },
    ],
    summary: "Category Weighted Mean · 4.87",
  },
  {
    key: "reliability",
    table: "Table 16",
    name: "Reliability",
    mean: 4.81,
    sd: 0.34,
    interpretation:
      "Respondents affirmed that the system handles data processing without interruptions and maintains data integrity throughout analysis.",
    items: [
      { label: "The system can handle data processing without unexpected interruptions", mean: 4.94, sd: 0.24 },
      { label: "The outputs generated by the system are trustworthy and consistent", mean: 4.53, sd: 0.51 },
      { label: "The system produces stable predictive outputs over time", mean: 4.82, sd: 0.39 },
      { label: "The system maintains data integrity throughout processing and analysis", mean: 4.94, sd: 0.24 },
    ],
    summary: "Category Weighted Mean · 4.81",
  },
];

const LIKERT_SCALE = [
  { range: "4.50 – 5.00", label: "Strongly Agree" },
  { range: "3.50 – 4.49", label: "Agree" },
  { range: "2.50 – 3.49", label: "Neutral" },
  { range: "1.50 – 2.49", label: "Disagree" },
  { range: "1.00 – 1.49", label: "Strongly Disagree" },
];

function MeanBar({ mean, sd }: { mean: number; sd: number }) {
  const pct = (mean / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-card-foreground/10 overflow-hidden min-w-[120px]">
        <div className="h-full bg-coral" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-sm font-semibold shrink-0 w-12 text-right">
        {mean.toFixed(2)}
      </span>
      <span className="tabular-nums text-[11px] text-card-foreground/60 shrink-0 w-14 text-right">
        σ {sd.toFixed(2)}
      </span>
    </div>
  );
}

function SurveyEvaluationCard() {
  const grand = 4.84;
  const grandSd = 0.33;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-10 relative overflow-hidden">
        <img src={heartPulse} alt="" className="hidden md:block absolute right-6 top-6 w-20 object-contain opacity-90" />
        <div className="eyebrow text-coral mb-2">Chapter 4 · §4.13</div>
        <h2 className="font-display text-3xl mb-3">
          System <span className="hl">evaluation</span>
        </h2>
        <p className="text-sm leading-relaxed text-card-foreground/80 max-w-2xl mb-5">
          The GeneScope system was evaluated by <b>17 respondents</b> — CS faculty, field
          application specialists, product specialists, supervisors, sales executives, marketing
          assistants, and department managers from Far Eastern University — Institute of Technology
          and the partnered company. Respondents rated the system across five categories using a
          five-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree). Weighted means were
          interpreted using the scale defined in Section 3.10.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Respondents" value={17} />
          <StatTile label="Categories" value={5} />
          <StatTile label="Indicators" value={19} />
          <StatTile label="Grand mean" value={grand.toFixed(2)} sub="Strongly Agree" />
        </div>
      </div>

      {/* Likert scale reference */}
      <FigureCard
        ref_="Section 3.10 · Interpretation scale"
        title={<>Likert <span className="hl">interpretation scale</span></>}
        subtitle="Weighted-mean ranges applied to every indicator in Tables 12 – 17"
      >
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {LIKERT_SCALE.map((s) => (
            <div key={s.range} className="rounded-xl bg-cream-dim px-3 py-3 text-center">
              <div className="tabular-nums text-sm font-semibold">{s.range}</div>
              <div className="text-[11px] text-card-foreground/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </FigureCard>

      {/* Per-category tables */}
      {SURVEY.map((cat) => (
        <FigureCard
          key={cat.key}
          ref_={`${cat.table} · Section 4.13`}
          title={<>{cat.name.split(" ").slice(0, -1).join(" ")} <span className="hl">{cat.name.split(" ").slice(-1)[0]}</span></>}
          subtitle={`${cat.summary} · SD ${cat.sd.toFixed(2)} · Strongly Agree`}
          interpretation={<>{cat.interpretation}</>}
        >
          <ul className="space-y-3">
            {cat.items.map((it, idx) => (
              <li key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-2 md:gap-6 items-center py-2 border-b border-card-foreground/10 last:border-b-0">
                <span className="text-sm">{it.label}</span>
                <MeanBar mean={it.mean} sd={it.sd} />
              </li>
            ))}
            <li className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-2 md:gap-6 items-center pt-3">
              <span className="eyebrow text-coral text-[11px]">Category Weighted Mean</span>
              <MeanBar mean={cat.mean} sd={cat.sd} />
            </li>
          </ul>
        </FigureCard>
      ))}

      {/* Overall summary */}
      <FigureCard
        ref_="Table 17 · Section 4.13"
        title={<>Overall system <span className="hl">evaluation summary</span></>}
        subtitle={`Grand Weighted Mean · ${grand.toFixed(2)} · SD ${grandSd.toFixed(2)} · Strongly Agree`}
        interpretation={
          <>
            The GeneScope system received a <b>Grand Weighted Mean of {grand.toFixed(2)}</b>,
            interpreted as <b>Strongly Agree</b>. All 19 indicators and all five category means
            fell within the Strongly Agree range. <b>Security and Data Privacy</b> received the
            highest mean at 4.91, while <b>Performance and Efficiency</b> received the lowest at
            4.76 — pointing to output consistency as a marginal area for future improvement,
            consistent with the minority-class limitations identified in the model evaluation.
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-card-foreground/15">
                <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Category</th>
                <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">Weighted Mean</th>
                <th className="py-2 pr-4 eyebrow text-card-foreground/60 text-[10px]">SD</th>
                <th className="py-2 pr-0 eyebrow text-card-foreground/60 text-[10px]">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY.map((cat) => (
                <tr key={cat.key} className="border-b border-card-foreground/10">
                  <td className="py-2 pr-4 font-medium">{cat.name}</td>
                  <td className="py-2 pr-4 tabular-nums">{cat.mean.toFixed(2)}</td>
                  <td className="py-2 pr-4 tabular-nums">{cat.sd.toFixed(2)}</td>
                  <td className="py-2 pr-0 text-card-foreground/80">Strongly Agree</td>
                </tr>
              ))}
              <tr className="border-t-2 border-card-foreground/25">
                <td className="py-2 pr-4 font-semibold">Grand Weighted Mean</td>
                <td className="py-2 pr-4 tabular-nums font-semibold">{grand.toFixed(2)}</td>
                <td className="py-2 pr-4 tabular-nums font-semibold">{grandSd.toFixed(2)}</td>
                <td className="py-2 pr-0 font-semibold text-coral">Strongly Agree</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FigureCard>
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
