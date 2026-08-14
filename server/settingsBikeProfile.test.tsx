// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: { uid: "piloto-001" },
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mocks.user }),
}));

vi.mock("sonner", () => ({ toast: mocks.toast }));

import { SettingsView } from "@/components/SettingsView";

describe("cadastro da moto em Configurações", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.toast.mockClear();
    mocks.toast.success.mockClear();
    mocks.toast.error.mockClear();
  });

  it("salva o modelo, a placa final e o consumo no perfil da conta conectada", () => {
    render(<SettingsView />);

    fireEvent.change(screen.getByLabelText("Modelo da moto"), { target: { value: "Honda CB 500X" } });
    fireEvent.change(screen.getByLabelText("Final da placa"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText(/Consumo médio \(km\/L\)/), { target: { value: "35" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar dados da moto" }));

    expect(JSON.parse(window.localStorage.getItem("mototracker:bike-profile:piloto-001") ?? "{}")).toMatchObject({
      model: "Honda CB 500X",
      plateFinal: "7",
      consumptionKmPerLiter: "35",
    });
    expect(mocks.toast.success).toHaveBeenCalledOnce();
  });
});
