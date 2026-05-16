import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Lock, Trash2 } from "lucide-react";
import { useHistory, type HistoryItem } from "@/hooks/useHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — GeneScope" },
      { name: "description", content: "Locally-stored prediction audit log. No PII." },
    ],
  }),
  component: HistoryPage,
});

function toCsv(items: HistoryItem[]) {
  const header = ["No.", "Timestamp", "Sex", "Region", "Location", "Disease", "Facility", "Year", "Result", "Confidence"];
  const rows = items.map((it, i) => [
    String(i + 1),
    it.timestamp,
    it.input.Sex,
    it.input.Geographic_Region,
    it.input.Location_Type,
    it.input.Disease_Category,
    it.input.Facility_Type,
    String(it.input.Year),
    it.result.prediction,
    it.result.confidence.toFixed(1) + "%",
  ]);
  return [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function HistoryPage() {
  const { items, clear } = useHistory();
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (resultFilter !== "all" && it.result.prediction !== resultFilter) return false;
      if (yearFilter !== "all" && String(it.input.Year) !== yearFilter) return false;
      if (diseaseFilter !== "all" && it.input.Disease_Category !== diseaseFilter) return false;
      return true;
    });
  }, [items, resultFilter, yearFilter, diseaseFilter]);

  const handleExport = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genescope-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up">
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2">Audit Log</div>
        <h1 className="text-3xl md:text-4xl font-semibold">Prediction Audit Log</h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          No personally identifiable information is stored. Compliant with RA 10173.
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-4 md:p-5 border-b flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2 flex-1">
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Result" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="Comprehensive Profiling">Comprehensive Profiling</SelectItem>
                <SelectItem value="Targeted Testing">Targeted Testing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {["2021","2022","2023","2024","2025"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Disease" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disease Categories</SelectItem>
                {["Pediatrics","Neurology","Metabolic","Others"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={!filtered.length}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              onClick={() => { if (confirm("Clear all history?")) clear(); }}
              disabled={!items.length}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["No.","Timestamp","Sex","Region","Disease","Facility","Year","Result","Confidence"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, i) => {
                const isComp = it.result.prediction === "Comprehensive Profiling";
                return (
                  <tr key={it.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(it.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{it.input.Sex}</td>
                    <td className="px-4 py-3">{it.input.Geographic_Region}</td>
                    <td className="px-4 py-3">{it.input.Disease_Category}</td>
                    <td className="px-4 py-3">{it.input.Facility_Type}</td>
                    <td className="px-4 py-3 tabular-nums">{it.input.Year}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isComp ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                      }`}>
                        {it.result.prediction}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{it.result.confidence.toFixed(1)}%</td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    {items.length
                      ? "No records match the current filters."
                      : "No predictions recorded yet. Go to Predict to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
