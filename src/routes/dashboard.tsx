import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity, Building2, CalendarRange, Database, Filter, LayoutGrid,
  Map as MapIcon, Search, Stethoscope, TrendingUp, Users,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart,
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
const PALETTE = ["var(--teal)", "var(--purple)", "var(--mustard)", "var(--green-mid)", "var(--cream-dim)"];
const tooltipStyle = {
  background: "var(--ink)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 12,
  fontSize: 12,
  padding: "8px 12px",
};
const axisTick = { fontSize: 11, fill: "var(--ink)", opacity: 0.7 };
const gridStroke = "color-mix(in oklab, var(--ink) 10%, transparent)";

// ─────────────────────────── primitives
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-card text-card-foreground ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-40 blur-2xl"
        style={{ background: "color-mix(in oklab, var(--teal) 50%, transparent)" }}
      />
      {children}
    </div>
  );
}

function StatCard({
  icon, label, value, sub, accent = "var(--teal)",
}: {
  icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode; accent?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div
          className="grid h-12 w-12 place-items-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-4xl leading-none tracking-tight">{value}</div>
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-card-foreground/60">
            {label}
          </div>
          {sub && <div className="mt-1 text-xs text-card-foreground/70">{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

function Panel({
  title, hint, action, children, className = "",
}: {
  title: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-card-foreground/65">{hint}</p>}
        </div>
        {action && <div className="text-xs text-card-foreground/65">{action}</div>}
      </div>
      <div className="h-px w-full bg-card-foreground/10" />
      <div className="pt-4">{children}</div>
    </Card>
  );
}

function ChartBox({ children, h = 260 }: { children: ReactNode; h?: number }) {
  return <div className="w-full" style={{ height: h }}>{children}</div>;
}

function Skeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-card/40 animate-pulse" />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`b${i}`} className="col-span-2 h-80 rounded-2xl bg-card/40 animate-pulse" />
      ))}
    </div>
  );
}

// ─────────────────────────── tabs
type TabKey = "overview" | "geographic" | "demographic" | "institutional" | "temporal";
const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "overview",      label: "Overview",      icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "geographic",    label: "Geographic",    icon: <MapIcon className="h-4 w-4" /> },
  { key: "demographic",   label: "Demographic",   icon: <Users className="h-4 w-4" /> },
  { key: "institutional", label: "Institutional", icon: <Building2 className="h-4 w-4" /> },
  { key: "temporal",      label: "Temporal",      icon: <TrendingUp className="h-4 w-4" /> },
];

function TabBar({ value, onChange }: { value: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-card p-1.5 text-card-foreground shadow-sm">
      {TABS.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={
              active
                ? { background: "var(--gradient-brand)", color: "var(--paper)" }
                : { color: "var(--ink)", opacity: 0.75 }
            }
          >
            {t.icon}
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
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16">
        <BackendOfflineNotice onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-10">
      {/* header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="eyebrow text-coral mb-3">Analytics</div>
          <h1 className="display-lg">
            The dataset, at <span className="text-coral">a glance.</span>
          </h1>
          <p className="mt-3 max-w-xl text-foreground/75">
            Exploratory analysis of anonymized patient genetic testing records, 2021–2025.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-card-foreground/80 shadow-sm">
            <Search className="h-4 w-4 opacity-70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search regions, facilities…"
              className="w-44 bg-transparent outline-none placeholder:text-card-foreground/50"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-semibold text-card-foreground/80 shadow-sm">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-7">
        <TabBar value={tab} onChange={setTab} />
      </div>

      {/* body */}
      <div className="mt-7">
        {isLoading && <Skeleton />}
        {data && (
          <div className="animate-fade-up space-y-6">
            <KpiRow data={data} />
            {tab === "overview"      && <OverviewTab data={data} />}
            {tab === "geographic"    && <GeographicTab data={data} query={q} />}
            {tab === "demographic"   && <DemographicTab data={data} />}
            {tab === "institutional" && <InstitutionalTab data={data} query={q} />}
            {tab === "temporal"      && <TemporalTab data={data} />}
          </div>
        )}
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Database className="h-5 w-5" />}
        label="Total Records" value={total.toLocaleString()}
        sub={data.year_coverage ? `Covering ${data.year_coverage}` : null}
        accent="var(--teal)"
      />
      <StatCard
        icon={<CalendarRange className="h-5 w-5" />}
        label="Year Coverage" value={data.year_coverage ?? "—"}
        sub={`${data.annual_volume?.length ?? 0} reporting years`}
        accent="var(--purple)"
      />
      <StatCard
        icon={<MapIcon className="h-5 w-5" />}
        label="Regions" value={regions}
        sub="Island groups covered"
        accent="var(--mustard)"
      />
      <StatCard
        icon={<Stethoscope className="h-5 w-5" />}
        label="Disease Categories" value={diseases}
        sub="Distinct conditions tracked"
        accent="var(--teal)"
      />
    </div>
  );
}

// ─────────────────────────── OVERVIEW
function OverviewTab({ data }: { data: any }) {
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Type of Genetic Test" hint="Overall distribution">
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.test_type_distribution ?? []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {(data.test_type_distribution ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Annual Testing Volume" hint="Yearly counts with cumulative trend" className="lg:col-span-2">
          <ChartBox>
            <ResponsiveContainer>
              <ComposedChart data={data.annual_volume ?? []}>
                <defs>
                  <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="var(--teal)"   stopOpacity={0.85} />
                    <stop offset="100%" stopColor="var(--purple)" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="year" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="url(#volFill)" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="cumulative" stroke="var(--ink)" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Disease Category Frequency" hint="Most-tested conditions">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={data.disease_category ?? []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis type="number" tick={axisTick} />
                <YAxis dataKey="name" type="category" tick={axisTick} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="var(--purple)" radius={[0, 999, 999, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Yearly Targeted vs Comprehensive" hint="Test mix over time">
          <ChartBox>
            <ResponsiveContainer>
              <ComposedChart data={data.yearly_by_test_type ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="year" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Targeted" stroke="var(--teal)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Comprehensive" stroke="var(--purple)" strokeWidth={2.5} dot={{ r: 3 }} />
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
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<MapIcon className="h-5 w-5" />} label="Top Region" value={top?.name ?? "—"} sub={top ? `${top.value.toLocaleString()} records` : ""} accent="var(--teal)" />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Coverage" value={`${regions.length}`} sub="Island groups represented" accent="var(--purple)" />
        <StatCard icon={<Database className="h-5 w-5" />} label="Total Tests" value={total.toLocaleString()} sub="Across all regions" accent="var(--mustard)" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Philippines" hint="Testing volume by island group">
          <PhilippinesMap data={regions} />
        </Panel>
        <Panel title="Regional Breakdown" hint="Counts per island group">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={filtered} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis type="number" tick={axisTick} />
                <YAxis dataKey="name" type="category" tick={axisTick} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 999, 999, 0]}>
                  {filtered.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      <Panel title="Region × Test Type" hint="Which test types dominate in each region">
        <ChartBox h={300}>
          <ResponsiveContainer>
            <BarChart data={data.region_vs_test ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Targeted" stackId="a" fill="var(--teal)" />
              <Bar dataKey="Comprehensive" stackId="a" fill="var(--purple)" />
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
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Patients" value={total.toLocaleString()} sub="Anonymized records" accent="var(--teal)" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Female Share" value={`${pct(female)}%`} sub={`${female.toLocaleString()} records`} accent="var(--purple)" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Male Share" value={`${pct(male)}%`} sub={`${male.toLocaleString()} records`} accent="var(--mustard)" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Sex Distribution" hint="Patient mix">
          <ChartBox>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sex} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {sex.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Sex × Test Type" hint="How test preference differs by sex">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={data.sex_vs_test ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Targeted" fill="var(--teal)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Comprehensive" fill="var(--purple)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      <Panel title="Disease Category × Test Type" hint="Targeted vs comprehensive by condition">
        <ChartBox h={320}>
          <ResponsiveContainer>
            <BarChart data={data.disease_vs_test ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={axisTick} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Targeted" stackId="a" fill="var(--teal)" />
              <Bar dataKey="Comprehensive" stackId="a" fill="var(--purple)" />
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Facility Types" value={fac.length} sub="Distinct categories" accent="var(--teal)" />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Public" value={`${total ? Math.round(publicTotal / total * 100) : 0}%`} sub={`${publicTotal.toLocaleString()} records`} accent="var(--purple)" />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Private" value={`${total ? Math.round(privateTotal / total * 100) : 0}%`} sub={`${privateTotal.toLocaleString()} records`} accent="var(--mustard)" />
        <StatCard icon={<Database className="h-5 w-5" />} label="Total Records" value={total.toLocaleString()} sub="Across all facilities" accent="var(--teal)" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Facility Distribution" hint="Records by facility type">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={fac}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {fac.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Facility × Test Type" hint="Targeted vs Comprehensive">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={facVsTest}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Targeted" stackId="a" fill="var(--teal)" />
                <Bar dataKey="Comprehensive" stackId="a" fill="var(--purple)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      <Panel title="Facility Listing" hint="All registered facility categories" action={<span>{rows.length} entries</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-[0.12em] text-card-foreground/60">
                <th className="px-4 py-3 text-left">Facility Type</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-right">Records</th>
                <th className="px-4 py-3 text-right">Share</th>
                <th className="px-4 py-3 text-left">Dominant Test</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-card-foreground/10">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        background: r.sector === "Public"
                          ? "color-mix(in oklab, var(--teal) 22%, transparent)"
                          : "color-mix(in oklab, var(--purple) 22%, transparent)",
                        color: r.sector === "Public" ? "var(--teal-deep)" : "var(--purple-deep)",
                      }}
                    >
                      {r.sector}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.sum.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.share}%</td>
                  <td className="px-4 py-3">{r.dominant}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-card-foreground/60">No facilities match your search.</td></tr>
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
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<CalendarRange className="h-5 w-5" />} label="Peak Year" value={peak?.year ?? "—"} sub={peak ? `${peak.count.toLocaleString()} tests` : ""} accent="var(--teal)" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Growth" value={`${growth > 0 ? "+" : ""}${growth}%`} sub={`From ${first?.year} → ${last?.year}`} accent="var(--purple)" />
        <StatCard icon={<Database className="h-5 w-5" />} label="Cumulative" value={(last?.cumulative ?? 0).toLocaleString()} sub="Tests recorded through latest year" accent="var(--mustard)" />
      </div>

      <Panel title="Annual Testing Volume" hint="Yearly counts with cumulative trend">
        <ChartBox h={320}>
          <ResponsiveContainer>
            <ComposedChart data={vol}>
              <defs>
                <linearGradient id="tVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="var(--teal)"   stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--purple)" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="year" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="url(#tVol)" radius={[8, 8, 0, 0]} />
              <Line type="monotone" dataKey="cumulative" stroke="var(--ink)" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartBox>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Cumulative Growth" hint="Running total of tests over time">
          <ChartBox>
            <ResponsiveContainer>
              <AreaChart data={vol}>
                <defs>
                  <linearGradient id="cumA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="year" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="cumulative" stroke="var(--teal-deep)" strokeWidth={2.5} fill="url(#cumA)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Yearly Test Mix" hint="Targeted vs Comprehensive over years">
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={data.yearly_by_test_type ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="year" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Targeted" stackId="a" fill="var(--teal)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Comprehensive" stackId="a" fill="var(--purple)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>
    </>
  );
}
