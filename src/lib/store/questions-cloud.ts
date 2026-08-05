/**
 * Banco de preguntas: descarga bajo demanda desde Supabase.
 *
 * El banco (CIAAC + Línea Aérea + ATP por capítulos, ~4,800 reactivos) es la
 * única colección que NO se guarda en el navegador: pesa más que la cuota de
 * localStorage y su fuente de verdad es la tabla `content`. Se descarga la
 * primera vez que una pantalla lo necesita y queda en memoria (db.ts) hasta
 * recargar la página.
 */
import { supa } from "./cloud";
import { read } from "./db";
import { applyRemoteContent } from "./sync";
import type { BankQuestion } from "./types";

const PAGE = 1000;

let loading: Promise<boolean> | null = null;
let loadedOk = false;

/** true cuando el banco de la nube ya está en memoria. */
export function questionsLoaded(): boolean {
  return loadedOk;
}

async function fetchAllQuestions(): Promise<BankQuestion[] | null> {
  const s = supa();
  if (!s) return null;
  const all: BankQuestion[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await s
      .from("content")
      .select("data")
      .eq("collection", "questions")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) return null;
    const rows = (data ?? []) as { data: BankQuestion }[];
    rows.forEach((r) => all.push(r.data));
    if (rows.length < PAGE) break;
  }
  return all;
}

/**
 * Garantiza que el banco esté disponible. Devuelve `true` si hay preguntas
 * utilizables (de la nube o, sin conexión, las que ya estén en memoria).
 */
export function ensureQuestions(force = false): Promise<boolean> {
  if (force) {
    loadedOk = false;
    loading = null;
  }
  if (loadedOk) return Promise.resolve(true);
  if (loading) return loading;
  loading = (async () => {
    const remote = await fetchAllQuestions();
    if (remote && remote.length > 0) {
      applyRemoteContent("questions", remote as unknown as Record<string, unknown>[]);
      loadedOk = true;
      return true;
    }
    loading = null;
    // Sin nube (o error de red): se usa lo que haya en memoria de esta sesión.
    return read<BankQuestion[]>("questions", []).length > 0;
  })();
  return loading;
}
