/**
 * Presencia en vivo — quién está dentro de FlightPath ahora mismo.
 *
 * Usa el canal de Realtime Presence de la nube (`fp:presencia`): cada pestaña
 * autenticada publica un estado efímero (usuario, pantalla, actividad) y el
 * panel admin lo observa en tiempo real. No hay tabla ni migración: si la
 * pestaña se cierra, la presencia desaparece sola.
 */
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supa } from "@/lib/store/cloud";

export const PRESENCE_CHANNEL = "fp:presencia";
/** Sin interacción por más de esto, la persona se muestra como "inactiva". */
export const IDLE_MS = 5 * 60 * 1000;

export interface PresenceState {
  /** Id de pestaña (una persona puede tener varias). */
  tabId: string;
  userId: string;
  nombre: string;
  email: string;
  role: string;
  plan: string;
  avatarPath?: string | null;
  /** Ruta técnica actual (`/dashboard/banco`). */
  ruta: string;
  /** Nombre legible de la pantalla. */
  pantalla: string;
  /** Qué está haciendo, si el módulo lo reportó ("Simulador potenciado"). */
  actividad?: string | null;
  /** ISO de cuándo entró esta pestaña. */
  desde: string;
  /** ISO de la última interacción real (teclado, puntero, foco). */
  ultimaInteraccion: string;
}

/* ---------------------------------------------------------------- actividad */

let actividadActual: string | null = null;
const listeners = new Set<() => void>();

/**
 * Reporta qué está haciendo la persona en esta pestaña. Pasa `null` al salir
 * de la actividad (por ejemplo, al desmontar el cuestionario).
 */
export function setPresenceActivity(actividad: string | null): void {
  if (actividadActual === actividad) return;
  actividadActual = actividad;
  listeners.forEach((fn) => fn());
}

export function getPresenceActivity(): string | null {
  return actividadActual;
}

export function onPresenceActivityChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ------------------------------------------------------------ ruta legible */

const RUTAS: { test: RegExp; label: string }[] = [
  { test: /^\/dashboard\/?$/, label: "Dashboard" },
  { test: /^\/dashboard\/materias\/.+/, label: "Detalle de materia" },
  { test: /^\/dashboard\/materias/, label: "Materias" },
  { test: /^\/dashboard\/banco/, label: "Banco de preguntas" },
  { test: /^\/dashboard\/linea-aerea/, label: "Línea aérea" },
  { test: /^\/dashboard\/estudiemos/, label: "Estudiemos juntos" },
  { test: /^\/dashboard\/flashcards/, label: "Flashcards" },
  { test: /^\/dashboard\/clases/, label: "Clases grabadas" },
  { test: /^\/dashboard\/biblioteca/, label: "Biblioteca" },
  { test: /^\/dashboard\/analisis/, label: "Análisis de Pathy" },
  { test: /^\/dashboard\/bitacora/, label: "Bitácora" },
  { test: /^\/dashboard\/recordatorios/, label: "Recordatorios" },
  { test: /^\/dashboard\/facturacion/, label: "Facturación" },
  { test: /^\/dashboard\/planes/, label: "Planes" },
  { test: /^\/dashboard\/perfil/, label: "Mi perfil" },
  { test: /^\/dashboard\/configuracion/, label: "Configuración" },
  { test: /^\/cuestionario/, label: "Cuestionario" },
  { test: /^\/simulador/, label: "Simulador" },
  { test: /^\/ciaac/, label: "CIAAC" },
  { test: /^\/checkout/, label: "Checkout" },
  { test: /^\/gracias/, label: "Pago confirmado" },
  { test: /^\/precios/, label: "Precios" },
  { test: /^\/admin\/?$/, label: "Panel admin" },
  { test: /^\/admin\//, label: "Panel admin" },
  { test: /^\/$/, label: "Portada" },
];

export function nombrePantalla(ruta: string): string {
  const limpia = ruta.split("?")[0];
  return RUTAS.find((r) => r.test.test(limpia))?.label ?? limpia;
}

/* ----------------------------------------------------------------- canales */

export function crearCanalPresencia(tabId: string): RealtimeChannel | null {
  const client = supa();
  if (!client) return null;
  return client.channel(PRESENCE_CHANNEL, { config: { presence: { key: tabId } } });
}

/** Aplana el objeto de presencia de Supabase a una lista de estados. */
export function aplanarPresencia(raw: Record<string, unknown[]>): PresenceState[] {
  const out: PresenceState[] = [];
  for (const entradas of Object.values(raw ?? {})) {
    for (const entrada of entradas ?? []) {
      const e = entrada as Partial<PresenceState>;
      if (e && typeof e.userId === "string" && e.userId) out.push(e as PresenceState);
    }
  }
  return out;
}

/** Una persona (varias pestañas colapsadas en una fila). */
export interface PresenciaUsuario {
  userId: string;
  nombre: string;
  email: string;
  role: string;
  plan: string;
  avatarPath?: string | null;
  pantalla: string;
  ruta: string;
  actividad?: string | null;
  desde: string;
  ultimaInteraccion: string;
  pestanas: number;
  inactivo: boolean;
}

export function agruparPorUsuario(estados: PresenceState[], ahora = Date.now()): PresenciaUsuario[] {
  const mapa = new Map<string, PresenciaUsuario>();
  for (const e of estados) {
    const previo = mapa.get(e.userId);
    const inactivo = ahora - new Date(e.ultimaInteraccion).getTime() > IDLE_MS;
    if (!previo) {
      mapa.set(e.userId, {
        userId: e.userId,
        nombre: e.nombre,
        email: e.email,
        role: e.role,
        plan: e.plan,
        avatarPath: e.avatarPath ?? null,
        pantalla: e.pantalla,
        ruta: e.ruta,
        actividad: e.actividad ?? null,
        desde: e.desde,
        ultimaInteraccion: e.ultimaInteraccion,
        pestanas: 1,
        inactivo,
      });
      continue;
    }
    previo.pestanas += 1;
    // Nos quedamos con la pestaña de interacción más reciente: es la que
    // realmente refleja qué está haciendo la persona.
    if (new Date(e.ultimaInteraccion) > new Date(previo.ultimaInteraccion)) {
      previo.pantalla = e.pantalla;
      previo.ruta = e.ruta;
      previo.actividad = e.actividad ?? null;
      previo.ultimaInteraccion = e.ultimaInteraccion;
      previo.inactivo = inactivo;
    }
    if (new Date(e.desde) < new Date(previo.desde)) previo.desde = e.desde;
  }
  return [...mapa.values()].sort(
    (a, b) => new Date(b.ultimaInteraccion).getTime() - new Date(a.ultimaInteraccion).getTime(),
  );
}
