/**
 * Lógica — cuadrícula de figuras con hueco (DOM + SVG).
 *
 * Práctica: tras cada ítem se muestra por qué esa figura era la única posible,
 * con las eliminaciones de su fila y su columna a la vista. Examen: reloj
 * global, sin feedback y con opción de saltar. Teclas 1-5 responden.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  buildLogicItem,
  logicConfusionKey,
  LOGIC_CONFUSION_LABEL,
  type LogicItem,
  type LogicShape,
} from "@/modules/compass/logica";
import { scoreItemsConError } from "@/modules/compass/scoring";
import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";
import { classifyInput } from "./use-game-loop";
import {
  CButton,
  CCard,
  Eyebrow,
  GameTopBar,
  GOLD,
  GREEN,
  INK2,
  INK3,
  MONO,
  RED,
  SKY,
  VIOLET,
} from "./ui";

interface Props {
  cfg: CompassRunConfig;
  onFinish: (r: CompassResult) => void;
  onQuit: () => void;
}

interface Tally {
  total: number;
  correct: number;
  omitted: number;
  correctSecs: number[];
  breakdown: Record<string, { correct: number; total: number }>;
}

/* ── Figuras ─────────────────────────────────────────────────────────── */

/**
 * Cada figura tiene forma y color propios. La forma basta para distinguirlas
 * (legible en monocromo); el color sólo acelera la lectura del tablero.
 */
const SHAPE_COLOR: Record<LogicShape, string> = {
  circulo: SKY,
  cuadrado: GOLD,
  triangulo: RED,
  rombo: GREEN,
  hexagono: VIOLET,
};

/** Ficha con volumen: color base, brillo superior y halo. */
export function Shape({
  n,
  size = 30,
  color,
  glow = true,
}: {
  n: LogicShape;
  size?: number;
  color?: string;
  glow?: boolean;
}) {
  const gid = `cx-shine${useId().replace(/[^\w-]/g, "")}`;
  const tint = color ?? SHAPE_COLOR[n];
  const c = 12;
  const paths: Record<LogicShape, React.ReactNode> = {
    circulo: <circle cx={c} cy={c} r={8} />,
    cuadrado: <rect x={4.5} y={4.5} width={15} height={15} rx={2} />,
    triangulo: <polygon points="12,3.5 20.5,19 3.5,19" />,
    rombo: <polygon points="12,2.5 21.5,12 12,21.5 2.5,12" />,
    hexagono: <polygon points="12,2.8 20,7.4 20,16.6 12,21.2 4,16.6 4,7.4" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        overflow: "visible",
        filter: glow ? `drop-shadow(0 0 ${Math.max(3, size / 6)}px ${tint}73)` : undefined,
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.6} />
          <stop offset="0.46" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.32} />
        </linearGradient>
      </defs>
      <g fill={tint} stroke={tint} strokeWidth={0.8} strokeLinejoin="round">
        {paths[n]}
      </g>
      <g fill={`url(#${gid})`}>{paths[n]}</g>
    </svg>
  );
}

const SHAPE_LABEL: Record<LogicShape, string> = {
  circulo: "círculo",
  cuadrado: "cuadrado",
  triangulo: "triángulo",
  rombo: "rombo",
  hexagono: "hexágono",
};

/** Fila de figuras para el debrief ("en su fila ya están: ▲ ◆"). */
function ShapeRow({ shapes }: { shapes: LogicShape[] }) {
  if (shapes.length === 0) return <span style={{ color: INK3 }}>ninguna todavía</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, verticalAlign: "middle" }}>
      {shapes.map((s) => (
        <span key={s} style={{ display: "inline-flex" }} title={SHAPE_LABEL[s]}>
          <Shape n={s} size={18} glow={false} />
        </span>
      ))}
    </span>
  );
}

/* ── Juego ───────────────────────────────────────────────────────────── */

export function LogicaGame({ cfg, onFinish, onQuit }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(
    cfg.mode === "practica" ? null : cfg.durationSec,
  );
  const tally = useRef<Tally>({ total: 0, correct: 0, omitted: 0, correctSecs: [], breakdown: {} });
  const counts = useRef({ teclado: 0, mouse: 0, touch: 0 });
  const interruptions = useRef(0);
  const startedAt = useRef(performance.now());
  const itemShownAt = useRef(performance.now());
  const finished = useRef(false);

  const item: LogicItem = useMemo(
    () => buildLogicItem(cfg.seed, cfg.level, idx),
    [cfg.seed, cfg.level, idx],
  );
  const esPractica = cfg.mode === "practica";

  const elapsedSec = () => (performance.now() - startedAt.current) / 1000;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const t = tally.current;
    if (!esPractica && cfg.items > 0 && t.total < cfg.items) {
      t.omitted += cfg.items - t.total;
      t.total = cfg.items;
    }
    const sorted = [...t.correctSecs].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length === 0
        ? null
        : sorted.length % 2
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
    const { score, metrics, advice } = scoreItemsConError(
      {
        total: t.total,
        correct: t.correct,
        omitted: t.omitted,
        medianCorrectSec: median,
        breakdown: t.breakdown,
      },
      LOGIC_CONFUSION_LABEL,
    );
    onFinish({
      moduleId: "logica",
      score,
      metrics,
      raw: {
        total: t.total,
        correct: t.correct,
        omitted: t.omitted,
        medianCorrectSec: median ?? -1,
      },
      durationSec: elapsedSec(),
      input: classifyInput(counts.current),
      interruptions: interruptions.current,
      advice,
    });
  }, [cfg.items, esPractica, onFinish]);

  useEffect(() => {
    if (esPractica) return;
    const iv = setInterval(() => {
      const rem = cfg.durationSec - elapsedSec();
      setRemaining(Math.max(0, Math.ceil(rem)));
      if (rem <= 0) finish();
    }, 250);
    return () => clearInterval(iv);
  }, [esPractica, cfg.durationSec, finish]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) interruptions.current++;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const registerAnswer = (choice: number | null) => {
    const t = tally.current;
    // El desglose cuenta por tipo de razonamiento fallido, no por tema: así el
    // debrief puede decir QUÉ salió mal, no sólo cuántas fallaste.
    const key = choice === null ? "omitida" : logicConfusionKey(item.options[choice]);
    const slot = (t.breakdown[key] ??= { correct: 0, total: 0 });
    t.total++;
    slot.total++;
    if (choice !== null && choice === item.correctIndex) {
      t.correct++;
      slot.correct++;
      t.correctSecs.push((performance.now() - itemShownAt.current) / 1000);
    } else if (choice === null) {
      t.omitted++;
    }
  };

  const advance = () => {
    if (tally.current.total >= cfg.items) {
      finish();
      return;
    }
    setPicked(null);
    setIdx((i) => i + 1);
    itemShownAt.current = performance.now();
  };

  const choose = (i: number) => {
    if (picked !== null) return;
    registerAnswer(i);
    if (esPractica) {
      setPicked(i);
      return;
    }
    advance();
  };

  const skip = () => {
    if (picked !== null) return;
    registerAnswer(null);
    if (esPractica) {
      setPicked(-1);
      return;
    }
    advance();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      counts.current.teclado++;
      if (picked === null && ["1", "2", "3", "4", "5"].includes(e.key)) {
        const n = Number(e.key) - 1;
        if (n < item.options.length) choose(n);
      } else if (picked !== null && e.key === "Enter") {
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, item]);

  const trackPointer = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") counts.current.touch++;
    else counts.current.mouse++;
  };

  const acerto = picked !== null && picked === item.correctIndex;
  const celda = `clamp(40px, ${item.size === 4 ? "14vw" : "11vw"}, 72px)`;
  const ficha = item.size === 4 ? 34 : 30;
  // En práctica, tras responder, se iluminan la fila y la columna del hueco:
  // son las que explica el panel de abajo.
  const resaltaLineas = esPractica && picked !== null;

  return (
    <div onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Lógica · ${esPractica ? "Práctica" : "Examen"}`}
        remainingSec={remaining}
        progressLabel={`${Math.min(tally.current.total + (picked === null ? 1 : 0), cfg.items)}/${cfg.items}`}
        onQuit={onQuit}
      />

      <CCard style={{ maxWidth: 680, margin: "0 auto", padding: "clamp(16px, 3vw, 28px)" }}>
        <Eyebrow style={{ textAlign: "center" }}>
          Cuadrícula {item.size}×{item.size} · cada figura, una vez por fila y una por columna
        </Eyebrow>

        {/* Tablero: se vuelve a montar con cada ítem para que entre en ola. */}
        <div
          key={idx}
          className="cx-board"
          role="img"
          aria-label={`Cuadrícula de ${item.size} por ${item.size} con una casilla incógnita en la fila ${item.targetRow + 1}, columna ${item.targetCol + 1}`}
          style={{ gridTemplateColumns: `repeat(${item.size}, ${celda})` }}
        >
          {item.grid.map((row, r) =>
            row.map((v, c) => {
              const esHueco = r === item.targetRow && c === item.targetCol;
              const enLinea =
                resaltaLineas && !esHueco && (r === item.targetRow || c === item.targetCol);
              const clase = esHueco
                ? picked === null
                  ? "is-target"
                  : acerto
                    ? "is-solved"
                    : "is-reveal"
                : v === null
                  ? "is-empty"
                  : enLinea
                    ? "is-line"
                    : "";
              return (
                <div
                  key={`${r}-${c}`}
                  className={`cx-tile ${clase}`}
                  style={{ height: celda, animationDelay: `${(r + c) * 35}ms` }}
                >
                  {esHueco ? (
                    picked !== null ? (
                      <Shape n={item.options[item.correctIndex].shape} size={ficha} />
                    ) : (
                      <span className="cx-tile-q">?</span>
                    )
                  ) : v !== null ? (
                    <Shape n={item.shapes[v]} size={ficha} />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>

        {/* Opciones: teclas iluminadas 1-5 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${item.size}, minmax(0, 1fr))`,
            gap: 10,
            maxWidth: item.size * 104,
            margin: "0 auto",
          }}
        >
          {item.options.map((o, i) => {
            const esCorrecta = picked !== null && i === item.correctIndex;
            const esFallo = picked === i && i !== item.correctIndex;
            const estado = esCorrecta
              ? " is-correct"
              : esFallo
                ? " is-wrong"
                : picked !== null
                  ? " is-dim"
                  : "";
            return (
              <button
                key={o.shape}
                type="button"
                className={`cx-key${estado}`}
                onClick={() => choose(i)}
                disabled={picked !== null}
                aria-label={SHAPE_LABEL[o.shape]}
                style={{ minHeight: 70 }}
              >
                <span className="cx-key-n">{i + 1}</span>
                <Shape n={o.shape} size={30} />
              </button>
            );
          })}
        </div>

        {esPractica && picked !== null && (
          <div className={`cx-feedback ${acerto ? "is-ok" : "is-bad"}`}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: acerto ? GREEN : picked === -1 ? INK3 : RED,
                marginBottom: 8,
              }}
            >
              {acerto
                ? "Correcto — así se descarta"
                : picked === -1
                  ? "Saltada"
                  : "Así se descartaba"}
            </div>

            <div style={{ fontSize: "0.88rem", color: INK2, lineHeight: 1.9 }}>
              <div>
                En su fila ya estaban: <ShapeRow shapes={item.explain.enFila} />
              </div>
              <div>
                En su columna ya estaban: <ShapeRow shapes={item.explain.enColumna} />
              </div>
              <div style={{ marginTop: 4, color: "#fff" }}>
                Queda una sola figura posible:{" "}
                <span style={{ display: "inline-flex", verticalAlign: "middle" }}>
                  <Shape n={item.options[item.correctIndex].shape} size={20} />
                </span>
              </div>
              {item.explain.requiereCadena && (
                <div style={{ color: INK3, fontSize: "0.83rem", lineHeight: 1.5, marginTop: 6 }}>
                  Fila y columna por sí solas no bastaban: había que deducir antes otra casilla y
                  usar ese resultado. Empieza siempre por la línea más llena del tablero.
                </div>
              )}
            </div>

            {!acerto && picked >= 0 && item.options[picked].confusion && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(227,201,138,.14)",
                  fontSize: "0.85rem",
                  color: GOLD,
                  lineHeight: 1.5,
                  fontWeight: 600,
                }}
              >
                {LOGIC_CONFUSION_LABEL[item.options[picked].confusion]}
              </div>
            )}

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <CButton onClick={advance}>
                {tally.current.total >= cfg.items ? "Ver debrief" : "Siguiente (Enter)"}
              </CButton>
            </div>
          </div>
        )}

        {!esPractica && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <CButton variant="ghost" onClick={skip}>
              Saltar
            </CButton>
          </div>
        )}
      </CCard>
    </div>
  );
}
