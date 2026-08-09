/**
 * Sistema de diseño de las páginas públicas (Nav, Footer, primitivas).
 *
 * Vivía dentro de `routes/index.tsx`; se extrajo para que las landings SEO no
 * carguen el chunk completo de la portada (Hero, Countdown, Pricing…) solo por
 * importar el Nav y el Footer — era ~740 KB gzip de JS por página pública.
 * La portada re-exporta todo desde "./index" por compatibilidad, pero las
 * páginas deben importar de aquí.
 */
import { useSessionUser } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { PlaneField as SharedPlaneField } from "@/components/shared/PlaneField";

export type IconName =
  | "arrow" | "arrowUp" | "play" | "check" | "spark" | "compass" | "target"
  | "book" | "cards" | "sim" | "chat" | "audio" | "bolt" | "clock" | "flame"
  | "chart" | "shield" | "plane" | "radio" | "grid" | "cal" | "doc" | "user"
  | "bell" | "chevD" | "chevR" | "menu" | "close" | "moon" | "waypoint"
  | "alarm" | "brain" | "heart" | "library";

export function Icon({ n, className = "w-5 h-5", sw = 1.6 }: { n: IconName; className?: string; sw?: number }) {
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

export function FMark({ size = 30, light = false }: { size?: number; light?: boolean }) {
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

export function Logo({ light = false, size = 30 }: { light?: boolean; size?: number }) {
  return (
    <Link to="/" aria-label="FlightPath — ir al inicio" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
      <img
        src="/assets/flightpath-logo.png"
        alt="Logo de FlightPath"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-[8px] object-cover shrink-0"
      />
      <span className={`font-display text-[17px] sm:text-[19px] tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Flight<span className="text-coral-600">Path</span>
      </span>
    </Link>
  );
}

type BtnKind = "primary" | "navy" | "light" | "ghost" | "ghostLight" | "soft" | "outlineLight";
export function Btn({
  children, kind = "primary", size = "md", icon, iconLeft, className = "", href, to, search, onClick,
}: {
  children: ReactNode; kind?: BtnKind; size?: "sm" | "md" | "lg";
  icon?: IconName; iconLeft?: IconName; className?: string;
  href?: string; to?: string; search?: Record<string, unknown>; onClick?: () => void;
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
  // Navegación interna con el router (sin recarga completa): así el salto de
  // /precios al checkout de Stripe es continuo.
  if (to) return <Link to={to} search={search as never} className={cls} onClick={onClick}>{inner}</Link>;
  if (href) return <a href={href} className={cls} onClick={onClick}>{inner}</a>;

  return <button onClick={onClick} className={cls}>{inner}</button>;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em] font-bold ${light ? "text-white/55" : "text-haze-500"}`}>
      <span className="w-5 h-px bg-coral-600" />
      {children}
    </span>
  );
}

export function Pill({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "coral" | "light" | "live" }) {
  const tones = {
    ink: "border-ink/10 text-ink/65 bg-white/70",
    coral: "border-coral-300/50 text-coral-700 bg-coral-50",
    light: "border-white/15 text-white/75 bg-white/5",
    live: "border-coral-300/50 text-coral-700 bg-coral-50",
  };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Coord({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <span className={`font-mono text-[10px] tracking-wide ${light ? "text-white/40" : "text-haze-400"}`}>{children}</span>;
}

export function PathyBubble({ size = 220, glow = true, className = "" }: { size?: number; float?: boolean; glow?: boolean; className?: string }) {
  const [anim, setAnim] = useState<"" | "is-jumping" | "is-wiggling">("");
  const nextRef = useRef<"is-jumping" | "is-wiggling">("is-jumping");

  const play = useCallback((kind?: "is-jumping" | "is-wiggling") => {
    setAnim((cur) => {
      if (cur) return cur;
      const k = kind ?? nextRef.current;
      nextRef.current = k === "is-jumping" ? "is-wiggling" : "is-jumping";
      return k;
    });
  }, []);

  useEffect(() => {
    if (!anim) return;
    const t = setTimeout(() => setAnim(""), anim === "is-jumping" ? 950 : 1200);
    return () => clearTimeout(t);
  }, [anim]);

  useEffect(() => {
    const id = setInterval(() => play(), 5000);
    return () => clearInterval(id);
  }, [play]);

  return (
    <div
      className={`fp-mascot ${anim} ${className}`}
      style={{ width: size, height: size * 1.02, ["--fp-size" as string]: `${size}px` }}
      onClick={() => play()}
      role="img"
      aria-label="Pathy, tu copiloto de estudio"
    >
      {glow && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.30), transparent 70%)", transform: "scale(1.2)", filter: "blur(10px)" }}
        />
      )}
      <div className="fp-shadow" />
      <div className="fp-jump">
        <div className="fp-squash">
          <img
            className="fp-img"
            src="/assets/pathy-cloud.png"
            alt=""
            draggable={false}
            width={size}
            height={size}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export function SectionHead({
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

export function AeroBackdrop({ theme = "hueso" }: { theme?: "hueso" | "cherry" | "azul" }) {
  return <div className={`cloudscape cs-${theme} fixed inset-0 -z-10 overflow-hidden pointer-events-none`} aria-hidden="true" />;
}

/* La landing y el dashboard comparten el motor de aviones de fondo. */
export function PlaneField({ count = 20, color = "26,35,64" }: { count?: number; color?: string }) {
  return (
    <SharedPlaneField
      count={count}
      color={color}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "CIAAC", href: "/ciaac" },
  // La convocatoria E190 vive dentro de la ruta de línea aérea.
  { label: "Línea Aérea", href: "/convocatoria-aeromexico" },
  { label: "Precios", href: "/precios" },
  { label: "Blog", href: "/blog" },
];

/** Secciones de la home: en móvil el menú también sirve para saltar a ellas. */
const HOME_SECTIONS: { label: string; hash: string }[] = [
  { label: "Cómo funciona", hash: "#como-funciona" },
  { label: "Funciones", hash: "#funciones" },
  { label: "Yaris, tu tutora IA", hash: "#yaris" },
  { label: "Simulador", hash: "#simulador" },
  { label: "Precios", hash: "#precios" },
  { label: "Historias", hash: "#historias" },
];

export function Nav() {
  const sesion = Boolean(useSessionUser());
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  // El menú abierto bloquea el scroll de fondo en móvil.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled || open ? "glass border-b border-ink/8" : "bg-transparent"}`}>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 h-[64px] sm:h-[68px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0 flex items-center gap-6 lg:gap-8">
          <Logo />
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-ink/65">
            {NAV_LINKS.map((x) => (
              <a key={x.label} href={x.href} className="hover:text-ink transition-colors">{x.label}</a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Con sesión activa la home no redirige: sólo ofrece el atajo. */}
          {mounted && sesion ? (
            <Btn kind="primary" size="sm" icon="arrow" to="/dashboard">
              <span className="hidden sm:inline">Ir a mi dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Btn>
          ) : (
            <>
              <div className="hidden md:block">
                <Btn kind="ghost" size="sm" to="/login">Iniciar sesión</Btn>
              </div>
              <Btn kind="primary" size="sm" icon="arrow" to="/register">
                <span className="hidden sm:inline">Comenzar gratis</span>
                <span className="sm:hidden">Empezar</span>
              </Btn>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú de navegación"}
            aria-expanded={open}
            aria-controls="nav-mobile"
            className="lg:hidden h-11 -mr-1 px-2.5 sm:px-3 inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white text-ink shadow-sm"
          >
            <span className="relative block w-[18px] h-[12px]" aria-hidden="true">
              <span className={`absolute left-0 w-full h-[2px] rounded bg-current transition-all duration-200 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-[5px] w-full h-[2px] rounded bg-current transition-all duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 w-full h-[2px] rounded bg-current transition-all duration-200 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
            </span>
            <span className="hidden xs:inline text-[13px] font-semibold">{open ? "Cerrar" : "Menú"}</span>
          </button>
        </div>
      </div>
      {open && mounted && createPortal(
        <div
          id="nav-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="lg:hidden fixed inset-0 z-[120] overflow-y-auto overscroll-contain bg-[#FAF8F4]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#FAF8F4] border-b border-ink/8 px-4 sm:px-6 h-[64px]">
            <span className="font-display text-[17px] font-bold text-ink">FlightPath</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="h-11 px-3.5 inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white text-ink text-[13px] font-semibold shadow-sm"
            >
              <span aria-hidden="true" className="text-[17px] leading-none">×</span> Cerrar
            </button>
          </div>
          <nav className="mx-auto max-w-[1240px] px-4 sm:px-6 py-4 flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40 mb-1">Páginas</p>
            {NAV_LINKS.map((x) => (
              <a
                key={x.label}
                href={x.href}
                onClick={() => setOpen(false)}
                className="min-h-[52px] py-3.5 flex items-center justify-between text-[15px] font-semibold text-ink/85 border-b border-ink/5"
              >
                {x.label}
                <span aria-hidden="true" className="text-ink/30">›</span>
              </a>
            ))}

            <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40 mt-5 mb-1">
              En esta página
            </p>
            {HOME_SECTIONS.map((s) => (
              <a
                key={s.hash}
                href={`/${s.hash}`}
                onClick={() => setOpen(false)}
                className="min-h-[48px] py-3 flex items-center justify-between text-[14.5px] font-medium text-ink/70 border-b border-ink/5"
              >
                {s.label}
                <span aria-hidden="true" className="text-ink/30">↓</span>
              </a>
            ))}

            <div className="mt-6 flex flex-col gap-2.5 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <a
                href={sesion ? "/dashboard" : "/register"}
                onClick={() => setOpen(false)}
                className="py-3.5 text-center text-[15px] font-bold text-white rounded-xl shadow-navy"
                style={{ background: "#6C0820" }}
              >
                {sesion ? "Ir a mi dashboard" : "Comenzar gratis"}
              </a>
              {!sesion && (
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="py-3.5 text-center text-[15px] font-semibold text-ink rounded-xl border border-ink/12"
                >
                  Iniciar sesión
                </a>
              )}
            </div>
          </nav>
        </div>,
        document.body,
      )}

    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════ */

export function Footer() {
  return (
    <footer className="relative bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-16 pb-9">
        <div className="grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 pb-12 border-b border-white/10">
          <div>
            <Logo light size={30} />
            <p className="mt-5 text-[13.5px] text-white/55 leading-relaxed max-w-xs">
              La plataforma de preparación para el CIAAC. Hecha en México por pilotos, para pilotos.
            </p>
            {/* Disclaimer permanente de no afiliación — no quitar (regla de compliance). */}
            <p className="mt-4 text-[11.5px] text-white/35 leading-relaxed max-w-xs">
              FlightPath es una plataforma independiente. No está afiliada a la AFAC ni al CIAAC, ni a
              ASPA de México, Aeroméxico, Volaris o ninguna otra aerolínea o institución.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <Coord light>EST. CDMX · 2026</Coord>
            </div>
          </div>
          {[
            { h: "Plataforma", l: [
              { t: "Funciones", href: "/#funciones" },
              { t: "Simulador", href: "/#simulador" },
              { t: "Tutor IA", href: "/#yaris" },
              { t: "Precios", href: "/#precios" },
            ] },
            { h: "Recursos", l: [
              { t: "Blog", href: "/blog" },
              { t: "Preguntas frecuentes", href: "/faq" },
              { t: "Centro de respuestas CIAAC", href: "/respuestas" },
              { t: "Examen CIAAC — Piloto Comercial", href: "/ciaac" },
              { t: "Convocatoria CIAAC 2026", href: "/convocatoria-ciaac-2026" },
              { t: "Calculadora de horas de estudio", href: "/calculadora-ciaac" },
              { t: "Convocatoria Aeroméxico · Embraer 190", href: "/convocatoria-aeromexico" },
              { t: "Fuentes del temario — Línea Aérea", href: "/linea-aerea" },
              { t: "Examen RTARI — entrevista en inglés", href: "/examen-rtari" },
              { t: "Examen COMPASS — aptitudes de piloto", href: "/examen-compass" },
              { t: "Estudiar el Boeing 737 MAX", href: "/estudiar-737-max" },
              { t: "¿Cómo elegir plataforma?", href: "/mejor-plataforma-ciaac" },
              { t: "AFAC (sitio oficial)", href: "https://www.gob.mx/afac", ext: true },
            ] },
            { h: "FlightPath", l: [
              { t: "Sobre FlightPath", href: "/sobre-flightpath" },
              { t: "Términos y condiciones", href: "/legal" },
              { t: "Contacto", href: "mailto:contacto@flightpath.mx" },
            ] },
          ].map((c, i) => (
            <div key={i}>
              <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/40">{c.h}</div>
              <ul className="mt-5 space-y-3">
                {c.l.map((x) => (
                  <li key={x.t}>
                    <a href={x.href} target={"ext" in x && x.ext ? "_blank" : undefined} rel={"ext" in x && x.ext ? "noreferrer" : undefined}
                       className="text-[13.5px] text-white/70 hover:text-coral-400 transition-colors">{x.t}</a>
                  </li>
                ))}
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
