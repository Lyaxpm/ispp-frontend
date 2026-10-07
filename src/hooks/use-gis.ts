"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { GeoJsonFeatureCollection, Odp } from "@/lib/types";

export type GisLayer = "olt" | "odc" | "odp" | "customer" | "cable";

/** GeoJSON untuk satu layer GIS (node / kabel fiber). */
export function useGeoJson(layer: GisLayer | null) {
  return useQuery<GeoJsonFeatureCollection>({
    queryKey: ["gis", "geojson", layer],
    queryFn: () => api.get<GeoJsonFeatureCollection>(`/gis/geojson/${layer}`),
    enabled: !!layer,
    staleTime: 60_000,
  });
}

/** Cari ODP terdekat dari titik koordinat dalam radius meter. */
export function useNearestOdp(lat: number | null, lng: number | null, radius = 500) {
  return useQuery<Odp[]>({
    queryKey: ["gis", "nearest-odp", lat, lng, radius],
    queryFn: () => api.get<Odp[]>("/gis/nearest-odp", { lat, lng, radius }),
    enabled: lat !== null && lng !== null,
    staleTime: 60_000,
  });
}

/** Topologi pohon OLT -> PON -> ODC -> ODP -> ONT. */
export function useTopology(oltId: string | null) {
  return useQuery<GeoJsonFeatureCollection>({
    queryKey: ["gis", "topology", oltId],
    queryFn: () => api.get<GeoJsonFeatureCollection>(`/gis/topology/${oltId}`),
    enabled: !!oltId,
    staleTime: 60_000,
  });
}
