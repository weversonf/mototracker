// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/pages/Home";
import type { Trip } from "@/types/trips";

const watchTripsMock = vi.fn();
const removeTripMock = vi.fn();
const signOutMock = vi.fn();

const savedTrip: Trip = {
  id: "reference-trip-1",
  firebaseUid: "reference-user",
  name: "Serra de teste",
  tag: "Planejada",
  points: [
    { id: "start", kind: "start", label: "Fortaleza", address: "Fortaleza, CE", coordinates: { lat: -3.7319, lng: -38.5267 } },
    { id: "stop", kind: "stop", label: "Baturité", address: "Baturité, CE", coordinates: { lat: -4.328, lng: -38.884 } },
    { id: "finish", kind: "finish", label: "Aratuba", address: "Aratuba, CE", coordinates: { lat: -4.415, lng: -39.047 } },
  ],
  createdAt: null,
  updatedAt: null,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "reference-user", displayName: "Piloto de teste", email: "piloto@example.com" },
    signOutUser: signOutMock,
  }),
}));

vi.mock("@/lib/trips", () => ({
  watchTrips: (...args: unknown[]) => watchTripsMock(...args),
  removeTrip: (...args: unknown[]) => removeTripMock(...args),
  createTrip: vi.fn(),
  updateTrip: vi.fn(),
}));

vi.mock("@/components/Map", () => ({
  MapView: () => <div data-testid="mapa-renderizado" />,
}));

describe("fluxos reais acionados pelo frontend de referência", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    signOutMock.mockResolvedValue(undefined);
    removeTripMock.mockResolvedValue(undefined);
    watchTripsMock.mockImplementation((_uid, onData: (trips: Trip[]) => void) => {
      onData([savedTrip]);
      return vi.fn();
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("edita e exclui um roteiro salvo a partir do ponto de entrada da missão", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Gerenciar roteiros da missão" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByRole("button", { name: "Excluir viagem" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Excluir viagem" }));
    await waitFor(() => {
      expect(removeTripMock).toHaveBeenCalledWith("reference-user", "reference-trip-1");
    });
  });

  it("registra gasto com local reutilizável pelo cartão preservado", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir registros de gastos" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar gasto" }));
    fireEvent.change(screen.getByLabelText("O que foi pago?"), { target: { value: "Troca de óleo" } });
    fireEvent.change(screen.getByLabelText("Valor total"), { target: { value: "185,90" } });
    fireEvent.change(screen.getByLabelText(/Local ou estabelecimento/), { target: { value: "Oficina do Zé" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar gasto/ }));

    expect(screen.getByText("Troca de óleo")).toBeInTheDocument();
    expect(window.localStorage.getItem("mototracker:expense-locations:reference-user")).toContain("Oficina do Zé");
  });

  it("usa os pontos salvos na aba Mapa sem solicitar GPS", () => {
    const getCurrentPosition = vi.fn();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Mapa" }));

    expect(screen.getByTestId("mapa-renderizado")).toBeInTheDocument();
    expect(screen.getAllByText("Fortaleza").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Baturité").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aratuba").length).toBeGreaterThan(0);
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("expõe saída da conta e instalação PWA a partir das abas preservadas", async () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Equipe" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir perfil da conta" }));
    fireEvent.click(screen.getByRole("button", { name: /Sair da conta/ }));
    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Kit" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir configurações da moto" }));

    const promptMock = vi.fn();
    const installEvent = new Event("beforeinstallprompt", { cancelable: true });
    Object.defineProperties(installEvent, {
      prompt: { value: promptMock },
      userChoice: { value: Promise.resolve({ outcome: "accepted" }) },
    });
    fireEvent(window, installEvent);

    fireEvent.click(screen.getByRole("button", { name: "Instalar aplicativo" }));
    await waitFor(() => expect(promptMock).toHaveBeenCalledTimes(1));
  });
});
