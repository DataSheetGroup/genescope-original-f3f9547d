import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Save, Zap } from "lucide-react";
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
import { useAuth } from "@/lib/auth-context";
import { can } from "@/lib/roles";
import clipboard from "@/assets/illustrations/clipboard.png";
import safetyGlasses from "@/assets/illustrations/safety-glasses.png";
import dnaStrand from "@/assets/illustrations/dna-strand.png";
import labFlask from "@/assets/illustrations/lab-flask.png";
import testTube from "@/assets/illustrations/test-tube.png";
import chromosome from "@/assets/illustrations/chromosome.png";
import pillCap from "@/assets/illustrations/pill-capsule.png";
import petriDish from "@/assets/illustrations/petri-dish.png";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/predict")({
  head: () => ({
    meta: [
      { title: "GeneScope" },
      { name: "description", content: "Generate a genetic test type prediction from six patient indicators." },
    ],
  }),
  component: PredictPage,
});

type Form = Partial<Record<keyof PredictPayload, string>>;

const FIELDS: {
  key: keyof PredictPayload;
  label: string;
  hint: string;
  options: string[];
}[] = [
  { key: "Sex", label: "Sex", hint: "Patient demographic", options: ["Male", "Female"] },
  { key: "Geographic_Region", label: "Geographic Region", hint: "Major island group", options: ["Luzon", "Visayas", "Mindanao"] },
  { key: "Location_Type", label: "Location Type", hint: "Urban or rural setting", options: ["Urban", "Rural"] },
  { key: "Disease_Category", label: "Disease Category", hint: "Clinical area of concern", options: ["Pediatrics", "Neurology", "Metabolic", "Others"] },
  { key: "Facility_Type", label: "Facility Type", hint: "Where care is delivered", options: ["Private", "Public"] },
  { key: "Year", label: "Year of Testing", hint: "When testing occurs", options: ["2021", "2022", "2023", "2024", "2025"] },
];

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-3 mb-5">
      <span className="h-9 w-9 rounded-full bg-coral flex items-center justify-center font-display text-base text-card-foreground">
        {n}
      </span>
      <span className="font-display text-sm uppercase tracking-wide text-card-foreground/70">{label}</span>
    </div>
  );
}

function useCountUp(target: number, duration = 700, deps: unknown[] = []) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = target;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(from + (to - from) * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, ...deps]);
  return v;
}

function ConfidenceRing({ value, runId }: { value: number; runId: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const animated = useCountUp(value, 700, [runId]);
  const offset = c - (animated / 100) * c;
  return (
    <div className="relative h-36 w-36 text-card-foreground mx-auto">
      <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
        <circle cx="65" cy="65" r={r} stroke="currentColor" className="opacity-15" strokeWidth="11" fill="none" />
        <circle
          cx="65" cy="65" r={r}
          stroke="var(--coral)"
          strokeWidth="11"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl tabular-nums">{animated.toFixed(1)}%</div>

        <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">Confidence</div>
      </div>
    </div>
  );
}

function ProbabilityBar({ comp, targ }: { comp: number; targ: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-2">
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

function PredictPage() {
  const [form, setForm] = useState<Form>({});
  const { add } = useHistory();
  const { user } = useAuth();
  const canRun = can(user?.role, "predict.run");
  const [saved, setSaved] = useState(false);
  const [runId, setRunId] = useState(0);
  const [statusStep, setStatusStep] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allFilled = useMemo(
    () => FIELDS.every((f) => form[f.key] !== undefined && form[f.key] !== ""),
    [form]
  );
  const filledCount = FIELDS.filter((f) => form[f.key]).length;

  const mutation = useMutation({
    mutationFn: (payload: PredictPayload) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      return postPredict(payload, { signal: ac.signal });
    },
    onSuccess: () => {
      setSaved(false);
      setRunId((r) => r + 1);
    },
  });

  // Cycle status line while a request is in flight.
  useEffect(() => {
    if (!mutation.isPending) return;
    setStatusStep(0);
    const t1 = setTimeout(() => setStatusStep(1), 180);
    const t2 = setTimeout(() => setStatusStep(2), 420);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mutation.isPending, runId]);

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

  // Auto-predict (debounced) when all six inputs are filled or change.
  useEffect(() => {
    if (!canRun) return;
    if (!allFilled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      mutation.mutate(buildPayload());
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.Sex, form.Geographic_Region, form.Location_Type, form.Disease_Category, form.Facility_Type, form.Year, allFilled, canRun]);

  const handleSubmit = () => { if (canRun && allFilled) mutation.mutate(buildPayload()); };
  const handleReset = () => {
    abortRef.current?.abort();
    setForm({});
    mutation.reset();
    setSaved(false);
  };
  const handleSave = async () => {
    if (!mutation.data) return;
    try {
      await add(buildPayload(), mutation.data, false);
      setSaved(true);
    } catch (e) {
      console.error("[save history] failed:", e);
    }
  };

  const result: PredictResponse | undefined = mutation.data;
  const info = result ? KNOWLEDGE[result.prediction as keyof typeof KNOWLEDGE] : null;
  const statusMessages = ["Encoding indicators…", "Sending to model…", "Computing probabilities…"];
  const activityState: "idle" | "running" | "done" | "error" = mutation.isPending
    ? "running"
    : mutation.isError
      ? "error"
      : result
        ? "done"
        : "idle";
  const dotColor =
    activityState === "running"
      ? "bg-purple"
      : activityState === "error"
        ? "bg-coral"
        : activityState === "done"
          ? "bg-green-deep"
          : "bg-card-foreground/30";


  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 py-16 z-10">
        {/* ── Centered hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="eyebrow text-coral mb-4">Prediction</div>
          <h1 className="display-lg">
            Six indicators in,
            <br />
            <span className="hl">one clear recommendation.</span>
          </h1>
          <p className="mt-6 text-foreground/75 mx-auto max-w-xl">
            Fill in the patient's six indicators below. GeneScope runs the local
            Binary Logistic Regression model and walks you through what the result means.
          </p>
        </div>

        {/* ── STEP 1 + STEP 2: symmetric two-column ── */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* STEP 1 — Inputs */}
          <div className="rounded-[2rem] bg-card text-card-foreground p-7 md:p-9 flex flex-col">
            <StepBadge n={1} label="Patient indicators" />
            <p className="text-sm text-card-foreground/70 -mt-2 mb-6">
              {filledCount} of {FIELDS.length} fields filled.
            </p>

            <div className="grid sm:grid-cols-2 gap-5 flex-1">
              {FIELDS.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="block text-sm font-bold">{f.label}</label>
                  <Select
                    value={form[f.key] ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                  >
                    <SelectTrigger className="w-[200px] max-w-full rounded-full bg-cream-dim h-10 px-4 text-sm font-semibold border-[2.5px] border-[var(--purple)] hover:border-[var(--purple-deep)] focus:border-[var(--purple-deep)] transition-colors">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-card-foreground/55 pl-1">{f.hint}</p>
                </div>
              ))}
            </div>

            {!canRun && (
              <div className="mb-4 rounded-2xl bg-coral/10 border border-coral/30 px-4 py-3 text-sm text-card-foreground/85">
                Viewer accounts are read-only. Ask an admin to upgrade your role
                to <span className="font-semibold">clinician</span> or <span className="font-semibold">researcher</span> to run predictions.
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleSubmit}
                disabled={!canRun || !allFilled || mutation.isPending}
                className="pill pill-coral disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canRun ? "Read-only role" : undefined}
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Generate Prediction
              </button>
              <button onClick={handleReset} className="pill bg-green-deep text-cream hover:bg-green-deep/85">
                <RefreshCw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* STEP 2 — Result */}
          <div className="rounded-[2rem] bg-card text-card-foreground p-7 md:p-9 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-1">
              <StepBadge n={2} label="Your result" />
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  {activityState === "running" && (
                    <span className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-70 animate-ping`} />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-card-foreground/70">
                  {activityState === "running" ? "Live" : activityState === "done" ? "Live" : activityState === "error" ? "Offline" : "Idle"}
                </span>
                {runId > 0 && (
                  <span className="text-[10px] tabular-nums text-card-foreground/50">
                    · Run #{String(runId).padStart(3, "0")}
                  </span>
                )}
              </div>
            </div>

            {/* Live status line — always reserves height so error/idle transitions don't shift content */}
            <div className="h-5 mb-4 flex items-center gap-2 text-xs text-card-foreground/70">
              {mutation.isPending && (
                <>
                  <Zap className="h-3 w-3 text-purple animate-pulse" />
                  <span className="animate-fade-in" key={statusStep}>{statusMessages[statusStep]}</span>
                </>
              )}
              {!mutation.isPending && result && (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-deep" />
                  <span>
                    Model computed in {result.elapsed_ms !== undefined ? `${result.elapsed_ms.toFixed(1)}ms` : `${result.roundtrip_ms ?? "—"}ms`}
                    {result.elapsed_ms !== undefined && result.roundtrip_ms !== undefined ? ` · round-trip ${result.roundtrip_ms}ms` : ""}
                  </span>
                </>
              )}
              {!mutation.isPending && mutation.isError && (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                  <span>Cannot reach model server.</span>
                </>
              )}
            </div>

            {!mutation.isPending && !mutation.isError && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <img src={safetyGlasses} alt="" className="w-28 mb-5 opacity-90" />
                <p className="font-display text-xl text-card-foreground/75">
                  Fill the form to see your result.
                </p>
                <p className="mt-2 text-sm text-card-foreground/55 max-w-xs">
                  Predictions update automatically once all six indicators are set.
                </p>
              </div>
            )}

            {mutation.isPending && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-sm">Running prediction in real time…</p>
              </div>
            )}

            {mutation.isError && !result && (
              <div className="flex-1 flex items-center"><BackendOfflineNotice onRetry={handleSubmit} /></div>
            )}

            {result && (
              <div className={`flex-1 flex flex-col ${mutation.isPending ? "opacity-70" : ""} transition-opacity`}>
                <div className="text-center">
                  <div className="eyebrow text-card-foreground/55 mb-2">Prediction</div>
                  <div className="font-display text-2xl md:text-3xl leading-tight mb-6" key={`label-${runId}`}>
                    <span className="inline-block animate-fade-in">{result.prediction}</span>
                  </div>
                  <ConfidenceRing value={result.confidence} runId={runId} />
                </div>

                <div className="mt-8">
                  <ProbabilityBar
                    comp={result.probability_comprehensive}
                    targ={result.probability_targeted}
                  />
                </div>

                <div className="mt-auto pt-8 flex flex-wrap gap-3 justify-center">
                  <button onClick={handleSave} disabled={saved} className="pill pill-coral disabled:opacity-60">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved" : "Save to History"}
                  </button>
                  <button onClick={handleReset} className="pill bg-green-deep text-cream hover:bg-green-deep/85">
                    New Prediction
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── STEP 3 — What this means (full width, only when result exists) ── */}
        {result && info && (
          <div className="mt-6 rounded-[2rem] bg-card text-card-foreground p-7 md:p-10 relative overflow-hidden">
            <img src={testTube} alt="" className="hidden md:block absolute right-6 top-6 w-20 opacity-80" />
            <StepBadge n={3} label="What this means" />
            <div className="grid md:grid-cols-2 gap-8 items-start mt-2">
              <div>
                <h3 className="display-md mb-5 pr-24"><span className="hl">{result.prediction}</span></h3>
                <p className="text-base leading-relaxed">{info.definition}</p>
              </div>
              <div>
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
        )}

        {/* ── STEP 4 — Indicator influence ── */}
        {result && (
          <div className="mt-6 rounded-[2rem] bg-card text-card-foreground p-7 md:p-10 relative overflow-hidden">
            <img src={chromosome} alt="" className="hidden md:block absolute right-6 top-6 w-20 opacity-80" />
            <StepBadge n={4} label="Indicator influence" />
            <h3 className="font-display text-2xl mb-1 pr-24">What drove this <span className="hl">prediction</span></h3>
            <p className="text-sm text-card-foreground/65 mb-6 max-w-xl">
              Relative weight each indicator carried in the model's decision.
            </p>
            <div className="h-72 w-full">
              {fi.isLoading && (
                <div className="h-full flex items-center justify-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
                </div>
              )}
              {fi.isError && <div className="text-xs text-card-foreground/65">Feature importance unavailable.</div>}
              {fi.data && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fi.data} layout="vertical" margin={{ top: 8, right: 32, bottom: 0, left: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--green-deep)" }} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 12, fill: "var(--green-deep)" }} width={150} interval={0} />
                    <Tooltip contentStyle={{ background: "var(--green-deep)", color: "var(--cream)", border: "none", borderRadius: 12 }} />
                    <Bar dataKey="importance" radius={[0, 999, 999, 0]} barSize={18}>
                      {fi.data.map((_, i) => (
                        <Cell key={i} fill="var(--coral)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-foreground/55 max-w-xl mx-auto">
          A research-based tool. Does not replace clinical judgment. Inputs are processed locally.
        </p>
      </div>
    </div>
  );
}
