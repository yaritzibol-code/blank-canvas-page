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
} from "./index";

/**
 * Página estacional evergreen de la convocatoria CIAAC: concentra las
 * búsquedas "convocatoria ciaac 2026 / fecha examen ciaac" de cada periodo.
 * Se actualiza en cada convocatoria (fecha y año); la estructura permanece.
 *
 * Honestidad de datos: la fecha es la registrada por FlightPath para su
 * generación; lo administrativo (registro, requisitos, costos) siempre
 * remite a la AFAC/CIAAC.
 */

const CANONICAL = "https://flightpath.mx/convocatoria-ciaac-2026";
const PUBLICADO = "2026-08-06";
/** Actualízala junto con PROXIMO_CIAAC de la portada en cada periodo. */
const FECHA_EXAMEN = "2026-08-17";
const FECHA_EXAMEN_TEXTO = "17 de agosto de 2026";

const RESPUESTA_CORTA = `La próxima aplicación del examen CIAAC registrada en FlightPath es el ${FECHA_EXAMEN_TEXTO}. Las convocatorias, requisitos y trámites oficiales los publica la AFAC a través de sus canales y del CIAAC — verifícalos ahí antes de planear. Lo que sí depende de ti desde hoy: llegar con las 12 materias dominadas.`;

const CHECKLIST: { titulo: string; detalle: string }[] = [
  {
    titulo: "Verifica la convocatoria en canales oficiales",
    detalle:
      "Fechas, sedes, requisitos y costos se confirman con la AFAC (gob.mx/afac) y el CIAAC. Nada de fechas de grupos de WhatsApp sin fuente.",
  },
  {
    titulo: "Calcula tus horas reales de estudio",
    detalle:
      "Mete la fecha del examen y tu disponibilidad en la calculadora: sabrás si te alcanza y cómo repartir las horas entre las 12 materias.",
  },
  {
    titulo: "Diagnostica tu nivel por materia",
    detalle:
      "Un bloque de preguntas por materia revela dónde estás débil. Estudiar sin diagnóstico es estudiar a ciegas.",
  },
  {
    titulo: "Practica midiendo, valida con simulacros",
    detalle: `Sesiones diarias dirigidas a tus huecos y un simulacro completo (${SIM_TOTAL_QS} preguntas, 5 horas) cada dos o tres semanas. Tres simulacros seguidos arriba de 80% = estás listo.`,
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Cuándo es el examen CIAAC 2026?",
    a: `La fecha registrada en FlightPath para la próxima aplicación es el ${FECHA_EXAMEN_TEXTO}. La confirmación oficial de fechas y sedes corresponde a la AFAC y al CIAAC; consúltala en sus canales al hacer tu trámite.`,
  },
  {
    q: "¿Cómo me registro para el examen?",
    a: "El registro y sus requisitos son un trámite oficial ante la AFAC/CIAAC; tu escuela de aviación suele orientar el expediente. FlightPath te prepara para el examen — el trámite es directamente con la autoridad.",
  },
  {
    q: "¿Cuánto tiempo antes debo empezar a estudiar?",
    a: "Referencia: 8–10 semanas antes si empiezas desde cero (~150 horas), 5–6 semanas con avance previo (~100 horas). Después de ese punto, cada semana perdida se paga en horas diarias extra.",
  },
  {
    q: "¿Qué pasa si no llego preparado a esta fecha?",
    a: "Presentar sin estar listo cuesta tiempo y trámites. Si tus simulacros están lejos del 80%, suele ser mejor apuntar al siguiente periodo con un plan serio — la calculadora te dice qué ritmo exigiría cada escenario.",
  },
];

export const Route = createFileRoute("/convocatoria-ciaac-2026")({
  component: ConvocatoriaCiaac2026Page,
  head: () => ({
    meta: [
      {
        title:
          "Convocatoria CIAAC 2026: fecha, cómo verificarla y cómo llegar preparado | FlightPath",
      },
      {
        name: "description",
        content: `Próxima aplicación del examen CIAAC registrada: ${FECHA_EXAMEN_TEXTO}. Dónde verificar la convocatoria oficial (AFAC), cuántas horas de estudio necesitas y el plan por materia para llegar al 80%.`,
      },
      {
        name: "keywords",
        content:
          "convocatoria ciaac 2026, fecha examen ciaac 2026, proximo examen ciaac, registro examen ciaac, ciaac 2026 afac",
      },
      { property: "og:title", content: "Convocatoria CIAAC 2026: fecha y plan de preparación" },
      { property: "og:description", content: RESPUESTA_CORTA },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Convocatoria CIAAC 2026: fecha y plan de preparación" },
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
              headline:
                "Convocatoria CIAAC 2026: fecha, verificación oficial y plan de preparación",
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
                  name: "Convocatoria CIAAC 2026",
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

function ConvocatoriaCiaac2026Page() {
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
          <div className="mx-auto max-w-[900px] px-6 lg:px-8 pt-14 lg:pt-20 pb-10">
            <nav
              aria-label="Breadcrumb"
              className="text-[12.5px] text-ink/45 flex items-center gap-1.5"
            >
              <a href="/" className="hover:text-ink transition-colors">
                Inicio
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <span className="text-ink/70 font-semibold">Convocatoria CIAAC 2026</span>
            </nav>
            <div className="mt-6 flex items-center gap-3">
              <Pill tone="coral">Edición 2026</Pill>
              <Coord>{`ACTUALIZADO · ${PUBLICADO}`}</Coord>
            </div>
            <h1 className="font-display mt-4 text-[34px] sm:text-[46px] lg:text-[54px] leading-[1.02] tracking-tight text-ink">
              Convocatoria CIAAC 2026:
              <span className="block text-coral-600 mt-1">fecha y plan para llegar listo.</span>
            </h1>
            <div className="mt-7 rounded-3xl bg-ink text-white shadow-navy p-6 lg:p-8 relative overflow-hidden">
              <div
                className="absolute -top-14 -right-14 w-52 h-52 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(closest-side, rgba(242,174,188,0.20), transparent)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-coral-400 mb-3">
                  <Icon n="spark" className="w-4 h-4" /> Respuesta rápida
                </div>
                <p className="text-[16.5px] lg:text-[18px] leading-relaxed text-white/90">
                  {RESPUESTA_CORTA}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-5 rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-6 py-5">
              <div className="font-display text-[34px] lg:text-[40px] leading-none text-coral-600 shrink-0">
                {FECHA_EXAMEN.split("-")[2]} ago
              </div>
              <div>
                <div className="text-[14.5px] font-semibold text-ink/80 leading-snug">
                  Próxima aplicación registrada en FlightPath ({FECHA_EXAMEN_TEXTO})
                </div>
                <div className="text-[12px] text-ink/45 mt-0.5">
                  Verifícala con la AFAC/CIAAC · La cuenta regresiva vive en la portada
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-14 lg:py-18" id="plan">
          <div className="mx-auto max-w-[900px] px-6 lg:px-8">
            <SectionHead
              eyebrow="El plan"
              title={
                <>
                  Cuatro pasos <span className="text-coral-600">de aquí al examen.</span>
                </>
              }
              sub="La convocatoria es la fecha; la preparación es lo que decides hoy. Este es el orden que funciona."
            />
            <div className="mt-10 space-y-3">
              {CHECKLIST.map((c, i) => (
                <div
                  key={c.titulo}
                  className="flex items-start gap-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-5"
                >
                  <span className="w-9 h-9 rounded-xl bg-coral-50 text-coral-700 grid place-items-center shrink-0 font-mono text-[13px] font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="text-[15.5px] font-semibold text-ink/85">{c.titulo}</div>
                    <p className="mt-1 text-[14px] text-ink/55 leading-relaxed">{c.detalle}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/calculadora-ciaac">
                Calcular mis horas de estudio
              </Btn>
              <Btn kind="light" size="lg" href="https://www.gob.mx/afac">
                Canales oficiales de la AFAC
              </Btn>
            </div>
          </div>
        </section>

        <section className="relative py-14 lg:py-18" id="materias">
          <PlaneField count={12} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="Qué estudiar"
              title={
                <>
                  Las 12 materias <span className="text-coral-600">del temario.</span>
                </>
              }
              sub="Cada una con su guía: qué evalúa, cuánto pesa en el examen, temas frecuentes y preguntas de muestra."
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
                  <span className="font-mono text-[11px] text-ink/35 shrink-0">{m.simTotal}p</span>
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
                  Convocatoria <span className="text-coral-600">2026.</span>
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
                    {f.q}
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
              La fecha ya está puesta.
              <span className="block text-coral-600">Tu preparación, todavía no.</span>
            </h2>
            <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[540px] mx-auto">
              Crea tu cuenta gratis, diagnostica tus 12 materias y llega al {FECHA_EXAMEN_TEXTO}{" "}
              sabiendo cuánto sabes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Empezar hoy gratis
              </Btn>
            </div>
          </div>
        </section>

        <section className="relative pb-14">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8">
            <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
              <strong className="text-ink/70">Aviso.</strong> FlightPath es una plataforma
              independiente y no representa a la AFAC ni al CIAAC. Las fechas, sedes, requisitos y
              costos oficiales del examen se publican y confirman únicamente en los canales de la
              autoridad.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
