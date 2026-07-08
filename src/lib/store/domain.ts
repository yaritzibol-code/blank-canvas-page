/**
 * Operaciones de dominio: progreso, intentos, bitácora, recordatorios,
 * reportes, banco de preguntas, contenido y configuración interna.
 */
import { read, write, update, uid, nowISO, todayKey } from "./db";
import type {
  ActivityEvent,
  ActivityKind,
  AccessChange,
  BankQuestion,
  BitacoraEntry,
  Clase,
  ClaseProgress,
  FlashCardItem,
  FlashCardState,
  FlashSession,
  InternalConfig,
  Material,
  QuizAttempt,
  Reminder,
  Report,
  SimAttempt,
  StudyDays,
  TemaProgress,
} from "./types";

/* ───────────────────────── Actividad y tiempo de estudio ───────────────────────── */

export function getActivity(userId?: string): ActivityEvent[] {
  const all = read<ActivityEvent[]>("activity", []);
  return userId ? all.filter((a) => a.userId === userId) : all;
}

export function logActivity(input: {
  userId: string;
  kind: ActivityKind;
  label: string;
  score?: number | null;
  durationMin?: number;
}): ActivityEvent {
  const ev: ActivityEvent = {
    id: uid("act"),
    userId: input.userId,
    date: nowISO(),
    kind: input.kind,
    label: input.label,
    score: input.score ?? null,
    durationMin: input.durationMin ?? 0,
  };
  update<ActivityEvent[]>("activity", [], (a) => [...a, ev]);
  if (ev.durationMin > 0) addStudySeconds(input.userId, Math.round(ev.durationMin * 60));
  return ev;
}

export function getStudyDays(userId: string): StudyDays {
  return read<Record<string, StudyDays>>("study_days", {})[userId] ?? {};
}

export function addStudySeconds(userId: string, secs: number, day = todayKey()) {
  if (secs <= 0) return;
  update<Record<string, StudyDays>>("study_days", {}, (all) => ({
    ...all,
    [userId]: { ...(all[userId] ?? {}), [day]: (all[userId]?.[day] ?? 0) + secs },
  }));
}

/** Racha: días consecutivos con actividad de estudio, terminando hoy o ayer. */
export function getStreak(userId: string): number {
  const days = getStudyDays(userId);
  const activeDays = new Set(Object.keys(days).filter((d) => (days[d] ?? 0) >= 60));
  getActivity(userId).forEach((a) => {
    if (a.kind !== "login") activeDays.add(a.date.slice(0, 10));
  });
  let streak = 0;
  const cursor = new Date();
  if (!activeDays.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getTotalStudyHours(userId: string): number {
  const days = getStudyDays(userId);
  const secs = Object.values(days).reduce((s, v) => s + v, 0);
  return Math.round(secs / 3600);
}

/* ───────────────────────── Banco de preguntas ───────────────────────── */

export function getQuestions(): BankQuestion[] {
  return read<BankQuestion[]>("questions", []);
}

export function getPublishedQuestions(materia?: string): BankQuestion[] {
  return getQuestions().filter(
    (q) => q.status === "publicada" && (!materia || q.materia === materia),
  );
}

export function saveQuestion(q: BankQuestion) {
  update<BankQuestion[]>("questions", [], (all) => {
    const idx = all.findIndex((x) => x.id === q.id);
    const next = { ...q, updatedAt: nowISO() };
    if (idx === -1) return [...all, next];
    const copy = [...all];
    copy[idx] = next;
    return copy;
  });
}

export function createQuestion(input: {
  materia: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  cite?: string;
  status?: BankQuestion["status"];
  source?: BankQuestion["source"];
}): BankQuestion {
  const q: BankQuestion = {
    id: uid("q"),
    materia: input.materia,
    text: input.text,
    options: input.options,
    correctIndex: input.correctIndex,
    explanation: input.explanation,
    cite: input.cite ?? "",
    status: input.status ?? "borrador",
    source: input.source ?? "manual",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  saveQuestion(q);
  return q;
}

export function deleteQuestion(id: string) {
  update<BankQuestion[]>("questions", [], (all) => all.filter((q) => q.id !== id));
}

/** Las 10 preguntas fijas por materia para la suscripción básica. */
export function getFreeQuestions(materia: string): BankQuestion[] {
  return getPublishedQuestions(materia)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, 10);
}

/* ───────────────────────── Intentos: cuestionarios y simulador ───────────────────────── */

export function getQuizAttempts(userId: string): QuizAttempt[] {
  return read<QuizAttempt[]>("quiz_attempts", []).filter((a) => a.userId === userId);
}

export function saveQuizAttempt(a: Omit<QuizAttempt, "id" | "date">): QuizAttempt {
  const full: QuizAttempt = { ...a, id: uid("quiz"), date: nowISO() };
  update<QuizAttempt[]>("quiz_attempts", [], (all) => [...all, full]);
  logActivity({
    userId: a.userId,
    kind: "quiz",
    label: `Cuestionario — ${a.materias.length === 1 ? a.materias[0] : "Varias materias"}`,
    score: a.total ? Math.round((a.correct / a.total) * 100) : null,
    durationMin: a.durationMin,
  });
  return full;
}

export function getSimAttempts(userId: string): SimAttempt[] {
  return read<SimAttempt[]>("sim_attempts", []).filter((a) => a.userId === userId);
}

export function saveSimAttempt(a: Omit<SimAttempt, "id" | "date">): SimAttempt {
  const full: SimAttempt = { ...a, id: uid("sim"), date: nowISO() };
  update<SimAttempt[]>("sim_attempts", [], (all) => [...all, full]);
  logActivity({
    userId: a.userId,
    kind: "simulador",
    label: "Simulador CIAAC completo",
    score: Math.round(a.scorePct),
    durationMin: Math.round(a.durationSecs / 60),
  });
  return full;
}

/** ¿Cuántos simuladores ha hecho el usuario en el mes calendario actual? */
export function simAttemptsThisMonth(userId: string): number {
  const now = new Date();
  return getSimAttempts(userId).filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

/* ───────────────────────── Progreso de Learning Paths ───────────────────────── */

export function getTemaProgress(userId: string): TemaProgress[] {
  return read<TemaProgress[]>("tema_progress", []).filter((t) => t.userId === userId);
}

export function isTemaCompleted(userId: string, temaId: string): boolean {
  return getTemaProgress(userId).some((t) => t.temaId === temaId && t.completado);
}

export function completeTema(userId: string, temaId: string, dificultad: number | null, label: string, duracionMin = 15) {
  update<TemaProgress[]>("tema_progress", [], (all) => {
    const rest = all.filter((t) => !(t.userId === userId && t.temaId === temaId));
    return [...rest, { userId, temaId, completado: true, dificultad, fecha: nowISO() }];
  });
  logActivity({ userId, kind: "tema", label, score: null, durationMin: duracionMin });
}

/* ───────────────────────── Clases grabadas ───────────────────────── */

export function getClases(): Clase[] {
  return read<Clase[]>("clases", []);
}

export function saveClase(c: Clase) {
  update<Clase[]>("clases", [], (all) => {
    const idx = all.findIndex((x) => x.id === c.id);
    const next = { ...c, updatedAt: nowISO() };
    if (idx === -1) return [...all, next];
    const copy = [...all];
    copy[idx] = next;
    return copy;
  });
}

export function deleteClase(id: string) {
  update<Clase[]>("clases", [], (all) => all.filter((c) => c.id !== id));
}

export function getClaseProgress(userId: string): ClaseProgress[] {
  return read<ClaseProgress[]>("clase_progress", []).filter((c) => c.userId === userId);
}

export function upsertClaseProgress(p: ClaseProgress) {
  update<ClaseProgress[]>("clase_progress", [], (all) => {
    const rest = all.filter((c) => !(c.userId === p.userId && c.claseId === p.claseId));
    return [...rest, { ...p, updatedAt: nowISO() }];
  });
}

/* ───────────────────────── Materiales de Biblioteca ───────────────────────── */

export function getMateriales(): Material[] {
  return read<Material[]>("materiales", []);
}

export function saveMaterial(m: Material) {
  update<Material[]>("materiales", [], (all) => {
    const idx = all.findIndex((x) => x.id === m.id);
    const next = { ...m, updatedAt: nowISO() };
    if (idx === -1) return [...all, next];
    const copy = [...all];
    copy[idx] = next;
    return copy;
  });
}

export function deleteMaterial(id: string) {
  update<Material[]>("materiales", [], (all) => all.filter((m) => m.id !== id));
}

/* ───────────────────────── Flashcards ───────────────────────── */

export function getFlashcards(): FlashCardItem[] {
  return read<FlashCardItem[]>("flashcards", []);
}

export function saveFlashcard(c: FlashCardItem) {
  update<FlashCardItem[]>("flashcards", [], (all) => {
    const idx = all.findIndex((x) => x.id === c.id);
    if (idx === -1) return [...all, c];
    const copy = [...all];
    copy[idx] = c;
    return copy;
  });
}

export function deleteFlashcard(id: string) {
  update<FlashCardItem[]>("flashcards", [], (all) => all.filter((c) => c.id !== id));
}

export function getFlashStates(userId: string): FlashCardState[] {
  return read<FlashCardState[]>("flash_states", []).filter((s) => s.userId === userId);
}

export function setFlashState(userId: string, cardId: string, state: "dominada" | "repasar") {
  update<FlashCardState[]>("flash_states", [], (all) => {
    const rest = all.filter((s) => !(s.userId === userId && s.cardId === cardId));
    return [...rest, { userId, cardId, state, updatedAt: nowISO() }];
  });
}

export function saveFlashSession(s: Omit<FlashSession, "id" | "date">): FlashSession {
  const full: FlashSession = { ...s, id: uid("fs"), date: nowISO() };
  update<FlashSession[]>("flash_sessions", [], (all) => [...all, full]);
  logActivity({
    userId: s.userId,
    kind: "flashcards",
    label: `Flashcards — ${s.tema}`,
    score: s.total ? Math.round((s.knew / s.total) * 100) : null,
    durationMin: Math.max(1, Math.round(s.total * 0.5)),
  });
  return full;
}

export function getFlashSessions(userId: string): FlashSession[] {
  return read<FlashSession[]>("flash_sessions", []).filter((s) => s.userId === userId);
}

/* ───────────────────────── Mi Bitácora ───────────────────────── */

export function getBitacora(userId: string): BitacoraEntry[] {
  return read<BitacoraEntry[]>("bitacora", [])
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveBitacoraEntry(e: Omit<BitacoraEntry, "id" | "date">): BitacoraEntry {
  const full: BitacoraEntry = { ...e, id: uid("bit"), date: nowISO() };
  update<BitacoraEntry[]>("bitacora", [], (all) => [...all, full]);
  logActivity({ userId: e.userId, kind: "bitacora", label: "Entrada de bitácora", durationMin: 0 });
  return full;
}

/* ───────────────────────── Recordatorios ───────────────────────── */

export function getReminders(userId: string): Reminder[] {
  return read<Reminder[]>("reminders", []).filter((r) => r.userId === userId);
}

export function getAllReminders(): Reminder[] {
  return read<Reminder[]>("reminders", []);
}

export function saveReminder(r: Reminder) {
  update<Reminder[]>("reminders", [], (all) => {
    const idx = all.findIndex((x) => x.id === r.id);
    if (idx === -1) return [...all, r];
    const copy = [...all];
    copy[idx] = r;
    return copy;
  });
}

export function deleteReminder(id: string) {
  update<Reminder[]>("reminders", [], (all) => all.filter((r) => r.id !== id));
}

/* ───────────────────────── Reportes / soporte ───────────────────────── */

export function getReports(): Report[] {
  return read<Report[]>("reports", []).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function submitReport(input: Omit<Report, "id" | "fecha" | "estado" | "notasInternas">): Report {
  const r: Report = { ...input, id: uid("rep"), fecha: nowISO(), estado: "pendiente", notasInternas: "" };
  update<Report[]>("reports", [], (all) => [...all, r]);
  return r;
}

export function updateReport(id: string, patch: Partial<Report>) {
  update<Report[]>("reports", [], (all) =>
    all.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  );
}

/* ───────────────────────── Accesos / membresías ───────────────────────── */

export function getAccessChanges(userId?: string): AccessChange[] {
  const all = read<AccessChange[]>("access_changes", []);
  return (userId ? all.filter((c) => c.userId === userId) : all).sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  );
}

export function logAccessChange(userId: string, accion: string, detalle: string) {
  update<AccessChange[]>("access_changes", [], (all) => [
    ...all,
    { id: uid("acc"), userId, fecha: nowISO(), accion, detalle },
  ]);
}

/* ───────────────────────── Configuración interna ───────────────────────── */

export const DEFAULT_CONFIG: InternalConfig = {
  nombrePlataforma: "FlightPath",
  slogan: "Aprende, Domina y Vuela",
  contactoEmail: "contacto@flowstateai.com.mx",
  whatsappSoporte: "+52 55 1234 5678",
  mensajeBienvenida: "¡Bienvenido a FlightPath! Aprende a tu ritmo, aprueba con confianza.",
  mensajeConversion:
    "¿Listo para el siguiente nivel? Desbloquea FlightPath completo y prepárate con todas las herramientas para tu CIAAC.",
  precioPlanAnual: "$10,000 MXN",
  proveedorWhatsApp: "",
  simuladorPreguntas: 310,
  simuladorHoras: 5,
  pctMinimoClase: 85,
};

export function getConfig(): InternalConfig {
  return { ...DEFAULT_CONFIG, ...read<Partial<InternalConfig>>("config", {}) };
}

export function saveConfig(patch: Partial<InternalConfig>) {
  write("config", { ...read<Partial<InternalConfig>>("config", {}), ...patch });
}

/* ───────────────────────── Carga CSV del banco ───────────────────────── */

export interface CsvImportResult {
  imported: number;
  errors: { row: number; error: string }[];
}

/** Parser CSV simple con soporte de comillas y saltos de línea embebidos. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

const CSV_HEADERS = ["pregunta", "opción a", "opción b", "opción c", "respuesta correcta", "explicación"];

/**
 * Importa preguntas desde CSV (columnas del PRD 9.6: Pregunta, Opción A,
 * Opción B, Opción C, Respuesta correcta, Explicación). Quedan en borrador.
 */
export function importQuestionsCsv(text: string): CsvImportResult {
  const rows = parseCsv(text);
  const errors: CsvImportResult["errors"] = [];
  if (rows.length === 0) return { imported: 0, errors: [{ row: 0, error: "El archivo está vacío." }] };

  const norm = (s: string) =>
    s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const header = rows[0].map(norm);
  const expected = CSV_HEADERS.map(norm);
  const hasHeader = expected.every((h) => header.includes(h));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const colIdx = (name: string) => (hasHeader ? header.indexOf(norm(name)) : CSV_HEADERS.indexOf(name));

  let imported = 0;
  dataRows.forEach((cells, i) => {
    const rowNum = i + (hasHeader ? 2 : 1);
    const get = (name: string) => (cells[colIdx(name)] ?? "").trim();
    const pregunta = get("pregunta");
    const opciones = [get("opción a"), get("opción b"), get("opción c")].filter((o) => o !== "");
    const correcta = get("respuesta correcta");
    const explicacion = get("explicación");

    if (!pregunta) return errors.push({ row: rowNum, error: "Falta el texto de la pregunta." });
    if (opciones.length < 2)
      return errors.push({ row: rowNum, error: "Se requieren al menos 2 opciones completas." });
    if (!correcta) return errors.push({ row: rowNum, error: "Falta la respuesta correcta." });
    const correctIndex = opciones.findIndex(
      (o) => o.toLowerCase() === correcta.toLowerCase(),
    );
    if (correctIndex === -1)
      return errors.push({
        row: rowNum,
        error: "La respuesta correcta no coincide exactamente con ninguna opción.",
      });
    if (!explicacion) return errors.push({ row: rowNum, error: "Falta la explicación." });

    createQuestion({
      materia: "",
      text: pregunta,
      options: opciones,
      correctIndex,
      explanation: explicacion,
      status: "borrador",
      source: "import",
    });
    imported++;
  });

  return { imported, errors };
}
