/**
 * Notificaciones del equipo admin a las alumnas: las "transmisiones de radio"
 * que aparecen como pop-up en la cabina.
 *
 * Nube: `notifications` guarda cada transmisión y `notification_reads` el
 * "Recibido" de cada alumna (migración 20260925120000_notificaciones). La RLS
 * le entrega a cada alumna sólo las generales y las suyas. Lo descargado vive
 * en memoria y no en disco: en un equipo compartido no queda el mensaje de una
 * alumna para la siguiente sesión. En disco sólo se anotan los ids que esta
 * alumna ya recibió, para no repetirle una transmisión si la nube tarda.
 *
 * Sin nube (desarrollo local) todo vive en el store local y la admin y la
 * alumna del mismo navegador se ven entre sí.
 */
import { getSessionUser } from "./auth";
import { supa } from "./cloud";
import { nowISO, read, touch, update } from "./db";
import { cloudSessionActive, registerLiveRefresher } from "./sync";
import type { User } from "./types";

export type NotiKind = "aviso" | "importante" | "logro" | "reporte";
export type NotiAudience = "all" | "users";
/** Respuesta a un reporte: "correcto" = la alumna tenía razón. */
export type NotiVeredicto = "correcto" | "incorrecto" | "info";

export interface NotiData {
  /** Quién firma la transmisión (si falta, "Torre FlightPath"). */
  remitente?: string;
  veredicto?: NotiVeredicto;
  /** Texto de la pregunta reportada (respuestas a un reporte). */
  pregunta?: string;
  /** Tipo del reporte original ("Respuesta incorrecta"…). */
  reporteTipo?: string;
}

export interface Notificacion {
  id: string;
  createdAt: string;
  createdBy: string | null;
  audience: NotiAudience;
  /** Ids de las alumnas (vacío si es para todas). */
  recipients: string[];
  kind: NotiKind;
  title: string;
  body: string;
  startsAt: string;
  /** Hasta cuándo aparece; null = hasta que la alumna la reciba. */
  endsAt: string | null;
  reportId: string | null;
  data: NotiData;
}

export interface NotiLectura {
  userId: string;
  readAt: string;
}

export interface NuevaNotificacion {
  audience: NotiAudience;
  recipients: string[];
  kind: NotiKind;
  title: string;
  body: string;
  endsAt: string | null;
  reportId?: string | null;
  data?: NotiData;
}

export type EnvioNotificacion =
  { ok: true; notificacion: Notificacion } | { ok: false; error: string };

/** Lista completa en modo local. */
const LOCAL_KEY = "notificaciones";
/** userId → (id de transmisión → cuándo la recibió). */
const VISTAS_KEY = "notificaciones_vistas";
/** Cuántas anotaciones se guardan por alumna. */
const MAX_VISTAS = 300;
/** Margen para relojes atrasados en el equipo de la alumna. */
const MARGEN_INICIO_MS = 5 * 60_000;
/** Si la tabla no existe todavía, se vuelve a comprobar cada tanto. */
const REINTENTO_SIN_TABLA_MS = 10 * 60_000;

export const NOTIFICACIONES_NO_DISPONIBLES =
  "Las notificaciones todavía no están activadas en la base de datos: falta aplicar la migración 20260925120000_notificaciones.";

interface NotiRow {
  id: string;
  created_at: string;
  created_by: string | null;
  audience: NotiAudience;
  recipients: string[] | null;
  kind: NotiKind;
  title: string | null;
  body: string;
  starts_at: string;
  ends_at: string | null;
  report_id: string | null;
  data: NotiData | null;
}

function fromRow(r: NotiRow): Notificacion {
  return {
    id: r.id,
    createdAt: r.created_at,
    createdBy: r.created_by,
    audience: r.audience,
    recipients: r.recipients ?? [],
    kind: r.kind,
    title: r.title ?? "",
    body: r.body,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    reportId: r.report_id,
    data: r.data ?? {},
  };
}

/* ───────────────────────── Estado en memoria (nube) ───────────────────────── */

let cache: { owner: string | null; list: Notificacion[]; lecturas: Map<string, NotiLectura[]> } = {
  owner: null,
  list: [],
  lecturas: new Map(),
};
/** null = aún no se sabe si la tabla existe. */
let disponible: boolean | null = null;
let reintentarEn = 0;
/** "Recibido" que la nube todavía no confirma. */
const acksPendientes = new Set<string>();
/** Cambios locales: un refresco que empezó antes de uno no pisa su resultado. */
let mutaciones = 0;

function cacheDe(userId: string) {
  if (cache.owner !== userId) cache = { owner: userId, list: [], lecturas: new Map() };
  return cache;
}

function mutar(userId: string, fn: (c: typeof cache) => void) {
  mutaciones++;
  fn(cacheDe(userId));
  touch();
}

type Resultado = { error: { code?: string } | null; status?: number };

/** La tabla no existe (la migración no se ha aplicado). */
function faltaTabla(res: Resultado): boolean {
  const code = res.error?.code ?? "";
  return code === "PGRST205" || code === "42P01" || (!!res.error && res.status === 404);
}

/** Errores que no se arreglan reintentando. */
function esPermanente(res: Resultado): boolean {
  const code = res.error?.code ?? "";
  return faltaTabla(res) || ["23503", "23514", "42501", "22P02"].includes(code);
}

function marcarNoDisponible() {
  if (disponible !== false) {
    disponible = false;
    touch();
  }
  reintentarEn = Date.now() + REINTENTO_SIN_TABLA_MS;
}

/** false si la nube no tiene las tablas; null mientras no se ha comprobado. */
export function notificacionesDisponibles(): boolean | null {
  return cloudSessionActive() ? disponible : true;
}

function nuevoId(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/* ───────────────────────── Lectura ───────────────────────── */

/** Todas las que ve la sesión: la admin, todas; la alumna, las suyas. Más nuevas primero. */
export function getNotificaciones(): Notificacion[] {
  const user = getSessionUser();
  if (!user) return [];
  const list = cloudSessionActive()
    ? cache.owner === user.id
      ? cache.list
      : []
    : read<Notificacion[]>(LOCAL_KEY, []);
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function vistasDe(userId: string): Record<string, string> {
  return read<Record<string, Record<string, string>>>(VISTAS_KEY, {})[userId] ?? {};
}

/** Quiénes ya tocaron "Recibido" (la admin ve a todas; la alumna, a sí misma). */
export function getNotiLecturas(id: string): NotiLectura[] {
  if (cloudSessionActive()) return cache.lecturas.get(id) ?? [];
  const vistas = read<Record<string, Record<string, string>>>(VISTAS_KEY, {});
  return Object.entries(vistas).flatMap(([userId, m]) =>
    m[id] ? [{ userId, readAt: m[id] }] : [],
  );
}

export function notificacionEsPara(n: Notificacion, user: Pick<User, "id">): boolean {
  return n.audience === "all" || n.recipients.includes(user.id);
}

/** Dentro de su ventana de tiempo. */
export function notificacionVigente(n: Notificacion, now = Date.now()): boolean {
  const inicio = Date.parse(n.startsAt);
  const fin = n.endsAt ? Date.parse(n.endsAt) : Infinity;
  return inicio - MARGEN_INICIO_MS <= now && now < fin;
}

export function estadoNotificacion(n: Notificacion, now = Date.now()): "activa" | "terminada" {
  return n.endsAt && Date.parse(n.endsAt) <= now ? "terminada" : "activa";
}

/** Las que esta alumna aún no recibe, de la más antigua a la más nueva. */
export function notificacionesPendientes(user: User | null, now = Date.now()): Notificacion[] {
  if (!user) return [];
  const vistas = vistasDe(user.id);
  return getNotificaciones()
    .filter((n) => notificacionEsPara(n, user) && notificacionVigente(n, now) && !vistas[n.id])
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Transmisiones enviadas como respuesta a un reporte. */
export function notificacionesDeReporte(reportId: string): Notificacion[] {
  return getNotificaciones().filter((n) => n.reportId === reportId);
}

/* ───────────────────────── "Recibido" ───────────────────────── */

function anotarVistas(userId: string, nuevas: [string, string][]) {
  if (nuevas.length === 0) return;
  update<Record<string, Record<string, string>>>(VISTAS_KEY, {}, (todas) => {
    const mias = { ...(todas[userId] ?? {}) };
    for (const [id, readAt] of nuevas) if (!mias[id]) mias[id] = readAt;
    const recortadas = Object.entries(mias)
      .sort((a, b) => b[1].localeCompare(a[1]))
      .slice(0, MAX_VISTAS);
    return { ...todas, [userId]: Object.fromEntries(recortadas) };
  });
}

async function subirAcks(userId: string): Promise<void> {
  const s = supa();
  if (!s) return;
  for (const id of [...acksPendientes]) {
    const res = await s
      .from("notification_reads")
      .upsert(
        { notification_id: id, user_id: userId },
        { onConflict: "notification_id,user_id", ignoreDuplicates: true },
      );
    if (!res.error || esPermanente(res)) acksPendientes.delete(id);
  }
}

/** La alumna tocó "Recibido": no se le vuelve a mostrar. */
export async function marcarNotificacionRecibida(id: string): Promise<void> {
  const user = getSessionUser();
  if (!user) return;
  anotarVistas(user.id, [[id, nowISO()]]);
  if (!cloudSessionActive()) return;
  acksPendientes.add(id);
  await subirAcks(user.id);
}

/* ───────────────────────── Refresco desde la nube ───────────────────────── */

export async function refreshNotificaciones(): Promise<void> {
  const s = supa();
  const user = getSessionUser();
  if (!s || !user || !cloudSessionActive()) return;
  if (disponible === false && Date.now() < reintentarEn) return;
  if (acksPendientes.size > 0) await subirAcks(user.id);

  const inicio = mutaciones;
  const admin = user.role === "admin";
  const base = s.from("notifications").select("*");
  const res = admin
    ? await base.order("created_at", { ascending: false }).limit(100)
    : await base
        .or(`ends_at.is.null,ends_at.gt."${new Date().toISOString()}"`)
        .order("created_at", { ascending: true })
        .limit(50);
  if (res.error) {
    if (faltaTabla(res)) marcarNoDisponible();
    return;
  }
  if (disponible !== true) disponible = true;
  const list = ((res.data ?? []) as NotiRow[]).map(fromRow);

  const lecturas = new Map<string, NotiLectura[]>();
  const ids = list.map((n) => n.id);
  if (ids.length > 0) {
    const r2 = await s
      .from("notification_reads")
      .select("notification_id,user_id,read_at")
      .in("notification_id", ids);
    if (r2.error) return;
    for (const r of (r2.data ?? []) as {
      notification_id: string;
      user_id: string;
      read_at: string;
    }[]) {
      const l = lecturas.get(r.notification_id) ?? [];
      l.push({ userId: r.user_id, readAt: r.read_at });
      lecturas.set(r.notification_id, l);
    }
  }

  // Cambió la sesión, o hubo un envío o un cambio mientras se leía: esta
  // lectura ya es vieja y el siguiente refresco trae la versión buena.
  if (getSessionUser()?.id !== user.id || mutaciones !== inicio) return;
  cache = { owner: user.id, list, lecturas };
  // Lo que esta alumna recibió en otro dispositivo cuenta como recibido aquí.
  const vistas = vistasDe(user.id);
  anotarVistas(
    user.id,
    [...lecturas.entries()].flatMap(([id, ls]) =>
      ls
        .filter((l) => l.userId === user.id && !vistas[id])
        .map((l) => [id, l.readAt] as [string, string]),
    ),
  );
  touch();
}

registerLiveRefresher(refreshNotificaciones);

/* ───────────────────────── Acciones de la admin ───────────────────────── */

export async function enviarNotificacion(input: NuevaNotificacion): Promise<EnvioNotificacion> {
  const user = getSessionUser();
  const body = input.body.trim();
  if (!user) return { ok: false, error: "Tu sesión terminó. Vuelve a iniciar sesión." };
  if (!body) return { ok: false, error: "Escribe el mensaje." };
  const recipients = input.audience === "all" ? [] : [...new Set(input.recipients)];
  if (input.audience === "users" && recipients.length === 0)
    return { ok: false, error: "Elige al menos una alumna." };
  const n: Notificacion = {
    id: nuevoId(),
    createdAt: nowISO(),
    createdBy: user.id,
    audience: input.audience,
    recipients,
    kind: input.kind,
    title: input.title.trim(),
    body,
    startsAt: nowISO(),
    endsAt: input.endsAt,
    reportId: input.reportId ?? null,
    data: input.data ?? {},
  };

  if (!cloudSessionActive()) {
    update<Notificacion[]>(LOCAL_KEY, [], (all) => [...all, n]);
    return { ok: true, notificacion: n };
  }
  const s = supa();
  if (!s) return { ok: false, error: "No hay conexión con la nube." };
  // created_at y starts_at los pone el servidor: el reloj de la admin puede ir
  // adelantado y la transmisión tardaría en aparecer.
  const res = await s
    .from("notifications")
    .insert({
      id: n.id,
      audience: n.audience,
      recipients: n.recipients,
      kind: n.kind,
      title: n.title,
      body: n.body,
      ends_at: n.endsAt,
      report_id: n.reportId,
      data: n.data,
    })
    .select("*")
    .single();
  if (res.error) {
    if (faltaTabla(res)) {
      marcarNoDisponible();
      return { ok: false, error: NOTIFICACIONES_NO_DISPONIBLES };
    }
    return {
      ok: false,
      error: "No se pudo enviar la transmisión. Revisa tu conexión e inténtalo de nuevo.",
    };
  }
  disponible = true;
  const guardada = fromRow(res.data as NotiRow);
  mutar(user.id, (c) => {
    c.list = [guardada, ...c.list.filter((x) => x.id !== guardada.id)];
  });
  return { ok: true, notificacion: guardada };
}

/** Deja de mostrarse desde ahora (a quien no la haya recibido todavía). */
export async function terminarNotificacion(id: string): Promise<boolean> {
  const user = getSessionUser();
  if (!user) return false;
  const endsAt = nowISO();
  if (!cloudSessionActive()) {
    update<Notificacion[]>(LOCAL_KEY, [], (all) =>
      all.map((n) => (n.id === id ? { ...n, endsAt } : n)),
    );
    return true;
  }
  const s = supa();
  if (!s) return false;
  const res = await s.from("notifications").update({ ends_at: endsAt }).eq("id", id);
  if (res.error) return false;
  mutar(user.id, (c) => {
    c.list = c.list.map((n) => (n.id === id ? { ...n, endsAt } : n));
  });
  return true;
}

export async function eliminarNotificacion(id: string): Promise<boolean> {
  const user = getSessionUser();
  if (!user) return false;
  if (!cloudSessionActive()) {
    update<Notificacion[]>(LOCAL_KEY, [], (all) => all.filter((n) => n.id !== id));
    return true;
  }
  const s = supa();
  if (!s) return false;
  const res = await s.from("notifications").delete().eq("id", id);
  if (res.error) return false;
  mutar(user.id, (c) => {
    c.list = c.list.filter((n) => n.id !== id);
    c.lecturas.delete(id);
  });
  return true;
}
