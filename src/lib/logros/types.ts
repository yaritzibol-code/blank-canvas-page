/**
 * Sistema de Logros de FlightPath — tipos.
 *
 * El catálogo es puramente declarativo: cada logro define su condición sobre
 * un contexto calculado a partir de la actividad REAL del usuario
 * (cuestionarios, Learning Paths, flashcards, biblioteca, sesiones de estudio).
 * Así se pueden ajustar condiciones sin tocar la interfaz.
 */

export type LogroCategoria =
  | "Primeros pasos"
  | "Constancia"
  | "Cuestionarios"
  | "Learning Paths"
  | "Flashcards"
  | "Rendimiento"
  | "Biblioteca"
  | "Tiempo de estudio"
  | "Retos especiales"
  | "Logros grandes"
  | "Máximo";

/** Foto del avance real del usuario; la única fuente de los desbloqueos. */
export interface LogroCtx {
  /* Actividad general */
  actividades: number;
  diasConActividad: number;
  maxActividadesEnDia: number;
  maxHerramientasEnDia: number;
  herramientas: string[];
  diaPerfecto: boolean;
  semanaPerfecta: boolean;

  /* Constancia */
  streakActual: number;
  streakMax: number;
  maxDiasEnMes: number;
  sesionesMadrugada: number;
  sesionesNoche: number;

  /* Tiempo */
  minutosTotales: number;
  sesiones30min: number;
  sesionesEstudio: number;
  pathySesiones: number;

  /* Cuestionarios */
  quizCount: number;
  quizPcts: number[];
  quiz80: number;
  quiz90: number;
  quizPerfectos: number;
  quiz90Consecutivos: number;
  quiz95Consecutivos: number;
  mejoras5Consecutivas: boolean;
  mejoroRespectoAnterior: boolean;
  maxMejora: number;
  repetidoMejorado: boolean;
  bajoLuegoMejor: boolean;
  primerIntento90: boolean;
  materiasQuiz90: number;
  materiasDominadas: number;
  promedioUltimos10: number | null;
  rangoUltimos10: number | null;
  promedioGeneral: number | null;
  contraReloj: boolean;

  /* Simulador */
  simCount: number;

  /* Learning Paths */
  lpCompletados: number;
  materiasLpCompletas: number;
  materiasConLp: number;
  maxProgresoMateria: number;
  rutaProgresoMax: number;

  /* Flashcards */
  flashEstudiadas: number;
  flashSesiones: number;
  flashMaxSesion: number;
  flashRepetida: boolean;
  flashRecuperadas: boolean;
  flashSeccionesDominadas: number;
  flashMateriasDominadas: number;

  /* Biblioteca */
  bibliotecaRecursos: number;
  bibliotecaMaterias: number;
}

export interface LogroDef {
  id: string;
  nombre: string;
  desc: string;
  categoria: LogroCategoria;
  icon: string;
  orden: number;
  /** No revela su condición mientras esté bloqueado. */
  secreto?: boolean;
  /** Trato visual premium (logro 100). */
  especial?: boolean;
  check: (c: LogroCtx) => boolean;
}

export interface LogroEstado extends LogroDef {
  desbloqueado: boolean;
  fecha: string | null;
  destacado: boolean;
}
