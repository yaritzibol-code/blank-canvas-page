/**
 * Memoria — retención de parámetros de vuelo (DOM).
 *
 * Ciclo por bloque: exposición cronometrada → distractor opcional → recall por
 * campo → feedback (sólo práctica). En examen corre un reloj global de sesión
 * y los bloques se encadenan hasta agotarlo.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildMemoryBlock,
  normalizeMemoryAnswer,
  type MemoryBlock,
} from "@/modules/compass/memoria";
import { scoreMemory } from "@/modules/compass/scoring";
import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";
import { classifyInput } from "./use-game-loop";
import { CButton, CCard, Eyebrow, GameTopBar, INK, INK3, MONO, SERIF } from "./ui";

interface Props {
  cfg: CompassRunConfig;
  onFinish: (r: CompassResult) => void;
  onQuit: () => void;
}

type Fase = "show" | "distractor" | "recall" | "feedback";

interface Tally {
  fieldsTotal: number;
  fieldsCorrect: number;
  blocksTotal: number;
  blocksPerfect: number;
  nearMisses: number;
  answerSecs: number[];
}

/** ¿Difieren en exactamente un carácter? (error "de un dígito"). */
function isNearMiss(expected: string, got: string): boolean {
  if (expected === got || expected.length !== got.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) if (expected[i] !== got[i]) diff++;
  return diff === 1;
}

export function MemoriaGame({ cfg, onFinish, onQuit }: Props) {
  const [blockIdx, setBlockIdx] = useState(0);
  const [fase, setFase] = useState<Fase>("show");
  const [exposureLeft, setExposureLeft] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  // El examen de módulo corre contra reloj (items = 0); la práctica y el
  // simulacro compacto van por número de bloques.
  const timeDriven = cfg.items === 0 && cfg.durationSec > 0;
  const [remaining, setRemaining] = useState<number | null>(timeDriven ? cfg.durationSec : null);

  const tally = useRef<Tally>({
    fieldsTotal: 0,
    fieldsCorrect: 0,
    blocksTotal: 0,
    blocksPerfect: 0,
    nearMisses: 0,
    answerSecs: [],
  });
  const counts = useRef({ teclado: 0, mouse: 0, touch: 0 });
  const interruptions = useRef(0);
  const startedAt = useRef(performance.now());
  const recallShownAt = useRef(0);
  const finished = useRef(false);
  const firstInput = useRef<HTMLInputElement>(null);

  const block: MemoryBlock = useMemo(
    () => buildMemoryBlock(cfg.seed, cfg.level, blockIdx),
    [cfg.seed, cfg.level, blockIdx],
  );

  const elapsedSec = () => (performance.now() - startedAt.current) / 1000;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const t = tally.current;
    const sorted = [...t.answerSecs].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length === 0
        ? null
        : sorted.length % 2
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
    const raw = {
      fieldsTotal: t.fieldsTotal,
      fieldsCorrect: t.fieldsCorrect,
      blocksTotal: t.blocksTotal,
      blocksPerfect: t.blocksPerfect,
      nearMisses: t.nearMisses,
      medianAnswerSec: median,
    };
    const { score, metrics, advice } = scoreMemory(raw);
    onFinish({
      moduleId: "memoria",
      score,
      metrics,
      raw: { ...raw, medianAnswerSec: median ?? -1 },
      durationSec: elapsedSec(),
      input: classifyInput(counts.current),
      interactions: Object.values(counts.current).reduce((a, b) => a + b, 0),
      interruptions: interruptions.current,
      advice,
    });
  }, [onFinish]);

  // Exposición cronometrada del bloque.
  useEffect(() => {
    if (fase !== "show") return;
    setExposureLeft(block.exposureSec);
    const t0 = performance.now();
    const iv = setInterval(() => {
      const left = block.exposureSec - (performance.now() - t0) / 1000;
      setExposureLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(iv);
        setFase(block.distractor ? "distractor" : "recall");
      }
    }, 100);
    return () => clearInterval(iv);
  }, [fase, block]);

  // Distractor con timeout de seguridad.
  useEffect(() => {
    if (fase !== "distractor") return;
    const t = setTimeout(() => setFase("recall"), 6000);
    return () => clearTimeout(t);
  }, [fase]);

  // Preparar el recall.
  useEffect(() => {
    if (fase !== "recall") return;
    setAnswers(new Array(block.fields.length).fill(""));
    recallShownAt.current = performance.now();
    const t = setTimeout(() => firstInput.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [fase, block]);

  // Reloj global del examen.
  useEffect(() => {
    if (!timeDriven) return;
    const iv = setInterval(() => {
      const rem = cfg.durationSec - elapsedSec();
      setRemaining(Math.max(0, Math.ceil(rem)));
      if (rem <= 0) finish();
    }, 250);
    return () => clearInterval(iv);
  }, [timeDriven, cfg.durationSec, finish]);

  // Interrupciones (sin pausa: el reloj de examen sigue, como en uno real).
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) interruptions.current++;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const gradeBlock = () => {
    const t = tally.current;
    let allOk = true;
    block.fields.forEach((f, i) => {
      const got = normalizeMemoryAnswer(f.kind, answers[i] ?? "");
      t.fieldsTotal++;
      if (got === f.answer) t.fieldsCorrect++;
      else {
        allOk = false;
        if (isNearMiss(f.answer, got)) t.nearMisses++;
      }
    });
    t.blocksTotal++;
    if (allOk) t.blocksPerfect++;
    t.answerSecs.push((performance.now() - recallShownAt.current) / 1000);
  };

  const submitRecall = () => {
    gradeBlock();
    if (cfg.mode === "practica") {
      setFase("feedback");
      return;
    }
    nextBlock();
  };

  const nextBlock = () => {
    const done = timeDriven
      ? elapsedSec() >= cfg.durationSec
      : tally.current.blocksTotal >= cfg.items;
    if (done) {
      finish();
      return;
    }
    setBlockIdx((i) => i + 1);
    setFase("show");
  };

  const trackPointer = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") counts.current.touch++;
    else counts.current.mouse++;
  };

  const progressLabel =
    cfg.items > 0
      ? `${tally.current.blocksTotal}/${cfg.items}`
      : `${tally.current.blocksTotal} bloques`;

  const pad = "clamp(18px, 3.4vw, 34px)";

  return (
    <div onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Memoria · Nivel ${cfg.level}`}
        remainingSec={remaining}
        progressLabel={progressLabel}
        onQuit={onQuit}
      />

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {fase === "show" && (
          <CCard style={{ textAlign: "center", padding: pad }}>
            <Eyebrow style={{ marginBottom: 18 }}>Memoriza el bloque</Eyebrow>
            <div
              key={blockIdx}
              style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}
            >
              {block.fields.map((f, i) => (
                <div
                  key={f.kind}
                  className="cx-lcd is-fms"
                  style={{ minWidth: 132, animationDelay: `${i * 70}ms` }}
                >
                  <div className="cx-lcd-label">{f.kind}</div>
                  <div className="cx-lcd-value">{f.label.replace(`${f.kind} `, "")}</div>
                </div>
              ))}
            </div>
            <div className="cx-timer" aria-hidden="true">
              <i style={{ width: `${(exposureLeft / block.exposureSec) * 100}%` }} />
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: MONO,
                fontSize: "0.7rem",
                color: INK3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {exposureLeft.toFixed(1)} s
            </div>
          </CCard>
        )}

        {fase === "distractor" && block.distractor && (
          <CCard style={{ textAlign: "center", padding: pad }}>
            <Eyebrow>Interferencia — resuelve rápido</Eyebrow>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "clamp(1.9rem, 5vw, 2.6rem)",
                color: INK,
                margin: "10px 0 20px",
              }}
            >
              {block.distractor.question}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {block.distractor.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className="cx-key"
                  onClick={() => setFase("recall")}
                  style={{ minWidth: 88, fontFamily: MONO, fontSize: "1.15rem", fontWeight: 700 }}
                >
                  {o}
                </button>
              ))}
            </div>
          </CCard>
        )}

        {fase === "recall" && (
          <CCard style={{ padding: pad }}>
            <Eyebrow>Reproduce el bloque exacto</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 6 }}>
              {block.fields.map((f, i) => (
                <label key={f.kind} style={{ flex: "1 1 130px", minWidth: 120 }}>
                  <span className="cx-field-label">{f.kind}</span>
                  <input
                    ref={i === 0 ? firstInput : undefined}
                    value={answers[i] ?? ""}
                    inputMode={f.kind === "FREQ" ? "decimal" : "numeric"}
                    autoComplete="off"
                    className="cx-entry"
                    onKeyDown={(e) => {
                      counts.current.teclado++;
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const next = e.currentTarget
                          .closest("label")
                          ?.nextElementSibling?.querySelector("input");
                        if (next instanceof HTMLInputElement) next.focus();
                        else submitRecall();
                      }
                    }}
                    onChange={(e) =>
                      setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))
                    }
                    style={{ width: "100%" }}
                  />
                </label>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <CButton onClick={submitRecall}>Confirmar</CButton>
            </div>
          </CCard>
        )}

        {fase === "feedback" && (
          <CCard style={{ padding: pad }}>
            <Eyebrow>Resultado del bloque</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
              {block.fields.map((f, i) => {
                const got = normalizeMemoryAnswer(f.kind, answers[i] ?? "");
                const ok = got === f.answer;
                return (
                  <div
                    key={f.kind}
                    className={`cx-cell ${ok ? "is-ok" : "is-bad"}`}
                    style={{ flex: "1 1 130px", animationDelay: `${i * 70}ms` }}
                  >
                    <div className="cx-field-label">{f.kind}</div>
                    <div className="cx-cell-value">{got || "—"}</div>
                    {!ok && (
                      <div style={{ fontSize: "0.74rem", color: INK3, marginTop: 4 }}>
                        Era <strong style={{ fontFamily: MONO, color: INK }}>{f.answer}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <CButton onClick={nextBlock}>
                {tally.current.blocksTotal >= cfg.items ? "Ver debrief" : "Siguiente bloque"}
              </CButton>
            </div>
          </CCard>
        )}
      </div>
    </div>
  );
}
