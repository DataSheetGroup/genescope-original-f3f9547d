import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Dna, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackendOfflineNotice } from "@/components/BackendOfflineNotice";
import {
  getFeatureImportance,
  postPredict,
  type PredictPayload,
  type PredictResponse,
} from "@/lib/api";
import { useHistory } from "@/hooks/useHistory";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict — GeneScope" },
      { name: "description", content: "Generate a genetic test type prediction from six patient indicators." },
    ],
  }),
  component: PredictPage,
});

type Form = Partial<Record<keyof PredictPayload, string>>;

const FIELDS: {
  key: keyof PredictPayload;
  label: string;
  indicator: string;
  options: string[];
}[] = [
  { key: "Sex", label: "Sex", indicator: "Demographic Indicator", options: ["Male", "Female"] },
  { key: "Geographic_Region", label: "Geographic Region", indicator: "Geographic Indicator", options: ["Luzon", "Visayas", "Mindanao"] },
  { key: "Location_Type", label: "Location Type", indicator: "Location Indicator", options: ["Urban", "Rural"] },
  { key: "Disease_Category", label: "Disease Category", indicator: "Clinical Indicator", options: ["Pediatrics", "Neurology", "Metabolic", "Others"] },
  { key: "Facility_Type", label: "Facility Type", indicator: "Institutional Indicator", options: ["Private", "Public"] },
  { key: "Year", label: "Year of Testing", indicator: "Temporal Indicator", options: ["2021", "2022", "2023", "2024", "2025"] },
];

function ConfidenceRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} stroke="currentColor" className="text-muted" strokeWidth="10" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          stroke="currentColor"
          className="text-primary"
          strokeWidth="10"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold tabular-nums">{value.toFixed(1)}%</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
      </div>
    </div>
  );
}

function ProbabilityBar({ comp, targ }: { comp: number; targ: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-2">
        <span className="text-success">Comprehensive {comp.toFixed(1)}%</span>
        <span className="text-accent">Targeted {targ.toFixed(1)}%</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className="bg-success" style={{ width: `${comp}%`, transition: "width 0.8s ease" }} />
        <div className="bg-accent" style={{ width: `${targ}%`, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

const KNOWLEDGE = {
  "Comprehensive Profiling": {
    definition:
      "The large-scale analysis of a wide array of genes, whole exomes, or whole genomes to detect multiple potential genetic alterations or assess an individual's overall genetic composition.",
    examples: [
      "Whole Exome Sequencing for undiagnosed pediatric conditions",
      "Chromosomal Microarray Analysis for developmental delays",
      "Multi-gene panel testing for hereditary cancer syndromes",
      "Whole Genome Sequencing for complex neurological disorders",
      "Expanded newborn screening panels covering 30+ metabolic disorders",
    ],
  },
  "Targeted Testing": {
    definition:
      "The focused analysis of specific genes, mutations, or localized regions of DNA known to be associated with a particular suspected disease or hereditary condition.",
    examples: [
      "BRCA1/BRCA2 mutation testing for cancer risk",
      "Single-gene testing for Sickle Cell Disease or Thalassemia",
      "Confirmatory testing for a variant found in a family member",
      "Pharmacogenomic testing for drug response (e.g., CYP2D6)",
      "Carrier testing for Cystic Fibrosis",
    ],
  },
} as const;

function ResultKnowledgeCard({ prediction }: { prediction: string }) {
  const info = KNOWLEDGE[prediction as keyof typeof KNOWLEDGE];
  if (!info) return null;
  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Dna className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            Result Knowledge
          </div>
          <h3 className="text-lg font-semibold">What does this result mean?</h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed italic text-foreground/90">
        "{info.definition}"
      </p>
      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Common examples
        </div>
        <ul className="space-y-1.5">
          {info.examples.map((e) => (
            <li key={e} className="flex gap-2 text-sm text-foreground/90">
              <span className="text-primary mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PredictPage() {
  const [form, setForm] = useState<Form>({});
  const { add } = useHistory();
  const [saved, setSaved] = useState(false);

  const allFilled = useMemo(
    () => FIELDS.every((f) => form[f.key] !== undefined && form[f.key] !== ""),
    [form]
  );

  const mutation = useMutation({
    mutationFn: (payload: PredictPayload) => postPredict(payload),
    onSuccess: () => setSaved(false),
  });

  const fi = useQuery({
    queryKey: ["feature-importance"],
    queryFn: getFeatureImportance,
    enabled: mutation.isSuccess,
    retry: 0,
  });

  const handleSubmit = () => {
    if (!allFilled) return;
    const payload: PredictPayload = {
      Sex: form.Sex!,
      Geographic_Region: form.Geographic_Region!,
      Location_Type: form.Location_Type!,
      Disease_Category: form.Disease_Category!,
      Facility_Type: form.Facility_Type!,
      Year: Number(form.Year),
    };
    mutation.mutate(payload);
  };

  const handleReset = () => {
    setForm({});
    mutation.reset();
    setSaved(false);
  };

  const handleSave = () => {
    if (!mutation.data) return;
    const payload: PredictPayload = {
      Sex: form.Sex!,
      Geographic_Region: form.Geographic_Region!,
      Location_Type: form.Location_Type!,
      Disease_Category: form.Disease_Category!,
      Facility_Type: form.Facility_Type!,
      Year: Number(form.Year),
    };
    add(payload, mutation.data);
    setSaved(true);
  };

  const result: PredictResponse | undefined = mutation.data;
  const isComp = result?.prediction === "Comprehensive Profiling";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up">
      <div className="mb-10">
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2">
          Prediction
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">Generate a genetic test recommendation</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Enter the patient's six indicators below. GeneScope runs your local
          Binary Logistic Regression model and explains the result.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: form */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm h-fit">
          <h2 className="text-lg font-semibold">Patient Indicator Input</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the patient's indicators to generate a genetic test type prediction.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">{f.label}</label>
                <div className="text-[11px] text-muted-foreground -mt-1">{f.indicator}</div>
                <Select
                  value={form[f.key] ?? ""}
                  onValueChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              disabled={!allFilled || mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Prediction
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground border-t pt-4">
            GeneScope is a research-based tool and does not replace clinical
            judgment. All inputs are processed locally.
          </p>
        </div>

        {/* Right: output */}
        <div className="space-y-6">
          {!mutation.isPending && !mutation.isError && !result && (
            <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
              <Dna className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="mt-4 text-sm text-muted-foreground">
                Your prediction result will appear here once you submit the form.
              </p>
            </div>
          )}

          {mutation.isPending && (
            <div className="rounded-2xl border bg-card p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-sm text-muted-foreground">Running model on local server…</p>
            </div>
          )}

          {mutation.isError && (
            <BackendOfflineNotice onRetry={handleSubmit} />
          )}

          {result && (
            <>
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Prediction</div>
                    <span
                      className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
                        isComp
                          ? "bg-success/10 text-success"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {result.prediction}
                    </span>
                  </div>
                  <ConfidenceRing value={result.confidence} />
                </div>
                <div className="mt-6">
                  <ProbabilityBar
                    comp={result.probability_comprehensive}
                    targ={result.probability_targeted}
                  />
                </div>
              </div>

              <ResultKnowledgeCard prediction={result.prediction} />

              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold">What drove this prediction?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Indicator influence from the trained model.
                </p>
                <div className="h-56 mt-4">
                  {fi.isLoading && (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
                    </div>
                  )}
                  {fi.isError && (
                    <div className="text-xs text-muted-foreground">Feature importance unavailable.</div>
                  )}
                  {fi.data && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fi.data} layout="vertical" margin={{ left: 8 }}>
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip />
                        <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                          {fi.data.map((_, i) => (
                            <Cell key={i} fill="var(--color-primary)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saved ? "Saved to History" : "Save to History"}
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  New Prediction
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
