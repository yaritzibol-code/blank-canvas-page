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
 * Sin credenciales de nube todo esto queda inactivo y la app opera 100% local.
 */
import { read, write, setWriteHook } from "./db";
import { supa, cloudEnabled } from "./cloud";
import { defaultPrefs } from "./auth";
import { SEED_VERSION, seedQuestions, seedFlashcards } from "./seed";
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
] as const;

/** Colecciones administrativas guardadas como llave/valor. */
const APP_STATE_KEYS = ["access_changes", "config"] as const;

type Row = { id?: string; userId?: string } & Record<string, unknown>;

let sessionUserId: string | null = null;
let sessionIsAdmin = false;
let applyingRemote = false;
let started = false;
const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
/** Ids conocidos por colección de contenido para calcular bajas. */
const contentIds = new Map<string, Set<string>>();

function silently(fn: () => void) {
  applyingRemote = true;
  try {
    fn();
  } finally {
    applyingRemote = false;
  }
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
    planNombre: d.planNombre ?? "Suscripción básica",
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

async function hydrate(): Promise<void> {
  const s = supa();
  if (!s || !sessionUserId) return;

  // 1) Contenido global (banco, biblioteca, clases, flashcards)
  const { data: contentRows, error: contentErr } = await fetchAll<{
    collection: string;
    id: string;
    data: unknown;
  }>((from, to) =>
    s.from("content").select("collection,id,data").order("collection").order("id").range(from, to),
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
      silently(() => {
        CONTENT_KEYS.forEach((key) => {
          const rows = byCol.get(key);
          if (rows) write(key, rows);
          contentIds.set(key, new Set((rows ?? []).map((r) => String(r.id))));
        });
      });
    }
  }

  // 2) Perfiles (el estudiante recibe solo el suyo; la admin, todos)
  const { data: profRows } = await s.from("profiles").select("id,email,role,data");
  if (profRows && profRows.length > 0) {
    const users = profRows.map(profileToUser);
    silently(() => write("users", users));
    // Completa el perfil recién creado por el trigger (solo trae nombre).
    const own = profRows.find((p) => p.id === sessionUserId);
    if (own && !(own.data as Record<string, unknown>).plan) {
      const full = users.find((u) => u.id === sessionUserId);
      if (full) void pushProfiles([full]);
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
        const mine = stateRows.filter((r) => r.collection === key);
        if (mine.length === 0) return;
        const merged: Row[] = [];
        mine.forEach((r) => merged.push(...((r.data as Row[]) ?? [])));
        write(key, merged);
      });
      const days = stateRows.filter((r) => r.collection === "study_days");
      if (days.length > 0) {
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
  if (reportRows && reportRows.length > 0) {
    silently(() =>
      write(
        "reports",
        reportRows.map((r) => r.data as Report),
      ),
    );
  }

  // 5) Estado administrativo (config es legible por todos para el gating/conversión)
  const { data: appRows } = await s.from("app_state").select("key,data");
  if (appRows) {
    silently(() => {
      appRows.forEach((r) => {
        if ((APP_STATE_KEYS as readonly string[]).includes(r.key)) write(r.key, r.data);
      });
    });
  }
}

/**
 * Republica el banco de preguntas y las flashcards del seed cuando la nube
 * quedó con una versión anterior (marcador "content_seed_version" en
 * app_state). Los ids de seed (q_seed_NNN, fc_...) son estables y el banco
 * viejo es subconjunto del nuevo, así que el upsert cubre todas las filas;
 * el contenido creado a mano por la admin (otros ids) se conserva. Actualiza
 * byCol para que la hidratación de esta sesión ya use el banco republicado.
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

  const questions = seedQuestions();
  const fresh: Record<"questions" | "flashcards", Row[]> = {
    questions: questions as unknown as Row[],
    flashcards: seedFlashcards(questions) as unknown as Row[],
  };
  for (const key of ["questions", "flashcards"] as const) {
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
    if (!error) contentIds.set(key, new Set(items.map((r) => String(r.id))));
  }
}

/* ───────────────────────── Push local → nube ───────────────────────── */

async function pushProfiles(users: User[]): Promise<void> {
  const s = supa();
  if (!s) return;
  const rows = users
    .filter((u) => sessionIsAdmin || u.id === sessionUserId)
    .map((u) => ({ id: u.id, email: u.email, role: u.role, data: userToProfileData(u) }));
  if (rows.length > 0) await s.from("profiles").upsert(rows);
}

async function pushKey(key: string): Promise<void> {
  const s = supa();
  if (!s || !sessionUserId) return;

  if ((CONTENT_KEYS as readonly string[]).includes(key)) {
    if (!sessionIsAdmin) return; // solo la admin publica contenido
    const rows = read<Row[]>(key, []);
    const prev = contentIds.get(key) ?? new Set<string>();
    const nextIds = new Set(rows.map((r) => String(r.id)));
    const removed = [...prev].filter((id) => !nextIds.has(id));
    await s
      .from("content")
      .upsert(rows.map((r) => ({ collection: key, id: String(r.id), data: r })));
    if (removed.length > 0)
      await s.from("content").delete().eq("collection", key).in("id", removed);
    contentIds.set(key, nextIds);
    return;
  }

  if (key === "users") {
    // Los usuarios demo locales (usr_*) no existen en la nube; solo se empujan
    // perfiles con id de Supabase (uuid).
    const users = read<User[]>("users", []).filter((u) => !u.id.startsWith("usr_"));
    await pushProfiles(users);
    return;
  }

  if ((USER_ARRAY_KEYS as readonly string[]).includes(key)) {
    const slice = read<Row[]>(key, []).filter((r) => r.userId === sessionUserId);
    await s.from("user_state").upsert({
      user_id: sessionUserId,
      collection: key,
      data: slice,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  if (key === "study_days") {
    const mine = read<Record<string, unknown>>("study_days", {})[sessionUserId];
    if (mine !== undefined) {
      await s.from("user_state").upsert({
        user_id: sessionUserId,
        collection: "study_days",
        data: mine,
        updated_at: new Date().toISOString(),
      });
    }
    return;
  }

  if (key === "reports") {
    const rows = read<Row[]>("reports", []);
    const own = rows.filter((r) => r.userId === sessionUserId);
    if (own.length > 0) {
      await s
        .from("reports")
        .upsert(own.map((r) => ({ id: String(r.id), user_id: sessionUserId, data: r })));
    }
    if (sessionIsAdmin) {
      const others = rows.filter((r) => r.userId !== sessionUserId);
      if (others.length > 0) {
        await s.from("reports").upsert(
          others.map((r) => ({
            id: String(r.id),
            user_id: (r.userId as string) ?? null,
            data: r,
          })),
        );
      }
    }
    return;
  }

  if ((APP_STATE_KEYS as readonly string[]).includes(key)) {
    if (!sessionIsAdmin) return;
    await s.from("app_state").upsert({
      key,
      data: read<unknown>(key, null),
      updated_at: new Date().toISOString(),
    });
  }
}

function onLocalWrite(key: string) {
  if (applyingRemote || !sessionUserId) return;
  const syncable =
    (CONTENT_KEYS as readonly string[]).includes(key) ||
    (USER_ARRAY_KEYS as readonly string[]).includes(key) ||
    (APP_STATE_KEYS as readonly string[]).includes(key) ||
    key === "users" ||
    key === "study_days" ||
    key === "reports";
  if (!syncable) return;
  const prev = pushTimers.get(key);
  if (prev) clearTimeout(prev);
  pushTimers.set(
    key,
    setTimeout(() => {
      pushTimers.delete(key);
      void pushKey(key).catch(() => {
        /* siguiente escritura reintenta */
      });
    }, 1200),
  );
}

function flushPending() {
  pushTimers.forEach((timer, key) => {
    clearTimeout(timer);
    pushTimers.delete(key);
    void pushKey(key).catch(() => {});
  });
}

/* ───────────────────────── Ciclo de vida ───────────────────────── */

/** Activa la sincronización para el usuario autenticado en la nube. */
export async function startCloudSession(userId: string, isAdmin: boolean): Promise<void> {
  sessionUserId = userId;
  sessionIsAdmin = isAdmin;
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
