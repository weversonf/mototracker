import { describe, expect, it } from "vitest";
import { editRoutePoint, normalizeTripInput } from "@/lib/tripModel";

const validTrip = {
  name: "  Serra do Rastro  ",
  tag: "  Planejada ",
  points: [
    { id: "start", kind: "start" as const, label: " Florianópolis ", address: " Florianópolis, SC " },
    { id: "stop", kind: "stop" as const, label: "", address: "" },
    { id: "finish", kind: "finish" as const, label: " Serra do Rastro ", address: " Lauro Müller, SC " },
  ],
};

describe("normalizeTripInput", () => {
  it("normaliza textos e omite paradas vazias", () => {
    expect(normalizeTripInput(validTrip)).toEqual({
      name: "Serra do Rastro",
      tag: "Planejada",
      points: [
        { id: "start", kind: "start", label: "Florianópolis", address: "Florianópolis, SC" },
        { id: "finish", kind: "finish", label: "Serra do Rastro", address: "Lauro Müller, SC" },
      ],
    });
  });

  it("exige nome, partida e destino", () => {
    expect(() => normalizeTripInput({ ...validTrip, name: "  " })).toThrow("Dê um nome");
    expect(() => normalizeTripInput({ ...validTrip, points: validTrip.points.slice(1) })).toThrow("ponto de partida");
    expect(() => normalizeTripInput({ ...validTrip, points: validTrip.points.slice(0, 2) })).toThrow("destino");
  });

  it("remove coordenadas antigas ao editar manualmente um ponto", () => {
    const editedPoint = editRoutePoint(
      {
        id: "start",
        kind: "start",
        label: "Fortaleza",
        address: "Fortaleza, CE",
        coordinates: { lat: -3.7319, lng: -38.5267 },
      },
      "label",
      "Aquiraz",
    );

    expect(editedPoint).toEqual({
      id: "start",
      kind: "start",
      label: "Aquiraz",
      address: "Fortaleza, CE",
    });
  });
});
