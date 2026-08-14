import type { RoutePoint, TripInput } from "@/types/trips";

export function hasLocation(point: RoutePoint | undefined) {
  return Boolean(point?.label.trim() || point?.address.trim());
}

export function normalizePoint(point: RoutePoint): RoutePoint {
  const coordinates = point.coordinates && Number.isFinite(point.coordinates.lat) && Number.isFinite(point.coordinates.lng)
    ? point.coordinates
    : undefined;

  return {
    id: point.id,
    kind: point.kind,
    label: point.label.trim(),
    address: point.address.trim(),
    ...(coordinates ? { coordinates } : {}),
  };
}

export function normalizeTripInput(input: TripInput): TripInput {
  const name = input.name.trim();
  const points = input.points
    .map(normalizePoint)
    .filter((point) => point.kind !== "stop" || hasLocation(point));
  const start = points.find((point) => point.kind === "start");
  const finish = points.find((point) => point.kind === "finish");

  if (!name) throw new Error("Dê um nome para a viagem antes de salvar.");
  if (!hasLocation(start)) throw new Error("Informe o ponto de partida da viagem.");
  if (!hasLocation(finish)) throw new Error("Informe o destino da viagem.");

  return {
    name,
    tag: input.tag.trim() || "Planejada",
    points,
  };
}
