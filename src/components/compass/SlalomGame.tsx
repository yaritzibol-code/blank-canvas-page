/**
 * Slalom — pursuit tracking por puertas sobre canvas (v2).
 *
 * El corredor acelera durante la sesión, las puertas llegan con separación
 * variable (con chicanes cerradas en niveles 2+) y un viento cruzado lento
 * empuja el avión incluso en recta. El avión responde con inercia al alerón
 * comandado. Paso fijo vía use-game-loop; todo determinista por seed.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildCrosswind,
  buildGates,
  crosswindAt,
  slalomLevel,
  slalomSpeedAt,
  SlalomMetrics,
  PLANE_HALF_WIDTH,
  type CrosswindProfile,
  type SlalomGate,
} from "@/modules/compass/slalom";
import { scoreSlalom } from "@/modules/compass/scoring";
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

interface Flash {
  text: string;
  color: string;
  atY: number;
  ttl: number;
}

export function SlalomGame({ cfg, onFinish, onQuit }: Props) {
  const [fase, setFase] = useState<"countdown" | "run" | "pausa">("countdown");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 420, h: 460 });
  const [remaining, setRemaining] = useState(cfg.durationSec);

  const params = slalomLevel(cfg.level);
  const gates = useRef<SlalomGate[]>([]);
  const wind = useRef<CrosswindProfile | null>(null);
  const sim = useRef({
    worldY: 0,
    planeX: 0,
    velX: 0,
    windNow: 0,
    nextGate: 0,
    done: false,
    wallTouching: false,
    flashes: [] as Flash[],
  });
  const metrics = useRef(new SlalomMetrics());
  const input = useRef({
    u: 0,
    pointerActive: false,
    pointerTargetX: 0,
    keys: new Set<string>(),
    counts: { teclado: 0, mouse: 0, touch: 0 },
  });
  const interruptions = useRef(0);

  if (gates.current.length === 0) {
    gates.current = buildGates(cfg.seed, cfg.level, cfg.durationSec);
    wind.current = buildCrosswind(cfg.seed, cfg.level);
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.max(280, Math.min(520, el.clientWidth));
      const h = Math.max(380, Math.min(560, Math.round(window.innerHeight * 0.55)));
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const finish = useCallback(() => {
    if (sim.current.done) return;
    sim.current.done = true;
    const raw = metrics.current.result();
    const { score, metrics: chips, advice } = scoreSlalom(raw);
    onFinish({
      moduleId: "slalom",
      score,
      metrics: chips,
      raw: { ...raw },
      durationSec: cfg.durationSec,
      input: classifyInput(input.current.counts),
      interruptions: interruptions.current,
      advice,
    });
  }, [cfg.durationSec, onFinish]);

  const step = useCallback(
    (t: number, dt: number) => {
      const s = sim.current;
      if (s.done) return;
      if (t >= cfg.durationSec) {
        finish();
        return;
      }
      const inp = input.current;

      let u = 0;
      if (inp.keys.has("ArrowLeft") || inp.keys.has("a")) u -= 1;
      if (inp.keys.has("ArrowRight") || inp.keys.has("d")) u += 1;
      if (inp.pointerActive) {
        u = Math.max(-1, Math.min(1, (inp.pointerTargetX - s.planeX) * 2.4));
      }
      inp.u = u;

      s.velX += (u * params.accel - params.damping * s.velX) * dt;
      s.windNow = crosswindAt(wind.current!, t);
      s.planeX += (s.velX + s.windNow) * dt;
      if (s.planeX < -1 || s.planeX > 1) {
        s.planeX = Math.max(-1, Math.min(1, s.planeX));
        s.velX = 0;
        // Un golpe por contacto, no por frame: se re-arma al despegarse.
        if (!s.wallTouching) {
          metrics.current.wallHits++;
          s.flashes.push({ text: "MURO", color: "#C24545", atY: s.worldY + 0.4, ttl: 0.8 });
        }
        s.wallTouching = true;
      } else if (Math.abs(s.planeX) < 0.96) {
        s.wallTouching = false;
      }
      metrics.current.stepVelocity(s.velX);

      s.worldY += slalomSpeedAt(cfg.level, t, cfg.durationSec) * dt;

      // Cruce de puertas pendientes.
      while (s.nextGate < gates.current.length && gates.current[s.nextGate].y <= s.worldY) {
        const gate = gates.current[s.nextGate];
        const out = metrics.current.crossGate(s.planeX, gate);
        const outcome = out === "clean" ? "✓" : out === "touch" ? "ROCE" : "FALLO";
        const color = out === "clean" ? "#12B26B" : out === "touch" ? "#C88A00" : "#C24545";
        s.flashes.push({ text: outcome, color, atY: gate.y, ttl: 0.9 });
        s.nextGate++;
      }
      s.flashes.forEach((f) => (f.ttl -= dt));
      s.flashes = s.flashes.filter((f) => f.ttl > 0);

      const rem = Math.ceil(cfg.durationSec - t);
      setRemaining((prev) => (prev !== rem ? rem : prev));
    },
    [cfg.durationSec, cfg.level, params, finish],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { w, h } = size;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const s = sim.current;
    const margin = 14;
    const usable = w - margin * 2;
    const toPx = (x: number) => margin + ((x + 1) / 2) * usable;
    const planeYpx = h * 0.8;
    const unitPx = h * 0.3; // 1 unidad de pista en px
    const yToPx = (gy: number) => planeYpx - (gy - s.worldY) * unitPx;

    // Muros del corredor
    ctx.strokeStyle = `${NAVY}22`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(toPx(-1.06), 0);
    ctx.lineTo(toPx(-1.06), h);
    ctx.moveTo(toPx(1.06), 0);
    ctx.lineTo(toPx(1.06), h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Puertas visibles
    for (let i = Math.max(0, s.nextGate - 1); i < gates.current.length; i++) {
      const g = gates.current[i];
      const gy = yToPx(g.y);
      if (gy < -30) break;
      if (gy > h + 30) continue;
      const left = toPx(g.center - g.halfWidth);
      const right = toPx(g.center + g.halfWidth);
      const passed = i < s.nextGate;
      ctx.strokeStyle = passed ? `${NAVY}26` : g.chicane ? CORAL : NAVY;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      // Postes hacia los muros
      ctx.beginPath();
      ctx.moveTo(toPx(-1.06), gy);
      ctx.lineTo(left, gy);
      ctx.moveTo(right, gy);
      ctx.lineTo(toPx(1.06), gy);
      ctx.stroke();
      // Nodos del vano
      ctx.fillStyle = passed ? `${NAVY}33` : CORAL;
      ctx.beginPath();
      ctx.arc(left, gy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(right, gy, 5, 0, Math.PI * 2);
      ctx.fill();
      // Línea de centro ideal (sutil)
      if (!passed) {
        ctx.fillStyle = `${SALMON}`;
        ctx.beginPath();
        ctx.arc(toPx(g.center), gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Flashes de resultado
    for (const f of s.flashes) {
      const gy = yToPx(f.atY);
      ctx.globalAlpha = Math.max(0, f.ttl / 0.9);
      ctx.fillStyle = f.color;
      ctx.font = `700 13px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(f.text, w / 2, gy - 10);
      ctx.globalAlpha = 1;
    }

    // Indicador de viento cruzado (arriba-izquierda): hacia dónde te empuja.
    const windFrac = params.windAmp > 0 ? s.windNow / params.windAmp : 0;
    const wx = margin + 46;
    const wy = 26;
    ctx.font = `700 9px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = HAZE;
    ctx.fillText("VIENTO", wx, wy - 12);
    ctx.strokeStyle = `${NAVY}22`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(wx - 34, wy);
    ctx.lineTo(wx + 34, wy);
    ctx.stroke();
    const wlen = windFrac * 30;
    if (Math.abs(wlen) > 2) {
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + wlen, wy);
      ctx.stroke();
      const dir = Math.sign(wlen);
      ctx.fillStyle = CORAL;
      ctx.beginPath();
      ctx.moveTo(wx + wlen + dir * 6, wy);
      ctx.lineTo(wx + wlen, wy - 4);
      ctx.lineTo(wx + wlen, wy + 4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = `${NAVY}55`;
      ctx.beginPath();
      ctx.arc(wx, wy, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Avión (nariz arriba, banqueo según velocidad lateral)
    const px = toPx(s.planeX);
    const halfW = (PLANE_HALF_WIDTH / 2) * usable;
    ctx.save();
    ctx.translate(px, planeYpx);
    ctx.rotate(Math.max(-0.5, Math.min(0.5, s.velX * 0.55)));
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.moveTo(0, -halfW * 2.6);
    ctx.lineTo(halfW * 2.4, halfW * 1.6);
    ctx.lineTo(0, halfW * 0.7);
    ctx.lineTo(-halfW * 2.4, halfW * 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [size, params]);

  useGameLoop({
    running: fase === "run",
    onStep: step,
    onFrame: draw,
    onHidden: () => {
      interruptions.current++;
      setFase("pausa");
    },
  });

  useEffect(() => {
    if (fase !== "run") return;
    const down = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(k)) {
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

  const pointerToLogical = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const margin = 14;
    const usable = rect.width - margin * 2;
    return Math.max(-1, Math.min(1, ((e.clientX - rect.left - margin) / usable) * 2 - 1));
  };
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    input.current.pointerActive = true;
    input.current.pointerTargetX = pointerToLogical(e);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!input.current.pointerActive) return;
    input.current.pointerTargetX = pointerToLogical(e);
    if (e.pointerType === "touch") input.current.counts.touch++;
    else input.current.counts.mouse++;
  };
  const releasePointer = () => {
    input.current.pointerActive = false;
  };

  return (
    <div ref={wrapRef} style={{ maxWidth: 560, margin: "0 auto" }}>
      <GameTopBar
        nombre={`Slalom · Nivel ${cfg.level}`}
        remainingSec={fase === "countdown" ? cfg.durationSec : remaining}
        progressLabel={`${metrics.current.gatesClean}✓`}
        onQuit={onQuit}
      />
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: size.w,
            height: size.h,
            display: "block",
            margin: "0 auto",
            background: "white",
            border: `1px solid ${NAVY}14`,
            borderRadius: 18,
            touchAction: "none",
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
        Cruza cada puerta por el centro · vigila la flecha de viento · ← → / A D o arrastra
      </p>
    </div>
  );
}
