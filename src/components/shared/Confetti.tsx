/**
 * Confeti ligero en canvas (sin dependencias) para celebrar la oferta especial.
 * Se dibuja una sola ráfaga y se apaga solo; respeta `prefers-reduced-motion`.
 */
import { useEffect, useRef } from "react";

interface Pieza {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
}

const COLORES = ["#6C0820", "#A31637", "#F2AEBC", "#E8C97A", "#FFFFFF", "#3D5A80"];

export function Confetti({ count = 140, duration = 4200 }: { count?: number; duration?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const piezas: Pieza[] = Array.from({ length: count }, () => ({
      x: Math.random() * W(),
      y: -20 - Math.random() * window.innerHeight * 0.5,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 2 + Math.random() * 3.4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      w: 6 + Math.random() * 6,
      h: 9 + Math.random() * 8,
      color: COLORES[Math.floor(Math.random() * COLORES.length)]!,
    }));

    const inicio = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const vida = t - inicio;
      const alpha = vida > duration - 800 ? Math.max(0, (duration - vida) / 800) : 1;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalAlpha = alpha;
      for (const p of piezas) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.rot += p.vr;
        if (p.y > window.innerHeight + 30) {
          p.y = -20;
          p.x = Math.random() * W();
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (vida < duration) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, duration]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10000,
      }}
    />
  );
}
