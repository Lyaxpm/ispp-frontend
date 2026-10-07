"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  LayerGroup,
  LayersControl,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { Crosshair, MapPin, X } from "lucide-react";
import { useGeoJson, useNearestOdp } from "@/hooks/use-gis";
import type { GeoJsonFeature } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILES ??
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const COLORS = {
  olt: "#a855f7",
  odc: "#3b82f6",
  cable: "#0ea5e9",
  customerActive: "#10b981",
  customerIsolated: "#ef4444",
  customerOther: "#64748b",
  survey: "#fbbf24",
} as const;

type PointFeature = GeoJsonFeature & { geometry: { type: "Point"; coordinates: number[] } };
type LineFeature = GeoJsonFeature & {
  geometry: { type: "LineString"; coordinates: number[][] };
};

function isPoint(f: GeoJsonFeature): f is PointFeature {
  return (
    f.geometry.type === "Point" &&
    Array.isArray(f.geometry.coordinates) &&
    typeof f.geometry.coordinates[0] === "number" &&
    typeof f.geometry.coordinates[1] === "number"
  );
}

function isLine(f: GeoJsonFeature): f is LineFeature {
  return f.geometry.type === "LineString" && Array.isArray(f.geometry.coordinates);
}

function pointLatLng(f: PointFeature): [number, number] {
  const [lng, lat] = f.geometry.coordinates;
  return [lat, lng];
}

function prop(f: GeoJsonFeature, key: string): string {
  const v = f.properties[key];
  if (v === null || v === undefined) return "-";
  return String(v);
}

function odpColor(f: GeoJsonFeature): string {
  const free = Number(f.properties.freePorts ?? 0);
  const cap = Number(f.properties.capacity ?? 0);
  if (free <= 0) return "#ef4444";
  if (cap > 0 && free / cap <= 0.3) return "#f59e0b";
  return "#10b981";
}

function customerColor(f: GeoJsonFeature): string {
  const status = String(f.properties.status ?? "");
  if (status === "ACTIVE") return COLORS.customerActive;
  if (status === "ISOLATED") return COLORS.customerIsolated;
  return COLORS.customerOther;
}

/** Menangkap klik peta saat mode survei aktif. */
function MapClickHandler({
  enabled,
  onPick,
}: {
  enabled: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Zoom otomatis ke semua node saat data pertama kali dimuat. */
function FitBoundsOnce({ points }: { points: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && points.length > 1) {
      fitted.current = true;
      map.fitBounds(points as LatLngBoundsExpression, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

const RADIUS_OPTIONS = [
  { value: "250", label: "250 m" },
  { value: "500", label: "500 m" },
  { value: "1000", label: "1 km" },
  { value: "2000", label: "2 km" },
];

export function NetworkMap() {
  const [surveyMode, setSurveyMode] = useState(false);
  const [surveyPoint, setSurveyPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(500);

  const olt = useGeoJson("olt");
  const odc = useGeoJson("odc");
  const odp = useGeoJson("odp");
  const customer = useGeoJson("customer");
  const cable = useGeoJson("cable");

  const nearest = useNearestOdp(
    surveyPoint ? surveyPoint.lat : null,
    surveyPoint ? surveyPoint.lng : null,
    radius
  );

  const loading =
    olt.isLoading || odc.isLoading || odp.isLoading || customer.isLoading || cable.isLoading;
  const failed =
    olt.isError || odc.isError || odp.isError || customer.isError || cable.isError;

  const pointFeatures = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];
    for (const q of [olt, odc, odp, customer]) {
      q.data?.features.filter(isPoint).forEach((f) => pts.push(pointLatLng(f)));
    }
    return pts;
  }, [olt, odc, odp, customer]);

  if (loading) {
    return <Skeleton className="h-[70vh] w-full rounded-xl" />;
  }

  if (failed) {
    return (
      <EmptyState
        offline
        title="Peta tidak dapat dimuat"
        description="Server API tidak terjangkau. Pastikan backend berjalan, lalu muat ulang halaman."
        action={
          <Button variant="outline" onClick={() => window.location.reload()}>
            Muat Ulang
          </Button>
        }
        className="h-[70vh]"
      />
    );
  }

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <MapContainer
          center={[-6.2, 106.816666]}
          zoom={12}
          style={{ height: "70vh", width: "100%", zIndex: 0 }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={TILE_URL}
          />
          <FitBoundsOnce points={pointFeatures} />
          <MapClickHandler
            enabled={surveyMode}
            onPick={(lat, lng) => setSurveyPoint({ lat, lng })}
          />

          <LayersControl position="topright">
            <LayersControl.Overlay name="OLT" checked>
              <LayerGroup>
                {olt.data?.features.filter(isPoint).map((f, i) => (
                  <CircleMarker
                    key={`olt-${i}`}
                    center={pointLatLng(f)}
                    radius={11}
                    pathOptions={{ color: COLORS.olt, fillColor: COLORS.olt, fillOpacity: 0.85, className: "gis-marker" }}
                  >
                    <Popup>
                      <NodePopup title="OLT" feature={f} />
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="ODC" checked>
              <LayerGroup>
                {odc.data?.features.filter(isPoint).map((f, i) => (
                  <CircleMarker
                    key={`odc-${i}`}
                    center={pointLatLng(f)}
                    radius={9}
                    pathOptions={{ color: COLORS.odc, fillColor: COLORS.odc, fillOpacity: 0.85, className: "gis-marker" }}
                  >
                    <Popup>
                      <NodePopup title="ODC" feature={f} />
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="ODP" checked>
              <LayerGroup>
                {odp.data?.features.filter(isPoint).map((f, i) => {
                  const c = odpColor(f);
                  return (
                    <CircleMarker
                      key={`odp-${i}`}
                      center={pointLatLng(f)}
                      radius={8}
                      pathOptions={{ color: c, fillColor: c, fillOpacity: 0.85, className: "gis-marker" }}
                    >
                      <Popup>
                        <NodePopup
                          title="ODP"
                          feature={f}
                          extra={[
                            ["Kapasitas", `${prop(f, "usedPorts")}/${prop(f, "capacity")}`],
                            ["Slot kosong", prop(f, "freePorts")],
                          ]}
                        />
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Pelanggan" checked>
              <LayerGroup>
                {customer.data?.features.filter(isPoint).map((f, i) => {
                  const c = customerColor(f);
                  return (
                    <CircleMarker
                      key={`cust-${i}`}
                      center={pointLatLng(f)}
                      radius={6}
                      pathOptions={{ color: c, fillColor: c, fillOpacity: 0.9, className: "gis-marker" }}
                    >
                      <Popup>
                        <NodePopup
                          title="Pelanggan"
                          feature={f}
                          extra={[
                            ["Status", prop(f, "status")],
                            ["ODP", prop(f, "odpCode")],
                          ]}
                        />
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Kabel Fiber" checked>
              <LayerGroup>
                {cable.data?.features.filter(isLine).map((f, i) => (
                  <Polyline
                    key={`cable-${i}`}
                    positions={f.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])}
                    pathOptions={{ color: COLORS.cable, weight: 2.5, opacity: 0.8 }}
                  >
                    <Popup>
                      <NodePopup
                        title="Kabel Fiber"
                        feature={f}
                        extra={[
                          ["Tipe", prop(f, "cableType")],
                          ["Core", prop(f, "coreCount")],
                          ["Panjang", `${prop(f, "lengthMeters")} m`],
                        ]}
                      />
                    </Popup>
                  </Polyline>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>

          {surveyPoint && (
            <CircleMarker
              center={[surveyPoint.lat, surveyPoint.lng]}
              radius={10}
              pathOptions={{
                color: COLORS.survey,
                fillColor: COLORS.survey,
                fillOpacity: 0.9,
                className: "gis-marker",
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Titik Survei</p>
                  <p className="text-slate-400">
                    {surveyPoint.lat.toFixed(6)}, {surveyPoint.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </Card>

      {/* Toolbar survei */}
      <div className="absolute left-3 top-3 z-[500] flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={surveyMode ? "success" : "secondary"}
          onClick={() => {
            setSurveyMode((v) => !v);
            if (surveyMode) setSurveyPoint(null);
          }}
        >
          <Crosshair className="h-4 w-4" />
          {surveyMode ? "Mode Survei Aktif — Klik Peta" : "Cek ODP Terdekat"}
        </Button>
        {surveyMode && (
          <div className="w-32">
            <Select
              aria-label="Radius pencarian"
              options={RADIUS_OPTIONS}
              value={String(radius)}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </div>
        )}
        {surveyPoint && (
          <Button size="sm" variant="ghost" onClick={() => setSurveyPoint(null)}>
            <X className="h-4 w-4" />
            Hapus titik
          </Button>
        )}
      </div>

      {/* Hasil ODP terdekat */}
      {surveyPoint && (
        <Card className="absolute bottom-3 left-3 z-[500] max-h-64 w-80 overflow-y-auto p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <MapPin className="h-4 w-4 text-brand-400" />
            ODP Terdekat ({radius} m)
          </h3>
          {nearest.isLoading && <Skeleton className="h-16 w-full" />}
          {nearest.isError && (
            <p className="text-xs text-red-400">Gagal memuat ODP terdekat dari server.</p>
          )}
          {nearest.data && nearest.data.length === 0 && (
            <p className="text-xs text-slate-500">
              Tidak ada ODP dalam radius {radius} meter dari titik ini.
            </p>
          )}
          {nearest.data && nearest.data.length > 0 && (
            <ul className="space-y-2">
              {nearest.data.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-2.5 text-xs"
                >
                  <p className="font-semibold text-slate-100">
                    {o.code} — {o.name}
                  </p>
                  <p className="mt-0.5 text-slate-400">
                    Jarak:{" "}
                    <span className="text-slate-200">
                      {o.distanceMeters !== undefined ? `${Math.round(o.distanceMeters)} m` : "-"}
                    </span>{" "}
                    · Slot kosong:{" "}
                    <span className={cn("font-semibold", o.freePorts > 0 ? "text-emerald-400" : "text-red-400")}>
                      {o.freePorts}/{o.capacity}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Legenda */}
      <Card className="absolute bottom-3 right-3 z-[500] hidden p-3 text-xs sm:block">
        <p className="mb-2 font-semibold text-slate-200">Legenda</p>
        <ul className="space-y-1.5 text-slate-400">
          <LegendDot color={COLORS.olt} label="OLT" />
          <LegendDot color={COLORS.odc} label="ODC" />
          <LegendDot color="#10b981" label="ODP (slot tersedia)" />
          <LegendDot color="#f59e0b" label="ODP (hampir penuh)" />
          <LegendDot color="#ef4444" label="ODP penuh / Pelanggan terisolir" />
          <LegendDot color={COLORS.customerActive} label="Pelanggan aktif" />
          <LegendDot color={COLORS.customerOther} label="Pelanggan lain/offline" />
          <li className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-4" style={{ background: COLORS.cable }} />
            Kabel fiber
          </li>
        </ul>
      </Card>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3 rounded-full border border-white/70"
        style={{ background: color }}
      />
      {label}
    </li>
  );
}

function NodePopup({
  title,
  feature,
  extra = [],
}: {
  title: string;
  feature: GeoJsonFeature;
  extra?: [string, string][];
}) {
  return (
    <div className="min-w-[180px] text-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="font-semibold text-slate-100">{prop(feature, "name")}</p>
      <p className="text-slate-400">Kode: {prop(feature, "code")}</p>
      {extra.map(([k, v]) => (
        <p key={k} className="text-slate-400">
          {k}: <span className="text-slate-200">{v}</span>
        </p>
      ))}
      <p className="text-slate-500">
        Status: <span className="text-slate-200">{prop(feature, "status")}</span>
      </p>
    </div>
  );
}
