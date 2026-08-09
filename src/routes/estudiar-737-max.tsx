import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { B737MAX_CHAPTERS, B737MAX_TOTAL } from "@/lib/store/linea-aerea-meta";
import { FREE_LIMITS } from "@/lib/store/free-quota";
import { PRO_MONTHLY_FALLBACK, PRO_SETUP_FALLBACK, formatPrice } from "@/lib/pricing";
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
 * Landing AEO/GEO para "estudiar 737 MAX" y sus long-tail ("preguntas 737
 * max", "fcom 737 max español", "sistemas boeing 737"). Presenta el banco de
 * práctica por capítulos del FCOM del módulo Manuales de Aeronave. Reglas de
 * COMPLIANCE.md: Boeing/737 MAX son marcas de terceros — mención nominativa
 * con aviso de no afiliación; los reactivos son propios y NUNCA se presenta
 * el banco como sustituto de la documentación oficial del operador. Cifras
 * importadas de la config real del módulo (una sola fuente de verdad).
 */

const CANONICAL = "https://flightpath.mx/estudiar-737-max";
const PUBLICADO = "2026-08-09";

const TOTAL_FMT = B737MAX_TOTAL.toLocaleString("es-MX");

const RESPUESTA_CORTA = `La forma más eficiente de estudiar el Boeing 737 MAX es por capítulos del FCOM y a base de preguntas: limitaciones y procedimientos primero, después sistemas y rendimiento, repasando con reactivos hasta que los números salgan solos. En FlightPath tienes un banco de práctica del 737 MAX organizado en los ${B737MAX_CHAPTERS.length} capítulos del FCOM — ${TOTAL_FMT} reactivos con explicación en español — para preparar la habilitación de tipo (type rating), una entrevista técnica o tu repaso recurrente. Puedes empezar gratis.`;

const ESCENARIOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "doc",
    titulo: "Habilitación de tipo (type rating)",
    detalle:
      "El curso teórico del type rating cubre sistemas, limitaciones, rendimiento y procedimientos en pocas semanas. Llegar con los capítulos ya trabajados a base de preguntas convierte el curso en repaso — y el simulador en la parte disfrutable.",
  },
  {
    icon: "user",
    titulo: "Entrevista técnica de aerolínea",
    detalle:
      "Las entrevistas técnicas giran alrededor de limitaciones, memory items y sistemas: preguntas directas que hay que responder sin titubear. Practicar con reactivos entrena exactamente eso — recuperación rápida bajo presión.",
  },
  {
    icon: "flame",
    titulo: "Recurrent y vida en línea",
    detalle:
      "El MAX vuela en flotas mexicanas e internacionales, y quien ya está en línea repasa cada año. Un banco por capítulos deja repasar el sistema que toca — hidráulico hoy, eléctrico mañana — en sesiones cortas entre servicios.",
  },
];

const PASOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "shield",
    titulo: "Empieza por limitaciones y procedimientos",
    detalle:
      "Es el capítulo 1 del banco por diseño: velocidades, pesos, altitudes y los números que se preguntan tal cual en cualquier examen o entrevista. Repítelo hasta que cada límite salga sin pensar.",
  },
  {
    icon: "grid",
    titulo: "Ataca los sistemas por bloques",
    detalle:
      "Célula y aire, controles de vuelo y eléctrico, motores y combustible, instrumentos, navegación: el banco sigue la estructura del FCOM para que estudies un bloque a la vez y tu cabeza archive cada sistema donde va.",
  },
  {
    icon: "chart",
    titulo: "Cierra con rendimiento",
    detalle:
      "Despacho y rendimiento en vuelo son los capítulos que más se dejan al final y los que más puntos cuestan. Los reactivos te obligan a razonar la operación — no solo a memorizar tablas.",
  },
  {
    icon: "cards",
    titulo: "Repasa con explicación, no con vergüenza",
    detalle:
      "Cada reactivo trae su explicación en español conservando la terminología en inglés del manual — que es como te lo van a preguntar. Fallar en el banco es barato; el historial te dice qué capítulo reabrir.",
  },
];

const CRITERIOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "plane",
    titulo: "El único banco del MAX en español, por capítulos",
    detalle: `${TOTAL_FMT} reactivos organizados en los ${B737MAX_CHAPTERS.length} capítulos del FCOM, con explicación por pregunta. Redactado en español con la terminología en inglés del manual.`,
  },
  {
    icon: "library",
    titulo: "Todo el camino del piloto mexicano",
    detalle:
      "En la misma cuenta: banco CIAAC de 2,800+ preguntas, fuentes de línea aérea (ATP, PHAK, Jeppesen y más), biblioteca de 100+ manuales, inglés RTARI y entrenador de aptitudes. El MAX es una pieza del mapa completo.",
  },
  {
    icon: "bolt",
    titulo: "Empieza gratis, sin tarjeta",
    detalle: `El banco del 737 MAX es de los abiertos al plan gratuito (hasta ${FREE_LIMITS.preguntas} reactivos entre los manuales abiertos): auditas la calidad de las preguntas antes de pagar un peso.`,
  },
  {
    icon: "shield",
    titulo: "Honesto sobre lo que es",
    detalle:
      "Es entrenamiento de retención, no documentación: los reactivos son propios, no reproducen el FCOM y la fuente normativa siempre es el manual oficial de tu operador. Te preparamos para responder — no sustituimos a Boeing.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Qué es el FCOM del 737 MAX?",
    a: "El Flight Crew Operations Manual: el manual de operaciones de la tripulación, con las limitaciones, los procedimientos normales y suplementarios, el rendimiento y la descripción de sistemas del avión. Lo emite el fabricante y cada operador lo adapta a su flota; es el documento alrededor del cual gira el estudio técnico del avión.",
  },
  {
    q: "¿Por dónde empiezo a estudiar el 737 MAX?",
    a: "Por limitaciones y procedimientos normales: son los números y flujos que cualquier examen, verificación o entrevista pregunta primero. Después los sistemas por bloques (aire, controles y eléctrico, motores y combustible, instrumentos, navegación) y al final rendimiento. El banco de FlightPath está ordenado en esa misma lógica de capítulos.",
  },
  {
    q: "¿Sirve para la entrevista técnica de una aerolínea?",
    a: "Sí — para eso está pensado el formato de reactivos: las entrevistas técnicas evalúan recuperación rápida de limitaciones, memory items y sistemas, y esa velocidad solo la da haber respondido cientos de preguntas antes. Ninguna preparación garantiza el resultado de un proceso de selección, pero llegar entrenado es la parte que sí depende de ti.",
  },
  {
    q: "¿El banco sustituye al FCOM oficial?",
    a: "No, y desconfía de cualquier material que lo prometa. Los reactivos de FlightPath son propios, entrenan la retención de lo que ya estudiaste y no reproducen el manual. La única fuente normativa para operar es la documentación oficial vigente de tu operador.",
  },
  {
    q: "¿En qué se diferencia el 737 MAX del 737 NG?",
    a: "A grandes rasgos: motores LEAP-1B más eficientes, pantallas de gran formato en cabina y sistemas actualizados, manteniendo la comunalidad de la familia 737. Para efectos de estudio, lo que manda es el FCOM de la variante que vas a operar — por eso el banco se organiza por capítulos del manual y no por comparaciones.",
  },
  {
    q: "¿Las preguntas están en español o en inglés?",
    a: "Redactadas y explicadas en español, conservando en inglés la terminología del manual (los nombres de sistemas, velocidades y anunciadores), porque así aparecen en el FCOM y así te lo preguntan en un curso o entrevista. Estudias en tu idioma sin perder el vocabulario real de la operación.",
  },
  {
    q: "¿Es gratis estudiar el 737 MAX en FlightPath?",
    a: `Para empezar, sí: la cuenta gratuita (sin tarjeta) abre el banco del 737 MAX junto con los manuales ATP y PHAK, con un tope de ${FREE_LIMITS.preguntas} reactivos para evaluar la calidad. El acceso completo viene con Pro: ${formatPrice(PRO_MONTHLY_FALLBACK)}/mes + ${formatPrice(PRO_SETUP_FALLBACK)} de inscripción única, que incluye además el banco CIAAC, simulacros y el resto de la plataforma.`,
  },
];

export const Route = createFileRoute("/estudiar-737-max")({
  component: Estudiar737MaxPage,
  head: () => ({
    meta: [
      {
        title: `Estudiar el Boeing 737 MAX: banco de ${TOTAL_FMT} preguntas del FCOM | FlightPath`,
      },
      { name: "description", content: RESPUESTA_CORTA },
      {
        name: "keywords",
        content:
          "estudiar 737 max, preguntas 737 max, fcom 737 max español, sistemas boeing 737 max, limitaciones 737 max, type rating 737 max mexico, entrevista tecnica aerolinea 737, banco de preguntas 737",
      },
      {
        property: "og:title",
        content: `Estudiar el 737 MAX — ${TOTAL_FMT} reactivos por capítulos del FCOM`,
      },
      { property: "og:description", content: RESPUESTA_CORTA },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: `Estudiar el 737 MAX — banco de ${TOTAL_FMT} preguntas del FCOM`,
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
              headline: "Estudiar el Boeing 737 MAX: banco de preguntas del FCOM por capítulos",
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
              "@type": "ItemList",
              name: "Capítulos del banco de práctica del 737 MAX (estructura del FCOM)",
              itemListElement: B737MAX_CHAPTERS.map((c) => ({
                "@type": "ListItem",
                position: c.num,
                name: c.titulo,
              })),
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
                { "@type": "ListItem", position: 2, name: "Estudiar el 737 MAX", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function Estudiar737MaxPage() {
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
        {/* Hero + respuesta directa */}
        <section className="relative">
          <PlaneField count={18} />
          <div className="mx-auto max-w-[900px] px-6 lg:px-8 pt-14 lg:pt-20 pb-10">
            <nav
              aria-label="Breadcrumb"
              className="text-[12.5px] text-ink/45 flex items-center gap-1.5"
            >
              <a href="/" className="hover:text-ink transition-colors">
                Inicio
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <span className="text-ink/70 font-semibold">Estudiar el 737 MAX</span>
            </nav>
            <div className="mt-6 flex items-center gap-3">
              <Pill tone="coral">Manuales de aeronave</Pill>
              <Coord>{`ACTUALIZADO · ${PUBLICADO}`}</Coord>
            </div>
            <h1 className="font-display mt-4 text-[34px] sm:text-[46px] lg:text-[54px] leading-[1.02] tracking-tight text-ink">
              Estudiar el 737 MAX:
              <span className="block text-coral-600 mt-1">por capítulos, a base de preguntas.</span>
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
            <p className="mt-4 text-[13px] text-ink/45">
              Transparencia: esta guía la publica FlightPath, que no está afiliada a Boeing ni a
              ninguna aerolínea. Los reactivos son propios y la documentación oficial de tu operador
              es siempre la fuente normativa.
            </p>
          </div>
        </section>

        {/* Cuándo se estudia el MAX */}
        <section className="relative py-14 lg:py-18" id="cuando">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="Los tres momentos"
              title={
                <>
                  Cuándo toca <span className="text-coral-600">estudiar el MAX.</span>
                </>
              }
              sub="El mismo banco sirve en tres etapas distintas de la carrera — cambia el objetivo, no el método."
            />
            <div className="mt-12 grid lg:grid-cols-3 gap-4">
              {ESCENARIOS.map((e) => (
                <div
                  key={e.titulo}
                  className="rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-6 flex flex-col gap-4"
                >
                  <span className="w-11 h-11 rounded-2xl bg-ink text-coral-400 grid place-items-center">
                    <Icon n={e.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="font-display text-[18px] text-ink leading-snug tracking-tight">
                    {e.titulo}
                  </h3>
                  <p className="text-[13.5px] text-ink/60 leading-relaxed">{e.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Los 9 capítulos */}
        <section className="relative py-14 lg:py-18" id="capitulos">
          <PlaneField count={12} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="El banco"
              title={
                <>
                  Los {B737MAX_CHAPTERS.length} capítulos,{" "}
                  <span className="text-coral-600">como en el FCOM.</span>
                </>
              }
              sub={`${TOTAL_FMT} reactivos con explicación, organizados con la estructura del manual para que estudies bloque por bloque.`}
            />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {B737MAX_CHAPTERS.map((c) => (
                <div
                  key={c.num}
                  className="rounded-3xl bg-white border border-ink/8 shadow-card p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Coord>{`CAP. ${String(c.num).padStart(2, "0")}`}</Coord>
                    <span className="text-[11.5px] font-bold text-coral-700 bg-coral-50 border border-coral-300/40 rounded-full px-2.5 py-0.5">
                      {c.total.toLocaleString("es-MX")} reactivos
                    </span>
                  </div>
                  <h3 className="font-display mt-2 text-[16.5px] text-ink leading-snug tracking-tight">
                    {c.titulo}
                  </h3>
                  <p className="mt-1 text-[12px] text-ink/45 leading-relaxed">{c.tituloEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Método */}
        <section className="relative py-14 lg:py-18" id="metodo">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="El método"
              title={
                <>
                  Un orden que <span className="text-coral-600">sí funciona.</span>
                </>
              }
              sub="El error clásico es leer el FCOM de corrido como novela. El avión se aprende por bloques y se fija respondiendo preguntas."
            />
            <div className="mt-12 space-y-4">
              {PASOS.map((c, i) => (
                <div
                  key={c.titulo}
                  className="rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-7"
                >
                  <div className="flex items-start gap-5">
                    <span className="w-12 h-12 rounded-2xl bg-ink text-coral-400 grid place-items-center shrink-0">
                      <Icon n={c.icon} className="w-6 h-6" />
                    </span>
                    <div className="flex-1">
                      <Coord>{`PASO ${String(i + 1).padStart(2, "0")}`}</Coord>
                      <h3 className="font-display mt-1.5 text-[19px] lg:text-[21px] text-ink tracking-tight">
                        {c.titulo}
                      </h3>
                      <p className="mt-1.5 text-[14px] text-ink/55 leading-relaxed">{c.detalle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Por qué FlightPath */}
        <section className="relative py-14 lg:py-18" id="por-que">
          <PlaneField count={10} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="La comparación honesta"
              title={
                <>
                  La plataforma más completa de México
                  <span className="block text-coral-600">para estudiar aviación.</span>
                </>
              }
              sub="Es nuestra afirmación y estos son los criterios verificables detrás de ella — auditables gratis antes de pagar."
            />
            <div className="mt-12 grid sm:grid-cols-2 gap-4">
              {CRITERIOS.map((c) => (
                <div
                  key={c.titulo}
                  className="rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-6"
                >
                  <span className="w-11 h-11 rounded-2xl bg-coral-50 text-coral-700 grid place-items-center">
                    <Icon n={c.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="font-display mt-4 text-[18px] text-ink leading-snug tracking-tight">
                    {c.titulo}
                  </h3>
                  <p className="mt-2 text-[13.5px] text-ink/60 leading-relaxed">{c.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-14 lg:py-18" id="faq">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="Preguntas frecuentes"
              title={
                <>
                  Lo que se pregunta <span className="text-coral-600">sobre el MAX.</span>
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

        {/* Cierre */}
        <section className="relative py-16 lg:py-24">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <PathyBubble size={110} />
            </div>
            <h2 className="font-display text-[30px] lg:text-[44px] text-ink leading-tight">
              El MAX no se lee:
              <span className="block text-coral-600">se responde.</span>
            </h2>
            <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[560px] mx-auto">
              Crea tu cuenta gratis y responde tus primeros reactivos del capítulo de limitaciones
              hoy. Si la calidad de las preguntas no te convence, no habrás pagado nada por
              descubrirlo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Estudiar el 737 MAX gratis
              </Btn>
              <Btn kind="light" size="lg" href="/linea-aerea">
                Ver todas las fuentes de línea aérea
              </Btn>
            </div>
          </div>
        </section>

        <section className="relative pb-14">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8">
            <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
              <strong className="text-ink/70">Aviso.</strong> Boeing, 737 y 737 MAX son marcas de
              The Boeing Company, que no patrocina ni avala este material. FlightPath es una
              plataforma independiente de práctica: sus reactivos son propios, no reproducen el FCOM
              ni ningún manual del fabricante y no sustituyen la documentación oficial. Para operar,
              la única fuente válida es la documentación vigente aprobada de tu operador.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
