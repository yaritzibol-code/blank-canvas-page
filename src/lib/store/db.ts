/**
 * FlightPath data layer — persistencia local (localStorage, prefijo "fp_").
 *
 * Única fuente de verdad de la app. Cada colección se guarda bajo su propia
 * clave y los cambios se notifican a los suscriptores (hooks de React) para
 * que la UI se mantenga sincronizada entre pantallas y pestañas.
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
 * Claves que no cupieron en localStorage y viven sólo en memoria.
 *
 * El banco de preguntas ya pesa >3 MB y roza el límite (~5 MB) del navegador.
 * Cuando `setItem` fallaba, el valor se guardaba en memoria pero `readRaw`
 * seguía devolviendo el de localStorage: la app se quedaba con el banco viejo
 * (p. ej. sin los capítulos nuevos de ATP) sin ningún error visible. Al marcar
 * la clave aquí, la lectura prefiere el valor fresco en memoria.
 */
const memoryOnly = new Set<string>();

// Gancho de escritura: el motor de sincronización con la nube (sync.ts) se
// registra aquí para empujar cambios locales a Supabase sin acoplar db.ts.
type WriteHook = (key: string) => void;
let writeHook: WriteHook | null = null;
export function setWriteHook(fn: WriteHook | null) {
  writeHook = fn;
}

export function readRaw(key: string): string | null {
  if (!isBrowser || memoryOnly.has(key)) return memoryFallback.get(key) ?? null;
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

export function writeRaw(key: string, value: string) {
  if (isBrowser) {
    try {
      localStorage.setItem(PREFIX + key, value);
      memoryOnly.delete(key);
      memoryFallback.delete(key);
    } catch {
      // Reintento: liberar la copia anterior de esta misma clave suele bastar,
      // porque durante `setItem` conviven el valor viejo y el nuevo.
      let guardado = false;
      try {
        localStorage.removeItem(PREFIX + key);
        localStorage.setItem(PREFIX + key, value);
        guardado = true;
        memoryOnly.delete(key);
        memoryFallback.delete(key);
      } catch {
        guardado = false;
      }
      if (!guardado) {
        // Cuota agotada de verdad: se conserva en memoria para esta sesión y se
        // borra el rastro obsoleto en disco para que nadie lea datos viejos.
        try {
          localStorage.removeItem(PREFIX + key);
        } catch {
          /* noop */
        }
        memoryFallback.set(key, value);
        memoryOnly.add(key);
      }
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
