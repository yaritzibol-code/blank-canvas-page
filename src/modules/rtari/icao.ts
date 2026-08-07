/**
 * Escala de competencia lingüística de la OACI (Doc 9835 / Anexo 1).
 *
 * La entrevista se califica en seis áreas, cada una del nivel 1 al 6. El nivel
 * que habilita para operar es el **4 (operacional)**, y la calificación final
 * es la más baja de las seis áreas: subir el promedio no sirve de nada si una
 * sola área se queda en 3.
 *
 * Aquí vive la referencia compartida por el prompt de evaluación (servidor) y
 * por la UI del debrief, para que ambos hablen de lo mismo.
 */

export type IcaoSkill =
  "pronunciacion" | "estructura" | "vocabulario" | "fluidez" | "comprension" | "interaccion";

export interface IcaoSkillDef {
  id: IcaoSkill;
  nombre: string;
  /** Nombre en inglés, como aparece en la escala original. */
  en: string;
  /** Qué mide, en una línea. */
  descripcion: string;
  icon: string;
}

export const ICAO_SKILLS: IcaoSkillDef[] = [
  {
    id: "pronunciacion",
    nombre: "Pronunciación",
    en: "Pronunciation",
    descripcion: "Acento, ritmo y entonación: cuánto esfuerzo cuesta entenderte.",
    icon: "audio",
  },
  {
    id: "estructura",
    nombre: "Estructura",
    en: "Structure",
    descripcion: "Gramática: tiempos verbales, orden de la oración, concordancia.",
    icon: "grid",
  },
  {
    id: "vocabulario",
    nombre: "Vocabulario",
    en: "Vocabulary",
    descripcion: "Precisión del léxico y capacidad de parafrasear cuando falta la palabra.",
    icon: "book",
  },
  {
    id: "fluidez",
    nombre: "Fluidez",
    en: "Fluency",
    descripcion: "Ritmo del discurso, pausas, muletillas y titubeos.",
    icon: "bolt",
  },
  {
    id: "comprension",
    nombre: "Comprensión",
    en: "Comprehension",
    descripcion: "Qué tanto entiendes la pregunta a la primera, sin repetición.",
    icon: "headset",
  },
  {
    id: "interaccion",
    nombre: "Interacción",
    en: "Interactions",
    descripcion: "Respuestas inmediatas y apropiadas; pedir aclaración cuando toca.",
    icon: "chat",
  },
];

export interface IcaoLevelDef {
  nivel: number;
  nombre: string;
  en: string;
  /** Resumen operativo del nivel. */
  resumen: string;
  color: string;
}

export const ICAO_LEVELS: IcaoLevelDef[] = [
  {
    nivel: 1,
    nombre: "Pre-elemental",
    en: "Pre-elementary",
    resumen: "Por debajo del nivel elemental: la comunicación no es posible.",
    color: "#8E1B1B",
  },
  {
    nivel: 2,
    nombre: "Elemental",
    en: "Elementary",
    resumen: "Palabras aisladas y frases memorizadas; no sostiene una conversación.",
    color: "#A83A2A",
  },
  {
    nivel: 3,
    nombre: "Pre-operacional",
    en: "Pre-operational",
    resumen: "Se comunica en temas conocidos, pero falla en cuanto se complica.",
    color: "#C4762A",
  },
  {
    nivel: 4,
    nombre: "Operacional",
    en: "Operational",
    resumen: "Nivel mínimo requerido: se entiende bien y resuelve imprevistos.",
    color: "#2F7D4F",
  },
  {
    nivel: 5,
    nombre: "Extendido",
    en: "Extended",
    resumen: "Habla con soltura y precisión, incluso en temas poco familiares.",
    color: "#1F6F8B",
  },
  {
    nivel: 6,
    nombre: "Experto",
    en: "Expert",
    resumen: "Precisión y naturalidad constantes, como un hablante muy competente.",
    color: "#22375C",
  },
];

/** Nivel mínimo que se exige para operar. */
export const ICAO_NIVEL_OPERACIONAL = 4;

export function icaoLevel(nivel: number): IcaoLevelDef {
  const n = Math.min(6, Math.max(1, Math.round(nivel)));
  return ICAO_LEVELS[n - 1]!;
}

export function icaoSkill(id: string): IcaoSkillDef | undefined {
  return ICAO_SKILLS.find((s) => s.id === id);
}

/**
 * Calificación global: la OACI toma la MÁS BAJA de las seis áreas, no el
 * promedio. Devuelve `null` si no hay ninguna área evaluada.
 */
export function icaoOverall(scores: Partial<Record<IcaoSkill, number>>): number | null {
  const vals = ICAO_SKILLS.map((s) => scores[s.id]).filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  if (vals.length === 0) return null;
  return Math.min(...vals);
}
