/**
 * Avance interno de un Learning Path.
 *
 * La navegación académica (iniciado/completado) vive en lp-nav.ts. Esta
 * colección conserva el punto exacto dentro del recorrido para que la alumna
 * pueda cerrar la sesión y continuar en la misma misión en otro dispositivo.
 */
import { nowISO, read, update } from "./db";

export interface LpJourneyRow<T = unknown> {
  id: string;
  userId: string;
  lpId: string;
  state: T;
  updatedAt: string;
}

const COLLECTION = "lp_journey_state";

export function getLpJourney<T>(userId: string, lpId: string): T | null {
  return (
    read<LpJourneyRow<T>[]>(COLLECTION, []).find(
      (row) => row.userId === userId && row.lpId === lpId,
    )?.state ?? null
  );
}

export function saveLpJourney<T>(userId: string, lpId: string, state: T): void {
  const id = `${userId}:${lpId}`;
  const next: LpJourneyRow<T> = { id, userId, lpId, state, updatedAt: nowISO() };
  update<LpJourneyRow<T>[]>(COLLECTION, [], (rows) => [
    ...rows.filter((row) => row.id !== id),
    next,
  ]);
}

export function resetLpJourney(userId: string, lpId: string): void {
  const id = `${userId}:${lpId}`;
  update<LpJourneyRow[]>(COLLECTION, [], (rows) => rows.filter((row) => row.id !== id));
}
