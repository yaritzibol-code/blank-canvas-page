/**
 * Estructura académica de Learning Paths (sólo jerarquía y orden — el
 * contenido de cada Learning Path se carga después).
 *
 * Niveles: categoría → materia/módulo → contenedor (módulo, chapter, bloque,
 * documento) → Learning Path. El orden proviene del temario oficial y NO debe
 * reordenarse: la progresión secuencial depende de él.
 */
import raw from "./taxonomy.json";
import { approvedAircraftSubject } from "./ciaac-aircraft-approved/catalog";
import { APPROVED_AIRCRAFT_ACTIVE } from "./ciaac-aircraft-approved/content";
import { approvedTransitSubject } from "./ciaac-transit-approved/catalog";
import { APPROVED_TRANSIT_ACTIVE } from "./ciaac-transit-approved/content";

export interface LpItem {
  /** Id único y estable: "categoria/materia/contenedor/tema-n". */
  id: string;
  titulo: string;
  orden: number;
}

export interface LpContainer {
  id: string;
  titulo: string;
  /** "modulo" | "chapter" | "bloque" | "documento" */
  tipo: string;
  learningPaths: LpItem[];
}

export interface LpSubject {
  id: string;
  titulo: string;
  tipo: string;
  /** Cómo se llaman sus contenedores en la UI ("Módulos", "Chapters"…). */
  containerLabel: string;
  containers: LpContainer[];
}

export interface LpCategory {
  id: string;
  titulo: string;
  subjectLabel: string;
  subjects: LpSubject[];
}

const originalCategories = (raw as { categories: LpCategory[] }).categories;
const originalAircraftSubject = originalCategories
  .find((category) => category.id === "ciaac")
  ?.subjects.find((subject) => subject.id === "ciaac/aeronaves-y-motores");

const originalTransitSubject = originalCategories
  .find((category) => category.id === "ciaac")
  ?.subjects.find((subject) => subject.id === "ciaac/servicios-de-transito-aereo");

/** The approved structure is an overlay; the legacy taxonomy and its stable IDs stay intact. */
export const LP_CATEGORIES: LpCategory[] =
  APPROVED_AIRCRAFT_ACTIVE || APPROVED_TRANSIT_ACTIVE
    ? originalCategories.map((category) =>
        category.id === "ciaac"
          ? {
              ...category,
              subjects: category.subjects.map((subject) =>
                subject.id === "ciaac/aeronaves-y-motores" && APPROVED_AIRCRAFT_ACTIVE
                  ? approvedAircraftSubject()
                  : subject.id === "ciaac/servicios-de-transito-aereo" && APPROVED_TRANSIT_ACTIVE
                    ? approvedTransitSubject()
                    : subject,
              ),
            }
          : category,
      )
    : originalCategories;

export function legacyAircraftSubject(): LpSubject | undefined {
  return APPROVED_AIRCRAFT_ACTIVE ? originalAircraftSubject : undefined;
}

export function legacyTransitSubject(): LpSubject | undefined {
  return APPROVED_TRANSIT_ACTIVE ? originalTransitSubject : undefined;
}

export function lpCategory(id: string): LpCategory | undefined {
  return LP_CATEGORIES.find((c) => c.id === id);
}

export function lpSubject(categoriaId: string, subjectSlug: string): LpSubject | undefined {
  return lpCategory(categoriaId)?.subjects.find((s) => s.id === `${categoriaId}/${subjectSlug}`);
}

export function lpContainer(
  categoriaId: string,
  subjectSlug: string,
  containerSlug: string,
): LpContainer | undefined {
  const subject = lpSubjectForContainer(categoriaId, subjectSlug, containerSlug);
  return subject?.containers.find((c) => c.id === `${subject.id}/${containerSlug}`);
}

/** Legacy links retain their own sequence, access rules, and progress, without entering
 * the new 19-LP counts. Unknown containers never borrow a different subject's progress. */
export function lpSubjectForContainer(
  categoriaId: string,
  subjectSlug: string,
  containerSlug: string,
): LpSubject | undefined {
  const subject = lpSubject(categoriaId, subjectSlug);
  const legacy = [legacyAircraftSubject(), legacyTransitSubject()].find(
    (candidate) => candidate?.id === subject?.id,
  );
  return legacy &&
    subject?.id === legacy.id &&
    legacy.containers.some((container) => container.id === `${legacy.id}/${containerSlug}`)
    ? legacy
    : subject;
}

/** Secuencia completa de una materia/módulo: el orden que gobierna el avance. */
export function subjectSequence(subject: LpSubject): { item: LpItem; container: LpContainer }[] {
  return subject.containers.flatMap((container) =>
    container.learningPaths.map((item) => ({ item, container })),
  );
}

export function subjectLpCount(subject: LpSubject): number {
  return subject.containers.reduce((n, c) => n + c.learningPaths.length, 0);
}

/** Partes de un id de Learning Path. */
export function lpParts(id: string): {
  categoria: string;
  materia: string;
  contenedor: string;
  lp: string;
} | null {
  const [categoria, materia, contenedor, lp] = id.split("/");
  if (!categoria || !materia || !contenedor || !lp) return null;
  return { categoria, materia, contenedor, lp };
}

export function findLp(id: string): {
  categoria: LpCategory;
  subject: LpSubject;
  container: LpContainer;
  item: LpItem;
} | null {
  const parts = lpParts(id);
  if (!parts) return null;
  const categoria = lpCategory(parts.categoria);
  const subject = lpSubjectForContainer(parts.categoria, parts.materia, parts.contenedor);
  const container = lpContainer(parts.categoria, parts.materia, parts.contenedor);
  const item = container?.learningPaths.find((l) => l.id === id);
  if (!categoria || !subject || !container || !item) return null;
  return { categoria, subject, container, item };
}
