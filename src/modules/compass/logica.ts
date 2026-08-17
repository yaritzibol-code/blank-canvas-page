/**
 * Motor del módulo Lógica — cuadrícula de figuras con hueco.
 *
 * Tarea: una cuadrícula N×N donde cada figura aparece exactamente una vez por
 * fila y una vez por columna. Una casilla está marcada con "?" y el alumno
 * elige qué figura le corresponde. Es razonamiento inductivo puro: la regla no
 * se enuncia, se descubre mirando qué ya está puesto.
 *
 * Es la familia que ningún otro módulo del entrenador cubría (Control y Slalom
 * son psicomotores, Cálculo es aritmético, Memoria es retención, Orientación es
 * espacial y Multitarea es atención dividida), y es la que más aparece en los
 * screenings en línea de piloto.
 *
 * Diseño:
 *  - Los ítems se generan proceduralmente desde un cuadrado latino aleatorio,
 *    así que son infinitos y no memorizables (ver `COMPLIANCE.md` §5: ejercicio
 *    original de FlightPath, no proviene de ninguna batería comercial).
 *  - La dificultad NO se controla escondiendo casillas al azar, sino midiendo
 *    cuántas rondas de deducción exige el hueco: el nivel 1 se resuelve mirando
 *    sólo la fila o sólo la columna; los niveles altos obligan a deducir antes
 *    otras casillas.
 *  - Cada opción incorrecta tiene nombre y apellido (`LogicConfusion`), igual
 *    que en Orientación, para que el debrief diga qué razonamiento falló.
 */
import { deriveSeed, mulberry32, randInt, shuffle, type Rng } from "./rng";

/** Figuras en juego. Se distinguen por forma, no sólo por color. */
export type LogicShape = "circulo" | "cuadrado" | "triangulo" | "rombo" | "hexagono";

export const LOGIC_SHAPES: readonly LogicShape[] = [
  "circulo",
  "cuadrado",
  "triangulo",
  "rombo",
  "hexagono",
];

/** Qué razonamiento falló al elegir una opción incorrecta. */
export type LogicConfusion =
  /** La figura ya estaba en la fila del hueco: sólo se revisó la columna. */
  | "fila"
  /** La figura ya estaba en la columna del hueco: sólo se revisó la fila. */
  | "columna"
  /** No se descarta de un vistazo: exige deducir antes otra casilla. */
  | "cadena";

export interface LogicOption {
  shape: LogicShape;
  /** null = opción correcta. */
  confusion: LogicConfusion | null;
}

/** Pistas visuales que el debrief de práctica reconstruye. */
export interface LogicExplain {
  /** Figuras ya presentes en la fila del hueco. */
  enFila: LogicShape[];
  /** Figuras ya presentes en la columna del hueco. */
  enColumna: LogicShape[];
  /** true cuando fila + columna no bastan y hay que encadenar deducciones. */
  requiereCadena: boolean;
}

export interface LogicItem {
  size: number;
  /** `grid[r][c]` = índice de figura, o null si la casilla está vacía. */
  grid: (number | null)[][];
  targetRow: number;
  targetCol: number;
  /** Figuras en juego; el índice de `grid` apunta aquí. */
  shapes: LogicShape[];
  options: LogicOption[];
  correctIndex: number;
  /** Rondas de deducción que exige el hueco (1 = directo). */
  depth: number;
  explain: LogicExplain;
}

export interface LogicLevelParams {
  size: number;
  /** Profundidad mínima exigida, para que el nivel realmente cueste. */
  minDepth: number;
  /** Profundidad máxima permitida, para que siga siendo resoluble a la vista. */
  maxDepth: number;
}

export const LOGIC_LEVELS: LogicLevelParams[] = [
  { size: 4, minDepth: 1, maxDepth: 1 },
  { size: 4, minDepth: 1, maxDepth: 2 },
  { size: 4, minDepth: 2, maxDepth: 3 },
  { size: 5, minDepth: 2, maxDepth: 3 },
  { size: 5, minDepth: 3, maxDepth: 4 },
];

export function logicLevel(level: number): LogicLevelParams {
  return LOGIC_LEVELS[Math.min(LOGIC_LEVELS.length, Math.max(1, level)) - 1];
}

/**
 * Cuadrado latino aleatorio: se parte del cíclico `(r + c) mod n` y se permutan
 * filas, columnas y etiquetas. Barato y suficientemente variado para estímulos.
 */
function latinSquare(rng: Rng, n: number): number[][] {
  const idx = [...Array(n).keys()];
  const rows = shuffle(rng, idx);
  const cols = shuffle(rng, idx);
  const syms = shuffle(rng, idx);
  return rows.map((r) => cols.map((c) => syms[(r + c) % n]));
}

/** Figuras que una casilla vacía todavía admite, según su fila y su columna. */
function candidatos(g: (number | null)[][], n: number, r: number, c: number): number[] {
  const usadas = new Set<number>();
  for (let k = 0; k < n; k++) {
    const enFila = g[r][k];
    const enCol = g[k][c];
    if (enFila !== null) usadas.add(enFila);
    if (enCol !== null) usadas.add(enCol);
  }
  const out: number[] = [];
  for (let s = 0; s < n; s++) if (!usadas.has(s)) out.push(s);
  return out;
}

/**
 * Rondas de deducción necesarias para determinar la casilla objetivo.
 *
 * Cada ronda aplica sobre toda la cuadrícula las dos reglas que una persona usa
 * a ojo: casilla con una sola figura posible, y figura que sólo cabe en una
 * casilla de su fila o de su columna. Devuelve Infinity si el hueco no es
 * deducible. Como siempre se parte de un cuadrado latino real, lo que la
 * propagación deduce es siempre cierto.
 */
function profundidad(grid: (number | null)[][], n: number, tr: number, tc: number): number {
  const g = grid.map((row) => row.slice());
  for (let ronda = 1; ronda <= n * n; ronda++) {
    const nuevas: [number, number, number][] = [];

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c] !== null) continue;
        const k = candidatos(g, n, r, c);
        if (k.length === 1) nuevas.push([r, c, k[0]]);
      }
    }

    for (let s = 0; s < n; s++) {
      for (let r = 0; r < n; r++) {
        if (g[r].includes(s)) continue;
        const huecos: number[] = [];
        for (let c = 0; c < n; c++) {
          if (g[r][c] === null && candidatos(g, n, r, c).includes(s)) huecos.push(c);
        }
        if (huecos.length === 1) nuevas.push([r, huecos[0], s]);
      }
      for (let c = 0; c < n; c++) {
        let yaEnColumna = false;
        for (let r = 0; r < n; r++) if (g[r][c] === s) yaEnColumna = true;
        if (yaEnColumna) continue;
        const huecos: number[] = [];
        for (let r = 0; r < n; r++) {
          if (g[r][c] === null && candidatos(g, n, r, c).includes(s)) huecos.push(r);
        }
        if (huecos.length === 1) nuevas.push([huecos[0], c, s]);
      }
    }

    if (nuevas.length === 0) return Infinity;
    let resuelto = false;
    for (const [r, c, s] of nuevas) {
      if (g[r][c] === null) g[r][c] = s;
      if (r === tr && c === tc) resuelto = true;
    }
    if (resuelto) return ronda;
  }
  return Infinity;
}

/** Un intento de tablero: hueco elegido y casillas retiradas al máximo. */
function carve(
  rng: Rng,
  full: number[][],
  n: number,
  maxDepth: number,
): { grid: (number | null)[][]; tr: number; tc: number; depth: number } {
  const tr = randInt(rng, 0, n - 1);
  const tc = randInt(rng, 0, n - 1);
  const grid: (number | null)[][] = full.map((row) => row.slice());
  grid[tr][tc] = null;

  // Se retiran casillas mientras el hueco siga siendo deducible dentro de la
  // profundidad del nivel. Quitar información sube la profundidad, así que el
  // tablero aterriza pegado al techo del nivel y no sobran pistas.
  const celdas: [number, number][] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (r !== tr || c !== tc) celdas.push([r, c]);
  }
  for (const [r, c] of shuffle(rng, celdas)) {
    const guardada = grid[r][c];
    grid[r][c] = null;
    if (profundidad(grid, n, tr, tc) > maxDepth) grid[r][c] = guardada;
  }
  return { grid, tr, tc, depth: profundidad(grid, n, tr, tc) };
}

/** Genera el ítem `index` de la sesión (determinista por seed). */
export function buildLogicItem(seed: number, level: number, index: number): LogicItem {
  const p = logicLevel(level);
  const rng = mulberry32(deriveSeed(seed, 900 + index));
  const n = p.size;
  const full = latinSquare(rng, n);

  // Varios intentos con huecos distintos: se queda con el primero que alcance
  // la profundidad mínima del nivel y, si ninguno lo hace, con el más profundo.
  let mejor = carve(rng, full, n, p.maxDepth);
  for (let intento = 1; intento < 12 && mejor.depth < p.minDepth; intento++) {
    const otro = carve(rng, full, n, p.maxDepth);
    if (otro.depth > mejor.depth) mejor = otro;
  }
  const { grid, tr, tc, depth } = mejor;
  const answer = full[tr][tc];

  const shapes = shuffle(rng, LOGIC_SHAPES).slice(0, n);

  const enFilaIdx = new Set<number>();
  const enColIdx = new Set<number>();
  for (let k = 0; k < n; k++) {
    const f = grid[tr][k];
    const c = grid[k][tc];
    if (f !== null) enFilaIdx.add(f);
    if (c !== null) enColIdx.add(c);
  }

  const options: LogicOption[] = shuffle(rng, [...Array(n).keys()]).map((s) => ({
    shape: shapes[s],
    confusion:
      s === answer ? null : enFilaIdx.has(s) ? "fila" : enColIdx.has(s) ? "columna" : "cadena",
  }));

  return {
    size: n,
    grid,
    targetRow: tr,
    targetCol: tc,
    shapes,
    options,
    correctIndex: options.findIndex((o) => o.confusion === null),
    depth: Number.isFinite(depth) ? depth : p.maxDepth,
    explain: {
      enFila: [...enFilaIdx].map((s) => shapes[s]),
      enColumna: [...enColIdx].map((s) => shapes[s]),
      // Fila + columna sólo bastan si entre ambas dejan una única figura viva.
      requiereCadena: new Set([...enFilaIdx, ...enColIdx]).size < n - 1,
    },
  };
}

export const LOGIC_CONFUSION_LABEL: Record<LogicConfusion, string> = {
  fila: "Te quedaste en la columna: la figura que elegiste ya estaba en la FILA del hueco. Revisa siempre las dos direcciones antes de decidir.",
  columna:
    "Te quedaste en la fila: la figura que elegiste ya estaba en la COLUMNA del hueco. Revisa siempre las dos direcciones antes de decidir.",
  cadena:
    "Elegiste una figura que no se descarta de un vistazo: en estos tableros a veces hay que deducir primero otra casilla y usar ese resultado. Busca la fila o columna más llena y empieza por ahí.",
};

/** Etiqueta corta del pick, para el desglose de métricas. */
export function logicConfusionKey(opt: LogicOption): string {
  return opt.confusion ?? "correcto";
}
