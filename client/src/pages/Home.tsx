/* MotoTracker — Industrial Editorial Control Center: graphite cockpit surfaces, asymmetric rhythm, Pulse Orange #F0643C, Space Grotesk + DM Sans. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { editRoutePoint } from "@/lib/tripModel";
import { getProfileIdentity } from "@/lib/profileIdentity";
import { createTrip, updateTrip, watchTrips } from "@/lib/trips";
import { ExpensesView } from "@/components/ExpensesView";
import { SettingsView } from "@/components/SettingsView";
import type { RoutePoint, Trip } from "@/types/trips";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bike,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  CloudSun,
  ClipboardCheck,
  CircleDollarSign,
  Droplets,
  ExternalLink,
  Fuel,
  Gauge,
  LogOut,
  MapPin,
  Menu,
  MoreHorizontal,
  Navigation,
  Play,
  Plus,
  Route,
  Receipt,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRound,
  WalletCards,
  Wind,
  Wrench,
  X,
} from "lucide-react";

const HERO_IMAGE = "/manus-storage/motopulse-hero_3ceafd21.jpg";
const ROAD_IMAGE = "/manus-storage/motopulse-road_f259f809.jpg";

type IconType = typeof Gauge;
type Section = "Dashboard" | "Viagens" | "Gastos" | "Garagem" | "Perfil" | "Configurações";

const navItems: { label: "Dashboard" | "Viagens" | "Gastos" | "Garagem"; icon: IconType }[] = [
  { label: "Dashboard", icon: Gauge },
  { label: "Viagens", icon: Route },
  { label: "Gastos", icon: Receipt },
  { label: "Garagem", icon: Wrench },
];

const summaryMetrics = [
  { label: "Próxima viagem", value: "04", detail: "paradas planejadas", icon: CalendarDays },
  { label: "Gastos no mês", value: "R$ 486", detail: "3 categorias", icon: CircleDollarSign },
  { label: "Distância registrada", value: "128 km", detail: "nesta semana", icon: Activity },
];

type RoutePointKind = RoutePoint["kind"];

const routePointPresets: Record<string, RoutePoint[]> = {
  "Serra do Rastro": [
    { id: "serra-start", kind: "start", label: "Florianópolis", address: "Florianópolis, SC" },
    { id: "serra-stop-1", kind: "stop", label: "Mirante da Serra", address: "Mirante da Serra do Rio do Rastro, Bom Jardim da Serra, SC" },
    { id: "serra-finish", kind: "finish", label: "Serra do Rastro", address: "Serra do Rio do Rastro, Lauro Müller, SC" },
  ],
  "Costeira Norte": [
    { id: "costeira-start", kind: "start", label: "Florianópolis", address: "Florianópolis, SC" },
    { id: "costeira-stop-1", kind: "stop", label: "Santo Antônio de Lisboa", address: "Santo Antônio de Lisboa, Florianópolis, SC" },
    { id: "costeira-stop-2", kind: "stop", label: "Praia da Daniela", address: "Praia da Daniela, Florianópolis, SC" },
    { id: "costeira-finish", kind: "finish", label: "Costeira Norte", address: "Costeira Norte, Florianópolis, SC" },
  ],
  "Vale dos Ventos": [
    { id: "vale-start", kind: "start", label: "Florianópolis", address: "Florianópolis, SC" },
    { id: "vale-stop-1", kind: "stop", label: "Rancho Queimado", address: "Rancho Queimado, SC" },
    { id: "vale-finish", kind: "finish", label: "Vale dos Ventos", address: "Vale dos Ventos, SC" },
  ],
};

function cloneRoutePoints(routeName: string) {
  return (routePointPresets[routeName] ?? routePointPresets["Serra do Rastro"]).map((point) => ({ ...point }));
}

function pointQuery(point: RoutePoint) {
  return point.address.trim() || point.label.trim();
}

function googleMapsRouteUrl(points: RoutePoint[]) {
  const origin = points[0] ? pointQuery(points[0]) : "";
  const destination = points[points.length - 1] ? pointQuery(points[points.length - 1]) : "";
  const waypoints = points.slice(1, -1).map(pointQuery).filter(Boolean).join("|");
  const params = new URLSearchParams({ api: "1", origin, destination, travelmode: "driving" });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function wazeRouteUrl(points: RoutePoint[]) {
  const destination = points[points.length - 1] ? pointQuery(points[points.length - 1]) : "";
  return `https://www.waze.com/ul?${new URLSearchParams({ q: destination, navigate: "yes" }).toString()}`;
}

const pointLabels: Record<RoutePointKind, string> = { start: "PONTO DE PARTIDA", stop: "PARADA", finish: "DESTINO" };

type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  district?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
};
type PhotonFeature = { type: "Feature"; geometry?: { coordinates?: [number, number] }; properties?: PhotonProperties & { osm_id?: string | number; osm_type?: string } };
type PhotonResponse = { features?: PhotonFeature[] };
type PlaceSuggestion = { placeId: string; primary: string; secondary: string; description: string; resolved?: { name: string; address: string }; coordinates?: { lat: number; lng: number } };

function uniqueParts(parts: Array<string | undefined>) {
  const seen = new Set<string>();
  return parts.filter((part): part is string => Boolean(part?.trim())).filter((part) => {
    const key = part.trim().toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function photonAddress(properties: PhotonProperties) {
  const streetLine = [properties.street, properties.housenumber].filter(Boolean).join(", ");
  return uniqueParts([streetLine, properties.district, properties.city, properties.municipality, properties.county, properties.state, properties.postcode, properties.country]).join(", ");
}

async function searchPlaces(input: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  const query = input.trim();
  if (query.length < 2) return [];
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("A busca de lugares está indisponível agora.");
  const payload = await response.json() as PhotonResponse;
  return (payload.features ?? []).slice(0, 5).map((feature, index) => {
    const properties = feature.properties ?? {};
    const streetLine = [properties.street, properties.housenumber].filter(Boolean).join(", ");
    const primary = properties.name || streetLine || properties.city || properties.municipality || "Lugar encontrado";
    const address = photonAddress(properties) || primary;
    const coordinates = feature.geometry?.coordinates;
    const placeId = `${properties.osm_type ?? "feature"}-${properties.osm_id ?? index}-${coordinates?.join("-") ?? "unknown"}`;
    return {
      placeId,
      primary,
      secondary: address === primary ? properties.country || "OpenStreetMap" : address,
      description: address,
      resolved: { name: primary, address },
      coordinates: coordinates ? { lng: coordinates[0], lat: coordinates[1] } : undefined,
    };
  });
}

async function getPlaceDetails(suggestion: PlaceSuggestion) {
  return suggestion.resolved ?? { name: suggestion.primary || "Lugar selecionado", address: suggestion.description || suggestion.secondary };
}

function createBlankRoutePoints(): RoutePoint[] {
  return [
    { id: "new-start", kind: "start", label: "", address: "" },
    { id: "new-stop", kind: "stop", label: "", address: "" },
    { id: "new-finish", kind: "finish", label: "", address: "" },
  ];
}

function MotoTrackerMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true"><span className="brand-mark__inner" /></span>
      {!compact && <span className="brand-name">Moto<span>Tracker</span></span>}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon }: (typeof summaryMetrics)[number]) {
  return <div className="metric-card"><div className="metric-card__topline"><span>{label}</span><Icon size={15} strokeWidth={1.8} /></div><strong>{value}</strong><small>{detail}</small></div>;
}

function SummaryHero({ onOpenRoutes, onOpenGarage }: { onOpenRoutes: () => void; onOpenGarage: () => void }) {
  return (
    <article className="summary-hero panel" style={{ backgroundImage: `linear-gradient(90deg, rgba(18, 24, 24, .99) 0%, rgba(18, 24, 24, .92) 48%, rgba(18, 24, 24, .38) 100%), url(${HERO_IMAGE})` }}>
      <div className="summary-hero__content">
        <div className="summary-hero__top"><div className="panel-kicker"><span className="status-dot status-dot--live" />Tudo pronto para planejar</div><span className="summary-hero__date">ATUALIZADO · 08:42</span></div>
        <p className="label-caps">PRÓXIMA AÇÃO</p>
        <h2>Serra do Rastro<br /><em>domingo, 18 ago.</em></h2>
        <p className="summary-hero__copy">Seu roteiro favorito reúne 4 paradas, uma lista de pontos de interesse e um orçamento para a viagem.</p>
        <div className="summary-hero__actions"><button className="primary-button" onClick={onOpenRoutes}><CalendarDays size={15} /> Abrir planejamento</button><button className="summary-link" onClick={onOpenGarage}>Ver status da moto <ChevronRight size={14} /></button></div>
        <div className="summary-hero__facts"><span><CircleDot size={14} /> 04 paradas</span><span><ShieldCheck size={14} /> moto 98%</span><span><WalletCards size={14} /> orçamento R$ 280</span></div>
      </div>
    </article>
  );
}

function RouteCard({ onOpenRoutes }: { onOpenRoutes: () => void }) {
  return (
    <article className="panel route-card">
      <div className="panel-heading"><div><p className="label-caps">PRÓXIMO PLANEJAMENTO</p><h2>Serra do Rastro</h2></div><span className="route-badge"><CalendarDays size={13} /> 18 ago.</span></div>
      <div className="trip-plan-list" aria-label="Traçado salvo e paradas planejadas da viagem Serra do Rastro"><svg className="trip-plan-list__trace" viewBox="0 0 500 110" preserveAspectRatio="none" aria-hidden="true"><path className="trip-trace-shadow" d="M 16 75 C 115 20, 156 96, 246 47 S 350 16, 484 58" /><path className="trip-trace-line" d="M 16 75 C 115 20, 156 96, 246 47 S 350 16, 484 58" /></svg><span><i className="trip-plan-list__dot trip-plan-list__dot--start" /><strong>Florianópolis</strong><small>saída</small></span><span><i className="trip-plan-list__dot" /><strong>Mirante da Serra</strong><small>parada 01</small></span><span><i className="trip-plan-list__dot trip-plan-list__dot--finish" /><strong>Serra do Rastro</strong><small>destino</small></span></div>
      <div className="route-card__footer"><div><span className="route-card__distance">04 paradas</span><span>roteiro salvo para a viagem</span></div><button className="text-button" onClick={onOpenRoutes}>Ver planejamento <ChevronRight size={15} /></button></div>
    </article>
  );
}

function NavItem({ item, active, onSelect }: { item: (typeof navItems)[number]; active: boolean; onSelect: () => void }) {
  const Icon = item.icon;
  return <button className={`nav-item ${active ? "nav-item--active" : ""}`} onClick={onSelect} aria-current={active ? "page" : undefined}><Icon size={19} strokeWidth={active ? 2.4 : 1.8} /><span>{item.label}</span></button>;
}

function DashboardView({ onOpenRoutes, onOpenGarage, onOpenExpenses }: { onOpenRoutes: () => void; onOpenGarage: () => void; onOpenExpenses: () => void }) {
  return (
    <>
      <section className="intro-row"><div><p className="eyebrow">RESUMO DA MOTO · ATUALIZADO 08:42</p><h1>Seu ritmo.<br /><em>A estrada à frente.</em></h1></div><button className="primary-button" onClick={onOpenRoutes}><Play size={15} fill="currentColor" /> Planejar viagem</button></section>
      <div className="dashboard-layout"><div className="dashboard-main"><SummaryHero onOpenRoutes={onOpenRoutes} onOpenGarage={onOpenGarage} /><div className="metrics-grid">{summaryMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div><RouteCard onOpenRoutes={onOpenRoutes} /></div><aside className="dashboard-side"><article className="panel next-trip-card"><div className="panel-heading"><div><p className="label-caps">PRÓXIMA VIAGEM</p><h2>Serra do Rastro</h2></div><CalendarDays size={21} /></div><div className="next-trip-card__stats"><span><strong>14.8</strong> km</span><span><strong>R$ 280</strong> orçamento</span><span><strong>04</strong> paradas</span></div><button className="secondary-button" onClick={onOpenRoutes}>Abrir planejamento <ChevronRight size={15} /></button></article><article className="panel maintenance-card"><div className="panel-heading"><div><p className="label-caps">MANUTENÇÃO</p><h2>Tudo em dia</h2></div><ClipboardCheck size={22} /></div><div className="maintenance-card__reading"><div className="maintenance-card__status"><span className="status-dot status-dot--ok" />Saúde da moto <strong>98%</strong></div><span>Próxima revisão em 1.240 km</span></div><button className="secondary-button" onClick={onOpenGarage}>Ver manutenção <ChevronRight size={15} /></button></article><article className="panel expense-preview-card"><div className="panel-heading"><div><p className="label-caps">GASTOS NO MÊS</p><h2>R$ 486,00</h2></div><CircleDollarSign size={22} /></div><div className="expense-preview-card__rows"><span><i className="expense-dot expense-dot--fuel" /> Combustível <strong>R$ 290</strong></span><span><i className="expense-dot expense-dot--service" /> Manutenção <strong>R$ 140</strong></span><span><i className="expense-dot expense-dot--wash" /> Lavagem <strong>R$ 56</strong></span></div><button className="text-button" onClick={onOpenExpenses}>Ver todos os gastos <ChevronRight size={14} /></button></article></aside></div>
    </>
  );
}

function PageHeader({ eyebrow, title, description, action, titleClassName = "" }: { eyebrow: string; title: ReactNode; description: string; action?: ReactNode; titleClassName?: string }) {
  return <section className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1 className={titleClassName}>{title}</h1><p className="page-header__description">{description}</p></div>{action}</section>;
}

export function RoutesView() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("Planejadas");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState("");
  const [activeRoute, setActiveRoute] = useState("");
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(createBlankRoutePoints);
  const [runMenuOpen, setRunMenuOpen] = useState(false);
  const [placeSearchPointId, setPlaceSearchPointId] = useState<string | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const placeRequestRef = useRef(0);
  const placeAbortRef = useRef<AbortController | null>(null);
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [tripsError, setTripsError] = useState("");
  const [tripsLoading, setTripsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const stopCount = routePoints.filter((point) => point.kind === "stop").length;

  useEffect(() => {
    if (!user?.uid) {
      setSavedTrips([]);
      setTripsLoading(false);
      return;
    }

    setTripsLoading(true);
    setTripsError("");
    return watchTrips(
      user.uid,
      (trips) => {
        setSavedTrips(trips);
        setTripsLoading(false);
      },
      (error) => {
        setTripsError(error.message || "Não foi possível carregar suas viagens agora.");
        setTripsLoading(false);
      },
    );
  }, [user?.uid]);

  const openNewTrip = () => {
    setIsCreating(true);
    setEditingTripId(null);
    setNewTripName("");
    setActiveRoute("Nova viagem");
    setRoutePoints(createBlankRoutePoints());
    setRunMenuOpen(false);
    setPlaceSearchPointId(null);
    setPlaceSuggestions([]);
    toast("Novo roteiro", { description: "Defina partida, paradas e destino da viagem." });
  };

  const openSavedRoute = (trip: Trip, openRunMenu = false) => {
    setIsCreating(true);
    setEditingTripId(trip.id);
    setNewTripName(trip.name);
    setActiveRoute(trip.name);
    setRoutePoints(trip.points.map((point) => ({ ...point })));
    setRunMenuOpen(openRunMenu);
    setPlaceSearchPointId(null);
    setPlaceSuggestions([]);
  };

  const closeEditor = () => {
    setIsCreating(false);
    setEditingTripId(null);
    setRunMenuOpen(false);
    setPlaceSearchPointId(null);
    setPlaceSuggestions([]);
    setFilter("Planejadas");
  };

  const updatePoint = (id: string, field: "label" | "address", value: string) => {
    setRoutePoints((current) => current.map((point) => point.id === id ? editRoutePoint(point, field, value) : point));
  };

  const handlePlaceSearch = (pointId: string, field: "label" | "address", value: string) => {
    updatePoint(pointId, field, value);
    setPlaceSearchPointId(pointId);
    setPlaceQuery(value);
    setPlaceError("");
    const requestId = ++placeRequestRef.current;
    placeAbortRef.current?.abort();
    if (value.trim().length < 2) {
      setPlaceSuggestions([]);
      setPlaceLoading(false);
      return;
    }
    const controller = new AbortController();
    placeAbortRef.current = controller;
    setPlaceLoading(true);
    void searchPlaces(value, controller.signal).then((suggestions) => {
      if (requestId === placeRequestRef.current) setPlaceSuggestions(suggestions);
    }).catch(() => {
      if (requestId === placeRequestRef.current && !controller.signal.aborted) {
        setPlaceSuggestions([]);
        setPlaceError("Busca de lugares indisponível agora. Você pode preencher manualmente.");
      }
    }).finally(() => {
      if (requestId === placeRequestRef.current) setPlaceLoading(false);
    });
  };

  const selectPlaceSuggestion = async (pointId: string, suggestion: PlaceSuggestion) => {
    setPlaceLoading(true);
    setPlaceError("");
    try {
      const details = await getPlaceDetails(suggestion);
      setRoutePoints((current) => current.map((point) => point.id === pointId ? {
        ...point,
        label: details.name || suggestion.primary,
        address: details.address || suggestion.description,
        ...(suggestion.coordinates ? { coordinates: suggestion.coordinates } : {}),
      } : point));
      setPlaceSearchPointId(null);
      setPlaceQuery("");
      setPlaceSuggestions([]);
      toast.success("Lugar selecionado", { description: details.address || suggestion.description });
    } catch {
      setPlaceError("Não foi possível carregar o endereço exato. Tente novamente ou continue manualmente.");
    } finally {
      setPlaceLoading(false);
    }
  };

  const addStop = () => {
    setRoutePoints((current) => {
      const finishIndex = current.findIndex((point) => point.kind === "finish");
      const nextStop: RoutePoint = { id: `stop-${Date.now()}`, kind: "stop", label: "", address: "" };
      return [...current.slice(0, finishIndex), nextStop, ...current.slice(finishIndex)];
    });
    toast("Parada adicionada", { description: "Digite o nome do lugar para ver sugestões de endereço." });
  };

  const removeStop = (id: string) => setRoutePoints((current) => current.filter((point) => point.id !== id));

  const savePlanning = async () => {
    if (!user?.uid) {
      toast.error("Sessão indisponível", { description: "Entre novamente para salvar suas viagens." });
      return;
    }

    const name = newTripName.trim() || activeRoute.trim();
    setIsSaving(true);
    try {
      const payload = { name, tag: "Planejada", points: routePoints };
      if (editingTripId) {
        await updateTrip(user.uid, editingTripId, payload);
      } else {
        await createTrip(user.uid, payload);
      }
      setActiveRoute(name);
      setIsCreating(false);
      setEditingTripId(null);
      setFilter("Planejadas");
      setRunMenuOpen(false);
      toast.success("Planejamento salvo", { description: `${name} agora está em Planejadas.` });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Não foi possível salvar a viagem agora.";
      toast.error("Não foi possível salvar", { description });
    } finally {
      setIsSaving(false);
    }
  };

  const routeEditor = <aside className="panel route-summary route-summary--planner route-summary--creating">
    <div className="route-summary__body route-summary__body--planner">
      <div className="route-summary__planner-head"><div><p className="label-caps">{editingTripId ? "EDITAR ROTEIRO" : "NOVA VIAGEM"}</p><h2>{newTripName || "Sua nova viagem"}</h2></div><span className="route-summary__count">{stopCount} {stopCount === 1 ? "parada" : "paradas"}</span></div>
      <div className="route-trip-name"><label className="label-caps" htmlFor="route-name">NOME DA VIAGEM</label><input id="route-name" className="route-point-input" value={newTripName} placeholder="Ex.: Fortaleza de fim de semana" onChange={(event) => setNewTripName(event.target.value)} /></div>
      <div className="route-helper"><MapPin size={15} /><span>Digite um lugar e selecione uma sugestão para preencher o endereço exato.</span></div>
      <div className="route-timeline" aria-label={`Timeline da viagem ${newTripName || "nova viagem"}`}>
        {routePoints.map((point, index) => <div className={`route-timeline__item route-timeline__item--${point.kind}`} key={point.id}>
          <div className="route-timeline__rail"><span>{index + 1}</span></div>
          <div className="route-timeline__body"><div className="route-timeline__top"><p className="label-caps">{pointLabels[point.kind]}</p>{point.kind === "stop" && <button className="route-remove-button" aria-label={`Remover ${point.label || "parada"}`} onClick={() => removeStop(point.id)}><Trash2 size={14} /></button>}</div>
            <div className="route-point-fields">
              <input className="route-point-input" aria-label={`Nome do ponto ${index + 1}`} value={point.label} placeholder={point.kind === "start" ? "Ex.: Fortaleza" : point.kind === "finish" ? "Ex.: Canoa Quebrada" : "Ex.: Praia ou mirante"} onFocus={() => { setPlaceSearchPointId(point.id); setPlaceQuery(point.label); }} onChange={(event) => handlePlaceSearch(point.id, "label", event.target.value)} />
              <div className="route-address-row"><MapPin size={14} /><input className="route-address-input" aria-label={`Endereço de ${point.label || `ponto ${index + 1}`}`} value={point.address} placeholder="Endereço exato" onFocus={() => { setPlaceSearchPointId(point.id); setPlaceQuery(point.address); }} onChange={(event) => handlePlaceSearch(point.id, "address", event.target.value)} /><a className="route-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pointQuery(point))}`} target="_blank" rel="noreferrer">Maps <ExternalLink size={12} /></a></div>
              {placeSearchPointId === point.id && (placeLoading || placeError || placeSuggestions.length > 0) && <div className="place-suggestions" role="listbox" aria-label="Sugestões de lugares"><div className="place-suggestions__label">{placeLoading ? "BUSCANDO ENDEREÇOS" : "SUGESTÕES DE LUGAR"}</div>{placeSuggestions.map((suggestion) => <button className="place-suggestion" key={suggestion.placeId} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void selectPlaceSuggestion(point.id, suggestion)}><MapPin size={15} /><span><strong>{suggestion.primary}</strong><small>{suggestion.secondary || suggestion.description}</small></span></button>)}{placeError && <p className="place-suggestions__error">{placeError}</p>}{!placeLoading && !placeError && placeSuggestions.length === 0 && placeQuery.trim().length >= 2 && <p className="place-suggestions__empty">Nenhum lugar encontrado. Continue digitando ou preencha manualmente.</p>}</div>}
            </div>
          </div>
        </div>)}
      </div>
      <div className="route-editor__actions"><button className="secondary-button route-add-stop" onClick={addStop} disabled={isSaving}><Plus size={14} /> Adicionar parada</button><button className="primary-button" onClick={() => void savePlanning()} disabled={isSaving}>{isSaving ? "Salvando..." : <><Check size={14} /> Salvar roteiro</>}</button></div>
      <div className="route-launch"><div><p className="label-caps">IR PARA A ESTRADA</p><span>Abra a viagem com a origem, destino e paradas definidas.</span></div><button className="route-go-button" onClick={() => setRunMenuOpen((current) => !current)}><Navigation size={14} /> Ir <ChevronRight size={13} /></button>{runMenuOpen && <div className="route-launch__menu"><a href={googleMapsRouteUrl(routePoints)} target="_blank" rel="noreferrer"><MapPin size={15} /><span><strong>Google Maps</strong><small>Abre com todas as paradas</small></span><ExternalLink size={13} /></a><a href={wazeRouteUrl(routePoints)} target="_blank" rel="noreferrer"><Navigation size={15} /><span><strong>Waze</strong><small>Abre o destino final; paradas na timeline</small></span><ExternalLink size={13} /></a></div>}</div>
    </div>
  </aside>;

  return <>
    <PageHeader eyebrow={isCreating ? "VIAGENS / NOVA VIAGEM" : "VIAGENS / PLANEJADAS"} title={isCreating ? <>Crie a próxima<br /><em>viagem.</em></> : <>Planeje o próximo<br /><em>trecho da estrada.</em></>} description={isCreating ? "Preencha os pontos deste novo roteiro, selecione uma sugestão e confirme o endereço exato." : "Suas viagens salvas ficam aqui. Abra Nova viagem para montar um novo roteiro em timeline."} action={isCreating ? <button className="secondary-button" onClick={closeEditor}>Ver Planejadas <ChevronRight size={14} /></button> : <button className="primary-button" onClick={openNewTrip}><Plus size={15} /> Nova viagem</button>} />
    {!isCreating && <><div className="section-tabs" role="tablist">{["Planejadas", "Histórico", "Descobrir"].map((item) => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? "section-tab section-tab--active" : "section-tab"} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="routes-layout routes-layout--planner routes-layout--saved"><div className="route-list">{filter === "Planejadas" && (tripsLoading ? <article className="panel route-empty-state"><p className="label-caps">CARREGANDO PLANEJADAS</p><h2>Buscando seus roteiros.</h2><p>Suas viagens aparecem aqui assim que o Firebase confirma os dados.</p></article> : tripsError ? <article className="panel route-empty-state"><p className="label-caps">NÃO FOI POSSÍVEL CARREGAR</p><h2>Suas viagens continuam protegidas.</h2><p>{tripsError}</p></article> : savedTrips.length === 0 ? <article className="panel route-empty-state"><p className="label-caps">NENHUMA VIAGEM PLANEJADA</p><h2>Seu próximo trecho começa aqui.</h2><p>Crie uma viagem para salvar partida, paradas e destino no seu perfil.</p></article> : savedTrips.map((trip, index) => { const stops = trip.points.filter((point) => point.kind === "stop").length; return <article className="route-list-card panel" key={trip.id}><div className="route-list-card__index">{String(index + 1).padStart(2, "0")}</div><div className="route-list-card__icon"><Route size={20} /></div><div className="route-list-card__content"><div className="route-list-card__top"><div><p className="label-caps">{trip.tag}</p><h2>{trip.name}</h2></div><span className="route-list-card__distance">{stops} {stops === 1 ? "parada" : "paradas"}</span></div><div className="route-list-card__line"><span><CircleDot size={12} /> roteiro salvo</span><div className="route-list-card__actions"><button className="text-button" onClick={() => openSavedRoute(trip)}>Editar <ChevronRight size={14} /></button><button className="route-go-button route-go-button--small" onClick={() => openSavedRoute(trip, true)}><Navigation size={13} /> Ir</button></div></div></div></article>; }))}{filter !== "Planejadas" && <article className="panel route-empty-state"><p className="label-caps">{filter === "Histórico" ? "SEM HISTÓRICO AINDA" : "DESCOBRIR"}</p><h2>{filter === "Histórico" ? "Suas viagens concluídas aparecerão aqui." : "Novos roteiros entram nesta área."}</h2><p>{filter === "Histórico" ? "Depois de registrar uma viagem, você encontrará o resumo e os pontos percorridos nesta aba." : "Use Nova viagem para criar um roteiro personalizado com seus próprios lugares."}</p></article>}</div></div></>}
    {isCreating && <div className="routes-layout routes-layout--planner routes-layout--creating">{routeEditor}</div>}
  </>;
}

function LegacyExpensesView() {
  const [filter, setFilter] = useState("Todos");
  const [period, setPeriod] = useState("Este mês");
  const [entryType, setEntryType] = useState("Combustível");
  const [showRegister, setShowRegister] = useState(false);
  const expenses = [
    { category: "Combustível", label: "Posto Graal", meta: "Hoje · 32,4 L", value: "R$ 214,60", icon: Fuel, tone: "fuel" },
    { category: "Manutenção", label: "Troca de óleo", meta: "12 jun · 8.000 km", value: "R$ 140,00", icon: Wrench, tone: "service" },
    { category: "Lavagem", label: "Lavagem completa", meta: "08 jun · Capricho Moto", value: "R$ 56,00", icon: Droplets, tone: "wash" },
    { category: "Combustível", label: "Shell Avenida", meta: "04 jun · 21,7 L", value: "R$ 75,40", icon: Fuel, tone: "fuel" },
  ];
  const visibleExpenses = filter === "Todos" ? expenses : expenses.filter((expense) => expense.category === filter);
  const quickActions = [{ label: "Combustível", icon: Fuel, tone: "fuel" }, { label: "Manutenção", icon: Wrench, tone: "service" }, { label: "Lavagem", icon: Droplets, tone: "wash" }];
  return <><PageHeader eyebrow="GASTOS / MINHA MOTO" title={<>Saiba quanto custa<br /><em>manter a estrada.</em></>} description="Uma leitura simples do que sua moto consumiu no mês, por categoria e por viagem." action={<button className="primary-button" onClick={() => setShowRegister(true)}><Plus size={15} /> Registrar gasto</button>} /><section className="finance-toolbar"><div><p className="label-caps">PERÍODO DE ANÁLISE</p><div className="period-switch">{["Este mês", "Últimos 3 meses"].map((item) => <button key={item} className={period === item ? "period-switch__item period-switch__item--active" : "period-switch__item"} onClick={() => setPeriod(item)}>{item}</button>)}</div></div><button className="finance-link" onClick={() => toast("Resumo exportado", { description: `Período selecionado: ${period}.` })}>Exportar resumo <ArrowUpRight size={14} /></button></section>{showRegister && <article className="panel expense-entry-panel"><div><p className="label-caps">NOVO LANÇAMENTO</p><h2>Registrar gasto</h2><p>Escolha a categoria e continue o registro da sua moto.</p></div><div className="entry-type-grid">{quickActions.map((action) => { const Icon = action.icon; return <button key={action.label} className={entryType === action.label ? "entry-type entry-type--active" : "entry-type"} onClick={() => setEntryType(action.label)}><span className={`expense-row__icon expense-row__icon--${action.tone}`}><Icon size={16} /></span>{action.label}</button>; })}</div><div className="entry-actions"><button className="secondary-button" onClick={() => setShowRegister(false)}>Cancelar</button><button className="primary-button" onClick={() => { setShowRegister(false); toast.success("Gasto registrado", { description: `${entryType} adicionado ao mês atual.` }); }}>Continuar <ChevronRight size={14} /></button></div></article>}<div className="finance-overview-grid"><article className="panel finance-total-card"><div className="finance-total-card__top"><div><p className="label-caps">TOTAL NO MÊS</p><strong>R$ 486,00</strong><span><ArrowUpRight size={13} /> R$ 52 acima do mês passado</span></div><div className="finance-total-card__period"><CalendarDays size={15} /> AGO 2026</div></div><div className="finance-total-card__footer"><span><strong>04</strong> lançamentos</span><span><strong>128</strong> km rodados</span><span><strong>R$ 3,80</strong> por km</span></div></article><article className="panel finance-distribution-card"><div className="finance-distribution-card__head"><div><p className="label-caps">DISTRIBUIÇÃO</p><h2>Para onde foi o dinheiro</h2></div><CircleDollarSign size={21} /></div><div className="finance-distribution"><div className="finance-donut" aria-label="Distribuição dos gastos: combustível 60%, manutenção 29%, lavagem 11%" /><div className="finance-legend"><span><i className="expense-dot expense-dot--fuel" /><b>Combustível</b><strong>R$ 290 · 60%</strong></span><span><i className="expense-dot expense-dot--service" /><b>Manutenção</b><strong>R$ 140 · 29%</strong></span><span><i className="expense-dot expense-dot--wash" /><b>Lavagem</b><strong>R$ 56 · 11%</strong></span></div></div></article></div><div className="expenses-layout"><article className="panel expenses-list-card"><div className="expenses-list-card__head"><div><p className="label-caps">HISTÓRICO FINANCEIRO</p><h2>Últimos lançamentos</h2></div><WalletCards size={22} /></div><div className="expense-filters">{["Todos", "Combustível", "Manutenção", "Lavagem"].map((item) => <button key={item} className={filter === item ? "expense-filter expense-filter--active" : "expense-filter"} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="expense-list">{visibleExpenses.map((expense) => { const Icon = expense.icon; return <button className="expense-row" key={`${expense.label}-${expense.meta}`} onClick={() => toast("Registro selecionado", { description: `${expense.label} · ${expense.value}` })}><span className={`expense-row__icon expense-row__icon--${expense.tone}`}><Icon size={17} /></span><span className="expense-row__content"><strong>{expense.label}</strong><small>{expense.category} · {expense.meta}</small></span><strong className="expense-row__value">{expense.value}</strong><ChevronRight size={15} /></button>; })}</div></article><aside className="expense-side"><article className="panel quick-expense-card"><div className="panel-heading"><div><p className="label-caps">REGISTRAR AGORA</p><h2>O que aconteceu?</h2></div><Plus size={21} /></div><div className="quick-expense-actions">{quickActions.map((action) => { const Icon = action.icon; return <button key={action.label} className="quick-expense-action" onClick={() => { setEntryType(action.label); setShowRegister(true); }}><span className={`expense-row__icon expense-row__icon--${action.tone}`}><Icon size={17} /></span><span>{action.label}</span><ChevronRight size={14} /></button>; })}</div></article><article className="panel trip-cost-card"><div className="panel-heading"><div><p className="label-caps">CUSTO DA ÚLTIMA VIAGEM</p><h2>Costeira Norte</h2></div><Route size={21} /></div><div className="trip-cost-card__total"><strong>R$ 178,40</strong><span>46,8 km · R$ 3,81/km</span></div><button className="text-button" onClick={() => toast("Detalhes da viagem", { description: "Veja abastecimentos e serviços associados ao rolê." })}>Ver detalhes <ChevronRight size={14} /></button></article></aside></div></>;
}

function GarageView() {
  const [rideMode, setRideMode] = useState("Road mode");
  return <><PageHeader eyebrow="GARAGEM / MINHA MOTO" title={<>A máquina pronta.<br /><em>Você também.</em></>} titleClassName="page-header__title--compact" description="Acompanhe saúde, manutenção e o perfil de pilotagem da sua companheira de estrada." action={<button className="secondary-button garage-action" onClick={() => toast("Adicionar moto", { description: "O cadastro de uma nova moto será liberado em breve." })}><Plus size={15} /> Adicionar moto</button>} /><div className="garage-grid"><article className="panel bike-profile-card"><div className="bike-profile-card__top"><div><p className="label-caps">MOTO PRINCIPAL</p><h2>Triumph Street Triple</h2><span>2024 · Graphite matte · 765 cc</span></div><div className="bike-emblem"><Bike size={26} /></div></div><div className="bike-visual"><div className="bike-visual__ring" /><Bike size={124} strokeWidth={.8} /><span className="bike-visual__plate">RB · 765</span></div><div className="bike-profile-card__footer"><span><ShieldCheck size={14} /> Saúde geral <strong>98%</strong></span><button className="text-button" onClick={() => toast("Detalhes da moto", { description: "Todos os sistemas estão dentro do intervalo recomendado." })}>Ver detalhes <ChevronRight size={14} /></button></div></article><div className="garage-stack"><article className="panel garage-stat-card"><div className="panel-heading"><div><p className="label-caps">PRÓXIMA REVISÃO</p><h2>1.240 km</h2></div><Wrench size={22} /></div><div className="progress-bar"><span style={{ width: "72%" }} /></div><div className="garage-stat-card__footer"><span>72% do intervalo</span><span>em 24 dias</span></div></article><article className="panel maintenance-log-card"><div className="panel-heading"><div><p className="label-caps">HISTÓRICO</p><h2>Últimos serviços</h2></div><ClipboardCheck size={21} /></div><div className="maintenance-log"><span><Wrench size={14} /><strong>Troca de óleo</strong><small>12 jun · R$ 140,00</small></span><span><Droplets size={14} /><strong>Lavagem completa</strong><small>08 jun · R$ 56,00</small></span></div><button className="text-button" onClick={() => toast("Registrar manutenção", { description: "Adicione serviço, data, quilometragem e valor." })}>Registrar serviço <Plus size={14} /></button></article><article className="panel ride-mode-card"><div className="panel-heading"><div><p className="label-caps">MODO DE PILOTAGEM</p><h2>{rideMode}</h2></div><SlidersHorizontal size={22} /></div><div className="mode-options">{["Road mode", "Rain mode", "Sport mode"].map((mode) => <button key={mode} className={rideMode === mode ? "mode-option mode-option--active" : "mode-option"} onClick={() => { setRideMode(mode); toast(`Modo ${mode} ativado`); }}>{mode}<span>{rideMode === mode && <Check size={14} />}</span></button>)}</div></article></div></div></>;
}

export function ProfileView() {
  const { user, signOutUser } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [shareRides, setShareRides] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { displayName, email, initials } = getProfileIdentity(user);
  const preferences = [{ label: "Alertas de manutenção", description: "Receber lembretes sobre a saúde da moto", value: notifications, setValue: setNotifications }, { label: "Compartilhar rolês", description: "Permitir que amigos acompanhem suas rotas", value: shareRides, setValue: setShareRides }];
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      toast.success("Sessão encerrada", { description: "Você saiu do MotoTracker com segurança." });
    } catch {
      toast.error("Não foi possível sair", { description: "Tente novamente em alguns instantes." });
      setIsSigningOut(false);
    }
  };
  return <><PageHeader eyebrow="PERFIL / PILOTO" title={<>Seu perfil,<br /><em>no seu ritmo.</em></>} description="Gerencie suas preferências, privacidade e a forma como o MotoTracker acompanha suas viagens." action={<button className="profile-edit-button" onClick={() => toast("Perfil em modo de edição")}>Editar perfil <ArrowUpRight size={15} /></button>} /><div className="profile-layout"><article className="panel rider-card"><div className="rider-card__avatar">{initials}</div><p className="label-caps">CONTA GOOGLE</p><h2>{displayName}</h2><span>{email}</span><div className="rider-card__stats"><div><strong>Google</strong><span>autenticação</span></div><div><strong>Privado</strong><span>seu diário</span></div><div><strong>Ativo</strong><span>acesso</span></div></div><button className="secondary-button" onClick={() => void handleSignOut()} disabled={isSigningOut}>{isSigningOut ? "Encerrando..." : <><LogOut size={15} /> Sair da conta</>}</button></article><article className="panel settings-card"><div className="panel-heading"><div><p className="label-caps">PREFERÊNCIAS</p><h2>Como você pilota</h2></div><Settings2 size={21} /></div><div className="settings-list">{preferences.map((preference) => <button className="setting-row" key={preference.label} onClick={() => preference.setValue(!preference.value)}><span><strong>{preference.label}</strong><small>{preference.description}</small></span><span className={`toggle ${preference.value ? "toggle--on" : ""}`}><span /></span></button>)}</div><button className="secondary-button" onClick={() => toast("Preferências salvas", { description: "Suas escolhas foram atualizadas." })}>Salvar preferências <Check size={15} /></button></article></div></>;
}

function LegacySettingsView() {
  return <><PageHeader eyebrow="SISTEMA / CONTROLE" title={<>Ajuste o painel<br /><em>ao seu jeito.</em></>} description="Controle aparência, notificações e a forma como você organiza seu diário de moto." /><div className="settings-grid"><article className="panel settings-card"><div className="panel-heading"><div><p className="label-caps">APARÊNCIA</p><h2>Interface</h2></div><SlidersHorizontal size={21} /></div>{["Modo noturno automático", "Mostrar custo por quilômetro", "Compactar cartões"].map((label, index) => <div className="setting-row setting-row--static" key={label}><span><strong>{label}</strong><small>{index === 0 ? "Ativo entre 18h e 06h" : "Ativo no dashboard principal"}</small></span><span className={`toggle ${index < 2 ? "toggle--on" : ""}`}><span /></span></div>)}</article><article className="panel settings-card settings-card--accent"><div className="settings-card__icon"><Bell size={18} /></div><p className="label-caps">CENTRAL DE ALERTAS</p><h2>Você está em dia.</h2><p className="settings-card__copy">Nenhuma notificação crítica pendente para a sua moto ou para as viagens salvas.</p><button className="secondary-button" onClick={() => toast("Tudo em dia", { description: "Nenhum alerta novo encontrado." })}>Verificar novamente <ArrowUpRight size={15} /></button></article></div></>;
}

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Section>(() => {
    if (typeof window === "undefined") return "Dashboard";
    const requested = new URLSearchParams(window.location.search).get("screen");
    return ["Dashboard", "Viagens", "Gastos", "Garagem", "Perfil", "Configurações"].includes(requested ?? "") ? requested as Section : "Dashboard";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const { initials, displayName } = getProfileIdentity(user);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  const handleNavigation = (section: Section) => { setActiveTab(section); setMenuOpen(false); window.history.replaceState(null, "", section === "Dashboard" ? "/" : `/?screen=${encodeURIComponent(section)}`); };
  const pageTitle = activeTab === "Dashboard" ? "Resumo" : activeTab;
  return <div className="app-shell">
    <aside className="side-rail"><MotoTrackerMark compact /><nav className="side-nav" aria-label="Navegação principal">{navItems.map((item) => <NavItem key={item.label} item={item} active={activeTab === item.label} onSelect={() => handleNavigation(item.label)} />)}</nav><div className="side-rail__bottom"><button className={`nav-item ${activeTab === "Configurações" ? "nav-item--active" : ""}`} onClick={() => handleNavigation("Configurações")}><Settings2 size={19} /><span>Configurações</span></button><div className="side-rail__version">v1.0.4 / BUILD 0826</div></div></aside>
    {menuOpen && <><button className="drawer-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} /><aside className="mobile-drawer" aria-label="Menu lateral"><div className="mobile-drawer__head"><MotoTrackerMark /><button className="icon-button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div><div className="mobile-drawer__profile"><span>{initials}</span><div><strong>{displayName}</strong><small>Diário ativo</small></div></div><nav className="mobile-drawer__nav">{navItems.map((item) => <NavItem key={item.label} item={item} active={activeTab === item.label} onSelect={() => handleNavigation(item.label)} />)}<button className={`nav-item ${activeTab === "Configurações" ? "nav-item--active" : ""}`} onClick={() => handleNavigation("Configurações")}><Settings2 size={19} /><span>Configurações</span></button></nav><div className="mobile-drawer__footer">MOTOTRACKER / 2026<br /><span>Seu ritmo. A estrada à frente.</span></div></aside></>}
    <main className="main-content"><header className="topbar"><div className="topbar__left"><button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><MotoTrackerMark /><div className="topbar__divider" /><div className="context-label"><span className="status-dot status-dot--live" /><span>{pageTitle}</span></div></div><div className="topbar__actions"><button className="icon-button" aria-label="Notificações" onClick={() => handleNavigation("Configurações")}><Bell size={18} /></button><button className="profile-chip" onClick={() => handleNavigation("Perfil")}><span>{initials}</span><ChevronRight size={14} /></button></div></header><div className="content-wrap">{activeTab === "Dashboard" && <DashboardView onOpenRoutes={() => handleNavigation("Viagens")} onOpenGarage={() => handleNavigation("Garagem")} onOpenExpenses={() => handleNavigation("Gastos")} />}{activeTab === "Viagens" && <RoutesView />}{activeTab === "Gastos" && <ExpensesView />}{activeTab === "Garagem" && <GarageView />}{activeTab === "Perfil" && <ProfileView />}{activeTab === "Configurações" && <SettingsView />}</div><footer className="bottom-nav" aria-label="Navegação mobile">{navItems.map((item) => <NavItem key={item.label} item={item} active={activeTab === item.label} onSelect={() => handleNavigation(item.label)} />)}</footer></main>
  </div>;
}
