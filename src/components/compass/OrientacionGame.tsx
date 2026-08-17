/**
 * Orientación — instrumentos SVG originales + mapas de opción.
 *
 * Se muestran girodireccional (la rosa gira, el índice queda arriba) y RBI
 * (aguja de marcación relativa). El alumno elige el mapa cenital que coincide.
 * Cada distractor representa UNA confusión con nombre: el debrief la señala.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { CButton, CCard, Eyebrow, GameTopBar, CORAL, CREAM, HAZE, MONO, NAVY, SERIF } from "./ui";

interface Props {
  cfg: CompassRunConfig;
  onFinish: (r: CompassResult) => void;
  onQuit: () => void;
}

/* ── Instrumentos ─────────────────────────────────────────────────────── */

function DirectionIndicator({ heading, size = 150 }: { heading: number; size?: number }) {
  const c = size / 2;
  const r = c - 6;
  const ticks = [];
  for (let d = 0; d < 360; d += 10) {
    const major = d % 30 === 0;
    ticks.push(
      <line
        key={d}
        x1={c}
        y1={c - r + (major ? 0 : 4)}
        x2={c}
        y2={c - r + (major ? 12 : 9)}
        stroke="white"
        strokeWidth={major ? 2 : 1}
        transform={`rotate(${d} ${c} ${c})`}
      />,
    );
  }
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
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Girodireccional marcando rumbo ${heading}`}
    >
      <circle cx={c} cy={c} r={c - 1} fill={NAVY} />
      <g transform={`rotate(${-heading} ${c} ${c})`}>
        {ticks}
        {labels.map((l) => (
          <text
            key={l.d}
            x={c}
            y={c - r + 24}
            fill="white"
            fontSize={l.t.length > 1 ? 10 : 12}
            fontWeight={700}
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
            transform={`rotate(${l.d} ${c} ${c})`}
          >
            {l.t}
          </text>
        ))}
      </g>
      {/* Índice fijo (lubber line) y silueta propia */}
      <polygon points={`${c - 6},6 ${c + 6},6 ${c},18`} fill={CORAL} />
      <g stroke="#F2AEBC" strokeWidth={2.4} strokeLinecap="round">
        <line x1={c} y1={c - 14} x2={c} y2={c + 12} />
        <line x1={c - 11} y1={c - 2} x2={c + 11} y2={c - 2} />
        <line x1={c - 6} y1={c + 9} x2={c + 6} y2={c + 9} />
      </g>
    </svg>
  );
}

function RbiInstrument({ rb, size = 150 }: { rb: number; size?: number }) {
  const c = size / 2;
  const r = c - 6;
  const ticks = [];
  for (let d = 0; d < 360; d += 15) {
    const major = d % 45 === 0;
    ticks.push(
      <line
        key={d}
        x1={c}
        y1={c - r + (major ? 0 : 4)}
        x2={c}
        y2={c - r + (major ? 11 : 8)}
        stroke="white"
        strokeWidth={major ? 2 : 1}
        transform={`rotate(${d} ${c} ${c})`}
      />,
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Indicador de marcación relativa con aguja en ${rb} grados`}
    >
      <circle cx={c} cy={c} r={c - 1} fill={NAVY} />
      {ticks}
      {[0, 90, 180, 270].map((d) => (
        <text
          key={d}
          x={c}
          y={c - r + 23}
          fill="white"
          fontSize={11}
          fontWeight={700}
          fontFamily="'JetBrains Mono', monospace"
          textAnchor="middle"
          transform={`rotate(${d} ${c} ${c})`}
        >
          {d === 0 ? "0" : d / 10}
        </text>
      ))}
      {/* Aguja ADF */}
      <g transform={`rotate(${rb} ${c} ${c})`}>
        <polygon points={`${c},${c - r + 14} ${c - 7},${c + 8} ${c + 7},${c + 8}`} fill="#F2D06B" />
        <rect x={c - 2.6} y={c + 6} width={5.2} height={r * 0.5} rx={2.6} fill="#F2D06B" />
      </g>
      <circle cx={c} cy={c} r={4.5} fill={NAVY} stroke="white" strokeWidth={1.5} />
    </svg>
  );
}

/** Mapa cenital de opción: estación al centro, avión sobre el radial. */
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
  const c = size / 2;
  const dist = size * 0.32;
  const rad = (opt.radial * Math.PI) / 180;
  const px = c + Math.sin(rad) * dist;
  const py = c - Math.cos(rad) * dist;
  const border = state === "correct" ? "#12B26B" : state === "wrong" ? "#C24545" : `${NAVY}22`;
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        border: `2px solid ${border}`,
        borderRadius: 16,
        background: state === "dim" ? "#F4F3F0" : "white",
        opacity: state === "dim" ? 0.55 : 1,
        cursor: onClick ? "pointer" : "default",
        padding: 6,
        lineHeight: 0,
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          fontFamily: MONO,
          fontSize: "0.62rem",
          fontWeight: 700,
          color: HAZE,
          lineHeight: 1,
        }}
      >
        {index + 1}
      </span>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Norte del mapa */}
        <g transform={`translate(${size - 16}, 16)`}>
          <line x1={0} y1={8} x2={0} y2={-8} stroke={HAZE} strokeWidth={1.6} />
          <polygon points="0,-9 -4,-2 4,-2" fill={HAZE} />
          <text
            x={0}
            y={-12}
            fontSize={9}
            fontWeight={700}
            fill={HAZE}
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
          >
            N
          </text>
        </g>
        {/* Estación NDB */}
        <circle
          cx={c}
          cy={c}
          r={13}
          fill="none"
          stroke={`${NAVY}55`}
          strokeWidth={1.4}
          strokeDasharray="3 3"
        />
        <circle cx={c} cy={c} r={3.4} fill={NAVY} />
        {/* Radial (sutil) */}
        <line
          x1={c}
          y1={c}
          x2={px}
          y2={py}
          stroke={`${NAVY}22`}
          strokeWidth={1.2}
          strokeDasharray="4 4"
        />
        {/* Avión con su rumbo */}
        <g transform={`translate(${px} ${py}) rotate(${opt.heading})`}>
          <path d="M0,-10 L7,6 L0,2 L-7,6 Z" fill={CORAL} />
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

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }} onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Orientación · Nivel ${cfg.level}`}
        remainingSec={remaining}
        progressLabel={`${Math.min(tally.current.total + (picked === null ? 1 : 0), cfg.items)}/${cfg.items}`}
        onQuit={onQuit}
      />

      <CCard style={{ padding: "26px 24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Eyebrow style={{ marginBottom: 6 }}>Girodireccional</Eyebrow>
            <DirectionIndicator heading={item.heading} />
          </div>
          <div style={{ textAlign: "center" }}>
            <Eyebrow style={{ marginBottom: 6 }}>Aguja ADF (rel.)</Eyebrow>
            <RbiInstrument rb={item.relativeBearing} />
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 190 }}>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "1.25rem",
                color: NAVY,
                lineHeight: 1.35,
              }}
            >
              ¿Qué mapa muestra tu posición respecto a la estación?
            </div>
            <div style={{ marginTop: 8, fontSize: "0.78rem", color: HAZE, lineHeight: 1.5 }}>
              El mapa tiene el norte arriba. La estación es el punto del centro; el avión conserva
              su rumbo real.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
            gap: 10,
            justifyItems: "center",
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
          <div
            style={{
              marginTop: 18,
              background: CREAM,
              border: `1px solid ${NAVY}12`,
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: HAZE,
                marginBottom: 6,
              }}
            >
              {pickedOpt?.confusion === null ? "Correcto" : "La lectura correcta"}
            </div>
            <div style={{ fontSize: "0.9rem", color: NAVY, lineHeight: 1.55 }}>
              HDG{" "}
              <strong style={{ fontFamily: MONO }}>{String(item.heading).padStart(3, "0")}</strong>{" "}
              + marcación{" "}
              <strong style={{ fontFamily: MONO }}>
                {String(item.relativeBearing).padStart(3, "0")}
              </strong>{" "}
              → la estación queda al QDM{" "}
              <strong style={{ fontFamily: MONO }}>{String(item.qdm).padStart(3, "0")}</strong>; tú
              estás en el radial{" "}
              <strong style={{ fontFamily: MONO }}>{String(item.qdr).padStart(3, "0")}</strong>{" "}
              (QDR).
              {pickedOpt?.confusion && (
                <>
                  {" "}
                  <span style={{ color: "#A13333" }}>{CONFUSION_LABEL[pickedOpt.confusion]}</span>
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
