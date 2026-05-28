// ─── Root tema shape ───────────────────────────────────────────────────────────

export interface TemaJSON {
  id: string;
  materia: string;
  bloque: number;
  bloque_titulo?: string;
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
  bloque_titulo?: string;
  tema: number;
  duracion_min: number;
  progreso: number; // 0–100, passed by BlockRenderer from parent context
}

// ─── PreflightCheckBlock ───────────────────────────────────────────────────────

export interface PreflightCheckBlockData {
  instruccion?: string;        // optional intro text above the question
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;  // 0-indexed
  // Feedback: old format uses single `explicacion`; new format splits correct/incorrect
  explicacion?: string;
  feedback_correcto?: string;
  feedback_incorrecto?: string;
}

// ─── ConceptExplanationBlock ───────────────────────────────────────────────────

export interface InlineHighlight {
  tipo: "definicion" | "advertencia" | "dato_clave" | "yaris";
  contenido: string;
}

export interface SvgDiagramSpec {
  tipo: string;
  descripcion: string;
}

export interface TablaRow {
  categoria: string;
  descripcion: string;
  ejemplos?: string[];
}

export interface TablaAdicional {
  titulo: string;
  items: string[];
}

export interface ConceptExplanationBlockData {
  titulo?: string;
  texto: string;
  // Two highlight formats — old: string array, new: single typed object
  destacados?: string[];
  destacado?: InlineHighlight;
  // SVG: old = raw markup string, new = descriptor object (diagram placeholder)
  svg_diagram?: string | SvgDiagramSpec;
  nota_adicional?: string;
  // Structured table rows (tema-1-3+)
  tabla?: TablaRow[];
  adicional?: TablaAdicional;
  fuente?: string;
}

// ─── FormulaBlock ──────────────────────────────────────────────────────────────

export interface FormulaVariable {
  simbolo: string;
  nombre?: string;     // human-readable variable name
  descripcion: string;
}

export interface FormulaBlockData {
  nombre: string;
  formula?: string;    // simple readable formula shown above LaTeX (e.g. "RN = V · l / ν")
  formula_latex: string;
  variables: FormulaVariable[];
  nota?: string;
}

// ─── HighlightNoteBlock ────────────────────────────────────────────────────────

export type HighlightType = "definicion" | "advertencia" | "dato_clave" | "yaris";

export interface HighlightNoteBlockData {
  tipo: HighlightType;
  titulo?: string;     // optional custom header (overrides the default label)
  contenido: string;
  fuente?: string | null;
}

// ─── ActiveRecallBlock ─────────────────────────────────────────────────────────

export interface MatchItem {
  id: string | number;
  // Old format
  left?: string;
  right?: string;
  // New format (tema-1-2+)
  concepto?: string;
  descripcion?: string;
}

export interface OrdenarItem {
  id: string | number;
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
  template: string;     // uses ___ as blank marker
  banco: string[];
  respuestas: string[];
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

export interface DificultadOption {
  valor: number;
  etiqueta: string;
}

export interface DebriefBlockData {
  puntos_clave: string[];
  pregunta_metacognitiva: string;
  // Both formats: string[] (old) or {valor, etiqueta}[] (new)
  opciones_dificultad: string[] | DificultadOption[];
  // Injected by BlockRenderer, not from JSON
  tema_id: string;
  onComplete?: (dificultad: number) => void;
}

// ─── FlashcardsBlock ──────────────────────────────────────────────────────────

export interface FlashCard {
  id?: number | string;
  pregunta: string;
  respuesta: string;
}

export interface FlashcardsBlockData {
  cards: FlashCard[];
}
