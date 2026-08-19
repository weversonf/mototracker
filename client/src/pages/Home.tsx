/*
 * DESIGN (v2): "Missão Aratuba" — Military Dark, mobile-first (coluna ≤480px).
 * Preto-oliva + verde-fósforo tático + âmbar de alerta.
 * Rajdhani display, Barlow corpo, Share Tech Mono coords/horas.
 * Botões "IR" ≥52px sempre ao pé de cada waypoint; barra de status fixa inferior.
 */
import { useEffect, useState } from "react";
import {
  Coffee,
  Mountain,
  Droplets,
  Church,
  Camera,
  Sun,
  MapPin,
  Navigation,
  Thermometer,
  Wallet,
  Car,
  Flag,
  Check,
  Circle,
  Moon,
  Users,
  ShieldCheck,
  Map as MapIcon,
  Send,
  Backpack,
  ClipboardList,
} from "lucide-react";
import WaypointMap from "@/components/WaypointMap";
import Equipe from "@/components/Equipe";
import Kit from "@/components/Kit";
import { ExpensesView } from "@/components/ExpensesView";
import { SettingsView } from "@/components/SettingsView";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { GarageView, ProfileView, RoutesView } from "@/pages/LegacyFunctionalViews";
import { CONVITE_WHATSAPP } from "@/lib/rota";
import {
  PONTO_ENCONTRO,
  PARADAS,
  CHEGADA,
  abrirRota,
  type Parada,
} from "@/lib/rota";
import { useInView } from "@/hooks/useInView";
import { useAuth } from "@/contexts/AuthContext";
import { watchTrips } from "@/lib/trips";
import { getStoredBikeProfile, bikeProfileStorageKey, type BikeProfile } from "@/lib/bikeProfile";
import type { RoutePoint, Trip } from "@/types/trips";

type Aba = "missao" | "mapa" | "equipe" | "kit";
type OperationalPanel = "routes" | "expenses" | "garage" | "profile" | "settings" | null;

const ICONS: Record<Parada["tipo"], React.ReactNode> = {
  encontro: <Flag className="h-4 w-4" />,
  cafe: <Coffee className="h-4 w-4" />,
  turismo: <Church className="h-4 w-4" />,
  almoco: <Mountain className="h-4 w-4" />,
  natureza: <Droplets className="h-4 w-4" />,
  mirante: <Camera className="h-4 w-4" />,
};

const WP_LABEL: Record<Parada["tipo"], string> = {
  encontro: "WP-00 · ENCONTRO",
  cafe: "WP · CAFÉ",
  turismo: "WP · CULTURA",
  almoco: "WP · RANCHO",
  natureza: "WP · ÁGUA",
  mirante: "WP · VISTA",
};

const WP_NUM: Record<string, string> = {
  encontro: "00",
  cafe: "01",
  centro: "02",
  mirantes: "03",
  almoco: "04",
  cachoeira: "05",
  tardinha: "06",
  putdosol: "07",
};

function horaFmt(hora: string) {
  return hora.replace("h", "") + "H";
}

export default function Home() {
  const [aba, setAba] = useState<Aba>("missao");
  const [operationalPanel, setOperationalPanel] = useState<OperationalPanel>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bikeProfile, setBikeProfile] = useState<BikeProfile>(() => getStoredBikeProfile(user?.uid));
  const doneCount = Object.values(checklist).filter(Boolean).length;
  const total = PARADAS.length;
  const activeTrip = trips[0] ?? null;
  const tripStart = activeTrip?.points.find((point) => point.kind === "start") ?? null;
  const tripStops = activeTrip?.points.filter((point) => point.kind === "stop") ?? [];
  const tripDestination = activeTrip?.points.find((point) => point.kind === "finish") ?? null;
  const displayedBike = bikeProfile.nickname || bikeProfile.model || "Moto não cadastrada";
  const missionWaypoints = activeTrip
    ? activeTrip.points.map((point, index) => ({
        id: point.id,
        typeLabel: point.kind === "start" ? "WP-00 · Partida" : point.kind === "finish" ? "Destino" : "Parada programada",
        schedule: "ROTEIRO SALVO",
        number: String(index).padStart(2, "0"),
        title: point.label || "Ponto sem nome",
        local: point.label || "Local pendente",
        address: point.address || "Endereço pendente",
        description: "Ponto registrado no seu roteiro planejado.",
        image: undefined,
        point,
        coords: point.coordinates ? [point.coordinates.lat, point.coordinates.lng] as [number, number] : null,
      }))
    : PARADAS.map((point) => ({
        id: point.id,
        typeLabel: WP_LABEL[point.tipo],
        schedule: horaFmt(point.hora),
        number: WP_NUM[point.id] ?? "—",
        title: point.titulo,
        local: point.local,
        address: point.endereco,
        description: point.descricao,
        image: point.imagem,
        point: null,
        coords: point.coords,
      }));

  useEffect(() => {
    const refreshBikeProfile = () => setBikeProfile(getStoredBikeProfile(user?.uid));
    refreshBikeProfile();
    window.addEventListener("storage", refreshBikeProfile);
    return () => window.removeEventListener("storage", refreshBikeProfile);
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setTrips([]);
      return;
    }

    return watchTrips(
      user.uid,
      setTrips,
      () => setTrips([]),
    );
  }, [user?.uid]);

  const openSavedPoint = (point: RoutePoint | null) => {
    if (!point) {
      abrirRota(PONTO_ENCONTRO.id, PONTO_ENCONTRO.coords, PONTO_ENCONTRO.local);
      return;
    }

    const destination = point.coordinates
      ? `${point.coordinates.lat},${point.coordinates.lng}`
      : point.address || point.label;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
      "_blank",
      "noopener",
    );
  };

  const compartilhar = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(CONVITE_WHATSAPP())}`;
    window.open(url, "_blank", "noopener");
  };

  const panelTitle: Record<Exclude<OperationalPanel, null>, string> = {
    routes: "Gerenciar roteiros",
    expenses: "Registrar gasto",
    garage: "Garagem",
    profile: "Perfil",
    settings: "Configurações",
  };

  const panelContent = operationalPanel === "routes" ? <RoutesView />
    : operationalPanel === "expenses" ? <ExpensesView />
    : operationalPanel === "garage" ? <GarageView onOpenSettings={() => setOperationalPanel("settings")} />
    : operationalPanel === "profile" ? <ProfileView />
    : operationalPanel === "settings" ? <SettingsView />
    : null;

  const toggle = (id: string) =>
    setChecklist((c) => ({ ...c, [id]: !c[id] }));

  const heroRef = useInView<HTMLDivElement>();

  return (
    <div className="min-h-screen topo-grid pb-20">
      {/* ===== CONTEÚDO DA ABA MISSÃO ===== */}
      {aba === "missao" && (
      <>
      {/* ===== HERO-MISSÃO ===== */}
      <header className="relative overflow-hidden">
        <img
          src="/manus-storage/aratuba_hero_85c63f2d.png"
          alt="Serras do Maciço de Baturité"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10 flex min-h-[72vh] flex-col justify-end pb-10 pt-16">
          <div
            ref={heroRef}
            className="fade-up"
          >
            <div
              className="mb-4 flex items-center gap-3"
              role="button"
              tabIndex={0}
              aria-label="Gerenciar roteiros da missão"
              onClick={() => setOperationalPanel("routes")}
              onKeyDown={(event) => event.key === "Enter" && setOperationalPanel("routes")}
            >
              <img
                src="/manus-storage/aratuba_logo_63f7d2ab.png"
                alt="Missão Aratuba"
                className="h-14 w-14 rounded-full border-2 border-phosphor bg-background p-0.5"
              />
              <div>
                <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-[0.12em] text-foreground">
                  Missão <span className="text-phosphor">{activeTrip?.name || "Aratuba"}</span>
                </h1>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {activeTrip?.tag || "Operação · 1 dia · 248 km · sem pedágio"}
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-foreground/85">
              {activeTrip
                ? <>Roteiro salvo com <strong className="text-phosphor">{activeTrip.points.length} pontos</strong>. Partida, paradas e destino ficam organizados nesta missão.</>
                : <>Briefing da missão: saída de Fortaleza às <strong className="text-phosphor">0800H</strong>. Alvo: a serra mais alta do Ceará, a 960 m. Café na subida, água fria da Surubaca e pôr do sol dourando a caatinga.</>}
            </p>

            <div className="mt-6 grid grid-cols-4 gap-2 border border-border bg-background/70 p-3 backdrop-blur-sm">
              {[
                { k: "Saída", v: activeTrip ? (tripStart?.label || "Pendente") : "0800H" },
                { k: "Paradas", v: activeTrip ? String(tripStops.length) : "124 km" },
                { k: activeTrip ? "Destino" : "Temp.", v: activeTrip ? (tripDestination?.label || "Pendente") : "-8 °C" },
                { k: activeTrip ? "Moto" : "Custo", v: activeTrip ? displayedBike : "R$ 100+" },
              ].map((it) => (
                <button
                  key={it.k}
                  type="button"
                  className="text-center"
                  aria-label={it.k === "Moto" ? "Abrir configurações da moto" : undefined}
                  onClick={() => it.k === "Moto" && setOperationalPanel("settings")}
                >
                  <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    {it.k}
                  </div>
                  <div className="font-display text-base font-bold text-phosphor">
                    {it.v}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => openSavedPoint(tripStart)}
              className="tac-btn mt-6 w-full bg-phosphor text-primary-foreground"
            >
              <Navigation className="h-5 w-5" />
              Ir ao ponto de encontro
            </button>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center">
              {activeTrip ? `ROTEIRO SALVO · ${activeTrip.tag || "PLANEJADA"}` : "WP-00 · Mix Mateus · Maranguape · 0745H"}
            </p>
          </div>
        </div>
      </header>

      {/* ===== PONTO DE ENCONTRO ===== */}
      <section className="container pb-8 pt-6">
          <div
            ref={heroRef}
            className="fade-up brief-panel"
          >
            <div className="panel-header">
              <span>WP-00 · Embarque</span>
            <span>{activeTrip ? "ROTEIRO SALVO" : horaFmt(PONTO_ENCONTRO.hora)}</span>
            </div>
          <div className="relative p-5">
            <span className="wp-number absolute -top-1 right-2">00</span>
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-phosphor" />
              <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                {tripStart?.label || PONTO_ENCONTRO.titulo}
              </h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {(tripStart?.coordinates?.lat ?? PONTO_ENCONTRO.coords[0]).toFixed(4)} N ·{" "}
              {Math.abs(tripStart?.coordinates?.lng ?? PONTO_ENCONTRO.coords[1]).toFixed(4)} E
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {tripStart?.address || PONTO_ENCONTRO.endereco}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              {activeTrip ? "Partida registrada no roteiro salvo desta missão." : PONTO_ENCONTRO.descricao}
            </p>
            <button
              onClick={() => openSavedPoint(tripStart)}
              className="tac-btn mt-4 w-full bg-phosphor text-primary-foreground"
            >
              <Navigation className="h-5 w-5" />
              IR
            </button>
          </div>
        </div>
      </section>

      {/* ===== WAYPOINTS ===== */}
      <section className="container pb-8">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em]">
            Waypoints
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {doneCount}/{activeTrip ? missionWaypoints.length : total} confirmados
          </span>
        </div>

        <div className="space-y-6">
          {missionWaypoints.map((p, i) => {
            const done = !!checklist[p.id];
            return (
              <article
                key={p.id}
                className="fade-up brief-panel"
                data-stagger={i}
              >
                <div className="panel-header">
                  <span>{p.typeLabel}</span>
                  <span className="text-amber-alert">{p.schedule}</span>
                </div>
                <div className="relative p-4">
                  <span className="wp-number absolute -top-2 right-2">
                    {p.number}
                  </span>

                  {p.image && (
                    <div className="relative mb-3 overflow-hidden border border-border">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="h-36 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    </div>
                  )}

                  <h3 className="font-display text-lg font-bold uppercase tracking-wide leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {p.local} · {p.address}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {p.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => p.point ? openSavedPoint(p.point) : abrirRota(p.id, p.coords ?? PONTO_ENCONTRO.coords, p.local)}
                      className="tac-btn flex-1 bg-phosphor text-primary-foreground"
                    >
                      <Navigation className="h-4 w-4" />
                      Ir
                    </button>
                    <button
                      onClick={() => toggle(p.id)}
                      aria-pressed={done}
                      className={`tac-btn w-[96px] border ${
                        done
                          ? "border-phosphor bg-phosphor/15 text-phosphor"
                          : "border-border bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      {done ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {done && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-phosphor">
                      WP-{p.number} confirmado · carimbo registrado
                    </p>
                  )}
                </div>
              </article>
            );
          })}

          {/* Volta */}
          <div className="fade-up brief-panel amber">
            <div className="panel-header">
              <span className="text-amber-alert">Exfil · Extração</span>
              <span>{CHEGADA.hora}</span>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Moon className="h-4 w-4 text-amber-alert" />
                <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                  {CHEGADA.titulo}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">
                {CHEGADA.descricao}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LOGÍSTICA + KIT ===== */}
      <section className="container space-y-6 pb-8">
        <div className="border-t border-border pt-8">
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em]">
            Logística &amp; kit
          </h2>
        </div>

        {/* Custos */}
        <div
          className="brief-panel"
          role="button"
          tabIndex={0}
          aria-label="Abrir registros de gastos"
          onClick={() => setOperationalPanel("expenses")}
          onKeyDown={(event) => event.key === "Enter" && setOperationalPanel("expenses")}
        >
          <div className="panel-header">
            <span>Suprimentos · custo por efetivo</span>
            <Wallet className="h-3.5 w-3.5" />
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/60">
                {[
                  ["Combustível (ida/volta, div.)", "R$ 30–60"],
                  ["Café de subida", "R$ 15–25"],
                  ["Rancho (almoço regional)", "R$ 40–70"],
                  ["Café da tarde", "R$ 15–25"],
                  ["Cachoeira (entrada)", "R$ 0–10"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 text-foreground/85">{k}</td>
                    <td className="py-2 text-right font-mono font-semibold text-phosphor">
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 border-t border-phosphor/40 pt-2 flex items-center justify-between">
              <span className="font-display font-bold uppercase tracking-wide">
                Total / efetivo
              </span>
              <span className="font-display text-xl font-bold text-amber-alert">
                R$ 100–190
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Base: viatura compartilhada 2–4 efetivos
            </p>
          </div>
        </div>

        {/* Kit */}
        <div
          className="brief-panel amber"
          role="button"
          tabIndex={0}
          aria-label="Abrir garagem da moto"
          onClick={() => setOperationalPanel("garage")}
          onKeyDown={(event) => event.key === "Enter" && setOperationalPanel("garage")}
        >
          <div className="panel-header">
            <span className="text-amber-alert">Kit de sobrevivência</span>
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <div className="p-4 space-y-3 text-sm text-foreground/85">
            <p>
              <strong className="text-amber-alert">Temperatura:</strong> a
              serra opera 5–8 °C abaixo de Fortaleza — corta-vento ou casaco
              leve é obrigatório no kit.
            </p>
            <p>
              <strong className="text-amber-alert">Água (WP-05):</strong>
              roupa de banho por baixo, toalha, troca seca e tênis de trilha.
              Chinelo é proibido em operação.
            </p>
            <p>
              <strong className="text-amber-alert">Clima:</strong> em chuva
              forte, suspender a travessia da cachoeira — pedra escorrega.
            </p>
            <p>
              <strong className="text-amber-alert">Reservas:</strong> Sabor do
              Sítio opera só sáb/dom, reserva via WhatsApp.
            </p>
            <p>
              <strong className="text-amber-alert">Exfil:</strong> faróis
              ligados na descida da CE-356. Chegada em base ~2000H.
            </p>
          </div>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center">
          Condições mudam com o clima · confirmar via{" "}
          <a
            href="https://www.instagram.com/aratuba.ce/"
            target="_blank"
            rel="noreferrer"
            className="text-phosphor underline"
          >
            @aratuba.ce
          </a>
        </p>
      </section>
      </>
      )}

      {/* ===== BOTTOM NAV ===== */}
      <nav className="status-bar">
        <div className="container grid grid-cols-4">
          {([
            { id: "missao", label: "Missão", icon: <ClipboardList className="h-4 w-4" /> },
            { id: "mapa", label: "Mapa", icon: <MapIcon className="h-4 w-4" /> },
            { id: "equipe", label: "Equipe", icon: <Users className="h-4 w-4" /> },
            { id: "kit", label: "Kit", icon: <Backpack className="h-4 w-4" /> },
          ] as { id: Aba; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                console.log("[aba] ->", t.id);
                setAba(t.id);
              }}
              className={`flex flex-col items-center gap-0.5 py-2.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                aba === t.id
                  ? "text-phosphor"
                  : "text-muted-foreground"
              }`}
              aria-current={aba === t.id ? "page" : undefined}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ===== TELAS ===== */}
      {aba === "mapa" && (
        <div className="container pb-24 pt-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em]">
              Cartografia
            </h2>
            <button
              onClick={compartilhar}
              className="tac-btn h-10 gap-2 bg-secondary text-secondary-foreground border border-border"
            >
              <Send className="h-3.5 w-3.5" />
              Convite
            </button>
          </div>
          <WaypointMap tripPoints={activeTrip?.points} />
        </div>
      )}
      {aba === "equipe" && (
        <div className="container pb-24 pt-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOperationalPanel("profile")}
              aria-label="Abrir perfil da conta"
              className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-left"
            >
              Equipe
            </button>
            <button
              onClick={compartilhar}
              className="tac-btn h-10 gap-2 bg-secondary text-secondary-foreground border border-border"
            >
              <Send className="h-3.5 w-3.5" />
              Convite
            </button>
          </div>
          <Equipe />
        </div>
      )}
      {aba === "kit" && (
        <div className="container pb-24 pt-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOperationalPanel("settings")}
              aria-label="Abrir configurações da moto"
              className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-left"
            >
              Kit de missão
            </button>
            <button
              onClick={compartilhar}
              className="tac-btn h-10 gap-2 bg-secondary text-secondary-foreground border border-border"
            >
              <Send className="h-3.5 w-3.5" />
              Convite
            </button>
          </div>
          <Kit />
        </div>
      )}

      <Dialog
        open={operationalPanel !== null}
        onOpenChange={(open) => !open && setOperationalPanel(null)}
      >
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-4xl overflow-y-auto border-border bg-background p-0 text-foreground">
          <DialogTitle className="sr-only">
            {operationalPanel ? panelTitle[operationalPanel] : "Painel operacional"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Fluxo operacional do MotoTracker aberto sem alterar a composição da missão.
          </DialogDescription>
          {panelContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}
