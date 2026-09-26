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
import { mulberry32 } from "@/modules/compass/rng";
import { classifyInput, useGameLoop } from "./use-game-loop";
import { drawPlane } from "./sprites";
import { CountdownIntro, GameHint, GameTopBar, PauseOverlay, AMBER, GOLD, GREEN, RED } from "./ui";

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

/** Colores de cabina para los avisos que emite la simulación. */
const FLASH_COLOR: Record<string, string> = { "✓": GREEN, ROCE: AMBER, FALLO: RED, MURO: RED };

const HUD_FONT = "'Geist Mono', 'JetBrains Mono', monospace";

/** Punto de luz con halo (luces de ciudad y de carretera). */
function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Terreno nocturno visto desde arriba: parcelas, un río, carreteras con
 * alumbrado y pueblos iluminados. El mosaico empata arriba con abajo para
 * poder desplazarse sin costuras.
 */
function paintTerrain(ctx: CanvasRenderingContext2D, w: number, H: number, seed: number) {
  const rand = mulberry32(seed);
  const base = ctx.createLinearGradient(0, 0, w, 0);
  base.addColorStop(0, "#050d16");
  base.addColorStop(0.5, "#0a1824");
  base.addColorStop(1, "#050d16");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, H);

  // Repite lo que cruza el borde para que el mosaico empate.
  const wrap = (y: number, ext: number, fn: (dy: number) => void) => {
    fn(0);
    if (y - ext < 0) fn(H);
    if (y + ext > H) fn(-H);
  };

  const tonos = [
    "rgba(30,62,50,.5)",
    "rgba(44,56,38,.45)",
    "rgba(24,46,64,.45)",
    "rgba(52,46,34,.4)",
  ];
  for (let i = 0; i < 30; i++) {
    const fw = 40 + rand() * 120;
    const fh = 30 + rand() * 100;
    const x = rand() * w;
    const y = rand() * H;
    const rot = (rand() - 0.5) * 0.5;
    const tono = tonos[Math.floor(rand() * tonos.length)];
    wrap(y, Math.max(fw, fh), (dy) => {
      ctx.save();
      ctx.translate(x, y + dy);
      ctx.rotate(rot);
      ctx.fillStyle = tono;
      ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
      ctx.strokeStyle = "rgba(0,0,0,.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
      ctx.restore();
    });
  }

  // Río: senos con periodo H, así x(0) = x(H).
  const x0 = w * (0.25 + rand() * 0.5);
  const fase = rand() * Math.PI * 2;
  ctx.beginPath();
  for (let y = 0; y <= H; y += 6) {
    const x =
      x0 +
      Math.sin((y / H) * Math.PI * 2 + fase) * w * 0.16 +
      Math.sin((y / H) * Math.PI * 6 + fase * 2) * w * 0.05;
    if (y === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#0b2740";
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.strokeStyle = "rgba(143,211,244,.16)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Carreteras en diagonal (nunca paralelas a las puertas) con alumbrado tenue
  for (let i = 0; i < 3; i++) {
    const y = H * 0.25 + rand() * H * 0.5;
    const tilt = (0.45 + rand() * 0.5) * w * (rand() < 0.5 ? -1 : 1);
    ctx.beginPath();
    ctx.moveTo(0, y - tilt / 2);
    ctx.lineTo(w, y + tilt / 2);
    ctx.strokeStyle = "rgba(16,24,36,.95)";
    ctx.lineWidth = 5;
    ctx.stroke();
    for (let t = 0; t <= 1.0001; t += 0.05) {
      glowDot(ctx, t * w, y - tilt / 2 + tilt * t, 0.9, "rgba(255,221,170,.55)");
    }
  }

  // Pueblos iluminados
  for (let k = 0; k < 6; k++) {
    const cx = rand() * w;
    const cy = rand() * H;
    const r = 16 + rand() * 42;
    const n = 26 + Math.floor(rand() * 54);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * r;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d;
      const rr = 0.6 + rand() * 0.9;
      const color = rand() < 0.8 ? "rgba(243,201,105,.9)" : "rgba(220,235,255,.85)";
      wrap(y, 4, (dy) => glowDot(ctx, x, y + dy, rr, color));
    }
  }
}

/** Capa de nubes tenues (va entre el terreno y las puertas). */
function paintClouds(ctx: CanvasRenderingContext2D, w: number, H: number, seed: number) {
  const rand = mulberry32(seed ^ 0x5bd1e995);
  for (let i = 0; i < 10; i++) {
    const x = rand() * w;
    const y = rand() * H;
    const r = 40 + rand() * 90;
    const a = 0.05 + rand() * 0.07;
    const blob = (dy: number) => {
      const g = ctx.createRadialGradient(x, y + dy, 0, x, y + dy, r);
      g.addColorStop(0, `rgba(200,220,245,${a})`);
      g.addColorStop(1, "rgba(200,220,245,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y + dy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(0);
    if (y - r < 0) blob(H);
    if (y + r > H) blob(-H);
  }
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
  // Sólo visual: mosaicos de terreno y nubes, estelas de viento y reloj de frame.
  const layers = useRef<{
    key: string;
    terrain: HTMLCanvasElement;
    clouds: HTMLCanvasElement;
  } | null>(null);
  const streaks = useRef<{ x: number; y0: number; len: number }[]>([]);
  const lastFrame = useRef(0);

  if (gates.current.length === 0) {
    gates.current = buildGates(cfg.seed, cfg.level, cfg.durationSec);
    wind.current = buildCrosswind(cfg.seed, cfg.level);
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.max(280, Math.min(540, el.clientWidth));
      const h = Math.max(380, Math.min(580, Math.round(window.innerHeight * 0.6)));
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
      interactions: Object.values(input.current.counts).reduce((a, b) => a + b, 0),
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
    const now = performance.now();
    const tSec = now / 1000;
    const dtv = lastFrame.current ? Math.min(0.05, (now - lastFrame.current) / 1000) : 0;
    lastFrame.current = now;

    // Mosaicos del paisaje (se generan una vez por tamaño).
    const tileH = Math.round(h * 1.6);
    const key = `${w}|${h}|${dpr}`;
    if (layers.current?.key !== key) {
      const mk = (paint: (c: CanvasRenderingContext2D) => void) => {
        const off = document.createElement("canvas");
        off.width = Math.round(w * dpr);
        off.height = Math.round(tileH * dpr);
        const octx = off.getContext("2d");
        if (octx) {
          octx.setTransform(dpr, 0, 0, dpr, 0, 0);
          paint(octx);
        }
        return off;
      };
      layers.current = {
        key,
        terrain: mk((c) => paintTerrain(c, w, tileH, cfg.seed)),
        clouds: mk((c) => paintClouds(c, w, tileH, cfg.seed)),
      };
      streaks.current = Array.from({ length: 26 }, (_, i) => ({
        x: (i * 0.618) % 1,
        y0: (i * 0.377) % 1,
        len: 18 + ((i * 7) % 26),
      }));
    }
    // Parallax: el terreno (lejos) corre más lento que las puertas.
    const scroll = (layer: HTMLCanvasElement, factor: number) => {
      const off = (s.worldY * unitPx * factor) % tileH;
      for (let y = off - tileH; y < h; y += tileH) ctx.drawImage(layer, 0, y, w, tileH);
    };
    scroll(layers.current.terrain, 0.55);
    scroll(layers.current.clouds, 0.8);

    // Luces de borde del corredor, corriendo con la pista
    const sep = 46;
    const desp = (s.worldY * unitPx) % sep;
    for (let y = desp - sep; y < h + sep; y += sep) {
      for (const x of [5, w - 5]) {
        ctx.fillStyle = "rgba(143,211,244,.18)";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(190,230,255,.85)";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Estelas de viento: se ven más cuanto más empuja.
    const windFrac = params.windAmp > 0 ? s.windNow / params.windAmp : 0;
    const fuerza = Math.min(1, Math.abs(windFrac));
    if (fuerza > 0.06) {
      ctx.strokeStyle = `rgba(210,230,255,${0.08 + fuerza * 0.2})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const st of streaks.current) {
        st.x = (((st.x + windFrac * 0.5 * dtv) % 1) + 1) % 1;
        const sy = ((st.y0 * (h + 60) + s.worldY * unitPx * 1.25) % (h + 60)) - 30;
        const sx = st.x * w;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - Math.sign(windFrac) * st.len * fuerza, sy);
      }
      ctx.stroke();
    }

    // Puertas visibles: vallas de luz desde los muros hasta los pilones.
    ctx.lineCap = "round";
    for (let i = Math.max(0, s.nextGate - 1); i < gates.current.length; i++) {
      const g = gates.current[i];
      const gy = yToPx(g.y);
      if (gy < -30) break;
      if (gy > h + 30) continue;
      const left = toPx(g.center - g.halfWidth);
      const right = toPx(g.center + g.halfWidth);
      const passed = i < s.nextGate;
      const next = i === s.nextGate;
      const color = g.chicane ? RED : GOLD;
      if (passed) {
        ctx.strokeStyle = "rgba(143,163,194,.2)";
        ctx.lineWidth = 2;
      } else {
        ctx.shadowColor = color;
        ctx.shadowBlur = next ? 16 : 9;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
      }
      ctx.beginPath();
      ctx.moveTo(toPx(-1.06), gy);
      ctx.lineTo(left, gy);
      ctx.moveTo(right, gy);
      ctx.lineTo(toPx(1.06), gy);
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (!passed) {
        ctx.strokeStyle = "rgba(255,255,255,.7)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Pilones del vano
      for (const px of [left, right]) {
        if (passed) {
          ctx.fillStyle = "rgba(143,163,194,.3)";
          ctx.beginPath();
          ctx.arc(px, gy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        const halo = ctx.createRadialGradient(px, gy, 0, px, gy, 13);
        halo.addColorStop(0, "#ffffff");
        halo.addColorStop(0.3, color);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, gy, 13, 0, Math.PI * 2);
        ctx.fill();
      }
      // Centro ideal: chevrón verde; la próxima puerta además late.
      if (!passed) {
        const cx = toPx(g.center);
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 6, gy + 3);
        ctx.lineTo(cx, gy - 3);
        ctx.lineTo(cx + 6, gy + 3);
        ctx.stroke();
        if (next) {
          const pulso = (tSec * 1.4) % 1;
          ctx.strokeStyle = `rgba(127,214,164,${0.6 * (1 - pulso)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, gy, 8 + pulso * 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Avisos de resultado
    ctx.textAlign = "center";
    for (const f of s.flashes) {
      const gy = yToPx(f.atY);
      const color = FLASH_COLOR[f.text] ?? f.color;
      ctx.globalAlpha = Math.max(0, f.ttl / 0.9);
      ctx.font = `700 15px ${HUD_FONT}`;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;
      ctx.fillText(f.text, w / 2, gy - 12);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Avión (nariz arriba, banqueo según velocidad lateral)
    const px = toPx(s.planeX);
    const halfW = (PLANE_HALF_WIDTH / 2) * usable;
    drawPlane(ctx, px, planeYpx, halfW * 2.4, Math.max(-0.5, Math.min(0.5, s.velX * 0.55)), tSec);

    // Viñeta
    const vig = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.3, w / 2, h * 0.55, h * 0.85);
    vig.addColorStop(0, "rgba(2,7,15,0)");
    vig.addColorStop(1, "rgba(2,7,15,.6)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Indicador de viento cruzado (arriba-izquierda): hacia dónde te empuja.
    const wx = margin + 50;
    const wy = 30;
    ctx.fillStyle = "rgba(3,10,24,.72)";
    ctx.strokeStyle = "rgba(227,201,138,.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(wx - 46, wy - 22, 92, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = `700 8.5px ${HUD_FONT}`;
    ctx.fillStyle = "rgba(184,197,218,.8)";
    ctx.fillText("VIENTO", wx, wy - 9);
    ctx.strokeStyle = "rgba(143,163,194,.3)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(wx - 34, wy + 3);
    ctx.lineTo(wx + 34, wy + 3);
    ctx.stroke();
    const wlen = windFrac * 30;
    if (Math.abs(wlen) > 2) {
      const dir = Math.sign(wlen);
      ctx.shadowColor = AMBER;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx, wy + 3);
      ctx.lineTo(wx + wlen, wy + 3);
      ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(wx + wlen + dir * 7, wy + 3);
      ctx.lineTo(wx + wlen, wy - 2);
      ctx.lineTo(wx + wlen, wy + 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = "rgba(184,197,218,.7)";
      ctx.beginPath();
      ctx.arc(wx, wy + 3, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, params, cfg.seed]);

  // Pinta la escena también fuera del loop (cuenta regresiva, pausa).
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
    <div>
      <GameTopBar
        nombre={`Slalom · Nivel ${cfg.level}`}
        remainingSec={fase === "countdown" ? cfg.durationSec : remaining}
        progressLabel={`${metrics.current.gatesClean}✓`}
        onQuit={onQuit}
      />
      <div ref={wrapRef} style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="cx-canvas-wrap" style={{ width: size.w }}>
          <canvas
            ref={canvasRef}
            className="cx-canvas"
            style={{ width: size.w, height: size.h }}
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
          Cruza cada puerta por el centro · vigila la flecha de viento · ← → / A D o arrastra
        </GameHint>
      </div>
    </div>
  );
}
