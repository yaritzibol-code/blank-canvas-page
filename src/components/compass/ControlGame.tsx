/**
 * Control — seguimiento compensatorio de dos ejes sobre canvas (v2).
 *
 * Visual tipo indicador de desviación (localizer/glideslope): una aguja
 * vertical marca el error horizontal y una horizontal el vertical; el objetivo
 * es mantener ambas en el centro. El input (mouse/touch como stick virtual,
 * teclado) comanda la deflexión del mando; la dinámica con inercia y el
 * acoplamiento cruzado viven en el motor (stepAxis). Paso fijo vía
 * use-game-loop.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AxisMetrics,
  buildAxisPerturbation,
  controlLevel,
  newAxisState,
  stepAxis,
  type AxisPerturbation,
  type ControlAxisState,
} from "@/modules/compass/control";
import { scoreControl } from "@/modules/compass/scoring";
import type { CompassResult, CompassRunConfig } from "@/modules/compass/types";
import { classifyInput, useGameLoop } from "./use-game-loop";
import {
  CountdownIntro,
  GameTopBar,
  PauseOverlay,
  CORAL,
  CREAM,
  HAZE,
  MONO,
  NAVY,
  SALMON,
} from "./ui";

interface Props {
  cfg: CompassRunConfig;
  onFinish: (r: CompassResult) => void;
  onQuit: () => void;
}

export function ControlGame({ cfg, onFinish, onQuit }: Props) {
  const [fase, setFase] = useState<"countdown" | "run" | "pausa">("countdown");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(420);

  const params = controlLevel(cfg.level);

  // Estado de simulación en refs: el loop no debe re-renderizar React.
  const axisX = useRef<ControlAxisState>(newAxisState());
  const axisY = useRef<ControlAxisState>(newAxisState());
  const done = useRef(false);
  const pertX = useRef<AxisPerturbation | null>(null);
  const pertY = useRef<AxisPerturbation | null>(null);
  const metricsX = useRef(new AxisMetrics(params.band));
  const metricsY = useRef(new AxisMetrics(params.band));
  const input = useRef({
    stickX: 0,
    stickY: 0,
    keys: new Set<string>(),
    pointerId: null as number | null,
    originX: 0,
    originY: 0,
    counts: { teclado: 0, mouse: 0, touch: 0 },
  });
  const interruptions = useRef(0);
  const [remaining, setRemaining] = useState(cfg.durationSec);

  if (!pertX.current) {
    pertX.current = buildAxisPerturbation(cfg.seed, 0, cfg.level, cfg.durationSec);
    pertY.current = buildAxisPerturbation(cfg.seed, 1, cfg.level, cfg.durationSec);
  }

  // Tamaño responsivo del canvas (cuadrado).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSide(Math.max(260, Math.min(520, el.clientWidth)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    const rx = metricsX.current.result();
    const ry = metricsY.current.result();
    const recovery =
      rx.meanRecovery !== null && ry.meanRecovery !== null
        ? (rx.meanRecovery + ry.meanRecovery) / 2
        : (rx.meanRecovery ?? ry.meanRecovery);
    const raw = {
      rmsX: rx.rms,
      rmsY: ry.rms,
      inBandX: rx.inBandPct,
      inBandY: ry.inBandPct,
      saturations: rx.saturations + ry.saturations,
      meanRecovery: recovery,
    };
    const { score, metrics, advice } = scoreControl(raw);
    onFinish({
      moduleId: "control",
      score,
      metrics,
      raw: {
        rmsX: rx.rms,
        rmsY: ry.rms,
        inBandX: rx.inBandPct,
        inBandY: ry.inBandPct,
        saturations: raw.saturations,
        meanRecovery: recovery ?? -1,
      },
      durationSec: cfg.durationSec,
      input: classifyInput(input.current.counts),
      interruptions: interruptions.current,
      advice,
    });
  }, [cfg.durationSec, onFinish]);

  const step = useCallback(
    (t: number, dt: number) => {
      if (done.current) return;
      if (t >= cfg.durationSec) {
        finish();
        return;
      }
      const inp = input.current;
      let kx = 0;
      let ky = 0;
      if (inp.keys.has("ArrowLeft") || inp.keys.has("a")) kx -= 1;
      if (inp.keys.has("ArrowRight") || inp.keys.has("d")) kx += 1;
      if (inp.keys.has("ArrowUp") || inp.keys.has("w")) ky -= 1;
      if (inp.keys.has("ArrowDown") || inp.keys.has("s")) ky += 1;
      // La corrección se OPONE al error: deflexión hacia la aguja la recentra.
      const ux = Math.max(-1, Math.min(1, inp.stickX + kx));
      const uy = Math.max(-1, Math.min(1, inp.stickY + ky));

      // El acoplamiento usa la tasa del eje contrario ANTES de este paso.
      const uVelXPrev = axisX.current.uVel;
      const uVelYPrev = axisY.current.uVel;
      const burstX = stepAxis(axisX.current, pertX.current!, params, ux, uVelYPrev, t, dt);
      const burstY = stepAxis(axisY.current, pertY.current!, params, uy, uVelXPrev, t, dt);

      metricsX.current.step(t, axisX.current.pos, dt, burstX);
      metricsY.current.step(t, axisY.current.pos, dt, burstY);

      // El reloj visible sólo cambia una vez por segundo.
      const rem = Math.ceil(cfg.durationSec - t);
      setRemaining((prev) => (prev !== rem ? rem : prev));
    },
    [cfg.durationSec, params, finish],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== side * dpr) {
      canvas.width = side * dpr;
      canvas.height = side * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = side / 2;
    const R = side * 0.44;
    const track = R * 0.86; // recorrido útil de las agujas

    ctx.clearRect(0, 0, side, side);

    // Dial exterior
    ctx.beginPath();
    ctx.arc(c, c, R, 0, Math.PI * 2);
    ctx.strokeStyle = `${NAVY}33`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Banda "centrado" (depende del nivel)
    const band = params.band * track;
    ctx.fillStyle = `${SALMON}88`;
    ctx.fillRect(c - band, c - R * 0.92, band * 2, R * 1.84);
    ctx.fillRect(c - R * 0.92, c - band, R * 1.84, band * 2);

    // Escala de puntos (estilo CDI)
    ctx.fillStyle = `${NAVY}44`;
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const off = (i / 4) * track * 0.9;
      ctx.beginPath();
      ctx.arc(c + off, c, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(c, c + off, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cruz central
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(c - 12, c);
    ctx.lineTo(c + 12, c);
    ctx.moveTo(c, c - 12);
    ctx.lineTo(c, c + 12);
    ctx.stroke();

    const nx = c + axisX.current.pos * track;
    const ny = c + axisY.current.pos * track;

    // Aguja vertical (error horizontal)
    ctx.strokeStyle = CORAL;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(nx, c - R * 0.88);
    ctx.lineTo(nx, c + R * 0.88);
    ctx.stroke();
    // Aguja horizontal (error vertical)
    ctx.beginPath();
    ctx.moveTo(c - R * 0.88, ny);
    ctx.lineTo(c + R * 0.88, ny);
    ctx.stroke();

    // Punto de intersección
    ctx.beginPath();
    ctx.arc(nx, ny, 6, 0, Math.PI * 2);
    ctx.fillStyle = CORAL;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(nx, ny, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stick virtual: deflexión comandada (hueco) y tasa efectiva del mando
    // (relleno). La separación entre ambos ES la inercia que hay que anticipar.
    const inp = input.current;
    const bx = side - 44;
    const by = side - 44;
    ctx.beginPath();
    ctx.arc(bx, by, 24, 0, Math.PI * 2);
    ctx.strokeStyle = `${NAVY}22`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const ssMax = Math.max(0.4, params.authority / params.damping);
    ctx.beginPath();
    ctx.arc(
      bx + Math.max(-1, Math.min(1, axisX.current.uVel / ssMax)) * 15,
      by + Math.max(-1, Math.min(1, axisY.current.uVel / ssMax)) * 15,
      6,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = HAZE;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx + inp.stickX * 15, by + inp.stickY * 15, 8, 0, Math.PI * 2);
    ctx.strokeStyle = CORAL;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }, [side, params]);

  useGameLoop({
    running: fase === "run",
    onStep: step,
    onFrame: draw,
    onHidden: () => {
      interruptions.current++;
      setFase("pausa");
    },
  });

  // Input global de teclado mientras corre.
  useEffect(() => {
    if (fase !== "run") return;
    const down = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "a", "d", "w", "s"].includes(k)) {
        e.preventDefault();
        input.current.keys.add(k);
        input.current.counts.teclado++;
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      input.current.keys.delete(k);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const inp = input.current;
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      inp.keys.clear();
    };
  }, [fase]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    input.current.pointerId = e.pointerId;
    input.current.originX = e.clientX;
    input.current.originY = e.clientY;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const inp = input.current;
    if (inp.pointerId !== e.pointerId) return;
    const range = side * 0.28;
    inp.stickX = Math.max(-1, Math.min(1, (e.clientX - inp.originX) / range));
    inp.stickY = Math.max(-1, Math.min(1, (e.clientY - inp.originY) / range));
    if (e.pointerType === "touch") inp.counts.touch++;
    else inp.counts.mouse++;
  };
  const releasePointer = () => {
    input.current.pointerId = null;
    input.current.stickX = 0;
    input.current.stickY = 0;
  };

  return (
    <div ref={wrapRef} style={{ maxWidth: 560, margin: "0 auto" }}>
      <GameTopBar
        nombre={`Control · Nivel ${cfg.level}`}
        remainingSec={fase === "countdown" ? cfg.durationSec : remaining}
        onQuit={onQuit}
      />
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: side,
            height: side,
            display: "block",
            margin: "0 auto",
            background: "white",
            border: `1px solid ${NAVY}14`,
            borderRadius: 18,
            touchAction: "none",
            cursor: "crosshair",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
        />
        {fase === "countdown" && <CountdownIntro onDone={() => setFase("run")} />}
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
        Centra ambas agujas · el mando tiene inercia: suelta antes de llegar · ← → ↑ ↓ / WASD
      </p>
    </div>
  );
}
