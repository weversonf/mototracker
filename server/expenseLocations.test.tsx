// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

import { ExpensesView } from "@/components/ExpensesView";

describe("locais de despesas", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.toast.mockClear();
    mocks.toast.success.mockClear();
    mocks.toast.error.mockClear();
  });

  afterEach(() => cleanup());

  it("salva o local do lançamento e o oferece para seleção no próximo gasto", async () => {
    render(<ExpensesView />);

    fireEvent.click(screen.getByRole("button", { name: "Registrar gasto" }));
    fireEvent.change(screen.getByPlaceholderText("Ex.: Abastecimento"), { target: { value: "Tanque cheio" } });
    fireEvent.change(screen.getByPlaceholderText("Ex.: 185,90"), { target: { value: "120" } });
    fireEvent.change(screen.getByPlaceholderText("Ex.: Oficina do Zé"), { target: { value: "Oficina do Zé" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar gasto/i }));

    await waitFor(() => expect(JSON.parse(window.localStorage.getItem("mototracker:expense-locations:piloto-001") ?? "[]")).toEqual(["Oficina do Zé"]));
    expect(screen.getByText(/Hoje · Oficina do Zé/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Registrar gasto" }));
    fireEvent.click(screen.getByRole("button", { name: "Oficina do Zé" }));

    expect((screen.getByPlaceholderText("Ex.: Oficina do Zé") as HTMLInputElement).value).toBe("Oficina do Zé");
  });
});
