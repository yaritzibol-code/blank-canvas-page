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
export {
  ensureQuestions,
  ensureQuestionsByIds,
  questionsLoaded,
  fetchBankCounts,
  clearQuestionMemory,
  type BankScope,
  type BankCount,
} from "./questions-cloud";
export * from "./yaris";
export * from "./rtari";
export * from "./compass";
export * from "./lp737";
export {
  ensureSeededAsync,
  DEMO_STUDENT_ID,
  DEMO_ADMIN_ID,
  DEMO_BASIC_ID,
  DEMO_PASSWORD,
} from "./seed-meta";
export { uid, nowISO, todayKey, subscribe as subscribeStore } from "./db";
export { cloudEnabled } from "./cloud";
export { cloudSessionActive, refreshCloudData, lastCloudRefresh, flushCloudWrites } from "./sync";
export {
  sessionKey,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
  listActiveSessions,
  type ActiveSessionInfo,
} from "./active-session";
