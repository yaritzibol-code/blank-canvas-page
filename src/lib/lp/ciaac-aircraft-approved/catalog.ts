import catalog from "./catalog.json";
import legacyMap from "./legacy-map.json";
import type { LpSubject } from "../taxonomy";

/** Approved scope only. These rows are not lesson explanations or publication approval. */
export const APPROVED_AIRCRAFT_CATALOG = catalog;
export const APPROVED_AIRCRAFT_LEGACY_MAP = legacyMap;
export const APPROVED_AIRCRAFT_IDS = catalog.lessons.map((lesson) => lesson.id);
export const APPROVED_AIRCRAFT_FIRST_BLOCK_IDS = APPROVED_AIRCRAFT_IDS.slice(0, 5);

export function approvedAircraftSubject(): LpSubject {
  return {
    id: catalog.subjectId,
    titulo: catalog.subjectTitle,
    tipo: "materia",
    containerLabel: "Itinerario",
    containers: [
      {
        id: catalog.containerId,
        titulo: catalog.subjectTitle,
        tipo: "bloque",
        learningPaths: catalog.lessons.map((lesson) => ({
          id: lesson.id,
          titulo: lesson.title,
          orden: lesson.order,
        })),
      },
    ],
  };
}

export interface AircraftProgressSnapshot {
  completedIds: readonly string[];
  startedIds: readonly string[];
  journeysById: Readonly<Record<string, unknown>>;
}

/** Read-only projection. Legacy completion is context, never credit for a regrouped LP.
 * No old ID, answer index, journey, reward, or completion row is renamed or removed. */
export function projectApprovedAircraftProgress(snapshot: AircraftProgressSnapshot) {
  const completed = new Set(snapshot.completedIds);
  const started = new Set(snapshot.startedIds);
  return {
    preserved: snapshot,
    lessons: catalog.lessons.map((lesson) => {
      const references = legacyMap.references.find((entry) => entry.approvedCode === lesson.code);
      return {
        id: lesson.id,
        status: completed.has(lesson.id)
          ? ("completado" as const)
          : started.has(lesson.id)
            ? ("en_progreso" as const)
            : ("no_iniciado" as const),
        legacyEvidence: (references?.legacyIds ?? []).map((id) => ({
          id,
          completed: completed.has(id),
          started: started.has(id),
          hasJourney: Object.hasOwn(snapshot.journeysById, id),
        })),
      };
    }),
  };
}
