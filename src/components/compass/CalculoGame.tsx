/**
 * Cálculo — reactivos de aritmética mental (DOM).
 *
 * Práctica: feedback y rationale tras cada ítem. Examen: reloj global, sin
 * feedback, con opción de saltar (cuenta como omitida). Teclas 1-4 responden.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildCalcItem, calcTopicLabel, type CalcItem } from "@/modules/compass/calculo";
import { scoreCalc } from "@/modules/compass/scoring";
import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";
import { classifyInput } from "./use-game-loop";
import { CButton, CCard, Eyebrow, GameTopBar, GREEN, INK2, INK3, MONO, RED } from "./ui";

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

export function CalculoGame({ cfg, onFinish, onQuit }: Props) {
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

  const item: CalcItem = useMemo(() => buildCalcItem(cfg.seed, idx), [cfg.seed, idx]);
  const esPractica = cfg.mode === "practica";

  const elapsedSec = () => (performance.now() - startedAt.current) / 1000;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const t = tally.current;
    // En examen, los ítems no alcanzados dentro del formato cuentan como omitidos.
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
    const { score, metrics, advice } = scoreCalc(raw);
    onFinish({
      moduleId: "calculo",
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

  // Reloj global del examen.
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
    const label = calcTopicLabel(item.topic);
    const slot = (t.breakdown[label] ??= { correct: 0, total: 0 });
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

  // Teclas 1-4 y Enter para continuar en práctica.
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

  const acerto = picked !== null && picked === item.correctIndex;

  return (
    <div onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Cálculo · ${esPractica ? `Práctica` : "Examen"}`}
        remainingSec={remaining}
        progressLabel={`${Math.min(tally.current.total + (picked === null ? 1 : 0), cfg.items)}/${cfg.items}`}
        onQuit={onQuit}
      />

      <CCard style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(18px, 3.4vw, 32px)" }}>
        <Eyebrow>{calcTopicLabel(item.topic)}</Eyebrow>
        <div key={idx} className="cx-question">
          {item.question}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 10,
          }}
        >
          {item.options.map((o, i) => {
            const isCorrect = picked !== null && i === item.correctIndex;
            const isWrongPick = picked === i && i !== item.correctIndex;
            const estado = isCorrect
              ? " is-correct"
              : isWrongPick
                ? " is-wrong"
                : picked !== null
                  ? " is-dim"
                  : "";
            return (
              <button
                key={i}
                type="button"
                className={`cx-key is-row${estado}`}
                onClick={() => choose(i)}
                disabled={picked !== null}
              >
                <span className="cx-key-n">{i + 1}</span>
                <span style={{ fontFamily: MONO, fontSize: "1rem", fontWeight: 700 }}>{o}</span>
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
                marginBottom: 6,
              }}
            >
              {acerto
                ? "Correcto — así se resuelve"
                : picked === -1
                  ? "Saltada — así se resolvía"
                  : "Así se resolvía"}
            </div>
            <div style={{ fontSize: "0.9rem", color: INK2, lineHeight: 1.55 }}>
              {item.rationale}
            </div>
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
