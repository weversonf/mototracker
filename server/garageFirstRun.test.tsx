// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    configured: true,
    authError: null,
    signInWithGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

import { GarageView } from "@/pages/Home";
import { bikeProfileStorageKey } from "@/lib/bikeProfile";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("estado inicial da Garagem", () => {
  it("não mostra moto, revisão ou serviços fictícios e encaminha ao cadastro", () => {
    const onOpenSettings = vi.fn();
    render(<GarageView onOpenSettings={onOpenSettings} />);

    expect(screen.getByText("Nenhuma moto cadastrada")).toBeTruthy();
    expect(screen.queryByText("Triumph Street Triple")).toBeNull();
    expect(screen.queryByText("1.240 km")).toBeNull();
    expect(screen.queryByText("Troca de óleo")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Abrir configurações" }));
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });

  it("mostra o cadastro salvo em Configurações no lugar do estado vazio", () => {
    window.localStorage.setItem(bikeProfileStorageKey(), JSON.stringify({
      model: "Honda CB 500X",
      nickname: "Companheira",
      plateFinal: "7",
      state: "CE",
      consumptionKmPerLiter: "35",
    }));

    render(<GarageView onOpenSettings={vi.fn()} />);

    expect(screen.getByText("Companheira")).toBeTruthy();
    expect(screen.getByText("Honda CB 500X")).toBeTruthy();
    expect(screen.getByText("35 km/L")).toBeTruthy();
    expect(screen.getByText("Final 7")).toBeTruthy();
    expect(screen.queryByText("Nenhuma moto cadastrada")).toBeNull();
  });
});
