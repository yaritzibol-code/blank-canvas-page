import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { PROXIMO_CIAAC, PROXIMO_CIAAC_CORTO } from "@/lib/convocatoria";
import { PRO_MONTHLY_FALLBACK, PRO_SETUP_FALLBACK } from "@/lib/pricing";
import { MATERIAS_DEF } from "@/lib/store/materias";
import { ICONO_MATERIA } from "@/lib/seo/materias-iconos";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Eyebrow,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  SectionHead,
  type IconName,
} from "@/components/landing/shared";

/**
 * Landing SEO pública del examen CIAAC (Piloto Comercial · AFAC).
 *
 * Misma anatomía y sistema visual que la landing de la convocatoria: capta
 * búsquedas como "examen CIAAC", "CIAAC piloto comercial", "temario CIAAC" o
 * "simulador CIAAC" y lleva al registro. El temario y las cifras salen de las
 * mismas fuentes que usa la app (`MATERIAS_DEF`), no de números escritos a
 * mano, para que la landing no prometa algo distinto de lo que hay dentro.
 * Aloja la cuenta regresiva a la próxima aplicación registrada (fuente única
 * en lib/convocatoria; el bloque se oculta solo cuando la fecha vence).
 */

const CANONICAL = "https://flightpath.mx/ciaac";

/** El CTA aterriza en el registro; el estudio del CIAAC empieza gratis. */
const START_HREF = "/register";
const BUY_HREF = `/register?next=${encodeURIComponent("/dashboard/planes?checkout=1")}`;

/** Preguntas del simulador: la suma real del reparto por materia. */
const SIM_TOTAL = MATERIAS_DEF.reduce((n, m) => n + m.simTotal, 0);

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Qué es el examen CIAAC?",
    a: "Es el examen teórico del Centro Internacional de Adiestramiento de Aviación Civil (CIAAC) de la AFAC, en México. Es el que tienes que aprobar para obtener la licencia de Piloto Aviador Comercial. Evalúa las 12 materias del temario oficial en un solo examen.",
  },
  {
    q: "¿Cuántas preguntas tiene y cuánto dura?",
    a: `El simulador de FlightPath replica el formato del examen: ${SIM_TOTAL} preguntas con un límite de 5 horas, con el mismo reparto por materia y la calificación al terminar. Las que dejas en blanco cuentan como error, igual que en el examen real.`,
  },
  {
    q: "¿Cuál es la calificación mínima para aprobar?",
    a: "El estándar de referencia es 80%. El simulador de FlightPath usa ese mismo umbral para decirte si habrías aprobado, y te desglosa el resultado por materia para que sepas exactamente dónde estás fallando.",
  },
  {
    q: "¿Qué materias entran en el CIAAC?",
    a: `Son 12: ${MATERIAS_DEF.map((m) => m.name).join(", ")}. En FlightPath puedes practicar cada una por separado o mezclarlas en una sola sesión.`,
  },
  {
    q: "¿Puedo empezar gratis?",
    a: "Sí. Con la cuenta Básica practicas una parte del banco de preguntas y haces un simulador al mes. Pro abre el banco completo, el simulador ilimitado, la tutora con IA y el análisis por materia.",
  },
  {
    q: "¿FlightPath garantiza que apruebe el examen?",
    a: "No, y desconfía de quien lo prometa. FlightPath mide tu desempeño en práctica y simulacros y te dice qué te falta; la preparación estimada que verás es eso, una estimación de tu desempeño, no una garantía del resultado oficial.",
  },
];

const COMO_FUNCIONA: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: "cards",
    title: "Practica por materia",
    detail:
      "Elige una materia o mézclalas, decide cuántas preguntas y responde a tu ritmo con retroalimentación inmediata, explicación oficial y la fuente de cada reactivo.",
  },
  {
    icon: "target",
    title: "Simula el examen completo",
    detail: `${SIM_TOTAL} preguntas, 5 horas de límite y el mismo reparto por materia del examen real. Al terminar tienes tu calificación y el desglose de aciertos.`,
  },
  {
    icon: "spark",
    title: "Pregúntale a Yaris",
    detail:
      "La tutora con IA conoce la pregunta que tienes enfrente: te dice por qué la correcta es correcta, por qué las otras no y un tip para recordarlo. No te da la razón por complacerte.",
  },
  {
    icon: "chart",
    title: "Mide dónde estás",
    detail:
      "Pathy analiza tus datos reales —aciertos por materia, constancia y tu bitácora— y arma un plan concreto con lo que más te sube el promedio.",
  },
];

const INCLUYE: string[] = [
  "Banco de preguntas de las 12 materias, con explicación y fuente",
  `Simulador cronometrado de ${SIM_TOTAL} preguntas con calificación real`,
  "Yaris IA, tutora de aviación con el contexto de cada pregunta",
  "Biblioteca con los manuales oficiales, normativa y libros del curso",
  "Análisis de Pathy: fortalezas, huecos y plan de la semana",
  "Bitácora de estudio y recordatorios por WhatsApp",
];

export const Route = createFileRoute("/ciaac")({
  component: CiaacPage,
  head: () => ({
    meta: [
      { title: "Examen CIAAC — Piloto Comercial AFAC: temario, simulador y práctica | FlightPath" },
      {
        name: "description",
        content: `Prepárate para el examen CIAAC de Piloto Aviador Comercial (AFAC, México). Practica las 12 materias del temario oficial, haz simulacros de ${SIM_TOTAL} preguntas cronometrados y estudia con una tutora IA. Empieza gratis.`,
      },
      {
        name: "keywords",
        content:
          "examen CIAAC, CIAAC piloto comercial, temario CIAAC, simulador CIAAC, examen AFAC, piloto aviador comercial mexico, banco de preguntas CIAAC, DGAC examen teorico, aerodinamica meteorologia navegacion aerea",
      },
      { property: "og:title", content: "Examen CIAAC — Piloto Comercial AFAC | FlightPath" },
      {
        property: "og:description",
        content: `Las 12 materias del temario oficial, simulacros de ${SIM_TOTAL} preguntas y una tutora IA que te dice dónde estás fallando.`,
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Examen CIAAC — Piloto Comercial AFAC | FlightPath" },
      {
        name: "twitter:description",
        content: `Temario oficial, simulador de ${SIM_TOTAL} preguntas y análisis por materia. Empieza gratis.`,
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "Course",
              name: "Preparación para el examen CIAAC — Piloto Aviador Comercial (AFAC)",
              description:
                "Práctica de las 12 materias del temario oficial del CIAAC con banco de preguntas, simulador cronometrado, tutora IA y análisis de desempeño por materia.",
              inLanguage: "es-MX",
              url: CANONICAL,
              provider: {
                "@type": "Organization",
                name: "FlightPath",
                url: "https://flightpath.mx/",
              },
              offers: {
                "@type": "Offer",
                price: String(PRO_MONTHLY_FALLBACK.amount),
                priceCurrency: PRO_MONTHLY_FALLBACK.currency,
                category: "Paid",
                url: CANONICAL,
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                courseWorkload: "PT40H",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Inicio",
                  item: "https://flightpath.mx/",
                },
                { "@type": "ListItem", position: 2, name: "Examen CIAAC", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

/* ─────────────────────────── Secciones ─────────────────────────── */

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={24} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">
                AFAC · Piloto Aviador Comercial
              </span>
            </div>
            <h1 className="font-display mt-6 text-[40px] sm:text-[54px] lg:text-[60px] leading-[1.0] tracking-tight text-ink">
              Examen CIAAC:
              <span className="block text-coral-600 mt-1">prepáralo con datos, no con suerte.</span>
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-ink/55 max-w-xl leading-relaxed">
              Las 12 materias del temario oficial, simulacros cronometrados de {SIM_TOTAL} preguntas
              y una tutora que te dice exactamente dónde estás fallando. Empieza gratis.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
                Empezar gratis
              </Btn>
              <Btn kind="light" size="lg" iconLeft="book" href="#temario">
                Ver el temario
              </Btn>
            </div>
            <p className="mt-4 text-[12.5px] text-ink/45 flex items-center gap-1.5">
              <Icon n="shield" className="w-3.5 h-3.5" /> Sin tarjeta para empezar · Pro desde{" "}
              {PRO_MONTHLY_FALLBACK.amount.toLocaleString("es-MX")} {PRO_MONTHLY_FALLBACK.currency}
              /mes
            </p>
          </div>

          <div className="relative lg:h-[440px] flex items-center justify-center">
            <PathyBubble size={260} className="lg:absolute lg:right-4 lg:top-4" />
            <div className="hidden lg:block absolute left-0 bottom-8 w-[250px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon n="target" className="w-3.5 h-3.5 text-coral-400" /> Simulador CIAAC
              </div>
              <div className="text-white text-[14px] leading-snug">
                {SIM_TOTAL} preguntas, 5 horas,
                <br />
                <span className="text-coral-400 font-semibold">calificación al terminar.</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["12 materias", "80% para aprobar", "Por materia"].map((t) => (
                  <span
                    key={t}
                    className="text-[10.5px] font-mono text-white/70 border border-white/15 rounded-full px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlaneGlyph({
  className = "w-5 h-5",
  style,
  fill = "currentColor",
}: {
  className?: string;
  style?: CSSProperties;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        fill={fill}
        d="M21.5 15.5v-1.6l-7.8-4.9V3.6c0-.95-.77-1.7-1.7-1.7s-1.7.75-1.7 1.7v5.4l-7.8 4.9v1.6l7.8-2.45V18.4l-2.1 1.55v1.45L12 20.3l3.5 1.1v-1.45L13.4 18.4v-4.95l8.1 2.05z"
      />
    </svg>
  );
}

function Countdown() {
  // Próxima convocatoria CIAAC (hora Ciudad de México, UTC-6). Al pasar la
  // fecha el componente se oculta solo, en vez de quedarse clavado en 00:00:00.
  const target = useRef(new Date(PROXIMO_CIAAC).getTime());
  const [expired, setExpired] = useState(() => Date.now() >= target.current);
  const WINDOW = 90 * 24 * 3600 * 1000;
  const start = useRef(target.current - WINDOW);
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [prog, setProg] = useState(74);
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      if (now >= target.current) {
        setExpired(true);
        return;
      }
      let diff = Math.max(0, target.current - now);
      const d = Math.floor(diff / 86400000);
      diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);
      diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      setT({ d, h, m, s });
      const p = (now - start.current) / (target.current - start.current);
      setProg(Math.min(96, Math.max(4, p * 100)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (expired) return null;

  const Digit = ({ d }: { d: number }) => (
    <div className="relative overflow-hidden" style={{ height: "1em", width: "0.62em" }}>
      <div
        className="absolute inset-x-0 top-0"
        style={{
          transform: `translateY(${-d * 10}%)`,
          transition: "transform 0.75s cubic-bezier(.34,1.32,.42,1)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="flex items-center justify-center" style={{ height: "1em" }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
  const Unit = ({ v, l }: { v: number; l: string }) => {
    const s = String(v).padStart(2, "0");
    return (
      <div className="flex flex-col items-center">
        <div
          className="flex font-display text-[34px] lg:text-[40px] leading-none tabular-nums tracking-tight text-burgundy"
          style={{ height: "1em" }}
        >
          <Digit d={+s[0]} />
          <Digit d={+s[1]} />
        </div>
        <span className="mt-2.5 text-[10px] uppercase tracking-[0.18em] font-bold text-burgundy/55">
          {l}
        </span>
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
    <section className="relative" id="convocatoria">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8 -mt-6 lg:-mt-10 relative z-20">
        <div className="relative rounded-[28px] border border-burgundy/10 bg-white shadow-lift overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(130% 150% at 100% 0%, rgba(242,220,219,0.6), rgba(255,255,255,0) 55%)",
            }}
          />
          <div className="absolute -top-12 right-[14%] w-72 h-44 rounded-full bg-cherry/50 blur-3xl animate-breathe pointer-events-none" />

          <div className="relative px-5 sm:px-6 lg:px-10 py-7 sm:py-8 lg:py-9 grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-center">
            <div className="lg:border-r border-burgundy/10 lg:pr-10">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-lapis">
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse-dot" />
                CIAAC · Edición 2026
              </div>
              <div className="mt-4 flex items-end gap-3">
                <div className="font-display text-[76px] lg:text-[92px] leading-[0.82] tracking-tight text-burgundy">
                  {t.d}
                </div>
                <div className="pb-2.5">
                  <div className="font-display text-2xl lg:text-3xl text-ink leading-none">
                    días
                  </div>
                  <div className="text-[12.5px] text-ink/45 mt-1.5">para tu examen</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2.5 text-[13.5px] font-medium text-ink/55">
                <span className="w-5 h-px bg-burgundy/50" /> Cada sesión cuenta.
              </div>
              <a
                href="/calculadora-ciaac"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-burgundy hover:text-burgundy/75 transition-colors"
              >
                ¿Te alcanzan las horas? Calcula tu plan <Icon n="arrow" className="w-3.5 h-3.5" />
              </a>
            </div>

            <div>
              <div className="relative h-24 sm:h-20 px-1">
                <div className="absolute left-0 top-0 text-[10px] uppercase tracking-[0.16em] font-bold text-haze-400">
                  Hoy
                </div>
                <div className="absolute right-0 top-0 text-right">
                  <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-burgundy">
                    CIAAC
                  </div>
                  <div className="text-[10px] font-mono text-haze-400 mt-0.5">
                    {PROXIMO_CIAAC_CORTO}
                  </div>
                </div>
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-burgundy rounded-full"
                  style={{ width: `calc(${prog}% - 14px)` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-[2px] animate-flow"
                  style={{
                    left: `calc(${prog}% + 14px)`,
                    right: 0,
                    backgroundImage:
                      "repeating-linear-gradient(to right, rgba(61,93,145,0.45) 0 5px, transparent 5px 14px)",
                  }}
                />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-burgundy" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-burgundy ring-4 ring-cherry/40" />
                {[16, 33, 50, 67, 83].map((pos) => (
                  <div
                    key={pos}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                    style={{
                      left: `${pos}%`,
                      background: pos <= prog ? "#6C0820" : "transparent",
                      border: pos <= prog ? "none" : "1.5px solid rgba(61,93,145,0.4)",
                    }}
                  />
                ))}
                <div
                  className="absolute top-1/2"
                  style={{
                    left: `min(${prog}%, calc(100% - 26px))`,
                    transform: "translate(-50%,-50%)",
                    transition: "left 1s linear",
                  }}
                >
                  <div className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-burgundy/55 animate-radar" />
                  <div
                    className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-burgundy/45 animate-radar"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-burgundy/35 animate-radar"
                    style={{ animationDelay: "1.2s" }}
                  />
                  <div className="relative animate-float-y-sm">
                    <div className="absolute inset-0 -m-2 rounded-full bg-burgundy/25 blur-md animate-breathe" />
                    <div className="relative w-10 h-10 rounded-full bg-white shadow-card ring-1 ring-burgundy/10 grid place-items-center">
                      <PlaneGlyph className="w-5 h-5 rotate-90 animate-blink" fill="#6C0820" />
                    </div>
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-burgundy ring-2 ring-white animate-blink"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-end gap-5 lg:gap-7">
                <Unit v={t.d} l="Días" />
                <Sep />
                <Unit v={t.h} l="Horas" />
                <Sep />
                <Unit v={t.m} l="Min" />
                <Sep />
                <Unit v={t.s} l="Seg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueEs() {
  return (
    <section className="relative py-20 lg:py-24" id="que-es">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <SectionHead
            eyebrow="El examen"
            title={
              <>
                Qué es el <span className="text-coral-600">CIAAC.</span>
              </>
            }
            sub="El examen teórico del Centro Internacional de Adiestramiento de Aviación Civil, de la AFAC. Es el que separa a quien vuela por gusto de quien vuela por profesión."
          />
          <div className="space-y-3">
            {[
              {
                icon: "doc" as IconName,
                text: "Es el examen teórico para la licencia de Piloto Aviador Comercial en México.",
              },
              {
                icon: "book" as IconName,
                text: "Cubre 12 materias del temario oficial en una sola evaluación.",
              },
              {
                icon: "target" as IconName,
                text: "El estándar de referencia para aprobar es 80% de aciertos.",
              },
              {
                icon: "clock" as IconName,
                text: "Es largo: se sostiene con constancia, no con un fin de semana de estudio.",
              },
            ].map((r) => (
              <div
                key={r.text}
                className="flex items-start gap-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card px-5 py-4"
              >
                <span className="w-9 h-9 rounded-xl bg-coral-50 text-coral-700 grid place-items-center shrink-0">
                  <Icon n={r.icon} className="w-[18px] h-[18px]" />
                </span>
                <span className="text-[14.5px] text-ink/70 leading-relaxed">{r.text}</span>
              </div>
            ))}
            <div className="pt-2">
              <Coord>FUENTE · TEMARIO OFICIAL DEL CIAAC — AFAC</Coord>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Temario() {
  return (
    <section className="relative py-20 lg:py-28" id="temario">
      <PlaneField count={16} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 relative z-10">
        <SectionHead
          center
          eyebrow="Temario oficial"
          title={
            <>
              Las 12 materias, <span className="text-coral-600">una por una.</span>
            </>
          }
          sub="Cada materia tiene su propio banco de preguntas con explicación y fuente. Practícalas por separado o mézclalas en una sola sesión."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MATERIAS_DEF.map((m, i) => (
            <a
              key={m.slug}
              href={`/ciaac/${m.slug}`}
              className="group rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-6 flex flex-col gap-3 hover:border-coral-300 hover:shadow-lift transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-ink/5 text-ink grid place-items-center group-hover:bg-coral-50 group-hover:text-coral-700 transition-colors">
                  <Icon n={ICONO_MATERIA[m.slug] ?? "book"} className="w-5 h-5" />
                </span>
                <span className="font-mono text-[11px] text-ink/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-[18px] text-ink leading-snug">{m.name}</h3>
              <p className="text-[13.5px] text-ink/50 leading-relaxed">
                {m.simTotal} preguntas dentro del simulador.
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral-700 group-hover:text-coral-600 transition-colors">
                Guía de la materia <Icon n="chevR" className="w-3.5 h-3.5" />
              </span>
            </a>
          ))}
        </div>
        <p className="mt-10 text-center text-[13px] text-ink/45">
          El simulador reparte {SIM_TOTAL} preguntas entre las 12 materias, con el mismo peso del
          examen real.
        </p>
      </div>
    </section>
  );
}

function ComoFunciona() {
  return (
    <section className="relative py-20 lg:py-28" id="como-funciona">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Cómo se estudia"
          title={
            <>
              Practicar, simular, <span className="text-coral-600">corregir.</span>
            </>
          }
          sub="No es leer y esperar. Es medir dónde estás, atacar el hueco y volver a medir."
        />
        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {COMO_FUNCIONA.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-7"
            >
              <span className="w-11 h-11 rounded-xl bg-coral-50 text-coral-700 grid place-items-center mb-4">
                <Icon n={c.icon} className="w-5 h-5" />
              </span>
              <h3 className="font-display text-[19px] text-ink mb-2">{c.title}</h3>
              <p className="text-[14px] text-ink/55 leading-relaxed">{c.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[14px] text-ink/55 max-w-[700px] mx-auto leading-relaxed">
          Y el CIAAC es solo la primera puerta: en la misma cuenta practicas la{" "}
          <a href="/examen-rtari" className="font-semibold text-coral-700 hover:text-coral-600">
            entrevista en inglés del RTARI
          </a>
          , entrenas{" "}
          <a href="/examen-compass" className="font-semibold text-coral-700 hover:text-coral-600">
            aptitudes tipo COMPASS
          </a>{" "}
          para selecciones y estudias{" "}
          <a href="/estudiar-737-max" className="font-semibold text-coral-700 hover:text-coral-600">
            el 737 MAX por capítulos
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function Incluye() {
  return (
    <section className="relative py-20 lg:py-24" id="incluye">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="rounded-3xl bg-ink shadow-navy px-8 py-12 lg:px-14 lg:py-16 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(242,174,188,.16) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
            <div>
              <Eyebrow light>Tu acceso</Eyebrow>
              <h2 className="font-display text-[30px] lg:text-[38px] text-white leading-tight mt-4">
                Todo lo que necesitas para el <span className="text-coral-400">CIAAC</span>.
              </h2>
              <p className="mt-5 text-[15px] text-white/60 leading-relaxed">
                Empieza gratis con la cuenta Básica. Pro abre el banco completo y el simulador sin
                límite, con un pago único de inscripción de{" "}
                {PRO_SETUP_FALLBACK.amount.toLocaleString("es-MX")} {PRO_SETUP_FALLBACK.currency} y
                desde {PRO_MONTHLY_FALLBACK.amount.toLocaleString("es-MX")}{" "}
                {PRO_MONTHLY_FALLBACK.currency} al mes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
                  Crear mi cuenta gratis
                </Btn>
                <Btn kind="ghostLight" size="lg" href={BUY_HREF}>
                  Ver Pro
                </Btn>
              </div>
            </div>
            <ul className="space-y-3">
              {INCLUYE.map((x) => (
                <li
                  key={x}
                  className="flex items-start gap-3 text-[14.5px] text-white/75 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-coral-400/20 text-coral-400 grid place-items-center shrink-0 mt-0.5">
                    <Icon n="check" className="w-3 h-3" />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreguntasFrecuentes() {
  return (
    <section className="relative py-20 lg:py-28" id="faq">
      <div className="mx-auto max-w-[880px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Preguntas frecuentes"
          title={
            <>
              Lo que todos <span className="text-coral-600">preguntan.</span>
            </>
          }
        />
        <div className="mt-12 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-6 py-5"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15.5px] font-semibold text-ink">
                <h3 style={{ margin: 0, font: "inherit" }}>{f.q}</h3>
                <span className="text-coral-600 shrink-0 transition-transform group-open:rotate-180">
                  <Icon n="chevD" className="w-4 h-4" />
                </span>
              </summary>
              <p className="mt-4 text-[14.5px] text-ink/60 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-[13.5px] text-ink/50">
          ¿Más dudas? El{" "}
          <a href="/respuestas" className="font-semibold text-coral-700 hover:text-coral-600">
            centro de respuestas
          </a>{" "}
          responde una por una las preguntas más buscadas del CIAAC.
        </p>
      </div>
    </section>
  );
}

function Aviso() {
  return (
    <section className="relative pb-16">
      <div className="mx-auto max-w-[880px] px-6 lg:px-8">
        <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
          <strong className="text-ink/70">Aviso.</strong> FlightPath es una plataforma independiente
          de preparación. No está afiliada a la AFAC ni al CIAAC, no aplica el examen oficial ni
          expide licencias, y la preparación estimada que verás mide tu desempeño en práctica: no
          garantiza el resultado del examen. Consulta siempre las convocatorias y requisitos en las
          fuentes oficiales.
        </div>
      </div>
    </section>
  );
}

function CierreCta() {
  return (
    <section className="relative py-20 lg:py-28">
      <PlaneField count={14} />
      <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center relative z-10">
        <div className="flex justify-center mb-8">
          <PathyBubble size={120} />
        </div>
        <Pill>Empieza hoy</Pill>
        <h2 className="font-display text-[32px] lg:text-[44px] text-ink leading-tight mt-5">
          El CIAAC no se aprueba leyendo.
          <span className="block text-coral-600">Se aprueba practicando.</span>
        </h2>
        <p className="mt-6 text-[16px] text-ink/55 leading-relaxed max-w-[560px] mx-auto">
          Crea tu cuenta y haz tu primer cuestionario hoy. En veinte preguntas ya sabes por dónde
          empezar.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
            Empezar gratis
          </Btn>
          <Btn kind="light" size="lg" href="/convocatoria-aeromexico">
            Voy por línea aérea
          </Btn>
        </div>
      </div>
    </section>
  );
}

function CiaacPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="sky-base min-h-screen">
      <AeroBackdrop />
      <Nav />
      <Hero />
      <Countdown />
      <QueEs />
      <Temario />
      <ComoFunciona />
      <Incluye />
      <PreguntasFrecuentes />
      <Aviso />
      <CierreCta />
      <Footer />
    </div>
  );
}
