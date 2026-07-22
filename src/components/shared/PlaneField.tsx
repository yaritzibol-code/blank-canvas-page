import { useEffect, useRef } from "react";

const PLANE_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

function runPlanes(canvas: HTMLCanvasElement, host: HTMLElement, count: number, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const planePath = new Path2D(PLANE_PATH);
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const planes = Array.from({ length: count }).map((_, idx) => {
    const a = rand(0, Math.PI * 2);
    const cruise = rand(0.35, 0.85);
    const depth = rand(0.5, 1.1);
    return {
      x: rand(0, W), y: rand(0, H),
      vx: Math.cos(a) * cruise, vy: Math.sin(a) * cruise,
      cruise, heading: a, wobble: rand(0, 100), size: depth,
      alpha: 0.24 + (depth - 0.5) * 0.35, trail: [] as { x: number; y: number }[], ring: idx % 6 === 0,
    };
  });
  type P = (typeof planes)[number];

  const mouse = { x: -9999, y: -9999, active: false };
  function pos(e: MouseEvent | TouchEvent) {
    const r = host.getBoundingClientRect();
    const t = "touches" in e ? e.touches[0] : (e as MouseEvent);
    mouse.x = t.clientX - r.left; mouse.y = t.clientY - r.top; mouse.active = true;
  }
  function clear() { mouse.active = false; mouse.x = -9999; mouse.y = -9999; }
  host.addEventListener("mousemove", pos);
  host.addEventListener("mouseleave", clear);
  host.addEventListener("touchmove", pos, { passive: true });
  host.addEventListener("touchend", clear);
  window.addEventListener("resize", resize);

  let visible = true;
  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { rootMargin: "120px" });
    io.observe(host);
  }

  const REPEL = 140, MAXV = 2.8;
  let t = 0, raf = 0;

  function drawPlane(p: P) {
    const ang = Math.atan2(p.vy, p.vx);
    const s = p.size * 1.0;
    ctx!.save(); ctx!.translate(p.x, p.y); ctx!.rotate(ang + Math.PI / 2); ctx!.scale(s, s);
    if (p.ring) {
      ctx!.save(); ctx!.rotate(-(ang + Math.PI / 2));
      ctx!.strokeStyle = `rgba(${color},0.06)`; ctx!.lineWidth = 1 / s;
      for (let r = 14; r <= 34; r += 12) { ctx!.beginPath(); ctx!.arc(0, 0, r, 0, Math.PI * 2); ctx!.stroke(); }
      ctx!.restore();
    }
    ctx!.translate(-12, -12);
    ctx!.fillStyle = `rgba(${color},${p.alpha.toFixed(3)})`;
    ctx!.fill(planePath); ctx!.restore();
  }
  function drawTrail(p: P) {
    if (p.trail.length < 2) return;
    ctx!.save(); ctx!.setLineDash([1.5, 6.5]); ctx!.lineCap = "round"; ctx!.lineWidth = 1;
    ctx!.strokeStyle = `rgba(${color},${(p.alpha * 0.38).toFixed(3)})`;
    ctx!.beginPath();
    let pen = false;
    for (let i = 0; i < p.trail.length; i++) {
      const pt = p.trail[i];
      if (i > 0) { const pr = p.trail[i - 1]; if (Math.hypot(pt.x - pr.x, pt.y - pr.y) > 90) pen = false; }
      if (!pen) { ctx!.moveTo(pt.x, pt.y); pen = true; } else ctx!.lineTo(pt.x, pt.y);
    }
    ctx!.stroke(); ctx!.restore();
  }
  function update(p: P) {
    const drift = Math.sin(t * 0.006 + p.wobble) * 0.9 + Math.sin(t * 0.013 + p.wobble * 2.1) * 0.5;
    p.heading += drift * 0.012;
    let ax = Math.cos(p.heading) * 0.014; let ay = Math.sin(p.heading) * 0.014;
    if (mouse.active) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < REPEL && d > 0.01) { const f = 1 - d / REPEL; const push = f * f * 1.1; ax += (dx / d) * push; ay += (dy / d) * push; }
    }
    p.vx += ax; p.vy += ay;
    const cur = Math.hypot(p.vx, p.vy) || 0.0001;
    p.vx += (p.vx / cur) * (p.cruise - cur) * 0.05;
    p.vy += (p.vy / cur) * (p.cruise - cur) * 0.05;
    const v = Math.hypot(p.vx, p.vy);
    if (v > MAXV) { p.vx *= MAXV / v; p.vy *= MAXV / v; }
    p.x += p.vx; p.y += p.vy;
    const m = 60;
    if (p.x < -m) p.x = W + m; if (p.x > W + m) p.x = -m;
    if (p.y < -m) p.y = H + m; if (p.y > H + m) p.y = -m;
    if (t % 4 === 0) { p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 44) p.trail.shift(); }
  }
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    t += 1;
    ctx!.clearRect(0, 0, W, H);
    for (let i = 0; i < planes.length; i++) { update(planes[i]); drawTrail(planes[i]); drawPlane(planes[i]); }
  }
  if (prefersReduced) { planes.forEach((p) => { for (let k = 0; k < 24; k++) update(p); drawTrail(p); drawPlane(p); }); }
  else { raf = requestAnimationFrame(frame); }

  return function cleanup() {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    host.removeEventListener("mousemove", pos);
    host.removeEventListener("mouseleave", clear);
    host.removeEventListener("touchmove", pos);
    host.removeEventListener("touchend", clear);
    if (io) io.disconnect();
  };
}

export function PlaneField({ count = 14, color = "34,55,92" }: { count?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canvas.parentElement) return;
    const host = canvas.parentElement;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.style.isolation = "isolate";
    return runPlanes(canvas, host, count, color);
  }, [count, color]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}
