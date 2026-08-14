// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  afterEach(() => cleanup());

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

  it("abre a solicitação nativa ao escolher instalar o aplicativo", async () => {
    render(<SettingsView />);

    const prompt = vi.fn().mockResolvedValue(undefined);
    const installEvent = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt: typeof prompt;
      userChoice: Promise<{ outcome: "accepted"; platform: string }>;
    };
    Object.defineProperties(installEvent, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: "accepted", platform: "web" }) },
    });
    await act(async () => {
      window.dispatchEvent(installEvent);
    });

    fireEvent.click(screen.getByRole("button", { name: "Instalar aplicativo" }));

    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    await waitFor(() => expect(mocks.toast.success).toHaveBeenCalledWith("MotoTracker instalado", expect.any(Object)));
  });
});
