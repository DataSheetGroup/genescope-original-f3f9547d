import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
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
import { FloatingIllustration } from "@/components/FloatingIllustration";
import helix from "@/assets/illustrations/helix-doodle.png";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
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
  { key: "Sex", label: "Sex", indicator: "Demographic", options: ["Male", "Female"] },
  { key: "Geographic_Region", label: "Geographic Region", indicator: "Geographic", options: ["Luzon", "Visayas", "Mindanao"] },
  { key: "Location_Type", label: "Location Type", indicator: "Location", options: ["Urban", "Rural"] },
  { key: "Disease_Category", label: "Disease Category", indicator: "Clinical", options: ["Pediatrics", "Neurology", "Metabolic", "Others"] },
  { key: "Facility_Type", label: "Facility Type", indicator: "Institutional", options: ["Private", "Public"] },
  { key: "Year", label: "Year of Testing", indicator: "Temporal", options: ["2021", "2022", "2023", "2024", "2025"] },
];

function ConfidenceRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-32 w-32 text-card-foreground">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} stroke="currentColor" className="opacity-15" strokeWidth="10" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          stroke="var(--coral)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-2xl tabular-nums">{value.toFixed(1)}%</div>
        <div className="text-[10px] uppercase tracking-wider opacity-70">Confidence</div>
      </div>
    </div>
  );
}

function ProbabilityBar({ comp, targ }: { comp: number; targ: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
        <span>Comprehensive {comp.toFixed(1)}%</span>
        <span>Targeted {targ.toFixed(1)}%</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-green-deep/10">
        <div className="bg-green-deep" style={{ width: `${comp}%`, transition: "width 0.8s ease" }} />
        <div className="bg-coral" style={{ width: `${targ}%`, transition: "width 0.8s ease" }} />
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
    <div className="relative rounded-3xl bg-card text-card-foreground p-8 md:p-10 overflow-hidden">
      <div className="absolute inset-0 rounded-3xl ring-4 ring-coral pointer-events-none" />
      <div className="relative">
        <div className="eyebrow text-coral mb-3">What this means</div>
        <h3 className="display-md">{prediction}</h3>
        <p className="mt-6 text-base leading-relaxed">
          <span className="font-display text-coral text-4xl leading-none mr-1 align-top">“</span>
          {info.definition}
          <span className="font-display text-coral text-4xl leading-none ml-1 align-bottom">”</span>
        </p>
        <div className="mt-8">
          <div className="eyebrow text-card-foreground/60 mb-3">Common examples</div>
          <ul className="space-y-2.5">
            {info.examples.map((e) => (
              <li key={e} className="flex gap-3 text-sm">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
                <span className="leading-relaxed">{e}</span>
              </li>
            ))}
          </ul>
        </div>
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

  const buildPayload = (): PredictPayload => ({
    Sex: form.Sex!,
    Geographic_Region: form.Geographic_Region!,
    Location_Type: form.Location_Type!,
    Disease_Category: form.Disease_Category!,
    Facility_Type: form.Facility_Type!,
    Year: Number(form.Year),
  });

  const handleSubmit = () => { if (allFilled) mutation.mutate(buildPayload()); };
  const handleReset = () => { setForm({}); mutation.reset(); setSaved(false); };
  const handleSave = () => {
    if (!mutation.data) return;
    add(buildPayload(), mutation.data);
    setSaved(true);
  };

  const result: PredictResponse | undefined = mutation.data;

  return (
    <div className="relative">
      <FloatingIllustration
        src={helix}
        className="hidden lg:block absolute right-8 top-12 w-32 opacity-90 z-0"
        rotate={14}
      />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 animate-fade-up">
        <div className="mb-12 max-w-3xl">
          <div className="eyebrow text-coral mb-4">Prediction</div>
          <h1 className="display-lg">
            Six indicators in,
            <br />
            <span className="text-coral">one clear recommendation.</span>
          </h1>
          <p className="mt-5 text-foreground/75 max-w-xl">
            Enter the patient's six indicators. GeneScope runs your local
            Binary Logistic Regression model and explains the result.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8">
          {/* LEFT — form */}
          <div className="rounded-3xl bg-card text-card-foreground p-7 md:p-9 h-fit">
            <h2 className="font-display text-2xl">Patient indicators</h2>
            <p className="mt-1 text-sm text-card-foreground/70">
              All fields are required to generate a prediction.
            </p>

            <div className="mt-7 grid sm:grid-cols-2 gap-5">
              {FIELDS.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="block text-sm font-semibold">{f.label}</label>
                  <div className="text-[10px] uppercase tracking-wider text-card-foreground/55 -mt-1">
                    {f.indicator}
                  </div>
                  <Select
                    value={form[f.key] ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  >
                    <SelectTrigger className="rounded-full bg-cream-dim border-0 h-11 px-5">
                      <SelectValue placeholder="Select…" />
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

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleSubmit}
                disabled={!allFilled || mutation.isPending}
                className="pill pill-coral disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Generate Prediction
              </button>
              <button onClick={handleReset} className="pill bg-green-deep text-cream hover:bg-green-deep/85">
                <RefreshCw className="h-4 w-4" /> Reset
              </button>
            </div>

            <p className="mt-7 text-xs text-card-foreground/60 border-t border-card-foreground/10 pt-5">
              A research-based tool. Does not replace clinical judgment. Inputs are processed locally.
            </p>
          </div>

          {/* RIGHT — output */}
          <div className="space-y-6">
            {!mutation.isPending && !mutation.isError && !result && (
              <div className="rounded-3xl border-2 border-dashed border-foreground/20 p-14 text-center">
                <p className="font-display text-2xl text-foreground/70">
                  Your result will appear here.
                </p>
                <p className="mt-2 text-sm text-foreground/55">
                  Fill the six indicators on the left and hit Generate.
                </p>
              </div>
            )}

            {mutation.isPending && (
              <div className="rounded-3xl bg-card text-card-foreground p-14 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-4 text-sm">Running model on local server…</p>
              </div>
            )}

            {mutation.isError && <BackendOfflineNotice onRetry={handleSubmit} />}

            {result && (
              <>
                {/* Headline result */}
                <div className="rounded-3xl bg-card text-card-foreground p-7">
                  <div className="flex items-center justify-between gap-5 flex-wrap">
                    <div>
                      <div className="eyebrow text-card-foreground/55">Prediction</div>
                      <div className="mt-2 font-display text-3xl md:text-4xl leading-tight">
                        {result.prediction}
                      </div>
                    </div>
                    <ConfidenceRing value={result.confidence} />
                  </div>
                  <div className="mt-7">
                    <ProbabilityBar
                      comp={result.probability_comprehensive}
                      targ={result.probability_targeted}
                    />
                  </div>
                </div>

                {/* THE DOMINANT KNOWLEDGE CARD */}
                <ResultKnowledgeCard prediction={result.prediction} />

                {/* Feature influence */}
                <div className="rounded-3xl bg-card text-card-foreground p-6">
                  <div className="eyebrow text-coral mb-1">Indicator influence</div>
                  <h3 className="font-display text-xl">What drove this prediction</h3>
                  <div className="h-56 mt-5">
                    {fi.isLoading && (
                      <div className="h-full flex items-center justify-center text-sm">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
                      </div>
                    )}
                    {fi.isError && <div className="text-xs text-card-foreground/65">Feature importance unavailable.</div>}
                    {fi.data && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fi.data} layout="vertical" margin={{ left: 8 }}>
                          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--green-deep)" }} />
                          <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: "var(--green-deep)" }} width={120} />
                          <Tooltip contentStyle={{ background: "var(--green-deep)", color: "var(--cream)", border: "none", borderRadius: 12 }} />
                          <Bar dataKey="importance" radius={[0, 999, 999, 0]}>
                            {fi.data.map((_, i) => (
                              <Cell key={i} fill="var(--coral)" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSave} disabled={saved} className="pill pill-cream disabled:opacity-60">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved to History" : "Save to History"}
                  </button>
                  <button onClick={handleReset} className="pill pill-outline">
                    New Prediction
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
