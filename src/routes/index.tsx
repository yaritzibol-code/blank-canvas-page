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

// Lazy loaded sections
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

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={30} />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">
                La mejor plataforma de México para estudiar aviación
              </span>
            </div>
            <h1 className="font-display mt-6 text-[44px] sm:text-[58px] lg:text-[66px] leading-[0.98] tracking-tight text-ink">
              Todo lo que estudia
              <br className="hidden sm:block" /> un piloto.
              <span className="block text-coral-600 mt-1">En un solo lugar.</span>
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-ink/55 max-w-xl leading-relaxed">
              Banco CIAAC, fuentes de línea aérea (ATP, PHAK, Jeppesen), aptitudes tipo COMPASS,
              entrevista RTARI en inglés — con un copiloto IA que aprende
              cómo estudias y construye tu ruta.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Comenzar gratis
              </Btn>
              <Btn kind="light" size="lg" iconLeft="play" href="#como-funciona">
                Ver cómo funciona
              </Btn>
            </div>
          </div>
          <div className="relative lg:h-[480px] flex flex-col items-center justify-center gap-6 lg:block">
            <PathyBubble size={300} className="lg:absolute lg:right-2 lg:top-2" />
            <div className="hidden lg:block absolute left-0 top-6 w-[230px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon n="shield" className="w-3.5 h-3.5" /> Tu progreso
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.4" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#C7A052" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="31" />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center font-display text-white text-[15px]">68%</div>
                </div>
                <div className="text-white/70 text-[12.5px] leading-snug">Vas por<br /><span className="text-white font-semibold">muy buen camino.</span></div>
              </div>
            </div>
            <HeroPathyCard />
          </div>
        </div>
      </div>
      <div className="border-y border-ink/8 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-haze-400">FlightPath en números</span>
          {[
            { n: "2,800+", t: "preguntas con explicación" },
            { n: String(SIM_TOTAL_QS), t: "preguntas por simulacro" },
            { n: "5", t: "fuentes de línea aérea" },
            { n: "6", t: "ejercicios de aptitud" },
            { n: null, t: "Entrevista RTARI por voz" },
            { n: null, t: "Tutor IA 24/7" },
          ].map((c) => (
            <span key={c.t} className="font-display text-[15px] text-ink/45 tracking-tight">
              {c.n && <><CountUp value={c.n} className="text-ink/75" /> </>}{c.t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroPathyCard() {
  const msgs = [
    <>Hoy toca <span className="text-coral-700 font-semibold">Meteorología</span>. Te preparé una sesión de 15 min — ¿despegamos?</>,
    <>Llevas <span className="text-coral-700 font-semibold">racha de 14 días</span>. La constancia es lo que te sube al avión.</>,
    <>Subiste <span className="text-coral-700 font-semibold">8% en Aerodinámica</span> esta semana. ¡Vas increíble!</>,
    <>Recuerda tu <span className="text-coral-700 font-semibold">simulador del jueves</span> — yo te aviso a tiempo.</>,
    <>Tu <span className="text-coral-700 font-semibold">entrevista RTARI</span> de práctica te espera: 10 minutos y sales hablando mejor.</>,
    <>Nuevo récord en <span className="text-coral-700 font-semibold">Slalom nivel 3</span> — tus aptitudes van subiendo.</>,
    <>Cada sesión te acerca al <span className="text-coral-700 font-semibold">CIAAC</span>. Un paso a la vez, sin estrés.</>,
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % msgs.length), 5200);
    return () => clearInterval(id);
  }, [msgs.length]);
  return (
    <div className="relative w-full max-w-[280px] lg:absolute lg:-bottom-2 lg:right-6 lg:w-[250px] bg-white rounded-2xl p-3.5 shadow-float border border-ink/8 animate-float-y" style={{ animationDelay: "-2s" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-6 h-6 rounded-full bg-ink grid place-items-center"><Icon n="spark" className="w-3 h-3 text-coral-400" /></span>
        <span className="text-[12px] font-bold text-ink">Pathy</span>
        <span className="ml-auto"><Pill tone="coral"><span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />en vivo</Pill></span>
      </div>
      <p key={i} className="text-[12.5px] text-ink/65 leading-snug animate-flip min-h-[48px]">{msgs[i]}</p>
    </div>
  );
}

function RutaCompleta() {
  const etapas: { icon: IconName; t: string; d: string; chips: string[]; href: string }[] = [
    { icon: "cards", t: "Examen CIAAC", d: "El filtro teórico de tu licencia comercial: las 12 materias con banco explicado, simulador en formato real y análisis por materia.", chips: ["2,800+ preguntas", `Simulador de ${SIM_TOTAL_QS}`, "12 materias"], href: "/modulos/ciaac" },
    { icon: "radio", t: "Inglés OACI · RTARI", d: "La entrevista en inglés se entrena hablando: un sinodal de voz te pregunta, te repregunta y te evalúa por las seis áreas OACI.", chips: ["Entrevista por voz", "Debrief 6 áreas", "Nivel 4+"], href: "/modulos/rtari" },
    { icon: "compass", t: "Aptitudes tipo COMPASS", d: "Coordinación, memoria, cálculo mental, orientación y multitarea: los ejercicios de las selecciones, jugables con teclado, mouse o touch.", chips: ["6 ejercicios", "5 niveles", "Simulacro 20 min"], href: "/modulos/compass" },
    { icon: "plane", t: "Convocatorias de línea aérea", d: "Las 5 fuentes del examen teórico — ATP, PHAK, Jeppesen, CPAM y Anexo 10 — por capítulos, con explicación en español.", chips: ["5 fuentes", "Por capítulos", "Simulacros"], href: "/modulos/linea-aerea" },
    { icon: "chart", t: "Biblioteca y análisis", d: "100+ manuales de consulta y el análisis que conecta todo: tu avance por materia, tu radar de aptitudes y lo que te toca hoy.", chips: ["100+ manuales", "Análisis por materia", "Pathy y Yaris"], href: "/modulos/biblioteca" },
  ];
  return (
    <section className="relative py-20 lg:py-28" id="ruta">
      <PlaneField count={22} />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHead center eyebrow="La ruta completa" title={<>Una carrera tiene etapas.<span className="block text-coral-600">Aquí se estudian todas.</span></>} sub="La mejor plataforma de México para estudiar aviación: del examen teórico de tu licencia a los manuales de tu aeronave, pasando por el inglés y las pruebas de selección — todo en una sola cuenta." />
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {etapas.map((e, i) => (
            <Reveal key={e.t} delay={(i % 3) * 110} className="h-full">
              <a href={e.href} className="group relative block h-full rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 p-7 shadow-card hover-lift hover:shadow-lift overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(closest-side, rgba(199,160,82,0.25), transparent)" }} />
                <div className="relative">
                  <div className="mb-6"><div className="w-12 h-12 rounded-xl bg-ink grid place-items-center text-coral-400 group-hover:bg-coral-600 group-hover:text-white transition-colors"><Icon n={e.icon} className="w-6 h-6" /></div></div>
                  <h3 className="font-display text-[21px] tracking-tight text-ink">{e.t}</h3>
                  <p className="text-[14px] text-ink/55 mt-2 leading-relaxed">{e.d}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">{e.chips.map((c) => (<span key={c} className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink/55">{c}</span>))}</div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-coral-700 group-hover:text-coral-600 transition-colors">Más información <Icon n="chevR" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

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

function FinalCta() {
  return (
    <section className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8"><PathyBubble size={130} /></div>
        <h2 className="font-display text-5xl lg:text-[76px] leading-[0.98] tracking-tight text-ink">No es suerte.<br /><span className="text-coral-600">Es preparación.</span></h2>
        <p className="mt-6 text-lg text-ink/55 max-w-xl mx-auto leading-relaxed">Si completas tu ruta de estudio y no notas una mejora real en tu preparación y seguridad para el CIAAC, extendemos tu acceso y ajustamos contigo tu plan de estudio.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3"><Btn kind="primary" size="lg" icon="arrow" to="/register">Únete a FlightPath</Btn></div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
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
  );
}
