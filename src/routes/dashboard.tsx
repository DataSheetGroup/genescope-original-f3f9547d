import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart,
  Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { getEdaData } from "@/lib/api";
import { BackendOfflineNotice } from "@/components/BackendOfflineNotice";
import { PhilippinesMap } from "@/components/PhilippinesMap";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "GeneScope — Dashboard" },
      { name: "description", content: "Exploratory analytics on anonymized patient genetic testing records, 2021–2025." },
    ],
  }),
  component: Dashboard,
});

// ─────────────────────────── tokens
const INK = "var(--ink)";
const PAPER = "var(--paper)";
const ACCENT = "var(--purple)";
const MUTED = "color-mix(in oklab, var(--ink) 55%, var(--paper))";
const HAIRLINE = "color-mix(in oklab, var(--ink) 14%, transparent)";
const GRID = "color-mix(in oklab, var(--ink) 8%, transparent)";

const tooltipStyle = {
  background: "#fff",
  color: INK,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 10,
  fontSize: 13,
  padding: "10px 14px",
  boxShadow: "none",
  fontFamily: "Poppins, sans-serif",
};
const axisTick = { fontSize: 12, fill: INK, opacity: 0.6, fontFamily: "Poppins, sans-serif" };
const chartMargin = { top: 8, right: 16, bottom: 0, left: 0 };

// ─────────────────────────── sticker icon helper
function Sticker({ name, size = 28 }: { name: string; size?: number }) {
  return <Icon icon={`fluent-emoji-flat:${name}`} width={size} height={size} />;
}

// ─────────────────────────── primitives
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white ${className}`}
      style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon, label, value, sub,
}: { icon: string; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <Card className="p-7 h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="font-display text-[12px]" style={{ color: MUTED, letterSpacing: "0.04em" }}>
          {label}
        </div>
        <Sticker name={icon} size={28} />
      </div>
      <div className="mt-6 font-display text-[2.75rem] leading-none">{value}</div>
      {sub && <div className="mt-3 text-sm" style={{ color: MUTED }}>{sub}</div>}
    </Card>
  );
}

function Panel({
  title, hint, action, children, className = "",
}: { title: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={`p-7 h-full ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[1.05rem] leading-tight" style={{ letterSpacing: "0.02em" }}>{title}</h3>
          {hint && <p className="mt-1.5 text-sm" style={{ color: MUTED }}>{hint}</p>}
        </div>
        {action && <div className="text-sm" style={{ color: MUTED }}>{action}</div>}
      </div>
      <div className="h-px w-full" style={{ background: HAIRLINE }} />
      <div className="pt-6">{children}</div>
    </Card>
  );
}

function ChartBox({ children }: { children: ReactNode }) {
  return <div className="w-full h-80">{children}</div>;
}

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: HAIRLINE }} />
      ))}
    </div>
  );
}

// ─────────────────────────── tabs
type TabKey = "overview" | "geographic" | "demographic" | "institutional" | "temporal";
const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "overview",      label: "Overview",      icon: "bar-chart" },
  { key: "geographic",    label: "Geographic",    icon: "world-map" },
  { key: "demographic",   label: "Demographic",   icon: "bust-in-silhouette" },
  { key: "institutional", label: "Institutional", icon: "hospital" },
  { key: "temporal",      label: "Temporal",      icon: "chart-increasing" },
];

function TabBar({ value, onChange }: { value: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div
      className="flex items-stretch gap-1 overflow-x-auto rounded-2xl p-1.5 bg-white"
      style={{ border: `1px solid ${HAIRLINE}` }}
    >
      {TABS.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="inline-flex flex-1 shrink-0 items-center justify-center gap-2.5 rounded-xl px-5 py-3 font-display text-[14px] transition-colors whitespace-nowrap"
            style={
              active
                ? { background: INK, color: PAPER, letterSpacing: "0.03em" }
                : { background: "transparent", color: INK, opacity: 0.7, letterSpacing: "0.03em" }
            }
          >
            <Sticker name={t.icon} size={20} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────── page
function Dashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [q, setQ] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["eda"],
    queryFn: getEdaData,
    retry: 0,
  });

  if (isError) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 py-16">
        <BackendOfflineNotice onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div style={{ background: PAPER, color: INK }}>
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 py-14">
        {/* header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-display text-[12px]" style={{ color: ACCENT, letterSpacing: "0.1em" }}>
              ANALYTICS
            </div>
            <h1 className="display-lg mt-3">
              The dataset, at <span style={{ color: ACCENT }}>a glance.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base" style={{ color: MUTED }}>
              Exploratory analysis of anonymized patient genetic testing records, 2021–2025.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-base"
              style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
            >
              <Icon icon="fluent-emoji-flat:magnifying-glass-tilted-left" width={18} height={18} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search regions, facilities…"
                className="w-56 bg-transparent outline-none placeholder:opacity-50"
              />
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-display text-[13px]"
              style={{ border: `1px solid ${HAIRLINE}`, color: INK, letterSpacing: "0.03em" }}
            >
              <Icon icon="fluent-emoji-flat:control-knobs" width={18} height={18} />
              Filters
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-10">
          <TabBar value={tab} onChange={setTab} />
        </div>

        {/* body */}
        <div className="mt-8">
          {isLoading && <Skeleton />}
          {data && (
            <div className="animate-fade-up space-y-8">
              {tab === "overview"      && <OverviewTab data={data} />}
              {tab === "geographic"    && <GeographicTab data={data} query={q} />}
              {tab === "demographic"   && <DemographicTab data={data} />}
              {tab === "institutional" && <InstitutionalTab data={data} query={q} />}
              {tab === "temporal"      && <TemporalTab data={data} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── shared KPIs
function KpiRow({ data }: { data: any }) {
  const total = data.total_records ?? 0;
  const regions = data.region_distribution?.length ?? 0;
  const diseases = data.disease_category?.length ?? 0;
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 auto-rows-fr">
      <StatCard icon="card-index-dividers" label="TOTAL RECORDS" value={total.toLocaleString()} sub={data.year_coverage ? `Covering ${data.year_coverage}` : null} />
      <StatCard icon="spiral-calendar" label="YEAR COVERAGE" value={data.year_coverage ?? "—"} sub={`${data.annual_volume?.length ?? 0} reporting years`} />
      <StatCard icon="round-pushpin" label="REGIONS" value={regions} sub="Island groups covered" />
      <StatCard icon="dna" label="DISEASE CATEGORIES" value={diseases} sub="Distinct conditions tracked" />
    </div>
  );
}

const SOLID_TARGETED = INK;
const SOLID_COMP = ACCENT;

// ─────────────────────────── OVERVIEW
function OverviewTab({ data }: { data: any }) {
  const tt = (data.test_type_distribution ?? []) as { name: string; value: number }[];
  return (
    <>
      <KpiRow data={data} />
      <div className="grid gap-6 lg:grid-cols-3 auto-rows-fr">
        <Panel title="Type of Genetic Test" hint="Overall distribution">
          <ChartBox>
            <ResponsiveContainer>
              <PieChart margin={chartMargin}>
                <Pie data={tt} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={1} stroke="none">
                  {tt.map((_, i) => <Cell key={i} fill={i === 0 ? SOLID_COMP : SOLID_TARGETED} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Annual Testing Volume" hint="Yearly counts with cumulative trend" className="lg:col-span-2">
          <ChartBox>
            <ResponsiveContainer>
              <ComposedChart data={data.annual_volume ?? []} margin={chartMargin}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={ACCENT} radius={[6, 6, 0, 0]} barSize={36} />
                <Line type="monotone" dataKey="cumulative" stroke={INK} strokeWidth={2.5} dot={{ r: 4, fill: INK }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 auto-rows-fr">
        <Panel title="Disease Category Frequency" hint="Most-tested conditions">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={data.disease_category ?? []} layout="vertical" margin={{ ...chartMargin, left: 20 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={axisTick} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={ACCENT} radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Yearly Targeted vs Comprehensive" hint="Test mix over time">
          <ChartBox>
            <ResponsiveContainer>
              <ComposedChart data={data.yearly_by_test_type ?? []} margin={chartMargin}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
                <Line type="monotone" dataKey="Targeted" stroke={SOLID_TARGETED} strokeWidth={2.5} dot={{ r: 4, fill: SOLID_TARGETED }} />
                <Line type="monotone" dataKey="Comprehensive" stroke={SOLID_COMP} strokeWidth={2.5} dot={{ r: 4, fill: SOLID_COMP }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>
    </>
  );
}

// ─────────────────────────── GEOGRAPHIC
function GeographicTab({ data, query }: { data: any; query: string }) {
  const regions = (data.region_distribution ?? []) as { name: string; value: number }[];
  const total = regions.reduce((s, r) => s + r.value, 0);
  const filtered = regions.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  const top = filtered[0];

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-3 auto-rows-fr">
        <StatCard icon="trophy" label="TOP REGION" value={top?.name ?? "—"} sub={top ? `${top.value.toLocaleString()} records` : ""} />
        <StatCard icon="globe-showing-asia-australia" label="COVERAGE" value={`${regions.length}`} sub="Island groups represented" />
        <StatCard icon="card-index-dividers" label="TOTAL TESTS" value={total.toLocaleString()} sub="Across all regions" />
      </div>

      <PhilippinesMap
        data={regions}
        regionByTest={data.region_vs_test ?? []}
        regionByYear={data.region_by_year ?? []}
      />

      <Panel title="Regional Breakdown" hint="Counts per island group">
        <ChartBox>
          <ResponsiveContainer>
            <BarChart data={filtered} layout="vertical" margin={{ ...chartMargin, left: 20 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={axisTick} width={130} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={ACCENT} radius={[0, 6, 6, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </Panel>

      <Panel title="Region × Test Type" hint="Which test types dominate in each region">
        <ChartBox>
          <ResponsiveContainer>
            <BarChart data={data.region_vs_test ?? []} margin={chartMargin}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
              <Bar dataKey="Targeted" stackId="a" fill={SOLID_TARGETED} />
              <Bar dataKey="Comprehensive" stackId="a" fill={SOLID_COMP} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </Panel>
    </>
  );
}

// ─────────────────────────── DEMOGRAPHIC
function DemographicTab({ data }: { data: any }) {
  const sex = (data.sex_distribution ?? []) as { name: string; value: number }[];
  const total = sex.reduce((s, r) => s + r.value, 0);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const female = sex.find((s) => /f/i.test(s.name))?.value ?? 0;
  const male = sex.find((s) => /m/i.test(s.name))?.value ?? 0;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-3 auto-rows-fr">
        <StatCard icon="busts-in-silhouette" label="TOTAL PATIENTS" value={total.toLocaleString()} sub="Anonymized records" />
        <StatCard icon="woman" label="FEMALE SHARE" value={`${pct(female)}%`} sub={`${female.toLocaleString()} records`} />
        <StatCard icon="man" label="MALE SHARE" value={`${pct(male)}%`} sub={`${male.toLocaleString()} records`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 auto-rows-fr">
        <Panel title="Sex Distribution" hint="Patient mix">
          <ChartBox>
            <ResponsiveContainer>
              <PieChart margin={chartMargin}>
                <Pie data={sex} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={1} stroke="none">
                  {sex.map((_, i) => <Cell key={i} fill={i === 0 ? SOLID_COMP : SOLID_TARGETED} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Sex × Test Type" hint="How test preference differs by sex">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={data.sex_vs_test ?? []} margin={chartMargin}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
                <Bar dataKey="Targeted" fill={SOLID_TARGETED} radius={[6, 6, 0, 0]} barSize={36} />
                <Bar dataKey="Comprehensive" fill={SOLID_COMP} radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      <Panel title="Disease Category × Test Type" hint="Targeted vs comprehensive by condition">
        <ChartBox>
          <ResponsiveContainer>
            <BarChart data={data.disease_vs_test ?? []} margin={chartMargin}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} interval={0} angle={-15} textAnchor="end" height={80} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
              <Bar dataKey="Targeted" stackId="a" fill={SOLID_TARGETED} />
              <Bar dataKey="Comprehensive" stackId="a" fill={SOLID_COMP} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </Panel>
    </>
  );
}

// ─────────────────────────── INSTITUTIONAL
function InstitutionalTab({ data, query }: { data: any; query: string }) {
  const fac = (data.facility_distribution ?? []) as { name: string; value: number }[];
  const facVsTest = (data.facility_vs_test ?? []) as { name: string; Targeted: number; Comprehensive: number }[];
  const total = fac.reduce((s, r) => s + r.value, 0);

  const rows = useMemo(() => {
    return facVsTest
      .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
      .map((r) => {
        const sum = r.Targeted + r.Comprehensive;
        const dominant = r.Comprehensive >= r.Targeted ? "Comprehensive" : "Targeted";
        const sector = /priv/i.test(r.name) ? "Private" : "Public";
        const share = total ? Math.round((sum / total) * 100) : 0;
        return { ...r, sum, dominant, sector, share };
      });
  }, [facVsTest, query, total]);

  const sectorCount = (s: string) => rows.filter((r) => r.sector === s).reduce((a, r) => a + r.sum, 0);
  const publicTotal = sectorCount("Public");
  const privateTotal = sectorCount("Private");

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 auto-rows-fr">
        <StatCard icon="hospital" label="FACILITY TYPES" value={fac.length} sub="Distinct categories" />
        <StatCard icon="classical-building" label="PUBLIC" value={`${total ? Math.round(publicTotal / total * 100) : 0}%`} sub={`${publicTotal.toLocaleString()} records`} />
        <StatCard icon="office-building" label="PRIVATE" value={`${total ? Math.round(privateTotal / total * 100) : 0}%`} sub={`${privateTotal.toLocaleString()} records`} />
        <StatCard icon="card-index-dividers" label="TOTAL RECORDS" value={total.toLocaleString()} sub="Across all facilities" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 auto-rows-fr">
        <Panel title="Facility Distribution" hint="Records by facility type">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={fac} margin={chartMargin}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={ACCENT} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Facility × Test Type" hint="Targeted vs Comprehensive">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={facVsTest} margin={chartMargin}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
                <Bar dataKey="Targeted" stackId="a" fill={SOLID_TARGETED} />
                <Bar dataKey="Comprehensive" stackId="a" fill={SOLID_COMP} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      <Panel title="Facility Listing" hint="All registered facility categories" action={<span>{rows.length} entries</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="font-display text-[12px]" style={{ color: MUTED, letterSpacing: "0.05em" }}>
                <th className="px-5 py-4 text-left font-normal">FACILITY TYPE</th>
                <th className="px-5 py-4 text-left font-normal">SECTOR</th>
                <th className="px-5 py-4 text-right font-normal">RECORDS</th>
                <th className="px-5 py-4 text-right font-normal">SHARE</th>
                <th className="px-5 py-4 text-left font-normal">DOMINANT TEST</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} style={{ background: i % 2 ? PAPER : "transparent", borderTop: `1px solid ${HAIRLINE}` }}>
                  <td className="px-5 py-4 font-medium">{r.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: r.sector === "Public" ? INK : ACCENT }} />
                      <span>{r.sector}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">{r.sum.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right tabular-nums">{r.share}%</td>
                  <td className="px-5 py-4">{r.dominant}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center" style={{ color: MUTED }}>No facilities match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

// ─────────────────────────── TEMPORAL
function TemporalTab({ data }: { data: any }) {
  const vol = (data.annual_volume ?? []) as { year: number | string; count: number; cumulative?: number }[];
  const peak = vol.reduce((m, r) => (r.count > (m?.count ?? 0) ? r : m), vol[0]);
  const last = vol[vol.length - 1];
  const first = vol[0];
  const growth = first && last && first.count ? Math.round(((last.count - first.count) / first.count) * 100) : 0;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-3 auto-rows-fr">
        <StatCard icon="trophy" label="PEAK YEAR" value={peak?.year ?? "—"} sub={peak ? `${peak.count.toLocaleString()} tests` : ""} />
        <StatCard icon="chart-increasing" label="GROWTH" value={`${growth > 0 ? "+" : ""}${growth}%`} sub={`From ${first?.year} → ${last?.year}`} />
        <StatCard icon="card-index-dividers" label="CUMULATIVE" value={(last?.cumulative ?? 0).toLocaleString()} sub="Through latest year" />
      </div>

      <Panel title="Annual Testing Volume" hint="Yearly counts with cumulative trend">
        <ChartBox>
          <ResponsiveContainer>
            <ComposedChart data={vol} margin={chartMargin}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={ACCENT} radius={[6, 6, 0, 0]} barSize={40} />
              <Line type="monotone" dataKey="cumulative" stroke={INK} strokeWidth={2.5} dot={{ r: 4, fill: INK }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartBox>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2 auto-rows-fr">
        <Panel title="Cumulative Growth" hint="Running total over time">
          <ChartBox>
            <ResponsiveContainer>
              <AreaChart data={vol} margin={chartMargin}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="cumulative" stroke={INK} strokeWidth={2.5} fill={INK} fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Yearly Test Mix" hint="Targeted vs Comprehensive over years">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={data.yearly_by_test_type ?? []} margin={chartMargin}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={axisTick} axisLine={{ stroke: HAIRLINE }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 13, color: INK, fontFamily: "Poppins, sans-serif" }} />
                <Bar dataKey="Targeted" stackId="a" fill={SOLID_TARGETED} />
                <Bar dataKey="Comprehensive" stackId="a" fill={SOLID_COMP} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>
    </>
  );
}
