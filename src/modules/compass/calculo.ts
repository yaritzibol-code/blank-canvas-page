/**
 * Motor del módulo Cálculo — aritmética mental aeronáutica parametrizada.
 *
 * Cada plantilla produce infinitas variantes con números elegidos para que la
 * operación sea limpia de cabeza (sin calculadora) y con distractores ligados
 * a errores típicos: operación invertida, orden de magnitud, unidad vecina.
 * Todo determinista por seed; cada ítem trae su rationale para la práctica.
 */
import { deriveSeed, mulberry32, pick, randInt, shuffle, type Rng } from "./rng";

export interface CalcItem {
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  /** Familia de la plantilla, para el diagnóstico del debrief. */
  topic: CalcTopic;
}

export type CalcTopic =
  "tiempo-distancia" | "combustible" | "conversiones" | "descenso" | "porcentajes" | "promedios";

const TOPIC_LABEL: Record<CalcTopic, string> = {
  "tiempo-distancia": "Velocidad · distancia · tiempo",
  combustible: "Combustible y autonomía",
  conversiones: "Conversión de unidades",
  descenso: "Planificación de descenso",
  porcentajes: "Porcentajes y fracciones",
  promedios: "Promedios y datos",
};

export function calcTopicLabel(t: CalcTopic): string {
  return TOPIC_LABEL[t];
}

function fmtMin(totalMin: number): string {
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Construye las 4 opciones barajadas a partir de la correcta + distractores. */
function makeOptions(
  rng: Rng,
  correct: string,
  distractors: string[],
): { options: string[]; correctIndex: number } {
  const uniq = [...new Set([correct, ...distractors])].slice(0, 4);
  // Si algún distractor colisionó con la respuesta, se rellena con variantes.
  let extra = 1;
  while (uniq.length < 4) {
    const candidate = `${correct} (${extra})`;
    if (!uniq.includes(candidate)) uniq.push(candidate);
    extra++;
  }
  const options = shuffle(rng, uniq);
  return { options, correctIndex: options.indexOf(correct) };
}

/* ── Plantillas ───────────────────────────────────────────────────────── */

function tiempoDistancia(rng: Rng): CalcItem {
  const gs = pick(rng, [120, 150, 180, 240, 300, 360, 420, 480]);
  const perMin = gs / 60;
  const minutes = pick(rng, [12, 15, 20, 24, 30, 36, 45, 48, 60, 75, 90]);
  const dist = perMin * minutes;
  if (rng() < 0.5) {
    const correct = fmtMin(minutes);
    const { options, correctIndex } = makeOptions(rng, correct, [
      fmtMin(minutes * 2),
      fmtMin(Math.max(5, Math.round(minutes / 2))),
      fmtMin(minutes + 10),
    ]);
    return {
      question: `Groundspeed ${gs} kt. ¿Cuánto tardas en recorrer ${dist} NM?`,
      options,
      correctIndex,
      rationale: `${gs} kt = ${perMin} NM/min → ${dist} ÷ ${perMin} = ${minutes} min.`,
      topic: "tiempo-distancia",
    };
  }
  const correct = `${dist} NM`;
  const { options, correctIndex } = makeOptions(rng, correct, [
    `${dist * 2} NM`,
    `${Math.round(dist / 2)} NM`,
    `${dist + 20} NM`,
  ]);
  return {
    question: `Groundspeed ${gs} kt durante ${fmtMin(minutes)}. ¿Qué distancia recorres?`,
    options,
    correctIndex,
    rationale: `${gs} kt = ${perMin} NM/min → ${perMin} × ${minutes} = ${dist} NM.`,
    topic: "tiempo-distancia",
  };
}

function combustible(rng: Rng): CalcItem {
  const flow = pick(rng, [1200, 1500, 1800, 2400, 3000, 3600]);
  const hours = pick(rng, [0.5, 1, 1.5, 2, 2.5]);
  if (rng() < 0.5) {
    const fuel = flow * hours;
    const correct = fmtMin(Math.round(hours * 60));
    const { options, correctIndex } = makeOptions(rng, correct, [
      fmtMin(Math.round(hours * 60 * 2)),
      fmtMin(Math.max(10, Math.round((hours * 60) / 2))),
      fmtMin(Math.round(hours * 60) + 15),
    ]);
    return {
      question: `Consumo ${flow} kg/h y quedan ${fuel.toLocaleString("es-MX")} kg utilizables. ¿Autonomía restante?`,
      options,
      correctIndex,
      rationale: `${fuel.toLocaleString("es-MX")} ÷ ${flow} = ${hours} h.`,
      topic: "combustible",
    };
  }
  const mins = pick(rng, [20, 30, 40, 45, 90]);
  const fuel = Math.round((flow * mins) / 60);
  const correct = `${fuel.toLocaleString("es-MX")} kg`;
  const { options, correctIndex } = makeOptions(rng, correct, [
    `${(fuel * 2).toLocaleString("es-MX")} kg`,
    `${Math.round(fuel / 2).toLocaleString("es-MX")} kg`,
    `${(fuel + 100).toLocaleString("es-MX")} kg`,
  ]);
  return {
    question: `Consumo ${flow} kg/h. ¿Cuánto combustible quemas en ${fmtMin(mins)}?`,
    options,
    correctIndex,
    rationale: `${flow} × ${mins}/60 = ${fuel.toLocaleString("es-MX")} kg.`,
    topic: "combustible",
  };
}

function conversiones(rng: Rng): CalcItem {
  const kind = pick(rng, ["nm-km", "ft-m", "kt-kmh"] as const);
  if (kind === "nm-km") {
    const nm = pick(rng, [10, 20, 50, 100, 200]);
    const km = Math.round(nm * 1.852);
    const correct = `≈ ${km} km`;
    const { options, correctIndex } = makeOptions(rng, correct, [
      `≈ ${Math.round(nm / 1.852)} km`,
      `≈ ${Math.round(nm * 1.6)} km`,
      `≈ ${Math.round(km * 10)} km`,
    ]);
    return {
      question: `${nm} NM son aproximadamente…`,
      options,
      correctIndex,
      rationale: `1 NM = 1.852 km → ${nm} × 1.852 ≈ ${km} km.`,
      topic: "conversiones",
    };
  }
  if (kind === "ft-m") {
    const ft = pick(rng, [1000, 2000, 5000, 10000, 30000]);
    const m = Math.round(ft * 0.3048);
    const correct = `≈ ${m.toLocaleString("es-MX")} m`;
    const { options, correctIndex } = makeOptions(rng, correct, [
      `≈ ${Math.round(ft * 3.28).toLocaleString("es-MX")} m`,
      `≈ ${Math.round(m / 10).toLocaleString("es-MX")} m`,
      `≈ ${(m + 200).toLocaleString("es-MX")} m`,
    ]);
    return {
      question: `${ft.toLocaleString("es-MX")} ft son aproximadamente…`,
      options,
      correctIndex,
      rationale: `1 ft = 0.3048 m → ${ft.toLocaleString("es-MX")} × 0.3 ≈ ${m.toLocaleString("es-MX")} m.`,
      topic: "conversiones",
    };
  }
  const kt = pick(rng, [100, 150, 200, 250, 300]);
  const kmh = Math.round(kt * 1.852);
  const correct = `≈ ${kmh} km/h`;
  const { options, correctIndex } = makeOptions(rng, correct, [
    `≈ ${Math.round(kt / 1.852)} km/h`,
    `≈ ${Math.round(kt * 1.15)} km/h`,
    `≈ ${kmh + 100} km/h`,
  ]);
  return {
    question: `${kt} kt son aproximadamente…`,
    options,
    correctIndex,
    rationale: `1 kt = 1.852 km/h → ${kt} × 1.852 ≈ ${kmh} km/h.`,
    topic: "conversiones",
  };
}

function descenso(rng: Rng): CalcItem {
  if (rng() < 0.5) {
    const alt = pick(rng, [6000, 9000, 12000, 18000, 24000]);
    const rate = pick(rng, [1000, 1200, 1500, 2000]);
    const mins = alt / rate;
    const clean = Number.isInteger(mins) ? mins : Math.round(mins * 2) / 2;
    const correct = `${clean} min`;
    const { options, correctIndex } = makeOptions(rng, correct, [
      `${clean * 2} min`,
      `${Math.max(1, Math.round(clean / 2))} min`,
      `${clean + 3} min`,
    ]);
    return {
      question: `Debes perder ${alt.toLocaleString("es-MX")} ft a ${rate.toLocaleString("es-MX")} ft/min. ¿Cuántos minutos de descenso?`,
      options,
      correctIndex,
      rationale: `${alt.toLocaleString("es-MX")} ÷ ${rate.toLocaleString("es-MX")} = ${clean} min.`,
      topic: "descenso",
    };
  }
  const fl = pick(rng, [90, 120, 150, 180, 240, 300]);
  const nm = (fl / 10) * 3;
  const correct = `≈ ${nm} NM`;
  const { options, correctIndex } = makeOptions(rng, correct, [
    `≈ ${fl} NM`,
    `≈ ${nm * 2} NM`,
    `≈ ${Math.round(nm / 2)} NM`,
  ]);
  return {
    question: `Regla 3:1 — ¿a cuántas NM inicias descenso para perder FL${fl} hasta el campo (elevación ~0)?`,
    options,
    correctIndex,
    rationale: `3 NM por cada 1,000 ft → ${fl / 10} × 3 = ${nm} NM.`,
    topic: "descenso",
  };
}

function porcentajes(rng: Rng): CalcItem {
  if (rng() < 0.5) {
    const base = pick(rng, [1200, 1800, 2400, 3600, 4800, 6000]);
    const pct = pick(rng, [5, 10, 15, 20, 25, 40]);
    const val = Math.round((base * pct) / 100);
    const correct = val.toLocaleString("es-MX");
    const { options, correctIndex } = makeOptions(rng, correct, [
      (val * 10).toLocaleString("es-MX"),
      Math.round(val / 2).toLocaleString("es-MX"),
      (base - val).toLocaleString("es-MX"),
    ]);
    return {
      question: `¿Cuánto es el ${pct}% de ${base.toLocaleString("es-MX")}?`,
      options,
      correctIndex,
      rationale: `10% = ${base / 10} → ${pct}% = ${val.toLocaleString("es-MX")}.`,
      topic: "porcentajes",
    };
  }
  const den = pick(rng, [4, 5, 8, 10, 20, 25]);
  const num = randInt(rng, 1, den - 1);
  const pct = Math.round((num / den) * 100);
  const correct = `${pct}%`;
  const wrongInverse = Math.round((den / (num + den)) * 100);
  const { options, correctIndex } = makeOptions(rng, correct, [
    `${Math.min(99, pct + 10)}%`,
    `${Math.max(1, pct - 15)}%`,
    `${wrongInverse}%`,
  ]);
  return {
    question: `Expresa ${num}/${den} como porcentaje.`,
    options,
    correctIndex,
    rationale: `${num} ÷ ${den} = ${(num / den).toFixed(2)} → ${pct}%.`,
    topic: "porcentajes",
  };
}

function promedios(rng: Rng): CalcItem {
  const n = pick(rng, [3, 4]);
  const mean = pick(rng, [20, 25, 30, 40, 50]);
  // Valores que suman exactamente mean*n, con dispersión pequeña.
  const vals: number[] = [];
  let rem = mean * n;
  for (let i = 0; i < n - 1; i++) {
    const delta = randInt(rng, -8, 8);
    const v = mean + delta;
    vals.push(v);
    rem -= v;
  }
  vals.push(rem);
  const correct = String(mean);
  const sum = mean * n;
  const { options, correctIndex } = makeOptions(rng, correct, [
    String(sum),
    String(mean + pick(rng, [2, 5])),
    String(mean - pick(rng, [2, 5])),
  ]);
  return {
    question: `Promedio de ${vals.join(", ")}:`,
    options,
    correctIndex,
    rationale: `Suman ${sum}; ${sum} ÷ ${n} = ${mean}.`,
    topic: "promedios",
  };
}

const TEMPLATES: ((rng: Rng) => CalcItem)[] = [
  tiempoDistancia,
  combustible,
  conversiones,
  descenso,
  porcentajes,
  promedios,
];

/**
 * Genera el ítem `index` de la sesión. Las plantillas rotan para cubrir todos
 * los temas antes de repetir; dentro de cada plantilla la variante (directa o
 * inversa) la decide el rng de la seed.
 */
export function buildCalcItem(seed: number, index: number): CalcItem {
  const rng = mulberry32(deriveSeed(seed, 400 + index));
  // Primero una pasada por todos los temas en orden barajado por seed, luego libre.
  const order = shuffle(mulberry32(deriveSeed(seed, 499)), TEMPLATES);
  const tpl = index < order.length ? order[index] : pick(rng, TEMPLATES);
  return tpl(rng);
}
