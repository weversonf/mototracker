// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

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
});
