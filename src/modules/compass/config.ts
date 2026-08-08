/**
 * Definición de los módulos del Pilot Aptitude Trainer.
 *
 * Las duraciones del modo examen siguen los formatos de referencia pública de
 * baterías tipo COMPASS (hipótesis de diseño, no especificación oficial); la
 * práctica usa bloques cortos con nivel 1-5. Cambiar formatos o fórmulas exige
 * subir la versión correspondiente: las tendencias sólo comparan sesiones de
 * la misma versión.
 */
import type { FPIconName } from "@/components/ui/fp-icon";
import type { CompassModuleId, CompassMode, CompassRunConfig } from "./types";

/** Versión del motor (formatos y generadores). */
export const COMPASS_MODULE_VERSION = 1;
/** Versión de las fórmulas de scoring (ver scoring.ts). */
export const COMPASS_SCORING_VERSION = 1;

export interface CompassModuleDef {
  id: CompassModuleId;
  nombre: string;
  /** Qué aptitud entrena, en una línea. */
  aptitud: string;
  descripcion: string;
  icon: FPIconName;
  /** Cómo se controla, para el briefing (desktop / móvil). */
  controlesDesktop: string;
  controlesMovil: string;
  /** Duración de la práctica por nivel (seg). */
  practicaSec: number;
  /** Ítems de práctica (0 = tarea continua). */
  practicaItems: number;
  /** Formato del examen de módulo. */
  examenSec: number;
  examenItems: number;
  examenNivel: number;
  /** Errores típicos que el briefing advierte. */
  erroresComunes: string[];
}

export const COMPASS_MODULES: CompassModuleDef[] = [
  {
    id: "control",
    nombre: "Control",
    aptitud: "Coordinación mano-ojo en dos ejes",
    descripcion:
      "Mantén centradas las dos agujas de un indicador de desviación mientras la turbulencia las empuja. Mide estabilidad, no fuerza: correcciones pequeñas y constantes.",
    icon: "target",
    controlesDesktop:
      "Mouse: arrastra dentro del panel — la distancia al centro es la tasa de corrección. Teclado: flechas o WASD.",
    controlesMovil: "Arrastra el pulgar sobre el panel como si fuera un stick virtual.",
    practicaSec: 120,
    practicaItems: 0,
    examenSec: 300,
    examenItems: 0,
    examenNivel: 3,
    erroresComunes: [
      "Sobrecorregir: soltar tarde una corrección grande genera oscilación.",
      "Mirar una sola aguja: reparte la atención entre ambos ejes.",
      "Perseguir la aguja: anticipa la deriva en lugar de reaccionar tarde.",
    ],
  },
  {
    id: "slalom",
    nombre: "Slalom",
    aptitud: "Seguimiento con anticipación",
    descripcion:
      "Cruza cada puerta por el centro con un avión que tiene inercia real. Gana quien corrige temprano y suave, no quien reacciona al final.",
    icon: "wind",
    controlesDesktop: "Flechas ← → (o A/D). Con mouse: apunta a donde quieres el avión.",
    controlesMovil: "Arrastra a los lados para comandar el alerón.",
    practicaSec: 120,
    practicaItems: 0,
    examenSec: 300,
    examenItems: 0,
    examenNivel: 3,
    erroresComunes: [
      "Corregir tarde: mira la siguiente puerta, no la actual.",
      "Bandazos: dos correcciones suaves valen más que una brusca.",
      "Velocidad de crucero mental: el patrón de puertas cambia, tu ritmo también.",
    ],
  },
  {
    id: "memoria",
    nombre: "Memoria",
    aptitud: "Memoria de corto plazo bajo interferencia",
    descripcion:
      "Memoriza bloques de parámetros de vuelo (rumbo, nivel, velocidad, frecuencia), resiste un distractor y reprodúcelos exactos.",
    icon: "brain",
    controlesDesktop: "Teclado numérico para responder cada campo.",
    controlesMovil: "Teclado numérico en pantalla.",
    practicaSec: 0,
    practicaItems: 6,
    examenSec: 300,
    examenItems: 0,
    examenNivel: 3,
    erroresComunes: [
      "Repetir en bucle sin agrupar: siempre en el mismo orden (HDG→FL→SPD→FREQ).",
      "Confundir dígitos vecinos (350/305): verbaliza el número completo.",
      "Perder el bloque con el distractor: re-ensaya justo antes de responder.",
    ],
  },
  {
    id: "calculo",
    nombre: "Cálculo",
    aptitud: "Aritmética mental con presión de tiempo",
    descripcion:
      "Velocidad-distancia-tiempo, combustible, conversiones, porcentajes y regla de tres con números de cabina. Sin calculadora: estima, decide, sigue.",
    icon: "gauge",
    controlesDesktop: "Click o teclas 1-4 para elegir la opción.",
    controlesMovil: "Toca la opción.",
    practicaSec: 0,
    practicaItems: 10,
    examenSec: 1080,
    examenItems: 24,
    examenNivel: 3,
    erroresComunes: [
      "Dividir cuando era multiplicar: escribe mentalmente la unidad del resultado.",
      "Errores de orden de magnitud: estima antes de calcular fino.",
      "Quedarse clavado: marca tu mejor estimación y avanza.",
    ],
  },
  {
    id: "orientacion",
    nombre: "Orientación",
    aptitud: "Orientación espacial con instrumentos",
    descripcion:
      "Lee el girodireccional y la aguja ADF, y elige el mapa que muestra tu posición real respecto a la estación. Traducción instrumentos → imagen mental.",
    icon: "compass",
    controlesDesktop: "Click o teclas 1-4 para elegir el mapa.",
    controlesMovil: "Toca el mapa correcto.",
    practicaSec: 0,
    practicaItems: 8,
    examenSec: 600,
    examenItems: 16,
    examenNivel: 3,
    erroresComunes: [
      "Confundir QDM con QDR: la aguja apunta HACIA la estación.",
      "Rumbos recíprocos (240 vs 060): verifica el norte de la carta.",
      "Girar el mapa en vez de girarte tú: fija el norte y mueve el avión.",
    ],
  },
  {
    id: "multitarea",
    nombre: "Multitarea",
    aptitud: "Atención dividida y priorización",
    descripcion:
      "Transfiere datos sin errores mientras vigilas cuatro sistemas que fallan cuando menos lo esperas. Mide cuánto rinde tu atención cuando compiten dos tareas.",
    icon: "grid",
    controlesDesktop: "Teclea el dato y Enter; apaga alertas con click o teclas 1-4.",
    controlesMovil: "Teclado numérico + toca la alerta para apagarla.",
    practicaSec: 150,
    practicaItems: 0,
    examenSec: 300,
    examenItems: 0,
    examenNivel: 3,
    erroresComunes: [
      "Túnel en la tarea primaria: barre los sistemas cada pocos segundos.",
      "Apagar por reflejo sin alerta real: las falsas alarmas restan.",
      "Cambiar de tarea a medias: termina el dato que empezaste.",
    ],
  },
];

export const COMPASS_MODULE_MAP: Record<CompassModuleId, CompassModuleDef> = Object.fromEntries(
  COMPASS_MODULES.map((m) => [m.id, m]),
) as Record<CompassModuleId, CompassModuleDef>;

/** Config de ejecución para un módulo/modo/nivel dados. */
export function buildRunConfig(
  moduleId: CompassModuleId,
  mode: CompassMode,
  level: number,
  seed: number,
): CompassRunConfig {
  const def = COMPASS_MODULE_MAP[moduleId];
  if (mode === "examen") {
    return {
      moduleId,
      mode,
      level: def.examenNivel,
      seed,
      durationSec: def.examenSec,
      items: def.examenItems,
    };
  }
  if (mode === "simulacro") {
    const sim = SIMULACRO_COMPACTO.find((b) => b.moduleId === moduleId);
    return {
      moduleId,
      mode,
      level: sim?.level ?? def.examenNivel,
      seed,
      durationSec: sim?.durationSec ?? def.examenSec,
      items: sim?.items ?? def.examenItems,
    };
  }
  return {
    moduleId,
    mode,
    level,
    seed,
    durationSec: def.practicaSec,
    items: def.practicaItems,
  };
}

/**
 * Simulacro compacto v1 (~20 min): los seis módulos en secuencia con formatos
 * reducidos. Se comunica como entrenamiento integral, nunca como batería
 * oficial ni como equivalencia de resultados.
 */
export const SIMULACRO_COMPACTO: {
  moduleId: CompassModuleId;
  durationSec: number;
  items: number;
  level: number;
}[] = [
  { moduleId: "control", durationSec: 150, items: 0, level: 3 },
  { moduleId: "slalom", durationSec: 150, items: 0, level: 3 },
  { moduleId: "calculo", durationSec: 360, items: 8, level: 3 },
  { moduleId: "memoria", durationSec: 0, items: 5, level: 3 },
  { moduleId: "multitarea", durationSec: 150, items: 0, level: 3 },
  { moduleId: "orientacion", durationSec: 300, items: 8, level: 3 },
];

/** Duración estimada del simulacro compacto, para mostrarla en el hub. */
export const SIMULACRO_MIN_APROX = 20;
