import { ReferenceHome } from "@/components/landing/ReferenceHome";
import { useSessionUser } from "@/lib/store";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { PlaneField as SharedPlaneField } from "@/components/shared/PlaneField";
import {
  PRO_ANNUAL_FALLBACK,
  PRO_MONTHLY_FALLBACK,
  PRO_SETUP_FALLBACK,
  PRO_SETUP_LIST_PRICE,
  mesesAhorrados,
} from "@/lib/pricing";
import { SIM_TOTAL_QS } from "@/lib/store/materias";

/** Meses que se ahorran pagando el año completo (12 mensualidades vs anual). */
const ahorroMeses = mesesAhorrados(PRO_MONTHLY_FALLBACK, PRO_ANNUAL_FALLBACK);

/** Comprar lleva a crear cuenta y de ahí directo al checkout de Stripe. */
const BUY_HREF = `/register?next=${encodeURIComponent("/dashboard/planes?checkout=1")}`;

/*
 * El sistema de diseño público (Nav, Footer, Icon, Btn…) vive en
 * components/landing/shared: así las landings SEO no cargan el chunk de la
 * portada. Se re-exporta todo por compatibilidad con imports antiguos.
 */
export * from "@/components/landing/shared";
import {
  AeroBackdrop,
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

/* ═══════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={30} />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10 items-center">
          {/* LEFT */}
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

          {/* RIGHT */}
          <div className="relative lg:h-[480px] flex flex-col items-center justify-center gap-6 lg:block">
            <PathyBubble size={300} className="lg:absolute lg:right-2 lg:top-2" />
            <div className="hidden lg:block absolute left-0 top-6 w-[230px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon n="shield" className="w-3.5 h-3.5 text-coral-400" /> Tu progreso
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="3.4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="#C7A052"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      strokeDasharray="97.4"
                      strokeDashoffset="31"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center font-display text-white text-[15px]">
                    68%
                  </div>
                </div>
                <div className="text-white/70 text-[12.5px] leading-snug">
                  Vas por
                  <br />
                  <span className="text-white font-semibold">muy buen camino.</span>
                </div>
              </div>
            </div>
            <HeroPathyCard />
          </div>
        </div>
      </div>

      {/* data strip — cifras propias de la plataforma; nunca marcas de terceros (regla de compliance) */}
      <div className="border-y border-ink/8 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-haze-400">
            FlightPath en números
          </span>
          {[
            { n: "2,800+", t: "preguntas con explicación" },
            { n: String(SIM_TOTAL_QS), t: "preguntas por simulacro" },
            { n: "5", t: "fuentes de línea aérea" },
            { n: "6", t: "ejercicios de aptitud" },
            { n: null, t: "Entrevista RTARI por voz" },
            { n: null, t: "Tutor IA 24/7" },
          ].map((c) => (
            <span key={c.t} className="font-display text-[15px] text-ink/45 tracking-tight">
              {c.n && (
                <>
                  <CountUp value={c.n} className="text-ink/75" />{" "}
                </>
              )}
              {c.t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Tarjeta de Pathy en el héroe: rota mensajes motivacionales, de progreso y recordatorios. */
function HeroPathyCard() {
  const msgs: ReactNode[] = [
    <>
      Hoy toca <span className="text-coral-700 font-semibold">Meteorología</span>. Te preparé una
      sesión de 15 min — ¿despegamos?
    </>,
    <>
      Llevas <span className="text-coral-700 font-semibold">racha de 14 días</span>. La constancia
      es lo que te sube al avión.
    </>,
    <>
      Subiste <span className="text-coral-700 font-semibold">8% en Aerodinámica</span> esta semana.
      ¡Vas increíble!
    </>,
    <>
      Recuerda tu <span className="text-coral-700 font-semibold">simulador del jueves</span> — yo te
      aviso a tiempo.
    </>,
    <>
      Tu <span className="text-coral-700 font-semibold">entrevista RTARI</span> de práctica te
      espera: 10 minutos y sales hablando mejor.
    </>,
    <>
      Nuevo récord en <span className="text-coral-700 font-semibold">Slalom nivel 3</span> — tus
      aptitudes van subiendo.
    </>,
    <>
      Cada sesión te acerca al <span className="text-coral-700 font-semibold">CIAAC</span>. Un paso
      a la vez, sin estrés.
    </>,
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % msgs.length), 5200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="relative w-full max-w-[280px] lg:absolute lg:-bottom-2 lg:right-6 lg:w-[250px] bg-white rounded-2xl p-3.5 shadow-float border border-ink/8 animate-float-y"
      style={{ animationDelay: "-2s" }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-6 h-6 rounded-full bg-ink grid place-items-center">
          <Icon n="spark" className="w-3 h-3 text-coral-400" />
        </span>
        <span className="text-[12px] font-bold text-ink">Pathy</span>
        <span className="ml-auto">
          <Pill tone="coral">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
            en vivo
          </Pill>
        </span>
      </div>
      <p key={i} className="text-[12.5px] text-ink/65 leading-snug animate-flip min-h-[48px]">
        {msgs[i]}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RUTA COMPLETA — el mapa de la carrera (tesis del posicionamiento:
   FlightPath cubre todas las etapas de estudio del piloto, no solo una)
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Cinta de módulos estilo panel de salidas: decorativa (aria-hidden, el
 * contenido real está en las cards de abajo), contenido duplicado para que el
 * loop de media pista sea continuo.
 */
function ModulosTicker() {
  const items = [
    "PREPARACIÓN CIAAC",
    "ENTREVISTA RTARI",
    "PILOT APTITUDE TRAINER",
    "LÍNEA AÉREA · 5 FUENTES",
    "BIBLIOTECA + ANÁLISIS",
  ];
  const pista = [...items, ...items];
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-white/5 bg-ink py-3.5">
      <div className="flex w-max animate-marquee-x">
        {pista.map((t, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-mono text-[11px] tracking-[0.22em] text-white/40 whitespace-nowrap">
              {t}
            </span>
            <span className="mx-6 text-coral-400/70">
              <Icon n="plane" className="w-3.5 h-3.5" />
            </span>
          </span>
        ))}
      </div>
      {/* degradados laterales para que la cinta entre y salga suave */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}

function RutaCompleta() {
  const etapas: {
    icon: IconName;
    t: string;
    d: string;
    chips: string[];
    href: string;
  }[] = [
    {
      icon: "cards",
      t: "Examen CIAAC",
      d: "El filtro teórico de tu licencia comercial: las 12 materias con banco explicado, simulador en formato real y análisis por materia.",
      chips: ["2,800+ preguntas", `Simulador de ${SIM_TOTAL_QS}`, "12 materias"],
      href: "/modulos/ciaac",
    },
    {
      icon: "radio",
      t: "Inglés OACI · RTARI",
      d: "La entrevista en inglés se entrena hablando: un sinodal de voz te pregunta, te repregunta y te evalúa por las seis áreas OACI.",
      chips: ["Entrevista por voz", "Debrief 6 áreas", "Nivel 4+"],
      href: "/modulos/rtari",
    },
    {
      icon: "compass",
      t: "Aptitudes tipo COMPASS",
      d: "Coordinación, memoria, cálculo mental, orientación y multitarea: los ejercicios de las selecciones, jugables con teclado, mouse o touch.",
      chips: ["6 ejercicios", "5 niveles", "Simulacro 20 min"],
      href: "/modulos/compass",
    },
    {
      icon: "plane",
      t: "Convocatorias de línea aérea",
      d: "Las 5 fuentes del examen teórico — ATP, PHAK, Jeppesen, CPAM y Anexo 10 — por capítulos, con explicación en español.",
      chips: ["5 fuentes", "Por capítulos", "Simulacros"],
      href: "/modulos/linea-aerea",
    },
    {
      icon: "chart",
      t: "Biblioteca y análisis",
      d: "100+ manuales de consulta y el análisis que conecta todo: tu avance por materia, tu radar de aptitudes y lo que te toca hoy.",
      chips: ["100+ manuales", "Análisis por materia", "Pathy y Yaris"],
      href: "/modulos/biblioteca",
    },
  ];
  return (
    <section className="relative py-20 lg:py-28" id="ruta">
      <PlaneField count={22} />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHead
            center
            eyebrow="La ruta completa"
            title={
              <>
                Una carrera tiene etapas.
                <span className="block text-coral-600">Aquí se estudian todas.</span>
              </>
            }
            sub="La mejor plataforma de México para estudiar aviación: del examen teórico de tu licencia a los manuales de tu aeronave, pasando por el inglés y las pruebas de selección — todo en una sola cuenta."
          />
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {etapas.map((e, i) => (
            <Reveal key={e.t} delay={(i % 3) * 110} className="h-full">
              <a
                href={e.href}
                className="group relative block h-full rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 p-7 shadow-card hover-lift hover:shadow-lift overflow-hidden"
              >
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(199,160,82,0.25), transparent)",
                  }}
                />
                <div className="relative">
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-xl bg-ink grid place-items-center text-coral-400 group-hover:bg-coral-600 group-hover:text-white transition-colors">
                      <Icon n={e.icon} className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-display text-[21px] tracking-tight text-ink">{e.t}</h3>
                  <p className="text-[14px] text-ink/55 mt-2 leading-relaxed">{e.d}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {e.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink/55"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-coral-700 group-hover:text-coral-600 transition-colors">
                    Más información{" "}
                    <Icon
                      n="chevR"
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE  (Dashboard cycling through students)
   ═══════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════
   PATHY PHONE + COMPANION
   ═══════════════════════════════════════════════════════════════════ */


function Companion() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink shadow-navy">
          <div
            className="absolute -top-20 -right-16 w-96 h-96 rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(199,160,82,0.18), transparent)",
            }}
          />
          <div
            className="absolute -bottom-24 -left-10 w-96 h-96 rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(124,160,216,0.18), transparent)",
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            viewBox="0 0 1200 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path
              d="M-50 480 C 300 540, 700 360, 1100 460 S 1300 520, 1300 480"
              className="dash-line"
              stroke="#7CA0D8"
              strokeOpacity="0.3"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-14">
            <div>
              <Eyebrow light>Pathy · tu copiloto</Eyebrow>
              <h2 className="font-display mt-5 text-4xl lg:text-[52px] leading-[1.02] tracking-tight text-white">
                Pathy te cuida.
                <br />
                <span className="text-coral-400">Aunque cierres la app.</span>
              </h2>
              <p className="mt-5 text-[17px] text-white/65 leading-relaxed max-w-md">
                Pathy te escribe al teléfono en el momento justo: que es hora de estudiar, que no
                pierdas tu racha, o tu análisis de la semana. Recordatorios cálidos — nunca presión.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3.5 max-w-md">
                {[
                  "“Es hora de estudiar” a tu hora ideal",
                  "Te avisa antes de perder la racha",
                  "Tu análisis semanal, en un mensaje",
                  "Cuenta regresiva al CIAAC, sin estrés",
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-coral-600/20 grid place-items-center shrink-0 mt-0.5">
                      <Icon n="check" className="w-3 h-3 text-coral-400" sw={2.2} />
                    </span>
                    <span className="text-[14px] text-white/80">{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-9">
                <Btn kind="primary" size="lg" icon="arrow" to="/register">
                  Conoce a tu copiloto
                </Btn>
              </div>
            </div>
            <div className="relative">
              <PathyPhone />
            </div>
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
    {
      name: "Despegando",
      days: "1–3 días",
      token: "MISTY ROSE",
      color: "#EEE1C5",
      img: "/img/pathy-1-misty.png",
      copy: "Todo gran vuelo comienza con un pequeño paso.",
    },
    {
      name: "En progreso",
      days: "4–6 días",
      token: "CHERRY BLOSSOM",
      color: "#C7A052",
      img: "/img/pathy-2-pink.png",
      copy: "¡Vas por buen camino! Sigue así.",
    },
    {
      name: "En ruta",
      days: "7–13 días",
      token: "SILVER LAKE",
      color: "#5A86CB",
      img: "/img/pathy-3-blue.png",
      copy: "La constancia te está llevando lejos.",
    },
    {
      name: "Modo piloto",
      days: "14–30 días",
      token: "LAPIS LAZULI",
      color: "#163D70",
      img: "/img/pathy-4-pilot.png",
      copy: "¡Eres imparable! Sigue volando alto.",
    },
    {
      name: "Piloto élite",
      days: "30+ días",
      token: "BURGUNDY",
      color: "#7A5C1E",
      img: "/img/pathy-5-elite.png",
      copy: "Disciplina, enfoque y pasión. Nivel élite.",
    },
  ];
  const [active, setActive] = useState(3);
  const s = stages[active];
  const Avatar = ({
    src,
    size,
    scale = 1.32,
    ring,
  }: {
    src: string;
    size: number;
    scale?: number;
    ring?: string;
  }) => (
    <div
      className="relative rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        boxShadow: "inset 0 0 0 1px rgba(15,26,51,0.06)",
        outline: ring ? `2px solid ${ring}` : "none",
        outlineOffset: 3,
      }}
    >
      <img
        src={src}
        alt="Pathy"
        className="w-full h-full object-cover"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );

  return (
    <section className="relative py-24 lg:py-32">
      <PlaneField count={20} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Conoce a Pathy"
          title={
            <>
              Tu copiloto. <span className="text-burgundy">En cada etapa del vuelo.</span>
            </>
          }
          sub="Pathy evoluciona contigo: cuanto más constante seas, más alto vuela — y más te anima en cada etapa."
        />
        <div className="mt-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div
                className="w-72 h-72 rounded-full blur-3xl animate-breathe"
                style={{ background: s.color, opacity: 0.45 }}
              />
            </div>
            <div className="relative animate-float-y">
              <Avatar src={s.img} size={300} ring={s.color} />
            </div>
            <span className="absolute top-6 left-10 text-burgundy animate-twinkle">
              <Icon n="spark" className="w-5 h-5" />
            </span>
            <span
              className="absolute bottom-12 right-8 text-lapis animate-twinkle"
              style={{ animationDelay: ".6s" }}
            >
              <Icon n="spark" className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] font-bold border"
              style={{ background: s.color + "22", color: s.color, borderColor: s.color + "55" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              {s.token}
            </span>
            <div className="mt-5 font-display text-5xl lg:text-6xl text-ink tracking-tight">
              {s.name}
            </div>
            <div className="mt-2 text-burgundy/70 text-[12px] uppercase tracking-[0.2em] font-bold">
              {s.days} de racha
            </div>
            <p
              className="mt-6 text-xl text-ink/70 leading-relaxed max-w-md"
              style={{ fontStyle: "italic" }}
            >
              “{s.copy}”
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Btn
                kind="light"
                size="md"
                iconLeft="chevD"
                className="!rounded-full"
                onClick={() => setActive(Math.max(0, active - 1))}
              >
                Anterior
              </Btn>
              <Btn
                kind="primary"
                size="md"
                icon="arrow"
                onClick={() => setActive(Math.min(stages.length - 1, active + 1))}
              >
                Siguiente nivel
              </Btn>
            </div>
            <div className="mt-10 grid grid-cols-5 gap-2 sm:gap-3">
              {stages.map((st, i) => {
                const on = i === active;
                return (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`group rounded-2xl p-2.5 text-center border transition-all ${on ? "bg-white border-burgundy/25 shadow-card scale-105" : "bg-white/60 border-ink/8 hover:bg-white hover:border-burgundy/20"}`}
                  >
                    <div className="mx-auto" style={{ width: 56 }}>
                      <Avatar src={st.img} size={56} scale={1.3} />
                    </div>
                    <div
                      className={`mt-1.5 text-[10.5px] font-semibold leading-tight ${on ? "text-burgundy" : "text-ink/60"}`}
                    >
                      {st.name}
                    </div>
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


/* ═══════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   HISTORIAS  (anclada desde el nav como /#historias, igual que Precios)
   ═══════════════════════════════════════════════════════════════════ */

function Historias() {
  // Sin testimonios inventados: la plataforma abre con la generación 2026,
  // así que la sección cuenta el viaje real del estudiante y invita a
  // escribir las primeras historias.
  const etapas: { icon: IconName; fase: string; title: string; sub: string }[] = [
    {
      icon: "compass",
      fase: "Despegue",
      title: "Tu ruta se traza sola",
      sub: "Cuentas tu meta y tu fecha; FlightPath arma tu plan por materias y detecta desde el día uno dónde estás fuerte y dónde no.",
    },
    {
      icon: "flame",
      fase: "Crucero",
      title: "La constancia se vuelve racha",
      sub: "Sesiones cortas, cuestionarios que se adaptan y a Pathy recordándote volar un poco cada día. Los temas débiles se repiten hasta caer.",
    },
    {
      icon: "target",
      fase: "Aterrizaje",
      title: "El examen deja de ser incógnita",
      sub: "Simulacros cronometrados como el CIAAC real, una preparación medida materia por materia y la seguridad de llegar sabiendo cuánto sabes.",
    },
  ];
  return (
    <section id="historias" className="relative py-24 lg:py-32">
      <PlaneField count={16} />
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Historias"
          title={
            <>
              Las primeras historias <span className="text-coral-600">se están escribiendo.</span>
            </>
          }
          sub="FlightPath despega con la generación CIAAC 2026. Este es el viaje que cada estudiante recorre — y el lugar donde pronto estarán sus historias, con nombre y apellido."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {etapas.map((e, i) => (
            <div
              key={e.fase}
              className="relative rounded-3xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-7 lg:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl bg-ink text-coral-400 grid place-items-center">
                  <Icon n={e.icon} className="w-[22px] h-[22px]" />
                </span>
                <Coord>{`FASE ${String(i + 1).padStart(2, "0")} · ${e.fase.toUpperCase()}`}</Coord>
              </div>
              <h3 className="font-display mt-5 text-[19px] lg:text-[21px] tracking-tight text-ink">
                {e.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink/55">{e.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 relative rounded-[28px] border border-burgundy/10 bg-white shadow-lift overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(130% 150% at 0% 0%, rgba(242,220,219,0.55), rgba(255,255,255,0) 55%)",
            }}
          />
          <div className="relative px-7 lg:px-10 py-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h3 className="font-display text-[22px] lg:text-[26px] tracking-tight text-ink leading-snug">
                Tu historia puede ser <span className="text-coral-600">la primera.</span>
              </h3>
              <p className="mt-2 text-[14px] text-ink/55 leading-relaxed max-w-xl">
                Cuando apruebes tu CIAAC con FlightPath, este espacio contará cómo lo hiciste.
                Mientras tanto, las guías de estudio viven en el blog.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Btn kind="primary" size="md" icon="arrow" to="/register">
                Empezar mi historia
              </Btn>
              <Btn kind="light" size="md" to="/blog">
                Ir al blog
              </Btn>
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
        <div className="flex justify-center mb-8">
          <PathyBubble size={130} />
        </div>
        <h2 className="font-display text-5xl lg:text-[76px] leading-[0.98] tracking-tight text-ink">
          No es suerte.
          <br />
          <span className="text-coral-600">Es preparación.</span>
        </h2>
        <p className="mt-6 text-lg text-ink/55 max-w-xl mx-auto leading-relaxed">
          Si completas tu ruta de estudio y no notas una mejora real en tu preparación y seguridad
          para el CIAAC, extendemos tu acceso y ajustamos contigo tu plan de estudio.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" to="/register">
            Únete a FlightPath
          </Btn>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TWEAKS — inline sky-theme switcher (replaces the dev TweaksPanel)
   ═══════════════════════════════════════════════════════════════════ */

type Sky = "hueso" | "cherry" | "azul";
function ThemeSwitcher({
  sky,
  setSky,
  show,
  setShow,
}: {
  sky: Sky;
  setSky: (s: Sky) => void;
  show: boolean;
  setShow: (s: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50 font-mono text-[11px]">
      {open && (
        <div className="mb-3 w-[260px] rounded-2xl border border-ink/10 bg-white shadow-lift p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-[13px] text-ink">Cielo</span>
            <button onClick={() => setOpen(false)} className="text-ink/50 hover:text-ink">
              <Icon n="close" className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {(["hueso", "cherry", "azul"] as Sky[]).map((s) => (
              <button
                key={s}
                onClick={() => setSky(s)}
                className={`rounded-lg p-2 border transition-all ${sky === s ? "border-coral-600 bg-coral-50 text-coral-700" : "border-ink/10 text-ink/65 hover:border-ink/25"}`}
              >
                <span
                  className="block w-full h-5 rounded mb-1 border border-ink/8"
                  style={{
                    background:
                      s === "cherry"
                        ? "linear-gradient(180deg,#FBE7EC,#F6D9E1)"
                        : s === "azul"
                          ? "linear-gradient(180deg,#E7EFFB,#DAE6F6)"
                          : "linear-gradient(180deg,#F5F5F7,#F8F7F3)",
                  }}
                />
                <span className="text-[10.5px] font-semibold">{s}</span>
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between gap-3 text-ink/70">
            <span className="text-[12px]">Cuenta regresiva</span>
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
              className="accent-coral-600"
            />
          </label>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-ink text-white shadow-navy grid place-items-center hover:bg-ink-800 transition-colors"
        aria-label="Tema"
      >
        <Icon n="moon" className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════ */

function LandingPage() {
  return <ReferenceHome showcase={<Showcase />} pathy={<PathyPhone />} yaris={<YarisChat />} pricing={<Pricing />} />;
}
