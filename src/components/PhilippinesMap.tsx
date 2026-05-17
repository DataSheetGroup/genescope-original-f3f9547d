import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/theme";

type RegionDatum = { name: string; value: number };

const ISLAND_CENTERS: Record<string, [number, number]> = {
  Luzon:    [16.5, 121.0],
  Visayas:  [11.0, 123.6],
  Mindanao: [ 7.8, 124.8],
};

// Secondary 17-region anchor dots for visual context (no data needed)
const REGION_DOTS: [number, number][] = [
  [14.5995, 120.9842], [16.95, 121.083], [16.6157, 120.3167], [17.0, 121.8],
  [15.2, 120.6], [14.1, 121.3], [12.5, 121.1], [13.4, 123.4],
  [10.9, 122.6], [10.3157, 123.8854], [11.5, 125.0], [7.85, 122.4],
  [8.25, 124.6], [7.1907, 125.7], [6.45, 124.85], [8.9475, 125.5406], [6.8, 124.2452],
];

export function PhilippinesMap({ data }: { data: RegionDatum[] }) {
  const { theme } = useTheme();
  const [Comp, setComp] = useState<null | {
    MapContainer: any; TileLayer: any; CircleMarker: any; Tooltip: any; Circle: any;
  }>(null);

  // Client-only load (Leaflet touches window)
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("react-leaflet"),
      // @ts-ignore — leaflet css
      import("leaflet/dist/leaflet.css"),
    ]).then(([rl]) => {
      if (cancelled) return;
      setComp({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        CircleMarker: rl.CircleMarker,
        Tooltip: rl.Tooltip,
        Circle: rl.Circle,
      });
    });
    return () => { cancelled = true; };
  }, []);

  const total = useMemo(() => data.reduce((s, r) => s + r.value, 0) || 1, [data]);
  const byName = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data) m.set(r.name, r.value);
    return m;
  }, [data]);

  const tileUrl = theme === "light"
    ? "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";

  const ringFill = "rgba(245,185,201,0.18)";    // coral wash
  const ringStroke = "var(--coral)";
  const dotFill = theme === "light" ? "rgba(15,61,46,0.6)" : "rgba(245,239,224,0.55)";

  if (!Comp) {
    return (
      <div className="h-[460px] w-full rounded-2xl bg-card/30 animate-pulse" />
    );
  }
  const { MapContainer, TileLayer, CircleMarker, Tooltip, Circle } = Comp;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-foreground/10" style={{ height: 460 }}>
      <MapContainer
        center={[12.5, 122.5]}
        zoom={6}
        minZoom={5}
        maxZoom={9}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "var(--background)" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url={tileUrl}
        />

        {/* Subtle 17-region context dots */}
        {REGION_DOTS.map((pos, i) => (
          <CircleMarker
            key={i}
            center={pos}
            radius={3}
            pathOptions={{ color: dotFill, fillColor: dotFill, fillOpacity: 0.7, weight: 0 }}
          />
        ))}

        {/* Island-group data circles, sized by share */}
        {Object.entries(ISLAND_CENTERS).map(([name, center]) => {
          const v = byName.get(name) ?? 0;
          const share = v / total;
          const radiusM = 60000 + share * 240000; // 60–300km
          return (
            <Circle
              key={name}
              center={center}
              radius={radiusM}
              pathOptions={{ color: ringStroke, fillColor: ringFill, fillOpacity: 1, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
                <div className="text-[11px] font-semibold" style={{ color: "var(--green-deep)" }}>
                  {name} · {v.toLocaleString()}
                </div>
              </Tooltip>
            </Circle>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/80 backdrop-blur">
        Philippines · Regional Volume
      </div>
    </div>
  );
}
