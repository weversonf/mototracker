import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronRight, CircleDollarSign, Droplets, Fuel, Plus, Route, WalletCards, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { bikeProfileStorageKey, estimateFuelLiters, formatLiters, getConsumptionKmPerLiter, DEFAULT_BIKE_PROFILE, normalizeBikeProfile } from "@/lib/bikeProfile";
import { validateExpenseDraft, type ExpenseCategory } from "@/lib/expenseModel";

type ExpenseRow = {
  category: ExpenseCategory;
  label: string;
  meta: string;
  value: string;
  tone: "fuel" | "service" | "wash";
};

const seededExpenses: ExpenseRow[] = [
  { category: "Combustível", label: "Posto Graal", meta: "Hoje · 32,4 L", value: "R$ 214,60", tone: "fuel" },
  { category: "Manutenção", label: "Troca de óleo", meta: "12 jun · 8.000 km", value: "R$ 140,00", tone: "service" },
  { category: "Lavagem", label: "Lavagem completa", meta: "08 jun · Capricho Moto", value: "R$ 56,00", tone: "wash" },
  { category: "Combustível", label: "Shell Avenida", meta: "04 jun · 21,7 L", value: "R$ 75,40", tone: "fuel" },
];

const categories: { label: ExpenseCategory; icon: typeof Fuel; tone: ExpenseRow["tone"] }[] = [
  { label: "Combustível", icon: Fuel, tone: "fuel" },
  { label: "Manutenção", icon: Wrench, tone: "service" },
  { label: "Lavagem", icon: Droplets, tone: "wash" },
];

function iconForExpense(category: ExpenseCategory) {
  return category === "Combustível" ? Fuel : category === "Manutenção" ? Wrench : Droplets;
}

export function ExpensesView() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"Todos" | ExpenseCategory>("Todos");
  const [period, setPeriod] = useState("Este mês");
  const [entryType, setEntryType] = useState<ExpenseCategory>("Combustível");
  const [showRegister, setShowRegister] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [consumptionKmPerLiter, setConsumptionKmPerLiter] = useState<string>("");
  const [expenses, setExpenses] = useState<ExpenseRow[]>(seededExpenses);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(bikeProfileStorageKey(user?.uid));
      if (!stored) return;
      const profile = normalizeBikeProfile({ ...DEFAULT_BIKE_PROFILE, ...JSON.parse(stored) });
      setConsumptionKmPerLiter(profile.consumptionKmPerLiter);
    } catch {
      setConsumptionKmPerLiter("");
    }
  }, [user?.uid]);

  const estimatedLiters = useMemo(() => estimateFuelLiters(Number(distanceKm.replace(",", ".")), consumptionKmPerLiter), [distanceKm, consumptionKmPerLiter]);
  const visibleExpenses = filter === "Todos" ? expenses : expenses.filter((expense) => expense.category === filter);
  const consumption = getConsumptionKmPerLiter(consumptionKmPerLiter);

  const openRegister = (category?: ExpenseCategory) => {
    setEntryType(category ?? entryType);
    setShowRegister(true);
  };

  const closeRegister = () => {
    setShowRegister(false);
    setDescription("");
    setAmount("");
    setDistanceKm("");
  };

  const saveExpense = () => {
    try {
      const expense = validateExpenseDraft({ category: entryType, description, amount });
      const litersMeta = entryType === "Combustível" && estimatedLiters !== null ? ` · ${formatLiters(estimatedLiters)} L estimados` : "";
      const tone = categories.find((category) => category.label === entryType)?.tone ?? "service";
      setExpenses((current) => [{ category: expense.category, label: expense.description, meta: `Hoje${litersMeta}`, value: expense.formattedAmount, tone }, ...current]);
      toast.success("Gasto registrado", { description: `${expense.description} · ${expense.formattedAmount}` });
      closeRegister();
    } catch (error) {
      toast.error("Revise o lançamento", { description: error instanceof Error ? error.message : "Não foi possível registrar o gasto." });
    }
  };

  return <>
    <section className="page-header"><div><p className="eyebrow">GASTOS / MINHA MOTO</p><h1>Saiba quanto custa<br /><em>manter a estrada.</em></h1><p className="page-header__description">Registre combustível, manutenção e lavagem com descrição e valor para acompanhar sua moto.</p></div><button className="primary-button" onClick={() => openRegister()}><Plus size={15} /> Registrar gasto</button></section>
    <section className="finance-toolbar"><div><p className="label-caps">PERÍODO DE ANÁLISE</p><div className="period-switch">{["Este mês", "Últimos 3 meses"].map((item) => <button key={item} className={period === item ? "period-switch__item period-switch__item--active" : "period-switch__item"} onClick={() => setPeriod(item)}>{item}</button>)}</div></div><button className="finance-link" onClick={() => toast("Resumo exportado", { description: `Período selecionado: ${period}.` })}>Exportar resumo <ArrowUpRight size={14} /></button></section>
    {showRegister && <article className="panel expense-entry-panel"><div><p className="label-caps">NOVO LANÇAMENTO</p><h2>Registrar gasto</h2><p>Informe a categoria, o que foi pago e o valor para incluir o lançamento no seu histórico atual.</p></div><div className="expense-entry-panel__form"><div className="entry-type-grid">{categories.map((action) => { const Icon = action.icon; return <button type="button" key={action.label} className={entryType === action.label ? "entry-type entry-type--active" : "entry-type"} onClick={() => setEntryType(action.label)}><span className={`expense-row__icon expense-row__icon--${action.tone}`}><Icon size={16} /></span>{action.label}</button>; })}</div><div className="expense-form-grid"><label><span>O que foi pago?</span><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder={entryType === "Combustível" ? "Ex.: Posto da avenida" : entryType === "Manutenção" ? "Ex.: Troca de óleo" : "Ex.: Lavagem completa"} autoComplete="off" /></label><label><span>Valor total</span><input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Ex.: 185,90" inputMode="decimal" autoComplete="off" /></label></div>{entryType === "Combustível" && <div className="fuel-estimate"><label><span>Distância planejada (opcional)</span><input value={distanceKm} onChange={(event) => setDistanceKm(event.target.value)} placeholder="Ex.: 350 km" inputMode="decimal" autoComplete="off" /></label><div className="fuel-estimate__result">{consumption === null ? <span>Cadastre o consumo da moto em Configurações para estimar litros.</span> : estimatedLiters === null ? <span>Consumo cadastrado: <strong>{consumption} km/L</strong>.</span> : <span>Para <strong>{distanceKm} km</strong>, sua moto deve usar cerca de <strong>{formatLiters(estimatedLiters)} L</strong> a {consumption} km/L.</span>}</div></div>}<div className="entry-actions"><button type="button" className="secondary-button" onClick={closeRegister}>Cancelar</button><button type="button" className="primary-button" onClick={saveExpense}>Salvar gasto <ChevronRight size={14} /></button></div></div></article>}
    <div className="finance-overview-grid"><article className="panel finance-total-card"><div className="finance-total-card__top"><div><p className="label-caps">TOTAL NO MÊS</p><strong>R$ 486,00</strong><span><ArrowUpRight size={13} /> R$ 52 acima do mês passado</span></div><div className="finance-total-card__period"><CalendarDays size={15} /> AGO 2026</div></div><div className="finance-total-card__footer"><span><strong>{expenses.length.toString().padStart(2, "0")}</strong> lançamentos</span><span><strong>128</strong> km rodados</span><span><strong>R$ 3,80</strong> por km</span></div></article><article className="panel finance-distribution-card"><div className="finance-distribution-card__head"><div><p className="label-caps">DISTRIBUIÇÃO</p><h2>Para onde foi o dinheiro</h2></div><CircleDollarSign size={21} /></div><div className="finance-distribution"><div className="finance-donut" aria-label="Distribuição dos gastos por categoria" /><div className="finance-legend"><span><i className="expense-dot expense-dot--fuel" /><b>Combustível</b><strong>Uso atual</strong></span><span><i className="expense-dot expense-dot--service" /><b>Manutenção</b><strong>Uso atual</strong></span><span><i className="expense-dot expense-dot--wash" /><b>Lavagem</b><strong>Uso atual</strong></span></div></div></article></div>
    <div className="expenses-layout"><article className="panel expenses-list-card"><div className="expenses-list-card__head"><div><p className="label-caps">HISTÓRICO FINANCEIRO</p><h2>Últimos lançamentos</h2></div><WalletCards size={22} /></div><div className="expense-filters">{(["Todos", "Combustível", "Manutenção", "Lavagem"] as const).map((item) => <button key={item} className={filter === item ? "expense-filter expense-filter--active" : "expense-filter"} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="expense-list">{visibleExpenses.map((expense) => { const Icon = iconForExpense(expense.category); return <button className="expense-row" key={`${expense.label}-${expense.meta}`} onClick={() => toast("Registro selecionado", { description: `${expense.label} · ${expense.value}` })}><span className={`expense-row__icon expense-row__icon--${expense.tone}`}><Icon size={17} /></span><span className="expense-row__content"><strong>{expense.label}</strong><small>{expense.category} · {expense.meta}</small></span><strong className="expense-row__value">{expense.value}</strong><ChevronRight size={15} /></button>; })}</div></article><aside className="expense-side"><article className="panel quick-expense-card"><div className="panel-heading"><div><p className="label-caps">REGISTRAR AGORA</p><h2>O que aconteceu?</h2></div><Plus size={21} /></div><div className="quick-expense-actions">{categories.map((action) => { const Icon = action.icon; return <button key={action.label} className="quick-expense-action" onClick={() => openRegister(action.label)}><span className={`expense-row__icon expense-row__icon--${action.tone}`}><Icon size={17} /></span><span>{action.label}</span><ChevronRight size={14} /></button>; })}</div></article><article className="panel trip-cost-card"><div className="panel-heading"><div><p className="label-caps">CUSTO DA ÚLTIMA VIAGEM</p><h2>Costeira Norte</h2></div><Route size={21} /></div><div className="trip-cost-card__total"><strong>R$ 178,40</strong><span>46,8 km · R$ 3,81/km</span></div><button className="text-button" onClick={() => toast("Detalhes da viagem", { description: "Veja abastecimentos e serviços associados ao rolê." })}>Ver detalhes <ChevronRight size={14} /></button></article></aside></div>
  </>;
}
