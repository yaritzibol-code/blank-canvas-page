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
  /**
   * Plan de estudio de "Estudiemos juntos". Vive en las preferencias —y por
   * tanto viaja al perfil y a la nube— en vez de en claves sueltas de
   * localStorage (`fp_tiempo_disponible`, `fp_onboarding_done`…), que eran
   * globales del navegador: dos cuentas en el mismo equipo compartían plan y
   * al cambiar de dispositivo se perdía.
   */
  planEstudio?: {
    /** "30m" | "1h" | "2h" | "custom" */
    tiempo: string;
    customHoras?: string;
    customMinutos?: string;
    /** true cuando el estudiante ya completó el onboarding del módulo. */
    configurado?: boolean;
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
  /** Nombre del plan; catálogo canónico en `@/lib/pricing` (`PLANES`). */
  planNombre: string;
  accessStatus: AccessStatus;
  accessStart: string; // ISO
  accessEnd: string | null; // ISO
  createdAt: string;
  lastAccess: string;
  marketingOptIn: boolean;
  onboardingDone: boolean;
  /**
   * Cómo se dirige la plataforma al estudiante ("¿lista?" / "¿listo?").
   * Se elige en el onboarding y se puede cambiar en Mi perfil.
   */
  genero?: "femenino" | "masculino" | "neutro";
  /**
   * Personalidad con la que responde Yaris IA: formal (de usted), normal
   * (cercana y profesional) o amiga (chat relajado, mismo rigor técnico).
   */
  yarisTono?: "formal" | "normal" | "amiga";
  /** Longitud de las respuestas de Yaris (Configuración → Apariencia). */
  yarisLargo?: "corta" | "normal" | "detallada";

  /**
   * Ruta en la que se enfoca: una materia del CIAAC (slug) o "linea-aerea".
   * Personaliza el inicio del dashboard y los atajos.
   */
  focoRuta?: "ciaac" | "linea-aerea";
  /** Materia del CIAAC en la que se está enfocando (slug), si aplica. */
  focoMateria?: string | null;
  /** Solicitud de eliminación: fecha de desactivación; 30 días para recuperar. */
  deactivatedAt: string | null;
  notasInternas: string;
  prefs: UserPrefs;
}

export type QuestionStatus = "borrador" | "publicada" | "oculta";

export interface BankQuestion {
  id: string;
  materia: string; // slug de materia o "" (sin clasificar)
  /** Código del manual de origen (cursos de línea aérea): ATP, PHAK, JEPP, ANX10, CPAM. */
  fuente?: string;
  /** Capítulo del manual (ATP se organiza por capítulos). */
  capitulo?: number;
  /** Título del capítulo, para mostrarlo en la UI. */
  capituloTitulo?: string;
  /** Sección del capítulo (subtema del libro). */
  seccion?: string;
  /**
   * Láminas del manual que acompañan al reactivo (bucket `jeppesen-images`).
   * Se guarda solo el nombre del archivo: `jeppesen_gam_page_0174.png`.
   */
  imagenes?: string[];
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

/**
 * Respuesta concreta a un reactivo dentro de un intento. Guardar el detalle
 * (y no solo el marcador por materia) es lo que permite que Pathy diga qué
 * capítulo del manual costó de verdad.
 */
export interface AttemptAnswer {
  questionId: string;
  materia: string;
  /** Manual de origen (ATP, JEPP, PHAK…) cuando el reactivo viene de Línea Aérea. */
  fuente?: string;
  capitulo?: number;
  capituloTitulo?: string;
  seccion?: string;
  /** -1 / null = quedó en blanco. */
  selectedIndex: number;
  correctIndex: number;
}

/** Alias histórico: el simulador ya guardaba sus respuestas con este nombre. */
export type SimAnswer = AttemptAnswer;

export interface QuizAttempt {
  id: string;
  userId: string;
  date: string; // ISO
  materias: string[]; // slugs
  total: number;
  correct: number;
  durationMin: number;
  porMateria: Record<string, { correct: number; total: number }>;
  /** Detalle por pregunta de esta sesión (intentos nuevos). */
  answers?: AttemptAnswer[];
  /**
   * Nombre del cuestionario cuando no se define por materias (manuales del
   * curso de Línea Aérea o guía oficial). Opcional: los intentos antiguos
   * siguen mostrando su materia.
   */
  titulo?: string;
}

export interface SimAttempt {
  id: string;
  userId: string;
  date: string;
  /** Tamaño del examen: la calificación se saca sobre esto, en blanco cuenta mal. */
  total: number;
  /**
   * Preguntas que la estudiante realmente contestó. Se separa de `total`
   * porque "preguntas respondidas" no debe inflarse con las que dejó vacías.
   * Opcional: los intentos anteriores a este campo caen a `total`.
   */
  answered?: number;
  correct: number;
  scorePct: number;
  passed: boolean;
  durationSecs: number;
  porMateria: Record<string, { correct: number; total: number }>;
  answers: AttemptAnswer[];
}

/** Punto flojo detectado con datos duros (no con IA). */
export interface PathyWeakSpot {
  /** "materia" | "capitulo" */
  tipo: "materia" | "capitulo";
  /** Etiqueta lista para mostrar ("Meteorología", "ATP · Cap. 5 — Performance"). */
  label: string;
  correct: number;
  total: number;
  pct: number;
  /** true cuando la muestra es demasiado pequeña para concluir. */
  muestraCorta: boolean;
  /** Ruta sugerida para practicarlo. */
  to?: string;
  search?: Record<string, string>;
}

/** Informe de Pathy guardado tras una sesión. */
export interface PathyReportEntry {
  id: string;
  userId: string;
  date: string; // ISO
  /** Origen del informe. */
  origen: "cuestionario" | "simulador";
  /** Nombre de la sesión ("Meteorología", "ATP · Cap. 5"…). */
  titulo: string;
  scorePct: number;
  answered: number;
  wrong: number;
  /** Rankings reales calculados en el cliente. */
  puntos: PathyWeakSpot[];
  /** Narrativa de la IA; null cuando no se pudo generar. */
  diagnostico: string | null;
  confusiones: string[];
  acciones: string[];
  /** Motivo cuando no hay narrativa ("sin_pro", "limite", "error", "sin_errores"). */
  motivo?: string;
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

/**
 * Copia de la pregunta tal como la vio quien reporta. Se guarda con el ticket
 * para que el equipo admin sepa exactamente qué reactivo se está reportando,
 * aunque después se edite o se despublique.
 */
export interface ReportQuestionSnapshot {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  materia?: string;
  fuente?: string;
  capitulo?: number;
  /** Índice elegido por la estudiante al reportar (null si no había respondido). */
  selectedIndex?: number | null;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fecha: string; // ISO
  tipo: string;
  seccion: string;
  recurso: string; // id/nombre del recurso relacionado ("" si n/a)
  /** Snapshot del reactivo reportado (solo en reportes de cuestionario). */
  pregunta?: ReportQuestionSnapshot;
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
  /**
   * El precio de Pro NO se configura aquí: vive en Stripe y se lee con
   * `getPublicPricing()` (respaldo en `@/lib/pricing`). Se eliminó
   * `precioPlanAnual` porque ninguna vista lo consumía y divergía del
   * importe realmente cobrado.
   */
  proveedorWhatsApp: string;
  simuladorPreguntas: number;
  simuladorHoras: number;
  pctMinimoClase: number; // % mínimo de reproducción real para completar clase
  // Configuración de IA (PRD 9.12)
  iaYarisActiva: boolean;
  iaPathyActiva: boolean;
  limiteYarisBasico: number; // interacciones diarias con Yaris para el plan básico
  // Recordatorios
  recordatorioHorario: string; // horario sugerido por defecto
  recordatorioDias: string; // días sugeridos por defecto
  // Accesos
  diasPrueba: number; // duración del acceso de prueba
  // Soporte
  soporteAutoRespuesta: string; // respuesta automática al recibir un reporte
}
