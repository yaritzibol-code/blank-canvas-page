import { LP_CATEGORIES } from "./taxonomy";
import { CIAAC_LEARNING_PATHS } from "./ciaac-content";
import { HANDBOOK_LEARNING_PATHS } from "./handbook-content.generated";
import { isLearningPathAvailable } from "./ciaac-availability";
import { AIRCRAFT_LP_ID } from "./ciaac-aircraft-journey";
import { APPROVED_AIRCRAFT_READY_IDS } from "./ciaac-aircraft-approved/content";
import { CIAAC_REVIEWED_AERODYNAMICS_IDS } from "./ciaac-aerodynamics-ids";
import { CIAAC_REVIEWED_AIRCRAFT_ENGINES_IDS } from "./ciaac-aircraft-engines-ids";
import type { ReviewItem, ReviewPayload, ReviewRenderer } from "./admin-review-types";

const documents = { ...HANDBOOK_LEARNING_PATHS, ...CIAAC_LEARNING_PATHS };

/** Only registered, available content whose native renderer has review isolation. */
function renderer(id: string): ReviewRenderer {
  if (id === AIRCRAFT_LP_ID) return "aircraft";
  if (
    id.startsWith("ciaac/aerodinamica/modulo-1-introduccion-y-definiciones/") &&
    documents[id].number >= 2 &&
    documents[id].number <= 5
  )
    return "module-one";
  if ((CIAAC_REVIEWED_AERODYNAMICS_IDS as readonly string[]).includes(id)) return "aerodynamics";
  // ST uses the same native board/figure renderer. Availability + registered content above
  // still gate each lesson; the prefix never makes missing ST content reviewable.
  if (
    APPROVED_AIRCRAFT_READY_IDS.includes(id) ||
    id.startsWith("ciaac/servicios-de-transito-aereo/itinerario-aprobado-2026-10/")
  )
    return "approved-aircraft";
  if ((CIAAC_REVIEWED_AIRCRAFT_ENGINES_IDS as readonly string[]).includes(id))
    return "aircraft-engines";
  return "handbook";
}

const items: ReviewItem[] = LP_CATEGORIES.flatMap((category) =>
  category.subjects.flatMap((subject) =>
    subject.containers.flatMap((chapter) =>
      chapter.learningPaths
        .filter((item) => documents[item.id] && isLearningPathAvailable(item.id))
        .map((item) => ({
          id: item.id,
          title: item.titulo,
          category: category.titulo,
          subject: subject.titulo,
          chapter: chapter.titulo,
          renderer: renderer(item.id),
        })),
    ),
  ),
);

/** Called only after server-side authorization; no store/progress dependencies. */
export function learningPathReviewPayload(id: string | null): ReviewPayload | null {
  const item = id ? items.find((item) => item.id === id) : null;
  if (id && !item) return null;
  return { items, selected: item ? { item, document: documents[item.id] } : null };
}
