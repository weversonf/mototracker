import { useEffect, useState } from "react";
import { Bell, Bike, CalendarDays, Check, Download, Fuel, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { bikeProfileStorageKey, DEFAULT_BIKE_PROFILE, getConsumptionKmPerLiter, getPlateReminder, getStoredBikeProfile, normalizeBikeProfile, type BikeProfile } from "@/lib/bikeProfile";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const BRAZILIAN_STATES = ["", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export function SettingsView() {
  const { user } = useAuth();
  const [bike, setBike] = useState<BikeProfile>(DEFAULT_BIKE_PROFILE);
  const { canInstall, isInstalled, install } = usePwaInstall();

  useEffect(() => {
    setBike(getStoredBikeProfile(user?.uid));
  }, [user?.uid]);

  const updateBike = (field: keyof BikeProfile, value: string) => setBike((current) => ({ ...current, [field]: value }));
  const saveBike = () => {
    const normalized = normalizeBikeProfile(bike);
    if (!normalized.model) {
      toast.error("Informe o modelo da moto", { description: "Ex.: Honda CB 500X, Yamaha MT-07 ou sua identificação preferida." });
      return;
    }
    if (getConsumptionKmPerLiter(normalized.consumptionKmPerLiter) === null) {
      toast.error("Informe o consumo médio", { description: "Use km/L, por exemplo 35 para uma moto que faz 35 km por litro." });
      return;
    }
    try {
      window.localStorage.setItem(bikeProfileStorageKey(user?.uid), JSON.stringify(normalized));
      setBike(normalized);
      toast.success("Moto cadastrada", { description: "Os dados ficam associados a este dispositivo e à conta conectada." });
    } catch {
      toast.error("Não foi possível salvar", { description: "Tente novamente em alguns instantes." });
    }
  };

  const consumption = getConsumptionKmPerLiter(bike.consumptionKmPerLiter);
  const requestInstall = async () => {
    const outcome = await install();
    if (outcome === "accepted" || outcome === "installed") {
      toast.success("MotoTracker instalado", { description: "O aplicativo pode ser aberto pela tela inicial do seu dispositivo." });
      return;
    }
    if (outcome === "dismissed") {
      toast("Instalação cancelada", { description: "Você pode instalar o MotoTracker quando quiser por este mesmo botão." });
      return;
    }
    toast("Instalação indisponível agora", { description: "No iPhone/iPad, use Compartilhar > Adicionar à Tela de Início. No Android, aguarde o aviso de instalação do navegador." });
  };
  return <>
    <section className="page-header"><div><p className="eyebrow">SISTEMA / CONTROLE</p><h1 className="page-header__title--single">Configurações</h1><p className="page-header__description">Cadastre sua moto, organize dados de consumo e mantenha seus lembretes documentais à vista.</p></div></section>
    <div className="settings-grid settings-grid--bike"><article className="panel settings-card bike-settings-card"><div className="panel-heading"><div><p className="label-caps">SUA MOTO</p><h2>Dados da companheira</h2></div><Bike size={21} /></div><div className="bike-settings-form"><label><span>Modelo da moto</span><input value={bike.model} onChange={(event) => updateBike("model", event.target.value)} placeholder="Ex.: Honda CB 500X" autoComplete="off" /></label><label><span>Apelido (opcional)</span><input value={bike.nickname} onChange={(event) => updateBike("nickname", event.target.value)} placeholder="Ex.: Minha companheira" autoComplete="off" /></label><label><span>Final da placa</span><input value={bike.plateFinal} onChange={(event) => updateBike("plateFinal", event.target.value)} placeholder="0 a 9" inputMode="numeric" maxLength={1} autoComplete="off" /></label><label><span>Estado (UF)</span><select value={bike.state} onChange={(event) => updateBike("state", event.target.value)}>{BRAZILIAN_STATES.map((state) => <option key={state || "blank"} value={state}>{state || "Selecione"}</option>)}</select></label><label className="bike-settings-form__wide"><span>Consumo médio (km/L)</span><input value={bike.consumptionKmPerLiter} onChange={(event) => updateBike("consumptionKmPerLiter", event.target.value)} placeholder="Ex.: 35" inputMode="decimal" autoComplete="off" /><small>{consumption === null ? "Informe quantos quilômetros sua moto percorre por litro." : `Consumo atual: ${consumption} km/L. O valor será usado como estimativa nos lançamentos de combustível.`}</small></label></div><button className="primary-button" onClick={saveBike}><Check size={15} /> Salvar dados da moto</button></article><article className="panel settings-card settings-card--accent bike-reminder-card"><div className="settings-card__icon"><CalendarDays size={18} /></div><p className="label-caps">DOCUMENTAÇÃO</p><h2>{bike.plateFinal ? `Placa final ${bike.plateFinal}` : "Organize seus lembretes"}</h2><p className="settings-card__copy">{getPlateReminder(bike)}</p><p className="settings-card__notice">Os calendários de IPVA e licenciamento variam por estado e ano. Confirme sempre no canal oficial do Detran ou da Secretaria da Fazenda.</p></article></div>
    <div className="settings-grid"><article className="panel settings-card"><div className="panel-heading"><div><p className="label-caps">APARÊNCIA</p><h2>Interface</h2></div><SlidersHorizontal size={21} /></div>{["Modo noturno automático", "Mostrar custo por quilômetro", "Compactar cartões"].map((label, index) => <div className="setting-row setting-row--static" key={label}><span><strong>{label}</strong><small>{index === 0 ? "Ativo entre 18h e 06h" : "Ativo no dashboard principal"}</small></span><span className={`toggle ${index < 2 ? "toggle--on" : ""}`}><span /></span></div>)}</article><article className="panel settings-card settings-card--accent"><div className="settings-card__icon"><Bell size={18} /></div><p className="label-caps">CENTRAL DE ALERTAS</p><h2>Você está em dia.</h2><p className="settings-card__copy">Nenhuma notificação crítica pendente para a sua moto ou para as viagens salvas.</p><button className="secondary-button" onClick={() => toast("Tudo em dia", { description: "Nenhum alerta novo encontrado." })}>Verificar novamente <Fuel size={15} /></button></article><article className="panel settings-card pwa-install-card"><div className="settings-card__icon"><Download size={18} /></div><p className="label-caps">APLICATIVO</p><h2>{isInstalled ? "Aplicativo instalado" : "Instale o MotoTracker"}</h2><p className="settings-card__copy">{isInstalled ? "O MotoTracker já está pronto para abrir como aplicativo no seu dispositivo." : "Adicione o MotoTracker à tela inicial para abrir em tela cheia e manter o acesso rápido às suas viagens."}</p><button className="secondary-button install-app-button" onClick={() => void requestInstall()} disabled={isInstalled}><Download size={15} /> {isInstalled ? "Já instalado" : canInstall ? "Instalar aplicativo" : "Instalar aplicativo"}</button></article></div>
  </>;
}
