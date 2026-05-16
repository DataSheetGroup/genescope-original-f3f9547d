import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getEdaData } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import { BackendOfflineNotice } from "@/components/BackendOfflineNotice";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GeneScope" },
      { name: "description", content: "Exploratory data analysis on anonymized 2021–2025 patient records." },
    ],
  }),
  component: Dashboard,
});

const PALETTE = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function Heatmap({ labels, values }: { labels: string[]; values: number[][] }) {
  const cell = (v: number) => {
    const a = Math.max(0, Math.min(1, Math.abs(v)));
    const color = v >= 0 ? "13, 148, 136" : "37, 99, 235";
    return `rgba(${color}, ${a * 0.85 + 0.05})`;
  };
  return (
    <div className="overflow-auto">
      <table className="text-[11px] border-separate border-spacing-0.5">
        <thead>
          <tr>
            <th></th>
            {labels.map((l) => (
              <th key={l} className="px-2 py-1 font-medium text-muted-foreground whitespace-nowrap">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, i) => (
            <tr key={i}>
              <th className="px-2 py-1 text-right font-medium text-muted-foreground whitespace-nowrap">{labels[i]}</th>
              {row.map((v, j) => (
                <td
                  key={j}
                  className="w-12 h-9 text-center rounded text-foreground"
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
        <div key={i} className="h-80 rounded-2xl border bg-muted/30 animate-pulse" />
      ))}
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <BackendOfflineNotice onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-up">
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2">
          Analytics
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">Dataset Analytics Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Exploratory Data Analysis — Molave Trading Inc. patient records (2021–2025)
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Derived from anonymized data under MOA &amp; NDA with Molave Trading Inc. — Confidential
        </p>
      </div>

      {isLoading && <Skeleton />}

      {data && (
        <div className="space-y-10">
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
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Annual Testing Volume" description="2021–2025">
                <ResponsiveContainer>
                  <ComposedChart data={data.annual_volume ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="cumulative" stroke="var(--color-chart-2)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Yearly Targeted vs Comprehensive">
                <ResponsiveContainer>
                  <ComposedChart data={data.yearly_by_test_type ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="Targeted" stroke="var(--color-chart-2)" strokeWidth={2} />
                    <Line type="monotone" dataKey="Comprehensive" stroke="var(--color-chart-1)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Disease Category Frequency">
                <ResponsiveContainer>
                  <BarChart data={data.disease_category ?? []} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} />
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
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Sex Distribution">
                <ResponsiveContainer>
                  <BarChart data={data.sex_distribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Facility Type">
                <ResponsiveContainer>
                  <BarChart data={data.facility_distribution ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Targeted" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Comprehensive" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
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
                  <div className="text-xs text-muted-foreground">No correlation data available.</div>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Targeted" stackId="a" fill="var(--color-chart-2)" />
                      <Bar dataKey="Comprehensive" stackId="a" fill="var(--color-chart-1)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}
