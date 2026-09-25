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
  GameHint,
  GameTopBar,
  PauseOverlay,
  AMBER,
  GOLD,
  GREEN,
  RED,
  SKY,
} from "./ui";

interface Props {
  cfg: CompassRunConfig;
  onFinish: (r: CompassResult) => void;
  onQuit: () => void;
}

const LAMP_FONT = "700 10px 'Geist Mono', 'JetBrains Mono', monospace";

/**
 * Capa fija del indicador (fondo, bisel, marcas, bandas y escala). Se pinta
 * una vez por tamaño en un canvas aparte y cada frame sólo la copia.
 */
function paintDial(ctx: CanvasRenderingContext2D, side: number, band01: number) {
  const c = side / 2;
  const R = side * 0.44;
  const track = R * 0.86;
  const band = band01 * track;

  const bg = ctx.createRadialGradient(c, c * 0.9, side * 0.05, c, c, side * 0.75);
  bg.addColorStop(0, "#0c2446");
  bg.addColorStop(1, "#02070f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, side, side);

  // Bisel metálico
  const bezel = ctx.createLinearGradient(0, 0, side, side);
  bezel.addColorStop(0, "#6a768a");
  bezel.addColorStop(0.45, "#161e2b");
  bezel.addColorStop(1, "#465267");
  ctx.beginPath();
  ctx.arc(c, c, R + side * 0.028, 0, Math.PI * 2);
  ctx.fillStyle = bezel;
  ctx.fill();

  // Carátula
  const face = ctx.createRadialGradient(c, c * 0.82, R * 0.1, c, c, R);
  face.addColorStop(0, "#123361");
  face.addColorStop(1, "#040d1d");
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.fillStyle = face;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.clip();

  // Retícula tenue
  ctx.strokeStyle = "rgba(143,211,244,.06)";
  ctx.lineWidth = 1;
  const paso = track / 4;
  for (let g = -8; g <= 8; g++) {
    ctx.beginPath();
    ctx.moveTo(c + g * paso, c - R);
    ctx.lineTo(c + g * paso, c + R);
    ctx.moveTo(c - R, c + g * paso);
    ctx.lineTo(c + R, c + g * paso);
    ctx.stroke();
  }

  // Banda "centrado": corredor verde en cruz y caja objetivo dorada al centro
  ctx.fillStyle = "rgba(127,214,164,.1)";
  ctx.fillRect(c - band, c - R, band * 2, R * 2);
  ctx.fillRect(c - R, c - band, R * 2, band * 2);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "rgba(127,214,164,.42)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const s of [-1, 1]) {
    ctx.moveTo(c + s * band, c - R);
    ctx.lineTo(c + s * band, c + R);
    ctx.moveTo(c - R, c + s * band);
    ctx.lineTo(c + R, c + s * band);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(227,201,138,.16)";
  ctx.fillRect(c - band, c - band, band * 2, band * 2);
  ctx.strokeStyle = "rgba(227,201,138,.75)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(c - band, c - band, band * 2, band * 2);
  ctx.restore();

  // Marcas perimetrales cada 10°
  for (let d = 0; d < 360; d += 10) {
    const a = (d * Math.PI) / 180;
    const major = d % 30 === 0;
    const r0 = R * (major ? 0.9 : 0.94);
    ctx.beginPath();
    ctx.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0);
    ctx.lineTo(c + Math.sin(a) * R * 0.985, c - Math.cos(a) * R * 0.985);
    ctx.strokeStyle = major ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.22)";
    ctx.lineWidth = major ? 2 : 1;
    ctx.stroke();
  }

  // Escala de puntos (estilo CDI)
  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.lineWidth = 1.4;
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    const off = (i / 4) * track * 0.9;
    ctx.beginPath();
    ctx.arc(c + off, c, 3.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c, c + off, 3.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Referencia central
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(c, c, 10, 0, Math.PI * 2);
  ctx.moveTo(c - 18, c);
  ctx.lineTo(c - 10, c);
  ctx.moveTo(c + 10, c);
  ctx.lineTo(c + 18, c);
  ctx.moveTo(c, c - 18);
  ctx.lineTo(c, c - 10);
  ctx.moveTo(c, c + 10);
  ctx.lineTo(c, c + 18);
  ctx.stroke();

  // Sombra interior del bisel y reflejo del cristal
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,.55)";
  ctx.lineWidth = 6;
  ctx.stroke();
  const glass = ctx.createLinearGradient(0, c - R, 0, c);
  glass.addColorStop(0, "rgba(255,255,255,.055)");
  glass.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  ctx.translate(c - R * 0.18, c - R * 0.48);
  ctx.rotate(-0.4);
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 0.72, R * 0.32, 0, 0, Math.PI * 2);
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.restore();
}

/** Lámpara anunciadora ("LOC", "G/S"): encendida en verde cuando el eje está en banda. */
function paintLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  on: boolean,
) {
  const w = 46;
  const h = 20;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 5);
  ctx.fillStyle = on ? "rgba(127,214,164,.2)" : "rgba(3,10,24,.8)";
  ctx.fill();
  ctx.strokeStyle = on ? "rgba(127,214,164,.8)" : "rgba(143,163,194,.25)";
  ctx.lineWidth = 1;
  if (on) {
    ctx.shadowColor = GREEN;
    ctx.shadowBlur = 12;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = LAMP_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = on ? "#dff7ea" : "rgba(143,163,194,.55)";
  ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
  ctx.restore();
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
  // Sólo visual: capa fija cacheada y estela del punto de cruce.
  const dialLayer = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  const trail = useRef<{ x: number; y: number }[]>([]);

  if (!pertX.current) {
    pertX.current = buildAxisPerturbation(cfg.seed, 0, cfg.level, cfg.durationSec);
    pertY.current = buildAxisPerturbation(cfg.seed, 1, cfg.level, cfg.durationSec);
  }

  // Tamaño responsivo del canvas (cuadrado).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSide(Math.max(260, Math.min(560, el.clientWidth)));
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
    const c = side / 2;
    const R = side * 0.44;
    const track = R * 0.86; // recorrido útil de las agujas

    // Capa fija: se repinta sólo si cambia el tamaño o la banda.
    const key = `${side}|${dpr}|${params.band}`;
    if (dialLayer.current?.key !== key) {
      const off = document.createElement("canvas");
      off.width = side * dpr;
      off.height = side * dpr;
      const octx = off.getContext("2d");
      if (octx) {
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintDial(octx, side, params.band);
      }
      dialLayer.current = { key, canvas: off };
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(dialLayer.current.canvas, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const px = axisX.current.pos;
    const py = axisY.current.pos;
    const nx = c + px * track;
    const ny = c + py * track;
    // Color de cada aguja según su error: en banda, cerca o lejos.
    const tono = (pos: number) =>
      Math.abs(pos) <= params.band ? GREEN : Math.abs(pos) <= params.band * 2.2 ? AMBER : RED;
    const inX = Math.abs(px) <= params.band;
    const inY = Math.abs(py) <= params.band;

    // Estela del punto de cruce
    const tr = trail.current;
    tr.push({ x: nx, y: ny });
    if (tr.length > 22) tr.shift();
    for (let i = 0; i < tr.length - 1; i++) {
      ctx.beginPath();
      ctx.arc(tr[i].x, tr[i].y, 1.5 + (i / tr.length) * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(227,201,138,${((i + 1) / tr.length) * 0.28})`;
      ctx.fill();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, R - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.lineCap = "round";
    const aguja = (x0: number, y0: number, x1: number, y1: number, color: string) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,.75)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };
    // Aguja vertical (error horizontal) y horizontal (error vertical)
    aguja(nx, c - R * 0.88, nx, c + R * 0.88, tono(px));
    aguja(c - R * 0.88, ny, c + R * 0.88, ny, tono(py));
    ctx.restore();

    // Punto de intersección (halo verde con ambos ejes en banda)
    if (inX && inY) {
      ctx.beginPath();
      ctx.arc(nx, ny, 15, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(127,214,164,.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(nx, ny, 7, 0, Math.PI * 2);
    ctx.fillStyle = inX && inY ? GREEN : GOLD;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Anunciadores por eje
    paintLamp(ctx, 14, 14, "LOC", inX);
    paintLamp(ctx, side - 60, 14, "G/S", inY);

    // Stick virtual: deflexión comandada (anillo) y tasa efectiva del mando
    // (punto). La separación entre ambos ES la inercia que hay que anticipar.
    const inp = input.current;
    const bx = side - 44;
    const by = side - 44;
    ctx.beginPath();
    ctx.roundRect(bx - 28, by - 28, 56, 56, 12);
    ctx.fillStyle = "rgba(3,10,24,.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(227,201,138,.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = "rgba(143,163,194,.2)";
    ctx.beginPath();
    ctx.moveTo(bx - 18, by);
    ctx.lineTo(bx + 18, by);
    ctx.moveTo(bx, by - 18);
    ctx.lineTo(bx, by + 18);
    ctx.stroke();
    const ssMax = Math.max(0.4, params.authority / params.damping);
    ctx.beginPath();
    ctx.arc(
      bx + Math.max(-1, Math.min(1, axisX.current.uVel / ssMax)) * 15,
      by + Math.max(-1, Math.min(1, axisY.current.uVel / ssMax)) * 15,
      5.5,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = SKY;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx + inp.stickX * 15, by + inp.stickY * 15, 8.5, 0, Math.PI * 2);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [side, params]);

  // Pinta el indicador también fuera del loop (cuenta regresiva, pausa).
  useEffect(() => {
    if (fase !== "run") draw();
  }, [draw, fase]);

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
    <div>
      <GameTopBar
        nombre={`Control · Nivel ${cfg.level}`}
        remainingSec={fase === "countdown" ? cfg.durationSec : remaining}
        onQuit={onQuit}
      />
      <div ref={wrapRef} style={{ maxWidth: 580, margin: "0 auto" }}>
        <div className="cx-canvas-wrap" style={{ width: side }}>
          <canvas
            ref={canvasRef}
            className="cx-canvas"
            style={{ width: side, height: side, cursor: "crosshair" }}
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
        <GameHint>
          Centra ambas agujas · el mando tiene inercia: suelta antes de llegar · ← → ↑ ↓ / WASD
        </GameHint>
      </div>
    </div>
  );
}
