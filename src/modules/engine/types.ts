// ─── Root tema shape ───────────────────────────────────────────────────────────

export interface TemaJSON {
  id: string;
  materia: string;
  bloque: number;
  tema: number;
  title: string;
  subtitle: string;
  duracion_min: number;
  blocks: BlockSpec[];
}

export interface BlockSpec {
  type: string;
  data: unknown;
}

// ─── HeaderBlock ───────────────────────────────────────────────────────────────

export interface HeaderBlockData {
  title: string;
  subtitle: string;
  materia: string;
  bloque: number;
  tema: number;
  duracion_min: number;
  progreso: number; // 0–100, passed by BlockRenderer from parent context
}

// ─── PreflightCheckBlock ───────────────────────────────────────────────────────

export interface PreflightCheckBlockData {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number; // 0-indexed
  explicacion: string;
}

// ─── ConceptExplanationBlock ───────────────────────────────────────────────────

export interface ConceptExplanationBlockData {
  texto: string;
  destacados?: string[];
  svg_diagram?: string; // raw SVG markup, internal content only
  fuente?: string;
}

// ─── FormulaBlock ──────────────────────────────────────────────────────────────

export interface FormulaVariable {
  simbolo: string;
  descripcion: string;
}

export interface FormulaBlockData {
  nombre: string;
  formula_latex: string; // rendered as styled text with basic symbol substitution
  variables: FormulaVariable[];
  nota?: string;
}

// ─── HighlightNoteBlock ────────────────────────────────────────────────────────

export type HighlightType = "definicion" | "advertencia" | "dato_clave" | "yaris";

export interface HighlightNoteBlockData {
  tipo: HighlightType;
  contenido: string;
  fuente?: string | null;
}

// ─── ActiveRecallBlock ────────────────────────────────────────────────────────

export interface MatchItem {
  id: string;
  left: string;
  right: string;
}

export interface OrdenarItem {
  id: string;
  texto: string;
  orden: number; // correct 1-indexed position
}

export interface ActiveRecallMatchData {
  tipo: "match";
  instruccion: string;
  items: MatchItem[];
}

export interface ActiveRecallCompletarData {
  tipo: "completar";
  instruccion: string;
  template: string;    // uses ___ as blank marker
  banco: string[];     // available words (may repeat)
  respuestas: string[]; // correct answers in blank order
}

export interface ActiveRecallOrdenarData {
  tipo: "ordenar";
  instruccion: string;
  items: OrdenarItem[];
}

export type ActiveRecallBlockData =
  | ActiveRecallMatchData
  | ActiveRecallCompletarData
  | ActiveRecallOrdenarData;

// ─── ThinkLikePilotBlock ──────────────────────────────────────────────────────

export interface ThinkLikePilotBlockData {
  pregunta: string;
  pista?: string;
  respuesta_sugerida: string;
}

// ─── DebriefBlock ─────────────────────────────────────────────────────────────

export interface DebriefBlockData {
  puntos_clave: string[];
  pregunta_metacognitiva: string;
  opciones_dificultad: string[];
  // tema_id and onComplete are injected by BlockRenderer, not from JSON
  tema_id: string;
  onComplete?: (dificultad: number) => void;
}

// ─── FlashcardsBlock ──────────────────────────────────────────────────────────

export interface FlashCard {
  pregunta: string;
  respuesta: string;
}

export interface FlashcardsBlockData {
  cards: FlashCard[];
}
