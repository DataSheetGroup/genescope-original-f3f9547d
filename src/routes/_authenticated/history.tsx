import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Star, Trash2, X } from "lucide-react";
import { useHistory, type HistoryItem } from "@/hooks/useHistory";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "GeneScope" },
      { name: "description", content: "Locally-stored prediction audit log. No PII." },
    ],
  }),
  component: HistoryPage,
});

function toCsv(items: HistoryItem[]) {
  const header = ["No.", "Timestamp", "Sex", "Region", "Location", "Disease", "Facility", "Year", "Result", "Confidence"];
  const rows = items.map((it, i) => [
    String(i + 1), it.timestamp, it.input.Sex, it.input.Geographic_Region,
    it.input.Location_Type, it.input.Disease_Category, it.input.Facility_Type,
    String(it.input.Year), it.result.prediction, it.result.confidence.toFixed(1) + "%",
  ]);
  return [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function HistoryPage() {
  const { items, clear, remove, toggleSave, isLoading } = useHistory();
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all");
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = useMemo(() => items.filter((it) => {
    if (savedOnly && !it.saved) return false;
    if (resultFilter !== "all" && it.result.prediction !== resultFilter) return false;
    if (yearFilter !== "all" && String(it.input.Year) !== yearFilter) return false;
    if (diseaseFilter !== "all" && it.input.Disease_Category !== diseaseFilter) return false;
    return true;
  }), [items, resultFilter, yearFilter, diseaseFilter, savedOnly]);

  const handleExport = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genescope-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pillSelect = "rounded-full bg-cream text-card-foreground border-0 h-10 px-5";

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 z-10">
      <div className="mb-10 max-w-3xl">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="eyebrow text-coral mb-4">Audit log</div>
            <h1 className="display-lg">
              Every prediction,
              <br />
              <span className="hl">accountable.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card text-card-foreground overflow-hidden">
        <div className="p-5 md:p-6 border-b border-card-foreground/10 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2 flex-1">
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className={`${pillSelect} w-[220px]`}><SelectValue placeholder="Result" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="Comprehensive Profiling">Comprehensive Profiling</SelectItem>
                <SelectItem value="Targeted Testing">Targeted Testing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className={`${pillSelect} w-[140px]`}><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {["2021","2022","2023","2024","2025"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
              <SelectTrigger className={`${pillSelect} w-[200px]`}><SelectValue placeholder="Disease" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disease Categories</SelectItem>
                {["Pediatrics","Neurology","Metabolic","Others"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <button
              onClick={() => setSavedOnly((s) => !s)}
              className={`pill text-xs px-4 py-2 ${savedOnly ? "bg-coral text-card-foreground" : "bg-cream text-card-foreground"}`}
            >
              <Star className={`h-3.5 w-3.5 ${savedOnly ? "fill-current" : ""}`} /> Saved only
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={!filtered.length}
              className="pill pill-coral text-xs px-4 py-2 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              onClick={() => { if (confirm("Clear all history?")) clear(); }}
              disabled={!items.length}
              className="pill text-xs px-4 py-2 bg-green-deep text-cream hover:bg-green-deep/85 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-dim text-xs uppercase tracking-wider text-card-foreground/65">
              <tr>
                {["No.","Timestamp","Sex","Region","Disease","Facility","Year","Result","Confidence",""].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, i) => {
                const isComp = it.result.prediction === "Comprehensive Profiling";
                return (
                  <tr key={it.id} className="border-t border-card-foreground/10 hover:bg-cream-dim/60">
                    <td className="px-5 py-3.5 tabular-nums text-card-foreground/60">{i + 1}</td>
                    <td className="px-5 py-3.5 text-xs text-card-foreground/65 whitespace-nowrap">
                      {new Date(it.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">{it.input.Sex}</td>
                    <td className="px-5 py-3.5">{it.input.Geographic_Region}</td>
                    <td className="px-5 py-3.5">{it.input.Disease_Category}</td>
                    <td className="px-5 py-3.5">{it.input.Facility_Type}</td>
                    <td className="px-5 py-3.5 tabular-nums">{it.input.Year}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        isComp
                          ? "bg-green-deep text-cream"
                          : "bg-coral text-card-foreground"
                      }`}>
                        {it.result.prediction}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 tabular-nums font-display">{it.result.confidence.toFixed(1)}%</td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleSave(it.id, !it.saved)}
                          title={it.saved ? "Unsave" : "Save"}
                          className="p-1.5 rounded-full hover:bg-cream-dim"
                        >
                          <Star className={`h-4 w-4 ${it.saved ? "fill-coral text-coral" : "text-card-foreground/40"}`} />
                        </button>
                        <button
                          onClick={() => remove(it.id)}
                          title="Delete"
                          className="p-1.5 rounded-full hover:bg-cream-dim text-card-foreground/40 hover:text-card-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={10} className="px-5 py-20 text-center text-sm text-card-foreground/60">
                    {isLoading
                      ? "Loading history..."
                      : items.length
                      ? "No records match the current filters."
                      : "No predictions recorded yet. Head to Predict to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}

