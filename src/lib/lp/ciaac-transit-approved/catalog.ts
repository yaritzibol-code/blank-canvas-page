import catalog from "./catalog.json";
import type { LpSubject } from "../taxonomy";

/** Approved scope and order only; catalog presence never grants publication. */
export const APPROVED_TRANSIT_CATALOG = catalog;
export const APPROVED_TRANSIT_IDS = catalog.lessons.map((lesson) => lesson.id);
export const APPROVED_TRANSIT_ACTIVATION_IDS = [APPROVED_TRANSIT_IDS[0]];

export function approvedTransitSubject(): LpSubject {
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
