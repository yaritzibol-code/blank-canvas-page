import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MATERIAS_DEF, SIM_TOTAL_QS } from "@/lib/store/materias";
import { ICONO_MATERIA } from "@/lib/seo/materias-iconos";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  SectionHead,
  type IconName,
} from "./index";

/**
 * Landing pública de feature para la búsqueda transaccional "simulador
 * CIAAC" (KPI del plan SEO). La app del simulador vive en /simulador
 * (requiere cuenta); esta página explica el formato y lleva al registro.
 */

const CANONICAL = "https://flightpath.mx/simulador-ciaac";
const PUBLICADO = "2026-08-06";

const RESPUESTA_CORTA = `El simulador CIAAC de FlightPath reproduce el formato del examen: ${SIM_TOTAL_QS} preguntas de las 12 materias con su reparto real, límite de 5 horas, preguntas en blanco contadas como error y calificación contra el estándar de referencia de 80%, con desglose por materia al terminar. La cuenta gratuita incluye un simulacro completo al mes.`;

const PASOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "play",
    titulo: "Inicia en condiciones reales",
    detalle: `${SIM_TOTAL_QS} preguntas, cronómetro de 5 horas corriendo y el mismo reparto por materia del examen. Puedes marcar preguntas para revisar antes de entregar.`,
  },
  {
    icon: "clock",
    titulo: "Entrena el reloj, no solo el temario",
    detalle:
      "Menos de un minuto por pregunta: el simulador te acostumbra al ritmo y a la fatiga de la hora cuatro — la parte del examen que los apuntes no entrenan.",
  },
  {
    icon: "chart",
    titulo: "Recibe tu veredicto con desglose",
    detalle:
      "Calificación contra el 80% de referencia y porcentaje por materia: sabes si habrías aprobado y exactamente dónde recuperar puntos.",
  },
  {
    icon: "target",
    titulo: "Convierte el resultado en plan",
    detalle:
      "Cada error enlaza su explicación y su tema. El análisis dirige tu siguiente semana de práctica a las materias que más te suben el promedio.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Cuántas preguntas tiene el simulador y cuánto dura?",
    a: `${SIM_TOTAL_QS} preguntas con límite de 5 horas, repartidas entre las 12 materias con la ponderación del examen: siete materias aportan 30 preguntas y cinco aportan 20.`,
  },
  {
    q: "¿Es gratis el simulador CIAAC?",
    a: "La cuenta Básica (gratuita, sin tarjeta) incluye un simulacro completo al mes — el mismo formato que en Pro. Con Pro los simulacros son ilimitados y se suman el banco completo y el análisis por materia.",
  },
  {
    q: "¿Las preguntas en blanco restan?",
    a: "Cuentan como error, igual que una respuesta incorrecta. Administrar el tiempo para responder todo es parte del entrenamiento que el simulador te obliga a practicar.",
  },
  {
    q: "¿El simulador es el examen oficial?",
    a: "No: es una réplica del formato (número de preguntas, tiempo y reparto por materia) con reactivos propios de FlightPath. El examen oficial lo aplica únicamente el CIAAC de la AFAC.",
  },
];

export const Route = createFileRoute("/simulador-ciaac")({
  component: SimuladorCiaacPage,
  head: () => ({
    meta: [
      {
        title: `Simulador CIAAC: ${SIM_TOTAL_QS} preguntas en formato real del examen | FlightPath`,
      },
      { name: "description", content: RESPUESTA_CORTA },
      {
        name: "keywords",
        content:
          "simulador ciaac, simulacro examen ciaac, examen de practica ciaac, simulador ciaac online, test ciaac completo",
      },
      {
        property: "og:title",
        content: `Simulador CIAAC — ${SIM_TOTAL_QS} preguntas, 5 horas, formato real`,
      },
      { property: "og:description", content: RESPUESTA_CORTA },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: `Simulador CIAAC — ${SIM_TOTAL_QS} preguntas, 5 horas, formato real`,
      },
      { name: "twitter:description", content: RESPUESTA_CORTA },
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
              "@type": "Article",
              headline: `Simulador CIAAC: ${SIM_TOTAL_QS} preguntas en el formato real del examen`,
              description: RESPUESTA_CORTA,
              inLanguage: "es-MX",
              datePublished: PUBLICADO,
              dateModified: PUBLICADO,
              author: { "@type": "Organization", name: "FlightPath", url: "https://flightpath.mx" },
              publisher: {
                "@type": "Organization",
                name: "FlightPath",
                url: "https://flightpath.mx",
              },
              mainEntityOfPage: CANONICAL,
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
                { "@type": "ListItem", position: 2, name: "Simulador CIAAC", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function SimuladorCiaacPage() {
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
      <main>
        <section className="relative">
          <PlaneField count={20} />
          <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-14 lg:pt-20 pb-14">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
                  <span className="text-[12px] font-semibold text-ink/70">
                    Simulador · Formato del examen
                  </span>
                </div>
                <h1 className="font-display mt-6 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
                  Simulador CIAAC:
                  <span className="block text-coral-600 mt-1">conócelo antes de presentarlo.</span>
                </h1>
                <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
                  {RESPUESTA_CORTA}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Btn kind="primary" size="lg" icon="arrow" to="/register">
                    Hacer mi simulacro gratis
                  </Btn>
                  <Btn kind="light" size="lg" iconLeft="book" href="#como-funciona">
                    Ver cómo funciona
                  </Btn>
                </div>
              </div>
              <div className="relative lg:h-[400px] flex items-center justify-center">
                <PathyBubble size={230} className="lg:absolute lg:right-4 lg:top-2" />
                <div className="hidden lg:block absolute left-0 bottom-6 w-[260px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                    <Coord light>SIM · CIAAC</Coord>
                    <Pill tone="light">Pregunta 47 / {SIM_TOTAL_QS}</Pill>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-white/80 text-[13px]">
                    <span>Tiempo restante</span>
                    <span className="font-mono text-coral-400">03:42:17</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[15%] rounded-full bg-coral-400" />
                  </div>
                  <div className="mt-3 text-[12px] text-white/50">
                    12 materias · en blanco = error
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-12 lg:py-16" id="como-funciona">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="Cómo funciona"
              title={
                <>
                  Cuatro vueltas <span className="text-coral-600">de tuerca al examen.</span>
                </>
              }
            />
            <div className="mt-12 grid sm:grid-cols-2 gap-4">
              {PASOS.map((p) => (
                <div
                  key={p.titulo}
                  className="rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-6"
                >
                  <span className="w-11 h-11 rounded-2xl bg-coral-50 text-coral-700 grid place-items-center">
                    <Icon n={p.icon} className="w-5 h-5" />
                  </span>
                  <h2 className="font-display mt-4 text-[18px] text-ink leading-snug tracking-tight">
                    {p.titulo}
                  </h2>
                  <p className="mt-2 text-[14px] text-ink/55 leading-relaxed">{p.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-14 lg:py-18" id="reparto">
          <PlaneField count={12} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="El reparto"
              title={
                <>
                  {SIM_TOTAL_QS} preguntas,{" "}
                  <span className="text-coral-600">materia por materia.</span>
                </>
              }
              sub="La ponderación del simulador es la del examen: estas son las preguntas que aporta cada materia."
            />
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MATERIAS_DEF.map((m) => (
                <a
                  key={m.slug}
                  href={`/ciaac/${m.slug}`}
                  className="group flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card px-4 py-3.5 hover:border-coral-300 hover:shadow-lift transition-all"
                >
                  <span className="w-9 h-9 rounded-xl bg-ink/5 text-ink grid place-items-center shrink-0 group-hover:bg-coral-50 group-hover:text-coral-700 transition-colors">
                    <Icon n={ICONO_MATERIA[m.slug] ?? "book"} className="w-[18px] h-[18px]" />
                  </span>
                  <span className="flex-1 text-[14px] font-semibold text-ink/80 leading-snug">
                    {m.name}
                  </span>
                  <span className="font-mono text-[12px] text-coral-700 shrink-0">
                    {m.simTotal}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-14 lg:py-18" id="faq">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="Preguntas frecuentes"
              title={
                <>
                  Sobre <span className="text-coral-600">el simulador.</span>
                </>
              }
            />
            <div className="mt-10 space-y-3">
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
          </div>
        </section>

        <section className="relative py-16 lg:py-22 pb-16">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <PathyBubble size={110} />
            </div>
            <h2 className="font-display text-[30px] lg:text-[44px] text-ink leading-tight">
              El examen no debería ser
              <span className="block text-coral-600">tu primer simulacro.</span>
            </h2>
            <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[540px] mx-auto">
              Haz el tuyo hoy: cuenta gratis, sin tarjeta, un simulacro completo al mes. Sabrás en
              cinco horas lo que meses de estudio a ciegas no te dicen.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Empezar mi simulacro
              </Btn>
              <Btn kind="light" size="lg" href="/calculadora-ciaac">
                Calcular mi plan de estudio
              </Btn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
