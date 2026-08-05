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
import { read, write } from "./db";
import { applyRemoteContent } from "./sync";
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
const loadedKeys = new Set<string>();
const inFlight = new Map<string, Promise<boolean>>();

/** true cuando ese ámbito concreto ya se pidió con éxito. */
export function scopeLoaded(scope: BankScope = {}): boolean {
  return loadedKeys.has(scopeKey(scope));
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

/** Descarga completa paginada (solo admin: la RPC topa al resto en 600). */
async function fetchAllAdmin(): Promise<BankQuestion[] | null> {
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

/** Fusiona un lote con lo que ya hay en memoria (sin duplicar por id). */
function mergeIntoMemory(rows: BankQuestion[]): void {
  const current = read<BankQuestion[]>("questions", []);
  const byId = new Map(current.map((q) => [q.id, q]));
  rows.forEach((q) => byId.set(q.id, q));
  applyRemoteContent("questions", [...byId.values()] as unknown as Record<string, unknown>[]);
}

/**
 * Garantiza que el lote pedido esté en memoria. Devuelve `true` si hay
 * preguntas utilizables.
 */
export function ensureQuestions(scope: BankScope = {}, force = false): Promise<boolean> {
  const key = scopeKey(scope);
  if (force) {
    loadedKey = null;
    loading = null;
    loadingKey = null;
  }
  if (loadedKey === key) return Promise.resolve(true);
  if (loading && loadingKey === key) return loading;

  loadingKey = key;
  loading = (async () => {
    const rows = await fetchScope(scope);
    if (rows && rows.length > 0) {
      if (scope.all) {
        applyRemoteContent("questions", rows as unknown as Record<string, unknown>[]);
      } else {
        mergeIntoMemory(rows);
      }
      loadedKey = key;
      loading = null;
      return true;
    }
    loading = null;
    loadingKey = null;
    // Sin nube o lote vacío: se usa lo que ya haya en memoria.
    return read<BankQuestion[]>("questions", []).length > 0;
  })();
  return loading;
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
  loadedKey = null;
  loading = null;
  loadingKey = null;
  write("questions", []);
}
