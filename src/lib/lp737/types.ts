/**
 * Tipos de la Ruta de aprendizaje 737 MAX (FCOM Rev. 16).
 *
 * El contenido (content.ts, generado) replica 1:1 el paquete
 * `FlightPath737MAXLearningPath` de Daniel: 21 módulos, 265 lecciones y 530
 * preguntas derivadas exclusivamente de lo que enseña cada lección, más la
 * capa pedagógica (activación, refuerzo de Yaris y 3 consolidaciones por
 * lección). No editar el contenido a mano: proviene del build del curso.
 */

export interface Lp737Question {
  id: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  /** Nivel de la pregunta en rutas que lo declaran ("comprension"/"aplicacion"). */
  level?: string;
}

export interface Lp737Activation {
  eyebrow: string;
  prompt: string;
  instruction: string;
}

export type Lp737ReinforcementType = "mnemonic" | "example" | "tip";

export interface Lp737Reinforcement {
  type: Lp737ReinforcementType;
  title: string;
  content: string;
  /** Cómo transferir el refuerzo a otras operaciones. */
  transfer: string;
}

export interface Lp737ConsolidationTrueFalse {
  id: string;
  type: "true_false";
  title: string;
  prompt: string;
  answer: boolean;
  explanation: string;
}

export interface Lp737ConsolidationSentence {
  id: string;
  type: "complete_sentence";
  title: string;
  prompt: string;
  /** Etiquetas alrededor de los dos huecos ("La secuencia comienza con", …). */
  parts: string[];
  answers: string[];
  options: string[];
  explanation: string;
}

export interface Lp737ConsolidationTable {
  id: string;
  type: "complete_table";
  title: string;
  prompt: string;
  rows: { label: string; answer: string }[];
  options: string[];
  explanation: string;
}

export type Lp737Consolidation =
  Lp737ConsolidationTrueFalse | Lp737ConsolidationSentence | Lp737ConsolidationTable;

export interface Lp737Lesson {
  id: string;
  title: string;
  source_pages: number[];
  reference: string;
  objective: string;
  why_it_matters: string;
  explanation: string[];
  technical_points: { label: string; detail: string }[];
  operational_flow: string[];
  common_error: string;
  mnemonic?: string;
  questions: Lp737Question[];
  activation: Lp737Activation;
  yaris_reinforcement: Lp737Reinforcement;
  consolidation: Lp737Consolidation[];
  /* Campos presentes solo en rutas con evidencia visual (Jeppesen). */
  source_refs?: LpSourceRef[];
  claim_evidence?: LpClaimEvidence;
  evidence_status?: string;
  jurisdiction_scope?: string;
  manual_pages?: string;
  academic_note?: LpAcademicNote;
  visual?: LpVisual;
  visual_task?: LpVisualTask;
}

export interface Lp737Module {
  id: string;
  title: string;
  chapter_code: string;
  source_pages: number[];
  summary: string;
  lessons: Lp737Lesson[];
  /** Nombre de archivo del paquete original (no se usa en la app). */
  file?: string;
}

export interface Lp737Meta {
  course: string;
  source_pages: number;
  module_count: number;
  lesson_count: number;
  question_count: number;
  activation_count?: number;
  yaris_reinforcement_count?: number;
  consolidation_activity_count?: number;
  /** Temas del manual trazados (cifra del manifiesto del paquete). */
  topics_traced?: number;
  /* Métricas de rutas con evidencia visual. */
  visual_count?: number;
  unique_visual_count?: number;
  applied_question_count?: number;
}

export interface Lp737Course {
  meta: Lp737Meta;
  modules: Lp737Module[];
}

/* ───────── Campos extendidos (rutas con evidencia visual, p. ej. Jeppesen) ───────── */

export interface LpSourceRef {
  label: string;
  detail: string;
  type?: string;
  authority?: string;
  supports?: string;
  url?: string;
}

export interface LpClaimEvidence {
  claim: string;
  manual_locator?: string;
  manual_role?: string;
  primary_source_role?: string;
  course_source_role?: string;
  verification_method?: string;
}

export interface LpAcademicNote {
  title: string;
  content: string;
  scope?: string;
  verification?: string;
}

export interface LpVisual {
  /** Ruta pública ya reescrita (p. ej. /lp/jeppesen/charts/x.png). */
  src: string;
  alt: string;
  caption: string;
  source: string;
  kind?: string;
  source_page?: number;
  supports?: string;
}

export interface LpVisualTask {
  prompt: string;
  expected: string;
  method?: string;
}
