/**
 * Orientación — instrumentos SVG originales + mapas de opción.
 *
 * Se muestran girodireccional (la rosa gira, el índice queda arriba) y RBI
 * (aguja de marcación relativa). El alumno elige el mapa cenital que coincide.
 * Cada distractor representa UNA confusión con nombre: el debrief la señala.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  buildOrientationItem,
  confusionKey,
  CONFUSION_LABEL,
  type OrientationItem,
  type OrientationOption,
} from "@/modules/compass/orientacion";
import { scoreItemsConError } from "@/modules/compass/scoring";
import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";
import { classifyInput } from "./use-game-loop";
import { AVION_PATH } from "./sprites";
import {
  CButton,
  CCard,
  Eyebrow,
  GameTopBar,
  AMBER,
  GOLD,
  GREEN,
  INK,
  INK2,
  MONO,
  RED,
  SERIF,
  SKY,
} from "./ui";

interface Props {
  cfg: CompassRunConfig;
  onFinish: (r: CompassResult) => void;
  onQuit: () => void;
}

/* ── Instrumentos ─────────────────────────────────────────────────────── */

/** Lado del viewBox de los instrumentos: se dibujan a 200 y escalan con CSS. */
const IV = 200;
const IC = IV / 2;
const INSTR_SIZE = "clamp(118px, 35vw, 184px)";
const TICK_FONT = "'Geist Mono', 'JetBrains Mono', monospace";

/** Ids seguros para url(#...) a partir de useId. */
function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^\w-]/g, "")}`;
}

/** Caja del instrumento: marco con tornillos, bisel metálico y carátula. */
function InstrumentCase({ id, children }: { id: string; children: React.ReactNode }) {
  const tornillos: [number, number][] = [
    [17, 17],
    [IV - 17, 17],
    [17, IV - 17],
    [IV - 17, IV - 17],
  ];
  return (
    <>
      <defs>
        <linearGradient id={`${id}-case`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2638" />
          <stop offset="1" stopColor="#060b15" />
        </linearGradient>
        <linearGradient id={`${id}-bezel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6a768a" />
          <stop offset="0.45" stopColor="#1a2230" />
          <stop offset="1" stopColor="#465267" />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx="0.5" cy="0.4" r="0.62">
          <stop offset="0" stopColor="#123260" />
          <stop offset="1" stopColor="#030a18" />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.17} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x={2}
        y={2}
        width={IV - 4}
        height={IV - 4}
        rx={24}
        fill={`url(#${id}-case)`}
        stroke="rgba(255,255,255,.08)"
      />
      {tornillos.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={5.2} fill="#0a101b" stroke="rgba(255,255,255,.2)" />
          <line
            x1={x - 3.2}
            y1={y}
            x2={x + 3.2}
            y2={y}
            stroke="rgba(255,255,255,.34)"
            strokeWidth={1.3}
            transform={`rotate(38 ${x} ${y})`}
          />
        </g>
      ))}
      <circle cx={IC} cy={IC} r={92} fill={`url(#${id}-bezel)`} />
      <circle cx={IC} cy={IC} r={86} fill={`url(#${id}-face)`} />
      {children}
      {/* Sombra interior del bisel y reflejo del cristal */}
      <circle cx={IC} cy={IC} r={86} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth={5} />
      <ellipse
        cx={IC - 16}
        cy={IC - 42}
        rx={64}
        ry={30}
        fill={`url(#${id}-glass)`}
        transform={`rotate(-24 ${IC - 16} ${IC - 42})`}
      />
    </>
  );
}

/** Marcas de carátula cada 5°: medianas cada 10°, mayores cada 30°. */
function CardTicks() {
  const ticks = [];
  for (let d = 0; d < 360; d += 5) {
    const major = d % 30 === 0;
    const mid = d % 10 === 0;
    const len = major ? 13 : mid ? 8.5 : 5;
    ticks.push(
      <line
        key={d}
        x1={IC}
        y1={IC - 82}
        x2={IC}
        y2={IC - 82 + len}
        stroke={major ? "#fff" : "rgba(255,255,255,.7)"}
        strokeWidth={major ? 2.4 : mid ? 1.6 : 1}
        transform={`rotate(${d} ${IC} ${IC})`}
      />,
    );
  }
  return <>{ticks}</>;
}

function DirectionIndicator({ heading }: { heading: number }) {
  const id = useSvgId("cx-dg");
  const labels = [
    { d: 0, t: "N" },
    { d: 30, t: "3" },
    { d: 60, t: "6" },
    { d: 90, t: "E" },
    { d: 120, t: "12" },
    { d: 150, t: "15" },
    { d: 180, t: "S" },
    { d: 210, t: "21" },
    { d: 240, t: "24" },
    { d: 270, t: "W" },
    { d: 300, t: "30" },
    { d: 330, t: "33" },
  ];
  return (
    <svg
      viewBox={`0 0 ${IV} ${IV}`}
      style={{ width: INSTR_SIZE, height: "auto", display: "block" }}
      role="img"
      aria-label={`Girodireccional marcando rumbo ${heading}`}
    >
      <InstrumentCase id={id}>
        {/* La rosa gira; el índice queda arriba */}
        <g transform={`rotate(${-heading} ${IC} ${IC})`}>
          <CardTicks />
          {labels.map((l) => {
            const cardinal = l.t.length === 1 && Number.isNaN(Number(l.t));
            return (
              <text
                key={l.d}
                x={IC}
                y={IC - 82 + 33}
                fill={cardinal ? "#fff" : "rgba(255,255,255,.88)"}
                fontSize={cardinal ? 17 : 14}
                fontWeight={700}
                fontFamily={TICK_FONT}
                textAnchor="middle"
                transform={`rotate(${l.d} ${IC} ${IC})`}
              >
                {l.t}
              </text>
            );
          })}
        </g>
        {/* Índices fijos cada 45° sobre el bisel */}
        {[45, 90, 135, 180, 225, 270, 315].map((d) => (
          <polygon
            key={d}
            points={`${IC - 3.5},${IC - 91} ${IC + 3.5},${IC - 91} ${IC},${IC - 85}`}
            fill="rgba(255,255,255,.65)"
            transform={`rotate(${d} ${IC} ${IC})`}
          />
        ))}
        {/* Índice de rumbo (lubber line) */}
        <polygon
          points={`${IC - 8},${IC - 92} ${IC + 8},${IC - 92} ${IC},${IC - 76}`}
          fill={AMBER}
          filter={`url(#${id}-glow)`}
        />
        {/* Avión fijo, nariz arriba */}
        <path
          d={AVION_PATH}
          transform={`translate(${IC} ${IC}) scale(1.05)`}
          fill={GOLD}
          stroke="#7a5c1e"
          strokeWidth={0.8}
          filter={`url(#${id}-glow)`}
        />
      </InstrumentCase>
    </svg>
  );
}

function RbiInstrument({ rb }: { rb: number }) {
  const id = useSvgId("cx-rbi");
  const labels = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <svg
      viewBox={`0 0 ${IV} ${IV}`}
      style={{ width: INSTR_SIZE, height: "auto", display: "block" }}
      role="img"
      aria-label={`Indicador de marcación relativa con aguja en ${rb} grados`}
    >
      <InstrumentCase id={id}>
        {/* Carátula fija: 0 = nariz del avión */}
        <CardTicks />
        {labels.map((d) => {
          const eje = d % 90 === 0;
          return (
            <text
              key={d}
              x={IC}
              y={IC - 82 + 32}
              fill={eje ? "#fff" : "rgba(255,255,255,.7)"}
              fontSize={eje ? 16 : 12}
              fontWeight={700}
              fontFamily={TICK_FONT}
              textAnchor="middle"
              transform={`rotate(${d} ${IC} ${IC})`}
            >
              {d / 10}
            </text>
          );
        })}
        {/* Avión de referencia, tenue */}
        <path
          d={AVION_PATH}
          transform={`translate(${IC} ${IC}) scale(0.9)`}
          fill="rgba(255,255,255,.16)"
        />
        {/* Aguja ADF */}
        <g transform={`rotate(${rb} ${IC} ${IC})`} filter={`url(#${id}-glow)`}>
          <polygon
            points={`${IC},${IC - 74} ${IC - 9},${IC - 50} ${IC - 3},${IC - 50} ${IC - 3},${IC + 62} ${IC + 3},${IC + 62} ${IC + 3},${IC - 50} ${IC + 9},${IC - 50}`}
            fill="#F2D06B"
          />
          <polygon
            points={`${IC - 8},${IC + 70} ${IC},${IC + 58} ${IC + 8},${IC + 70} ${IC + 8},${IC + 76} ${IC},${IC + 66} ${IC - 8},${IC + 76}`}
            fill="#F2D06B"
          />
        </g>
        <circle cx={IC} cy={IC} r={7} fill="#0b1830" stroke="#F2D06B" strokeWidth={2} />
        <circle cx={IC} cy={IC} r={2.2} fill="#fff" />
      </InstrumentCase>
    </svg>
  );
}

/** Mapa cenital de opción: pantalla de navegación con la estación al centro y el avión sobre el radial. */
function MiniMap({
  opt,
  size = 132,
  state,
  onClick,
  index,
}: {
  opt: OrientationOption;
  size?: number;
  state: "idle" | "correct" | "wrong" | "dim";
  onClick?: () => void;
  index: number;
}) {
  const id = useSvgId("cx-map");
  const c = size / 2;
  const dist = size * 0.32;
  const rad = (opt.radial * Math.PI) / 180;
  const px = c + Math.sin(rad) * dist;
  const py = c - Math.cos(rad) * dist;
  const clase =
    state === "correct"
      ? " is-correct"
      : state === "wrong"
        ? " is-wrong"
        : state === "dim"
          ? " is-dim"
          : "";
  const rejilla = [];
  for (let g = size / 6; g < size; g += size / 6) {
    rejilla.push(
      <line key={`v${g}`} x1={g} y1={0} x2={g} y2={size} />,
      <line key={`h${g}`} x1={0} y1={g} x2={size} y2={g} />,
    );
  }
  return (
    <button
      type="button"
      className={`cx-key cx-map${clase}`}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`Mapa ${index + 1}`}
    >
      <span className="cx-key-n">{index + 1}</span>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.7">
            <stop offset="0" stopColor="#0f2c55" />
            <stop offset="1" stopColor="#030a18" />
          </radialGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x={0} y={0} width={size} height={size} rx={10} fill={`url(#${id}-bg)`} />
        <g stroke="rgba(143,211,244,.07)" strokeWidth={1}>
          {rejilla}
        </g>
        {/* Anillos de distancia */}
        <circle
          cx={c}
          cy={c}
          r={dist}
          fill="none"
          stroke="rgba(143,211,244,.22)"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        <circle
          cx={c}
          cy={c}
          r={dist / 2}
          fill="none"
          stroke="rgba(143,211,244,.14)"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        {/* Norte del mapa */}
        <g transform={`translate(${size - 15}, 20)`}>
          <line x1={0} y1={8} x2={0} y2={-6} stroke={INK2} strokeWidth={1.5} />
          <polygon points="0,-10 -4,-3 4,-3" fill={INK} />
          <text
            x={0}
            y={-13}
            fontSize={8.5}
            fontWeight={700}
            fill={INK2}
            textAnchor="middle"
            fontFamily={TICK_FONT}
          >
            N
          </text>
        </g>
        {/* Radial estación → avión */}
        <line
          x1={c}
          y1={c}
          x2={px}
          y2={py}
          stroke="rgba(227,201,138,.45)"
          strokeWidth={1.3}
          strokeDasharray="3 3"
        />
        {/* Estación NDB (símbolo punteado) */}
        <g filter={`url(#${id}-glow)`}>
          <circle
            cx={c}
            cy={c}
            r={10}
            fill="none"
            stroke={SKY}
            strokeWidth={2.2}
            strokeDasharray="0.1 3.4"
            strokeLinecap="round"
          />
          <circle
            cx={c}
            cy={c}
            r={5.5}
            fill="none"
            stroke={SKY}
            strokeWidth={2}
            strokeDasharray="0.1 3"
            strokeLinecap="round"
          />
          <circle cx={c} cy={c} r={2.4} fill={SKY} />
        </g>
        {/* Avión con su rumbo */}
        <g
          transform={`translate(${px} ${py}) rotate(${opt.heading}) scale(0.5)`}
          filter={`url(#${id}-glow)`}
        >
          <path d={AVION_PATH} fill={GOLD} stroke="#fff6dc" strokeWidth={1.2} />
        </g>
      </svg>
    </button>
  );
}

/* ── Juego ────────────────────────────────────────────────────────────── */

interface Tally {
  total: number;
  correct: number;
  omitted: number;
  correctSecs: number[];
  breakdown: Record<string, { correct: number; total: number }>;
}

export function OrientacionGame({ cfg, onFinish, onQuit }: Props) {
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

  const item: OrientationItem = useMemo(
    () => buildOrientationItem(cfg.seed, cfg.level, idx),
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
    const raw = {
      total: t.total,
      correct: t.correct,
      omitted: t.omitted,
      medianCorrectSec: median,
      breakdown: t.breakdown,
    };
    const { score, metrics, advice } = scoreItemsConError(raw, CONFUSION_LABEL);
    onFinish({
      moduleId: "orientacion",
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

  const registerAnswer = (opt: OrientationOption) => {
    const t = tally.current;
    const key = confusionKey(opt);
    const slot = (t.breakdown[key] ??= { correct: 0, total: 0 });
    t.total++;
    slot.total++;
    if (opt.confusion === null) {
      t.correct++;
      slot.correct++;
      t.correctSecs.push((performance.now() - itemShownAt.current) / 1000);
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
    registerAnswer(item.options[i]);
    if (esPractica) {
      setPicked(i);
      return;
    }
    advance();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      counts.current.teclado++;
      if (picked === null && ["1", "2", "3", "4"].includes(e.key)) {
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

  const pickedOpt = picked !== null ? item.options[picked] : null;
  const pad3 = (n: number) => String(n).padStart(3, "0");

  return (
    <div onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Orientación · Nivel ${cfg.level}`}
        remainingSec={remaining}
        progressLabel={`${Math.min(tally.current.total + (picked === null ? 1 : 0), cfg.items)}/${cfg.items}`}
        onQuit={onQuit}
      />

      <CCard style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(16px, 3vw, 28px)" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "18px 28px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="cx-panel-row">
            <figure style={{ margin: 0, textAlign: "center" }}>
              <DirectionIndicator heading={item.heading} />
              <Eyebrow style={{ margin: "8px 0 0" }}>Girodireccional</Eyebrow>
            </figure>
            <figure style={{ margin: 0, textAlign: "center" }}>
              <RbiInstrument rb={item.relativeBearing} />
              <Eyebrow style={{ margin: "8px 0 0" }}>Aguja ADF (rel.)</Eyebrow>
            </figure>
          </div>
          <div style={{ flex: "1 1 220px", minWidth: 200, maxWidth: 340 }}>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "clamp(1.2rem, 2.4vw, 1.5rem)",
                color: INK,
                lineHeight: 1.3,
              }}
            >
              ¿Qué mapa muestra tu posición respecto a la estación?
            </div>
            <div style={{ marginTop: 10, fontSize: "0.8rem", color: INK2, lineHeight: 1.55 }}>
              El mapa tiene el norte arriba. La estación es el punto del centro; el avión conserva
              su rumbo real.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))",
            gap: 12,
          }}
        >
          {item.options.map((opt, i) => {
            let state: "idle" | "correct" | "wrong" | "dim" = "idle";
            if (picked !== null) {
              if (i === item.correctIndex) state = "correct";
              else if (i === picked) state = "wrong";
              else state = "dim";
            }
            return (
              <MiniMap
                key={i}
                index={i}
                opt={opt}
                state={state}
                onClick={picked === null ? () => choose(i) : undefined}
              />
            );
          })}
        </div>

        {esPractica && picked !== null && (
          <div className={`cx-feedback ${pickedOpt?.confusion === null ? "is-ok" : "is-bad"}`}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: pickedOpt?.confusion === null ? GREEN : RED,
                marginBottom: 6,
              }}
            >
              {pickedOpt?.confusion === null ? "Correcto" : "La lectura correcta"}
            </div>
            <div style={{ fontSize: "0.9rem", color: INK2, lineHeight: 1.6 }}>
              HDG <strong style={{ fontFamily: MONO, color: GOLD }}>{pad3(item.heading)}</strong> +
              marcación{" "}
              <strong style={{ fontFamily: MONO, color: GOLD }}>
                {pad3(item.relativeBearing)}
              </strong>{" "}
              → la estación queda al QDM{" "}
              <strong style={{ fontFamily: MONO, color: GOLD }}>{pad3(item.qdm)}</strong>; tú estás
              en el radial{" "}
              <strong style={{ fontFamily: MONO, color: GOLD }}>{pad3(item.qdr)}</strong> (QDR).
              {pickedOpt?.confusion && (
                <>
                  {" "}
                  <span style={{ color: RED }}>{CONFUSION_LABEL[pickedOpt.confusion]}</span>
                </>
              )}
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <CButton onClick={advance}>
                {tally.current.total >= cfg.items ? "Ver debrief" : "Siguiente (Enter)"}
              </CButton>
            </div>
          </div>
        )}
      </CCard>
    </div>
  );
}
