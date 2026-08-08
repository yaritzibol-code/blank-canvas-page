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
import {
  CButton,
  CCard,
  Eyebrow,
  GameTopBar,
  CORAL,
  CREAM,
  HAZE,
  MONO,
  NAVY,
  SALMON,
  SERIF,
} from "./ui";

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

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }} onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Memoria · Nivel ${cfg.level}`}
        remainingSec={remaining}
        progressLabel={progressLabel}
        onQuit={onQuit}
      />

      {fase === "show" && (
        <CCard style={{ textAlign: "center", padding: "34px 24px" }}>
          <Eyebrow style={{ marginBottom: 18 }}>Memoriza el bloque</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {block.fields.map((f) => (
              <div
                key={f.kind}
                style={{
                  background: NAVY,
                  color: "white",
                  borderRadius: 14,
                  padding: "16px 20px",
                  minWidth: 120,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.6rem",
                    letterSpacing: "0.18em",
                    color: "#F2AEBC",
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {f.kind}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {f.label.replace(`${f.kind} `, "")}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 22,
              height: 4,
              background: SALMON,
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: CORAL,
                width: `${(exposureLeft / block.exposureSec) * 100}%`,
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </CCard>
      )}

      {fase === "distractor" && block.distractor && (
        <CCard style={{ textAlign: "center", padding: "34px 24px" }}>
          <Eyebrow>Interferencia — resuelve rápido</Eyebrow>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "2.2rem",
              color: NAVY,
              margin: "10px 0 18px",
            }}
          >
            {block.distractor.question}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {block.distractor.options.map((o) => (
              <button
                key={o}
                onClick={() => setFase("recall")}
                style={{
                  padding: "12px 22px",
                  borderRadius: 12,
                  border: `1px solid ${NAVY}22`,
                  background: "white",
                  color: NAVY,
                  fontFamily: MONO,
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  minWidth: 76,
                  minHeight: 44,
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </CCard>
      )}

      {fase === "recall" && (
        <CCard style={{ padding: "28px 24px" }}>
          <Eyebrow>Reproduce el bloque exacto</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 6 }}>
            {block.fields.map((f, i) => (
              <label key={f.kind} style={{ flex: "1 1 130px", minWidth: 120 }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: MONO,
                    fontSize: "0.62rem",
                    letterSpacing: "0.16em",
                    fontWeight: 700,
                    color: HAZE,
                    marginBottom: 6,
                  }}
                >
                  {f.kind}
                </span>
                <input
                  ref={i === 0 ? firstInput : undefined}
                  value={answers[i] ?? ""}
                  inputMode={f.kind === "FREQ" ? "decimal" : "numeric"}
                  autoComplete="off"
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
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${NAVY}26`,
                    fontFamily: MONO,
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: NAVY,
                    background: CREAM,
                    outline: "none",
                  }}
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
        <CCard style={{ padding: "28px 24px" }}>
          <Eyebrow>Resultado del bloque</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
            {block.fields.map((f, i) => {
              const got = normalizeMemoryAnswer(f.kind, answers[i] ?? "");
              const ok = got === f.answer;
              return (
                <div
                  key={f.kind}
                  style={{
                    flex: "1 1 130px",
                    borderRadius: 14,
                    padding: "14px 16px",
                    background: ok ? "#EAF7F0" : "#FBEDED",
                    border: `1px solid ${ok ? "#12B26B33" : "#C2454533"}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.6rem",
                      letterSpacing: "0.16em",
                      fontWeight: 700,
                      color: HAZE,
                    }}
                  >
                    {f.kind}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: ok ? "#0B7A49" : "#A13333",
                      marginTop: 4,
                    }}
                  >
                    {got || "—"}
                  </div>
                  {!ok && (
                    <div style={{ fontSize: "0.72rem", color: HAZE, marginTop: 3 }}>
                      Era <strong style={{ fontFamily: MONO }}>{f.answer}</strong>
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
  );
}
