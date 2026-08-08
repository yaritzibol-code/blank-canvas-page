/**
 * Multitarea — transferencia de datos + monitor de sistemas (DOM).
 *
 * La tarea primaria (copiar el dato y enviarlo) compite con el monitoreo de
 * cuatro sistemas cuyas alertas vencen en pocos segundos. Las alertas siguen
 * la agenda determinista de la seed; el loop de paso fijo activa y vence
 * alertas aunque el frame rate caiga.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildAlertSchedule,
  buildTransferDatum,
  MultiMetrics,
  MULTI_SYSTEMS,
  type MultiAlert,
  type MultiSystem,
} from "@/modules/compass/multitarea";
import { scoreMulti } from "@/modules/compass/scoring";
import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";
import { classifyInput, useGameLoop } from "./use-game-loop";
import {
  CButton,
  CCard,
  CountdownIntro,
  Eyebrow,
  GameTopBar,
  PauseOverlay,
  CREAM,
  HAZE,
  MONO,
  NAVY,
} from "./ui";

interface Props {
  cfg: CompassRunConfig;
  onFinish: (r: CompassResult) => void;
  onQuit: () => void;
}

const ACK_KEYS: Record<string, MultiSystem> = {
  q: "HYD",
  w: "ELEC",
  e: "FUEL",
  r: "PRESS",
};
const KEY_OF_SYSTEM: Record<MultiSystem, string> = {
  HYD: "Q",
  ELEC: "W",
  FUEL: "E",
  PRESS: "R",
};

interface ActiveAlert {
  system: MultiSystem;
  startedT: number;
  windowSec: number;
}

export function MultitareaGame({ cfg, onFinish, onQuit }: Props) {
  const [fase, setFase] = useState<"countdown" | "run" | "pausa">("countdown");
  const [remaining, setRemaining] = useState(cfg.durationSec);
  const [, setTick] = useState(0); // re-render ~7/s para las barras de alerta
  const [datumIdx, setDatumIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [errorFlash, setErrorFlash] = useState(false);

  const schedule = useRef<MultiAlert[]>([]);
  const nextAlert = useRef(0);
  const active = useRef<ActiveAlert[]>([]);
  const metrics = useRef(new MultiMetrics());
  const counts = useRef({ teclado: 0, mouse: 0, touch: 0 });
  const interruptions = useRef(0);
  const simT = useRef(0);
  const finished = useRef(false);
  const lastTickAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  if (schedule.current.length === 0) {
    schedule.current = buildAlertSchedule(cfg.seed, cfg.level, cfg.durationSec);
  }
  const datum = buildTransferDatum(cfg.seed, cfg.level, datumIdx);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const raw = metrics.current.result(cfg.durationSec);
    const { score, metrics: chips, advice } = scoreMulti(raw);
    onFinish({
      moduleId: "multitarea",
      score,
      metrics: chips,
      raw: {
        transfersOk: raw.transfersOk,
        transfersError: raw.transfersError,
        transfersPerMin: raw.transfersPerMin,
        transferAccuracy: raw.transferAccuracy,
        hits: raw.hits,
        misses: raw.misses,
        falseAlarms: raw.falseAlarms,
        medianReactionSec: raw.medianReactionSec ?? -1,
      },
      durationSec: cfg.durationSec,
      input: classifyInput(counts.current),
      interruptions: interruptions.current,
      advice,
    });
  }, [cfg.durationSec, onFinish]);

  const step = useCallback(
    (t: number, _dt: number) => {
      if (finished.current) return;
      simT.current = t;
      if (t >= cfg.durationSec) {
        finish();
        return;
      }
      // Activa alertas agendadas.
      while (
        nextAlert.current < schedule.current.length &&
        schedule.current[nextAlert.current].at <= t
      ) {
        const a = schedule.current[nextAlert.current];
        // Nunca dos alertas activas del mismo sistema: se pospone un instante.
        if (active.current.some((x) => x.system === a.system)) {
          a.at = t + 1.5;
          break;
        }
        active.current.push({ system: a.system, startedT: t, windowSec: a.windowSec });
        nextAlert.current++;
      }
      // Vence alertas sin atender.
      const before = active.current.length;
      active.current = active.current.filter((a) => {
        if (t - a.startedT >= a.windowSec) {
          metrics.current.misses++;
          return false;
        }
        return true;
      });
      const rem = Math.ceil(cfg.durationSec - t);
      setRemaining((prev) => (prev !== rem ? rem : prev));
      // Tick de render acotado (para las barras) o si cambió el set de alertas.
      if (t - lastTickAt.current > 0.15 || before !== active.current.length) {
        lastTickAt.current = t;
        setTick((v) => v + 1);
      }
    },
    [cfg.durationSec, finish],
  );

  useGameLoop({
    running: fase === "run",
    onStep: step,
    onFrame: () => {},
    onHidden: () => {
      interruptions.current++;
      setFase("pausa");
    },
  });

  const ack = useCallback((system: MultiSystem) => {
    const idx = active.current.findIndex((a) => a.system === system);
    if (idx === -1) {
      metrics.current.falseAlarms++;
      return;
    }
    const a = active.current[idx];
    active.current.splice(idx, 1);
    metrics.current.reaction(simT.current - a.startedT);
    setTick((v) => v + 1);
  }, []);

  // Teclas Q/W/E/R reconocen alertas aunque el foco esté en el input.
  useEffect(() => {
    if (fase !== "run") return;
    const onKey = (e: KeyboardEvent) => {
      counts.current.teclado++;
      const k = e.key.toLowerCase();
      if (ACK_KEYS[k]) {
        e.preventDefault();
        ack(ACK_KEYS[k]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fase, ack]);

  const submitTransfer = () => {
    if (fase !== "run") return;
    if (typed.trim() === datum.value) {
      metrics.current.transfersOk++;
      setTyped("");
      setDatumIdx((i) => i + 1);
    } else {
      metrics.current.transfersError++;
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 500);
      inputRef.current?.select();
    }
    inputRef.current?.focus();
  };

  const trackPointer = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") counts.current.touch++;
    else counts.current.mouse++;
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }} onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Multitarea · Nivel ${cfg.level}`}
        remainingSec={fase === "countdown" ? cfg.durationSec : remaining}
        progressLabel={`${metrics.current.transfersOk} env.`}
        onQuit={onQuit}
      />

      <div style={{ position: "relative" }}>
        <div style={{ display: "grid", gap: 14 }}>
          {/* Tarea primaria: transferencia */}
          <CCard style={{ padding: "22px 24px" }}>
            <Eyebrow>Tarea primaria — transfiere el dato</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <div
                style={{
                  background: NAVY,
                  color: "white",
                  borderRadius: 14,
                  padding: "14px 20px",
                  minWidth: 150,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.58rem",
                    letterSpacing: "0.18em",
                    color: "#F2AEBC",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  RECIBIDO · {datum.label}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {datum.value}
                </div>
              </div>
              <div style={{ flex: "1 1 200px", display: "flex", gap: 10 }}>
                <input
                  ref={inputRef}
                  value={typed}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={`Teclea ${datum.label} y Enter`}
                  onChange={(e) => setTyped(e.target.value.replace(/[^\d.]/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitTransfer();
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `2px solid ${errorFlash ? "#C24545" : `${NAVY}26`}`,
                    fontFamily: MONO,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: NAVY,
                    background: errorFlash ? "#FBEDED" : CREAM,
                    outline: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                />
                <CButton onClick={submitTransfer} style={{ padding: "12px 18px" }}>
                  Enviar
                </CButton>
              </div>
            </div>
          </CCard>

          {/* Tarea secundaria: monitor de sistemas */}
          <CCard style={{ padding: "22px 24px" }}>
            <Eyebrow>Monitor — apaga las alertas antes de que venzan</Eyebrow>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 10,
              }}
            >
              {MULTI_SYSTEMS.map((sys) => {
                const alert = active.current.find((a) => a.system === sys);
                const frac = alert
                  ? Math.max(0, 1 - (simT.current - alert.startedT) / alert.windowSec)
                  : 0;
                return (
                  <button
                    key={sys}
                    onClick={() => fase === "run" && ack(sys)}
                    style={{
                      borderRadius: 14,
                      border: `2px solid ${alert ? "#C88A00" : `${NAVY}1A`}`,
                      background: alert ? "#FFF6E0" : "white",
                      padding: "14px 12px 12px",
                      cursor: "pointer",
                      textAlign: "center",
                      minHeight: 86,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        color: alert ? "#8A6100" : NAVY,
                        letterSpacing: "0.1em",
                      }}
                    >
                      {sys}
                    </div>
                    <div
                      style={{ fontFamily: MONO, fontSize: "0.56rem", color: HAZE, marginTop: 2 }}
                    >
                      tecla {KEY_OF_SYSTEM[sys]}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        height: 5,
                        background: `${NAVY}0F`,
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      {alert && (
                        <div
                          style={{
                            height: "100%",
                            width: `${frac * 100}%`,
                            background: frac > 0.4 ? "#C88A00" : "#C24545",
                            borderRadius: 999,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: MONO,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        color: alert ? "#C88A00" : "#12B26B",
                      }}
                    >
                      {alert ? "ALERTA" : "OK"}
                    </div>
                  </button>
                );
              })}
            </div>
          </CCard>
        </div>

        {fase === "countdown" && (
          <CountdownIntro
            onDone={() => {
              setFase("run");
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
          />
        )}
        {fase === "pausa" && (
          <PauseOverlay
            texto="Sesión en pausa — la interrupción queda registrada"
            onResume={() => setFase("run")}
          />
        )}
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: 12,
          fontFamily: MONO,
          fontSize: "0.66rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: HAZE,
          background: CREAM,
          border: `1px solid ${NAVY}0F`,
          borderRadius: 10,
          padding: "8px 12px",
        }}
      >
        Copia el dato y Enter · apaga alertas con click/tap o Q W E R
      </p>
    </div>
  );
}
