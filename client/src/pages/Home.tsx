/* MotoTracker — Industrial Editorial Control Center: graphite cockpit surfaces, asymmetric rhythm, Pulse Orange #F0643C, Space Grotesk + DM Sans. */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ensureGoogleMapsLoaded } from "@/components/Map";
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

type RoutePointKind = "start" | "stop" | "finish";
type RoutePoint = { id: string; kind: RoutePointKind; label: string; address: string };

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

type PlaceSuggestion = { placeId: string; primary: string; secondary: string; description: string; prediction?: google.maps.places.PlacePrediction; resolved?: { name: string; address: string } };

async function searchPlaces(input: string): Promise<PlaceSuggestion[]> {
  if (input.trim().length < 2) return [];
  await ensureGoogleMapsLoaded();
  if (!window.google?.maps?.places) return [];

  try {
    const placesLibrary = await window.google.maps.importLibrary("places") as google.maps.PlacesLibrary;
    const AutocompleteSuggestion = placesLibrary.AutocompleteSuggestion;
    if (AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
      const { AutocompleteSessionToken } = placesLibrary;
      const sessionToken = new AutocompleteSessionToken();
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: input.trim(),
        includedRegionCodes: ["br"],
        language: "pt-BR",
        region: "br",
        sessionToken,
      });
      return suggestions.filter((suggestion) => Boolean(suggestion.placePrediction)).slice(0, 5).map((suggestion) => {
        const prediction = suggestion.placePrediction!;
        return {
          placeId: prediction.placeId,
          primary: prediction.mainText?.toString() || prediction.text.toString(),
          secondary: prediction.secondaryText?.toString() || "Brasil",
          description: prediction.text.toString(),
          prediction,
        };
      });
    }
  } catch {
    // Continua para o serviço legado e para o Geocoder, caso Places (New) não esteja habilitado.
  }

  try {
    if (window.google.maps.places.AutocompleteService) {
      const legacySuggestions = await new Promise<PlaceSuggestion[]>((resolve, reject) => {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ input, componentRestrictions: { country: "br" } }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
            return;
          }
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            reject(new Error("Não foi possível buscar lugares agora."));
            return;
          }
          resolve(predictions.slice(0, 5).map((prediction) => ({
            placeId: prediction.place_id,
            primary: prediction.structured_formatting.main_text,
            secondary: prediction.structured_formatting.secondary_text,
            description: prediction.description,
          })));
        });
      });
      if (legacySuggestions.length) return legacySuggestions;
    }
  } catch {
    // Usa o Geocoder como fallback para instalações que não expõem Places Autocomplete.
  }

  const geocodingLibrary = await window.google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary;
  const geocoder = new geocodingLibrary.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: input.trim(), region: "BR" }, (results, status) => {
      if (status !== "OK" || !results?.length) {
        reject(new Error("Não foi possível buscar lugares agora."));
        return;
      }
      resolve(results.slice(0, 5).map((result, index) => {
        const preferredComponent = result.address_components.find((component) => component.types.some((type) => ["locality", "establishment", "point_of_interest", "route"].includes(type)));
        const name = preferredComponent?.long_name || result.formatted_address.split(",")[0] || input.trim();
        return {
          placeId: result.place_id || `geocode-${index}-${result.formatted_address}`,
          primary: name,
          secondary: result.formatted_address,
          description: result.formatted_address,
          resolved: { name, address: result.formatted_address },
        };
      }));
    });
  });
}

async function getPlaceDetails(suggestion: PlaceSuggestion) {
  await ensureGoogleMapsLoaded();
  if (!window.google?.maps?.places) throw new Error("Detalhes do lugar indisponíveis.");

  if (suggestion.resolved) return suggestion.resolved;

  if (suggestion.prediction) {
    try {
      const place = suggestion.prediction.toPlace();
      await place.fetchFields({ fields: ["displayName", "formattedAddress"] });
      return {
        name: place.displayName || suggestion.primary || "Lugar selecionado",
        address: place.formattedAddress || suggestion.secondary || "",
      };
    } catch {
      return { name: suggestion.primary || "Lugar selecionado", address: suggestion.description || suggestion.secondary };
    }
  }

  return new Promise<{ name: string; address: string }>((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    service.getDetails({ placeId: suggestion.placeId, fields: ["name", "formatted_address"] }, (place, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
        reject(new Error("Não foi possível carregar o endereço exato."));
        return;
      }
      resolve({ name: place.name ?? "Lugar selecionado", address: place.formatted_address ?? "" });
    });
  });
}

type SavedRoute = { name: string; meta: string; tag: string; icon: IconType; points: RoutePoint[] };

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
      <div className="dashboard-layout"><div className="dashboard-main"><SummaryHero onOpenRoutes={onOpenRoutes} onOpenGarage={onOpenGarage} /><div className="metrics-grid">{summaryMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div><RouteCard onOpenRoutes={onOpenRoutes} /></div><aside className="dashboard-side"><article className="panel next-trip-card"><div className="panel-heading"><div><p className="label-caps">PRÓXIMA VIAGEM</p><h2>Serra do Rastro</h2></div><CalendarDays size={21} /></div><div className="next-trip-card__stats"><span><strong>14.8</strong> km</span><span><strong>18</strong> min</span><span><strong>04</strong> paradas</span></div><button className="secondary-button" onClick={onOpenRoutes}>Abrir planejamento <ChevronRight size={15} /></button></article><article className="panel maintenance-card"><div className="panel-heading"><div><p className="label-caps">MANUTENÇÃO</p><h2>Tudo em dia</h2></div><ClipboardCheck size={22} /></div><div className="maintenance-card__reading"><div className="maintenance-card__status"><span className="status-dot status-dot--ok" />Saúde da moto <strong>98%</strong></div><span>Próxima revisão em 1.240 km</span></div><button className="secondary-button" onClick={onOpenGarage}>Ver manutenção <ChevronRight size={15} /></button></article><article className="panel expense-preview-card"><div className="panel-heading"><div><p className="label-caps">GASTOS NO MÊS</p><h2>R$ 486,00</h2></div><WalletCards size={22} /></div><div className="expense-preview-card__rows"><span><i className="expense-dot expense-dot--fuel" /> Combustível <strong>R$ 290</strong></span><span><i className="expense-dot expense-dot--service" /> Manutenção <strong>R$ 140</strong></span><span><i className="expense-dot expense-dot--wash" /> Lavagem <strong>R$ 56</strong></span></div><button className="text-button" onClick={onOpenExpenses}>Ver todos os gastos <ChevronRight size={14} /></button></article></aside></div>
    </>
  );
}

function PageHeader({ eyebrow, title, description, action, titleClassName = "" }: { eyebrow: string; title: ReactNode; description: string; action?: ReactNode; titleClassName?: string }) {
  return <section className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1 className={titleClassName}>{title}</h1><p className="page-header__description">{description}</p></div>{action}</section>;
}

function RoutesView() {
  const [filter, setFilter] = useState("Planejadas");
  const [isCreating, setIsCreating] = useState(false);
  const [editingRouteName, setEditingRouteName] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState("");
  const [activeRoute, setActiveRoute] = useState("Serra do Rastro");
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(() => cloneRoutePoints("Serra do Rastro"));
  const [runMenuOpen, setRunMenuOpen] = useState(false);
  const [placeSearchPointId, setPlaceSearchPointId] = useState<string | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const placeRequestRef = useRef(0);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(() => [
    { name: "Serra do Rastro", meta: "14,8 km · 04 paradas", tag: "Favorita", icon: Route, points: cloneRoutePoints("Serra do Rastro") },
    { name: "Costeira Norte", meta: "46,8 km · 06 paradas", tag: "Último rolê", icon: CalendarDays, points: cloneRoutePoints("Costeira Norte") },
    { name: "Vale dos Ventos", meta: "82,1 km · 08 paradas", tag: "Explorar", icon: ClipboardCheck, points: cloneRoutePoints("Vale dos Ventos") },
  ]);
  const stopCount = routePoints.filter((point) => point.kind === "stop").length;

  const openNewTrip = () => {
    setIsCreating(true);
    setEditingRouteName(null);
    setNewTripName("");
    setActiveRoute("Nova viagem");
    setRoutePoints(createBlankRoutePoints());
    setRunMenuOpen(false);
    setPlaceSearchPointId(null);
    setPlaceSuggestions([]);
    toast("Novo roteiro", { description: "Defina partida, paradas e destino da viagem." });
  };

  const openSavedRoute = (route: SavedRoute, openRunMenu = false) => {
    setIsCreating(true);
    setEditingRouteName(route.name);
    setNewTripName(route.name);
    setActiveRoute(route.name);
    setRoutePoints(route.points.map((point) => ({ ...point })));
    setRunMenuOpen(openRunMenu);
    setPlaceSearchPointId(null);
    setPlaceSuggestions([]);
  };

  const closeEditor = () => {
    setIsCreating(false);
    setEditingRouteName(null);
    setRunMenuOpen(false);
    setPlaceSearchPointId(null);
    setPlaceSuggestions([]);
    setFilter("Planejadas");
  };

  const updatePoint = (id: string, field: "label" | "address", value: string) => {
    setRoutePoints((current) => current.map((point) => point.id === id ? { ...point, [field]: value } : point));
  };

  const handlePlaceSearch = (pointId: string, field: "label" | "address", value: string) => {
    updatePoint(pointId, field, value);
    setPlaceSearchPointId(pointId);
    setPlaceQuery(value);
    setPlaceError("");
    const requestId = ++placeRequestRef.current;
    if (value.trim().length < 2) {
      setPlaceSuggestions([]);
      setPlaceLoading(false);
      return;
    }
    setPlaceLoading(true);
    void searchPlaces(value).then((suggestions) => {
      if (requestId === placeRequestRef.current) setPlaceSuggestions(suggestions);
    }).catch(() => {
      if (requestId === placeRequestRef.current) {
        setPlaceSuggestions([]);
        setPlaceError("Busca do Google Maps indisponível agora. Você pode preencher manualmente.");
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
      updatePoint(pointId, "label", details.name || suggestion.primary);
      updatePoint(pointId, "address", details.address || suggestion.description);
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
    toast("Parada adicionada", { description: "Digite o nome do lugar para ver sugestões do Google Maps." });
  };

  const removeStop = (id: string) => setRoutePoints((current) => current.filter((point) => point.id !== id));

  const savePlanning = () => {
    const name = newTripName.trim() || activeRoute.trim() || "Nova viagem";
    const savedRoute: SavedRoute = { name, meta: `${routePoints.length - 2} ${routePoints.length - 2 === 1 ? "parada" : "paradas"}`, tag: editingRouteName ? "Planejada" : "Nova", icon: Route, points: routePoints.map((point) => ({ ...point })) };
    setSavedRoutes((current) => editingRouteName ? current.map((route) => route.name === editingRouteName ? savedRoute : route) : [savedRoute, ...current]);
    setActiveRoute(name);
    setIsCreating(false);
    setEditingRouteName(null);
    setFilter("Planejadas");
    setRunMenuOpen(false);
    toast.success("Planejamento salvo", { description: `${name} agora está em Planejadas.` });
  };

  const routeEditor = <aside className="panel route-summary route-summary--planner route-summary--creating">
    <div className="route-summary__body route-summary__body--planner">
      <div className="route-summary__planner-head"><div><p className="label-caps">{editingRouteName ? "EDITAR ROTEIRO" : "NOVA VIAGEM"}</p><h2>{newTripName || "Sua nova viagem"}</h2></div><span className="route-summary__count">{stopCount} {stopCount === 1 ? "parada" : "paradas"}</span></div>
      <div className="route-trip-name"><label className="label-caps" htmlFor="route-name">NOME DA VIAGEM</label><input id="route-name" className="route-point-input" value={newTripName} placeholder="Ex.: Fortaleza de fim de semana" onChange={(event) => setNewTripName(event.target.value)} /></div>
      <div className="route-helper"><MapPin size={15} /><span>Digite um lugar e selecione uma sugestão do Google Maps para preencher o endereço exato.</span></div>
      <div className="route-timeline" aria-label={`Timeline da viagem ${newTripName || "nova viagem"}`}>
        {routePoints.map((point, index) => <div className={`route-timeline__item route-timeline__item--${point.kind}`} key={point.id}>
          <div className="route-timeline__rail"><span>{index + 1}</span></div>
          <div className="route-timeline__body"><div className="route-timeline__top"><p className="label-caps">{pointLabels[point.kind]}</p>{point.kind === "stop" && <button className="route-remove-button" aria-label={`Remover ${point.label || "parada"}`} onClick={() => removeStop(point.id)}><Trash2 size={14} /></button>}</div>
            <div className="route-point-fields">
              <input className="route-point-input" aria-label={`Nome do ponto ${index + 1}`} value={point.label} placeholder={point.kind === "start" ? "Ex.: Fortaleza" : point.kind === "finish" ? "Ex.: Canoa Quebrada" : "Ex.: Praia ou mirante"} onFocus={() => { setPlaceSearchPointId(point.id); setPlaceQuery(point.label); }} onChange={(event) => handlePlaceSearch(point.id, "label", event.target.value)} />
              <div className="route-address-row"><MapPin size={14} /><input className="route-address-input" aria-label={`Endereço de ${point.label || `ponto ${index + 1}`}`} value={point.address} placeholder="Endereço exato" onFocus={() => { setPlaceSearchPointId(point.id); setPlaceQuery(point.address); }} onChange={(event) => handlePlaceSearch(point.id, "address", event.target.value)} /><a className="route-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pointQuery(point))}`} target="_blank" rel="noreferrer">Maps <ExternalLink size={12} /></a></div>
              {placeSearchPointId === point.id && (placeLoading || placeError || placeSuggestions.length > 0) && <div className="place-suggestions" role="listbox" aria-label="Sugestões de lugares"><div className="place-suggestions__label">{placeLoading ? "BUSCANDO NO GOOGLE MAPS" : "SUGESTÕES DE LUGAR"}</div>{placeSuggestions.map((suggestion) => <button className="place-suggestion" key={suggestion.placeId} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void selectPlaceSuggestion(point.id, suggestion)}><MapPin size={15} /><span><strong>{suggestion.primary}</strong><small>{suggestion.secondary || suggestion.description}</small></span></button>)}{placeError && <p className="place-suggestions__error">{placeError}</p>}{!placeLoading && !placeError && placeSuggestions.length === 0 && placeQuery.trim().length >= 2 && <p className="place-suggestions__empty">Nenhum lugar encontrado. Continue digitando ou preencha manualmente.</p>}</div>}
            </div>
          </div>
        </div>)}
      </div>
      <div className="route-editor__actions"><button className="secondary-button route-add-stop" onClick={addStop}><Plus size={14} /> Adicionar parada</button><button className="primary-button" onClick={savePlanning}><Check size={14} /> Salvar roteiro</button></div>
      <div className="route-launch"><div><p className="label-caps">IR PARA A ESTRADA</p><span>Abra a viagem com a origem, destino e paradas definidas.</span></div><button className="route-go-button" onClick={() => setRunMenuOpen((current) => !current)}><Navigation size={14} /> Ir <ChevronRight size={13} /></button>{runMenuOpen && <div className="route-launch__menu"><a href={googleMapsRouteUrl(routePoints)} target="_blank" rel="noreferrer"><MapPin size={15} /><span><strong>Google Maps</strong><small>Abre com todas as paradas</small></span><ExternalLink size={13} /></a><a href={wazeRouteUrl(routePoints)} target="_blank" rel="noreferrer"><Navigation size={15} /><span><strong>Waze</strong><small>Abre o destino final; paradas na timeline</small></span><ExternalLink size={13} /></a></div>}</div>
    </div>
  </aside>;

  return <>
    <PageHeader eyebrow={isCreating ? "VIAGENS / NOVA VIAGEM" : "VIAGENS / PLANEJADAS"} title={isCreating ? <>Crie a próxima<br /><em>viagem.</em></> : <>Planeje o próximo<br /><em>trecho da estrada.</em></>} description={isCreating ? "Preencha somente os pontos deste novo roteiro e confirme cada endereço no Google Maps." : "Suas viagens salvas ficam aqui. Abra Nova viagem para montar um novo roteiro em timeline."} action={isCreating ? <button className="secondary-button" onClick={closeEditor}>Ver Planejadas <ChevronRight size={14} /></button> : <button className="primary-button" onClick={openNewTrip}><Plus size={15} /> Nova viagem</button>} />
    {!isCreating && <><div className="section-tabs" role="tablist">{["Planejadas", "Histórico", "Descobrir"].map((item) => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? "section-tab section-tab--active" : "section-tab"} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="routes-layout routes-layout--planner routes-layout--saved"><div className="route-list">{filter === "Planejadas" && savedRoutes.map((route, index) => { const Icon = route.icon; return <article className="route-list-card panel" key={route.name}><div className="route-list-card__index">0{index + 1}</div><div className="route-list-card__icon"><Icon size={20} /></div><div className="route-list-card__content"><div className="route-list-card__top"><div><p className="label-caps">{route.tag}</p><h2>{route.name}</h2></div><span className="route-list-card__distance">{route.meta}</span></div><div className="route-list-card__line"><span><CircleDot size={12} /> roteiro salvo</span><div className="route-list-card__actions"><button className="text-button" onClick={() => openSavedRoute(route)}>Editar <ChevronRight size={14} /></button><button className="route-go-button route-go-button--small" onClick={() => openSavedRoute(route, true)}><Navigation size={13} /> Ir</button></div></div></div></article>; })}{filter !== "Planejadas" && <article className="panel route-empty-state"><p className="label-caps">{filter === "Histórico" ? "SEM HISTÓRICO AINDA" : "DESCOBRIR"}</p><h2>{filter === "Histórico" ? "Suas viagens concluídas aparecerão aqui." : "Novos roteiros entram nesta área."}</h2><p>{filter === "Histórico" ? "Depois de registrar uma viagem, você encontrará o resumo e os pontos percorridos nesta aba." : "Use Nova viagem para criar um roteiro personalizado com seus próprios lugares."}</p></article>}</div></div></>}
    {isCreating && <div className="routes-layout routes-layout--planner routes-layout--creating">{routeEditor}</div>}
  </>;
}

function ExpensesView() {
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

function ProfileView() {
  const [notifications, setNotifications] = useState(true);
  const [shareRides, setShareRides] = useState(false);
  const preferences = [{ label: "Alertas de manutenção", description: "Receber lembretes sobre a saúde da moto", value: notifications, setValue: setNotifications }, { label: "Compartilhar rolês", description: "Permitir que amigos acompanhem suas rotas", value: shareRides, setValue: setShareRides }];
  return <><PageHeader eyebrow="PERFIL / PILOTO" title={<>Rafael, mantenha<br /><em>o motor em dia.</em></>} description="Gerencie suas preferências, privacidade e a forma como o MotoTracker acompanha suas viagens." action={<button className="profile-edit-button" onClick={() => toast("Perfil em modo de edição")}>Editar perfil <ArrowUpRight size={15} /></button>} /><div className="profile-layout"><article className="panel rider-card"><div className="rider-card__avatar">RB</div><p className="label-caps">PILOTO DESDE 2023</p><h2>Rafael Barros</h2><span>Florianópolis, SC · 2.480 km registrados</span><div className="rider-card__stats"><div><strong>18</strong><span>viagens</span></div><div><strong>4</strong><span>viagens salvas</span></div><div><strong>02</strong><span>conquistas</span></div></div></article><article className="panel settings-card"><div className="panel-heading"><div><p className="label-caps">PREFERÊNCIAS</p><h2>Como você pilota</h2></div><Settings2 size={21} /></div><div className="settings-list">{preferences.map((preference) => <button className="setting-row" key={preference.label} onClick={() => preference.setValue(!preference.value)}><span><strong>{preference.label}</strong><small>{preference.description}</small></span><span className={`toggle ${preference.value ? "toggle--on" : ""}`}><span /></span></button>)}</div><button className="secondary-button" onClick={() => toast("Preferências salvas", { description: "Suas escolhas foram atualizadas." })}>Salvar preferências <Check size={15} /></button></article></div></>;
}

function SettingsView() {
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
  const initials = (user?.displayName?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "RB").toUpperCase();
  const displayName = user?.displayName || "Piloto";
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  const handleNavigation = (section: Section) => { setActiveTab(section); setMenuOpen(false); window.history.replaceState(null, "", section === "Dashboard" ? "/" : `/?screen=${encodeURIComponent(section)}`); };
  const pageTitle = activeTab === "Dashboard" ? "Resumo" : activeTab;
  return <div className="app-shell">
    <aside className="side-rail"><MotoTrackerMark compact /><nav className="side-nav" aria-label="Navegação principal">{navItems.map((item) => <NavItem key={item.label} item={item} active={activeTab === item.label} onSelect={() => handleNavigation(item.label)} />)}</nav><div className="side-rail__bottom"><button className={`nav-item ${activeTab === "Configurações" ? "nav-item--active" : ""}`} onClick={() => handleNavigation("Configurações")}><Settings2 size={19} /><span>Configurações</span></button><div className="side-rail__version">v1.0.4 / BUILD 0826</div></div></aside>
    {menuOpen && <><button className="drawer-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} /><aside className="mobile-drawer" aria-label="Menu lateral"><div className="mobile-drawer__head"><MotoTrackerMark /><button className="icon-button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div><div className="mobile-drawer__profile"><span>{initials}</span><div><strong>{displayName}</strong><small>Diário ativo</small></div></div><nav className="mobile-drawer__nav">{navItems.map((item) => <NavItem key={item.label} item={item} active={activeTab === item.label} onSelect={() => handleNavigation(item.label)} />)}<button className={`nav-item ${activeTab === "Configurações" ? "nav-item--active" : ""}`} onClick={() => handleNavigation("Configurações")}><Settings2 size={19} /><span>Configurações</span></button></nav><div className="mobile-drawer__footer">MOTOTRACKER / 2026<br /><span>Seu ritmo. A estrada à frente.</span></div></aside></>}
    <main className="main-content"><header className="topbar"><div className="topbar__left"><button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><MotoTrackerMark /><div className="topbar__divider" /><div className="context-label"><span className="status-dot status-dot--live" /><span>{pageTitle}</span></div></div><div className="topbar__actions"><button className="icon-button" aria-label="Notificações" onClick={() => handleNavigation("Configurações")}><Bell size={18} /></button><button className="profile-chip" onClick={() => handleNavigation("Perfil")}><span>{initials}</span><ChevronRight size={14} /></button></div></header><div className="content-wrap">{activeTab === "Dashboard" && <DashboardView onOpenRoutes={() => handleNavigation("Viagens")} onOpenGarage={() => handleNavigation("Garagem")} onOpenExpenses={() => handleNavigation("Gastos")} />}{activeTab === "Viagens" && <RoutesView />}{activeTab === "Gastos" && <ExpensesView />}{activeTab === "Garagem" && <GarageView />}{activeTab === "Perfil" && <ProfileView />}{activeTab === "Configurações" && <SettingsView />}</div><footer className="bottom-nav" aria-label="Navegação mobile">{navItems.map((item) => <NavItem key={item.label} item={item} active={activeTab === item.label} onSelect={() => handleNavigation(item.label)} />)}</footer></main>
  </div>;
}
