/**
 * Motor del módulo Orientación — instrumentos → imagen mental.
 *
 * Estado verdadero: rumbo propio (HDG) y marcación relativa (RB) de la aguja
 * ADF hacia una estación NDB. El alumno ve el girodireccional + la aguja y
 * elige el mapa cenital (norte arriba) que muestra dónde está el avión
 * respecto a la estación y hacia dónde apunta su nariz.
 *
 * Geometría:
 *   QDM (magnetic bearing avión→estación) = (HDG + RB) mod 360
 *   QDR (radial estación→avión)           = (QDM + 180) mod 360
 * En el mapa, el avión se dibuja sobre el radial QDR desde la estación, con
 * la nariz en HDG. Cada distractor es UNA transformación identificable, lo
 * que permite nombrar el error en el debrief.
 */
import { deriveSeed, mulberry32, pick, randInt, shuffle } from "./rng";

export interface OrientationOption {
  /** Radial estación→avión que muestra este mapa (grados). */
  radial: number;
  /** Rumbo de la nariz del avión en este mapa (grados). */
  heading: number;
  /** null = correcta; si no, el error que representa. */
  confusion: OrientationConfusion | null;
}

export type OrientationConfusion =
  | "reciproco" // usó QDM en vez de QDR (avión del lado contrario)
  | "espejo" // espejó la marcación relativa (izquierda/derecha)
  | "rumbo-norte" // dibujó la nariz al norte del mapa, ignorando el HDG
  | "rb-como-rumbo"; // usó la marcación relativa como si fuera el rumbo

export interface OrientationItem {
  heading: number;
  relativeBearing: number;
  qdm: number;
  qdr: number;
  options: OrientationOption[];
  correctIndex: number;
}

const norm = (d: number) => ((d % 360) + 360) % 360;

export interface OrientationLevelParams {
  /** Paso de los valores generados (grados). */
  step: number;
  /** Nº de opciones de mapa. */
  optionCount: number;
}

export const ORIENTATION_LEVELS: OrientationLevelParams[] = [
  { step: 45, optionCount: 3 },
  { step: 30, optionCount: 4 },
  { step: 15, optionCount: 4 },
  { step: 10, optionCount: 4 },
  { step: 5, optionCount: 4 },
];

export function orientationLevel(level: number): OrientationLevelParams {
  return ORIENTATION_LEVELS[Math.min(ORIENTATION_LEVELS.length, Math.max(1, level)) - 1];
}

/** Genera el ítem `index` de la sesión (determinista por seed). */
export function buildOrientationItem(seed: number, level: number, index: number): OrientationItem {
  const p = orientationLevel(level);
  const rng = mulberry32(deriveSeed(seed, 500 + index));
  const steps = 360 / p.step;
  const heading = norm(randInt(rng, 0, steps - 1) * p.step);
  // Marcación relativa nunca 0/180 exactos: ahí varios errores coinciden.
  let relativeBearing = norm(randInt(rng, 0, steps - 1) * p.step);
  while (relativeBearing % 180 === 0) relativeBearing = norm(randInt(rng, 0, steps - 1) * p.step);

  const qdm = norm(heading + relativeBearing);
  const qdr = norm(qdm + 180);

  const correct: OrientationOption = { radial: qdr, heading, confusion: null };
  const candidates: OrientationOption[] = [
    { radial: qdm, heading, confusion: "reciproco" },
    { radial: norm(heading - relativeBearing + 180), heading, confusion: "espejo" },
    { radial: qdr, heading: 0, confusion: "rumbo-norte" },
    { radial: qdr, heading: relativeBearing, confusion: "rb-como-rumbo" },
  ];

  // Un mapa se distingue por (radial, heading): se descartan los distractores
  // que colapsen con la correcta o entre sí (pasa con geometrías simétricas).
  const seen = new Set<string>([`${correct.radial}|${correct.heading}`]);
  const distractors: OrientationOption[] = [];
  for (const c of shuffle(rng, candidates)) {
    const key = `${c.radial}|${c.heading}`;
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(c);
    if (distractors.length >= p.optionCount - 1) break;
  }
  // Relleno de emergencia: rotaciones del radial hasta completar opciones.
  let spin = 1;
  while (distractors.length < p.optionCount - 1) {
    const c: OrientationOption = {
      radial: norm(qdr + spin * 90),
      heading,
      confusion: "reciproco",
    };
    const key = `${c.radial}|${c.heading}`;
    if (!seen.has(key)) {
      seen.add(key);
      distractors.push(c);
    }
    spin++;
  }

  const options = shuffle(rng, [correct, ...distractors]);
  return {
    heading,
    relativeBearing,
    qdm,
    qdr,
    options,
    correctIndex: options.findIndex((o) => o.confusion === null),
  };
}

export const CONFUSION_LABEL: Record<OrientationConfusion, string> = {
  reciproco:
    "Recíproco: pusiste el avión del lado de la estación hacia el que apunta la aguja (QDM), no en el radial contrario (QDR).",
  espejo: "Espejo: invertiste izquierda/derecha de la marcación relativa.",
  "rumbo-norte": "Nariz al norte: el mapa correcto conserva tu rumbo, no apunta el avión al norte.",
  "rb-como-rumbo":
    "Usaste la marcación relativa como rumbo: la aguja se suma al rumbo, no lo sustituye.",
};

/** Etiqueta corta de un pick de opción para métricas ("espejo", "correcto"). */
export function confusionKey(opt: OrientationOption): string {
  return opt.confusion ?? "correcto";
}
