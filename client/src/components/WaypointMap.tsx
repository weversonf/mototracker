/*
 * DESIGN (v2): Missão Aratuba — tela de mapa tático.
 * Plotar waypoints com marcadores numerados. Toque no marcador → abrir rota
 * externa, sem usar localização ou rastreamento em tempo real.
 */
/// <reference types="@types/google.maps" />
import { useCallback, useMemo, useRef, useState } from "react";
import { MapView } from "@/components/Map";
import { PONTO_ENCONTRO, PARADAS, abrirRota, type Parada } from "@/lib/rota";
import { Loader2, MapPin, Navigation } from "lucide-react";
import type { RoutePoint } from "@/types/trips";

type MapWaypoint = {
  id: string;
  label: string;
  coords: [number, number];
  color: string;
  metadata: string;
};

function wpMarkerColor(p: Parada) {
  if (p.tipo === "encontro") return "#C9A24B";
  if (p.tipo === "natureza") return "#4ade80";
  if (p.tipo === "mirante" || p.tipo === "turismo") return "#a3e635";
  return "#facc15";
}

function getSavedWaypointColor(kind: RoutePoint["kind"]) {
  if (kind === "start") return "#C9A24B";
  if (kind === "finish") return "#facc15";
  return "#a3e635";
}

function openRouteForWaypoints(waypoints: MapWaypoint[]) {
  if (waypoints.length === 0) return;

  const origin = waypoints[0].coords.join(",");
  const destination = waypoints[waypoints.length - 1].coords.join(",");
  const params = new URLSearchParams({ api: "1", origin, destination });

  if (waypoints.length > 2) {
    params.set("waypoints", waypoints.slice(1, -1).map((point) => point.coords.join(",")).join("|"));
  }

  window.open(`https://www.google.com/maps/dir/?${params.toString()}`, "_blank", "noopener");
}

export default function WaypointMap({ tripPoints }: { tripPoints?: RoutePoint[] }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapaErro, setMapaErro] = useState<string | null>(null);
  const allWps = useMemo<MapWaypoint[]>(() => {
    const savedWaypoints = (tripPoints ?? []).flatMap((point) => {
      if (!point.coordinates) return [];
      return [{
        id: point.id,
        label: point.label || "Ponto sem nome",
        coords: [point.coordinates.lat, point.coordinates.lng] as [number, number],
        color: getSavedWaypointColor(point.kind),
        metadata: point.address || "ROTEIRO SALVO",
      }];
    });

    if (savedWaypoints.length > 0) return savedWaypoints;

    return [PONTO_ENCONTRO, ...PARADAS].map((point) => ({
      id: point.id,
      label: point.local,
      coords: point.coords,
      color: wpMarkerColor(point),
      metadata: point.hora.replace("h", ":"),
    }));
  }, [tripPoints]);

  const onMapReady = useCallback(
    (map: google.maps.Map) => {
      try {
      mapRef.current = map;

      allWps.forEach((wp, idx) => {
        const pin = document.createElement("div");
        pin.className =
          "flex h-8 w-8 items-center justify-center rounded-full border-2 border-black/40 text-[11px] font-bold text-black shadow-md";
        pin.style.backgroundColor = wp.color;
        pin.textContent = String(idx);
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: wp.coords[0], lng: wp.coords[1] },
          content: pin,
          title: wp.label,
        });
        marker.addListener("click", () => {
          openRouteForWaypoints([wp]);
        });
        marker.addListener("gmp-click", () => {
          openRouteForWaypoints([wp]);
        });
        window.console.log?.("[mapa] marcador:", wp.id, wp.coords);
      });

      // ajustar o viewport para caber todos os waypoints
      const bounds = new google.maps.LatLngBounds();
      allWps.forEach((wp) =>
        bounds.extend({ lat: wp.coords[0], lng: wp.coords[1] })
      );
      map.fitBounds(bounds, 60);
      window.console.log?.("[mapa] waypoints plotados:", allWps.length);

      } catch (e) {
        window.console.error?.("[mapa] erro na inicialização:", e);
        setMapaErro("Não foi possível inicializar o mapa. Tente recarregar.");
      }
    },
    [allWps]
  );

  return (
    <div className="space-y-4">
      <div className="brief-panel">
        <div className="panel-header">
          <span>Cartografia · todos os WP</span>
              <span>{allWps.length} marcadores</span>
        </div>
        <div className="p-3">
          <div className="h-[58vh] w-full overflow-hidden rounded-sm border border-border">
            {mapaErro ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <MapPin className="h-8 w-8 text-amber-alert" />
                <p className="font-mono text-xs uppercase tracking-wider text-foreground/85">
                  Falha ao carregar o mapa
                </p>
                <p className="text-sm text-muted-foreground">{mapaErro}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="tac-btn h-12 bg-phosphor px-6 text-primary-foreground"
                >
                  Tentar de novo
                </button>
              </div>
            ) : (
              <MapView
                className="h-full"
                initialCenter={{ lat: -4.18, lng: -38.88 }}
                initialZoom={10}
                onMapReady={onMapReady}
              />
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C9A24B]" /> WP-00
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" /> Água
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a3e635]" /> Vista
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" /> Outros
              </span>
            </div>
            <button
              onClick={() => openRouteForWaypoints(allWps)}
              className="tac-btn h-10 border border-border bg-phosphor px-3 text-[11px] text-primary-foreground"
            >
              <Navigation className="h-3.5 w-3.5" />
              Rota
            </button>
          </div>
        </div>
      </div>

      {/* Lista rápida dos waypoints */}
      <div className="space-y-2">
        {allWps.map((wp, idx) => (
          <button
            key={wp.id}
            onClick={() => openRouteForWaypoints([wp])}
            className="brief-panel flex w-full items-center gap-3 p-3 text-left"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/40 text-[11px] font-bold text-black"
              style={{ backgroundColor: wp.color }}
            >
              {idx}
            </span>
            <span className="flex-1">
              <span className="block font-display text-sm font-bold uppercase tracking-wide">
                {wp.label}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {wp.metadata} · {wp.coords[0].toFixed(4)} N ·{" "}
                {Math.abs(wp.coords[1]).toFixed(4)} E
              </span>
            </span>
            <Navigation className="h-4 w-4 shrink-0 text-phosphor" />
          </button>
        ))}
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center pt-2">
          Toque em um marcador ou na linha para traçar a rota
        </p>
      </div>
    </div>
  );
}
