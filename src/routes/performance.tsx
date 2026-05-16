import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { getFeatureImportance, getMetrics, type ModelMetrics } from "@/lib/api";
import { BackendOfflineNotice } from "@/components/BackendOfflineNotice";
import { ChartCard } from "@/components/ChartCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — GeneScope" },
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

function pct(v: number) {
  return v <= 1 ? (v * 100).toFixed(1) + "%" : v.toFixed(1) + "%";
}
function asNum(v: number) {
  return v <= 1 ? v * 100 : v;
}

function ConfusionMatrix({ name, matrix }: { name: string; matrix?: number[][] }) {
  if (!matrix || matrix.length !== 2) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold">{name}</h3>
        <p className="mt-2 text-xs text-muted-foreground">No confusion matrix data.</p>
      </div>
    );
  }
  const max = Math.max(...matrix.flat());
  const labels = ["Targeted", "Comprehensive"];
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold mb-3">{name} — Confusion Matrix</h3>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 text-xs">
        <div />
        {labels.map((l) => (
          <div key={l} className="text-center font-medium text-muted-foreground">Pred {l}</div>
        ))}
        {matrix.map((row, i) => (
          <>
            <div key={`l-${i}`} className="flex items-center font-medium text-muted-foreground">{labels[i]}</div>
            {row.map((v, j) => {
              const a = max ? v / max : 0;
              return (
                <div
                  key={`c-${i}-${j}`}
                  className="h-16 rounded-lg flex items-center justify-center font-semibold text-foreground"
                  style={{ background: `rgba(13, 148, 136, ${0.08 + a * 0.55})` }}
                >
                  {v}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function ModelCard({ m }: { m: ModelMetrics }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">{m.name}</h3>
      <div className="mt-4 space-y-3">
        {METRIC_KEYS.map((k) => (
          <div key={k}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{METRIC_LABELS[k]}</span>
              <span className="font-medium tabular-nums">{pct(m[k] as number)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${asNum(m[k] as number)}%` }} />
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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

  // ROC overlay (line per model)
  const rocData: Record<string, number | undefined>[] = [];
  if (models.length) {
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const row: Record<string, number | undefined> = { fpr: x };
      models.forEach((m) => {
        if (m.roc_curve?.fpr?.length && m.roc_curve?.tpr?.length) {
          // nearest neighbor lookup
          const fprs = m.roc_curve.fpr;
          let bestIdx = 0;
          let bestDiff = Infinity;
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

  const colors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-5)"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up space-y-10">
      <div>
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2">
          Evaluation
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">Model Performance</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Comparative evaluation of Binary Logistic Regression, Decision Tree, and Random Forest.
        </p>
      </div>

      {/* Primary model card */}
      <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          Primary Model
        </div>
        <h2 className="text-xl font-semibold">Binary Logistic Regression</h2>
        <p className="mt-2 text-sm text-foreground/85 leading-relaxed max-w-3xl">
          Binary Logistic Regression is the primary prediction model of this
          study. It estimates the probability that a patient undergoes
          Comprehensive Profiling versus Targeted Testing based on the six input
          indicators.
        </p>
        <div className="mt-5 rounded-xl bg-muted/60 p-5 font-mono text-sm overflow-x-auto">
          log( P(Y=1) / 1 − P(Y=1) ) = β₀ + β₁X₁ + β₂X₂ + … + β<sub>k</sub>X<sub>k</sub>
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-sm font-semibold">Comparison Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">Model</th>
                {METRIC_KEYS.map((k) => (
                  <th key={k} className="text-right px-6 py-3">{METRIC_LABELS[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name} className="border-t">
                  <td className="px-6 py-3 font-medium">{m.name}</td>
                  {METRIC_KEYS.map((k) => (
                    <td key={k} className="px-6 py-3 text-right tabular-nums">{pct(m[k] as number)}</td>
                  ))}
                </tr>
              ))}
              {!models.length && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground text-sm">Loading metrics…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Three model cards */}
      {models.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">
          {models.map((m) => <ModelCard key={m.name} m={m} />)}
        </div>
      )}

      {/* Grouped bar across all metrics */}
      {models.length > 0 && (
        <ChartCard title="Metrics across all models" description="All five metrics, side-by-side per model">
          <ResponsiveContainer>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {models.map((m, i) => (
                <Bar key={m.name} dataKey={m.name} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Confusion matrices */}
      {models.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">
          {models.map((m) => <ConfusionMatrix key={m.name} name={m.name} matrix={m.confusion_matrix} />)}
        </div>
      )}

      {/* ROC overlay */}
      {models.length > 0 && rocData.length > 0 && (
        <ChartCard title="ROC Curve" description="True positive rate vs false positive rate">
          <ResponsiveContainer>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="fpr"
                tick={{ fontSize: 11 }}
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
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

      {/* Feature importance */}
      {fiQ.data && (
        <ChartCard title="Feature Importance" description="From the trained primary model">
          <ResponsiveContainer>
            <BarChart data={fiQ.data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={140} />
              <Tooltip />
              <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                {fiQ.data.map((_, i) => <Cell key={i} fill="var(--color-primary)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* CV + Testing */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold">5-Fold Cross Validation</h2>
          <p className="text-xs text-muted-foreground mt-1">Mean accuracy ± standard deviation</p>
          <div className="mt-4 space-y-3">
            {models.map((m) => (
              <div key={m.name} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-sm font-medium">{m.name}</span>
                <span className="text-sm tabular-nums">
                  {m.cv_mean != null ? `${pct(m.cv_mean)} ± ${m.cv_std != null ? pct(m.cv_std) : "—"}` : "—"}
                </span>
              </div>
            ))}
            {!models.length && <p className="text-xs text-muted-foreground">No CV data.</p>}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold">Testing Methods</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              "White Box Testing",
              "Integration Testing",
              "Black Box Testing",
              "Performance & Accuracy Validation",
              "Alpha/Beta Acceptance Testing",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
