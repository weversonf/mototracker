// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/pages/Home";

const watchTripsMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "reference-user", displayName: "Piloto de teste" } }),
}));

vi.mock("@/lib/trips", () => ({
  watchTrips: (...args: unknown[]) => watchTripsMock(...args),
}));

vi.mock("@/components/WaypointMap", () => ({
  default: ({ tripPoints: _tripPoints }: { tripPoints?: unknown[] }) => <div>Mapa preservado</div>,
}));
vi.mock("@/components/Equipe", () => ({ default: () => <div>Equipe preservada</div> }));
vi.mock("@/components/Kit", () => ({ default: () => <div>Kit preservado</div> }));
vi.mock("@/components/ExpensesView", () => ({ ExpensesView: () => <div>Fluxo real de gastos</div> }));
vi.mock("@/components/SettingsView", () => ({ SettingsView: () => <div>Fluxo real de configurações</div> }));
vi.mock("@/pages/LegacyFunctionalViews", () => ({
  RoutesView: () => <div>Fluxo real de roteiros</div>,
  GarageView: () => <div>Fluxo real da garagem</div>,
  ProfileView: () => <div>Fluxo real de perfil</div>,
}));

describe("integração do visual de referência", () => {
  beforeEach(() => {
    window.localStorage.clear();
    watchTripsMock.mockImplementation((_uid, onData: (trips: unknown[]) => void) => {
      onData([]);
      return vi.fn();
    });
  });

  it("abre o fluxo de roteiros pelo controle visual da missão", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Gerenciar roteiros da missão" }));

    expect(screen.getByText("Fluxo real de roteiros")).toBeInTheDocument();
  });

  it("abre os gastos e a garagem pelos cartões visuais existentes", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir registros de gastos" }));
    expect(screen.getByText("Fluxo real de gastos")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Abrir garagem da moto" }));
    expect(screen.getByText("Fluxo real da garagem")).toBeInTheDocument();
  });

  it("mantém perfil e configurações acessíveis pelas abas preservadas", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Equipe" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir perfil da conta" }));
    expect(screen.getByText("Fluxo real de perfil")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Kit" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir configurações da moto" }));
    expect(screen.getByText("Fluxo real de configurações")).toBeInTheDocument();
  });
});
