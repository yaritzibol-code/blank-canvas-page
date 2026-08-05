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
 * Claves que no cupieron en localStorage y viven en memoria + IndexedDB.
 *
 * El banco de preguntas ya pesa ~5 MB (ATP con capítulos) y NO cabe en el
 * límite de localStorage (~5 MB por origen). Cuando `setItem` falla, el valor
 * se conserva en memoria, se persiste en IndexedDB (sin límite práctico) y se
 * borra el rastro viejo del disco para que nadie lea el banco obsoleto.
 */
const memoryOnly = new Set<string>();

/* ─── IndexedDB de desbordamiento ────────────────────── */

const IDB_NAME = "fp_db_overflow";
const IDB_STORE = "kv";

function openIdb(): Promise<IDBDatabase | null> {
  if (!isBrowser || typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function idbPut(key: string, value: string) {
  void openIdb().then((db) => {
    if (!db) return;
    try {
      db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put(value, key);
    } catch {
      /* noop */
    }
  });
}

function idbDelete(key: string) {
  void openIdb().then((db) => {
    if (!db) return;
    try {
      db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).delete(key);
    } catch {
      /* noop */
    }
  });
}

let overflowLoaded: Promise<void> | null = null;

/**
 * Carga en memoria las claves desbordadas antes de que la app lea el store.
 * Sin esto, tras recargar la página el banco grande desaparecería (localStorage
 * no lo tiene) y la app volvería al banco semilla.
 */
export function loadOverflow(): Promise<void> {
  if (overflowLoaded) return overflowLoaded;
  overflowLoaded = openIdb().then(
    (db) =>
      new Promise<void>((resolve) => {
        if (!db) return resolve();
        try {
          const store = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE);
          const keysReq = store.getAllKeys();
          const valsReq = store.getAll();
          let pending = 2;
          const done = () => {
            if (--pending > 0) return;
            const keys = (keysReq.result ?? []) as string[];
            const vals = (valsReq.result ?? []) as string[];
            keys.forEach((k, i) => {
              const v = vals[i];
              if (typeof v !== "string") return;
              memoryFallback.set(k, v);
              memoryOnly.add(k);
            });
            if (keys.length) notify();
            resolve();
          };
          keysReq.onsuccess = done;
          keysReq.onerror = done;
          valsReq.onsuccess = done;
          valsReq.onerror = done;
        } catch {
          resolve();
        }
      }),
  );
  return overflowLoaded;
}

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
      if (memoryOnly.delete(key)) idbDelete(key);
      memoryFallback.delete(key);
    } catch {
      // Reintento: liberar la copia anterior de esta misma clave suele bastar,
      // porque durante `setItem` conviven el valor viejo y el nuevo.
      let guardado = false;
      try {
        localStorage.removeItem(PREFIX + key);
        localStorage.setItem(PREFIX + key, value);
        guardado = true;
        if (memoryOnly.delete(key)) idbDelete(key);
        memoryFallback.delete(key);
      } catch {
        guardado = false;
      }
      if (!guardado) {
        // Cuota agotada de verdad: memoria para esta sesión + IndexedDB para
        // las siguientes, y se borra el rastro obsoleto en disco.
        try {
          localStorage.removeItem(PREFIX + key);
        } catch {
          /* noop */
        }
        memoryFallback.set(key, value);
        memoryOnly.add(key);
        idbPut(key, value);
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
  if (memoryOnly.has(key)) idbDelete(key);

  memoryOnly.delete(key);
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
