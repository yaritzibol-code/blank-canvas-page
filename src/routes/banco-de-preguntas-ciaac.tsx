import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MATERIAS_DEF } from "@/lib/store/materias";
import { MATERIAS_SEO, type PreguntaMuestra } from "@/lib/seo/materias-seo";
import { PRO_MONTHLY_FALLBACK, formatPrice } from "@/lib/pricing";
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
} from "@/components/landing/shared";

/**
 * Landing de feature para la búsqueda transaccional "banco de preguntas
 * CIAAC" (KPI del plan SEO). Muestra preguntas reales de las guías (las
 * mismas de /ciaac/$materia) para que la calidad sea auditable antes de
 * crear cuenta.
 */

const CANONICAL = "https://flightpath.mx/banco-de-preguntas-ciaac";
const PUBLICADO = "2026-08-06";

const RESPUESTA_CORTA =
  "El banco de FlightPath tiene más de 2,800 preguntas propias del temario CIAAC, cada una con explicación del porqué y fuente citada, organizadas por las 12 materias y sus temas. Se practica por materia o mezclado, alimenta simulacros cronometrados y registra tus aciertos para dirigir el repaso. La cuenta gratuita incluye una muestra por materia.";

const RASGOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "cards",
    titulo: "Explicación y fuente en cada reactivo",
    detalle:
      "El porqué de la respuesta correcta es el material de estudio real. Cada pregunta cita su fuente para que puedas verificar y profundizar.",
  },
  {
    icon: "grid",
    titulo: "Organizado por materia y tema",
    detalle:
      "Las 12 materias del temario, desglosadas por tema: practicas exactamente el frente donde estás fallando, no preguntas al azar.",
  },
  {
    icon: "chart",
    titulo: "Conectado a tu análisis",
    detalle:
      "Cada respuesta alimenta tu estadística por materia y tema. El banco no solo te entrena: te dice con datos dónde seguir.",
  },
  {
    icon: "shield",
    titulo: "Propio e independiente",
    detalle:
      "Desarrollado de forma independiente y mapeado al temario oficial publicado. Sin material de origen dudoso: estudiable y defendible.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Cuántas preguntas tiene el banco de FlightPath?",
    a: "Más de 2,800 reactivos propios del temario CIAAC, en crecimiento continuo, todos con explicación y fuente. Además, el simulador reparte 310 de ellos con la ponderación por materia del examen.",
  },
  {
    q: "¿Puedo probar el banco gratis?",
    a: "Sí. La cuenta Básica (sin tarjeta) incluye una muestra del banco por materia y un simulacro completo al mes. El banco completo se desbloquea con Pro.",
  },
  {
    q: "¿Las preguntas son las del examen oficial?",
    a: "No, y desconfía de quien te ofrezca eso: el banco es propio, desarrollado de forma independiente sobre el temario publicado. Su valor está en la explicación, la organización y la medición.",
  },
  {
    q: "¿El banco se actualiza?",
    a: "Sí: el equipo corrige, amplía y re-mapea reactivos de forma continua, y dentro de la plataforma puedes reportar cualquier pregunta para revisión.",
  },
];

/** Dos preguntas de muestra reales, tomadas de las guías por materia. */
const MUESTRAS: { materia: string; slug: string; pregunta: PreguntaMuestra }[] = [
  {
    materia: "Aerodinámica",
    slug: "aerodinamica",
    pregunta: MATERIAS_SEO["aerodinamica"].muestra[0],
  },
  {
    materia: "Meteorología",
    slug: "meteorologia",
    pregunta: MATERIAS_SEO["meteorologia"].muestra[2],
  },
];

export const Route = createFileRoute("/banco-de-preguntas-ciaac")({
  component: BancoPreguntasPage,
  head: () => ({
    meta: [
      { title: "Banco de preguntas CIAAC: 2,800+ reactivos con explicación | FlightPath" },
      { name: "description", content: RESPUESTA_CORTA },
      {
        name: "keywords",
        content:
          "banco de preguntas ciaac, preguntas examen ciaac, reactivos ciaac, cuestionario ciaac por materia, preguntas piloto comercial con explicacion",
      },
      { property: "og:title", content: "Banco de preguntas CIAAC — 2,800+ reactivos explicados" },
      { property: "og:description", content: RESPUESTA_CORTA },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Banco de preguntas CIAAC — 2,800+ reactivos explicados" },
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
              headline: "Banco de preguntas CIAAC: 2,800+ reactivos con explicación y fuente",
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
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Banco de preguntas CIAAC",
                  item: CANONICAL,
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function MuestraCard({
  materia,
  slug,
  pregunta,
}: {
  materia: string;
  slug: string;
  pregunta: PreguntaMuestra;
}) {
  const letters = ["A", "B", "C", "D"];
  return (
    <article className="rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <Coord>{`MUESTRA · ${materia.toUpperCase()}`}</Coord>
        <Pill tone="coral">Del banco</Pill>
      </div>
      <h3 className="font-display mt-4 text-[18px] lg:text-[20px] text-ink leading-snug tracking-tight">
        {pregunta.q}
      </h3>
      <div className="mt-4 grid gap-2.5">
        {pregunta.opts.map((o, i) => {
          const ok = i === pregunta.correct;
          return (
            <div
              key={o}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 ${ok ? "border-emerald-500 bg-emerald-50" : "border-ink/8 opacity-70"}`}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-lg grid place-items-center text-xs font-bold ${ok ? "bg-emerald-500 text-white" : "bg-ink/5 text-ink/55"}`}
              >
                {ok ? <Icon n="check" className="w-3.5 h-3.5" sw={2.4} /> : letters[i]}
              </span>
              <span className="text-[13.5px] text-ink/85">{o}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3.5 rounded-2xl bg-misty/40 border border-cherry/40 p-4">
        <div className="text-[11px] uppercase tracking-[0.16em] font-bold text-burgundy mb-1">
          Por qué
        </div>
        <p className="text-[13.5px] text-ink/75 leading-relaxed">{pregunta.exp}</p>
      </div>
      <a
        href={`/ciaac/${slug}`}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral-700 hover:text-coral-600 transition-colors"
      >
        Más preguntas de {materia} <Icon n="chevR" className="w-3.5 h-3.5" />
      </a>
    </article>
  );
}

function BancoPreguntasPage() {
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
                    Banco de preguntas · CIAAC
                  </span>
                </div>
                <h1 className="font-display mt-6 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
                  2,800+ preguntas
                  <span className="block text-coral-600 mt-1">que explican el porqué.</span>
                </h1>
                <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
                  {RESPUESTA_CORTA}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Btn kind="primary" size="lg" icon="arrow" to="/register">
                    Probar el banco gratis
                  </Btn>
                  <Btn kind="light" size="lg" iconLeft="book" href="#muestras">
                    Ver preguntas de muestra
                  </Btn>
                </div>
              </div>
              <div className="relative lg:h-[400px] flex items-center justify-center">
                <PathyBubble size={230} className="lg:absolute lg:right-4 lg:top-2" />
                <div className="hidden lg:block absolute left-0 bottom-6 w-[250px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
                  <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                    <Icon n="cards" className="w-3.5 h-3.5 text-coral-400" /> El banco
                  </div>
                  <div className="text-white text-[14px] leading-snug">
                    {MATERIAS_DEF.length} materias, tema por tema,
                    <br />
                    <span className="text-coral-400 font-semibold">
                      con fuente en cada reactivo.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-12 lg:py-16" id="rasgos">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {RASGOS.map((r) => (
                <div
                  key={r.titulo}
                  className="rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-6"
                >
                  <span className="w-11 h-11 rounded-2xl bg-coral-50 text-coral-700 grid place-items-center">
                    <Icon n={r.icon} className="w-5 h-5" />
                  </span>
                  <h2 className="font-display mt-4 text-[18px] text-ink leading-snug tracking-tight">
                    {r.titulo}
                  </h2>
                  <p className="mt-2 text-[14px] text-ink/55 leading-relaxed">{r.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-14 lg:py-18" id="muestras">
          <PlaneField count={12} />
          <div className="mx-auto max-w-[900px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="Auditable antes de pagar"
              title={
                <>
                  Así se ve <span className="text-coral-600">un reactivo del banco.</span>
                </>
              }
              sub="Dos muestras reales, tomadas de las guías públicas por materia. En la plataforma, cada pregunta viene además con su fuente del curso."
            />
            <div className="mt-10 space-y-5">
              {MUESTRAS.map((m) => (
                <MuestraCard key={m.slug} {...m} />
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
                  Sobre <span className="text-coral-600">el banco.</span>
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
            <h2 className="font-display text-[30px] lg:text-[44px] text-ink leading-tight">
              Pruébalo con tus propias
              <span className="block text-coral-600">veinte preguntas.</span>
            </h2>
            <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[540px] mx-auto">
              La cuenta Básica es gratis y sin tarjeta. Si el banco te convence, Pro lo abre
              completo desde {formatPrice(PRO_MONTHLY_FALLBACK)} al mes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Crear cuenta gratis
              </Btn>
              <Btn kind="light" size="lg" href="/precios">
                Ver precios
              </Btn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
