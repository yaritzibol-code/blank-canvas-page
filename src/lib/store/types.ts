/** Modelos canónicos de FlightPath (PRD v1.0). */

export type PlanTier = "basica" | "paga";
export type UserRole = "student" | "admin";
export type AccessStatus =
  | "activo"
  | "vencido"
  | "pausado"
  | "extendido"
  | "prueba"
  | "cancelado";

export interface UserPrefs {
  theme: "claro" | "oscuro" | "sistema";
  textSize: "Normal" | "Grande" | "Muy grande";
  toggles: {
    whatsapp: boolean;
    racha: boolean;
    simulador: boolean;
    bitacora: boolean;
    pathy: boolean;
  };
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  whatsapp: string;
  whatsappEstado: "registrado" | "confirmado" | "no_confirmado" | "sin_numero" | "con_error";
  escuela: string;
  fechaCiaac: string | null; // "YYYY-MM-DD" o null
  perfilCiaac: string;
  role: UserRole;
  plan: PlanTier;
  planNombre: string; // "Suscripción básica" | "Plan Anual" | ...
  accessStatus: AccessStatus;
  accessStart: string; // ISO
  accessEnd: string | null; // ISO
  createdAt: string;
  lastAccess: string;
  marketingOptIn: boolean;
  onboardingDone: boolean;
  /** Solicitud de eliminación: fecha de desactivación; 30 días para recuperar. */
  deactivatedAt: string | null;
  notasInternas: string;
  prefs: UserPrefs;
}

export type QuestionStatus = "borrador" | "publicada" | "oculta";

export interface BankQuestion {
  id: string;
  materia: string; // slug de materia o "" (sin clasificar)
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  cite: string;
  status: QuestionStatus;
  source: "seed" | "import" | "manual";
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  date: string; // ISO
  materias: string[]; // slugs
  total: number;
  correct: number;
  durationMin: number;
  porMateria: Record<string, { correct: number; total: number }>;
}

export interface SimAnswer {
  questionId: string;
  materia: string;
  selectedIndex: number;
  correctIndex: number;
}

export interface SimAttempt {
  id: string;
  userId: string;
  date: string;
  total: number;
  correct: number;
  scorePct: number;
  passed: boolean;
  durationSecs: number;
  porMateria: Record<string, { correct: number; total: number }>;
  answers: SimAnswer[];
}

export interface TemaProgress {
  userId: string;
  temaId: string; // ej. "aerodinamica-1-1"
  completado: boolean;
  dificultad: number | null; // 1-5 percibida
  fecha: string; // ISO
}

export interface ClaseProgress {
  userId: string;
  claseId: string;
  pctVisto: number; // 0-100 reproducido real
  tiempoVistoSecs: number;
  completada: boolean;
  updatedAt: string;
}

export type ContentStatus = "borrador" | "publicada" | "oculta";

export interface Clase {
  id: string;
  materia: string; // slug
  titulo: string;
  descripcion: string;
  duracionMin: number;
  orden: number;
  videoUrl: string; // URL de video o embed; "" = sin video (placeholder)
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  titulo: string;
  autor: string;
  materia: string; // slug o ""
  tags: string[];
  badge: string;
  badgeColor: string;
  emoji: string;
  gradient: string;
  pages: number;
  fileUrl: string; // URL de PDF real; "" = visor simulado
  descargable: boolean;
  imprimible: boolean;
  muestraGratis: boolean; // accesible con suscripción básica
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FlashCardItem {
  id: string;
  materia: string;
  tema: string; // nombre del tema/deck
  q: string;
  a: string;
  status: ContentStatus;
}

export interface FlashCardState {
  userId: string;
  cardId: string;
  state: "dominada" | "repasar";
  updatedAt: string;
}

export interface FlashSession {
  id: string;
  userId: string;
  date: string;
  materia: string;
  tema: string;
  total: number;
  knew: number;
  review: number;
}

export interface BitacoraEntry {
  id: string;
  userId: string;
  date: string; // ISO
  emotionIcon: string;
  moodLabel: string;
  motiv: number;
  conc: number;
  conf: number;
  materias: string[]; // labels de materias difíciles ([] = todo bien)
  text: string;
  pathyMsg: string;
}

export interface Reminder {
  id: string;
  userId: string;
  tipo: string;
  titulo: string;
  sub: string;
  hora: string; // "19:00"
  dias: boolean[]; // 7, L-D
  enabled: boolean;
  icon: string;
  iconBg: string;
  tags: string[];
  ultimoEnvio: string | null;
  createdAt: string;
}

export type ReportStatus = "pendiente" | "en_proceso" | "resuelto" | "cerrado";

export interface Report {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fecha: string; // ISO
  tipo: string;
  seccion: string;
  recurso: string; // id/nombre del recurso relacionado ("" si n/a)
  mensaje: string;
  estado: ReportStatus;
  notasInternas: string;
}

export type ActivityKind =
  | "login"
  | "quiz"
  | "simulador"
  | "flashcards"
  | "clase"
  | "tema"
  | "bitacora"
  | "biblioteca"
  | "pathy_session"
  | "yaris"
  | "upgrade_prompt"
  | "upgrade_click";

export interface ActivityEvent {
  id: string;
  userId: string;
  date: string; // ISO
  kind: ActivityKind;
  label: string;
  score: number | null;
  durationMin: number;
}

/** Segundos de estudio acumulados por día ("YYYY-MM-DD"). */
export type StudyDays = Record<string, number>;

export interface AccessChange {
  id: string;
  userId: string;
  fecha: string;
  accion: string;
  detalle: string;
}

export interface InternalConfig {
  nombrePlataforma: string;
  slogan: string;
  contactoEmail: string;
  whatsappSoporte: string;
  mensajeBienvenida: string;
  mensajeConversion: string;
  precioPlanAnual: string;
  proveedorWhatsApp: string;
  simuladorPreguntas: number;
  simuladorHoras: number;
  pctMinimoClase: number; // % mínimo de reproducción real para completar clase
}
