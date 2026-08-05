/**
 * FlightPath data layer — persistencia local (localStorage, prefijo "fp_").
 *
 * Única fuente de verdad de la app en el navegador. Cada colección se guarda
 * bajo su propia clave y los cambios se notifican a los suscriptores (hooks de
 * React) para que la UI se mantenga sincronizada entre pantallas y pestañas.
 *
 * Excepción: las colecciones de MEMORY_KEYS (el banco de preguntas) NO se
 * guardan en disco. El banco pesa ~5 MB —más que el límite de localStorage— y
 * su fuente de verdad es Supabase: se descarga al abrir un cuestionario y vive
 * en memoria durante la sesión.
 */

const PREFIX = "fp_db_";
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getVersion() {
  return version;
}

function notify() {
  version++;
  listeners.forEach((fn) => fn());
}

/**
 * Notifica a los suscriptores sin escribir datos (p. ej. cuando termina la
 * restauración de la sesión de nube y los guards deben re-evaluarse).
 */
export function touch() {
  notify();
}

// Sincroniza cambios hechos desde otras pestañas
if (isBrowser) {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.startsWith(PREFIX)) notify();
  });
}

const memoryFallback = new Map<string, string>();

/**
 * Colecciones que viven sólo en memoria (nunca en localStorage).
 *
 * El banco completo (CIAAC + Línea Aérea + ATP por capítulos) supera la cuota
 * del navegador: al intentar guardarlo, `setItem` fallaba en silencio y la app
 * se quedaba con el banco viejo (sin los capítulos nuevos). Ahora se lee
 * siempre desde Supabase.
 */
const MEMORY_KEYS = new Set(["questions"]);

/** Limpia copias antiguas del banco que quedaron en disco de versiones previas. */
if (isBrowser) {
  MEMORY_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* noop */
    }
  });
  try {
    indexedDB?.deleteDatabase?.("fp_db_overflow");
  } catch {
    /* noop */
  }
}

// Gancho de escritura: el motor de sincronización con la nube (sync.ts) se
// registra aquí para empujar cambios locales a Supabase sin acoplar db.ts.
type WriteHook = (key: string) => void;
let writeHook: WriteHook | null = null;
export function setWriteHook(fn: WriteHook | null) {
  writeHook = fn;
}

export function readRaw(key: string): string | null {
  if (!isBrowser || MEMORY_KEYS.has(key)) return memoryFallback.get(key) ?? null;
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

export function writeRaw(key: string, value: string) {
  if (isBrowser && !MEMORY_KEYS.has(key)) {
    try {
      localStorage.setItem(PREFIX + key, value);
      memoryFallback.delete(key);
    } catch {
      // Cuota agotada: se conserva en memoria para esta sesión y se borra el
      // rastro obsoleto en disco para que nadie lea datos viejos.
      try {
        localStorage.removeItem(PREFIX + key);
      } catch {
        /* noop */
      }
      memoryFallback.set(key, value);
    }
  } else {
    memoryFallback.set(key, value);
  }
  writeHook?.(key);
  notify();
}

export function read<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T) {
  writeRaw(key, JSON.stringify(value));
}

/** Actualiza una colección con una función de transformación. */
export function update<T>(key: string, fallback: T, fn: (current: T) => T): T {
  const next = fn(read(key, fallback));
  write(key, next);
  return next;
}

export function remove(key: string) {
  if (isBrowser) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* noop */
    }
  }
  memoryFallback.delete(key);
  notify();
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
