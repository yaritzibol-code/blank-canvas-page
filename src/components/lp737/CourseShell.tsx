/**
 * Shell 1:1 de la Ruta de aprendizaje 737 MAX (paquete FlightPath737MAXLearningPath):
 * sidebar ink de 248 px con los 21 módulos, herramientas (Evaluación /
 * Cobertura) y bloque de avance; barra móvil con drawer. El contenido de cada
 * vista se renderiza en el main crema.
 */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import type { Lp737Course } from "@/lib/lp737/types";

export type CourseVista =
  | { tipo: "dashboard" }
  | { tipo: "modulo"; moduleId: string }
  | { tipo: "evaluacion" }
  | { tipo: "cobertura" };

export function fmtNum(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value).replaceAll(",", " ");
}

export function ProgressTrack({
  percent,
  className = "",
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`h-2 rounded-full bg-ink/10 overflow-hidden ${className}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${percent}%`,
          background: "linear-gradient(90deg, #6C0820, #E0879A)",
        }}
      />
    </div>
  );
}

export function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[12.5px] font-semibold text-white/85 whitespace-nowrap">
      {children}
    </span>
  );
}

/** Hero navy de cada vista, con Yaris opcional a la derecha. */
export function CourseHero({
  eyebrow,
  title,
  accent,
  description,
  meta,
  mascot = true,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  meta: string[];
  mascot?: boolean;
  compact?: boolean;
}) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "radial-gradient(120% 160% at 85% -20%, #33527F 0%, #22375C 45%, #1B2B4A 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        className={`relative mx-auto max-w-[1080px] px-5 sm:px-8 ${compact ? "py-10 lg:py-12" : "py-12 lg:py-16"} flex items-center gap-6`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-coral-300/70" />
            <span className="font-mono text-[11px] tracking-[0.24em] text-coral-300 uppercase">
              {eyebrow}
            </span>
          </div>
          <h1
            className={`font-display mt-4 text-white tracking-tight leading-[1.02] ${compact ? "text-[30px] sm:text-[40px] lg:text-[46px]" : "text-[36px] sm:text-[50px] lg:text-[58px]"}`}
          >
            {title}
            {accent && (
              <>
                {" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                    backgroundImage: "linear-gradient(92deg, #F2AEBC 10%, #7CA0D8 90%)",
                  }}
                >
                  {accent}
                </span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] lg:text-[17px] leading-relaxed text-white/65">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {meta.map((m) => (
              <MetaPill key={m}>{m}</MetaPill>
            ))}
          </div>
        </div>
        {mascot && (
          <div className="hidden md:block shrink-0" aria-hidden>
            <img
              src="/img/yaris-mini.png"
              alt=""
              width={230}
              height={230}
              className="w-[190px] lg:w-[230px] h-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function CourseShell({
  course,
  vista,
  percent,
  complete,
  menuOpen,
  onMenuToggle,
  onNavigate,
  children,
}: {
  course: Lp737Course;
  vista: CourseVista;
  percent: number;
  complete: number;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onNavigate: (vista: CourseVista) => void;
  children: ReactNode;
}) {
  const activeModule = vista.tipo === "modulo" ? vista.moduleId : null;
  const navItem = (active: boolean) =>
    `w-full flex items-start gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] leading-snug transition-colors ${
      active ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/6 hover:text-white/85"
    }`;

  const sidebar = (
    <aside
      aria-label="Ruta del curso"
      className="flex h-full w-[248px] shrink-0 flex-col bg-ink-950 text-white"
    >
      <Link
        to="/dashboard"
        aria-label="Volver al dashboard de FlightPath"
        className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4 hover:opacity-85 transition-opacity"
      >
        <img
          src="/img/flightpath-logo.png"
          alt=""
          width={30}
          height={30}
          className="h-[30px] w-[30px] rounded-[7px] object-cover"
        />
        <span className="font-display text-[19px] font-bold tracking-tight">
          Flight<span className="text-coral-300">Path</span>
        </span>
      </Link>
      <div className="border-b border-white/10 px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
          Ruta de aprendizaje
        </div>
        <div className="mt-1 text-[14.5px] font-bold">737 MAX · FCOM Rev. 16</div>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3" aria-label="Módulos">
        {course.modules.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-current={activeModule === m.id ? "page" : undefined}
            className={navItem(activeModule === m.id)}
            onClick={() => onNavigate({ tipo: "modulo", moduleId: m.id })}
          >
            <span className="font-mono text-[10px] pt-0.5 tracking-[0.12em] text-coral-300/80 shrink-0">
              M{m.id}
            </span>
            <span>{m.title}</span>
          </button>
        ))}
      </nav>
      <nav className="border-t border-white/10 px-2.5 py-2.5" aria-label="Herramientas">
        <button
          type="button"
          className={navItem(vista.tipo === "evaluacion")}
          aria-current={vista.tipo === "evaluacion" ? "page" : undefined}
          onClick={() => onNavigate({ tipo: "evaluacion" })}
        >
          <Icon n="brain" size={15} />
          <span className="text-[13px] font-semibold">Evaluación</span>
        </button>
        <button
          type="button"
          className={navItem(vista.tipo === "cobertura")}
          aria-current={vista.tipo === "cobertura" ? "page" : undefined}
          onClick={() => onNavigate({ tipo: "cobertura" })}
        >
          <Icon n="chart" size={15} />
          <span className="text-[13px] font-semibold">Cobertura</span>
        </button>
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center justify-between text-[12px] text-white/60">
          <span>Tu avance</span>
          <strong className="text-white">{percent}%</strong>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(90deg, #F2AEBC, #E0879A)",
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11.5px] text-white/45">
          <span>
            {complete} de {course.meta.lesson_count} lecciones
          </span>
          <button
            type="button"
            className="font-semibold text-coral-300 hover:text-white transition-colors"
            onClick={() => onNavigate({ tipo: "cobertura" })}
          >
            Detalle
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-bone text-ink-950" style={{ background: "#FBFAF7" }}>
      {/* Barra móvil */}
      <div className="flex items-center justify-between bg-ink-950 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => onNavigate({ tipo: "dashboard" })}
          className="flex items-center gap-2 text-white"
          aria-label="Ir al tablero de la ruta"
        >
          <img
            src="/img/flightpath-logo.png"
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px] rounded-md object-cover"
          />
          <span className="font-display text-[17px] font-bold">
            Flight<span className="text-coral-300">Path</span>
          </span>
        </button>
        <button
          type="button"
          aria-label={menuOpen ? "Cerrar temario" : "Abrir temario"}
          aria-expanded={menuOpen}
          onClick={onMenuToggle}
          className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white"
        >
          <Icon n={menuOpen ? "close" : "list"} size={18} />
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar fija en desktop */}
        <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>

        {/* Drawer móvil */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="h-full">{sidebar}</div>
            <button
              type="button"
              aria-label="Cerrar temario"
              className="h-full flex-1 bg-black/50"
              onClick={onMenuToggle}
            />
          </div>
        )}

        <main id="contenido" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
