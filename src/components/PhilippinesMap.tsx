import { useEffect, useMemo, useRef, useState } from "react";

type RegionDatum = { name: string; value: number };
type RegionByTest = { name: string; Targeted: number; Comprehensive: number };
type RegionByYear = { region: string; year: string; count: number; Targeted: number; Comprehensive: number };

const ISLAND_CENTERS: Record<string, [number, number]> = {
  Luzon:    [16.5, 121.0],
  Visayas:  [11.0, 123.6],
  Mindanao: [ 7.8, 124.8],
};

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

const REGION_DOTS: { pos: [number, number]; label: string; island: string }[] = [
  { pos: [14.5995, 120.9842], label: "NCR",         island: "Luzon" },
  { pos: [16.95,   121.083],  label: "CAR",         island: "Luzon" },
  { pos: [16.6157, 120.3167], label: "Region I",    island: "Luzon" },
  { pos: [17.0,    121.8],    label: "Region II",   island: "Luzon" },
  { pos: [15.2,    120.6],    label: "Region III",  island: "Luzon" },
  { pos: [14.1,    121.3],    label: "CALABARZON",  island: "Luzon" },
  { pos: [12.5,    121.1],    label: "MIMAROPA",    island: "Luzon" },
  { pos: [13.4,    123.4],    label: "Region V",    island: "Luzon" },
  { pos: [10.9,    122.6],    label: "Region VI",   island: "Visayas" },
  { pos: [10.3157, 123.8854], label: "Region VII",  island: "Visayas" },
  { pos: [11.5,    125.0],    label: "Region VIII", island: "Visayas" },
  { pos: [ 7.85,   122.4],    label: "Region IX",   island: "Mindanao" },
  { pos: [ 8.25,   124.6],    label: "Region X",    island: "Mindanao" },
  { pos: [ 7.1907, 125.7],    label: "Region XI",   island: "Mindanao" },
  { pos: [ 6.45,   124.85],   label: "Region XII",  island: "Mindanao" },
  { pos: [ 8.9475, 125.5406], label: "Caraga",      island: "Mindanao" },
  { pos: [ 6.8,    124.2452], label: "BARMM",       island: "Mindanao" },
];

type Mode = "bubbles" | "choropleth" | "heat";
type Metric = "total" | "targeted" | "comprehensive" | "share";
type Basemap = "light" | "dark" | "satellite";
type IslandName = "Luzon" | "Visayas" | "Mindanao";

const BASEMAPS: Record<Basemap, { url: string; attr: string; preview: string }> = {
  light:     { url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", attr: "© OSM © CARTO", preview: "linear-gradient(135deg,#f5f5f5,#e2e2e2)" },
  dark:      { url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",  attr: "© OSM © CARTO", preview: "linear-gradient(135deg,#2a2a35,#0f0f15)" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "Tiles © Esri", preview: "linear-gradient(135deg,#3b5f3a,#1d3a4a)" },
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
    Circle: any; Polygon: any; useMap: any;
  }>(null);

  const [mode, setMode] = useState<Mode>("bubbles");
  const [metric, setMetric] = useState<Metric>("total");
  const [basemap, setBasemap] = useState<Basemap>("light");
  const [year, setYear] = useState<string>("all");
  const [selected, setSelected] = useState<IslandName | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [islandsOn, setIslandsOn] = useState<Record<IslandName, boolean>>({ Luzon: true, Visayas: true, Mindanao: true });
  const [showLabels, setShowLabels] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const [minThreshold, setMinThreshold] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const mapRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("react-leaflet"),
      // @ts-ignore
      import("leaflet/dist/leaflet.css"),
    ]).then(([rl]) => {
      if (cancelled) return;
      setComp({
        MapContainer: rl.MapContainer, TileLayer: rl.TileLayer,
        CircleMarker: rl.CircleMarker, Tooltip: rl.Tooltip,
        Circle: rl.Circle, Polygon: rl.Polygon, useMap: rl.useMap,
      });
    });
    return () => { cancelled = true; };
  }, []);

  const years = useMemo(() => {
    const s = new Set(regionByYear.map((r) => r.year));
    return Array.from(s).sort();
  }, [regionByYear]);

  // Year scrubber (play/pause)
  useEffect(() => {
    if (!playing || years.length === 0) return;
    const id = setInterval(() => {
      setYear((cur) => {
        const all = ["all", ...years];
        const idx = all.indexOf(cur);
        return all[(idx + 1) % all.length];
      });
    }, 1400);
    return () => clearInterval(id);
  }, [playing, years]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "1") setMode("bubbles");
      else if (e.key === "2") setMode("choropleth");
      else if (e.key === "3") setMode("heat");
      else if (e.key === "f" || e.key === "F") setFullscreen((f) => !f);
      else if (e.key === "r" || e.key === "R") { setSelected(null); mapRef.current?.flyTo([12.5, 122.5], 6, { duration: 0.7 }); }
      else if (e.key === "Escape") setFullscreen(false);
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const all = ["all", ...years];
        const idx = all.indexOf(year);
        const next = e.key === "ArrowRight" ? (idx + 1) % all.length : (idx - 1 + all.length) % all.length;
        setYear(all[next]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [year, years]);

  const islandValues = useMemo(() => {
    const out: Record<string, { total: number; targeted: number; comprehensive: number }> = {};
    for (const name of Object.keys(ISLAND_CENTERS)) out[name] = { total: 0, targeted: 0, comprehensive: 0 };
    if (year === "all" || regionByYear.length === 0) {
      for (const r of data) if (out[r.name]) out[r.name].total = r.value;
      for (const r of regionByTest) if (out[r.name]) { out[r.name].targeted = r.Targeted; out[r.name].comprehensive = r.Comprehensive; }
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

  const totalAll = Object.values(islandValues).reduce((s, x) => s + x.total, 0);

  const valueFor = (name: string) => {
    const v = islandValues[name] ?? { total: 0, targeted: 0, comprehensive: 0 };
    switch (metric) {
      case "targeted":      return v.targeted;
      case "comprehensive": return v.comprehensive;
      case "share":         return Math.round((v.total / Math.max(1, totalAll)) * 1000) / 10;
      default:              return v.total;
    }
  };

  const allValues = Object.keys(ISLAND_CENTERS).map(valueFor);
  const maxV = Math.max(1, ...allValues);
  const minV = Math.min(...allValues);

  const metricLabel = metric === "share" ? "% Share"
    : metric === "targeted" ? "Targeted"
    : metric === "comprehensive" ? "Comprehensive" : "Total Records";

  function MapEffects() {
    if (!Comp) return null;
    const map = Comp.useMap();
    useEffect(() => { mapRef.current = map; }, [map]);
    useEffect(() => {
      if (selected && ISLAND_CENTERS[selected]) {
        map.flyTo(ISLAND_CENTERS[selected], 7, { duration: 0.9 });
      }
    }, [selected]);
    return null;
  }

  if (!Comp) {
    return (
      <div className="h-[640px] w-full rounded-2xl animate-pulse"
        style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }} />
    );
  }
  const { MapContainer, TileLayer, CircleMarker, Tooltip, Circle, Polygon } = Comp;

  const containerCls = fullscreen
    ? "fixed inset-4 z-50 rounded-2xl overflow-hidden bg-white"
    : "relative rounded-2xl overflow-hidden bg-white";

  const containerStyle = fullscreen
    ? { border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }
    : { border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)", height: 680 };

  const selectedData = selected ? islandValues[selected] : null;

  const handleZoom = (delta: number) => {
    const m = mapRef.current;
    if (!m) return;
    m.setZoom(Math.max(5, Math.min(10, m.getZoom() + delta)));
  };

  const handleReset = () => {
    setSelected(null);
    mapRef.current?.flyTo([12.5, 122.5], 6, { duration: 0.7 });
  };

  const visibleIsland = (name: string) => islandsOn[name as IslandName] !== false;
  const passThreshold = (v: number) => v >= minThreshold;

  return (
    <>
      {fullscreen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setFullscreen(false)} />}
      <div ref={wrapRef} className={containerCls} style={containerStyle}>
        {/* Scoped: hide leaflet attribution + zoom defaults within this map */}
        <style>{`
          .ph-map .leaflet-control-attribution { display: none !important; }
          .ph-map .leaflet-control-zoom { display: none !important; }
        `}</style>

        <div className="ph-map h-full w-full">
          <MapContainer
            center={[12.5, 122.5]}
            zoom={6}
            minZoom={5}
            maxZoom={10}
            scrollWheelZoom
            zoomControl={false}
            attributionControl={false}
            style={{ height: "100%", width: "100%", background: "var(--paper)" }}
          >
            <TileLayer attribution="" url={BASEMAPS[basemap].url} />
            <MapEffects />

            {mode === "choropleth" && Object.entries(ISLAND_HULLS).map(([name, coords]) => {
              if (!visibleIsland(name)) return null;
              const v = valueFor(name);
              if (!passThreshold(v)) return null;
              const ratio = (v - minV) / Math.max(1, maxV - minV);
              const idx = Math.min(PURPLE_RAMP.length - 1, Math.floor(ratio * PURPLE_RAMP.length));
              return (
                <Polygon
                  key={name}
                  positions={coords}
                  eventHandlers={{ click: () => setSelected(name as IslandName) }}
                  pathOptions={{
                    color: selected === name ? "var(--ink)" : PURPLE_RAMP[PURPLE_RAMP.length - 1],
                    weight: selected === name ? 3 : 1,
                    fillColor: PURPLE_RAMP[idx],
                    fillOpacity: 0.75,
                  }}
                >
                  <Tooltip direction="top" sticky>
                    <MiniStat name={name} v={islandValues[name]} totalAll={totalAll} />
                  </Tooltip>
                </Polygon>
              );
            })}

            {mode === "heat" && Object.entries(ISLAND_CENTERS).flatMap(([name, center]) => {
              if (!visibleIsland(name)) return [];
              const v = valueFor(name);
              if (!passThreshold(v)) return [];
              const ratio = v / maxV;
              const base = 80000 + ratio * 260000;
              return [0.3, 0.55, 0.8, 1].map((m, i) => (
                <Circle
                  key={`${name}-${i}`}
                  center={center}
                  radius={base * m}
                  pathOptions={{ stroke: false, fillColor: "var(--purple)", fillOpacity: 0.10 + (1 - m) * 0.18 }}
                />
              ));
            })}

            {mode === "bubbles" && Object.entries(ISLAND_CENTERS).map(([name, center]) => {
              if (!visibleIsland(name)) return null;
              const v = valueFor(name);
              if (!passThreshold(v)) return null;
              const ratio = v / maxV;
              const radiusM = 60000 + ratio * 260000;
              const isSel = selected === name;
              return (
                <Circle
                  key={name}
                  center={center}
                  radius={radiusM}
                  eventHandlers={{ click: () => setSelected(name as IslandName) }}
                  pathOptions={{
                    color: isSel ? "var(--ink)" : "var(--purple)",
                    fillColor: "var(--purple)",
                    fillOpacity: isSel ? 0.45 : 0.28,
                    weight: isSel ? 3 : 2,
                  }}
                >
                  {showLabels && (
                    <Tooltip direction="top" offset={[0, -8]} permanent>
                      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600 }}>
                        {name} · {v.toLocaleString()}{metric === "share" ? "%" : ""}
                      </div>
                    </Tooltip>
                  )}
                  <Tooltip direction="top" sticky>
                    <MiniStat name={name} v={islandValues[name]} totalAll={totalAll} />
                  </Tooltip>
                </Circle>
              );
            })}

            {showDots && REGION_DOTS.filter((d) => visibleIsland(d.island)).map((d, i) => (
              <CircleMarker
                key={i}
                center={d.pos}
                radius={3.5}
                pathOptions={{ color: "var(--ink)", fillColor: "var(--ink)", fillOpacity: 0.55, weight: 0 }}
              >
                <Tooltip direction="top">
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 11 }}>{d.label}</span>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* ── Top-left: Selected region detail */}
        {selectedData && selected && (
          <div className="absolute top-4 left-4 z-[400] w-[270px] rounded-2xl bg-white/95 backdrop-blur p-4 shadow-xl animate-fade-up"
            style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-[10px] tracking-widest" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))" }}>SELECTED REGION</div>
                <div className="font-display text-[22px] mt-0.5" style={{ color: "var(--ink)" }}>{selected}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[20px] leading-none opacity-60 hover:opacity-100" style={{ color: "var(--ink)" }} aria-label="Close">×</button>
            </div>
            <div className="mt-3 space-y-2 text-[13px]" style={{ fontFamily: "Poppins, sans-serif", color: "var(--ink)" }}>
              <Row label="Total" value={selectedData.total.toLocaleString()} />
              <Row label="Targeted" value={selectedData.targeted.toLocaleString()} />
              <Row label="Comprehensive" value={selectedData.comprehensive.toLocaleString()} />
              <Row label="Share" value={`${totalAll ? ((selectedData.total/totalAll)*100).toFixed(1) : 0}%`} />
            </div>
          </div>
        )}

        {/* ── Top-right: Layers & Filters drawer */}
        <div className="absolute top-4 right-4 z-[400]">
          <LayersDrawer
            open={drawerOpen}
            setOpen={setDrawerOpen}
            metric={metric} setMetric={setMetric}
            year={year} setYear={setYear} years={years}
            playing={playing} setPlaying={setPlaying}
            basemap={basemap} setBasemap={setBasemap}
            islandsOn={islandsOn} setIslandsOn={setIslandsOn}
            showLabels={showLabels} setShowLabels={setShowLabels}
            showDots={showDots} setShowDots={setShowDots}
            minThreshold={minThreshold} setMinThreshold={setMinThreshold}
            maxV={maxV} minV={minV} metricLabel={metricLabel}
          />
        </div>

        {/* ── Bottom-left: Mode switcher */}
        <div className="absolute bottom-5 left-5 z-[400] flex items-center gap-1 rounded-full bg-white/95 backdrop-blur p-1.5 shadow-xl"
          style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }}>
          {([
            ["bubbles", "Bubbles", "●"],
            ["choropleth", "Regions", "◆"],
            ["heat", "Heat", "≋"],
          ] as [Mode, string, string][]).map(([v, l, g]) => {
            const active = mode === v;
            return (
              <button
                key={v}
                onClick={() => setMode(v)}
                title={`${l} (shortcut: ${v === "bubbles" ? "1" : v === "choropleth" ? "2" : "3"})`}
                className="inline-flex items-center gap-2 rounded-full px-4 h-10 font-display text-[13px] tracking-wide transition-colors"
                style={active
                  ? { background: "var(--ink)", color: "var(--paper)" }
                  : { background: "transparent", color: "var(--ink)", opacity: 0.75 }
                }
              >
                <span aria-hidden style={{ fontSize: 12 }}>{g}</span>
                {l}
              </button>
            );
          })}
        </div>

        {/* ── Bottom-right: Action stack (zoom + reset + fullscreen) */}
        <div className="absolute bottom-5 right-5 z-[400] flex items-center gap-1.5">
          <div className="flex flex-col rounded-full bg-white/95 backdrop-blur shadow-xl overflow-hidden"
            style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }}>
            <IconBtn title="Zoom in (+)" onClick={() => handleZoom(1)} label="+" />
            <div className="h-px w-full" style={{ background: "color-mix(in oklab, var(--ink) 12%, transparent)" }} />
            <IconBtn title="Zoom out (−)" onClick={() => handleZoom(-1)} label="−" />
          </div>
          <IconBtn title="Reset view (R)" onClick={handleReset} label="⟲" pill />
          <IconBtn title={fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"} onClick={() => setFullscreen((f) => !f)} label={fullscreen ? "⤫" : "⛶"} pill solid />
        </div>

        {/* ── Tiny attribution (legal, off-canvas, bottom-right text) */}
        <div className="absolute bottom-1 right-2 z-[300] text-[9px] opacity-40 pointer-events-none"
          style={{ color: "var(--ink)", fontFamily: "Poppins, sans-serif" }}>
          {BASEMAPS[basemap].attr}
        </div>
      </div>

      {!fullscreen && (
        <p className="mt-3 text-center text-[12.5px]" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))", fontFamily: "Poppins, sans-serif" }}>
          Click an island for details · Scroll to zoom · Keys: <kbd style={kbd}>1</kbd>/<kbd style={kbd}>2</kbd>/<kbd style={kbd}>3</kbd> mode · <kbd style={kbd}>←</kbd>/<kbd style={kbd}>→</kbd> year · <kbd style={kbd}>F</kbd> fullscreen · <kbd style={kbd}>R</kbd> reset
        </p>
      )}
    </>
  );
}

const kbd: React.CSSProperties = {
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 10.5,
  padding: "1px 5px",
  borderRadius: 4,
  background: "color-mix(in oklab, var(--ink) 8%, transparent)",
  color: "var(--ink)",
  margin: "0 2px",
};

function IconBtn({
  onClick, label, title, solid, pill,
}: { onClick: () => void; label: string; title: string; solid?: boolean; pill?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center h-10 w-10 font-display text-[18px] leading-none transition-colors ${pill ? "rounded-full shadow-xl" : ""}`}
      style={
        solid
          ? { background: "var(--ink)", color: "var(--paper)", border: "1px solid var(--ink)" }
          : pill
          ? { background: "rgba(255,255,255,0.95)", color: "var(--ink)", border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }
          : { background: "transparent", color: "var(--ink)" }
      }
    >
      {label}
    </button>
  );
}

function LayersDrawer(props: {
  open: boolean; setOpen: (b: boolean) => void;
  metric: Metric; setMetric: (m: Metric) => void;
  year: string; setYear: (y: string) => void; years: string[];
  playing: boolean; setPlaying: (b: boolean) => void;
  basemap: Basemap; setBasemap: (b: Basemap) => void;
  islandsOn: Record<IslandName, boolean>; setIslandsOn: (v: Record<IslandName, boolean>) => void;
  showLabels: boolean; setShowLabels: (b: boolean) => void;
  showDots: boolean; setShowDots: (b: boolean) => void;
  minThreshold: number; setMinThreshold: (n: number) => void;
  maxV: number; minV: number; metricLabel: string;
}) {
  const {
    open, setOpen, metric, setMetric, year, setYear, years, playing, setPlaying,
    basemap, setBasemap, islandsOn, setIslandsOn, showLabels, setShowLabels,
    showDots, setShowDots, minThreshold, setMinThreshold, maxV, minV, metricLabel,
  } = props;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-4 h-10 font-display text-[13px] tracking-wide shadow-xl"
        style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)", color: "var(--ink)" }}
      >
        <span aria-hidden>☰</span> Layers & Filters
      </button>
    );
  }

  const metrics: [Metric, string][] = [
    ["total", "Total records"],
    ["targeted", "Targeted only"],
    ["comprehensive", "Comprehensive only"],
    ["share", "Regional share %"],
  ];

  return (
    <div className="w-[320px] max-h-[calc(100vh-220px)] overflow-y-auto rounded-2xl bg-white/97 backdrop-blur shadow-2xl animate-fade-up"
      style={{ border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "color-mix(in oklab, var(--ink) 10%, transparent)" }}>
        <div className="font-display text-[14px] tracking-wide" style={{ color: "var(--ink)" }}>Layers & Filters</div>
        <button onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100 text-[18px] leading-none" style={{ color: "var(--ink)" }} aria-label="Collapse">–</button>
      </div>

      <div className="p-4 space-y-5">
        {/* METRIC */}
        <Section label="Metric">
          <div className="grid grid-cols-2 gap-1.5">
            {metrics.map(([v, label]) => {
              const active = metric === v;
              return (
                <button
                  key={v}
                  onClick={() => setMetric(v)}
                  className="text-left rounded-lg px-2.5 py-2 font-display text-[12px] transition-colors"
                  style={active
                    ? { background: "var(--ink)", color: "var(--paper)" }
                    : { background: "color-mix(in oklab, var(--ink) 5%, transparent)", color: "var(--ink)" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${PURPLE_RAMP.join(",")})` }} />
            <div className="mt-1.5 flex justify-between text-[11px]" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))", fontFamily: "Poppins, sans-serif" }}>
              <span>{minV.toLocaleString()}{metric === "share" ? "%" : ""}</span>
              <span>{metricLabel}</span>
              <span>{maxV.toLocaleString()}{metric === "share" ? "%" : ""}</span>
            </div>
          </div>
        </Section>

        {/* YEAR */}
        {years.length > 0 && (
          <Section label="Year"
            action={
              <button
                onClick={() => setPlaying(!playing)}
                className="rounded-full px-2.5 py-1 font-display text-[11px]"
                style={{ background: playing ? "var(--purple)" : "color-mix(in oklab, var(--ink) 6%, transparent)", color: playing ? "white" : "var(--ink)" }}
                title="Auto-cycle years"
              >
                {playing ? "❚❚ Pause" : "▶ Play"}
              </button>
            }>
            <div className="flex flex-wrap gap-1.5">
              {["all", ...years].map((y) => {
                const active = year === y;
                return (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className="rounded-full px-3 py-1.5 font-display text-[12px] transition-colors"
                    style={active
                      ? { background: "var(--purple)", color: "white" }
                      : { background: "color-mix(in oklab, var(--ink) 5%, transparent)", color: "var(--ink)" }
                    }
                  >
                    {y === "all" ? "All" : y}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* BASEMAP */}
        <Section label="Basemap">
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(BASEMAPS) as Basemap[]).map((b) => {
              const active = basemap === b;
              return (
                <button
                  key={b}
                  onClick={() => setBasemap(b)}
                  className="rounded-lg overflow-hidden text-left transition"
                  style={{
                    border: active ? "2px solid var(--purple)" : "1px solid color-mix(in oklab, var(--ink) 14%, transparent)",
                  }}
                >
                  <div className="h-10 w-full" style={{ background: BASEMAPS[b].preview }} />
                  <div className="px-2 py-1.5 font-display text-[11px] capitalize" style={{ color: "var(--ink)" }}>{b}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ISLAND FILTER */}
        <Section label="Island groups">
          <div className="flex gap-1.5">
            {(["Luzon", "Visayas", "Mindanao"] as IslandName[]).map((n) => {
              const on = islandsOn[n];
              return (
                <button
                  key={n}
                  onClick={() => setIslandsOn({ ...islandsOn, [n]: !on })}
                  className="flex-1 rounded-full px-2 py-1.5 font-display text-[12px] transition-colors"
                  style={on
                    ? { background: "var(--ink)", color: "var(--paper)" }
                    : { background: "transparent", color: "var(--ink)", opacity: 0.5, border: "1px dashed color-mix(in oklab, var(--ink) 25%, transparent)" }
                  }
                >
                  {n}
                </button>
              );
            })}
          </div>
        </Section>

        {/* MIN THRESHOLD */}
        <Section label={`Minimum value: ${minThreshold.toLocaleString()}`}>
          <input
            type="range"
            min={0}
            max={Math.max(1, maxV)}
            value={Math.min(minThreshold, maxV)}
            onChange={(e) => setMinThreshold(Number(e.target.value))}
            className="w-full accent-[var(--purple)]"
          />
        </Section>

        {/* TOGGLES */}
        <Section label="Display">
          <div className="space-y-2">
            <Toggle label="Show bubble labels" checked={showLabels} onChange={setShowLabels} />
            <Toggle label="Show 17-region dots" checked={showDots} onChange={setShowDots} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-display text-[10px] tracking-widest" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))" }}>{label.toUpperCase()}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1.5 transition-colors"
      style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}
    >
      <span className="font-display text-[12px]" style={{ color: "var(--ink)" }}>{label}</span>
      <span className="relative inline-block w-9 h-5 rounded-full transition-colors"
        style={{ background: checked ? "var(--purple)" : "color-mix(in oklab, var(--ink) 20%, transparent)" }}>
        <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow"
          style={{ left: checked ? 18 : 2 }} />
      </span>
    </button>
  );
}

function MiniStat({ name, v, totalAll }: { name: string; v: { total: number; targeted: number; comprehensive: number } | undefined; totalAll: number }) {
  const x = v ?? { total: 0, targeted: 0, comprehensive: 0 };
  const share = totalAll ? ((x.total / totalAll) * 100).toFixed(1) : "0.0";
  return (
    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 11.5, minWidth: 140 }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 15, letterSpacing: "0.02em", marginBottom: 4 }}>{name}</div>
      <Row label="Total" value={x.total.toLocaleString()} />
      <Row label="Targeted" value={x.targeted.toLocaleString()} />
      <Row label="Comprehensive" value={x.comprehensive.toLocaleString()} />
      <Row label="Share" value={`${share}%`} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 py-1 last:pb-0"
      style={{ borderColor: "color-mix(in oklab, var(--ink) 10%, transparent)" }}>
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
