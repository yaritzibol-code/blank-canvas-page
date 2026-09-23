import { ReferenceHome } from "@/components/landing/ReferenceHome";
import { useSessionUser } from "@/lib/store";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  PRO_ANNUAL_FALLBACK,
  PRO_MONTHLY_FALLBACK,
  mesesAhorrados,
} from "@/lib/pricing";
import { SIM_TOTAL_QS } from "@/lib/store/materias";

// Re-export shared landing components
export * from "@/components/landing/shared";
import {
  Btn,
  Coord,
  CountUp,
  Eyebrow,
  Footer,
  Icon,
  Logo,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  Reveal,
  SectionHead,
  type IconName,
} from "@/components/landing/shared";

// Lazy loaded sections - heavy interactive components
const Showcase = lazy(() => import("@/components/landing/sections/Showcase").then(m => ({ default: m.Showcase })));
const PathyPhone = lazy(() => import("@/components/landing/sections/PathyPhone").then(m => ({ default: m.PathyPhone })));
const YarisChat = lazy(() => import("@/components/landing/sections/YarisChat").then(m => ({ default: m.YarisChat })));
const Pricing = lazy(() => import("@/components/landing/sections/Pricing").then(m => ({ default: m.Pricing })));

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "FlightPath — Estudia aviación en México: CIAAC, línea aérea e inglés" },
      {
        name: "description",
        content:
          "La plataforma de México para estudiar aviación: banco CIAAC de 2,800+ preguntas con explicación, simulador de 310, entrevista RTARI en inglés por voz y aptitudes tipo COMPASS. Empieza gratis.",
      },
      {
        property: "og:title",
        content: "FlightPath — Estudia aviación en México: CIAAC, línea aérea e inglés",
      },
      {
        property: "og:description",
        content:
          "Banco CIAAC de 2,800+ preguntas con explicación, simulador de 310, inglés RTARI por voz, aptitudes tipo COMPASS y manuales. Empieza gratis.",
      },
      { property: "og:url", content: "https://flightpath.mx/" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://flightpath.mx/" },
      { rel: "preload", as: "image", href: "/img/pathy-cloud.png", fetchPriority: "high" },
    ],
  }),
});

function Companion() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink shadow-navy">
          <div className="absolute -top-20 -right-16 w-96 h-96 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(199,160,82,0.18), transparent)" }} />
          <div className="absolute -bottom-24 -left-10 w-96 h-96 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(124,160,216,0.18), transparent)" }} />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-14">
            <div>
              <Eyebrow light>Pathy · tu copiloto</Eyebrow>
              <h2 className="font-display mt-5 text-4xl lg:text-[52px] leading-[1.02] tracking-tight text-white">Pathy te cuida.<br /><span className="text-coral-400">Aunque cierres la app.</span></h2>
              <p className="mt-5 text-[17px] text-white/65 leading-relaxed max-w-md">Pathy te escribe al teléfono en el momento justo: que es hora de estudiar, que no pierdas tu racha, o tu análisis de la semana. Recordatorios cálidos — nunca presión.</p>
              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3.5 max-w-md">
                {[
                  { ic: "bell", t: "Recordatorios de estudio" },
                  { ic: "flame", t: "Alertas de racha activa" },
                  { ic: "chart", t: "Tu análisis semanal" },
                  { ic: "spark", t: "Tips personalizados" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center text-coral-400 shrink-0"><Icon n={f.ic as IconName} className="w-4 h-4" /></div>
                    <span className="text-[14px] font-semibold text-white/80">{f.t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Suspense fallback={<div className="h-[486px] w-[272px] bg-white/5 animate-pulse rounded-[2.4rem] mx-auto" />}>
                <PathyPhone />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Sky = "hueso" | "cherry" | "azul";
function ThemeSwitcher({ sky, setSky, show, setShow }: { sky: Sky; setSky: (s: Sky) => void; show: boolean; setShow: (s: boolean) => void; }) {
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
              <button key={s} onClick={() => setSky(s)} className={`rounded-lg p-2 border transition-all ${sky === s ? "border-coral-600 bg-coral-50 text-coral-700" : "border-ink/10 text-ink/65 hover:border-ink/25"}`}>
                <span className="block w-full h-5 rounded mb-1 border border-ink/8" style={{ background: s === "cherry" ? "linear-gradient(180deg,#FBE7EC,#F6D9E1)" : s === "azul" ? "linear-gradient(180deg,#E7EFFB,#DAE6F6)" : "linear-gradient(180deg,#F5F5F7,#F8F7F3)" }} />
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
      <button onClick={() => setOpen(!open)} className="w-11 h-11 rounded-full bg-ink text-white shadow-navy grid place-items-center hover:bg-ink-800 transition-colors" aria-label="Tema">
        <Icon n="moon" className="w-4 h-4" />
      </button>
    </div>
  );
}

function LandingPage() {
  const [sky, setSky] = useState<Sky>("hueso");
  const [showCountdown, setShowCountdown] = useState(true);

  return (
    <>
      <ReferenceHome 
        showcase={
          <Suspense fallback={<div className="h-[600px] bg-white/5 animate-pulse rounded-[28px]" />}>
            <Showcase />
          </Suspense>
        } 
        pathy={<Companion />} 
        yaris={
          <Suspense fallback={<div className="h-[600px] bg-white/5 animate-pulse rounded-3xl" />}>
            <YarisChat />
          </Suspense>
        } 
        pricing={
          <Suspense fallback={<div className="h-[600px] bg-white/5 animate-pulse rounded-3xl" />}>
            <Pricing />
          </Suspense>
        } 
      />
      <ThemeSwitcher sky={sky} setSky={setSky} show={showCountdown} setShow={setShowCountdown} />
    </>
  );
}
