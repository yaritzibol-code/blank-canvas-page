/** Punto de entrada de la capa de datos de FlightPath. */
export * from "./types";
export * from "./materias";
export * from "./genero";
export * from "./auth";
export * from "./domain";
export * from "./gating";
export * from "./analytics";
export * from "./pathy-analysis";
export * from "./hooks";
export * from "./use-questions";
export { ensureQuestions, questionsLoaded } from "./questions-cloud";
export * from "./yaris";
export { ensureSeeded, DEMO_STUDENT_ID, DEMO_ADMIN_ID, DEMO_BASIC_ID, DEMO_PASSWORD } from "./seed";
export { uid, nowISO, todayKey, subscribe as subscribeStore } from "./db";
export { cloudEnabled } from "./cloud";
export { cloudSessionActive, refreshCloudData, lastCloudRefresh } from "./sync";
export {
  sessionKey,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
  listActiveSessions,
  type ActiveSessionInfo,
} from "./active-session";
