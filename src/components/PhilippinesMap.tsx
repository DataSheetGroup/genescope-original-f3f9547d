import { useEffect, useMemo, useRef, useState } from "react";

type RegionDatum = { name: string; value: number };
type RegionByTest = { name: string; Targeted: number; Comprehensive: number };
type RegionByYear = { region: string; year: string; count: number; Targeted: number; Comprehensive: number };

const ISLAND_CENTERS: Record<string, [number, number]> = {
  Luzon:    [16.5, 121.0],
  Visayas:  [11.0, 123.6],
  Mindanao: [ 7.8, 124.8],
};

// Rough hand-drawn hulls per island group (lon/lat pairs → leaflet [lat,lon])
const ISLAND_HULLS: Record<string, [number, number][]> = {
  Luzon: [
    [18.6,120.8],[18.5,122.2],[17.4,122.7],[15.8,122.0],[14.0,122.9],
    [13.4,123.6],[12.5,123.7],[12.6,121.9],[13.5,120.0],[15.5,119.7],
    [16.5,119.7],[18.4,120.4],
  ],
  Visayas: [
    [12.5,123.0],[12.2,125.1],[11.4,125.7],[ 9.6,126.1],[ 9.0,124.6],
    [ 9.4,122.7],[10.4,121.9],[11.6,121.8],[12.4,122.4],
  ],
  Mindanao: [
    [ 9.6,123.4],[ 9.9,125.6],[ 9.7,126.6],[ 7.4,126.7],[ 5.5,125.6],
    [ 5.6,124.2],[ 6.7,121.9],[ 7.5,121.9],[ 8.7,122.8],[ 9.0,123.5],
  ],
};

const REGION_DOTS: { pos: [number, number]; label: string }[] = [
  { pos: [14.5995, 120.9842], label: "NCR" },
  { pos: [16.95, 121.083], label: "CAR" },
  { pos: [16.6157, 120.3167], label: "Region I" },
  { pos: [17.0, 121.8], label: "Region II" },
  { pos: [15.2, 120.6], label: "Region III" },
  { pos: [14.1, 121.3], label: "CALABARZON" },
  { pos: [12.5, 121.1], label: "MIMAROPA" },
  { pos: [13.4, 123.4], label: "Region V" },
  { pos: [10.9, 122.6], label: "Region VI" },
  { pos: [10.3157, 123.8854], label: "Region VII" },
  { pos: [11.5, 125.0], label: "Region VIII" },
  { pos: [7.85, 122.4], label: "Region IX" },
  { pos: [8.25, 124.6], label: "Region X" },
  { pos: [7.1907, 125.7], label: "Region XI" },
  { pos: [6.45, 124.85], label: "Region XII" },
  { pos: [8.9475, 125.5406], label: "Caraga" },
  { pos: [6.8, 124.2452], label: "BARMM" },
];

type Mode = "bubbles" | "choropleth" | "heat";
type Metric = "total" | "targeted" | "comprehensive" | "share";
type Basemap = "light" | "dark" | "satellite";

const BASEMAPS: Record<Basemap, { url: string; attr: string }> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attr: "&copy; OpenStreetMap &copy; CARTO",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attr: "&copy; OpenStreetMap &copy; CARTO",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "Tiles &copy; Esri",
  },
};

const PURPLE_RAMP = ["#efe7ff", "#cdb6ff", "#a382ff", "#7b4fff", "#5a2bdb"];

export function PhilippinesMap({
  data,
  regionByTest = [],
  regionByYear = [],
}: {
  data: RegionDatum[];
  regionByTest?: RegionByTest[];
  regionByYear?: RegionByYear[];
}) {
  const [Comp, setComp] = useState<null | {
    MapContainer: any; TileLayer: any; CircleMarker: any; Tooltip: any;
    Circle: any; Polygon: any; ZoomControl: any; useMap: any;
  }>(null);

  const [mode, setMode] = useState<Mode>("bubbles");
  const [metric, setMetric] = useState<Metric>("total");
  const [basemap, setBasemap] = useState<Basemap>("light");
  const [year, setYear] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("react-leaflet"),
      // @ts-ignore
      import("leaflet/dist/leaflet.css"),
    ]).then(([rl]) => {
      if (cancelled) return;
      setComp({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        CircleMarker: rl.CircleMarker,
        Tooltip: rl.Tooltip,
        Circle: rl.Circle,
        Polygon: rl.Polygon,
        ZoomControl: rl.ZoomControl,
        useMap: rl.useMap,
      });
    });
    return () => { cancelled = true; };
  }, []);

  const years = useMemo(() => {
    const s = new Set(regionByYear.map((r) => r.year));
    return ["all", ...Array.from(s).sort()];
  }, [regionByYear]);

  // Derive per-island value based on metric + year
  const islandValues = useMemo(() => {
    const out: Record<string, { total: number; targeted: number; comprehensive: number }> = {};
    for (const name of Object.keys(ISLAND_CENTERS)) {
      out[name] = { total: 0, targeted: 0, comprehensive: 0 };
    }
    if (year === "all" || regionByYear.length === 0) {
      for (const r of data) {
        if (!out[r.name]) continue;
        out[r.name].total = r.value;
      }
      for (const r of regionByTest) {
        if (!out[r.name]) continue;
        out[r.name].targeted = r.Targeted;
        out[r.name].comprehensive = r.Comprehensive;
      }
    } else {
      for (const r of regionByYear) {
        if (r.year !== year || !out[r.region]) continue;
        out[r.region].total += r.count;
        out[r.region].targeted += r.Targeted;
        out[r.region].comprehensive += r.Comprehensive;
      }
    }
    return out;
  }, [data, regionByTest, regionByYear, year]);

  const valueFor = (name: string) => {
    const v = islandValues[name] ?? { total: 0, targeted: 0, comprehensive: 0 };
    const totalAll = Object.values(islandValues).reduce((s, x) => s + x.total, 0) || 1;
    switch (metric) {
      case "targeted": return v.targeted;
      case "comprehensive": return v.comprehensive;
      case "share": return Math.round((v.total / totalAll) * 1000) / 10;
      default: return v.total;
    }
  };

  const allValues = Object.keys(ISLAND_CENTERS).map(valueFor);
  const maxV = Math.max(1, ...allValues);
  const minV = Math.min(...allValues);
  const totalAll = Object.values(islandValues).reduce((s, x) => s + x.total, 0);

  const metricLabel = metric === "share" ? "% Share"
    : metric === "targeted" ? "Targeted"
    : metric === "comprehensive" ? "Comprehensive" : "Total Records";

  // Map control: fly-to on selection / reset
  function MapEffects() {
    if (!Comp) return null;
    const map = Comp.useMap();
    useEffect(() => { mapRef.current = map; }, [map]);
    useEffect(() => {
      if (selected && ISLAND_CENTERS[selected]) {
        map.flyTo(ISLAND_CENTERS[selected], 7, { duration: 0.9 });
      }
    }, [map]);
    return null;
  }

  if (!Comp) {
    return (
      <div className="h-[600px] w-full rounded-2xl animate-pulse"
        style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }} />
    );
  }
  const { MapContainer, TileLayer, CircleMarker, Tooltip, Circle, Polygon, ZoomControl } = Comp;

  const containerCls = fullscreen
    ? "fixed inset-4 z-50 rounded-2xl overflow-hidden bg-white"
    : "relative rounded-2xl overflow-hidden bg-white";

  const containerStyle = fullscreen
    ? { border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }
    : { border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)", height: 600 };

  const selectedData = selected ? islandValues[selected] : null;

  return (
    <>
      {fullscreen && <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFullscreen(false)} />}
      <div className={containerCls} style={containerStyle}>
        <MapContainer
          center={[12.5, 122.5]}
          zoom={6}
          minZoom={5}
          maxZoom={10}
          scrollWheelZoom
          zoomControl={false}
          style={{ height: "100%", width: "100%", background: "var(--paper)" }}
        >
          <TileLayer attribution={BASEMAPS[basemap].attr} url={BASEMAPS[basemap].url} />
          <ZoomControl position="bottomright" />
          <MapEffects />

          {/* Choropleth polygons */}
          {mode === "choropleth" && Object.entries(ISLAND_HULLS).map(([name, coords]) => {
            const v = valueFor(name);
            const ratio = (v - minV) / Math.max(1, maxV - minV);
            const idx = Math.min(PURPLE_RAMP.length - 1, Math.floor(ratio * PURPLE_RAMP.length));
            return (
              <Polygon
                key={name}
                positions={coords}
                eventHandlers={{ click: () => setSelected(name) }}
                pathOptions={{
                  color: selected === name ? "var(--ink)" : PURPLE_RAMP[PURPLE_RAMP.length - 1],
                  weight: selected === name ? 3 : 1,
                  fillColor: PURPLE_RAMP[idx],
                  fillOpacity: 0.75,
                }}
              >
                <Tooltip direction="top" sticky>
                  <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 12 }}>
                    <strong>{name}</strong> · {v.toLocaleString()} {metric === "share" ? "%" : ""}
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}

          {/* Heat overlay (multi-ring radial) */}
          {mode === "heat" && Object.entries(ISLAND_CENTERS).flatMap(([name, center]) => {
            const v = valueFor(name);
            const ratio = v / maxV;
            const base = 80000 + ratio * 260000;
            return [0.3, 0.55, 0.8, 1].map((m, i) => (
              <Circle
                key={`${name}-${i}`}
                center={center}
                radius={base * m}
                pathOptions={{
                  stroke: false,
                  fillColor: "var(--purple)",
                  fillOpacity: 0.10 + (1 - m) * 0.18,
                }}
              />
            ));
          })}

          {/* Bubble mode */}
          {mode === "bubbles" && Object.entries(ISLAND_CENTERS).map(([name, center]) => {
            const v = valueFor(name);
            const ratio = v / maxV;
            const radiusM = 60000 + ratio * 260000;
            const isSel = selected === name;
            return (
              <Circle
                key={name}
                center={center}
                radius={radiusM}
                eventHandlers={{ click: () => setSelected(name) }}
                pathOptions={{
                  color: isSel ? "var(--ink)" : "var(--purple)",
                  fillColor: "var(--purple)",
                  fillOpacity: isSel ? 0.45 : 0.28,
                  weight: isSel ? 3 : 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} permanent>
                  <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600 }}>
                    {name} · {v.toLocaleString()}{metric === "share" ? "%" : ""}
                  </div>
                </Tooltip>
              </Circle>
            );
          })}

          {/* 17-region context dots */}
          {REGION_DOTS.map((d, i) => (
            <CircleMarker
              key={i}
              center={d.pos}
              radius={3.5}
              pathOptions={{
                color: "var(--ink)",
                fillColor: "var(--ink)",
                fillOpacity: 0.55,
                weight: 0,
              }}
            >
              <Tooltip direction="top">
                <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 11 }}>{d.label}</span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Control panel: top-right */}
        <div className="absolute top-4 right-4 z-[400] w-[260px] rounded-xl bg-white/95 backdrop-blur p-3 space-y-3 shadow-lg"
          style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }}>
          <Segmented label="MODE" value={mode} onChange={(v) => setMode(v as Mode)}
            options={[["bubbles","Bubbles"],["choropleth","Choro"],["heat","Heat"]]} />
          <Segmented label="METRIC" value={metric} onChange={(v) => setMetric(v as Metric)}
            options={[["total","Total"],["targeted","Targeted"],["comprehensive","Compr."],["share","Share"]]} />
          <Segmented label="BASEMAP" value={basemap} onChange={(v) => setBasemap(v as Basemap)}
            options={[["light","Light"],["dark","Dark"],["satellite","Sat"]]} />
          {years.length > 1 && (
            <Segmented label="YEAR" value={year} onChange={setYear}
              options={years.map((y) => [y, y === "all" ? "All" : y]) as [string, string][]} />
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setSelected(null); mapRef.current?.flyTo([12.5, 122.5], 6, { duration: 0.7 }); }}
              className="flex-1 rounded-md px-2 py-1.5 text-[11px] font-display tracking-wider"
              style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)", color: "var(--ink)" }}
            >RESET</button>
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="flex-1 rounded-md px-2 py-1.5 text-[11px] font-display tracking-wider"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >{fullscreen ? "EXIT" : "EXPAND"}</button>
          </div>
        </div>

        {/* Detail card: bottom-left when selected */}
        {selectedData && selected && (
          <div className="absolute top-4 left-4 z-[400] w-[240px] rounded-xl bg-white/95 backdrop-blur p-4 shadow-lg animate-fade-up"
            style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-[10px] tracking-widest" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))" }}>SELECTED</div>
                <div className="font-display text-[20px] mt-0.5" style={{ color: "var(--ink)" }}>{selected}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[16px] leading-none opacity-60 hover:opacity-100" style={{ color: "var(--ink)" }}>×</button>
            </div>
            <div className="mt-3 space-y-2 text-[12px]" style={{ fontFamily: "Poppins, sans-serif", color: "var(--ink)" }}>
              <Row label="Total" value={selectedData.total.toLocaleString()} />
              <Row label="Targeted" value={selectedData.targeted.toLocaleString()} />
              <Row label="Comprehensive" value={selectedData.comprehensive.toLocaleString()} />
              <Row label="Share" value={`${totalAll ? ((selectedData.total/totalAll)*100).toFixed(1) : 0}%`} />
            </div>
          </div>
        )}

        {/* Legend: bottom-left */}
        <div className="absolute bottom-4 left-4 z-[400] rounded-xl bg-white/95 backdrop-blur px-3 py-2.5 shadow-lg"
          style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }}>
          <div className="font-display text-[10px] tracking-widest mb-1.5" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))" }}>
            {metricLabel} · {year === "all" ? "All Years" : year}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 rounded" style={{ background: `linear-gradient(90deg, ${PURPLE_RAMP.join(",")})` }} />
            <span className="text-[10px]" style={{ fontFamily: "Poppins, sans-serif", color: "var(--ink)" }}>
              {minV.toLocaleString()} → {maxV.toLocaleString()}{metric === "share" ? "%" : ""}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 pb-1.5 last:pb-0"
      style={{ borderColor: "color-mix(in oklab, var(--ink) 10%, transparent)" }}>
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Segmented({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <div className="font-display text-[9px] tracking-widest mb-1" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))" }}>
        {label}
      </div>
      <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid color-mix(in oklab, var(--ink) 12%, transparent)" }}>
        {options.map(([v, l]) => {
          const active = v === value;
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              className="flex-1 px-1.5 py-1 text-[10.5px] font-display tracking-wide transition-colors"
              style={
                active
                  ? { background: "var(--ink)", color: "var(--paper)" }
                  : { background: "transparent", color: "var(--ink)", opacity: 0.7 }
              }
            >{l}</button>
          );
        })}
      </div>
    </div>
  );
}
