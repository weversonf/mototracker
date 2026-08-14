export type BikeProfile = {
  nickname: string;
  model: string;
  plateFinal: string;
  consumptionKmPerLiter: string;
  state: string;
};

export const DEFAULT_BIKE_PROFILE: BikeProfile = {
  nickname: "",
  model: "",
  plateFinal: "",
  consumptionKmPerLiter: "",
  state: "",
};

function parseDecimal(value: string) {
  const trimmed = value.trim();
  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function normalizeBikeProfile(profile: BikeProfile): BikeProfile {
  return {
    nickname: profile.nickname.trim().slice(0, 48),
    model: profile.model.trim().slice(0, 80),
    plateFinal: profile.plateFinal.replace(/\D/g, "").slice(-1),
    consumptionKmPerLiter: profile.consumptionKmPerLiter.trim().slice(0, 12),
    state: profile.state.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2),
  };
}

export function getConsumptionKmPerLiter(value: string) {
  return parseDecimal(value);
}

export function estimateFuelLiters(distanceKm: number, consumptionKmPerLiter: string) {
  const consumption = getConsumptionKmPerLiter(consumptionKmPerLiter);
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || consumption === null) return null;
  return distanceKm / consumption;
}

export function formatLiters(liters: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(liters);
}

export function getPlateReminder(profile: BikeProfile) {
  const { plateFinal, state } = normalizeBikeProfile(profile);

  if (!plateFinal) {
    return "Informe o final da placa para organizar seus lembretes de documentação.";
  }

  const stateLabel = state ? ` no estado ${state}` : "";
  return `Final ${plateFinal} registrado${stateLabel}. Consulte o calendário oficial do Detran/SEFAZ para IPVA e licenciamento.`;
}

export function bikeProfileStorageKey(firebaseUid?: string) {
  return `mototracker:bike-profile:${firebaseUid || "local"}`;
}

export function getStoredBikeProfile(firebaseUid?: string): BikeProfile {
  if (typeof window === "undefined") return DEFAULT_BIKE_PROFILE;

  try {
    const stored = window.localStorage.getItem(bikeProfileStorageKey(firebaseUid));
    return stored ? normalizeBikeProfile({ ...DEFAULT_BIKE_PROFILE, ...JSON.parse(stored) }) : DEFAULT_BIKE_PROFILE;
  } catch {
    return DEFAULT_BIKE_PROFILE;
  }
}
