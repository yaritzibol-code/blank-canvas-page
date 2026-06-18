import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ═══════════════════════════════════════════════════════════════════
   PRIMITIVES  (ported from src/primitives.jsx)
   ═══════════════════════════════════════════════════════════════════ */

type IconName =
  | "plane" | "chevron" | "arrow" | "play" | "sparkle" | "heart" | "flame"
  | "check" | "book" | "brain" | "chart" | "clock" | "chat" | "headset"
  | "library" | "sim" | "cards" | "download" | "audio" | "target" | "menu"
  | "close" | "shield" | "bolt" | "user";

function Icon({ name, className = "w-5 h-5", stroke = 1.6 }: { name: IconName; className?: string; stroke?: number }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, ReactNode> = {
    plane: <path d="M3 12l18-7-7 18-2.5-7.5L3 12z" {...p} />,
    chevron: <path d="M9 6l6 6-6 6" {...p} />,
    arrow: <path d="M5 12h14M13 5l7 7-7 7" {...p} />,
    play: <path d="M8 5v14l11-7L8 5z" {...{ ...p, fill: "currentColor" }} />,
    sparkle: <path d="M12 3l1.7 5L18 9.7l-4.3 1.7L12 16l-1.7-4.6L6 9.7l4.3-1.7L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" fill="currentColor" stroke="none" />,
    heart: <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.5-9.5 9-9.5 9z" {...p} />,
    flame: <path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4-1 4 2 4 2 7 0-3 4-3 4-7 0-3-4-4-4-4z" {...p} />,
    check: <path d="M5 12l4 4 10-10" {...p} />,
    book: <path d="M4 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4zM20 4h-7a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h7V4z" {...p} />,
    brain: <path d="M8 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 1 5 3 3 0 0 0 6 0V4a3 3 0 0 0-3 0zM16 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-1 5 3 3 0 0 1-6 0V4a3 3 0 0 1 3 0z" {...p} />,
    chart: <path d="M4 19V5M4 19h16M8 16V11M12 16V8M16 16V13" {...p} />,
    clock: <><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7v5l3 2" {...p} /></>,
    chat: <path d="M21 12a8 8 0 1 0-3.2 6.4L21 21l-1.6-3.6A8 8 0 0 0 21 12z" {...p} />,
    headset: <path d="M4 14v-2a8 8 0 1 1 16 0v2M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2zm16 0a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2z" {...p} />,
    library: <path d="M5 4v16M10 4v16M15 6v14M20 8v12M5 4h5M10 4h5M15 6h5" {...p} />,
    sim: <><rect x="3" y="4" width="18" height="14" rx="2" {...p} /><path d="M8 21h8M12 18v3" {...p} /></>,
    cards: <><rect x="3" y="6" width="14" height="12" rx="2" {...p} /><path d="M7 6V4h14v12h-2" {...p} /></>,
    download: <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" {...p} />,
    audio: <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1zM16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" {...p} />,
    target: <><circle cx="12" cy="12" r="9" {...p} /><circle cx="12" cy="12" r="5" {...p} /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" {...p} />,
    close: <path d="M6 6l12 12M18 6l-12 12" {...p} />,
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...p} />,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...p} />,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M4 21a8 8 0 0 1 16 0" {...p} /></>,
  };
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{paths[name] || null}</svg>;
}

function Logo({ tone = "light", size = "md" }: { tone?: "light" | "dark"; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  const text = tone === "light" ? "text-white" : "text-ink";
  const accent = tone === "light" ? "text-cherry" : "text-burgundy";
  return (
    <div className={`flex items-center gap-2.5 ${sizes[size]} font-semibold tracking-tight ${text}`}>
      <span className="relative inline-block">
        <svg viewBox="0 0 32 32" className="w-7 h-7" aria-hidden="true">
          <path d="M8 27 L8 5 L24 5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M8 16 L19 16" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M5 22 Q14 18 26 8" fill="none" stroke="#6C0820" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M22 6 L28 8 L26 12 Z" fill="#6C0820" />
        </svg>
      </span>
      <span className="leading-none">Flight<span className={accent}>Path</span></span>
    </div>
  );
}

type BtnVariant = "primary" | "rosa" | "ghost" | "ghostDark" | "light" | "outline" | "cherry" | "navy";
function Btn({
  children, variant = "primary", size = "md", className = "", href, to, onClick, icon,
}: {
  children: ReactNode; variant?: BtnVariant; size?: "sm" | "md" | "lg";
  className?: string; href?: string; to?: string; onClick?: () => void; icon?: IconName;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 select-none";
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-5 py-2.5 text-[15px]", lg: "px-7 py-3.5 text-base" };
  const variants: Record<BtnVariant, string> = {
    primary: "bg-gradient-to-r from-cherry-600 to-burgundy text-white hover:from-burgundy hover:to-burgundy-700 hover:-translate-y-0.5 shadow-pop active:translate-y-0",
    rosa: "bg-cherry text-burgundy hover:bg-cherry-400 hover:-translate-y-0.5 shadow-pop",
    ghost: "bg-white/70 text-burgundy border border-burgundy/15 hover:bg-white hover:border-burgundy/40 backdrop-blur",
    ghostDark: "bg-white/5 text-white border border-white/15 hover:bg-white/10 hover:border-white/25 backdrop-blur",
    light: "bg-white text-ink hover:bg-misty-200",
    outline: "border border-ink/15 text-ink hover:border-burgundy hover:text-burgundy",
    cherry: "bg-cherry text-burgundy hover:bg-cherry-400 hover:-translate-y-0.5",
    navy: "bg-lapis text-white hover:bg-lapis-700 hover:-translate-y-0.5",
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const inner = <>{icon && <Icon name={icon} className="w-4 h-4" />}{children}</>;
  if (to) return <Link to={to} className={cls} onClick={onClick}>{inner}</Link>;
  if (href) return <a href={href} className={cls} onClick={onClick}>{inner}</a>;
  return <button className={cls} onClick={onClick}>{inner}</button>;
}

function Eyebrow({ children, tone = "cherry" }: { children: ReactNode; tone?: "cherry" | "navy" | "light" | "dark" }) {
  const tones = {
    cherry: "bg-cherry/20 text-burgundy border-cherry/30",
    navy: "bg-lapis/15 text-lapis border-lapis/20",
    light: "bg-burgundy/10 text-burgundy border-burgundy/15",
    dark: "bg-white/10 text-white/80 border-white/15",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold border ${tones[tone]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow, title, sub, tone = "light", accent, align = "center",
}: {
  eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode;
  tone?: "light" | "dark"; accent?: ReactNode; align?: "center" | "left";
}) {
  const al = align === "center" ? "text-center mx-auto" : "text-left";
  const titleColor = tone === "dark" ? "text-white" : "text-ink";
  const subColor = tone === "dark" ? "text-white/55" : "text-ink/60";
  const ebTone = tone === "dark" ? "dark" : "cherry";
  return (
    <div className={`max-w-2xl ${al} mb-14`}>
      {eyebrow && <div className={align === "center" ? "flex justify-center mb-5" : "mb-5"}><Eyebrow tone={ebTone}>{eyebrow}</Eyebrow></div>}
      <h2 className={`font-display text-4xl md:text-5xl lg:text-[56px] leading-[1.02] tracking-tight ${titleColor} mb-4`}>
        {title}
        {accent && <> <span className="font-serif-italic grad-cherry">{accent}</span></>}
      </h2>
      {sub && <p className={`text-base md:text-lg ${subColor} max-w-xl ${align === "center" ? "mx-auto" : ""}`}>{sub}</p>}
    </div>
  );
}

function Card({ children, className = "", hover = true, tone = "light" }: { children: ReactNode; className?: string; hover?: boolean; tone?: "light" | "dark" }) {
  const base = tone === "dark" ? "bg-white/[0.04] border-white/8" : "bg-white border-ink/8";
  const hov = hover
    ? tone === "dark"
      ? "transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15 hover:-translate-y-1"
      : "transition-all duration-300 hover:border-cherry hover:shadow-soft hover:-translate-y-1"
    : "";
  return <div className={`relative rounded-2xl border ring-soft ${base} ${hov} ${className}`}>{children}</div>;
}

function Stat({ value, label, suffix, tone = "light" }: { value: ReactNode; label: ReactNode; suffix?: ReactNode; tone?: "light" | "dark" }) {
  return (
    <div className="text-center">
      <div className={`font-display text-4xl md:text-5xl leading-none ${tone === "dark" ? "text-white" : "text-ink"}`}>{value}<span className="text-burgundy">{suffix}</span></div>
      <div className={`mt-2 text-[11px] uppercase tracking-[0.18em] ${tone === "dark" ? "text-white/40" : "text-ink/50"}`}>{label}</div>
    </div>
  );
}

type SectionBg = "sky" | "skyDeep" | "cream" | "misty" | "ink" | "deeper" | "navy" | "white";
function Section({
  id, children, className = "", bg = "sky", flip = "", planes = true,
}: { id?: string; children: ReactNode; className?: string; bg?: SectionBg; flip?: string; planes?: boolean }) {
  const bgs: Record<SectionBg, string> = {
    sky: "bg-cielo text-ink", skyDeep: "bg-cielo-deep text-ink", cream: "bg-cream text-ink",
    misty: "bg-misty-200 text-ink", ink: "bg-ink text-white", deeper: "bg-[#0a1126] text-white",
    navy: "bg-lapis text-white", white: "bg-white text-ink",
  };
  return (
    <section id={id} className={`relative ${bgs[bg]} ${className}`}>
      <div className={`sky-layer ${flip}`} aria-hidden="true" />
      {planes && <PlaneField count={18} />}
      {children}
    </section>
  );
}

function FlightArc({ className = "" }: { className?: string }) {
  return (
    <svg className={`flightpath ${className}`} viewBox="0 0 800 200" fill="none" aria-hidden="true">
      <path d="M20 160 Q 200 20 400 100 T 780 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <g transform="translate(770 32) rotate(-15)"><path d="M-8 0 L8 -3 L8 3 Z" fill="currentColor" /></g>
    </svg>
  );
}

function PlaneSprite({ className = "", trail = true, scale = 1 }: { className?: string; trail?: boolean; scale?: number }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden="true" style={{ width: 64 * scale }}>
      {trail && <path d="M0 22 Q 30 28 60 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4" opacity="0.5" fill="none" />}
      <path d="M50 22 L100 14 L108 10 L112 14 L98 20 L100 28 L90 32 L84 24 L72 26 L66 32 L60 30 L62 24 L50 22 Z" fill="currentColor" />
    </svg>
  );
}

function CloudSprite({ className = "", size = 60, opacity = 0.4 }: { className?: string; size?: number; opacity?: number }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden="true" style={{ width: size, opacity }}>
      <path d="M20 50 Q 5 50 5 38 Q 5 26 18 26 Q 20 12 36 12 Q 50 6 60 18 Q 78 14 82 30 Q 96 30 96 42 Q 96 52 84 52 L 22 52 Q 20 50 20 50 Z" fill="currentColor" />
    </svg>
  );
}

function SparkleSprite({ className = "", size = 14 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" style={{ width: size, height: size }}>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
    </svg>
  );
}

function AeroAmbience({
  variant = "navy", density = "medium", planes = true, clouds = true, sparkles = true,
}: { variant?: "navy" | "light"; density?: "light" | "medium" | "dense"; planes?: boolean; clouds?: boolean; sparkles?: boolean }) {
  const isLight = variant === "light";
  const cloudColor = isLight ? "text-white" : "text-white/15";
  const planeColor = isLight ? "text-burgundy" : "text-cherry";
  const sparkColor = isLight ? "text-burgundy" : "text-cherry";
  const cloudCount = density === "dense" ? 6 : density === "light" ? 2 : 4;
  const sparkCount = density === "dense" ? 14 : density === "light" ? 5 : 9;

  const cloudConfigs = [
    { top: "14%", size: 90, dur: 42, delay: 0, opacity: isLight ? 0.5 : 0.06, direction: "cloudDrift" },
    { top: "62%", size: 120, dur: 60, delay: -12, opacity: isLight ? 0.4 : 0.05, direction: "cloudDriftBack" },
    { top: "34%", size: 70, dur: 48, delay: -8, opacity: isLight ? 0.45 : 0.07, direction: "cloudDrift" },
    { top: "78%", size: 60, dur: 52, delay: -22, opacity: isLight ? 0.35 : 0.04, direction: "cloudDriftBack" },
    { top: "4%", size: 50, dur: 36, delay: -30, opacity: isLight ? 0.3 : 0.05, direction: "cloudDrift" },
    { top: "48%", size: 100, dur: 70, delay: -40, opacity: isLight ? 0.3 : 0.04, direction: "cloudDriftBack" },
  ].slice(0, cloudCount);

  const sparkConfigs = Array.from({ length: sparkCount }).map((_, i) => {
    const seed = ((i * 9301 + 49297) % 233280) / 233280;
    return {
      top: `${10 + Number((seed * 75).toFixed(0))}%`,
      left: `${((i * 137) % 95) + 2}%`,
      size: 6 + Math.round(seed * 8),
      delay: -Number((seed * 3).toFixed(2)),
      duration: 2 + Number((seed * 2).toFixed(2)),
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds && cloudConfigs.map((c, i) => (
        <div key={`c${i}`} className={`absolute ${cloudColor}`} style={{ top: c.top, animation: `${c.direction} ${c.dur}s linear ${c.delay}s infinite` }}>
          <CloudSprite size={c.size} opacity={c.opacity} />
        </div>
      ))}
      {sparkles && sparkConfigs.map((s, i) => (
        <div key={`s${i}`} className={`absolute ${sparkColor}`} style={{ top: s.top, left: s.left, animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite` }}>
          <SparkleSprite size={s.size} />
        </div>
      ))}
      {planes && (
        <>
          <div className={`absolute ${planeColor}`} style={{ top: "18%", animation: "planeCross 24s linear -4s infinite" }}><PlaneSprite scale={0.8} /></div>
          <div className={`absolute ${planeColor} opacity-70`} style={{ top: "68%", animation: "planeCrossSlow 36s linear -18s infinite" }}><PlaneSprite scale={0.6} /></div>
        </>
      )}
    </div>
  );
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
  type P = (typeof planes)[number];

  function drawPlane(p: P) {
    const ang = Math.atan2(p.vy, p.vx);
    const s = p.size * 1.05;
    ctx!.save();
    ctx!.translate(p.x, p.y);
    ctx!.rotate(ang + Math.PI / 2);
    ctx!.scale(s, s);
    if (p.ring) {
      ctx!.save();
      ctx!.rotate(-(ang + Math.PI / 2));
      ctx!.strokeStyle = `rgba(${color},0.08)`;
      ctx!.lineWidth = 1 / s;
      for (let r = 14; r <= 40; r += 13) { ctx!.beginPath(); ctx!.arc(0, 0, r, 0, Math.PI * 2); ctx!.stroke(); }
      ctx!.restore();
    }
    ctx!.translate(-12, -12);
    ctx!.fillStyle = `rgba(${color},${p.alpha.toFixed(3)})`;
    ctx!.fill(planePath);
    ctx!.restore();
  }

  function drawTrail(p: P) {
    if (p.trail.length < 2) return;
    ctx!.save();
    ctx!.setLineDash([1.5, 6.5]); ctx!.lineCap = "round"; ctx!.lineWidth = 1.1;
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
    let ax = Math.cos(p.heading) * 0.014;
    let ay = Math.sin(p.heading) * 0.014;
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

  if (prefersReduced) {
    planes.forEach((p) => { for (let k = 0; k < 24; k++) update(p); drawTrail(p); drawPlane(p); });
  } else {
    raf = requestAnimationFrame(frame);
  }

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

function HeroPlanes({ count = 30, color = "26,35,64" }: { count?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canvas.parentElement) return;
    return runPlanes(canvas, canvas.parentElement, count, color);
  }, [count, color]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} aria-hidden="true" />;
}

// Per-section plane fleet — sits above the sky-layer, below content.
function PlaneField({ count = 18, color = "26,35,64" }: { count?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canvas.parentElement) return;
    return runPlanes(canvas, canvas.parentElement, count, color);
  }, [count, color]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════════════════════
   SECTIONS
   ═══════════════════════════════════════════════════════════════════ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { label: "Inicio", href: "#inicio" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Materias", href: "#features" },
    { label: "Precios", href: "#precios" },
    { label: "Sobre nosotros", href: "#footer" },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={`flex items-center justify-between rounded-2xl border transition-all duration-300 px-4 lg:px-6 py-3 ${scrolled ? "bg-white/75 border-burgundy/10 backdrop-blur-xl shadow-soft" : "bg-white/40 border-white/30 backdrop-blur-md"}`}>
          <a href="#inicio" className="flex items-center"><Logo tone="dark" /></a>
          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink/70 hover:text-burgundy transition-colors relative group font-medium">
                {l.label}
                <span className="absolute -bottom-1.5 left-0 right-0 mx-auto h-px w-0 bg-burgundy group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <Btn variant="ghost" size="sm" to="/login">Iniciar sesión</Btn>
            <Btn variant="primary" size="sm" icon="arrow" to="/register">Comenzar gratis</Btn>
          </div>
          <button onClick={() => setOpen(!open)} className="lg:hidden text-burgundy p-2" aria-label="Menú">
            <Icon name={open ? "close" : "menu"} className="w-6 h-6" />
          </button>
        </div>
        {open && (
          <div className="lg:hidden mt-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-burgundy/10 p-5 flex flex-col gap-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-ink/80 border-b border-ink/5 last:border-0 font-medium">{l.label}</a>
            ))}
            <div className="flex gap-2 mt-3">
              <Btn variant="ghost" size="sm" className="flex-1" to="/login">Iniciar sesión</Btn>
              <Btn variant="primary" size="sm" className="flex-1" to="/register">Comenzar gratis</Btn>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Hero({ heroBg = "rose" }: { heroBg?: "navy" | "rose" | "cielo" }) {
  const bgs = { navy: "hero-haze text-white", rose: "bg-cielo text-ink", cielo: "bg-cielo-deep text-ink" };
  const isLight = heroBg !== "navy";
  const pills: [string, IconName][] = [
    ["12 materias", "library"],
    ["Banco de 5,000+ preguntas", "cards"],
    ["Simulador CIAAC real", "sim"],
    ["Tutor IA Yaris 24/7", "chat"],
  ];
  return (
    <section id="inicio" className={`relative overflow-hidden ${bgs[heroBg]} pt-28 lg:pt-32 pb-20 lg:pb-28`}>
      {heroBg === "navy" && <div className="absolute inset-0 bg-stars opacity-80 animate-drift pointer-events-none" />}
      {isLight && <div className="sky-layer" aria-hidden="true" />}
      <AeroAmbience variant={isLight ? "light" : "navy"} density="light" planes={false} clouds={false} sparkles={false} />
      <HeroPlanes count={30} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          {/* LEFT */}
          <div className="relative z-10">
            <Eyebrow tone={isLight ? "cherry" : "dark"}>La plataforma #1 para el CIAAC</Eyebrow>
            <h1 className={`mt-6 font-display text-[44px] sm:text-6xl lg:text-[78px] leading-[1.0] tracking-tight font-semibold ${isLight ? "text-ink" : "text-white"}`}>
              Aprueba el CIAAC<br />con <span className="font-serif-italic text-burgundy">confianza</span>.
            </h1>
            <p className={`mt-7 text-lg lg:text-xl max-w-xl leading-relaxed ${isLight ? "text-ink/70" : "text-white/65"}`}>
              El sistema de estudio interactivo que se adapta a ti, no tú a él. Estudia inteligente, practica con simuladores reales y llega listo al día del examen.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn variant="primary" size="lg" icon="arrow" to="/register">Comenzar gratis</Btn>
              <Btn variant={isLight ? "ghost" : "ghostDark"} size="lg" icon="play" href="#como-funciona">Ver cómo funciona</Btn>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3">
              {pills.map(([label, ic]) => (
                <div key={label} className={`flex items-center gap-2 text-sm font-medium ${isLight ? "text-ink/70" : "text-white/65"}`}>
                  <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${isLight ? "bg-white/70 text-burgundy shadow-sm" : "bg-white/10 text-cherry"}`}>
                    <Icon name={ic} className="w-3.5 h-3.5" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
            <div className={`mt-10 flex items-center gap-4 ${isLight ? "text-ink/65" : "text-white/55"}`}>
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 ${isLight ? "border-white" : "border-ink-800"}`}
                    style={{ background: `linear-gradient(135deg, ${["#F2AEBC", "#5A86CB", "#3D5D91", "#6C0820"][i]} 0%, rgba(255,255,255,0.15) 100%)` }} />
                ))}
              </div>
              <div className="text-sm">
                <div className={isLight ? "text-ink font-semibold" : "text-white"}>+2,400 pilotos en formación</div>
                <div className="text-xs opacity-75">94% aprueba en su primer intento.</div>
              </div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="relative z-10">
            <div className="relative aspect-square max-w-[540px] mx-auto">
              <div className="absolute inset-6 rounded-full bg-cherry/30 blur-3xl" />
              <img src="/assets/pathy-cloud.png" alt="Pathy — tu copiloto de estudio" className="relative z-10 w-full h-full object-contain animate-float drop-shadow-[0_30px_60px_rgba(108,8,32,0.30)]" />
              <div className="absolute -left-4 lg:left-2 top-10 z-20 bg-white text-ink rounded-2xl shadow-lift px-4 py-3 max-w-[220px] animate-floatSm border border-cherry/20">
                <div className="text-[11px] uppercase tracking-[0.16em] text-burgundy font-bold mb-1 flex items-center gap-1">
                  <Icon name="sparkle" className="w-3 h-3" /> Soy Pathy
                </div>
                <div className="text-sm leading-snug">Te ayudaré a mantener tu ruta de estudio hasta el CIAAC.</div>
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white rotate-45 border-r border-b border-cherry/20" />
              </div>
              <div className="absolute -right-2 lg:-right-6 bottom-12 z-20 bg-white border border-burgundy/15 rounded-2xl shadow-lift p-4 w-[210px]">
                <div className="flex items-center gap-2 text-burgundy text-xs uppercase tracking-[0.16em] font-bold">
                  <Icon name="flame" className="w-4 h-4" /> Tu racha
                </div>
                <div className="font-display text-3xl text-burgundy mt-1 font-bold">14 días</div>
                <div className="flex gap-1 mt-2">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <div key={i} className={`flex-1 text-center text-[10px] py-1.5 rounded font-semibold ${i < 6 ? "bg-cherry text-burgundy" : "bg-ink/5 text-ink/30"}`}>{d}</div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-8 left-6 text-burgundy text-2xl animate-twinkle">✦</span>
                <span className="absolute top-32 right-4 text-burgundy/80 text-xl animate-twinkle" style={{ animationDelay: ".6s" }}>✦</span>
                <span className="absolute bottom-24 left-2 text-lapis text-lg animate-twinkle" style={{ animationDelay: ".3s" }}>✦</span>
                <span className="absolute bottom-8 right-16 text-burgundy/60 text-base animate-twinkle" style={{ animationDelay: "1s" }}>✦</span>
                <span className="absolute top-1/2 -left-2 text-lapis/60 text-sm animate-twinkle" style={{ animationDelay: "1.4s" }}>✦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Countdown() {
  const [t, setT] = useState({ d: 52, h: 13, m: 22, s: 47 });
  useEffect(() => {
    const id = setInterval(() => {
      setT((prev) => {
        let { d, h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        if (d < 0) { d = 0; h = 0; m = 0; s = 0; }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const Unit = ({ n, l, isSeconds }: { n: number; l: string; isSeconds?: boolean }) => {
    const padded = String(n).padStart(2, "0");
    return (
      <div className="relative">
        <div className="relative rounded-2xl bg-white border-2 border-burgundy/10 px-4 py-3 min-w-[84px] md:min-w-[104px] shadow-soft">
          <div className="absolute inset-x-3 top-1/2 h-px bg-burgundy/10 pointer-events-none" />
          <div key={isSeconds ? padded : undefined} className={`relative font-display text-[52px] md:text-[64px] text-burgundy leading-none tabular-nums text-center font-bold ${isSeconds ? "animate-flip-in" : ""}`}>{padded}</div>
          <div className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-lapis text-center font-semibold">{l}</div>
        </div>
        {isSeconds && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-burgundy animate-pulse-dot" />}
      </div>
    );
  };
  const Sep = () => (
    <div className="flex flex-col items-center justify-center gap-1.5 px-1 md:px-2 pb-5">
      <span className="w-1.5 h-1.5 rounded-full bg-burgundy/60 animate-pulse-dot" />
      <span className="w-1.5 h-1.5 rounded-full bg-burgundy/60 animate-pulse-dot" style={{ animationDelay: ".3s" }} />
    </div>
  );

  return (
    <div data-sky className="relative overflow-hidden bg-cream py-12 md:py-16">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(rgba(108,8,32,0.08) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute text-white/80" style={{ top: "15%", animation: "cloudDrift 48s linear infinite" }}><CloudSprite size={80} opacity={1} /></div>
        <div className="absolute text-white/60" style={{ top: "55%", animation: "cloudDriftBack 64s linear -20s infinite" }}><CloudSprite size={100} opacity={1} /></div>
      </div>
      <div className="absolute pointer-events-none text-burgundy/70" style={{ top: "12%", animation: "planeCross 22s linear -3s infinite" }}><PlaneSprite scale={0.9} /></div>
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-burgundy/15 shadow-lift p-6 md:p-8 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-burgundy via-cherry to-burgundy" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-cherry/8 to-transparent animate-scanline pointer-events-none" />
          <div className="relative flex flex-wrap items-center justify-between gap-6 md:gap-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute inset-0 rounded-2xl bg-burgundy/20 animate-ring-pulse" />
                <span className="absolute inset-0 rounded-2xl bg-burgundy/15 animate-ring-pulse" style={{ animationDelay: "1s" }} />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-burgundy to-burgundy-900 text-cherry flex items-center justify-center shadow-pop">
                  <Icon name="plane" className="w-6 h-6" stroke={2} />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-burgundy text-cherry text-[10px] uppercase tracking-[0.22em] font-bold mb-2">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-cherry animate-ping" />
                    <span className="relative w-2 h-2 rounded-full bg-cherry" />
                  </span>
                  Urgente · Cuenta regresiva
                </div>
                <div className="font-display text-2xl md:text-3xl text-ink leading-tight font-semibold">
                  Próximo examen <span className="font-serif-italic text-burgundy">CIAAC</span>
                </div>
                <div className="text-xs md:text-sm text-lapis mt-0.5 font-medium">Cada día cuenta. Prepárate con tiempo.</div>
              </div>
            </div>
            <div className="flex items-end gap-1 md:gap-2">
              <Unit n={t.d} l="Días" /><Sep /><Unit n={t.h} l="Horas" /><Sep /><Unit n={t.m} l="Min" /><Sep /><Unit n={t.s} l="Seg" isSeconds />
            </div>
            <Btn variant="primary" size="md" icon="arrow" className="ml-auto md:ml-0" to="/register">Empezar ahora</Btn>
          </div>
          <div className="relative mt-7 h-1.5 rounded-full bg-burgundy/8 overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-burgundy via-cherry-600 to-burgundy" style={{ width: `${Math.min(100, ((90 - t.d) / 90) * 100)}%` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-lapis font-semibold">
            <span>Hoy</span>
            <span className="text-burgundy">{Math.round(((90 - t.d) / 90) * 100)}% del calendario</span>
            <span>Día del examen</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Problems() {
  const items = [
    { icon: "library" as IconName, title: "Material insuficiente", desc: "Los apuntes de las escuelas no siempre cubren el examen real.", word: "insuficiente" },
    { icon: "brain" as IconName, title: "Memorizar sin entender", desc: "Necesitas comprender el por qué de cada respuesta.", word: "entender" },
    { icon: "chart" as IconName, title: "Falta de hábitos", desc: "Sin constancia y seguimiento, se pierde el rumbo.", word: "hábitos" },
  ];
  return (
    <Section bg="cream" flip="fx" className="py-24 lg:py-32 relative overflow-hidden">
      <AeroAmbience variant="light" density="light" planes={false} sparkles={false} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="El problema real" title={<>¿Por qué tantos estudiantes</>} accent="reprueban?" sub="No es por falta de capacidad. Es porque el sistema de estudio no está diseñado para cómo aprende un piloto." tone="light" />
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
          {items.map((it, i) => (
            <Card key={i} className="p-7 group bg-white">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center group-hover:bg-burgundy group-hover:text-white transition-colors">
                  <Icon name={it.icon} className="w-5 h-5" />
                </div>
                <div className="font-display text-2xl text-ink leading-tight">{it.title.replace(it.word, "")}<span className="font-serif-italic text-burgundy">{it.word}</span></div>
              </div>
              <p className="mt-5 text-sm text-ink/65 leading-relaxed">{it.desc}</p>
              <div className="mt-6 h-px bg-gradient-to-r from-burgundy/15 to-transparent" />
              <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-burgundy/60 font-semibold">Problema 0{i + 1}</div>
            </Card>
          ))}
        </div>
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-cherry via-cherry-600 to-burgundy p-8 md:p-10">
          <div className="absolute inset-0 grid-dots opacity-30" />
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow tone="dark">Solución</Eyebrow>
              <div className="mt-3 font-display text-3xl md:text-4xl text-white leading-tight font-semibold">FlightPath <span className="font-serif-italic">resuelve los tres.</span></div>
              <p className="mt-3 text-white/85 leading-relaxed max-w-xl">Estudia inteligente, entiende de verdad y mantén la disciplina con un copiloto que te acompaña cada día.</p>
            </div>
            <Btn variant="light" size="lg" icon="arrow" href="#como-funciona">Conoce el método</Btn>
          </div>
        </div>
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, icon: "book" as IconName, title: "Aprende", desc: "Módulos interactivos que te hacen entender de verdad.", color: "from-cherry to-cherry-600" },
    { n: 2, icon: "cards" as IconName, title: "Practica", desc: "Banco de preguntas con retroalimentación inmediata.", color: "from-cherry-600 to-burgundy" },
    { n: 3, icon: "clock" as IconName, title: "Simula", desc: "Examen real con 310 preguntas y límite de 5 horas.", color: "from-silver to-lapis" },
    { n: 4, icon: "brain" as IconName, title: "Domina", desc: "Análisis personalizado y tutor IA siempre contigo.", color: "from-lapis to-burgundy" },
    { n: 5, icon: "plane" as IconName, title: "Vuela", desc: "Llega con confianza, enfocado y listo para aprobar.", color: "from-burgundy to-burgundy-900" },
  ];
  return (
    <Section bg="sky" id="como-funciona" flip="fxy" className="py-24 lg:py-32 overflow-hidden">
      <AeroAmbience variant="light" density="medium" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Tu ruta de aprendizaje" title="Cómo" accent="funciona" sub="Cinco pasos. Una sola ruta. Todo lo que necesitas para dominar el CIAAC, en orden." tone="light" />
        <div className="relative">
          <svg viewBox="0 0 1200 120" className="absolute inset-x-0 top-12 w-full text-burgundy/30 hidden lg:block" fill="none" aria-hidden="true">
            <path d="M60 80 Q 240 -10 420 60 T 780 50 T 1140 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 8" />
            <g transform="translate(1130 24) rotate(-12)"><path d="M-10 0 L8 -4 L8 4 Z" fill="currentColor" /></g>
          </svg>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 relative">
            {steps.map((s, i) => (
              <div key={i} className="text-center group">
                <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${s.color} text-white shadow-lift group-hover:scale-110 transition-all duration-300`}>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white text-burgundy text-xs font-bold flex items-center justify-center font-display border-2 border-burgundy">{s.n}</div>
                  <Icon name={s.icon} className="w-8 h-8" />
                </div>
                <div className="mt-5 font-display text-2xl text-ink font-semibold">{s.title}</div>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed max-w-[200px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Features() {
  const feats: { icon: IconName; title: string; desc: string }[] = [
    { icon: "library", title: "12 materias", desc: "Curso completo CIAAC." },
    { icon: "cards", title: "Banco de preguntas", desc: "5,000+ con explicación." },
    { icon: "sim", title: "Simulador CIAAC", desc: "310 preguntas · 5 hrs." },
    { icon: "chat", title: "Tutor IA Yaris", desc: "Explica, guía y motiva." },
    { icon: "headset", title: "Pathy copiloto", desc: "Tu compañera de hábitos." },
    { icon: "book", title: "Biblioteca", desc: "Libros oficiales del CIAAC." },
    { icon: "play", title: "Clases grabadas", desc: "Videos por tema y materia." },
    { icon: "audio", title: "Audio apuntes", desc: "Escucha donde quieras." },
    { icon: "bolt", title: "Flashcards", desc: "Memoriza lo importante." },
    { icon: "download", title: "Descargables", desc: "PDFs imprimibles con marca." },
  ];
  return (
    <Section bg="cream" id="features" flip="fy" className="py-24 lg:py-32 relative overflow-hidden">
      <AeroAmbience variant="light" density="light" sparkles={false} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Plataforma completa" title="Todo lo que necesitas," accent="en un solo lugar" sub="Diez herramientas integradas — un solo flujo, ninguna fricción." tone="light" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {feats.map((f, i) => (
            <Card key={i} className="p-5 md:p-6 cursor-pointer bg-white">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cherry to-cherry-600 text-white flex items-center justify-center mb-4 shadow-pop"><Icon name={f.icon} className="w-5 h-5" /></div>
              <div className="text-ink font-semibold text-[15px] leading-tight">{f.title}</div>
              <div className="text-ink/55 text-xs mt-1 leading-relaxed">{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}

function LiveDashboard() {
  const [phase, setPhase] = useState(0);
  const [racha, setRacha] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const materias = [
    { name: "Meteorología", target: 92, color: "#F2AEBC" },
    { name: "Navegación", target: 68, color: "#E0879A" },
    { name: "Reglamentos", target: 85, color: "#5A86CB" },
    { name: "Factor humano", target: 90, color: "#3D5D91" },
    { name: "Performance", target: 73, color: "#6C0820" },
  ];
  const [pcts, setPcts] = useState(materias.map(() => 0));
  useEffect(() => {
    if (phase !== 1) return;
    const start = Date.now();
    const dur = 1800;
    const id = setInterval(() => {
      const tt = Math.min(1, (Date.now() - start) / dur);
      const ease = 1 - Math.pow(1 - tt, 3);
      setRacha(Math.round(14 * ease));
      setProgress(Math.round(72 * ease));
      setScore(Math.round(84 * ease));
      setPcts(materias.map((m) => Math.round(m.target * ease)));
      if (tt >= 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2600);
    const t3 = setTimeout(() => { setPhase(0); setRacha(0); setProgress(0); setScore(0); setPcts(materias.map(() => 0)); }, 7800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 2]);

  const chartPoints = [20, 35, 28, 50, 42, 65, 58, 78, 72, 88];
  const pathD = chartPoints.map((p, i) => { const x = (i / (chartPoints.length - 1)) * 280; const y = 80 - (p / 100) * 70; return `${i === 0 ? "M" : "L"}${x},${y}`; }).join(" ");

  return (
    <Section bg="sky" flip="" className="py-24 lg:py-32 relative overflow-hidden">
      <AeroAmbience variant="light" density="light" planes={false} sparkles={false} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Tu progreso, en vivo" title="Mira cada paso" accent="que te acerca al sueño." sub="Métricas reales, rachas reales, retroalimentación inmediata. Cada estudio cuenta." tone="light" />
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-cherry/40 via-cherry/20 to-silver/20 blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden bg-white border border-burgundy/10 shadow-lift">
              <div className="flex items-center gap-2 px-4 py-3 bg-cream border-b border-ink/8">
                <span className="w-2.5 h-2.5 rounded-full bg-burgundy" />
                <span className="w-2.5 h-2.5 rounded-full bg-burgundy/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-burgundy/30" />
                <div className="ml-3 text-[11px] text-ink/40 font-mono">flightpath.app / dashboard</div>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" /> EN VIVO
                </div>
              </div>
              <div className="p-5 md:p-6 grid grid-cols-12 gap-3">
                <div className="col-span-12 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-burgundy uppercase tracking-[0.18em] font-semibold">Buenos días, Yaris</div>
                    <div className="font-display text-2xl text-ink font-semibold">Vas en una gran ruta ✨</div>
                  </div>
                  <img src="/assets/pathy-small.png" alt="" className="w-14 h-14 object-contain animate-floatSm" />
                </div>
                <div className="col-span-12 sm:col-span-4 rounded-2xl bg-gradient-to-br from-cherry/30 to-cherry/10 border border-cherry/40 p-4 relative overflow-hidden">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-burgundy font-semibold">Progreso general</div>
                  <div className="mt-1 font-display text-4xl text-burgundy tabular-nums font-bold">{progress}%</div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/60 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-burgundy to-cherry rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="absolute top-2 right-2 text-burgundy/60 text-xs animate-twinkle">✦</span>
                </div>
                <div className="col-span-6 sm:col-span-4 rounded-2xl bg-gradient-to-br from-burgundy/15 to-cherry/10 border border-burgundy/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-burgundy font-semibold flex items-center gap-1.5"><Icon name="flame" className="w-3 h-3" /> Racha</div>
                  <div className="mt-1 font-display text-4xl text-burgundy tabular-nums font-bold">{racha} días</div>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className={`flex-1 h-2 rounded transition-all duration-500 ${i < Math.min(7, Math.round(racha / 2)) ? "bg-burgundy" : "bg-burgundy/10"}`} style={{ transitionDelay: `${i * 80}ms` }} />
                    ))}
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-4 rounded-2xl bg-gradient-to-br from-silver/20 to-silver/5 border border-silver/30 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-lapis font-semibold">Último simulador</div>
                  <div className="mt-1 font-display text-4xl text-lapis tabular-nums font-bold">{score}<span className="text-lg text-ink/40">/100</span></div>
                  <div className="mt-3 text-[11px] text-emerald-600 flex items-center gap-1 font-semibold"><Icon name="chart" className="w-3 h-3" /> +12 vs anterior</div>
                </div>
                <div className="col-span-12 sm:col-span-7 rounded-2xl bg-cream border border-ink/8 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-ink/70 font-semibold">Materias</div>
                    <div className="text-[10px] text-burgundy uppercase tracking-[0.18em] font-semibold">Avance</div>
                  </div>
                  <div className="space-y-2.5">
                    {materias.map((m, i) => (
                      <div key={m.name}>
                        <div className="flex justify-between text-[11px] text-ink/70 mb-1"><span>{m.name}</span><span className="tabular-nums text-ink font-semibold">{pcts[i]}%</span></div>
                        <div className="h-1.5 rounded-full bg-ink/8 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pcts[i]}%`, background: m.color, transitionDelay: `${i * 80}ms` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-5 rounded-2xl bg-cream border border-ink/8 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-ink/70 font-semibold">Progreso semanal</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">↑ 18%</div>
                  </div>
                  <svg viewBox="0 0 280 90" className="w-full h-20 overflow-visible">
                    <defs><linearGradient id="chartGradL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2AEBC" stopOpacity="0.6" /><stop offset="1" stopColor="#F2AEBC" stopOpacity="0" /></linearGradient></defs>
                    <path d={`${pathD} L280,80 L0,80 Z`} fill="url(#chartGradL)" opacity={phase >= 1 ? 1 : 0} style={{ transition: "opacity 1s 0.6s" }} />
                    <path d={pathD} fill="none" stroke="#6C0820" strokeWidth="2" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={phase >= 1 ? 0 : 600} style={{ transition: "stroke-dashoffset 1.6s ease-out" }} />
                    {chartPoints.map((p, i) => { const x = (i / (chartPoints.length - 1)) * 280; const y = 80 - (p / 100) * 70; return <circle key={i} cx={x} cy={y} r="2.5" fill="#6C0820" opacity={phase >= 1 ? 1 : 0} style={{ transition: `opacity .3s ${0.6 + i * 0.08}s` }} />; })}
                  </svg>
                  <div className="flex justify-between text-[9px] text-ink/40 mt-1 font-semibold">{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}</div>
                </div>
                <div className="col-span-12 rounded-2xl bg-gradient-to-r from-burgundy via-cherry-600 to-burgundy p-4 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-scanline" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/25 text-white flex items-center justify-center"><Icon name="sim" className="w-4 h-4" /></div>
                    <div>
                      <div className="text-[11px] text-cherry uppercase tracking-[0.18em] font-bold">Recomendado para ti</div>
                      <div className="text-sm text-white font-medium">Simulador CIAAC completo · 310 preguntas · 5 hrs</div>
                    </div>
                  </div>
                  <button className="relative shrink-0 px-3 py-1.5 rounded-lg bg-white text-burgundy text-xs font-bold flex items-center gap-1.5 hover:bg-cherry transition-colors">Iniciar <Icon name="arrow" className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { ic: "chart" as IconName, t: "Métricas claras", d: "Sabes exactamente dónde estás parada en cada materia." },
              { ic: "flame" as IconName, t: "Rachas que motivan", d: "Cada día que estudias, sube un escalón hacia tu meta." },
              { ic: "target" as IconName, t: "Recomendaciones diarias", d: "Pathy y Yaris te dicen qué practicar hoy según tu avance." },
              { ic: "bolt" as IconName, t: "Retroalimentación al instante", d: "No esperas a la próxima clase para saber si lo hiciste bien." },
            ].map((it, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-cherry/20 hover:border-cherry hover:shadow-soft hover:-translate-y-0.5 transition-all">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-cherry to-cherry-600 text-white flex items-center justify-center shadow-pop"><Icon name={it.ic} className="w-5 h-5" /></div>
                <div><div className="text-ink font-semibold">{it.t}</div><div className="text-sm text-ink/60 mt-1 leading-relaxed">{it.d}</div></div>
              </div>
            ))}
            <div className="pt-3"><Btn variant="primary" size="md" icon="arrow" className="w-full" to="/register">Ver mi dashboard</Btn></div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function PathyEvolution() {
  const stages = [
    { name: "Despegando", days: "1-3 días", color: "#F2DCDB", token: "MISTY ROSE", copy: "Todo gran vuelo comienza con un pequeño paso.", img: "/assets/pathy-1-misty.png" },
    { name: "En progreso", days: "4-6 días", color: "#F2AEBC", token: "CHERRY BLOSSOM", copy: "¡Vas por buen camino! Sigue así.", img: "/assets/pathy-2-pink.png" },
    { name: "En ruta", days: "7-13 días", color: "#5A86CB", token: "SILVER LAKE", copy: "La constancia te está llevando lejos.", img: "/assets/pathy-3-blue.png" },
    { name: "Modo piloto", days: "14-30 días", color: "#3D5D91", token: "LAPIS LAZULI", copy: "¡Eres imparable! Sigue volando alto.", img: "/assets/pathy-4-pilot.png" },
    { name: "Piloto élite", days: "30+ días", color: "#6C0820", token: "BURGUNDY", copy: "Disciplina, enfoque y pasión. Nivel élite.", img: "/assets/pathy-5-elite.png" },
  ];
  const [active, setActive] = useState(3);
  const s = stages[active];
  return (
    <Section bg="cream" flip="fx" className="py-24 lg:py-32 overflow-hidden">
      <AeroAmbience variant="light" density="medium" sparkles={false} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Conoce a Pathy" title="Tu copiloto." accent="Tu motivación." sub="Pathy evoluciona contigo. Cuanto más constante seas, más alto vuela." tone="light" />
        <div className="relative grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-50 transition-all duration-700" style={{ background: s.color }} />
            <div className="relative aspect-square max-w-[420px] mx-auto flex items-center justify-center">
              <img key={active} src={s.img} alt={s.name} className="w-full h-full object-contain animate-floatSm drop-shadow-[0_30px_60px_rgba(108,8,32,0.25)]" />
              <span className="absolute top-4 left-12 text-burgundy text-2xl animate-twinkle">✦</span>
              <span className="absolute top-20 right-10 text-burgundy/70 text-xl animate-twinkle" style={{ animationDelay: ".4s" }}>✦</span>
              <span className="absolute bottom-12 left-4 text-lapis text-lg animate-twinkle" style={{ animationDelay: ".7s" }}>✦</span>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold border" style={{ background: s.color + "30", color: s.color, borderColor: s.color + "60" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.token}
            </div>
            <div className="mt-5 font-display text-5xl md:text-6xl text-ink font-semibold">{s.name}</div>
            <div className="mt-2 text-burgundy/60 text-sm uppercase tracking-[0.18em] font-semibold">{s.days}</div>
            <p className="mt-6 text-lg text-ink/70 leading-relaxed max-w-lg font-serif-italic">"{s.copy}"</p>
            <div className="mt-8 flex items-center gap-3">
              <Btn variant="ghost" size="md" icon="chevron" onClick={() => setActive(Math.max(0, active - 1))}>Anterior</Btn>
              <Btn variant="primary" size="md" onClick={() => setActive(Math.min(stages.length - 1, active + 1))}>Siguiente nivel</Btn>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-8 right-8 top-1/2 h-px bg-gradient-to-r from-transparent via-burgundy/20 to-transparent hidden md:block" />
          <div className="grid grid-cols-5 gap-2 md:gap-4 relative">
            {stages.map((st, i) => {
              const isActive = i === active;
              return (
                <button key={i} onClick={() => setActive(i)} className={`group relative rounded-2xl p-3 md:p-4 text-center transition-all duration-300 border ${isActive ? "bg-white border-burgundy/30 scale-105 shadow-soft" : "bg-white/60 border-ink/8 hover:bg-white hover:border-burgundy/20"}`}>
                  <div className="relative aspect-square max-w-[90px] mx-auto">
                    <div className="absolute inset-2 rounded-full blur-xl opacity-50" style={{ background: st.color }} />
                    <img src={st.img} alt={st.name} className="relative w-full h-full object-contain" />
                  </div>
                  <div className={`mt-2 text-xs font-semibold ${isActive ? "text-burgundy" : "text-ink/70"}`}>{st.name}</div>
                  <div className="text-[10px] text-ink/40 mt-0.5">{st.days}</div>
                  {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-burgundy" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

function YarisChat() {
  type Scene = {
    type: string; header: string; title: string; opts?: string[]; correct?: number;
    reply: { title: string; body: string; ref?: string; tags?: string[] };
  };
  const scenes: Scene[] = [
    { type: "question", header: "Meteorología · Pregunta 23 de 50", title: "¿Qué fenómeno causa la formación de nubes cumulonimbus?", opts: ["Evaporación", "Convección", "Subsidencia", "Radiación"], correct: 1, reply: { title: "¡Correcto! La respuesta es B) Convección.", body: "El aire cálido asciende, se enfría, se condensa y forma nubes cumulonimbus — responsables de tormentas eléctricas.", ref: "Meteorología para Pilotos · Cap. 5 · Pág. 142" } },
    { type: "mnemo", header: "Nemotecnia · Vientos en altura", title: "Recuerda los vientos en altura con I-AM-SAFE", reply: { title: "💡 Nemotecnia: I-AM-SAFE", body: "Illness · Medication · Stress · Alcohol · Fatigue · Emotion. Una palabra, seis chequeos antes de cada vuelo.", tags: ["Checklist", "Factor humano"] } },
    { type: "popculture", header: "Ejemplo de la vida real", title: '"Maverick, te llevas tu plan de vuelo o…"', reply: { title: "🎬 Como en Top Gun:", body: "Cuando Maverick desobedece la torre, lo expulsan. En aviación real, los procedimientos no son sugerencias — son tu seguro de vida.", tags: ["Cultura pop", "Disciplina"] } },
    { type: "support", header: "Apoyo emocional", title: "¿Te sientes abrumada hoy?", reply: { title: "💖 Respira. Tú puedes.", body: "Un mal día de estudio no define tu carrera. Toma un break de 10 minutos, hidrátate y volvemos. Pathy y yo te esperamos.", tags: ["Bienestar", "Pathy contigo"] } },
  ];
  const [sceneIdx, setSceneIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const phaseDurations = [1400, 1100, 1100, 3400];
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (phase < 3) setPhase(phase + 1);
      else { setPhase(0); setSceneIdx((sceneIdx + 1) % scenes.length); }
    }, phaseDurations[phase]);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, playing, sceneIdx]);
  useEffect(() => { setPhase(0); }, [sceneIdx]);

  const scene = scenes[sceneIdx];
  const isQuestion = scene.type === "question";
  const showPick = phase >= 1;
  const showTyping = phase === 2;
  const showAnswer = phase >= 3;
  const opts = ["A", "B", "C", "D"];
  const labels = ["Pregunta", "Nemotecnia", "Cultura pop", "Apoyo"];
  function goto(i: number) { setSceneIdx(i); setPhase(0); }

  return (
    <Section bg="cream" flip="fxy" className="py-24 lg:py-32 relative overflow-hidden">
      <AeroAmbience variant="light" density="light" planes={false} sparkles={false} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Conoce a Yaris" title="Tu tutor IA" accent="en acción" sub="Mira cómo Yaris responde, explica y te acompaña. No es un chatbot — es un copiloto que sabe cómo aprendes." tone="light" />
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-14 items-center">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-cherry/25 via-cherry/10 to-silver/15 blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-misty/20 to-white shadow-lift border border-white/15">
              <div className="relative flex items-center justify-between px-5 py-3 bg-gradient-to-r from-burgundy to-burgundy-900 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cherry" /><span className="w-2.5 h-2.5 rounded-full bg-cherry/40" /><span className="w-2.5 h-2.5 rounded-full bg-cherry/40" /></div>
                  <div className="text-[11px] uppercase tracking-[0.18em] font-semibold flex items-center gap-1.5">
                    <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-cherry animate-ping" /><span className="relative w-2 h-2 rounded-full bg-cherry" /></span>
                    EN VIVO · Yaris IA
                  </div>
                </div>
                <div className="text-[11px] text-cherry/80 font-medium">Escena {sceneIdx + 1}/{scenes.length}</div>
              </div>
              <div className="relative px-5 md:px-7 py-6 md:py-7 min-h-[460px] text-ink">
                <div className="text-[11px] uppercase tracking-[0.18em] text-burgundy font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse-dot" />{scene.header}
                </div>
                <div key={`title-${sceneIdx}`} className="mt-2 font-display text-2xl md:text-3xl text-ink leading-snug animate-flip-in">{scene.title}</div>
                {isQuestion && (
                  <div className="mt-5 grid gap-2.5">
                    {scene.opts!.map((opt, i) => {
                      const isCorrect = i === scene.correct;
                      const reveal = showPick;
                      const cls = !reveal ? "border-ink/10" : isCorrect ? "border-emerald-500 bg-emerald-50 scale-[1.02]" : "border-ink/8 opacity-40";
                      return (
                        <div key={i} className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 transition-all duration-500 ${cls}`}>
                          <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${reveal && isCorrect ? "bg-emerald-500 text-white" : "bg-ink/5 text-ink/60"}`}>
                            {reveal && isCorrect ? <Icon name="check" className="w-4 h-4" stroke={2.5} /> : opts[i]}
                          </span>
                          <span className="text-sm text-ink/85">{opt}</span>
                          {!reveal && i === scene.correct && phase === 0 && <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-cherry-600 font-semibold opacity-70">cursor →</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {showTyping && (
                  <div className="mt-5 flex items-center gap-3 animate-flip-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-burgundy to-cherry flex items-center justify-center text-white text-xs font-semibold">Y</div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-misty-200 flex items-center gap-1.5">
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-burgundy/60" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-burgundy/60" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-burgundy/60" />
                    </div>
                  </div>
                )}
                {showAnswer && (
                  <div className="mt-5 flex items-start gap-3 animate-flip-in">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-burgundy to-cherry flex items-center justify-center text-white text-sm font-semibold">Y</div>
                    <div className="flex-1">
                      <div className="rounded-2xl rounded-bl-sm bg-gradient-to-br from-misty-200 to-white p-4 border border-cherry/30 shadow-sm">
                        <div className="text-sm font-semibold text-burgundy">{scene.reply.title}</div>
                        <div className="mt-1.5 text-sm text-ink/75 leading-relaxed">{scene.reply.body}</div>
                        {scene.reply.ref && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-ink/60 bg-white px-3 py-2 rounded-lg border border-ink/8">
                            <Icon name="book" className="w-3.5 h-3.5 text-burgundy" /><span className="font-medium">Referencia:</span> {scene.reply.ref}
                          </div>
                        )}
                        {scene.reply.tags && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {scene.reply.tags.map((tg) => <span key={tg} className="text-[10px] uppercase tracking-[0.14em] font-semibold px-2 py-1 rounded-md bg-cherry/20 text-burgundy">{tg}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <span className="absolute top-4 right-6 text-cherry/40 text-lg animate-twinkle pointer-events-none">✦</span>
                <span className="absolute bottom-24 right-4 text-cherry/30 text-base animate-twinkle pointer-events-none" style={{ animationDelay: ".6s" }}>✦</span>
              </div>
              <div className="relative px-5 py-3 border-t border-ink/8 bg-gradient-to-r from-misty/40 to-white">
                <div className="flex items-center gap-3">
                  <button onClick={() => setPlaying(!playing)} className="w-9 h-9 rounded-full bg-burgundy hover:bg-burgundy-700 text-white flex items-center justify-center transition-colors">
                    {playing ? <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg> : <Icon name="play" className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 flex items-center gap-1.5">
                    {scenes.map((_, i) => {
                      const isActive = i === sceneIdx;
                      const isDone = i < sceneIdx;
                      const prog = isActive ? Math.min(100, (phaseDurations.slice(0, phase + 1).reduce((a, b) => a + b, 0) / phaseDurations.reduce((a, b) => a + b, 0)) * 100) : isDone ? 100 : 0;
                      return (
                        <button key={i} onClick={() => goto(i)} className="group flex-1 h-1.5 rounded-full bg-ink/10 overflow-hidden relative">
                          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cherry-600 via-cherry to-cherry-400 transition-all duration-200" style={{ width: `${prog}%` }} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-ink/40 tabular-nums">0:{String(Math.min(8, Math.floor(phaseDurations.slice(0, phase + 1).reduce((a, b) => a + b, 0) / 1000))).padStart(2, "0")} / 0:08</div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink/50">
                  {scenes.map((_, i) => <div key={i} className={`flex-1 text-center transition-colors ${i === sceneIdx ? "text-burgundy font-semibold" : ""}`}>{labels[i]}</div>)}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: "book" as IconName, t: "Cita siempre el libro, capítulo y página exactas." },
              { icon: "brain" as IconName, t: "Explica con ejemplos de la vida real." },
              { icon: "sparkle" as IconName, t: "Usa nemotecnias, diagramas y mapas mentales." },
              { icon: "play" as IconName, t: "Referencia películas y cultura pop (sí, hasta Top Gun)." },
              { icon: "target" as IconName, t: "Te da tips de estudio personalizados." },
              { icon: "heart" as IconName, t: "Apoyo emocional cuando más lo necesitas." },
            ].map((it, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-cherry/20 hover:border-cherry hover:shadow-soft transition-all">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cherry to-cherry-600 text-white flex items-center justify-center shadow-pop"><Icon name={it.icon} className="w-4 h-4" /></div>
                <div className="text-ink/85 text-sm leading-relaxed pt-1.5">{it.t}</div>
              </div>
            ))}
            <Btn variant="primary" size="md" icon="chat" className="w-full mt-3" to="/register">Pregúntale a Yaris</Btn>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Testimonials() {
  const t = [
    { quote: "Pasé el simulador en mi tercer intento. Yaris me explicaba cada error hasta que entendí. No fue suerte — fue método.", name: "Camila R.", role: "Aprobada · CIAAC 2025", color: "from-cherry to-burgundy" },
    { quote: "La racha con Pathy suena bobo hasta que llevas 30 días sin saltarte un estudio. Es lo que me faltaba para no rendirme.", name: "Diego M.", role: "Piloto Élite · 47 días", color: "from-silver to-lapis" },
    { quote: "El simulador real me preparó para la presión. Llegué al examen y sentí que ya lo había hecho. Ese es el verdadero valor.", name: "Andrea P.", role: "Aprobada · primer intento", color: "from-cherry-400 to-cherry-600" },
  ];
  return (
    <Section bg="sky" flip="fy" className="py-24 lg:py-32 relative overflow-hidden">
      <AeroAmbience variant="light" density="light" planes={false} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Lo que dicen" title="Pilotos formados" accent="por FlightPath" sub="No son testimonios de marketing — son pilotos reales que confiaron en su preparación." tone="light" />
        <div className="grid md:grid-cols-3 gap-5">
          {t.map((it, i) => (
            <Card key={i} className="p-7 flex flex-col bg-white">
              <div className="text-burgundy text-5xl font-display leading-none mb-2 font-bold">"</div>
              <p className="text-ink/80 text-[15px] leading-relaxed flex-1">{it.quote}</p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-ink/8">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${it.color} text-white flex items-center justify-center text-sm font-semibold`}>{it.name.charAt(0)}</div>
                <div><div className="text-ink text-sm font-semibold">{it.name}</div><div className="text-ink/50 text-xs">{it.role}</div></div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 rounded-3xl bg-white border border-burgundy/15 shadow-soft p-8 md:p-10">
          <Stat value="94" suffix="%" label="Aprueban primer intento" />
          <Stat value="2.4" suffix="k+" label="Pilotos en formación" />
          <Stat value="310" suffix="" label="Preguntas en simulador" />
          <Stat value="24/7" suffix="" label="Acompañamiento Yaris" />
        </div>
      </div>
    </Section>
  );
}

function Pricing() {
  const features = [
    "Acceso completo a todo FlightPath",
    "12 materias del CIAAC + biblioteca oficial",
    "Banco de 5,000+ preguntas",
    "Simulador real (310 preguntas · 5 hrs)",
    "Tutor IA Yaris 24/7",
    "Pathy: tu copiloto de hábitos",
    "Actualizaciones incluidas",
    "Estudia a tu ritmo, desde cualquier dispositivo",
  ];
  const [t, setT] = useState({ d: 6, h: 23, m: 59, s: 12 });
  useEffect(() => {
    const id = setInterval(() => setT((p) => {
      let { d, h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; }
      if (m < 0) { m = 59; h--; }
      if (h < 0) { h = 23; d--; }
      if (d < 0) d = 0;
      return { d, h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);
  const PriceUnit = ({ n, l }: { n: number; l: string }) => (
    <div className="bg-ink rounded-lg px-3 py-2 text-center min-w-[58px]">
      <div className="font-display text-2xl text-white leading-none tabular-nums">{String(n).padStart(2, "0")}</div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-cherry mt-1 font-semibold">{l}</div>
    </div>
  );
  return (
    <Section bg="sky" id="precios" flip="fxy" className="py-24 lg:py-32 overflow-hidden">
      <AeroAmbience variant="light" density="light" sparkles={false} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow="Inversión en tu carrera" title="Precio" accent="lanzamiento" sub="Una anualidad. Acceso total. Sin sorpresas. Sin pagos mensuales que se vuelven trampa." tone="light" />
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 max-w-5xl mx-auto">
          <div className="space-y-4">
            <Card className="p-7 bg-white" hover={false}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cherry to-cherry-600 text-white flex items-center justify-center"><Icon name="shield" className="w-5 h-5" /></div>
                <div className="font-display text-2xl text-ink font-semibold">Garantía 7 días</div>
              </div>
              <p className="text-ink/60 text-sm leading-relaxed">Prueba FlightPath una semana. Si no es para ti, te devolvemos cada peso. Sin preguntas.</p>
            </Card>
            <Card className="p-7 bg-white" hover={false}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-silver to-lapis text-white flex items-center justify-center"><Icon name="bolt" className="w-5 h-5" /></div>
                <div className="font-display text-2xl text-ink font-semibold">Acceso inmediato</div>
              </div>
              <p className="text-ink/60 text-sm leading-relaxed">Empiezas a estudiar en minutos. Sin esperar al ciclo, sin filas, sin manuales que llegan por correo.</p>
            </Card>
            <Card className="p-7 bg-white" hover={false}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-burgundy to-burgundy-900 text-cherry flex items-center justify-center"><Icon name="user" className="w-5 h-5" /></div>
                <div className="font-display text-2xl text-ink font-semibold">Una sola cuenta</div>
              </div>
              <p className="text-ink/60 text-sm leading-relaxed">Tu progreso, tus rachas, tu Yaris. Todo sincronizado en cualquier dispositivo.</p>
            </Card>
          </div>
          <div className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-burgundy text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em] shadow-pop">Por tiempo limitado</div>
            </div>
            <div className="relative rounded-3xl bg-white text-ink p-8 md:p-10 shadow-lift overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cherry/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-silver/15 blur-3xl" />
              <div className="relative">
                <div className="text-burgundy uppercase text-[11px] tracking-[0.2em] font-semibold">Plan Aviador · Anual</div>
                <div className="mt-4 flex items-baseline gap-3">
                  <div className="text-lg text-ink/40 line-through">$15,000 MXN</div>
                  <div className="px-2 py-0.5 rounded-md bg-cherry/30 text-burgundy text-xs font-semibold">-33%</div>
                </div>
                <div className="mt-1 font-display text-7xl text-burgundy leading-none">$10,000 <span className="text-2xl text-ink/40 font-sans">MXN</span></div>
                <div className="mt-1 text-sm text-ink/55">Pago único · Acceso por 12 meses</div>
                <ul className="mt-7 space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-ink/80">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-lapis text-white flex items-center justify-center mt-0.5"><Icon name="check" className="w-3 h-3" stroke={3} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="mt-8 w-full bg-burgundy hover:bg-burgundy-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-pop">
                  Comenzar ahora <Icon name="arrow" className="w-4 h-4" />
                </Link>
                <div className="mt-6 text-center">
                  <div className="text-xs text-ink/50 mb-2">La oferta termina en:</div>
                  <div className="flex justify-center gap-2"><PriceUnit n={t.d} l="Días" /><PriceUnit n={t.h} l="Horas" /><PriceUnit n={t.m} l="Min" /><PriceUnit n={t.s} l="Seg" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FinalCta() {
  return (
    <Section bg="skyDeep" flip="fx" className="py-24 lg:py-32 relative overflow-hidden">
      <AeroAmbience variant="light" density="medium" sparkles={false} />
      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <div className="rounded-[32px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-lift p-10 md:p-14 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <Eyebrow tone="cherry">Empieza hoy</Eyebrow>
            <h2 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-ink font-semibold">No es suerte.<br />Es <span className="font-serif-italic text-burgundy">preparación.</span></h2>
            <p className="mt-6 text-lg text-ink/65 max-w-xl leading-relaxed">En FlightPath no solo estudias. Entiendes, practicas y te vuelves imparable. Tu próxima licencia comienza aquí.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Btn variant="primary" size="lg" icon="arrow" to="/register">Comenzar gratis</Btn>
              <Btn variant="ghost" size="lg" icon="play" href="#como-funciona">Ver demo</Btn>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink/60">
              <div className="flex items-center gap-2"><Icon name="shield" className="w-4 h-4 text-burgundy" />Garantía 7 días</div>
              <div className="flex items-center gap-2"><Icon name="bolt" className="w-4 h-4 text-burgundy" />Acceso inmediato</div>
              <div className="flex items-center gap-2"><Icon name="book" className="w-4 h-4 text-burgundy" />Bibliografía oficial CIAAC</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-3xl bg-cherry/30" />
            <img src="/assets/duo-card.png" alt="Yaris y Pathy" className="relative w-full max-w-[420px] mx-auto animate-floatSm drop-shadow-[0_30px_60px_rgba(108,8,32,0.25)]" />
            <div className="text-center mt-2"><div className="font-display text-2xl text-ink font-semibold">¡Nunca vuelas <span className="font-serif-italic text-burgundy">solo!</span></div></div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  const cols = [
    { title: "Producto", links: ["Materias", "Banco de preguntas", "Simulador CIAAC", "Tutor IA Yaris", "Pathy"] },
    { title: "Recursos", links: ["Blog", "Guía CIAAC", "Bibliografía oficial", "Preguntas frecuentes"] },
    { title: "Empresa", links: ["Sobre nosotros", "Equipo", "Contacto", "Carreras"] },
    { title: "Legal", links: ["Términos", "Privacidad", "Reembolsos", "Cookies"] },
  ];
  return (
    <footer id="footer" className="bg-[#070b1c] pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-stars opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid md:grid-cols-[1.4fr_repeat(4,1fr)] gap-10 md:gap-8 pb-12 border-b border-white/8">
          <div>
            <Logo tone="light" size="lg" />
            <p className="mt-5 text-sm text-white/55 leading-relaxed max-w-xs">La plataforma #1 de formación CIAAC en México. Aprende, domina y vuela.</p>
            <div className="mt-6 flex items-center gap-2">
              {["IG", "TW", "YT", "TT"].map((sm) => (
                <a key={sm} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-cherry hover:text-burgundy text-white/60 flex items-center justify-center text-xs font-semibold transition-colors">{sm}</a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-white text-sm font-semibold mb-4">{c.title}</div>
              <ul className="space-y-2.5">{c.links.map((l) => <li key={l}><a href="#" className="text-sm text-white/50 hover:text-cherry transition-colors">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="py-12 text-center">
          <div className="font-display text-4xl md:text-6xl text-white/15 leading-none">APRENDE · DOMINA · <span className="italic grad-cherry text-white/40">VUELA</span>.</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/35">
          <div>© 2026 FlightPath · Hecho con <span className="text-cherry">♥</span> en México</div>
          <div className="flex items-center gap-4">
            <span>v1.0 · Lanzamiento</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Todos los sistemas operativos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════════════════════════════ */

function LandingPage() {
  // TWEAK_DEFAULTS from index.html: heroBg "rose", showCountdown true, accentDensity "tight"
  return (
    <div className="bg-cielo text-ink">
      <Nav />
      <Hero heroBg="rose" />
      <Countdown />
      <Problems />
      <HowItWorks />
      <Features />
      <LiveDashboard />
      <PathyEvolution />
      <YarisChat />
      <Testimonials />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}
