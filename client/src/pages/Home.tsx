/* MotoTracker — Industrial Editorial Control Center: graphite cockpit surfaces, asymmetric rhythm, Pulse Orange #F0643C, Space Grotesk + DM Sans. */

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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
  Fuel,
  Gauge,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Route,
  Receipt,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
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
  const [filter, setFilter] = useState("Salvas");
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
      const routes = [{ name: "Serra do Rastro", meta: "14,8 km · 04 paradas", tag: "Favorita", icon: Route }, { name: "Costeira Norte", meta: "46,8 km · 06 paradas", tag: "Último rolê", icon: CalendarDays }, { name: "Vale dos Ventos", meta: "82,1 km · 08 paradas", tag: "Explorar", icon: ClipboardCheck }];
  return <><PageHeader eyebrow="VIAGENS / PLANEJAMENTO" title={<>Planeje o próximo<br /><em>trecho da estrada.</em></>} description="Crie viagens, organize paradas e mantenha um histórico dos caminhos que já percorreu." action={<button className="primary-button" onClick={() => toast("Planejador aberto", { description: "Defina data, destino, paradas e orçamento da viagem." })}><Plus size={15} /> Nova viagem</button>} /><div className="section-tabs" role="tablist">{["Planejadas", "Histórico", "Descobrir"].map((item) => <button key={item} className={filter === item ? "section-tab section-tab--active" : "section-tab"} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="routes-layout"><div className="route-list">{routes.map((route, index) => { const Icon = route.icon; const isActive = activeRoute === route.name; return <article className={`route-list-card panel ${isActive ? "route-list-card--active" : ""}`} key={route.name}><div className="route-list-card__index">0{index + 1}</div><div className="route-list-card__icon"><Icon size={20} /></div><div className="route-list-card__content"><div className="route-list-card__top"><div><p className="label-caps">{route.tag}</p><h2>{route.name}</h2></div><span className="route-list-card__distance">{route.meta}</span></div><div className="route-list-card__line"><span><CircleDot size={12} /> 04 paradas planejadas</span><button className="text-button" onClick={() => { setActiveRoute(route.name); toast.success("Viagem selecionada", { description: `${route.name} está pronta para planejamento.` }); }}>{isActive ? <><Check size={14} /> Selecionada</> : <>Selecionar <ChevronRight size={14} /></>}</button></div></div></article>; })}</div><aside className="panel route-summary"><div className="trip-plan-visual"><div className="trip-plan-visual__head"><span>TRAÇADO SALVO</span><CalendarDays size={17} /></div><div className="trip-plan-visual__line"><svg viewBox="0 0 500 118" preserveAspectRatio="none" aria-hidden="true"><path className="trip-trace-shadow" d="M 18 83 C 101 16, 167 104, 245 55 S 354 18, 482 64" /><path className="trip-trace-line" d="M 18 83 C 101 16, 167 104, 245 55 S 354 18, 482 64" /></svg><span><i />Florianópolis</span><span><i />Mirante da Serra</span><span><i />Serra do Rastro</span></div></div><div className="route-summary__body"><p className="label-caps">RESUMO DA VIAGEM</p><h2>{activeRoute ?? "Serra do Rastro"}</h2><div className="route-summary__stats"><span><strong>04</strong> paradas</span><span><strong>03</strong> trechos</span><span><strong>R$ 280</strong> orçamento</span></div><button className="secondary-button" onClick={() => toast.success("Planejamento salvo", { description: `${activeRoute ?? "Serra do Rastro"} está pronta para receber seus registros.` })}><ClipboardCheck size={15} /> Editar planejamento</button></div></aside></div></>;
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
