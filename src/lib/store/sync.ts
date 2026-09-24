/**
 * Motor de sincronización con Lovable Cloud (Supabase).
 *
 * Estrategia: localStorage sigue siendo la caché de trabajo (la UI no cambia);
 * con sesión de nube activa, cada colección se hidrata desde Postgres al entrar
 * y cada escritura local se empuja (con debounce) a su tabla:
 *
 *   users            → profiles     (fila por usuario; RLS: propio o admin)
 *   questions/materiales/clases/flashcards → content (fila por elemento; escribe admin)
 *   colecciones por usuario (intentos, progreso, bitácora, recordatorios…)
 *                    → user_state   (una fila por usuario+colección; RLS: propio)
 *   reports          → reports      (alta del alumno; gestión de la admin)
 *   access_changes/config → app_state (escribe admin; config legible por todos)
 *
 * Las colecciones de filas con id (perfiles, contenido y reportes) suben SÓLO
 * las filas que cambiaron en este navegador. Antes se subía la colección
 * completa en cada escritura, con lo que la copia local vieja de un navegador
 * pisaba lo que otro acababa de guardar: una alumna que reportaba una segunda
 * pregunta devolvía a "pendiente" el ticket que la admin ya había resuelto, y
 * editar una pregunta en el Banco revertía la corrección hecha desde Soporte.
 *
 * Sin credenciales de nube todo esto queda inactivo y la app opera 100% local.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { read, write, setWriteHook } from "./db";
import { supa, cloudEnabled } from "./cloud";
import { defaultPrefs } from "./auth";
import { SEED_VERSION } from "./seed-meta";
import type { BankQuestion, Material, Clase, FlashCardItem, Report, User } from "./types";

/** Colecciones de contenido global (fuente: Panel Admin). */
const CONTENT_KEYS = ["questions", "materiales", "clases", "flashcards"] as const;
type ContentKey = (typeof CONTENT_KEYS)[number];

/** Colecciones por usuario: arreglos de filas con campo userId. */
const USER_ARRAY_KEYS = [
  "activity",
  "quiz_attempts",
  "sim_attempts",
  "tema_progress",
  "bitacora",
  "reminders",
  "clase_progress",
  "flash_states",
  "flash_sessions",
  "pathy_reports",
  "rtari_sessions",
  "compass_sessions",
  "lp_started",
  "lp_journey_state",
  "logros",
  "logros_destacados",
] as const;

/** Colecciones administrativas guardadas como llave/valor. */
const APP_STATE_KEYS = ["access_changes", "config"] as const;

/** Colecciones de filas con id: se sincronizan fila por fila. */
const ROW_KEYS: readonly string[] = [...CONTENT_KEYS, "reports", "users"];

type Row = { id?: string; userId?: string } & Record<string, unknown>;

let sessionUserId: string | null = null;
let sessionIsAdmin = false;
let applyingRemote = false;
let started = false;
const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();

/* ───────────────────── Cambios locales pendientes ───────────────────── */

/** Última copia conocida de cada fila (id → JSON), para saber qué cambió aquí. */
const seen = new Map<string, Map<string, string>>();
/** Filas cambiadas o borradas aquí que la nube todavía no confirma. */
const dirty = new Map<string, Set<string>>();
/** Colecciones completas (estado por usuario, config…) sin confirmar. */
const unsynced = new Set<string>();
/** Escrituras locales por colección completa, para detectar cambios durante una subida. */
const writeSeq = new Map<string, number>();
/** Subidas en curso: una a la vez por colección. */
const pushing = new Map<string, Promise<boolean>>();
/** Momento de la última subida confirmada por colección. */
const lastPushOk = new Map<string, number>();
/** Reintentos consecutivos tras un fallo (para el backoff). */
const retryAttempts = new Map<string, number>();

function rowId(r: Row): string {
  return String(r.id);
}

function isRowKey(key: string): boolean {
  return ROW_KEYS.includes(key);
}

function indexRows(rows: Row[]): Map<string, string> {
  const map = new Map<string, string>();
  rows.forEach((r) => map.set(rowId(r), JSON.stringify(r)));
  return map;
}

function dirtyOf(key: string): Set<string> {
  let ids = dirty.get(key);
  if (!ids) {
    ids = new Set();
    dirty.set(key, ids);
  }
  return ids;
}

/** Marca como pendientes las filas que cambiaron con esta escritura local. */
function trackLocalRows(key: string): void {
  const next = indexRows(read<Row[]>(key, []));
  const prev = seen.get(key) ?? new Map<string, string>();
  const ids = dirtyOf(key);
  next.forEach((json, id) => {
    if (prev.get(id) !== json) ids.add(id);
  });
  prev.forEach((_json, id) => {
    if (!next.has(id)) ids.add(id);
  });
  seen.set(key, next);
}

function hasPending(key: string): boolean {
  return isRowKey(key) ? (dirty.get(key)?.size ?? 0) > 0 : unsynced.has(key);
}

/** Algo de esta colección aún no llega a la nube o está subiendo. */
function isBusy(key: string): boolean {
  return hasPending(key) || pushTimers.has(key) || pushing.has(key);
}

function silently(fn: () => void) {
  applyingRemote = true;
  try {
    fn();
  } finally {
    applyingRemote = false;
  }
}

/**
 * Escribe filas llegadas de la nube sin pisar lo que se cambió aquí y aún no
 * se sube. `replace`: la nube trae la colección completa. `merge`: trae un
 * lote que se suma a lo que ya hay (el banco llega por partes); `drop` marca
 * las filas locales que ese lote sustituye por completo.
 */
function applyRemoteRows(
  key: string,
  remote: Row[],
  mode: "replace" | "merge",
  drop?: (row: Row) => boolean,
): void {
  const pending = dirty.get(key);
  const local = read<Row[]>(key, []);
  const out = new Map<string, Row>();
  if (mode === "merge") {
    local.forEach((r) => {
      const id = rowId(r);
      if (drop && !pending?.has(id) && drop(r)) return;
      out.set(id, r);
    });
  }
  remote.forEach((r) => {
    const id = rowId(r);
    if (!pending?.has(id)) out.set(id, r);
  });
  if (pending && pending.size > 0) {
    const localById = new Map(local.map((r) => [rowId(r), r]));
    pending.forEach((id) => {
      const mine = localById.get(id);
      if (mine) out.set(id, mine);
      // Borrada aquí y aún sin confirmar: que la nube no la reviva.
      else out.delete(id);
    });
  }
  const rows = [...out.values()];
  silently(() => write(key, rows));
  seen.set(key, indexRows(rows));
}

/* ───────────────────────── Mapeo perfil ↔ User ───────────────────────── */

function profileToUser(row: {
  id: string;
  email: string;
  role: string;
  data: Record<string, unknown>;
}): User {
  const d = (row.data ?? {}) as Partial<User>;
  const now = new Date().toISOString();
  return {
    /**
     * Se parte de lo guardado y luego se normalizan los campos obligatorios.
     *
     * Antes se reconstruía el usuario con una lista fija de campos, así que
     * todo lo opcional que no estuviera en esa lista —género, ruta de enfoque
     * y materia prioritaria— se perdía en CADA hidratación desde la nube. Con
     * el refresco periódico eso significaba que elegir "Línea Aérea" en el
     * perfil se revertía solo a CIAAC a los pocos segundos.
     */
    ...d,
    id: row.id,
    nombre: d.nombre ?? "",
    email: row.email,
    passwordHash: "", // la contraseña vive en Supabase Auth
    whatsapp: d.whatsapp ?? "",
    whatsappEstado: d.whatsappEstado ?? "sin_numero",
    escuela: d.escuela ?? "",
    fechaCiaac: d.fechaCiaac ?? null,
    perfilCiaac: d.perfilCiaac ?? "",
    role: row.role === "admin" ? "admin" : "student",
    plan: d.plan ?? "basica",
    planNombre: d.planNombre ?? "Básica (gratis)",
    accessStatus: d.accessStatus ?? "activo",
    accessStart: d.accessStart ?? now,
    accessEnd: d.accessEnd ?? null,
    createdAt: d.createdAt ?? now,
    lastAccess: d.lastAccess ?? now,
    marketingOptIn: d.marketingOptIn ?? false,
    onboardingDone: d.onboardingDone ?? false,
    deactivatedAt: d.deactivatedAt ?? null,
    notasInternas: d.notasInternas ?? "",
    prefs: d.prefs ?? defaultPrefs(),
  };
}

function userToProfileData(u: User): Record<string, unknown> {
  const { id: _id, email: _email, passwordHash: _pw, role: _role, ...data } = u;
  return data;
}

/* ───────────────────────── Hidratación desde la nube ───────────────────────── */

/**
 * Lee una tabla completa paginando con .range(). PostgREST corta CADA respuesta
 * en ~1000 filas (db-max-rows) aunque se pida .limit(10000); sin paginar, el
 * banco de preguntas (2,951 filas) llegaba truncado y materias enteras
 * "desaparecían" de la app.
 */
async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<{ data: T[]; error: unknown }> {
  const PAGE = 1000;
  const all: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) return { data: all, error };
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
  }
  return { data: all, error: null };
}

/**
 * Escribe contenido venido de la nube sin re-empujarlo (uso: questions-cloud).
 * Respeta los cambios locales que aún no se suben (ver `applyRemoteRows`).
 */
export function applyRemoteContent(
  key: string,
  rows: Row[],
  mode: "replace" | "merge" = "replace",
  drop?: (row: Row) => boolean,
): void {
  applyRemoteRows(key, rows, mode, drop);
}

/** Olvida una colección local sin tocar la nube (p. ej. vaciar el banco en memoria). */
export function forgetLocalRows(key: string): void {
  dirty.delete(key);
  silently(() => write(key, []));
  seen.set(key, new Map());
}

/** Contenido global (biblioteca, clases, flashcards): pesado y estable. */
async function hydrateContent(): Promise<void> {
  const s = supa();
  if (!s || !sessionUserId) return;

  const { data: contentRows, error: contentErr } = await fetchAll<{
    collection: string;
    id: string;
    data: unknown;
  }>((from, to) =>
    s
      .from("content")
      .select("collection,id,data")
      // El banco de preguntas NO se hidrata aquí: se descarga bajo demanda
      // desde questions-cloud.ts (pesa más que la cuota del navegador).
      .neq("collection", "questions")
      .order("collection")
      .order("id")
      .range(from, to),
  );
  if (!contentErr && contentRows) {
    if (contentRows.length === 0) {
      await seedCloudContent();
    } else {
      const byCol = new Map<string, Row[]>();
      contentRows.forEach((r) => {
        const list = byCol.get(r.collection) ?? [];
        list.push(r.data as Row);
        byCol.set(r.collection, list);
      });
      // La nube puede traer el banco de una versión vieja del seed (p. ej. las
      // 2,819 preguntas de v3 con el reparto de materias incorrecto, sembradas
      // una sola vez y nunca actualizadas). La admin lo republica al entrar.
      if (sessionIsAdmin) await republishSeedContent(byCol);
      CONTENT_KEYS.forEach((key) => {
        if (key === "questions") return;
        const rows = byCol.get(key);
        if (rows) applyRemoteRows(key, rows, "replace");
        // Sin filas en la nube se conserva la copia local; la próxima
        // escritura de la admin la publica completa.
        else seen.set(key, new Map());
      });
    }
  }
}

/**
 * Lo que cambia con el uso: perfiles, estado por usuario, reportes y config.
 * Se separa del contenido para poder refrescarlo cada pocos segundos (panel
 * admin en vivo) sin volver a bajar las ~3,600 filas del banco de preguntas.
 *
 * Nunca pisa lo que se cambió aquí y aún no se sube, ni aplica una colección
 * cuya subida se confirmó después de pedir los datos: esa lectura ya es vieja.
 * Antes, un refresco que coincidía con un cambio (marcar un ticket como
 * resuelto, por ejemplo) lo revertía y la subida posterior mandaba el valor
 * viejo a la nube.
 */
async function hydrateLive(): Promise<void> {
  const s = supa();
  if (!s || !sessionUserId) return;
  const startedAt = Date.now();
  const outdated = (key: string) => (lastPushOk.get(key) ?? 0) >= startedAt;

  // 2) Perfiles (el estudiante recibe solo el suyo; la admin, todos)
  const { data: profRows } = await s.from("profiles").select("id,email,role,data");
  if (profRows && profRows.length > 0) {
    const users = profRows.map(profileToUser);
    if (!outdated("users")) applyRemoteRows("users", users as unknown as Row[], "replace");
    // Completa el perfil recién creado por el trigger (solo trae nombre).
    const own = profRows.find((p) => p.id === sessionUserId);
    if (own && !(own.data as Record<string, unknown>).plan) {
      const full = users.find((u) => u.id === sessionUserId);
      const ctx = currentCtx();
      if (full && ctx) void pushProfiles([full], ctx);
    }
  }

  // 3) Estado por usuario (RLS: propio; admin ve todo)
  const { data: stateRows } = await fetchAll<{
    user_id: string;
    collection: string;
    data: unknown;
  }>((from, to) =>
    s
      .from("user_state")
      .select("user_id,collection,data")
      .order("user_id")
      .order("collection")
      .range(from, to),
  );
  if (stateRows) {
    silently(() => {
      USER_ARRAY_KEYS.forEach((key) => {
        if (isBusy(key) || outdated(key)) return;
        const mine = stateRows.filter((r) => r.collection === key);
        if (mine.length === 0) return;
        const merged: Row[] = [];
        mine.forEach((r) => merged.push(...((r.data as Row[]) ?? [])));
        write(key, merged);
      });
      const days = stateRows.filter((r) => r.collection === "study_days");
      if (days.length > 0 && !isBusy("study_days") && !outdated("study_days")) {
        const map: Record<string, unknown> = {};
        days.forEach((r) => {
          map[r.user_id] = r.data;
        });
        write("study_days", map);
      }
    });
  }

  // 4) Reportes de problemas
  const { data: reportRows } = await fetchAll<{ id: string; data: unknown }>((from, to) =>
    s.from("reports").select("id,data").order("id").range(from, to),
  );
  if (reportRows && reportRows.length > 0 && !outdated("reports")) {
    applyRemoteRows(
      "reports",
      // `notasInternas` es material del equipo admin y vive en
      // `report_admin_notes`; nunca se hidrata desde `reports.data`.
      reportRows.map((r) => ({ ...(r.data as Report), notasInternas: "" })) as unknown as Row[],
      "replace",
    );
  }

  // 5) Estado administrativo (config es legible por todos para el gating/conversión)
  const { data: appRows } = await s.from("app_state").select("key,data");
  if (appRows) {
    silently(() => {
      appRows.forEach((r) => {
        if (!(APP_STATE_KEYS as readonly string[]).includes(r.key)) return;
        if (isBusy(r.key) || outdated(r.key)) return;
        write(r.key, r.data);
      });
    });
  }
  lastRefreshAt = Date.now();
}

async function hydrate(): Promise<void> {
  await hydrateContent();
  await hydrateLive();
}

/** Marca de tiempo de la última lectura correcta de la nube (0 = nunca). */
let lastRefreshAt = 0;
let refreshing = false;

export function lastCloudRefresh(): number {
  return lastRefreshAt;
}

/**
 * Vuelve a leer de la nube lo que cambia con el uso.
 *
 * El panel admin lo llama en intervalo y al volver a la pestaña: sin esto sólo
 * veía la foto del momento del login y las altas, intentos y reportes nuevos
 * no aparecían hasta recargar. No re-descarga el contenido global.
 */
export async function refreshCloudData(): Promise<boolean> {
  if (!cloudSessionActive() || refreshing) return false;
  refreshing = true;
  try {
    // Primero se suben los cambios locales pendientes (las escrituras salen
    // con 1.2 s de retardo). Sin esto, un refresco que cayera en esa ventana
    // traía la copia vieja del servidor y deshacía lo que se acababa de
    // guardar —el caso típico: elegir la ruta de enfoque y verla revertirse.
    await flushPendingAsync();
    await hydrateLive();
    return true;
  } catch {
    return false;
  } finally {
    refreshing = false;
  }
}

/**
 * Preguntas del seed que la admin ya editó: su `updatedAt` dejó de coincidir
 * con el `createdAt` con el que las sembró el seed (ahí son idénticos).
 * `null` si no se pudo leer la nube.
 */
async function adminEditedQuestionIds(s: SupabaseClient): Promise<Set<string> | null> {
  const { data, error } = await fetchAll<{ id: string; creada: unknown; editada: unknown }>(
    (from, to) =>
      s
        .from("content")
        .select("id,creada:data->>createdAt,editada:data->>updatedAt")
        .eq("collection", "questions")
        .order("id")
        .range(from, to),
  );
  if (error) return null;
  return new Set(
    data.filter((r) => r.editada && r.creada && r.editada !== r.creada).map((r) => r.id),
  );
}

/**
 * Republica el banco de preguntas y las flashcards del seed cuando la nube
 * quedó con una versión anterior (marcador "content_seed_version" en
 * app_state). Los ids de seed (q_seed_NNN, fc_...) son estables y el banco
 * viejo es subconjunto del nuevo, así que el upsert cubre todas las filas;
 * el contenido creado a mano por la admin (otros ids) se conserva, y también
 * las preguntas del seed que la admin corrigió: republicarlas le borraba sus
 * correcciones. Actualiza byCol para que la hidratación de esta sesión ya use
 * el banco republicado.
 */
async function republishSeedContent(byCol: Map<string, Row[]>): Promise<void> {
  const s = supa();
  if (!s) return;
  const { data: verRow } = await s
    .from("app_state")
    .select("data")
    .eq("key", "content_seed_version")
    .maybeSingle();
  const cloudVersion = Number((verRow?.data as { version?: number } | null)?.version ?? 0);
  if (cloudVersion >= SEED_VERSION) return;

  const editadas = await adminEditedQuestionIds(s);
  // Sin saber qué corrigió la admin no se republica: se reintenta al próximo inicio.
  if (!editadas) return;

  // Los datos del seed se cargan bajo demanda: este camino solo corre cuando
  // la nube va atrás de la versión local, no en cada arranque.
  const { seedQuestions, seedFlashcards, seedMateriales } = await import("./seed");
  const questions = seedQuestions();
  const fresh: Record<"questions" | "flashcards" | "materiales", Row[]> = {
    questions: questions.filter((q) => !editadas.has(q.id)) as unknown as Row[],
    flashcards: seedFlashcards(questions) as unknown as Row[],
    materiales: seedMateriales() as unknown as Row[],
  };
  for (const key of ["questions", "flashcards", "materiales"] as const) {
    const rows = fresh[key];
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error } = await s
        .from("content")
        .upsert(chunk.map((r) => ({ collection: key, id: String(r.id), data: r })));
      // Sin marcar la versión: se reintenta completo en el próximo inicio de sesión.
      if (error) return;
    }
    const seedIds = new Set(rows.map((r) => String(r.id)));
    const custom = (byCol.get(key) ?? []).filter((r) => !seedIds.has(String(r.id)));
    byCol.set(key, [...rows, ...custom]);
  }
  await s
    .from("app_state")
    .upsert({ key: "content_seed_version", data: { version: SEED_VERSION } });
}

/** Puebla el contenido de la nube desde el seed local (solo si está vacío). */
async function seedCloudContent(): Promise<void> {
  const s = supa();
  if (!s) return;
  const local: Record<ContentKey, Row[]> = {
    questions: read<BankQuestion[]>("questions", []) as unknown as Row[],
    materiales: read<Material[]>("materiales", []) as unknown as Row[],
    clases: read<Clase[]>("clases", []) as unknown as Row[],
    flashcards: read<FlashCardItem[]>("flashcards", []) as unknown as Row[],
  };
  for (const key of CONTENT_KEYS) {
    const items = local[key];
    if (items.length === 0) continue;
    const { error } = await s.rpc("seed_content", { p_collection: key, p_items: items });
    if (!error) seen.set(key, indexRows(items));
  }
}

/* ───────────────────────── Push local → nube ───────────────────────── */

/**
 * Campos de facturación cuyo dueño es el servidor (webhook de Stripe y
 * `syncMyPlan`). El espejo local NUNCA debe subirlos para su propia cuenta:
 * si lo hace, un localStorage viejo con `plan: "basica"` degrada a un usuario
 * que sí está pagando y el plan queda parpadeando entre básica y Pro.
 */
const CAMPOS_DE_FACTURACION = [
  "plan",
  "planNombre",
  "accessStatus",
  "accessEnd",
  "accessStart",
] as const;

/**
 * Sesión con la que se sube: se toma al pedir la subida, no al ejecutarla.
 * Así lo pendiente sale aunque la sesión se cierre mientras espera turno.
 */
interface PushCtx {
  s: SupabaseClient;
  uid: string;
  admin: boolean;
}

function currentCtx(): PushCtx | null {
  const s = supa();
  return s && sessionUserId ? { s, uid: sessionUserId, admin: sessionIsAdmin } : null;
}

async function pushProfiles(users: User[], ctx: PushCtx): Promise<{ error: unknown }> {
  const { s, uid, admin } = ctx;
  const candidatos = users.filter((u) => admin || u.id === uid);
  if (candidatos.length === 0) return { error: null };

  // Para la propia cuenta conservamos lo que ya está en la nube en los campos
  // de facturación (el upsert reemplaza el JSON completo, así que hay que
  // volver a escribirlos con el valor bueno, no omitirlos).
  let propioRemoto: Record<string, unknown> | null = null;
  if (candidatos.some((u) => u.id === uid)) {
    const { data } = await s.from("profiles").select("data").eq("id", uid).maybeSingle();
    propioRemoto = (data?.data ?? null) as Record<string, unknown> | null;
  }

  const rows = candidatos.map((u) => {
    const data = userToProfileData(u);
    if (u.id === uid && propioRemoto) {
      for (const campo of CAMPOS_DE_FACTURACION) {
        if (campo in propioRemoto) data[campo] = propioRemoto[campo];
      }
    }
    return { id: u.id, email: u.email, role: u.role, data };
  });
  const { error } = await s.from("profiles").upsert(rows);
  return { error };
}

/** Un rechazo de permisos (RLS) o de datos no se arregla reintentando. */
function isPermanent(error: unknown): boolean {
  const code = String((error as { code?: unknown } | null)?.code ?? "");
  return code === "42501" || code.startsWith("22") || code.startsWith("23");
}

interface SendResult {
  ok: boolean;
  /** Ids que ya no hay que reintentar: confirmados o rechazados para siempre. */
  settled: string[];
}

/** Sube en tandas: un fallo sólo deja pendiente su propia tanda. */
async function inChunks(
  ids: string[],
  send: (chunk: string[]) => PromiseLike<{ error: unknown }>,
  size = 200,
): Promise<SendResult> {
  const settled: string[] = [];
  let ok = true;
  for (let i = 0; i < ids.length; i += size) {
    const chunk = ids.slice(i, i + size);
    const { error } = await send(chunk);
    if (error) ok = false;
    if (!error || isPermanent(error)) settled.push(...chunk);
  }
  return { ok, settled };
}

async function sendRows(
  ctx: PushCtx,
  key: string,
  rows: Row[],
  gone: string[],
): Promise<SendResult> {
  const { s, uid, admin } = ctx;
  if ((CONTENT_KEYS as readonly string[]).includes(key)) {
    // Sólo la admin publica contenido; en cualquier otra sesión es copia de lectura.
    if (!admin) return { ok: true, settled: [...rows.map(rowId), ...gone] };
    const byId = new Map(rows.map((r) => [rowId(r), r]));
    const up = await inChunks([...byId.keys()], (chunk) =>
      s.from("content").upsert(chunk.map((id) => ({ collection: key, id, data: byId.get(id) }))),
    );
    const del = await inChunks(gone, (chunk) =>
      s.from("content").delete().eq("collection", key).in("id", chunk),
    );
    return { ok: up.ok && del.ok, settled: [...up.settled, ...del.settled] };
  }

  if (key === "reports") {
    // RLS de `reports`: cada quien sólo da de alta los suyos (INSERT con su
    // user_id) y sólo la admin los cambia (UPDATE). Un upsert pasa por las dos
    // reglas a la vez —Postgres revisa la del INSERT aunque la fila ya exista—,
    // así que la admin no podía cambiar el estado del ticket de una alumna y la
    // alumna perdía el reporte nuevo que viajaba junto a uno anterior. Por eso
    // la admin actualiza por id y lo que aún no existe se da de alta sin tocar
    // filas existentes. La fila la puede leer su dueña: se publica sin las
    // notas internas del equipo (esas viven en `report_admin_notes`).
    const mine = rows.filter((r) => admin || r.userId === uid);
    const ajenos = rows.filter((r) => !mine.includes(r)).map(rowId);
    const settled: string[] = [];
    let ok = true;
    for (const row of mine) {
      const id = rowId(row);
      const { notasInternas: _notas, ...data } = row as Row & { notasInternas?: string };
      const updated_at = new Date().toISOString();
      let error: unknown = null;
      let existe = false;
      if (admin) {
        const res = await s.from("reports").update({ data, updated_at }).eq("id", id).select("id");
        error = res.error;
        existe = (res.data?.length ?? 0) > 0;
      }
      if (!error && !existe) {
        ({ error } = await s
          .from("reports")
          .upsert(
            { id, user_id: (data.userId as string | undefined) ?? null, data, updated_at },
            { onConflict: "id", ignoreDuplicates: true },
          ));
      }
      if (error) ok = false;
      if (!error || isPermanent(error)) settled.push(id);
    }
    // Los reportes no se borran desde la app.
    return { ok, settled: [...settled, ...ajenos, ...gone] };
  }

  // users → profiles. Los usuarios demo locales (usr_*) no existen en la nube.
  const users = rows as unknown as User[];
  const subibles = users.filter((u) => !u.id.startsWith("usr_") && (admin || u.id === uid));
  const resto = users.filter((u) => !subibles.includes(u)).map((u) => u.id);
  const { error } = await pushProfiles(subibles, ctx);
  const settled = !error || isPermanent(error) ? subibles.map((u) => u.id) : [];
  return { ok: !error, settled: [...settled, ...resto, ...gone] };
}

/** Sube las filas pendientes de una colección con id. */
async function pushRows(ctx: PushCtx, key: string): Promise<boolean> {
  const pending = dirty.get(key);
  if (!pending || pending.size === 0) return true;
  const ids = [...pending];
  const byId = new Map(read<Row[]>(key, []).map((r) => [rowId(r), r]));
  const present = ids.filter((id) => byId.has(id));
  const gone = ids.filter((id) => !byId.has(id));
  const sent = new Map(present.map((id) => [id, JSON.stringify(byId.get(id))]));

  const result = await sendRows(
    ctx,
    key,
    present.map((id) => byId.get(id) as Row),
    gone,
  );
  // Dejan de estar pendientes salvo que hayan vuelto a cambiar mientras subían.
  const now = indexRows(read<Row[]>(key, []));
  result.settled.forEach((id) => {
    if (now.get(id) === sent.get(id)) pending.delete(id);
  });
  return result.ok;
}

/** Sube una colección que se guarda completa (estado por usuario, config…). */
async function pushWhole(ctx: PushCtx, key: string): Promise<boolean> {
  const { s, uid, admin } = ctx;
  const seq = writeSeq.get(key) ?? 0;
  let error: unknown = null;

  if ((USER_ARRAY_KEYS as readonly string[]).includes(key)) {
    const slice = read<Row[]>(key, []).filter((r) => r.userId === uid);
    ({ error } = await s.from("user_state").upsert({
      user_id: uid,
      collection: key,
      data: slice,
      updated_at: new Date().toISOString(),
    }));
  } else if (key === "study_days") {
    const mine = read<Record<string, unknown>>("study_days", {})[uid];
    if (mine !== undefined) {
      ({ error } = await s.from("user_state").upsert({
        user_id: uid,
        collection: "study_days",
        data: mine,
        updated_at: new Date().toISOString(),
      }));
    }
  } else if ((APP_STATE_KEYS as readonly string[]).includes(key) && admin) {
    ({ error } = await s.from("app_state").upsert({
      key,
      data: read<unknown>(key, null),
      updated_at: new Date().toISOString(),
    }));
  }

  if ((!error || isPermanent(error)) && (writeSeq.get(key) ?? 0) === seq) unsynced.delete(key);
  return !error;
}

/**
 * Sube lo pendiente de una colección, en fila detrás de la subida anterior de
 * esa misma colección. Devuelve `false` si la nube no lo confirmó; lo que
 * falló por red se reintenta solo, con espera creciente.
 */
function pushKey(key: string): Promise<boolean> {
  const ctx = currentCtx();
  if (!ctx) return Promise.resolve(true);
  const before = pushing.get(key) ?? Promise.resolve(true);
  const job: Promise<boolean> = before.then(async (previousOk) => {
    // Nada nuevo: vale el resultado de la subida que ya estaba en curso.
    if (!hasPending(key)) return previousOk;
    const ok = await (isRowKey(key) ? pushRows(ctx, key) : pushWhole(ctx, key)).catch(() => false);
    if (ok) {
      lastPushOk.set(key, Date.now());
      retryAttempts.delete(key);
    } else if (hasPending(key) && !pushTimers.has(key)) {
      const attempt = (retryAttempts.get(key) ?? 0) + 1;
      retryAttempts.set(key, attempt);
      schedulePush(key, Math.min(60_000, 2_000 * 2 ** (attempt - 1)));
    }
    return ok;
  });
  pushing.set(key, job);
  void job.finally(() => {
    if (pushing.get(key) === job) pushing.delete(key);
  });
  return job;
}

function schedulePush(key: string, delay: number) {
  const prev = pushTimers.get(key);
  if (prev) clearTimeout(prev);
  pushTimers.set(
    key,
    setTimeout(() => {
      pushTimers.delete(key);
      void pushKey(key);
    }, delay),
  );
}

function onLocalWrite(key: string) {
  if (applyingRemote || !sessionUserId) return;
  const syncable =
    isRowKey(key) ||
    (USER_ARRAY_KEYS as readonly string[]).includes(key) ||
    (APP_STATE_KEYS as readonly string[]).includes(key) ||
    key === "study_days";
  if (!syncable) return;
  if (isRowKey(key)) {
    trackLocalRows(key);
  } else {
    unsynced.add(key);
    writeSeq.set(key, (writeSeq.get(key) ?? 0) + 1);
  }
  schedulePush(key, 1200);
}

/** Colecciones con algo por subir (programado, fallido o sin confirmar). */
function pendingKeys(): string[] {
  const keys = new Set<string>(pushTimers.keys());
  dirty.forEach((ids, key) => {
    if (ids.size > 0) keys.add(key);
  });
  unsynced.forEach((key) => keys.add(key));
  return [...keys];
}

function flushPending() {
  pendingKeys().forEach((key) => {
    const timer = pushTimers.get(key);
    if (timer) clearTimeout(timer);
    pushTimers.delete(key);
    void pushKey(key);
  });
}

/**
 * Sube ya lo pendiente y espera la respuesta de la nube. Con `keys` se limita
 * a esas colecciones (y espera también la subida que ya estuviera en curso).
 * Devuelve `false` si algo no se pudo guardar.
 */
export async function flushCloudWrites(keys?: string[]): Promise<boolean> {
  if (!cloudSessionActive()) return true;
  return flushPendingAsync(keys);
}

async function flushPendingAsync(keys?: string[]): Promise<boolean> {
  const wanted = new Set(pendingKeys());
  pushing.forEach((_job, key) => wanted.add(key));
  const list = [...wanted].filter((key) => !keys || keys.includes(key));
  const results = await Promise.all(
    list.map((key) => {
      const timer = pushTimers.get(key);
      if (timer) clearTimeout(timer);
      pushTimers.delete(key);
      return pushKey(key);
    }),
  );
  return results.every(Boolean);
}

/* ───────────────────────── Ciclo de vida ───────────────────────── */

/** Activa la sincronización para el usuario autenticado en la nube. */
export async function startCloudSession(userId: string, isAdmin: boolean): Promise<void> {
  const nueva = sessionUserId !== userId;
  if (nueva) {
    // Sesión nueva: lo pendiente de otra (o de antes de cerrar) ya no aplica.
    pushTimers.forEach((timer) => clearTimeout(timer));
    pushTimers.clear();
    dirty.clear();
    unsynced.clear();
    retryAttempts.clear();
  }
  sessionUserId = userId;
  sessionIsAdmin = isAdmin;
  // Punto de partida para detectar qué filas cambian aquí de ahora en adelante.
  ROW_KEYS.forEach((key) => {
    if (nueva || !seen.has(key)) seen.set(key, indexRows(read<Row[]>(key, [])));
  });
  if (!started) {
    started = true;
    setWriteHook(onLocalWrite);
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", flushPending);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushPending();
      });
    }
  }
  await hydrate();
}

export function stopCloudSession() {
  flushPending();
  sessionUserId = null;
  sessionIsAdmin = false;
}

export function cloudSessionActive(): boolean {
  return cloudEnabled() && sessionUserId !== null;
}
