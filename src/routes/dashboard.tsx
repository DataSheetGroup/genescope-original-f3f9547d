import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getEdaData } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import { BackendOfflineNotice } from "@/components/BackendOfflineNotice";
import { PhilippinesMap } from "@/components/PhilippinesMap";
import labFlask from "@/assets/illustrations/lab-flask.png";
import testTube from "@/assets/illustrations/test-tube.png";
import heartPulse from "@/assets/illustrations/heart-pulse.png";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie,
  PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "GeneScope" },
      { name: "description", content: "Exploratory data analysis on anonymized 2021–2025 patient records." },
    ],
  }),
  component: Dashboard,
});

const PALETTE = ["var(--coral)", "var(--teal-soft)", "var(--mustard)", "var(--green-mid)", "var(--cream-dim)"];

const tooltipStyle = {
  background: "var(--green-deep)",
  color: "var(--cream)",
  border: "none",
  borderRadius: 12,
  fontSize: 12,
};
const axisTick = { fontSize: 11, fill: "var(--green-deep)" };
const gridStroke = "rgba(15,61,46,0.12)";

function Heatmap({ labels, values }: { labels: string[]; values: number[][] }) {
  const cell = (v: number) => {
    const a = Math.max(0, Math.min(1, Math.abs(v)));
    // coral for positive, teal for negative
    return v >= 0
      ? `color-mix(in oklab, var(--coral) ${a * 80 + 5}%, transparent)`
      : `color-mix(in oklab, var(--teal-soft) ${a * 80 + 5}%, transparent)`;
  };
  return (
    <div className="overflow-auto">
      <table className="text-[11px] border-separate border-spacing-0.5">
        <thead>
          <tr>
            <th></th>
            {labels.map((l) => (
              <th key={l} className="px-2 py-1 font-semibold text-card-foreground/65 whitespace-nowrap">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, i) => (
            <tr key={i}>
              <th className="px-2 py-1 text-right font-semibold text-card-foreground/65 whitespace-nowrap">{labels[i]}</th>
              {row.map((v, j) => (
                <td
                  key={j}
                  className="w-12 h-9 text-center rounded-md text-card-foreground"
                  style={{ background: cell(v) }}
                  title={`${labels[i]} × ${labels[j]} = ${v.toFixed(2)}`}
                >
                  {v.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-80 rounded-2xl bg-card/40 animate-pulse" />
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow text-coral mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Dashboard() {
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
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 z-10">
      <div className="mb-12 max-w-3xl">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="eyebrow text-coral mb-4">Analytics</div>
            <h1 className="display-lg">
              The dataset, at
              <br />
              <span className="text-coral">a glance.</span>
            </h1>
            <p className="mt-5 text-foreground/75">
              Exploratory data analysis on anonymized Molave Trading Inc. patient records (2021–2025).
            </p>
            <p className="mt-3 text-xs text-foreground/55">
              Derived from data under MOA &amp; NDA — Confidential.
            </p>
          </div>
        </div>
      </div>

      {isLoading && <Skeleton />}

      {data && (
        <div className="space-y-12">
          <Section title="Descriptive">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
              <ChartCard title="Type of Genetic Test" description="Overall distribution">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.test_type_distribution ?? []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                      {(data.test_type_distribution ?? []).map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--green-deep)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Annual Testing Volume" description="2021–2025">
                <ResponsiveContainer>
                  <ComposedChart data={data.annual_volume ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="year" tick={axisTick} />
                    <YAxis tick={axisTick} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="var(--coral)" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="cumulative" stroke="var(--green-deep)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Yearly Targeted vs Comprehensive">
                <ResponsiveContainer>
                  <ComposedChart data={data.yearly_by_test_type ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="year" tick={axisTick} />
                    <YAxis tick={axisTick} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--green-deep)" }} />
                    <Line type="monotone" dataKey="Targeted" stroke="var(--coral)" strokeWidth={2} />
                    <Line type="monotone" dataKey="Comprehensive" stroke="var(--green-deep)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Disease Category Frequency">
                <ResponsiveContainer>
                  <BarChart data={data.disease_category ?? []} layout="vertical">
                    <XAxis type="number" tick={axisTick} />
                    <YAxis dataKey="name" type="category" tick={axisTick} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="var(--coral)" radius={[0, 999, 999, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Geographic Region">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.region_distribution ?? []} dataKey="value" nameKey="name" outerRadius={85}>
                      {(data.region_distribution ?? []).map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--green-deep)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Sex Distribution">
                <ResponsiveContainer>
                  <BarChart data={data.sex_distribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="name" tick={axisTick} />
                    <YAxis tick={axisTick} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="var(--green-deep)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Facility Type">
                <ResponsiveContainer>
                  <BarChart data={data.facility_distribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="name" tick={axisTick} />
                    <YAxis tick={axisTick} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="var(--coral)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </Section>

          <Section title="Geographic Distribution">
            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
              <div className="rounded-2xl bg-card text-card-foreground p-4">
                <div className="mb-3 px-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Philippines</h3>
                  <p className="mt-1 text-xs text-card-foreground/65">Testing volume by island group</p>
                </div>
                <PhilippinesMap data={data.region_distribution ?? []} />
              </div>
              <ChartCard title="Regional Breakdown" description="Counts per island group">
                <ResponsiveContainer>
                  <BarChart data={data.region_distribution ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" tick={axisTick} />
                    <YAxis dataKey="name" type="category" tick={axisTick} width={80} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="var(--coral)" radius={[0, 999, 999, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </Section>

          <Section title="Comparative">
            <div className="grid lg:grid-cols-2 gap-5">
              {[
                { title: "Sex vs Test Type", d: data.sex_vs_test },
                { title: "Region vs Test Type", d: data.region_vs_test },
                { title: "Disease Category vs Test Type", d: data.disease_vs_test },
                { title: "Facility Type vs Test Type", d: data.facility_vs_test },
              ].map((c) => (
                <ChartCard key={c.title} title={c.title}>
                  <ResponsiveContainer>
                    <BarChart data={c.d ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="name" tick={axisTick} />
                      <YAxis tick={axisTick} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "var(--green-deep)" }} />
                      <Bar dataKey="Targeted" fill="var(--coral)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Comprehensive" fill="var(--green-deep)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              ))}
            </div>

            <div className="mt-5">
              <ChartCard title="Correlation Matrix" description="Encoded variables">
                {data.correlation_matrix ? (
                  <Heatmap labels={data.correlation_matrix.labels} values={data.correlation_matrix.values} />
                ) : (
                  <div className="text-xs text-card-foreground/65">No correlation data available.</div>
                )}
              </ChartCard>
            </div>
          </Section>

          <Section title="Stacked Distribution">
            <div className="grid lg:grid-cols-3 gap-5">
              {[
                { title: "Test Type by Region", d: data.stacked_region },
                { title: "Test Type by Disease Category", d: data.stacked_disease },
                { title: "Test Type by Facility Type", d: data.stacked_facility },
              ].map((c) => (
                <ChartCard key={c.title} title={c.title}>
                  <ResponsiveContainer>
                    <BarChart data={c.d ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="name" tick={axisTick} />
                      <YAxis tick={axisTick} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "var(--green-deep)" }} />
                      <Bar dataKey="Targeted" stackId="a" fill="var(--coral)" />
                      <Bar dataKey="Comprehensive" stackId="a" fill="var(--green-deep)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              ))}
            </div>
          </Section>
        </div>
      )}
      </div>
    </div>
  );
}
