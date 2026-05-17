import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { getFeatureImportance, getMetrics, type ModelMetrics } from "@/lib/api";
import { BackendOfflineNotice } from "@/components/BackendOfflineNotice";
import { ChartCard } from "@/components/ChartCard";
import chromosome from "@/assets/illustrations/chromosome.png";
import labFlask from "@/assets/illustrations/lab-flask.png";
import clipboard from "@/assets/illustrations/clipboard.png";
import dnaStrand from "@/assets/illustrations/dna-strand.png";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "GeneScope" },
      { name: "description", content: "Comparative evaluation of Binary Logistic Regression, Decision Tree, and Random Forest." },
    ],
  }),
  component: PerformancePage,
});

const METRIC_KEYS = ["accuracy", "precision", "recall", "f1", "roc_auc"] as const;
const METRIC_LABELS: Record<(typeof METRIC_KEYS)[number], string> = {
  accuracy: "Accuracy",
  precision: "Precision",
  recall: "Recall",
  f1: "F1-Score",
  roc_auc: "ROC-AUC",
};

const tooltipStyle = {
  background: "var(--green-deep)",
  color: "var(--cream)",
  border: "none",
  borderRadius: 12,
  fontSize: 12,
};
const axisTick = { fontSize: 11, fill: "var(--green-deep)" };
const gridStroke = "rgba(15,61,46,0.12)";

function pct(v: number) {
  return v <= 1 ? (v * 100).toFixed(1) + "%" : v.toFixed(1) + "%";
}
function asNum(v: number) {
  return v <= 1 ? v * 100 : v;
}

function ConfusionMatrix({ name, matrix }: { name: string; matrix?: number[][] }) {
  if (!matrix || matrix.length !== 2) {
    return (
      <div className="rounded-2xl bg-card text-card-foreground p-6">
        <h3 className="font-display text-lg">{name}</h3>
        <p className="mt-2 text-xs text-card-foreground/65">No confusion matrix data.</p>
      </div>
    );
  }
  const max = Math.max(...matrix.flat());
  const labels = ["Targeted", "Comprehensive"];
  return (
    <div className="rounded-2xl bg-card text-card-foreground p-6">
      <h3 className="font-display text-lg mb-4">{name}</h3>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 text-xs">
        <div />
        {labels.map((l) => (
          <div key={l} className="text-center font-semibold text-card-foreground/65 uppercase tracking-wider text-[10px]">Pred {l}</div>
        ))}
        {matrix.map((row, i) => (
          <div key={`row-${i}`} className="contents">
            <div className="flex items-center font-semibold text-card-foreground/65 uppercase tracking-wider text-[10px]">{labels[i]}</div>
            {row.map((v, j) => {
              const a = max ? v / max : 0;
              return (
                <div
                  key={`c-${i}-${j}`}
                  className="h-16 rounded-lg flex items-center justify-center font-display text-lg"
                  style={{ background: `color-mix(in oklab, var(--coral) ${10 + a * 70}%, transparent)` }}
                >
                  {v}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelCard({ m }: { m: ModelMetrics }) {
  return (
    <div className="rounded-2xl bg-card text-card-foreground p-6">
      <h3 className="font-display text-xl">{m.name}</h3>
      <div className="mt-5 space-y-3.5">
        {METRIC_KEYS.map((k) => (
          <div key={k}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="uppercase tracking-wider font-semibold text-card-foreground/65">{METRIC_LABELS[k]}</span>
              <span className="font-display tabular-nums">{pct(m[k] as number)}</span>
            </div>
            <div className="h-2 rounded-full bg-green-deep/10 overflow-hidden">
              <div className="h-full bg-coral rounded-full" style={{ width: `${asNum(m[k] as number)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformancePage() {
  const metricsQ = useQuery({ queryKey: ["metrics"], queryFn: getMetrics, retry: 0 });
  const fiQ = useQuery({ queryKey: ["feature-importance"], queryFn: getFeatureImportance, retry: 0 });

  if (metricsQ.isError && fiQ.isError) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16">
        <BackendOfflineNotice onRetry={() => { metricsQ.refetch(); fiQ.refetch(); }} />
      </div>
    );
  }

  const models: ModelMetrics[] = metricsQ.data
    ? Array.isArray(metricsQ.data) ? metricsQ.data : metricsQ.data.models
    : [];

  const comparisonData = METRIC_KEYS.map((k) => {
    const row: Record<string, number | string> = { metric: METRIC_LABELS[k] };
    models.forEach((m) => { row[m.name] = asNum(m[k] as number); });
    return row;
  });

  const rocData: Record<string, number | undefined>[] = [];
  if (models.length) {
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const row: Record<string, number | undefined> = { fpr: x };
      models.forEach((m) => {
        if (m.roc_curve?.fpr?.length && m.roc_curve?.tpr?.length) {
          const fprs = m.roc_curve.fpr;
          let bestIdx = 0, bestDiff = Infinity;
          for (let j = 0; j < fprs.length; j++) {
            const d = Math.abs(fprs[j] - x);
            if (d < bestDiff) { bestDiff = d; bestIdx = j; }
          }
          row[m.name] = m.roc_curve.tpr[bestIdx];
        }
      });
      rocData.push(row);
    }
  }

  const colors = ["var(--coral)", "var(--green-deep)", "var(--teal-soft)"];

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 space-y-14 z-10">
      <div className="max-w-3xl">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="eyebrow text-coral mb-4">Evaluation</div>
            <h1 className="display-lg">
              Three models,
              <br />
              <span className="hl">one chosen for the job.</span>
            </h1>
            <p className="mt-5 text-foreground/75">
              Comparative evaluation of Binary Logistic Regression, Decision Tree, and Random Forest.
            </p>
          </div>
        </div>
      </div>

      {/* Primary model hero */}
      <div className="rounded-3xl bg-card text-card-foreground p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 rounded-3xl ring-4 ring-coral pointer-events-none" />
        <div className="relative">
          <div className="eyebrow text-coral mb-3">Primary model</div>
          <h2 className="display-md">
            Binary <span className="hl">Logistic Regression</span>
          </h2>
          <p className="mt-5 max-w-3xl leading-relaxed">
            Binary Logistic Regression is the primary prediction model of this study.
            It estimates the probability that a patient undergoes Comprehensive Profiling
            versus Targeted Testing based on the six input indicators.
          </p>
          <div className="mt-6 rounded-2xl bg-green-deep text-cream p-6 font-mono text-sm md:text-base overflow-x-auto">
            log( P(Y=1) / 1 − P(Y=1) ) = β₀ + β₁X₁ + β₂X₂ + … + β<sub>k</sub>X<sub>k</sub>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-3xl bg-card text-card-foreground overflow-hidden">
        <div className="px-7 py-5 border-b border-card-foreground/10">
          <div className="eyebrow text-coral mb-1">Comparison</div>
          <h2 className="font-display text-2xl">All five metrics, side by <span className="hl">side</span></h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-dim text-xs uppercase tracking-wider text-card-foreground/65">
              <tr>
                <th className="text-left px-7 py-4 font-semibold">Model</th>
                {METRIC_KEYS.map((k) => (
                  <th key={k} className="text-right px-7 py-4 font-semibold">{METRIC_LABELS[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name} className="border-t border-card-foreground/10">
                  <td className="px-7 py-4 font-display text-base">{m.name}</td>
                  {METRIC_KEYS.map((k) => (
                    <td key={k} className="px-7 py-4 text-right tabular-nums">{pct(m[k] as number)}</td>
                  ))}
                </tr>
              ))}
              {!models.length && (
                <tr><td colSpan={6} className="px-7 py-12 text-center text-card-foreground/65 text-sm">Loading metrics…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {models.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">
          {models.map((m) => <ModelCard key={m.name} m={m} />)}
        </div>
      )}

      {models.length > 0 && (
        <ChartCard title="Metrics across all models" description="All five metrics, side-by-side per model">
          <ResponsiveContainer>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="metric" tick={axisTick} />
              <YAxis tick={axisTick} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--green-deep)" }} />
              {models.map((m, i) => (
                <Bar key={m.name} dataKey={m.name} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {models.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">
          {models.map((m) => <ConfusionMatrix key={m.name} name={m.name} matrix={m.confusion_matrix} />)}
        </div>
      )}

      {models.length > 0 && rocData.length > 0 && (
        <ChartCard title="ROC Curve" description="True positive rate vs false positive rate">
          <ResponsiveContainer>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="fpr" tick={axisTick} type="number" domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <YAxis tick={axisTick} domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--green-deep)" }} />
              {models.map((m, i) => (
                <Line
                  key={m.name}
                  type="monotone"
                  dataKey={m.name}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  name={`${m.name} (AUC ${(m.roc_auc <= 1 ? m.roc_auc : m.roc_auc / 100).toFixed(3)})`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {fiQ.data && (
        <ChartCard title="Feature Importance" description="From the trained primary model">
          <ResponsiveContainer>
            <BarChart data={fiQ.data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} />
              <YAxis dataKey="feature" type="category" tick={axisTick} width={140} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="importance" radius={[0, 999, 999, 0]}>
                {fiQ.data.map((_, i) => <Cell key={i} fill="var(--coral)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl bg-card text-card-foreground p-7">
          <div className="eyebrow text-coral mb-2">Cross validation</div>
          <h2 className="font-display text-2xl">5-Fold Mean ± <span className="hl">SD</span></h2>
          <div className="mt-5 space-y-2.5">
            {models.map((m) => (
              <div key={m.name} className="flex items-center justify-between rounded-2xl bg-cream-dim px-5 py-4">
                <span className="text-sm font-semibold">{m.name}</span>
                <span className="text-sm tabular-nums font-display">
                  {m.cv_mean != null ? `${pct(m.cv_mean)} ± ${m.cv_std != null ? pct(m.cv_std) : "—"}` : "—"}
                </span>
              </div>
            ))}
            {!models.length && <p className="text-xs text-card-foreground/65">No CV data.</p>}
          </div>
        </div>

        <div className="rounded-3xl bg-card text-card-foreground p-7">
          <div className="eyebrow text-coral mb-2">Quality assurance</div>
          <h2 className="font-display text-2xl">Testing <span className="hl">methods</span></h2>
          <ul className="mt-5 space-y-2.5">
            {[
              "White Box Testing",
              "Integration Testing",
              "Black Box Testing",
              "Performance & Accuracy Validation",
              "Alpha/Beta Acceptance Testing",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm rounded-2xl bg-cream-dim px-5 py-3">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-coral">
                  <Check className="h-3.5 w-3.5 text-card-foreground" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}
