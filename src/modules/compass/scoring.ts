/**
 * Scoring v1 del Pilot Aptitude Trainer (COMPASS_SCORING_VERSION = 1).
 *
 * Reglas de la casa:
 *  - El score 0-100 es una transformación fija y documentada de métricas
 *    observables. NO es un porcentaje de aprobación de ningún proceso.
 *  - Velocidad y precisión nunca se colapsan sin mostrarse por separado: el
 *    score pondera, las submétricas siempre acompañan.
 *  - Cambiar cualquier fórmula exige subir COMPASS_SCORING_VERSION; las
 *    tendencias sólo comparan sesiones de la misma versión.
 *  - El consejo del debrief sale de reglas deterministas sobre las métricas,
 *    nunca de IA.
 */
import type { CompassMetric } from "./types";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const to100 = (v: number) => Math.round(clamp01(v) * 100);

const pct = (v: number) => `${Math.round(v * 100)}%`;

/* ── Control ─────────────────────────────────────────────────────────── */

export interface ControlRaw {
  rmsX: number;
  rmsY: number;
  inBandX: number;
  inBandY: number;
  saturations: number;
  meanRecovery: number | null;
}

export function scoreControl(raw: ControlRaw): {
  score: number;
  metrics: CompassMetric[];
  advice: string;
} {
  const rms = (raw.rmsX + raw.rmsY) / 2;
  const inBand = (raw.inBandX + raw.inBandY) / 2;
  // Precisión: RMS 0.08 ≈ perfecto, 0.5 ≈ sin control efectivo.
  const precision = clamp01(1 - (rms - 0.08) / 0.42);
  const score = to100(0.55 * precision + 0.45 * inBand) - Math.min(20, raw.saturations * 4);

  const asym = Math.abs(raw.rmsX - raw.rmsY) > 0.08;
  const advice =
    raw.saturations >= 3
      ? "Tocaste los topes varias veces: corrige antes y con menos deflexión — la ráfaga se contiene con dos toques suaves, no con uno grande."
      : asym
        ? `Tu eje ${raw.rmsX > raw.rmsY ? "horizontal" : "vertical"} está notablemente más flojo: en la próxima práctica fija la vista al centro y trabaja ese eje con correcciones tempranas.`
        : inBand < 0.5
          ? "Pasas la mitad del tiempo fuera de banda: baja un nivel y prioriza mantener el centro sobre reaccionar rápido."
          : "Buen control base. Sube de nivel y cuida que la suavidad no se pierda con más turbulencia.";

  return {
    score: Math.max(0, score),
    metrics: [
      {
        key: "rms",
        label: "Error RMS",
        value: rms.toFixed(3),
        higherIsBetter: false,
        hint: "Distancia media al centro (0 = perfecto, 1 = tope).",
      },
      {
        key: "in_band",
        label: "Tiempo en banda",
        value: pct(inBand),
        higherIsBetter: true,
        hint: "Fracción de la sesión con ambas agujas centradas.",
      },
      {
        key: "rms_x",
        label: "RMS eje horizontal",
        value: raw.rmsX.toFixed(3),
        higherIsBetter: false,
      },
      {
        key: "rms_y",
        label: "RMS eje vertical",
        value: raw.rmsY.toFixed(3),
        higherIsBetter: false,
      },
      {
        key: "saturations",
        label: "Pérdidas de control",
        value: String(raw.saturations),
        higherIsBetter: false,
        hint: "Veces que una aguja tocó el tope.",
      },
      {
        key: "recovery",
        label: "Recuperación tras ráfaga",
        value: raw.meanRecovery !== null ? `${raw.meanRecovery.toFixed(1)} s` : "—",
        higherIsBetter: false,
        hint: "Segundos promedio para volver a banda después de una ráfaga.",
      },
    ],
    advice,
  };
}

/* ── Slalom ──────────────────────────────────────────────────────────── */

export interface SlalomRaw {
  gatesTotal: number;
  gatesClean: number;
  gatesTouch: number;
  gatesMiss: number;
  meanDev: number;
  reversalsPerGate: number;
}

export function scoreSlalom(raw: SlalomRaw): {
  score: number;
  metrics: CompassMetric[];
  advice: string;
} {
  const cleanPct = raw.gatesTotal > 0 ? raw.gatesClean / raw.gatesTotal : 0;
  const touchPct = raw.gatesTotal > 0 ? raw.gatesTouch / raw.gatesTotal : 0;
  // Centrado: desviación media 0.25 del medio-ancho ≈ excelente, 1 = al poste.
  const centering = clamp01(1 - (raw.meanDev - 0.25) / 0.75);
  const score = to100(0.6 * (cleanPct + 0.5 * touchPct) + 0.4 * centering);

  const advice =
    raw.gatesMiss > raw.gatesTotal * 0.25
      ? "Fallas 1 de cada 4 puertas: mira siempre la SIGUIENTE puerta y empieza la corrección al cruzar la actual."
      : raw.reversalsPerGate > 2.2
        ? "Demasiados bandazos por puerta: comanda una corrección y espérala — el avión tiene inercia y llega solo."
        : raw.meanDev > 0.6
          ? "Cruzas rozando los postes: apunta al centro exacto, no a 'pasar'. El margen es tu colchón cuando la pista se cierre."
          : "Trayectoria limpia. Sube de nivel para entrenar con puertas más cerradas y mayor velocidad.";

  return {
    score,
    metrics: [
      {
        key: "gates_clean",
        label: "Puertas limpias",
        value: `${raw.gatesClean}/${raw.gatesTotal}`,
        higherIsBetter: true,
      },
      {
        key: "gates_touch",
        label: "Con roce",
        value: String(raw.gatesTouch),
        higherIsBetter: false,
        hint: "Cruzaste el vano pero clipaste el poste.",
      },
      { key: "gates_miss", label: "Falladas", value: String(raw.gatesMiss), higherIsBetter: false },
      {
        key: "mean_dev",
        label: "Desviación del centro",
        value: pct(Math.min(1, raw.meanDev)),
        higherIsBetter: false,
        hint: "Promedio respecto al medio-ancho de la puerta.",
      },
      {
        key: "reversals",
        label: "Correcciones por puerta",
        value: raw.reversalsPerGate.toFixed(1),
        higherIsBetter: false,
        hint: "Cambios de dirección del alerón; menos = más suave.",
      },
    ],
    advice,
  };
}

/* ── Memoria ─────────────────────────────────────────────────────────── */

export interface MemoryRaw {
  fieldsTotal: number;
  fieldsCorrect: number;
  blocksTotal: number;
  blocksPerfect: number;
  /** Errores de un solo dígito (cerca) vs errores totales. */
  nearMisses: number;
  medianAnswerSec: number | null;
}

export function scoreMemory(raw: MemoryRaw): {
  score: number;
  metrics: CompassMetric[];
  advice: string;
} {
  const fieldAcc = raw.fieldsTotal > 0 ? raw.fieldsCorrect / raw.fieldsTotal : 0;
  const blockAcc = raw.blocksTotal > 0 ? raw.blocksPerfect / raw.blocksTotal : 0;
  const score = to100(0.65 * fieldAcc + 0.35 * blockAcc);

  const errors = raw.fieldsTotal - raw.fieldsCorrect;
  const advice =
    errors > 0 && raw.nearMisses / Math.max(1, errors) >= 0.6
      ? "Casi todos tus errores son de un dígito (350→305): verbaliza el número completo al memorizar, no lo fotografíes."
      : blockAcc < 0.4 && fieldAcc > 0.7
        ? "Retienes campos sueltos pero pierdes el bloque completo: agrupa siempre en el mismo orden (HDG→FL→SPD→FREQ) y repásalo una vez antes de responder."
        : fieldAcc < 0.6
          ? "Baja un nivel y practica con recall inmediato hasta que el formato de cada campo te sea automático."
          : "Sólida retención. Sube de nivel para añadir interferencia y más campos.";
  const medianStr = raw.medianAnswerSec !== null ? `${raw.medianAnswerSec.toFixed(1)} s` : "—";

  return {
    score,
    metrics: [
      {
        key: "fields",
        label: "Campos correctos",
        value: `${raw.fieldsCorrect}/${raw.fieldsTotal}`,
        higherIsBetter: true,
      },
      {
        key: "blocks",
        label: "Bloques perfectos",
        value: `${raw.blocksPerfect}/${raw.blocksTotal}`,
        higherIsBetter: true,
        hint: "Bloques con todos los campos exactos.",
      },
      {
        key: "near",
        label: "Errores de un dígito",
        value: String(raw.nearMisses),
        higherIsBetter: false,
        hint: "Respuestas casi correctas (un dígito de diferencia).",
      },
      { key: "median_rt", label: "Tiempo por respuesta", value: medianStr, higherIsBetter: false },
    ],
    advice,
  };
}

/* ── Cálculo (y otras tareas de reactivos con opciones) ──────────────── */

export interface ItemsRaw {
  total: number;
  correct: number;
  omitted: number;
  medianCorrectSec: number | null;
  /** Cálculo: aciertos por tema; Orientación: conteo por confusión. */
  breakdown: Record<string, { correct: number; total: number }>;
}

export function scoreCalc(raw: ItemsRaw): {
  score: number;
  metrics: CompassMetric[];
  advice: string;
} {
  const acc = raw.total > 0 ? raw.correct / raw.total : 0;
  // Ritmo: mediana ≤25 s por acierto suma; >55 s ya no.
  const paceBonus = raw.medianCorrectSec !== null ? clamp01((55 - raw.medianCorrectSec) / 30) : 0.5;
  const score = to100(0.85 * acc + 0.15 * paceBonus);

  const weakest = Object.entries(raw.breakdown)
    .filter(([, v]) => v.total >= 2)
    .map(([k, v]) => ({ k, pct: v.correct / v.total, total: v.total }))
    .sort((a, b) => a.pct - b.pct)[0];

  const advice =
    raw.omitted > raw.total * 0.2
      ? "Dejaste muchas sin responder: en estos formatos una estimación razonada vale más que el silencio — descarta dos opciones y decide."
      : weakest && weakest.pct < 0.6
        ? `Tu tema más flojo fue "${weakest.k}": repásalo en práctica antes del siguiente examen.`
        : raw.medianCorrectSec !== null && raw.medianCorrectSec > 45
          ? "Precisión buena pero ritmo justo: entrena estimando el orden de magnitud ANTES de calcular fino."
          : "Buen balance de precisión y ritmo. Sube el nivel o pasa al formato de examen completo.";

  return {
    score,
    metrics: [
      { key: "acc", label: "Aciertos", value: `${raw.correct}/${raw.total}`, higherIsBetter: true },
      { key: "omitted", label: "Sin responder", value: String(raw.omitted), higherIsBetter: false },
      {
        key: "median_rt",
        label: "Tiempo por acierto",
        value: raw.medianCorrectSec !== null ? `${Math.round(raw.medianCorrectSec)} s` : "—",
        higherIsBetter: false,
        hint: "Mediana; sólo cuenta el tiempo de las respuestas correctas.",
      },
    ],
    advice,
  };
}

/* ── Orientación ─────────────────────────────────────────────────────── */

export function scoreOrientation(
  raw: ItemsRaw,
  confusionLabels: Record<string, string>,
): { score: number; metrics: CompassMetric[]; advice: string } {
  const base = scoreCalc(raw);
  // Confusión dominante: el tipo de error más repetido con nombre y apellido.
  const confusions = Object.entries(raw.breakdown)
    .filter(([k]) => k !== "correcto")
    .map(([k, v]) => ({ k, n: v.total }))
    .sort((a, b) => b.n - a.n);
  const dominant = confusions[0];
  const advice =
    dominant && dominant.n >= 2 && confusionLabels[dominant.k]
      ? confusionLabels[dominant.k]
      : base.advice;
  const metrics = [...base.metrics];
  if (dominant && dominant.n >= 2) {
    metrics.push({
      key: "confusion",
      label: "Error dominante",
      value: `${dominant.k} ×${dominant.n}`,
      higherIsBetter: false,
    });
  }
  return { score: base.score, metrics, advice };
}

/* ── Multitarea ──────────────────────────────────────────────────────── */

export interface MultiRaw {
  transfersOk: number;
  transfersError: number;
  transfersPerMin: number;
  transferAccuracy: number;
  hits: number;
  misses: number;
  falseAlarms: number;
  hitRate: number;
  medianReactionSec: number | null;
}

export function scoreMulti(raw: MultiRaw): {
  score: number;
  metrics: CompassMetric[];
  advice: string;
} {
  // Primaria: 3 transferencias correctas/min ≈ piso útil, 8+ ≈ excelente.
  const throughput = clamp01((raw.transfersPerMin - 1) / 7);
  const primary = 0.6 * throughput + 0.4 * clamp01(raw.transferAccuracy);
  const secondary = clamp01(raw.hitRate);
  const faPenalty = Math.min(15, raw.falseAlarms * 3);
  const score = Math.max(0, to100(0.55 * primary + 0.45 * secondary) - faPenalty);

  const advice =
    raw.misses > raw.hits * 0.4
      ? "Se te vencieron muchas alertas: instala un barrido visual cada 3-4 segundos aunque estés a media transferencia."
      : raw.falseAlarms >= 3
        ? "Apagas sistemas sanos: confirma QUÉ sistema alerta antes de tocar — cada falsa alarma resta."
        : raw.transferAccuracy < 0.85
          ? "Tu tarea primaria pierde exactitud bajo presión: teclea el dato completo y verifica antes de enviar, la velocidad llega después."
          : "Buen reparto de atención. Sube de nivel para más alertas por minuto y ventanas más cortas.";

  return {
    score,
    metrics: [
      {
        key: "tpm",
        label: "Transferencias por minuto",
        value: raw.transfersPerMin.toFixed(1),
        higherIsBetter: true,
      },
      {
        key: "t_acc",
        label: "Exactitud primaria",
        value: pct(raw.transferAccuracy),
        higherIsBetter: true,
      },
      {
        key: "hit_rate",
        label: "Alertas atendidas",
        value: `${raw.hits}/${raw.hits + raw.misses}`,
        higherIsBetter: true,
      },
      {
        key: "rt",
        label: "Reacción mediana",
        value: raw.medianReactionSec !== null ? `${raw.medianReactionSec.toFixed(1)} s` : "—",
        higherIsBetter: false,
      },
      { key: "fa", label: "Falsas alarmas", value: String(raw.falseAlarms), higherIsBetter: false },
    ],
    advice,
  };
}
