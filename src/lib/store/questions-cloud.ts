/**
 * Banco de preguntas: entrega acotada desde Supabase.
 *
 * El banco es secreto de negocio, así que la tabla `content` ya no es legible
 * en bloque para los alumnos: la RLS solo deja leer `questions` a la admin.
 * Las pantallas piden **el lote que necesitan** con la función
 * `get_bank_questions` (materia / manual / capítulo, tope por llamada) y las
 * preguntas viven en memoria (db.ts) hasta recargar la página. Nunca se
 * guardan en el navegador ni se descargan completas.
 */
import { supa } from "./cloud";
import { read } from "./db";
import { applyRemoteContent, forgetLocalRows } from "./sync";
import type { BankQuestion } from "./types";

/** Ámbito de preguntas que necesita una pantalla. */
export interface BankScope {
  /** Materias (slugs) a cubrir; se pide un lote por materia. */
  materias?: string[];
  /** Códigos de manual (`fuente`) permitidos. */
  fuentes?: string[];
  /** Capítulos permitidos (Jeppesen / ATP). */
  caps?: number[];
  /** `ciaac` = solo guía oficial, `la` = solo Línea Aérea. */
  scope?: "all" | "ciaac" | "la";
  /** Máximo de preguntas por llamada (el servidor topa en 600). */
  limit?: number;
  /** Orden estable por id (plan básica) en lugar de aleatorio. */
  ordered?: boolean;
  /** Solo admin: descarga completa paginada para el editor del banco. */
  all?: boolean;
}

interface RpcArgs {
  p_materias: string[] | null;
  p_fuentes: string[] | null;
  p_caps: number[] | null;
  p_ids: string[] | null;
  p_scope: string;
  p_limit: number;
  p_offset: number;
  p_ordered: boolean;
}

function scopeKey(s: BankScope): string {
  return JSON.stringify([
    s.materias?.slice().sort() ?? null,
    s.fuentes?.slice().sort() ?? null,
    s.caps?.slice().sort() ?? null,
    s.scope ?? "all",
    s.limit ?? null,
    s.ordered ?? false,
    s.all ?? false,
  ]);
}


/**
 * Caché por ámbito.
 *
 * Antes había un solo espacio (`loadedKey` + `loading`): si dos pantallas —o
 * la misma al cambiar de capítulo— pedían lotes distintos casi al mismo
 * tiempo, la segunda petición pisaba a la primera y el `loadedKey` acababa
 * apuntando al ámbito equivocado. La UI se daba por lista sin tener sus
 * preguntas en memoria: ese era el "a veces no cargan".
 */
const loadedKeys = new Map<string, number>();
const inFlight = new Map<string, Promise<boolean>>();

/**
 * true cuando ese ámbito concreto ya se pidió con éxito (y, con `maxAgeMs`,
 * hace menos de ese tiempo).
 */
export function scopeLoaded(scope: BankScope = {}, maxAgeMs = Infinity): boolean {
  const at = loadedKeys.get(scopeKey(scope));
  return at !== undefined && Date.now() - at <= maxAgeMs;
}

/** true cuando ya hay algún lote del banco en memoria. */
export function questionsLoaded(): boolean {
  return loadedKeys.size > 0;
}


async function rpc(args: Partial<RpcArgs>): Promise<BankQuestion[] | null> {
  const s = supa();
  if (!s) return null;
  const { data, error } = await s.rpc("get_bank_questions", {
    p_materias: null,
    p_fuentes: null,
    p_caps: null,
    p_ids: null,
    p_scope: "all",
    p_limit: 200,
    p_offset: 0,
    p_ordered: false,
    ...args,
  } as never);
  if (error) return null;
  return (data ?? []) as unknown as BankQuestion[];
}

/**
 * Banco completo para el editor (sólo admin), con TODOS los estados.
 *
 * Se lee la tabla `content` directamente —su RLS ya limita las preguntas a la
 * admin—. La RPC sólo entrega publicadas: un borrador o una pregunta oculta
 * desaparecían del panel al recargar y ya no había cómo volver a publicarlos.
 */
async function fetchAllAdmin(): Promise<BankQuestion[] | null> {
  const s = supa();
  if (!s) return null;
  const out: BankQuestion[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await s
      .from("content")
      .select("data")
      .eq("collection", "questions")
      .order("id")
      .range(from, from + 999);
    // Sin lectura directa se cae a la RPC; a media descarga, mejor nada que
    // un banco incompleto.
    if (error) return from === 0 ? fetchAllPublished() : null;
    const rows = (data ?? []) as { data: BankQuestion }[];
    // El editor de Soporte guardaba "archivada", que el Banco no reconoce: es
    // una pregunta oculta (la RPC de las alumnas sólo entrega publicadas).
    rows.forEach((r) =>
      out.push(
        (r.data.status as string) === "archivada" ? { ...r.data, status: "oculta" } : r.data,
      ),
    );
    if (rows.length < 1000 || from > 20000) break;
  }
  return out;
}

/** Descarga paginada por la RPC (sólo publicadas). */
async function fetchAllPublished(): Promise<BankQuestion[] | null> {
  const out: BankQuestion[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await rpc({ p_limit: 1000, p_offset: offset, p_ordered: true });
    if (page === null) return offset === 0 ? null : out;
    out.push(...page);
    if (page.length < 1000) break;
    if (offset > 20000) break;
  }
  return out;
}

async function fetchScope(scope: BankScope): Promise<BankQuestion[] | null> {
  if (scope.all) return fetchAllAdmin();

  const base: Partial<RpcArgs> = {
    p_fuentes: scope.fuentes && scope.fuentes.length > 0 ? scope.fuentes : null,
    p_caps: scope.caps && scope.caps.length > 0 ? scope.caps : null,
    p_scope: scope.scope ?? "all",
    p_ordered: scope.ordered ?? false,
  };

  const materias = scope.materias?.filter(Boolean) ?? [];
  if (materias.length === 0) {
    return rpc({ ...base, p_limit: scope.limit ?? 400 });
  }

  // Un lote por materia: así la composición del examen no depende del azar
  // global y ninguna llamada devuelve el banco entero.
  const per = Math.max(10, Math.min(scope.limit ?? 200, 600));
  const pages = await Promise.all(
    materias.map((m) => rpc({ ...base, p_materias: [m], p_limit: per })),
  );
  if (pages.every((p) => p === null)) return null;
  const merged: BankQuestion[] = [];
  pages.forEach((p) => p && merged.push(...p));
  return merged;
}

/** Misma selección que hace `get_bank_questions` para un ámbito. */
function matchesScope(q: BankQuestion, s: BankScope): boolean {
  const fuente = q.fuente ?? "";
  if (s.scope === "ciaac" && fuente) return false;
  if (s.scope === "la" && !fuente) return false;
  if (s.materias?.length && !s.materias.includes(q.materia)) return false;
  if (s.fuentes?.length && !s.fuentes.includes(fuente)) return false;
  if (s.caps?.length && !s.caps.includes(Number(q.capitulo ?? 0))) return false;
  return true;
}

/**
 * Fusiona un lote con lo que ya hay en memoria (sin duplicar por id). Con
 * `replaceScope`, el lote sustituye a todo lo que había de ese ámbito: así una
 * pregunta que la admin corrigió u ocultó no sobrevive en su versión vieja.
 */
function mergeIntoMemory(rows: BankQuestion[], replaceScope?: BankScope): void {
  applyRemoteContent(
    "questions",
    rows as unknown as Record<string, unknown>[],
    "merge",
    replaceScope ? (r) => matchesScope(r as unknown as BankQuestion, replaceScope) : undefined,
  );
}

/**
 * Garantiza que el lote pedido esté en memoria. Devuelve `true` si hay
 * preguntas utilizables para ese ámbito.
 *
 * Cada ámbito lleva su propia promesa en vuelo, así que pedir varios lotes a
 * la vez (o cambiar de capítulo antes de que llegue el anterior) ya no
 * cancela ni confunde al otro.
 */
export function ensureQuestions(scope: BankScope = {}, force = false): Promise<boolean> {
  const key = scopeKey(scope);
  // Forzar pide datos frescos; una petición que ya va en camino lo es.
  if (force) loadedKeys.delete(key);
  if (loadedKeys.has(key)) return Promise.resolve(true);
  const running = inFlight.get(key);
  if (running) return running;

  const job = (async () => {
    try {
      const rows = await fetchScope(scope);
      if (rows && rows.length > 0) {
        if (scope.all) {
          applyRemoteContent("questions", rows as unknown as Record<string, unknown>[], "replace");
        } else {
          mergeIntoMemory(rows, force ? scope : undefined);
        }
        loadedKeys.set(key, Date.now());
        return true;
      }
      // Sin nube o lote vacío: se usa lo que ya haya en memoria y se permite
      // reintentar en la siguiente visita (no se marca como cargado).
      return read<BankQuestion[]>("questions", []).length > 0;
    } finally {
      inFlight.delete(key);
    }
  })();
  inFlight.set(key, job);
  return job;
}


/**
 * Refleja en memoria una pregunta que se guardó directo en la nube (editor de
 * Soporte), para que el Banco la muestre ya corregida.
 */
export function rememberQuestion(q: BankQuestion): void {
  mergeIntoMemory([q]);
}

/**
 * Recupera preguntas concretas por id (sesiones en curso que se retoman tras
 * recargar: el lote nuevo es aleatorio y puede no incluirlas).
 */
export async function ensureQuestionsByIds(ids: string[]): Promise<boolean> {
  const missing = [...new Set(ids)].filter(
    (id) => !read<BankQuestion[]>("questions", []).some((q) => q.id === id),
  );
  if (missing.length === 0) return true;
  const rows: BankQuestion[] = [];
  for (let i = 0; i < missing.length; i += 400) {
    const page = await rpc({ p_ids: missing.slice(i, i + 400), p_limit: 600, p_ordered: true });
    if (!page) return false;
    rows.push(...page);
  }
  if (rows.length > 0) mergeIntoMemory(rows);
  return rows.length === missing.length;
}

export interface BankCount {
  materia: string;
  fuente: string;
  capitulo: number;
  total: number;
}

/** Conteos del banco (no exponen contenido). */
export async function fetchBankCounts(): Promise<BankCount[]> {
  const s = supa();
  if (!s) return [];
  const { data, error } = await s.rpc("get_bank_counts" as never);
  if (error || !data) return [];
  return data as unknown as BankCount[];
}

/** Limpia el banco en memoria (cierre de sesión). */
export function clearQuestionMemory(): void {
  loadedKeys.clear();
  inFlight.clear();
  // Sólo memoria: vaciarla no debe leerse como "la admin borró el banco".
  forgetLocalRows("questions");
}
