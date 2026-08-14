import { describe, expect, it } from "vitest";
import {
  DEFAULT_BIKE_PROFILE,
  estimateFuelLiters,
  getPlateReminder,
  normalizeBikeProfile,
} from "../client/src/lib/bikeProfile";

describe("bikeProfile", () => {
  it("normaliza final da placa e estado sem armazenar a placa completa", () => {
    expect(normalizeBikeProfile({
      nickname: "  Minha moto  ",
      model: "  Honda CB 500X ",
      plateFinal: "ABC1D23",
      consumptionKmPerLiter: "35",
      state: " sc ",
    })).toEqual({
      nickname: "Minha moto",
      model: "Honda CB 500X",
      plateFinal: "3",
      consumptionKmPerLiter: "35",
      state: "SC",
    });
  });

  it("estima litros a partir da distância e do consumo médio", () => {
    expect(estimateFuelLiters(350, "35")).toBe(10);
    expect(estimateFuelLiters(140, "28,5")).toBeCloseTo(4.912, 3);
    expect(estimateFuelLiters(71, "35.5")).toBe(2);
  });

  it("não estima litros com dados inválidos e mantém o lembrete sem vencimento oficial", () => {
    expect(estimateFuelLiters(0, "35")).toBeNull();
    expect(estimateFuelLiters(100, "")).toBeNull();
    expect(getPlateReminder({ ...DEFAULT_BIKE_PROFILE, plateFinal: "7", state: "CE" })).toContain("calendário oficial");
  });
});
