// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Trip } from "@/types/trips";

const { createTrip, removeTrip, watchTrips } = vi.hoisted(() => ({
  createTrip: vi.fn(async () => ({ id: "trip-test" })),
  removeTrip: vi.fn(async () => undefined),
  watchTrips: vi.fn<(firebaseUid: string, onChange: (trips: Trip[]) => void, onError: (error: Error) => void) => () => void>(() => () => undefined),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "uid-teste", displayName: "Piloto de teste", email: "piloto@example.com" } }),
}));

vi.mock("@/lib/trips", () => ({
  createTrip,
  removeTrip,
  updateTrip: vi.fn(),
  watchTrips,
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

import { RoutesView } from "@/pages/LegacyFunctionalViews";

describe("timeline de nova viagem", () => {
  beforeEach(() => {
    createTrip.mockClear();
    removeTrip.mockClear();
    watchTrips.mockClear();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        features: [{
          geometry: { coordinates: [-38.5267, -3.7319] },
          properties: { osm_id: 123, osm_type: "N", name: "Fortaleza", city: "Fortaleza", state: "Ceará", country: "Brasil" },
        }],
      }),
    })));
  });

  it("permite foco, sugestão e edição manual sem reaproveitar coordenadas antigas", async () => {
    render(<RoutesView />);
    fireEvent.click(screen.getByRole("button", { name: "Nova viagem" }));

    const startName = screen.getByLabelText("Nome do ponto 1") as HTMLInputElement;
    startName.focus();
    expect(document.activeElement).toBe(startName);

    fireEvent.change(startName, { target: { value: "Fortaleza" } });
    const suggestion = await screen.findByRole("button", { name: /Fortaleza.*Ceará/i });
    fireEvent.click(suggestion);

    await waitFor(() => expect(startName.value).toBe("Fortaleza"));
    const startAddress = screen.getByLabelText("Endereço de Fortaleza") as HTMLInputElement;
    expect(startAddress.value).toMatch(/Fortaleza, Ceará, Brasil/);

    fireEvent.change(startName, { target: { value: "Saída manual" } });
    fireEvent.change(startAddress, { target: { value: "Rua do Piloto, Fortaleza, CE" } });

    fireEvent.change(screen.getByLabelText("Nome do ponto 2"), { target: { value: "Beberibe" } });
    fireEvent.change(screen.getByLabelText("Endereço de Beberibe"), { target: { value: "Beberibe, CE" } });
    fireEvent.change(screen.getByLabelText("Nome do ponto 3"), { target: { value: "Canoa Quebrada" } });
    fireEvent.change(screen.getByLabelText("Endereço de Canoa Quebrada"), { target: { value: "Canoa Quebrada, CE" } });
    fireEvent.change(screen.getByLabelText("NOME DA VIAGEM"), { target: { value: "Teste de edição" } });

    fireEvent.click(screen.getByRole("button", { name: "Salvar roteiro" }));

    await waitFor(() => expect(createTrip).toHaveBeenCalledOnce());
    const payload = (createTrip.mock.calls[0] as unknown as [string, { points: Array<{ label: string; address: string; coordinates?: unknown }> }])[1];
    expect(payload.points[0]).toMatchObject({ label: "Saída manual", address: "Rua do Piloto, Fortaleza, CE" });
    expect(payload.points[0].coordinates).toBeUndefined();
  });

  it("pede confirmação antes de excluir uma viagem salva e remove somente após confirmar", async () => {
    watchTrips.mockImplementation((_uid, onChange) => {
      onChange([{
        id: "trip-salva",
        firebaseUid: "uid-teste",
        name: "Fortaleza ao litoral",
        tag: "Planejada",
        points: [
          { id: "start", kind: "start", label: "Fortaleza", address: "Fortaleza, CE" },
          { id: "finish", kind: "finish", label: "Canoa Quebrada", address: "Canoa Quebrada, CE" },
        ],
        createdAt: null,
        updatedAt: null,
      }]);
      return () => undefined;
    });
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);

    render(<RoutesView />);
    fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
    const deleteButton = screen.getByRole("button", { name: "Excluir viagem" });

    fireEvent.click(deleteButton);
    expect(confirm).toHaveBeenCalledWith("Excluir “Fortaleza ao litoral”? Esta ação não pode ser desfeita.");
    expect(removeTrip).not.toHaveBeenCalled();

    fireEvent.click(deleteButton);
    await waitFor(() => expect(removeTrip).toHaveBeenCalledWith("uid-teste", "trip-salva"));
  });
});
