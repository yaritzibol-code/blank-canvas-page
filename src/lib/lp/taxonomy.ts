/**
 * Estructura académica de Learning Paths (sólo jerarquía y orden — el
 * contenido de cada Learning Path se carga después).
 *
 * Niveles: categoría → materia/módulo → contenedor (módulo, chapter, bloque,
 * documento) → Learning Path. El orden proviene del temario oficial y NO debe
 * reordenarse: la progresión secuencial depende de él.
 */
import raw from "./taxonomy.json";

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

export const LP_CATEGORIES: LpCategory[] = (raw as { categories: LpCategory[] }).categories;

/** Categoría B737: no se reconstruye, se enlaza a la ruta existente. */
export const B737_CATEGORY = {
  id: "b737",
  titulo: "B737",
  descripcion: "Ruta técnica existente del 737 MAX (FCOM).",
  to: "/ruta/$curso" as const,
  curso: "737-max",
};

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
  const subject = lpSubject(categoriaId, subjectSlug);
  return subject?.containers.find((c) => c.id === `${subject.id}/${containerSlug}`);
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
  const subject = lpSubject(parts.categoria, parts.materia);
  const container = lpContainer(parts.categoria, parts.materia, parts.contenedor);
  const item = container?.learningPaths.find((l) => l.id === id);
  if (!categoria || !subject || !container || !item) return null;
  return { categoria, subject, container, item };
}
