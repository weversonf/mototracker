import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronRight, CircleDollarSign, Droplets, Fuel, Plus, Route, WalletCards, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { estimateFuelLiters, formatLiters, getConsumptionKmPerLiter, getStoredBikeProfile } from "@/lib/bikeProfile";
import { formatExpenseAmount, validateExpenseDraft, type ExpenseCategory } from "@/lib/expenseModel";

type ExpenseRow = {
  category: ExpenseCategory;
  label: string;
  meta: string;
  location?: string;
  value: string;
  amount: number;
  tone: "fuel" | "service" | "wash";
};

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
  const [location, setLocation] = useState("");
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [consumptionKmPerLiter, setConsumptionKmPerLiter] = useState<string>("");
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);

  useEffect(() => {
    setConsumptionKmPerLiter(getStoredBikeProfile(user?.uid).consumptionKmPerLiter);

    if (!user?.uid) {
      setSavedLocations([]);
      return;
    }

    try {
      const stored = window.localStorage.getItem(`mototracker:expense-locations:${user.uid}`);
      const parsed = stored ? JSON.parse(stored) : [];
      setSavedLocations(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 12) : []);
    } catch {
      setSavedLocations([]);
    }
  }, [user?.uid]);

  const estimatedLiters = useMemo(
    () => estimateFuelLiters(Number(distanceKm.replace(",", ".")), consumptionKmPerLiter),
    [distanceKm, consumptionKmPerLiter],
  );
  const visibleExpenses = filter === "Todos" ? expenses : expenses.filter((expense) => expense.category === filter);
  const consumption = getConsumptionKmPerLiter(consumptionKmPerLiter);
  const totalAmount = useMemo(() => expenses.reduce((total, expense) => total + expense.amount, 0), [expenses]);

  const openRegister = (category?: ExpenseCategory) => {
    setEntryType(category ?? entryType);
    setShowRegister(true);
  };

  const closeRegister = () => {
    setShowRegister(false);
    setDescription("");
    setLocation("");
    setAmount("");
    setDistanceKm("");
  };

  const saveExpense = () => {
    try {
      const expense = validateExpenseDraft({ category: entryType, description, amount });
      const normalizedLocation = location.trim().replace(/\s+/g, " ");
      const litersMeta = entryType === "Combustível" && estimatedLiters !== null ? ` · ${formatLiters(estimatedLiters)} L estimados` : "";
      const tone = categories.find((category) => category.label === entryType)?.tone ?? "service";
      const meta = ["Hoje", normalizedLocation, litersMeta.replace(/^ · /, "")].filter(Boolean).join(" · ");
      setExpenses((current) => [
        {
          category: expense.category,
          label: expense.description,
          location: normalizedLocation || undefined,
          meta,
          value: expense.formattedAmount,
          amount: expense.amount,
          tone,
        },
        ...current,
      ]);

      if (normalizedLocation && user?.uid) {
        const nextLocations = [
          normalizedLocation,
          ...savedLocations.filter((item) => item.localeCompare(normalizedLocation, undefined, { sensitivity: "accent" }) !== 0),
        ].slice(0, 12);
        setSavedLocations(nextLocations);
        try {
          window.localStorage.setItem(`mototracker:expense-locations:${user.uid}`, JSON.stringify(nextLocations));
        } catch {
          // O lançamento continua disponível na sessão mesmo que o navegador bloqueie armazenamento local.
        }
      }

      toast.success("Gasto registrado", {
        description: normalizedLocation ? `${expense.description} · ${normalizedLocation}` : `${expense.description} · ${expense.formattedAmount}`,
      });
      closeRegister();
    } catch (error) {
      toast.error("Revise o lançamento", {
        description: error instanceof Error ? error.message : "Não foi possível registrar o gasto.",
      });
    }
  };

  return (
    <>
      <section className="page-header">
        <div>
          <p className="eyebrow">GASTOS / MINHA MOTO</p>
          <h1 className="page-header__title--compact page-header__title--single">Gastos da moto</h1>
          <p className="page-header__description">Registre combustível, manutenção e lavagem com descrição e valor para acompanhar sua moto.</p>
        </div>
        <button className="primary-button" onClick={() => openRegister()}>
          <Plus size={15} /> Registrar gasto
        </button>
      </section>

      <section className="finance-toolbar">
        <div>
          <p className="label-caps">PERÍODO DE ANÁLISE</p>
          <div className="period-switch">
            {["Este mês", "Últimos 3 meses"].map((item) => (
              <button
                key={item}
                className={period === item ? "period-switch__item period-switch__item--active" : "period-switch__item"}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <button className="finance-link" onClick={() => toast("Resumo exportado", { description: `Período selecionado: ${period}.` })}>
          Exportar resumo <ArrowUpRight size={14} />
        </button>
      </section>

      <Dialog open={showRegister} onOpenChange={(open) => (open ? setShowRegister(true) : closeRegister())}>
        <DialogContent className="expense-lightbox" showCloseButton={false}>
          <button type="button" className="expense-lightbox__close" aria-label="Fechar novo registro" onClick={closeRegister}>
            <X size={18} />
          </button>
          <DialogHeader className="expense-lightbox__header">
            <p className="label-caps">NOVO LANÇAMENTO</p>
            <DialogTitle className="expense-lightbox__title">Registrar gasto</DialogTitle>
            <DialogDescription className="expense-lightbox__description">
              Informe a categoria, o que foi pago, o local e o valor para incluir o lançamento no seu histórico atual.
            </DialogDescription>
          </DialogHeader>
          <div className="expense-lightbox__body expense-entry-panel__form">
            <div className="entry-type-grid">
              {categories.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    type="button"
                    key={action.label}
                    className={entryType === action.label ? "entry-type entry-type--active" : "entry-type"}
                    onClick={() => setEntryType(action.label)}
                  >
                    <span className={`expense-row__icon expense-row__icon--${action.tone}`}>
                      <Icon size={16} />
                    </span>
                    {action.label}
                  </button>
                );
              })}
            </div>
            <div className="expense-form-grid">
              <label>
                <span>O que foi pago?</span>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={entryType === "Combustível" ? "Ex.: Abastecimento" : entryType === "Manutenção" ? "Ex.: Troca de óleo" : "Ex.: Lavagem completa"}
                  autoFocus
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Valor total</span>
                <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Ex.: 185,90" inputMode="decimal" autoComplete="off" />
              </label>
              <label className="expense-form-grid__wide">
                <span>
                  Local ou estabelecimento <small>(opcional)</small>
                </span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Ex.: Oficina do Zé"
                  list="expense-location-options"
                  autoComplete="off"
                />
                <datalist id="expense-location-options">
                  {savedLocations.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </label>
            </div>
            <div className="expense-location-picker">
              {savedLocations.length ? (
                <>
                  <span>Locais recentes</span>
                  <div>
                    {savedLocations.map((item) => (
                      <button
                        type="button"
                        key={item}
                        className={location === item ? "expense-location-chip expense-location-chip--active" : "expense-location-chip"}
                        onClick={() => setLocation(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <span>Depois do primeiro registro, seus locais usados aparecerão aqui para seleção rápida.</span>
              )}
            </div>
            {entryType === "Combustível" && (
              <div className="fuel-estimate">
                <label>
                  <span>Distância planejada (opcional)</span>
                  <input value={distanceKm} onChange={(event) => setDistanceKm(event.target.value)} placeholder="Ex.: 350 km" inputMode="decimal" autoComplete="off" />
                </label>
                <div className="fuel-estimate__result">
                  {consumption === null ? (
                    <span>Cadastre o consumo da moto em Configurações para estimar litros.</span>
                  ) : estimatedLiters === null ? (
                    <span>
                      Consumo cadastrado: <strong>{consumption} km/L</strong>.
                    </span>
                  ) : (
                    <span>
                      Para <strong>{distanceKm} km</strong>, sua moto deve usar cerca de <strong>{formatLiters(estimatedLiters)} L</strong> a {consumption} km/L.
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="entry-actions">
              <button type="button" className="secondary-button" onClick={closeRegister}>
                Cancelar
              </button>
              <button type="button" className="primary-button" onClick={saveExpense}>
                Salvar gasto <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="finance-overview-grid">
        <article className="panel finance-total-card">
          <div className="finance-total-card__top">
            <div>
              <p className="label-caps">TOTAL NO MÊS</p>
              <strong>{formatExpenseAmount(totalAmount)}</strong>
              <span>{expenses.length ? "Acompanhe os registros adicionados nesta sessão." : "Comece registrando seu primeiro gasto."}</span>
            </div>
            <div className="finance-total-card__period">
              <CalendarDays size={15} /> PERÍODO ATUAL
            </div>
          </div>
          <div className="finance-total-card__footer">
            <span>
              <strong>{expenses.length.toString().padStart(2, "0")}</strong> lançamentos
            </span>
            <span>
              <strong>—</strong> km rodados
            </span>
            <span>
              <strong>—</strong> por km
            </span>
          </div>
        </article>
        <article className="panel finance-distribution-card">
          <div className="finance-distribution-card__head">
            <div>
              <p className="label-caps">DISTRIBUIÇÃO</p>
              <h2>Seus gastos por categoria</h2>
            </div>
            <CircleDollarSign size={21} />
          </div>
          <div className="finance-distribution">
            <div className="finance-donut" aria-label="Distribuição dos gastos por categoria" />
            <div className="finance-legend">
              <span>
                <i className="expense-dot expense-dot--fuel" />
                <b>Combustível</b>
                <strong>Sem registros</strong>
              </span>
              <span>
                <i className="expense-dot expense-dot--service" />
                <b>Manutenção</b>
                <strong>Sem registros</strong>
              </span>
              <span>
                <i className="expense-dot expense-dot--wash" />
                <b>Lavagem</b>
                <strong>Sem registros</strong>
              </span>
            </div>
          </div>
        </article>
      </div>

      <div className="expenses-layout">
        <article className="panel expenses-list-card">
          <div className="expenses-list-card__head">
            <div>
              <p className="label-caps">HISTÓRICO FINANCEIRO</p>
              <h2>Últimos lançamentos</h2>
            </div>
            <WalletCards size={22} />
          </div>
          <div className="expense-filters">
            {(["Todos", "Combustível", "Manutenção", "Lavagem"] as const).map((item) => (
              <button key={item} className={filter === item ? "expense-filter expense-filter--active" : "expense-filter"} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="expense-list">
            {visibleExpenses.length ? (
              visibleExpenses.map((expense) => {
                const Icon = iconForExpense(expense.category);
                return (
                  <button className="expense-row" key={`${expense.label}-${expense.meta}`} onClick={() => toast("Registro selecionado", { description: `${expense.label} · ${expense.value}` })}>
                    <span className={`expense-row__icon expense-row__icon--${expense.tone}`}>
                      <Icon size={17} />
                    </span>
                    <span className="expense-row__content">
                      <strong>{expense.label}</strong>
                      <small>
                        {expense.category} · {expense.meta}
                      </small>
                    </span>
                    <strong className="expense-row__value">{expense.value}</strong>
                    <ChevronRight size={15} />
                  </button>
                );
              })
            ) : (
              <div className="empty-state">
                <WalletCards size={22} />
                <strong>Nenhum gasto registrado</strong>
                <span>Use o botão “Registrar gasto” para iniciar seu histórico.</span>
              </div>
            )}
          </div>
        </article>
        <aside className="expense-side">
          <article className="panel quick-expense-card">
            <div className="panel-heading">
              <div>
                <p className="label-caps">REGISTRAR AGORA</p>
                <h2>O que aconteceu?</h2>
              </div>
              <Plus size={21} />
            </div>
            <div className="quick-expense-actions">
              {categories.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} className="quick-expense-action" onClick={() => openRegister(action.label)}>
                    <span className={`expense-row__icon expense-row__icon--${action.tone}`}>
                      <Icon size={17} />
                    </span>
                    <span>{action.label}</span>
                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </div>
          </article>
          <article className="panel trip-cost-card">
            <div className="panel-heading">
              <div>
                <p className="label-caps">CUSTO DA ÚLTIMA VIAGEM</p>
                <h2>Sem viagem registrada</h2>
              </div>
              <Route size={21} />
            </div>
            <div className="trip-cost-card__total">
              <strong>—</strong>
              <span>Os custos aparecerão quando você registrar viagens e gastos.</span>
            </div>
          </article>
        </aside>
      </div>
    </>
  );
}
