/** Punto de entrada de la capa de datos de FlightPath. */
export * from "./types";
export * from "./materias";
export * from "./auth";
export * from "./domain";
export * from "./gating";
export * from "./analytics";
export * from "./hooks";
export * from "./yaris";
export { ensureSeeded, DEMO_STUDENT_ID, DEMO_ADMIN_ID, DEMO_BASIC_ID, DEMO_PASSWORD } from "./seed";
export { uid, nowISO, todayKey, subscribe as subscribeStore } from "./db";
