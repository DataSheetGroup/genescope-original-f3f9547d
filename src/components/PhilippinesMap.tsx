import { useEffect, useMemo, useRef, useState } from "react";
import stickerFlaskPurple from "@/assets/stickers/flask-purple.png";
import stickerFlaskGreen from "@/assets/stickers/flask-green.png";
import stickerGoggles from "@/assets/stickers/goggles.png";
import stickerMolecule from "@/assets/stickers/molecule.png";
import stickerMagnet from "@/assets/stickers/magnet.png";
import stickerMicroscope from "@/assets/stickers/microscope.png";
import stickerDropper from "@/assets/stickers/dropper.png";
import stickerPotion from "@/assets/stickers/potion-blue.png";

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

const BASEMAPS: Record<Basemap, { url: string; attr: string }> = {
  light:     { url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", attr: "© OSM © CARTO" },
  dark:      { url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",  attr: "© OSM © CARTO" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "Tiles © Esri" },
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
  // (drawer state removed; controls are now distributed pods)
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

  // Native Fullscreen API
  const toggleFs = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };
  useEffect(() => {
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setFullscreen(fs);
      setTimeout(() => mapRef.current?.invalidateSize?.(), 120);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "1") setMode("bubbles");
      else if (e.key === "2") setMode("choropleth");
      else if (e.key === "3") setMode("heat");
      else if (e.key === "f" || e.key === "F") toggleFs();
      else if (e.key === "r" || e.key === "R") { setSelected(null); mapRef.current?.flyTo([12.5, 122.5], 6, { duration: 0.7 }); }
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

  const containerCls = "relative rounded-2xl overflow-hidden bg-white";
  const containerStyle: React.CSSProperties = fullscreen
    ? { border: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)", height: "100vh", width: "100vw", borderRadius: 0 }
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
          <div className="absolute top-4 left-4 z-[400] w-[260px] rounded-xl p-4 animate-fade-up"
            style={{ background: "#fff", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)" }}>
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

        {/* ── POD: Metric (top-left, below selected card) */}
        <Pod className={`top-4 ${selectedData ? "left-[284px]" : "left-4"}`}>
          <Sticker src={stickerFlaskPurple} />
          <PodLabel>Metric</PodLabel>
          {([
            ["total", "Total"],
            ["targeted", "Targeted"],
            ["comprehensive", "Comprehensive"],
            ["share", "Share %"],
          ] as [Metric, string][]).map(([v, l]) => (
            <PodChip key={v} active={metric === v} onClick={() => setMetric(v)}>{l}</PodChip>
          ))}
          <span className="ml-1 font-display text-[10.5px] tabular-nums" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))" }}>
            {minV.toLocaleString()}{metric === "share" ? "%" : ""} – {maxV.toLocaleString()}{metric === "share" ? "%" : ""}
          </span>
        </Pod>

        {/* ── POD: Basemap (top-right) */}
        <Pod className="top-4 right-4">
          <Sticker src={stickerGoggles} />
          <PodLabel>Basemap</PodLabel>
          {(Object.keys(BASEMAPS) as Basemap[]).map((b) => (
            <PodChip key={b} active={basemap === b} onClick={() => setBasemap(b)}>
              <span className="capitalize">{b}</span>
            </PodChip>
          ))}
        </Pod>

        {/* ── POD: Mode switcher (middle-left) */}
        <Pod className="left-4 top-1/2 -translate-y-1/2 flex-col items-stretch !gap-1.5">
          <div className="flex items-center gap-2">
            <Sticker src={stickerMolecule} />
            <PodLabel>View</PodLabel>
          </div>
          {([
            ["bubbles", "Bubbles", "1"],
            ["choropleth", "Regions", "2"],
            ["heat", "Heat", "3"],
          ] as [Mode, string, string][]).map(([v, l, k]) => (
            <PodChip key={v} active={mode === v} onClick={() => setMode(v)} title={`${l} (${k})`} block>
              {l}
            </PodChip>
          ))}
        </Pod>

        {/* ── POD: Island filter + display toggles (middle-right) */}
        <Pod className="right-4 top-1/2 -translate-y-1/2 flex-col items-stretch !gap-1.5">
          <div className="flex items-center gap-2">
            <Sticker src={stickerPotion} />
            <PodLabel>Islands</PodLabel>
          </div>
          {(["Luzon", "Visayas", "Mindanao"] as IslandName[]).map((n) => (
            <PodChip key={n} active={!!islandsOn[n]} onClick={() => setIslandsOn({ ...islandsOn, [n]: !islandsOn[n] })} block>
              {n}
            </PodChip>
          ))}
          <div className="h-px my-0.5" style={{ background: "color-mix(in oklab, var(--ink) 12%, transparent)" }} />
          <PodChip active={showLabels} onClick={() => setShowLabels(!showLabels)} block>Labels</PodChip>
          <PodChip active={showDots} onClick={() => setShowDots(!showDots)} block>Region dots</PodChip>
        </Pod>

        {/* ── POD: Min threshold (bottom-left) */}
        <Pod className="bottom-5 left-4 w-[220px]">
          <Sticker src={stickerMagnet} />
          <PodLabel>Min</PodLabel>
          <input
            type="range"
            min={0}
            max={Math.max(1, maxV)}
            value={Math.min(minThreshold, maxV)}
            onChange={(e) => setMinThreshold(Number(e.target.value))}
            className="flex-1 accent-[var(--ink)] min-w-0"
          />
          <span className="font-display text-[10.5px] tabular-nums" style={{ color: "var(--ink)" }}>{minThreshold.toLocaleString()}</span>
        </Pod>

        {/* ── POD: Year scrubber (bottom-center) */}
        {years.length > 0 && (
          <Pod className="bottom-20 left-1/2 -translate-x-1/2 max-w-[calc(100%-32px)] overflow-x-auto">
            <Sticker src={stickerFlaskGreen} />
            <PodLabel>Year</PodLabel>
            <button
              onClick={() => setPlaying(!playing)}
              className="rounded-md px-2 h-7 font-display text-[11px] transition-colors shrink-0"
              style={playing
                ? { background: "var(--ink)", color: "var(--paper)" }
                : { background: "transparent", color: "var(--ink)", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)" }}
              title="Auto-cycle years"
            >{playing ? "❚❚" : "▶"}</button>
            {["all", ...years].map((y) => (
              <PodChip key={y} active={year === y} onClick={() => setYear(y)}>{y === "all" ? "All" : y}</PodChip>
            ))}
          </Pod>
        )}

        {/* ── POD STACK: Zoom + Reset + Fullscreen (bottom-right, auto-spaced) */}
        <div className="absolute bottom-5 right-4 z-[400] flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-xl px-1 py-1"
            style={{ background: "#fff", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)" }}>
            <button onClick={() => handleZoom(-1)} title="Zoom out (−)"
              className="inline-flex items-center justify-center h-7 w-7 font-display text-[15px] leading-none rounded-md hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)]"
              style={{ color: "var(--ink)" }}>−</button>
            <div className="w-px h-5" style={{ background: "color-mix(in oklab, var(--ink) 14%, transparent)" }} />
            <button onClick={() => handleZoom(1)} title="Zoom in (+)"
              className="inline-flex items-center justify-center h-7 w-7 font-display text-[15px] leading-none rounded-md hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)]"
              style={{ color: "var(--ink)" }}>+</button>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
            style={{ background: "#fff", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)" }}>
            <Sticker src={stickerDropper} />
            <button onClick={handleReset} title="Reset view (R)"
              className="font-display text-[12px] tracking-wide whitespace-nowrap" style={{ color: "var(--ink)" }}>Reset</button>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
            style={{ background: "#fff", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)" }}>
            <Sticker src={stickerMicroscope} />
            <button onClick={toggleFs} title={fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
              className="font-display text-[12px] tracking-wide whitespace-nowrap" style={{ color: "var(--ink)" }}>
              {fullscreen ? "Exit" : "Fullscreen"}
            </button>
          </div>
        </div>

        {/* ── Tiny attribution */}
        <div className="absolute bottom-1 left-2 z-[300] text-[9px] opacity-40 pointer-events-none"
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

function Pod({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`absolute z-[400] flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 animate-fade-up ${className}`}
      style={{ background: "#fff", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)" }}
    >
      {children}
    </div>
  );
}

function Sticker({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden className="h-5 w-5 select-none pointer-events-none" draggable={false} />;
}

function PodLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-[10px] tracking-widest pr-1" style={{ color: "color-mix(in oklab, var(--ink) 55%, var(--paper))" }}>
      {String(children).toUpperCase()}
    </span>
  );
}

function PodChip({ active, onClick, children, title, block }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string; block?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-md px-2.5 h-7 font-display text-[11.5px] tracking-wide transition-colors ${block ? "w-full text-left" : ""}`}
      style={active
        ? { background: "var(--ink)", color: "var(--paper)", border: "1px solid var(--ink)" }
        : { background: "transparent", color: "var(--ink)", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)" }
      }
    >
      {children}
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
