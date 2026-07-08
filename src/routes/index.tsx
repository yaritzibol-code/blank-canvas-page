import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ═══════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES  (ported from landing/shared.jsx)
   ═══════════════════════════════════════════════════════════════════ */

type IconName =
  | "arrow" | "arrowUp" | "play" | "check" | "spark" | "compass" | "target"
  | "book" | "cards" | "sim" | "chat" | "audio" | "bolt" | "clock" | "flame"
  | "chart" | "shield" | "plane" | "radio" | "grid" | "cal" | "doc" | "user"
  | "bell" | "chevD" | "chevR" | "menu" | "close" | "moon" | "waypoint"
  | "alarm" | "brain" | "heart" | "library";

function Icon({ n, className = "w-5 h-5", sw = 1.6 }: { n: IconName; className?: string; sw?: number }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" {...p} />,
    arrowUp: <path d="M7 17 17 7M9 7h8v8" {...p} />,
    play: <path d="M8 5v14l11-7L8 5z" fill="currentColor" stroke="none" />,
    check: <path d="M5 12l4 4 10-10" {...p} />,
    spark: <path d="M12 3l1.6 5.8L19 11l-5.4 1.6L12 19l-1.6-6.4L5 11l5.4-2.2L12 3z" {...p} />,
    compass: <><circle cx="12" cy="12" r="9" {...p} /><path d="M15 9l-2.2 6L9 16l2-6 4-1z" {...p} /></>,
    target: <><circle cx="12" cy="12" r="8" {...p} /><circle cx="12" cy="12" r="3.4" {...p} /></>,
    book: <path d="M5 5a2 2 0 0 1 2-2h11v15H7a2 2 0 0 0-2 2V5zM7 18h11" {...p} />,
    cards: <><rect x="4" y="7" width="13" height="13" rx="2.5" {...p} /><path d="M8 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" {...p} /></>,
    sim: <><rect x="3" y="4" width="18" height="13" rx="2" {...p} /><path d="M8 21h8M12 17v4" {...p} /></>,
    chat: <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4l-4 4v-4H6a2 2 0 0 1-2-2V6z" {...p} />,
    audio: <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1zM16 8a5 5 0 0 1 0 8" {...p} />,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...p} />,
    clock: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7v5l3.5 2" {...p} /></>,
    flame: <path d="M12 3s4.5 4 4.5 8.5A4.5 4.5 0 1 1 7.5 11.5c0-2 1-3 2-4-1 4 2.5 4 2.5 7.5 0-3.5 4-3.5 4-7.5 0-3.5-4-4-4-4z" {...p} />,
    chart: <path d="M4 19V5M4 19h16M8 16v-4M12 16V9M16 16v-2" {...p} />,
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...p} />,
    plane: <path d="M3.5 13l17-7.5L14 21l-2.5-7L3.5 13z" {...p} />,
    radio: <><circle cx="12" cy="12" r="2.4" {...p} /><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M6 6a8.5 8.5 0 0 0 0 12M18 6a8.5 8.5 0 0 1 0 12" {...p} /></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.4" {...p} /><rect x="13" y="4" width="7" height="7" rx="1.4" {...p} /><rect x="4" y="13" width="7" height="7" rx="1.4" {...p} /><rect x="13" y="13" width="7" height="7" rx="1.4" {...p} /></>,
    cal: <><rect x="4" y="5" width="16" height="16" rx="2.5" {...p} /><path d="M4 9h16M8 3v4M16 3v4" {...p} /></>,
    doc: <path d="M7 3h7l5 5v13H7zM14 3v5h5" {...p} />,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...p} /></>,
    bell: <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" {...p} />,
    chevD: <path d="M6 9l6 6 6-6" {...p} />,
    chevR: <path d="M9 6l6 6-6 6" {...p} />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" {...p} />,
    close: <path d="M6 6l12 12M18 6L6 18" {...p} />,
    moon: <path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z" {...p} />,
    waypoint: <><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...p} /></>,
    alarm: <><circle cx="12" cy="13" r="8" {...p} /><path d="M12 9v4l2.5 2M5 3L2.5 6M19 3l2.5 3M9 21h6" {...p} /></>,
    brain: <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 5 1V4.5A2.5 2.5 0 0 0 9 4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-2 4 3 3 0 0 1-5 1" {...p} />,
    heart: <path d="M12 20s-7-4.3-9.3-8.2C1.2 9 2.3 5.5 5.5 5.1c2-.2 3.4 1 4.5 2.4 1.1-1.4 2.5-2.6 4.5-2.4 3.2.4 4.3 3.9 2.8 6.7C19 15.7 12 20 12 20z" {...p} />,
    library: <path d="M5 4v16M9 4v16M14 6l5 14M5 4h4M14 6l4-1" {...p} />,
  };
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{g[n]}</svg>;
}

function FMark({ size = 30, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center justify-center rounded-xl shrink-0" style={{ width: size, height: size, background: light ? "rgba(255,255,255,0.1)" : "#3D5D91" }}>
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} aria-hidden="true">
        <path d="M7 21V5h10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12.5h7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M15.5 4.5l3.5 1-1 3.5" fill="none" stroke="#F2AEBC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Logo({ light = false, size = 30 }: { light?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <FMark size={size} light={light} />
      <span className={`font-display text-[19px] tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Flight<span className="text-coral-600">Path</span>
      </span>
    </div>
  );
}

type BtnKind = "primary" | "navy" | "light" | "ghost" | "ghostLight" | "soft" | "outlineLight";
function Btn({
  children, kind = "primary", size = "md", icon, iconLeft, className = "", href, to, onClick,
}: {
  children: ReactNode; kind?: BtnKind; size?: "sm" | "md" | "lg";
  icon?: IconName; iconLeft?: IconName; className?: string;
  href?: string; to?: string; onClick?: () => void;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 whitespace-nowrap";
  const sizes = { sm: "h-9 px-4 text-[13px]", md: "h-11 px-5 text-[14px]", lg: "h-[52px] px-7 text-[15px]" };
  const kinds: Record<BtnKind, string> = {
    primary: "bg-coral-600 text-white hover:bg-coral-700 shadow-coral hover:-translate-y-0.5",
    navy: "bg-ink text-white hover:bg-ink-800 shadow-navy hover:-translate-y-0.5",
    light: "bg-white text-ink border border-ink/10 hover:border-ink/25 hover:shadow-card",
    ghost: "text-ink/70 hover:text-ink hover:bg-ink/5",
    ghostLight: "text-white/80 hover:text-white hover:bg-white/10",
    soft: "bg-coral-50 text-coral-700 hover:bg-coral-100",
    outlineLight: "border border-white/25 text-white hover:bg-white hover:text-ink",
  };
  const cls = `${base} ${sizes[size]} ${kinds[kind]} ${className}`;
  const inner = <>{iconLeft && <Icon n={iconLeft} className="w-[18px] h-[18px]" />}{children}{icon && <Icon n={icon} className="w-[18px] h-[18px]" />}</>;
  if (to) return <Link to={to} className={cls} onClick={onClick}>{inner}</Link>;
  if (href) return <a href={href} className={cls} onClick={onClick}>{inner}</a>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] font-bold ${light ? "text-white/55" : "text-haze-500"}`}>
      <span className="w-5 h-px bg-coral-600" />
      {children}
    </span>
  );
}

function Pill({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "coral" | "light" | "live" }) {
  const tones = {
    ink: "border-ink/10 text-ink/65 bg-white/70",
    coral: "border-coral-300/50 text-coral-700 bg-coral-50",
    light: "border-white/15 text-white/75 bg-white/5",
    live: "border-coral-300/50 text-coral-700 bg-coral-50",
  };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function Coord({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <span className={`font-mono text-[10px] tracking-wide ${light ? "text-white/40" : "text-haze-400"}`}>{children}</span>;
}

function PlaneGlyph({ className = "w-5 h-5", style, fill = "currentColor" }: { className?: string; style?: CSSProperties; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path fill={fill} d="M21.5 15.5v-1.6l-7.8-4.9V3.6c0-.95-.77-1.7-1.7-1.7s-1.7.75-1.7 1.7v5.4l-7.8 4.9v1.6l7.8-2.45V18.4l-2.1 1.55v1.45L12 20.3l3.5 1.1v-1.45L13.4 18.4v-4.95l8.1 2.05z" />
    </svg>
  );
}

function PathyBubble({ size = 220, float = true, glow = true, className = "" }: { size?: number; float?: boolean; glow?: boolean; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {glow && <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.28), transparent 70%)", transform: "scale(1.25)", filter: "blur(8px)" }} />}
      <div className={`relative w-full h-full rounded-full overflow-hidden ring-1 ring-ink/10 shadow-navy ${float ? "animate-float-y" : ""}`}>
        <img src="/assets/pathy-cloud.png" alt="Pathy, tu copiloto de estudio" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 40px rgba(10,18,38,0.45)" }} />
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow, title, sub, light = false, center = false, max = "max-w-2xl",
}: { eyebrow: ReactNode; title: ReactNode; sub?: ReactNode; light?: boolean; center?: boolean; max?: string }) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} ${max}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`font-display mt-5 text-4xl lg:text-[52px] leading-[1.02] tracking-tight ${light ? "text-white" : "text-ink"}`}>{title}</h2>
      {sub && <p className={`mt-5 text-[17px] leading-relaxed ${light ? "text-white/65" : "text-ink/55"} ${center ? "mx-auto" : ""} max-w-xl`}>{sub}</p>}
    </div>
  );
}

function AeroBackdrop({ theme = "hueso" }: { theme?: "hueso" | "cherry" | "azul" }) {
  return <div className={`cloudscape cs-${theme} fixed inset-0 -z-10 overflow-hidden pointer-events-none`} aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════════════════════
   PLANES ENGINE  (ported from src/sections/HeroPlanes.jsx)
   ═══════════════════════════════════════════════════════════════════ */

const PLANE_PATH = "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

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
    const cruise = rand(0.4, 1.0);
    const depth = rand(0.5, 1.2);
    return {
      x: rand(0, W), y: rand(0, H),
      vx: Math.cos(a) * cruise, vy: Math.sin(a) * cruise,
      cruise, heading: a, wobble: rand(0, 100), size: depth,
      alpha: 0.32 + (depth - 0.5) * 0.42, trail: [] as { x: number; y: number }[], ring: idx % 6 === 0,
    };
  });
  type P = (typeof planes)[number];

  const mouse = { x: -9999, y: -9999, active: false };
  function pos(e: MouseEvent | TouchEvent) {
    const r = host.getBoundingClientRect();
    const t = "touches" in e ? e.touches[0] : e;
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

  const REPEL = 165, MAXV = 3.2;
  let t = 0, raf = 0;

  function drawPlane(p: P) {
    const ang = Math.atan2(p.vy, p.vx);
    const s = p.size * 1.05;
    ctx!.save(); ctx!.translate(p.x, p.y); ctx!.rotate(ang + Math.PI / 2); ctx!.scale(s, s);
    if (p.ring) {
      ctx!.save(); ctx!.rotate(-(ang + Math.PI / 2));
      ctx!.strokeStyle = `rgba(${color},0.08)`; ctx!.lineWidth = 1 / s;
      for (let r = 14; r <= 40; r += 13) { ctx!.beginPath(); ctx!.arc(0, 0, r, 0, Math.PI * 2); ctx!.stroke(); }
      ctx!.restore();
    }
    ctx!.translate(-12, -12);
    ctx!.fillStyle = `rgba(${color},${p.alpha.toFixed(3)})`;
    ctx!.fill(planePath); ctx!.restore();
  }
  function drawTrail(p: P) {
    if (p.trail.length < 2) return;
    ctx!.save(); ctx!.setLineDash([1.5, 6.5]); ctx!.lineCap = "round"; ctx!.lineWidth = 1.1;
    ctx!.strokeStyle = `rgba(${color},${(p.alpha * 0.42).toFixed(3)})`;
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
      if (d < REPEL && d > 0.01) { const f = 1 - d / REPEL; const push = f * f * 1.2; ax += (dx / d) * push; ay += (dy / d) * push; }
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

// PlaneField — sits behind section content via z-index:-1 + isolation:isolate
function PlaneField({ count = 20, color = "26,35,64" }: { count?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canvas.parentElement) return;
    const host = canvas.parentElement;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.style.isolation = "isolate";
    return runPlanes(canvas, host, count, color);
  }, [count, color]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }} aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════════════════════
   NAV  (landing/sections-top.jsx)
   ═══════════════════════════════════════════════════════════════════ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "glass border-b border-ink/8" : "bg-transparent"}`}>
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 h-[68px] flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-ink/65">
          {["Plataforma", "Simuladores", "Tutor IA", "Precios", "Historias"].map((x) => (
            <a key={x} href="#" className="hover:text-ink transition-colors">{x}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Btn kind="ghost" size="sm" className="hidden md:inline-flex" to="/login">Iniciar sesión</Btn>
          <Btn kind="primary" size="sm" icon="arrow" to="/register">Comenzar gratis</Btn>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={30} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10 items-center">
          {/* LEFT */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">Preparación CIAAC · Edición 2026</span>
            </div>
            <h1 className="font-display mt-6 text-[44px] sm:text-[58px] lg:text-[66px] leading-[0.98] tracking-tight text-ink">
              El sistema de estudio<br className="hidden sm:block" /> que se adapta a ti.
              <span className="block text-coral-600 mt-1">No tú a él.</span>
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-ink/55 max-w-xl leading-relaxed">
              FlightPath aprende cómo estudias y construye tu ruta hacia el examen. Materias, simulador real y un copiloto inteligente que vuela contigo.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">Comenzar gratis</Btn>
              <Btn kind="light" size="lg" iconLeft="play" href="#como-funciona">Ver cómo funciona</Btn>
            </div>
            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-2.5">
                {["#7CA0D8", "#F2AEBC", "#3D5D91", "#0F1A33"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-paper" style={{ background: c }} />
                ))}
              </div>
              <div className="text-[13.5px] text-ink/55 leading-tight">
                <span className="font-bold text-ink">+2,400 pilotos</span> en formación<br />
                <span className="text-haze-500">94% aprueba al primer intento</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative lg:h-[480px] flex items-center justify-center">
            <PathyBubble size={300} className="lg:absolute lg:right-2 lg:top-2" />
            <div className="hidden lg:block absolute left-0 top-6 w-[230px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon n="shield" className="w-3.5 h-3.5 text-coral-400" /> Tu progreso
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.4" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F2AEBC" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="31" />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center font-display text-white text-[15px]">68%</div>
                </div>
                <div className="text-white/70 text-[12.5px] leading-snug">Vas por<br /><span className="text-white font-semibold">muy buen camino.</span></div>
              </div>
            </div>
            <div className="absolute -bottom-2 right-2 lg:right-6 w-[250px] bg-white rounded-2xl p-3.5 shadow-float border border-ink/8 animate-float-y" style={{ animationDelay: "-2s" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-ink grid place-items-center"><Icon n="spark" className="w-3 h-3 text-coral-400" /></span>
                <span className="text-[12px] font-bold text-ink">Pathy</span>
                <span className="ml-auto"><Pill tone="coral"><span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />en vivo</Pill></span>
              </div>
              <p className="text-[12.5px] text-ink/65 leading-snug">
                Hoy toca <span className="text-coral-700 font-semibold">Meteorología</span>. Te preparé una sesión de 15 min — ¿despegamos?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* trust strip */}
      <div className="border-y border-ink/8 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-8 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-haze-400">Confiado por</span>
          {["Aeroméxico Formación", "Volaris Cadetes", "Mayo Aviation", "Cessna Academy", "Pilot.mx"].map((t) => (
            <span key={t} className="font-display text-[15px] text-ink/35 tracking-tight">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COUNTDOWN  — rolling-digit odometer + flight trajectory
   ═══════════════════════════════════════════════════════════════════ */

function Countdown({ show = true }: { show?: boolean }) {
  const target = useRef(Date.now() + (23 * 24 * 3600 + 14 * 3600 + 37 * 60 + 52) * 1000);
  const WINDOW = 90 * 24 * 3600 * 1000;
  const start = useRef(target.current - WINDOW);
  const [t, setT] = useState({ d: 23, h: 14, m: 37, s: 52 });
  const [prog, setProg] = useState(74);
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let diff = Math.max(0, target.current - now);
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      setT({ d, h, m, s });
      const p = (now - start.current) / (target.current - start.current);
      setProg(Math.min(96, Math.max(4, p * 100)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (!show) return null;

  const Digit = ({ d }: { d: number }) => (
    <div className="relative overflow-hidden" style={{ height: "1em", width: "0.62em" }}>
      <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${-d * 10}%)`, transition: "transform 0.75s cubic-bezier(.34,1.32,.42,1)" }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="flex items-center justify-center" style={{ height: "1em" }}>{n}</div>
        ))}
      </div>
    </div>
  );
  const Unit = ({ v, l }: { v: number; l: string }) => {
    const s = String(v).padStart(2, "0");
    return (
      <div className="flex flex-col items-center">
        <div className="flex font-display text-[34px] lg:text-[40px] leading-none tabular-nums tracking-tight text-burgundy" style={{ height: "1em" }}>
          <Digit d={+s[0]} /><Digit d={+s[1]} />
        </div>
        <span className="mt-2.5 text-[10px] uppercase tracking-[0.18em] font-bold text-burgundy/55">{l}</span>
      </div>
    );
  };
  const Sep = () => (
    <div className="flex flex-col gap-1.5 pb-6">
      <span className="w-1 h-1 rounded-full bg-burgundy/35" />
      <span className="w-1 h-1 rounded-full bg-burgundy/35" />
    </div>
  );

  return (
    <section className="relative">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 -mt-8 lg:-mt-12 relative z-20">
        <div className="relative rounded-[28px] border border-burgundy/10 bg-white shadow-lift overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(130% 150% at 100% 0%, rgba(242,220,219,0.6), rgba(255,255,255,0) 55%)" }} />
          <div className="absolute -top-12 right-[14%] w-72 h-44 rounded-full bg-cherry/50 blur-3xl animate-breathe pointer-events-none" />

          <div className="relative px-6 lg:px-10 py-8 lg:py-9 grid lg:grid-cols-[280px_1fr] gap-9 lg:gap-12 items-center">
            <div className="lg:border-r border-burgundy/10 lg:pr-10">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-lapis">
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse-dot" />CIAAC · Edición 2026
              </div>
              <div className="mt-4 flex items-end gap-3">
                <div className="font-display text-[76px] lg:text-[92px] leading-[0.82] tracking-tight text-burgundy">{t.d}</div>
                <div className="pb-2.5">
                  <div className="font-display text-2xl lg:text-3xl text-ink leading-none">días</div>
                  <div className="text-[12.5px] text-ink/45 mt-1.5">para tu examen</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2.5 text-[13.5px] font-medium text-ink/55">
                <span className="w-5 h-px bg-burgundy/50" /> Cada sesión cuenta.
              </div>
            </div>

            <div>
              <div className="relative h-20 px-1">
                <div className="absolute left-0 top-0 text-[10px] uppercase tracking-[0.16em] font-bold text-haze-400">Hoy</div>
                <div className="absolute right-0 top-0 text-right">
                  <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-burgundy">CIAAC</div>
                  <div className="text-[10px] font-mono text-haze-400 mt-0.5">20 jun</div>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-burgundy rounded-full" style={{ width: `calc(${prog}% - 14px)` }} />
                <div className="absolute top-1/2 -translate-y-1/2 h-[2px] animate-flow" style={{ left: `calc(${prog}% + 14px)`, right: 0, backgroundImage: "repeating-linear-gradient(to right, rgba(61,93,145,0.45) 0 5px, transparent 5px 14px)" }} />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-burgundy" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-burgundy ring-4 ring-cherry/40" />
                {[16, 33, 50, 67, 83].map((pos) => (
                  <div key={pos} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                       style={{ left: `${pos}%`, background: pos <= prog ? "#6C0820" : "transparent", border: pos <= prog ? "none" : "1.5px solid rgba(61,93,145,0.4)" }} />
                ))}
                <div className="absolute top-1/2" style={{ left: `${prog}%`, transform: "translate(-50%,-50%)", transition: "left 1s linear" }}>
                  <div className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-burgundy/55 animate-radar" />
                  <div className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-burgundy/45 animate-radar" style={{ animationDelay: "0.6s" }} />
                  <div className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-burgundy/35 animate-radar" style={{ animationDelay: "1.2s" }} />
                  <div className="relative animate-float-y-sm">
                    <div className="absolute inset-0 -m-2 rounded-full bg-burgundy/25 blur-md animate-breathe" />
                    <div className="relative w-10 h-10 rounded-full bg-white shadow-card ring-1 ring-burgundy/10 grid place-items-center">
                      <PlaneGlyph className="w-5 h-5 rotate-90 animate-blink" fill="#6C0820" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-burgundy ring-2 ring-white animate-blink" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-end gap-5 lg:gap-7">
                <Unit v={t.d} l="Días" /><Sep /><Unit v={t.h} l="Horas" /><Sep /><Unit v={t.m} l="Min" /><Sep /><Unit v={t.s} l="Seg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE  (Dashboard cycling through students)
   ═══════════════════════════════════════════════════════════════════ */

function Showcase() {
  const students = [
    { name: "Andre", init: "AS", prog: 68, missMin: 45, missDone: 20, subj: "Meteorología", desc: "Formación de nubes y fenómenos", time: "Hoy · 7:00 PM", sim: "Navegación VOR", focus: "Meteorología", streak: 14, acc: 74 },
    { name: "María", init: "MG", prog: 42, missMin: 60, missDone: 38, subj: "Aerodinámica", desc: "Sustentación y resistencia", time: "Hoy · 9:00 PM", sim: "Aproximación ILS", focus: "Aerodinámica", streak: 8, acc: 81 },
    { name: "Diego", init: "DR", prog: 85, missMin: 30, missDone: 30, subj: "Navegación", desc: "Cartas y radioayudas", time: "Mañana · 6:00 AM", sim: "Ruta VFR", focus: "Reglamentación", streak: 23, acc: 88 },
    { name: "Sofía", init: "SP", prog: 57, missMin: 45, missDone: 12, subj: "Reglamentación", desc: "Espacio aéreo y reglas", time: "Hoy · 8:30 PM", sim: "Emergencias", focus: "Sistemas", streak: 5, acc: 69 },
  ];
  const [si, setSi] = useState(0);
  const [scan, setScan] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setScan(true);
      setTimeout(() => setSi((v) => (v + 1) % students.length), 1100);
      setTimeout(() => setScan(false), 1550);
    }, 7200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const s = students[si];
  const C = 97.4;
  const Fade = ({ k, children, className = "" }: { k: ReactNode; children: ReactNode; className?: string }) => (
    <span key={String(k)} className={`inline-block ${className}`} style={{ animation: "softIn 0.85s ease both" }}>{children}</span>
  );

  return (
    <section className="relative py-24 lg:py-32" id="como-funciona">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <SectionHead center eyebrow="Tu cabina de estudio"
          title={<>Todo tu vuelo, <span className="text-coral-600">en un panel.</span></>}
          sub="Una sola vista calma y clara: qué estudiar hoy, cuánto avanzas y qué te falta para el CIAAC. Sin ruido, sin pestañas abiertas en cinco apps." />
        <div className="mt-7 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-burgundy/15 bg-white/70 backdrop-blur px-4 py-2 shadow-card">
            <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-burgundy animate-ping" /><span className="relative w-2 h-2 rounded-full bg-burgundy" /></span>
            <span className="text-[12.5px] font-semibold text-ink/70">Análisis personalizado para cada alumno —</span>
            <Fade k={s.name} className="text-[12.5px] font-bold text-burgundy">{s.name}</Fade>
          </div>
        </div>

        <div className="mt-8 relative rounded-[28px] border border-ink/8 bg-white/70 backdrop-blur-sm shadow-lift p-4 lg:p-6 overflow-hidden">
          <div className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 ${scan ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute inset-y-0 w-1/3" style={{ background: "linear-gradient(90deg, transparent, rgba(90,134,203,0.14), transparent)", animation: scan ? "scanSweep 1.4s ease-in-out" : "none" }} />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-ink text-white px-3.5 py-1.5 text-[11.5px] font-semibold shadow-navy">
              <span className="w-1.5 h-1.5 rounded-full bg-cherry animate-pulse-dot" /> Analizando perfil de {students[(si) % students.length].name}…
            </div>
          </div>

          <div className="flex items-center justify-between px-2 lg:px-3 py-2 mb-4">
            <div className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="hidden sm:inline text-[12px] text-ink/40 font-mono">/ <Fade k={s.name}>{s.name.toLowerCase()}</Fade></span>
            </div>
            <div className="flex items-center gap-4">
              <Coord>HDG 047° · GS 142kt</Coord>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-haze-100 grid place-items-center text-ink/50"><Icon n="bell" className="w-4 h-4" /></span>
                <span className="w-8 h-8 rounded-full bg-ink grid place-items-center text-white text-[12px] font-bold font-display"><Fade k={s.init}>{s.init}</Fade></span>
              </div>
            </div>
          </div>

          <div className="px-2 lg:px-3 mb-5">
            <h3 className="font-display text-3xl lg:text-4xl tracking-tight text-ink">¡Hola, <Fade k={s.name} className="text-burgundy">{s.name}</Fade>!</h3>
            <p className="text-[15px] text-ink/50 mt-1">Tu ruta se recalcula con cada sesión — esto es lo que te toca hoy.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:row-span-2 relative overflow-hidden rounded-2xl bg-ink p-6 shadow-navy hover-lift">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(124,160,216,0.22), transparent)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-bold mb-7">
                  <Icon n="shield" className="w-4 h-4 text-coral-400" /> Tu progreso general
                </div>
                <div className="flex items-center justify-center my-2">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2.8" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F2AEBC" strokeWidth="2.8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - s.prog / 100)} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[42px] leading-none text-white"><Fade k={s.prog}>{s.prog}%</Fade></div>
                        <div className="text-[11px] text-white/45 uppercase tracking-[0.15em] mt-1">completado</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-bold">Racha</div>
                    <div className="font-display text-xl text-white"><Fade k={s.streak}>{s.streak}</Fade> <span className="text-[12px] text-white/55">días</span></div>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-bold">Aciertos</div>
                    <div className="font-display text-xl text-white"><Fade k={s.acc}>{s.acc}%</Fade></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-white border border-ink/8 p-6 shadow-card hover-lift">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                    <Icon n="target" className="w-4 h-4 text-coral-600" /> Misión del día · personalizada
                  </div>
                  <p className="text-[14px] text-ink/55">Hoy enfócate en</p>
                  <div className="font-display text-3xl text-coral-600 tracking-tight my-0.5"><Fade k={s.focus}>{s.focus}</Fade></div>
                  <p className="text-[13.5px] text-ink/50">Tu punto más débil esta semana. {s.missMin} min recomendados.</p>
                  <div className="mt-5">
                    <div className="flex justify-between text-[12px] text-ink/45 mb-1.5">
                      <span className="font-mono">{s.missDone} / {s.missMin} min</span><span>{Math.round(s.missDone / s.missMin * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-haze-100 overflow-hidden">
                      <div className="h-full rounded-full bg-coral-600" style={{ width: `${Math.round(s.missDone / s.missMin * 100)}%`, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
                    </div>
                  </div>
                </div>
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-ink grid place-items-center shadow-navy">
                  <Icon n="target" className="w-9 h-9 text-coral-400" sw={1.4} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card hover-lift">
              <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                <Icon n="book" className="w-4 h-4 text-coral-600" /> Próxima sesión
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-haze-100 grid place-items-center text-lapis"><Icon n="compass" className="w-6 h-6" /></div>
                <div>
                  <div className="font-semibold text-ink text-[15px]"><Fade k={s.subj}>{s.subj}</Fade></div>
                  <div className="text-[12.5px] text-ink/45">{s.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[12.5px] text-coral-700 font-medium">
                <Icon n="clock" className="w-3.5 h-3.5" /> {s.time}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-ink/8 p-5 shadow-card hover-lift">
              <div className="flex items-center gap-2 text-haze-500 text-[11px] uppercase tracking-[0.16em] font-bold mb-4">
                <Icon n="plane" className="w-4 h-4 text-coral-600" /> Simulador rápido
              </div>
              <div className="text-[12.5px] text-ink/45">Última sesión</div>
              <div className="font-semibold text-ink text-[15px] mb-4"><Fade k={s.sim}>{s.sim}</Fade></div>
              <Btn kind="soft" size="sm" icon="arrow" className="w-full">Continuar simulador</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════════ */

function Features() {
  const feats: { icon: IconName; t: string; d: string }[] = [
    { icon: "book", t: "12 materias completas", d: "Todo el temario CIAAC, actualizado a la edición vigente." },
    { icon: "cards", t: "5,000+ preguntas", d: "Banco con explicación detallada en cada respuesta." },
    { icon: "sim", t: "Simulador oficial", d: "Mismo formato, duración y ponderación que el examen real." },
    { icon: "spark", t: "Tutor IA Yaris", d: "Resuelve dudas al instante, con tu progreso como contexto." },
    { icon: "chart", t: "Análisis inteligente", d: "Detecta tus puntos débiles y reordena tu ruta." },
    { icon: "audio", t: "Audio apuntes", d: "Repasa con tus oídos cuando no puedes con los ojos." },
  ];
  return (
    <section className="relative py-24 lg:py-32">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <SectionHead eyebrow="Plataforma completa" title={<>Todo lo que necesitas,<br /><span className="text-coral-600">en un solo lugar.</span></>} />
          <p className="text-[15px] text-ink/50 max-w-sm leading-relaxed lg:pb-2">
            Diez herramientas integradas en un flujo calmo. Sin fricción entre estudiar, practicar y simular el examen.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feats.map((f, i) => (
            <div key={i} className="group rounded-2xl bg-white border border-ink/8 p-7 shadow-card hover-lift hover:shadow-lift">
              <div className="w-12 h-12 rounded-xl bg-coral-50 grid place-items-center text-coral-600 mb-12 group-hover:bg-coral-600 group-hover:text-white transition-colors">
                <Icon n={f.icon} className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl tracking-tight text-ink">{f.t}</h3>
              <p className="text-[14.5px] text-ink/55 mt-2 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PATHY PHONE + COMPANION
   ═══════════════════════════════════════════════════════════════════ */

function PathyPhone() {
  const msgs: { ic: IconName; t: string; time: string }[] = [
    { ic: "book", t: "Hora de estudiar ✦ Te dejé lista una sesión de 15 min de Meteorología. ¿Despegamos?", time: "7:00 p.m." },
    { ic: "flame", t: "¡No pierdas tu racha de 14 días! Te faltan solo 12 min para cerrar el día.", time: "9:30 p.m." },
    { ic: "chart", t: "Tu análisis de esta semana: subiste 8% en Aerodinámica. ¡Vas increíble, sigue así!", time: "Dom 6:00 p.m." },
    { ic: "plane", t: "Faltan 23 días para tu CIAAC. Hoy toca Navegación — yo te acompaño paso a paso.", time: "6:15 a.m." },
  ];
  const [n, setN] = useState(1);
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (typing) id = setTimeout(() => setTyping(false), 1400);
    else id = setTimeout(() => { setN((v) => (v % msgs.length) + 1); setTyping(true); }, 2400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing]);
  const visible = msgs.slice(Math.max(0, n - 3), n);

  return (
    <div className="relative mx-auto w-[272px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-cherry/25 blur-3xl" />
      <div className="relative rounded-[2.4rem] bg-ink p-2.5 shadow-navy ring-1 ring-white/10">
        <div className="relative rounded-[1.9rem] overflow-hidden h-[486px] flex flex-col" style={{ background: "linear-gradient(180deg,#F2DCDB 0%, #FAEFEE 40%, #EAF0FA 100%)" }}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-ink z-20" />
          <div className="relative z-10 bg-lapis text-white px-3.5 pt-7 pb-3 flex items-center gap-2.5 shadow-md">
            <Icon n="chevD" className="w-4 h-4 rotate-90 text-white/70" />
            <span className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0 bg-ink">
              <img src="/assets/pathy-small.png" alt="Pathy" className="w-full h-full object-cover scale-110" />
            </span>
            <div className="leading-tight">
              <div className="text-[13.5px] font-bold flex items-center gap-1.5">Pathy</div>
              <div className="text-[10.5px] text-white/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cherry animate-pulse-dot" /> tu copiloto · en línea
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-white/70">
              <Icon n="audio" className="w-4 h-4" /><Icon n="radio" className="w-4 h-4" />
            </div>
          </div>
          <div className="relative flex-1 px-3 py-4 flex flex-col justify-end gap-2.5 overflow-hidden">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9.5px] uppercase tracking-[0.16em] font-bold text-ink/35 bg-white/60 rounded-full px-2.5 py-1">Recordatorios de Pathy</div>
            {visible.map((m, i) => (
              <div key={`${n}-${i}`} className="flex items-end gap-2 animate-flip">
                <span className="w-6 h-6 rounded-full bg-burgundy grid place-items-center shrink-0"><Icon n={m.ic} className="w-3 h-3 text-white" sw={2} /></span>
                <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-card">
                  <p className="text-[12.5px] text-ink/85 leading-snug">{m.t}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-ink/35">
                    {m.time}
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-silver" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13l3.5 3.5L11 9" /><path d="M11 16l1 1L22 7" /></svg>
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2 animate-flip">
                <span className="w-6 h-6 rounded-full bg-burgundy grid place-items-center shrink-0"><Icon n="spark" className="w-3 h-3 text-white" /></span>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-3 shadow-card flex items-center gap-1.5">
                  {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-burgundy/55 animate-pulse-dot" style={{ animationDelay: `${d * 0.2}s` }} />)}
                </div>
              </div>
            )}
          </div>
          <div className="relative z-10 px-3 py-2.5 bg-white/70 backdrop-blur flex items-center gap-2">
            <div className="flex-1 h-9 rounded-full bg-white border border-ink/10 flex items-center px-3.5 text-[12px] text-ink/35">Mensaje a Pathy…</div>
            <span className="w-9 h-9 rounded-full bg-burgundy text-white grid place-items-center shrink-0"><Icon n="audio" className="w-4 h-4" /></span>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-burgundy text-white text-[11px] font-bold rounded-full px-2.5 py-1 shadow-coral animate-float-y-sm">1 nuevo</div>
    </div>
  );
}

function Companion() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink shadow-navy">
          <div className="absolute -top-20 -right-16 w-96 h-96 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.18), transparent)" }} />
          <div className="absolute -bottom-24 -left-10 w-96 h-96 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(124,160,216,0.18), transparent)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M-50 480 C 300 540, 700 360, 1100 460 S 1300 520, 1300 480" className="dash-line" stroke="#7CA0D8" strokeOpacity="0.3" strokeWidth="1.5" fill="none" />
          </svg>
          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-14">
            <div>
              <Eyebrow light>Pathy · tu copiloto</Eyebrow>
              <h2 className="font-display mt-5 text-4xl lg:text-[52px] leading-[1.02] tracking-tight text-white">
                Pathy te cuida.<br /><span className="text-coral-400">Aunque cierres la app.</span>
              </h2>
              <p className="mt-5 text-[17px] text-white/65 leading-relaxed max-w-md">
                Pathy te escribe al teléfono en el momento justo: que es hora de estudiar, que no pierdas tu racha, o tu análisis de la semana. Recordatorios cálidos — nunca presión.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3.5 max-w-md">
                {["“Es hora de estudiar” a tu hora ideal", "Te avisa antes de perder la racha", "Tu análisis semanal, en un mensaje", "Cuenta regresiva al CIAAC, sin estrés"].map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-coral-600/20 grid place-items-center shrink-0 mt-0.5"><Icon n="check" className="w-3 h-3 text-coral-400" sw={2.2} /></span>
                    <span className="text-[14px] text-white/80">{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-9">
                <Btn kind="primary" size="lg" icon="arrow" to="/register">Conoce a tu copiloto</Btn>
              </div>
            </div>
            <div className="relative"><PathyPhone /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PATHY EVOLUTION
   ═══════════════════════════════════════════════════════════════════ */

function PathyEvolution() {
  const stages = [
    { name: "Despegando", days: "1–3 días", token: "MISTY ROSE", color: "#F2DCDB", img: "/assets/pathy-1-misty.png", copy: "Todo gran vuelo comienza con un pequeño paso." },
    { name: "En progreso", days: "4–6 días", token: "CHERRY BLOSSOM", color: "#F2AEBC", img: "/assets/pathy-2-pink.png", copy: "¡Vas por buen camino! Sigue así." },
    { name: "En ruta", days: "7–13 días", token: "SILVER LAKE", color: "#5A86CB", img: "/assets/pathy-3-blue.png", copy: "La constancia te está llevando lejos." },
    { name: "Modo piloto", days: "14–30 días", token: "LAPIS LAZULI", color: "#3D5D91", img: "/assets/pathy-4-pilot.png", copy: "¡Eres imparable! Sigue volando alto." },
    { name: "Piloto élite", days: "30+ días", token: "BURGUNDY", color: "#6C0820", img: "/assets/pathy-5-elite.png", copy: "Disciplina, enfoque y pasión. Nivel élite." },
  ];
  const [active, setActive] = useState(3);
  const s = stages[active];
  const Avatar = ({ src, size, scale = 1.32, ring }: { src: string; size: number; scale?: number; ring?: string }) => (
    <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size, boxShadow: "inset 0 0 0 1px rgba(15,26,51,0.06)", outline: ring ? `2px solid ${ring}` : "none", outlineOffset: 3 }}>
      <img src={src} alt="Pathy" className="w-full h-full object-cover" style={{ transform: `scale(${scale})` }} />
    </div>
  );

  return (
    <section className="relative py-24 lg:py-32">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <SectionHead center eyebrow="Conoce a Pathy"
          title={<>Tu copiloto. <span className="text-burgundy">Tu motivación.</span></>}
          sub="Pathy evoluciona contigo: cuanto más constante seas, más alto vuela — y más te anima en cada etapa." />
        <div className="mt-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="w-72 h-72 rounded-full blur-3xl animate-breathe" style={{ background: s.color, opacity: 0.45 }} />
            </div>
            <div className="relative animate-float-y"><Avatar src={s.img} size={300} ring={s.color} /></div>
            <span className="absolute top-6 left-10 text-burgundy text-xl animate-twinkle">✦</span>
            <span className="absolute bottom-12 right-8 text-lapis text-lg animate-twinkle" style={{ animationDelay: ".6s" }}>✦</span>
          </div>
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] font-bold border"
                  style={{ background: s.color + "22", color: s.color, borderColor: s.color + "55" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.token}
            </span>
            <div className="mt-5 font-display text-5xl lg:text-6xl text-ink tracking-tight">{s.name}</div>
            <div className="mt-2 text-burgundy/70 text-[12px] uppercase tracking-[0.2em] font-bold">{s.days} de racha</div>
            <p className="mt-6 text-xl text-ink/70 leading-relaxed max-w-md" style={{ fontStyle: "italic" }}>“{s.copy}”</p>
            <div className="mt-8 flex items-center gap-3">
              <Btn kind="light" size="md" iconLeft="chevD" className="!rounded-full" onClick={() => setActive(Math.max(0, active - 1))}>Anterior</Btn>
              <Btn kind="primary" size="md" icon="arrow" onClick={() => setActive(Math.min(stages.length - 1, active + 1))}>Siguiente nivel</Btn>
            </div>
            <div className="mt-10 grid grid-cols-5 gap-2 sm:gap-3">
              {stages.map((st, i) => {
                const on = i === active;
                return (
                  <button key={i} onClick={() => setActive(i)}
                          className={`group rounded-2xl p-2.5 text-center border transition-all ${on ? "bg-white border-burgundy/25 shadow-card scale-105" : "bg-white/60 border-ink/8 hover:bg-white hover:border-burgundy/20"}`}>
                    <div className="mx-auto" style={{ width: 56 }}>
                      <Avatar src={st.img} size={56} scale={1.3} />
                    </div>
                    <div className={`mt-1.5 text-[10.5px] font-semibold leading-tight ${on ? "text-burgundy" : "text-ink/60"}`}>{st.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   YARIS CHAT
   ═══════════════════════════════════════════════════════════════════ */

function YarisChat() {
  type Scene = { type: string; header: string; title: string; opts?: string[]; correct?: number; reply: { title: string; body: string; ref?: string; tags?: string[] } };
  const scenes: Scene[] = [
    { type: "question", header: "Meteorología · Pregunta 23 de 50", title: "¿Qué fenómeno causa la formación de nubes cumulonimbus?", opts: ["Evaporación", "Convección", "Subsidencia", "Radiación"], correct: 1, reply: { title: "¡Correcto! La respuesta es B) Convección.", body: "El aire cálido asciende, se enfría, se condensa y forma cumulonimbus — responsables de las tormentas eléctricas.", ref: "Meteorología para Pilotos · Cap. 5 · Pág. 142" } },
    { type: "mnemo", header: "Nemotecnia · Antes de cada vuelo", title: "Chequea tu estado con I-M-SAFE", reply: { title: "💡 Nemotecnia: I-M-SAFE", body: "Illness · Medication · Stress · Alcohol · Fatigue · Emotion. Una palabra, seis chequeos antes de despegar.", tags: ["Checklist", "Factor humano"] } },
    { type: "real", header: "Ejemplo de la vida real", title: "Por qué los procedimientos no son opcionales", reply: { title: "🎯 Piénsalo así:", body: "Un procedimiento existe porque alguien aprendió algo por las malas. Seguirlo es respetar esa lección — es tu seguro de vida.", tags: ["Disciplina", "Criterio"] } },
    { type: "support", header: "Apoyo cuando lo necesitas", title: "¿Te sientes abrumada hoy?", reply: { title: "💖 Respira. Tú puedes.", body: "Un mal día de estudio no define tu carrera. Toma 10 minutos, hidrátate y volvemos. Pathy y yo te esperamos aquí.", tags: ["Bienestar", "Pathy contigo"] } },
  ];
  const phaseDur = [1500, 1100, 1100, 3600];
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (phase < 3) setPhase(phase + 1);
      else { setPhase(0); setIdx((idx + 1) % scenes.length); }
    }, phaseDur[phase]);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, playing, idx]);
  useEffect(() => { setPhase(0); }, [idx]);

  const sc = scenes[idx];
  const isQ = sc.type === "question";
  const showPick = phase >= 1, showTyping = phase === 2, showAnswer = phase >= 3;
  const letters = ["A", "B", "C", "D"];
  const bullets: { ic: IconName; t: string }[] = [
    { ic: "book", t: "Cita el libro, capítulo y página exactas." },
    { ic: "brain", t: "Explica con ejemplos de la vida real." },
    { ic: "spark", t: "Usa nemotecnias y mapas mentales." },
    { ic: "target", t: "Tips de estudio personalizados para ti." },
    { ic: "heart", t: "Apoyo emocional cuando más lo necesitas." },
  ];

  return (
    <section className="relative py-24 lg:py-32">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <SectionHead center eyebrow="Conoce a Yaris"
          title={<>Tu tutor IA, <span className="text-burgundy">en acción.</span></>}
          sub="Mira cómo Yaris responde, explica y te acompaña. No es un chatbot — es un copiloto que sabe cómo aprendes." />

        <div className="mt-14 grid lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-14 items-center">
          <div className="relative">
            <div className="absolute -inset-5 rounded-[34px] bg-cherry/30 blur-3xl animate-breathe pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden bg-white border border-burgundy/10 shadow-lift">
              <div className="flex items-center justify-between px-5 py-3 bg-burgundy text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cherry" /><span className="w-2.5 h-2.5 rounded-full bg-cherry/40" /><span className="w-2.5 h-2.5 rounded-full bg-cherry/40" /></div>
                  <div className="text-[11px] uppercase tracking-[0.18em] font-bold flex items-center gap-1.5">
                    <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-cherry animate-ping" /><span className="relative w-2 h-2 rounded-full bg-cherry" /></span>
                    En vivo · Yaris IA
                  </div>
                </div>
                <div className="text-[11px] text-cherry/90 font-medium">Escena {idx + 1}/{scenes.length}</div>
              </div>
              <div className="relative px-5 md:px-7 py-6 md:py-7 min-h-[440px]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-burgundy font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse-dot" />{sc.header}
                </div>
                <div key={`t-${idx}`} className="mt-2.5 font-display text-2xl md:text-[28px] text-ink leading-snug tracking-tight animate-flip">{sc.title}</div>

                {isQ && (
                  <div className="mt-5 grid gap-2.5">
                    {sc.opts!.map((o, i) => {
                      const ok = i === sc.correct, reveal = showPick;
                      const cls = !reveal ? "border-ink/10" : ok ? "border-emerald-500 bg-emerald-50 scale-[1.02]" : "border-ink/8 opacity-40";
                      return (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-500 ${cls}`}>
                          <span className={`shrink-0 w-7 h-7 rounded-lg grid place-items-center text-xs font-bold ${reveal && ok ? "bg-emerald-500 text-white" : "bg-ink/5 text-ink/55"}`}>
                            {reveal && ok ? <Icon n="check" className="w-4 h-4" sw={2.4} /> : letters[i]}
                          </span>
                          <span className="text-[14px] text-ink/85">{o}</span>
                          {!reveal && ok && phase === 0 && <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-burgundy/70 font-bold">cursor →</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {showTyping && (
                  <div className="mt-5 flex items-center gap-3 animate-flip">
                    <div className="w-8 h-8 rounded-full bg-burgundy grid place-items-center text-white text-xs font-bold">Y</div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-misty flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-burgundy/60 animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                  </div>
                )}
                {showAnswer && (
                  <div className="mt-5 flex items-start gap-3 animate-flip">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-burgundy grid place-items-center text-white text-sm font-bold">Y</div>
                    <div className="flex-1 rounded-2xl rounded-bl-sm bg-misty/50 p-4 border border-cherry/40">
                      <div className="text-sm font-bold text-burgundy">{sc.reply.title}</div>
                      <div className="mt-1.5 text-[14px] text-ink/75 leading-relaxed">{sc.reply.body}</div>
                      {sc.reply.ref && (
                        <div className="mt-3 flex items-center gap-2 text-[12px] text-ink/60 bg-white px-3 py-2 rounded-lg border border-ink/8">
                          <Icon n="book" className="w-3.5 h-3.5 text-burgundy" /><span className="font-semibold">Referencia:</span> {sc.reply.ref}
                        </div>
                      )}
                      {sc.reply.tags && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {sc.reply.tags.map((tg) => <span key={tg} className="text-[10px] uppercase tracking-[0.14em] font-bold px-2 py-1 rounded-md bg-cherry/25 text-burgundy">{tg}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-ink/8 bg-misty/30">
                <div className="flex items-center gap-3">
                  <button onClick={() => setPlaying(!playing)} className="w-9 h-9 rounded-full bg-burgundy hover:bg-burgundy-700 text-white grid place-items-center transition-colors">
                    {playing ? <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg> : <Icon n="play" className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 flex items-center gap-1.5">
                    {scenes.map((_, i) => {
                      const on = i === idx, done = i < idx;
                      const pct = on ? (phaseDur.slice(0, phase + 1).reduce((a, b) => a + b, 0) / phaseDur.reduce((a, b) => a + b, 0)) * 100 : done ? 100 : 0;
                      return (
                        <button key={i} onClick={() => { setIdx(i); setPhase(0); }} className="flex-1 h-1.5 rounded-full bg-ink/10 overflow-hidden relative">
                          <div className="absolute inset-y-0 left-0 bg-burgundy transition-all duration-200" style={{ width: `${pct}%` }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink/45">
                  {["Pregunta", "Nemotecnia", "Vida real", "Apoyo"].map((l, i) => (
                    <div key={i} className={`flex-1 text-center ${i === idx ? "text-burgundy font-bold" : ""}`}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-cherry/30 hover:border-cherry hover:shadow-card hover-lift transition-all">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-burgundy text-white grid place-items-center"><Icon n={b.ic} className="w-5 h-5" /></div>
                <div className="text-[14.5px] text-ink/80 leading-relaxed pt-2">{b.t}</div>
              </div>
            ))}
            <div className="pt-2"><Btn kind="primary" size="md" icon="chat" className="w-full" to="/register">Pregúntale a Yaris</Btn></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SIMULATOR
   ═══════════════════════════════════════════════════════════════════ */

function Simulator() {
  return (
    <section className="relative py-24 lg:py-32">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionHead eyebrow="Simulador oficial"
              title={<>El examen real,<br /><span className="text-coral-600">antes del examen.</span></>}
              sub="Mismo formato, misma estructura, misma ponderación que el CIAAC. Si lo dominas aquí, lo dominas allá." />
            <div className="mt-10 grid grid-cols-3 gap-5 max-w-md">
              {[["310", "Preguntas"], ["5h", "Duración"], ["12", "Materias"]].map(([v, l], i) => (
                <div key={i} className="border-t-2 border-coral-100 pt-3">
                  <div className="font-display text-4xl text-ink tracking-tight">{v}</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-haze-500 font-bold mt-1.5">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-9"><Btn kind="navy" size="lg" icon="arrow" to="/simulador">Probar el simulador</Btn></div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px]" style={{ background: "radial-gradient(closest-side, rgba(124,160,216,0.16), transparent)" }} />
            <div className="relative rounded-3xl bg-ink shadow-navy p-6 lg:p-7 border border-white/5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <Coord light>SIM · CIAAC</Coord>
                  <Pill tone="light">Pregunta 47 / 310</Pill>
                </div>
                <div className="flex items-center gap-1.5 text-coral-400 font-mono text-[12px]">
                  <Icon n="clock" className="w-3.5 h-3.5" /> 03:42:17
                </div>
              </div>
              <div className="mt-5">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/40 font-bold mb-3">Reglamento aéreo</div>
                <p className="text-[16px] lg:text-[17px] text-white leading-snug">
                  En vuelo VFR controlado, ¿cuál es la separación vertical mínima sobre obstáculos en zona montañosa?
                </p>
                <div className="mt-5 space-y-2.5">
                  {[
                    ["A", "500 ft sobre el obstáculo en un radio de 600 m", false],
                    ["B", "1,000 ft sobre el obstáculo en un radio de 4 NM", true],
                    ["C", "2,000 ft sobre el obstáculo en un radio de 4 NM", false],
                    ["D", "500 ft sobre el terreno", false],
                  ].map(([l, txt, sel], i) => (
                    <button key={i} className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl border transition-colors ${sel ? "bg-coral-600/15 border-coral-400/60" : "bg-white/[0.03] border-white/10 hover:border-white/25"}`}>
                      <span className={`w-7 h-7 rounded-lg grid place-items-center text-[12px] font-bold font-mono shrink-0 ${sel ? "bg-coral-600 text-white" : "border border-white/20 text-white/55"}`}>{l}</span>
                      <span className="text-[13.5px] text-white/85">{txt}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                  <button className="text-[12.5px] text-white/50 hover:text-white">Marcar para revisar</button>
                  <Btn kind="primary" size="sm" icon="arrow">Siguiente</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════════ */

function Testimonials() {
  const data = [
    { q: "Pasé en mi primer intento con 94. Sabía exactamente en qué fallaba — y por qué.", n: "María Fernanda L.", r: "Piloto comercial · Aeroméxico", c: "#F2AEBC" },
    { q: "Yaris me explicó en 5 minutos lo que mi instructor en dos clases. Y se acuerda de mí.", n: "Diego R.", r: "Cadete · Volaris", c: "#7CA0D8" },
    { q: "El simulador era idéntico al CIAAC. Cuando entré al examen real, ya lo había visto.", n: "Andrés P.", r: "Piloto privado", c: "#3D5D91" },
  ];
  return (
    <section className="relative py-24 lg:py-32">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <SectionHead center eyebrow="Historias reales"
          title={<>Pilotos que ya <span className="text-coral-600">despegaron.</span></>} />
        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {data.map((t, i) => (
            <div key={i} className="rounded-2xl bg-white border border-ink/8 p-7 shadow-card hover-lift flex flex-col">
              <div className="flex gap-1 text-burgundy mb-5">
                {[...Array(5)].map((_, k) => <Icon key={k} n="spark" className="w-4 h-4" sw={1.4} />)}
              </div>
              <p className="font-display text-[20px] leading-[1.3] tracking-tight text-ink flex-1">"{t.q}"</p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-ink/8">
                <div className="w-10 h-10 rounded-full" style={{ background: t.c }} />
                <div>
                  <div className="text-[13.5px] font-bold text-ink">{t.n}</div>
                  <div className="text-[12px] text-ink/50">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════ */

function Pricing() {
  return (
    <section id="precios" className="relative py-24 lg:py-32">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead center eyebrow="Precios"
          title={<>Un plan, <span className="text-coral-600">todo incluido.</span></>}
          sub="Sin niveles ni sorpresas. Acceso completo durante el tiempo que necesites para aprobar. Cancela cuando quieras." />

        <div className="mt-14 grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-white border border-ink/8 p-8 lg:p-10 shadow-card">
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-haze-500">Prueba gratis</div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-6xl tracking-tight text-ink">$0</span>
              <span className="text-ink/45 text-sm">/ 7 días</span>
            </div>
            <p className="text-[14px] text-ink/55 mt-3">Conoce la plataforma sin tarjeta. Acceso completo una semana.</p>
            <Btn kind="light" size="lg" icon="arrow" className="w-full mt-7" to="/register">Empezar prueba</Btn>
            <div className="mt-8 space-y-3">
              {["Acceso a las 12 materias", "100 preguntas del banco", "1 simulación completa"].map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon n="check" className="w-4 h-4 text-haze-400 mt-0.5 shrink-0" sw={2.2} />
                  <span className="text-[14px] text-ink/65">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl bg-ink p-8 lg:p-10 shadow-navy overflow-hidden">
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.20), transparent)" }} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-coral-400">FlightPath Pro</div>
                <Pill tone="light">Más popular</Pill>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-6xl tracking-tight text-white">$890</span>
                <span className="text-white/50 text-sm">MXN / mes</span>
              </div>
              <p className="text-[14px] text-white/60 mt-3">Plataforma completa, simulador ilimitado y tutor IA 24/7.</p>
              <Btn kind="primary" size="lg" icon="arrow" className="w-full mt-7" to="/register">Comenzar ahora</Btn>
              <div className="mt-8 space-y-3">
                {["12 materias + actualizaciones", "5,000+ preguntas con explicación", "Simulador CIAAC ilimitado", "Tutor IA Yaris 24/7 + Pathy", "Garantía: apruebas o te devolvemos"].map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon n="check" className="w-4 h-4 text-coral-400 mt-0.5 shrink-0" sw={2.2} />
                    <span className="text-[14px] text-white/85">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FINAL CTA + FOOTER
   ═══════════════════════════════════════════════════════════════════ */

function FinalCta() {
  return (
    <section className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8"><PathyBubble size={130} /></div>
        <h2 className="font-display text-5xl lg:text-[76px] leading-[0.98] tracking-tight text-ink">
          No es suerte.<br /><span className="text-coral-600">Es preparación.</span>
        </h2>
        <p className="mt-6 text-lg text-ink/55 max-w-xl mx-auto leading-relaxed">
          Únete a 2,400+ pilotos que se prepararon con FlightPath y aprobaron al primer intento.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" to="/register">Comenzar gratis · 7 días</Btn>
          <Btn kind="light" size="lg">Hablar con un asesor</Btn>
        </div>
        <div className="mt-7 text-[12.5px] text-ink/45">
          Sin tarjeta · Cancela cuando quieras · Garantía de aprobación
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-16 pb-9">
        <div className="grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 pb-12 border-b border-white/10">
          <div>
            <Logo light size={30} />
            <p className="mt-5 text-[13.5px] text-white/55 leading-relaxed max-w-xs">
              La plataforma de preparación para el CIAAC. Hecha en México por pilotos, para pilotos.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <Coord light>EST. CDMX · 2026</Coord>
            </div>
          </div>
          {[
            { h: "Plataforma", l: ["Materias", "Simulador", "Tutor IA", "Precios"] },
            { h: "Recursos", l: ["Blog", "Guía CIAAC", "Preguntas frecuentes", "Cambios"] },
            { h: "FlightPath", l: ["Sobre nosotros", "Contacto", "Términos", "Privacidad"] },
          ].map((c, i) => (
            <div key={i}>
              <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/40">{c.h}</div>
              <ul className="mt-5 space-y-3">
                {c.l.map((x) => <li key={x}><a href="#" className="text-[13.5px] text-white/70 hover:text-coral-400 transition-colors">{x}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[12px] text-white/40">© 2026 FlightPath. Hecho con cuidado en CDMX.</div>
          <Coord light>v1.0.0 · CIAAC 2026</Coord>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TWEAKS — inline sky-theme switcher (replaces the dev TweaksPanel)
   ═══════════════════════════════════════════════════════════════════ */

type Sky = "hueso" | "cherry" | "azul";
function ThemeSwitcher({ sky, setSky, show, setShow }: { sky: Sky; setSky: (s: Sky) => void; show: boolean; setShow: (s: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50 font-mono text-[11px]">
      {open && (
        <div className="mb-3 w-[260px] rounded-2xl border border-ink/10 bg-white shadow-lift p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-[13px] text-ink">Cielo</span>
            <button onClick={() => setOpen(false)} className="text-ink/50 hover:text-ink"><Icon n="close" className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {(["hueso", "cherry", "azul"] as Sky[]).map((s) => (
              <button key={s} onClick={() => setSky(s)}
                className={`rounded-lg p-2 border transition-all ${sky === s ? "border-coral-600 bg-coral-50 text-coral-700" : "border-ink/10 text-ink/65 hover:border-ink/25"}`}>
                <span className="block w-full h-5 rounded mb-1 border border-ink/8" style={{
                  background: s === "cherry" ? "linear-gradient(180deg,#FBE7EC,#F6D9E1)" : s === "azul" ? "linear-gradient(180deg,#E7EFFB,#DAE6F6)" : "linear-gradient(180deg,#FBFAF7,#F8F7F3)",
                }} />
                <span className="text-[10.5px] font-semibold">{s}</span>
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between gap-3 text-ink/70">
            <span className="text-[12px]">Cuenta regresiva</span>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-coral-600" />
          </label>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-ink text-white shadow-navy grid place-items-center hover:bg-ink-800 transition-colors"
        aria-label="Tema">
        <Icon n="moon" className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════ */

function LandingPage() {
  const [sky, setSky] = useState<Sky>("hueso");
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    document.body.classList.remove("theme-hueso", "theme-cherry", "theme-azul");
    document.body.classList.add("theme-" + sky);
    return () => { document.body.classList.remove("theme-hueso", "theme-cherry", "theme-azul"); };
  }, [sky]);

  return (
    <>
      <AeroBackdrop theme={sky} />
      <Nav />
      <main>
        <Hero />
        <Countdown show={showCountdown} />
        <Showcase />
        <Features />
        <Companion />
        <PathyEvolution />
        <YarisChat />
        <Simulator />
        <Testimonials />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
      <ThemeSwitcher sky={sky} setSky={setSky} show={showCountdown} setShow={setShowCountdown} />
    </>
  );
}
