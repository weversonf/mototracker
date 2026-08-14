import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import { normalizeTripInput } from "@/lib/tripModel";
import type { RoutePoint, Trip, TripInput } from "@/types/trips";

type StoredTrip = {
  firebaseUid: string;
  name: string;
  tag: string;
  points: RoutePoint[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

function requireDatabase() {
  if (!firebaseDb) {
    throw new Error("O Firebase ainda não está configurado para salvar viagens.");
  }

  return firebaseDb;
}

function getTripsCollection(firebaseUid: string) {
  return collection(requireDatabase(), "mototrackerUsers", firebaseUid, "trips");
}

function toTrip(id: string, record: StoredTrip): Trip {
  return {
    id,
    firebaseUid: record.firebaseUid,
    name: record.name,
    tag: record.tag,
    points: record.points ?? [],
    createdAt: record.createdAt?.toDate() ?? null,
    updatedAt: record.updatedAt?.toDate() ?? null,
  };
}

export function watchTrips(
  firebaseUid: string,
  onChange: (trips: Trip[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const tripsQuery = query(getTripsCollection(firebaseUid), orderBy("updatedAt", "desc"));

  return onSnapshot(
    tripsQuery,
    (snapshot) => onChange(snapshot.docs.map((snapshotDoc) => toTrip(snapshotDoc.id, snapshotDoc.data() as StoredTrip))),
    (error) => onError(error),
  );
}

export async function createTrip(firebaseUid: string, input: TripInput): Promise<Trip> {
  const trip = normalizeTripInput(input);
  const tripRef = doc(getTripsCollection(firebaseUid));
  const now = new Date();

  await setDoc(tripRef, {
    ...trip,
    firebaseUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: tripRef.id, firebaseUid, ...trip, createdAt: now, updatedAt: now };
}

export async function updateTrip(firebaseUid: string, tripId: string, input: TripInput): Promise<void> {
  const trip = normalizeTripInput(input);
  const tripRef = doc(getTripsCollection(firebaseUid), tripId);

  await updateDoc(tripRef, {
    ...trip,
    updatedAt: serverTimestamp(),
  });
}

export async function removeTrip(firebaseUid: string, tripId: string): Promise<void> {
  await deleteDoc(doc(getTripsCollection(firebaseUid), tripId));
}
