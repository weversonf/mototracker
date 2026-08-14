export type RoutePointKind = "start" | "stop" | "finish";

export type RoutePointCoordinates = {
  lat: number;
  lng: number;
};

export type RoutePoint = {
  id: string;
  kind: RoutePointKind;
  label: string;
  address: string;
  coordinates?: RoutePointCoordinates;
};

export type TripInput = {
  name: string;
  tag: string;
  points: RoutePoint[];
};

export type Trip = TripInput & {
  id: string;
  firebaseUid: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};
