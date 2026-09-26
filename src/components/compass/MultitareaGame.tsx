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
import { CButton, CCard, CountdownIntro, Eyebrow, GameHint, GameTopBar, PauseOverlay } from "./ui";

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

/** Glifos de trazo para cada sistema del panel. */
const SYSTEM_GLYPH: Record<MultiSystem, React.ReactNode> = {
  HYD: <path d="M8 1.8C8 1.8 3.2 7.4 3.2 10.3a4.8 4.8 0 0 0 9.6 0C12.8 7.4 8 1.8 8 1.8Z" />,
  ELEC: <path d="M9.2 1.2 3.4 9h4.3l-1 5.8L12.6 7H8.3Z" />,
  FUEL: (
    <>
      <path d="M3 14.2V3.4A1.4 1.4 0 0 1 4.4 2h4.2A1.4 1.4 0 0 1 10 3.4v10.8Z" />
      <path d="M4.8 4h3.4v3H4.8ZM10 6.2l2.4 2.2v3.4a1 1 0 0 0 2 0V6.8L12 4.4" />
    </>
  ),
  PRESS: (
    <>
      <path d="M2.4 11.4a5.6 5.6 0 1 1 11.2 0" />
      <path d="M8 11.4 11 6.6" />
    </>
  ),
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
      interactions: Object.values(counts.current).reduce((a, b) => a + b, 0),
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
    <div onPointerDown={trackPointer}>
      <GameTopBar
        nombre={`Multitarea · Nivel ${cfg.level}`}
        remainingSec={fase === "countdown" ? cfg.durationSec : remaining}
        progressLabel={`${metrics.current.transfersOk} env.`}
        onQuit={onQuit}
      />

      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", borderRadius: 14 }}>
        <div style={{ display: "grid", gap: 14 }}>
          {/* Tarea primaria: transferencia */}
          <CCard style={{ padding: "clamp(16px, 3vw, 24px)" }}>
            <Eyebrow>Tarea primaria — transfiere el dato</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <div className="cx-lcd" aria-live="polite">
                <div className="cx-lcd-label">RECIBIDO · {datum.label}</div>
                <div className="cx-lcd-value">{datum.value}</div>
              </div>
              <div style={{ flex: "1 1 220px", display: "flex", gap: 10, minWidth: 0 }}>
                <input
                  ref={inputRef}
                  size={1}
                  value={typed}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={`Teclea ${datum.label} y Enter`}
                  aria-label={`Teclea ${datum.label}`}
                  className={`cx-entry${errorFlash ? " is-error" : ""}`}
                  onChange={(e) => setTyped(e.target.value.replace(/[^\d.]/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitTransfer();
                    }
                  }}
                />
                <CButton onClick={submitTransfer} style={{ padding: "12px 18px" }}>
                  Enviar
                </CButton>
              </div>
            </div>
          </CCard>

          {/* Tarea secundaria: panel anunciador de sistemas */}
          <CCard style={{ padding: "clamp(16px, 3vw, 24px)" }}>
            <Eyebrow>Monitor — apaga las alertas antes de que venzan</Eyebrow>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))",
                gap: 12,
              }}
            >
              {MULTI_SYSTEMS.map((sys) => {
                const alert = active.current.find((a) => a.system === sys);
                const frac = alert
                  ? Math.max(0, 1 - (simT.current - alert.startedT) / alert.windowSec)
                  : 0;
                const estado = alert ? (frac > 0.4 ? " is-alert" : " is-alert is-urgent") : "";
                return (
                  <button
                    key={sys}
                    type="button"
                    className={`cx-annun${estado}`}
                    onClick={() => fase === "run" && ack(sys)}
                  >
                    <span className="cx-annun-key" aria-hidden="true">
                      {KEY_OF_SYSTEM[sys]}
                    </span>
                    <svg
                      width={22}
                      height={22}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="cx-annun-glyph"
                    >
                      {SYSTEM_GLYPH[sys]}
                    </svg>
                    <span className="cx-annun-name">{sys}</span>
                    <span className="cx-annun-lamp">{alert ? "ALERTA" : "OK"}</span>
                    <span className="cx-annun-sub">tecla {KEY_OF_SYSTEM[sys]}</span>
                    <span className="cx-annun-bar">
                      {alert && <i style={{ width: `${frac * 100}%` }} />}
                    </span>
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

      <GameHint>Copia el dato y Enter · apaga alertas con click/tap o Q W E R</GameHint>
    </div>
  );
}
