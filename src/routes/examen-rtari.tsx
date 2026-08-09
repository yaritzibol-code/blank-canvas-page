import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PRO_MONTHLY_FALLBACK, PRO_SETUP_FALLBACK, formatPrice } from "@/lib/pricing";
import { ICAO_SKILLS } from "@/modules/rtari/icao";
import { RTARI_BLOQUES, RTARI_TOTAL } from "@/modules/rtari/questions";
import {
  RTARI_MAX_MINUTOS,
  RTARI_MINUTOS_INCLUIDOS_PRO,
  RTARI_NIVEL_DEFS,
} from "@/modules/rtari/config";
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
 * Landing AEO/GEO para la búsqueda "examen RTARI" y sus long-tail ("cómo es
 * la entrevista del RTARI", "preguntas del examen RTARI en inglés", "nivel 4
 * OACI"). Explica el examen con información pública y presenta la práctica de
 * entrevista por voz de FlightPath. Reglas de COMPLIANCE.md: mención
 * nominativa de la AFAC con aviso de no afiliación, cifras propias
 * verificables (importadas del código del módulo) y ninguna promesa de
 * resultado — el nivel del debrief es referencia de entrenamiento, no
 * certificación.
 */

const CANONICAL = "https://flightpath.mx/examen-rtari";
const PUBLICADO = "2026-08-09";

const RESPUESTA_CORTA = `El RTARI (Radiotelefonista Aeronáutico Restringido Internacional) es el certificado de capacidad con el que la autoridad aeronáutica mexicana acredita tu competencia lingüística en inglés según la escala OACI; el mínimo para operar internacionalmente es el nivel 4 de 6 y la parte decisiva es una entrevista oral en inglés. En FlightPath practicas esa entrevista en línea: un sinodal de IA te entrevista por voz en inglés, te repregunta como en el examen real y al terminar te entrega un debrief por las seis áreas OACI, con banco propio de ${RTARI_TOTAL} preguntas y historial de tu progreso.`;

const DATOS_EXAMEN: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "shield",
    titulo: "Qué acredita",
    detalle:
      "Tu competencia lingüística en inglés aeronáutico ante la autoridad: hablar, entender y responder en inglés en contexto de vuelo. Es requisito para operar donde las comunicaciones son en inglés, y las aerolíneas lo piden en sus procesos de selección.",
  },
  {
    icon: "chart",
    titulo: "La escala OACI, de 1 a 6",
    detalle:
      "Seis niveles: del pre-elemental (1) al experto (6). El nivel 4 —operacional— es el mínimo aceptado. La regla que sorprende a muchos: tu nivel global es el MÁS BAJO de las seis áreas evaluadas, no el promedio. Un solo punto débil te fija la calificación.",
  },
  {
    icon: "chat",
    titulo: "La entrevista es conversación real",
    detalle:
      "No es opción múltiple: es hablar. Un sinodal te pregunta en inglés por tu experiencia, tu operación y situaciones aeronáuticas, y evalúa cómo suenas, cómo estructuras y qué tan rápido respondes. Se entrena hablando — leer vocabulario no alcanza.",
  },
];

const PASOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "user",
    titulo: "Elige sinodal y exigencia",
    detalle: `Tres sinodales de voz distintos y dos modos: ${RTARI_NIVEL_DEFS.map((n) => n.nombre).join(" y ")}. El estándar te repite la pregunta y te da aire; el exigente lleva ritmo real de examen y repregunta sobre lo que acabas de decir.`,
  },
  {
    icon: "audio",
    titulo: "Habla, no teclees",
    detalle: `La entrevista es por voz y en inglés, de 4 a 15 preguntas por sesión (hasta ${RTARI_MAX_MINUTOS} minutos). Tú contestas hablando, el sinodal escucha, entiende lo que dijiste y contesta en consecuencia — como en la mesa del examen.`,
  },
  {
    icon: "chart",
    titulo: "Recibe tu debrief por área",
    detalle:
      "Al terminar: evaluación de las seis áreas OACI con nivel estimado por cada una, correcciones concretas sobre frases que dijiste y tu transcripción completa. Es referencia de entrenamiento para dirigir tu práctica — la certificación solo la da la autoridad.",
  },
  {
    icon: "flame",
    titulo: "Repite hasta que sea rutina",
    detalle:
      "Cada entrevista queda en tu historial con su debrief, para releer correcciones sin gastar minutos y comparar tu progreso. Los nervios se van con repetición: la vigésima vez que te preguntan por tu peor vuelo, la respuesta sale sola.",
  },
];

const CRITERIOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "audio",
    titulo: "Se practica hablando, que es lo que evalúan",
    detalle:
      "Cursos y PDFs entrenan lectura; el examen evalúa conversación. Aquí cada sesión es oral de principio a fin, con un sinodal que repregunta — el formato exacto que te vas a encontrar.",
  },
  {
    icon: "clock",
    titulo: "Disponible cuando tú puedes",
    detalle:
      "El problema real del inglés oral es encontrar con quién practicarlo. El sinodal de FlightPath está disponible 24/7, sin agendar, desde tu navegador — entre vuelos, de madrugada o el fin de semana.",
  },
  {
    icon: "chart",
    titulo: "Medición por las seis áreas OACI",
    detalle:
      'No un "vas bien" genérico: nivel estimado por pronunciación, estructura, vocabulario, fluidez, comprensión e interacción, la misma rúbrica del examen. Sabes exactamente qué área te está fijando el nivel global.',
  },
  {
    icon: "shield",
    titulo: "Parte de una preparación completa",
    detalle:
      "El RTARI es una pieza: en la misma cuenta tienes el banco CIAAC, las fuentes de línea aérea, el entrenador de aptitudes tipo COMPASS y la biblioteca. Un solo lugar para todo el camino a la cabina.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Qué es el examen RTARI y quién debe presentarlo?",
    a: "Es la evaluación para el certificado de capacidad de Radiotelefonista Aeronáutico Restringido Internacional, que acredita tu competencia lingüística en inglés con la escala OACI. Lo presentan pilotos (y otro personal técnico) que operan comunicaciones en inglés — en la práctica, cualquiera que aspire a rutas internacionales o a una aerolínea. El trámite y los requisitos vigentes se consultan con la AFAC.",
  },
  {
    q: "¿Cómo es la entrevista del RTARI?",
    a: "Es una conversación en inglés con un sinodal: preguntas sobre tu trayectoria, tu experiencia de vuelo, tu operación y situaciones aeronáuticas, con repreguntas sobre lo que respondes. Se evalúan seis áreas — pronunciación, estructura, vocabulario, fluidez, comprensión e interacción — y tu nivel global es el más bajo de las seis.",
  },
  {
    q: "¿Qué significa nivel 4 OACI?",
    a: "Es el nivel operacional, el mínimo aceptado para operar en inglés: te comunicas con eficacia, aunque con acento y errores ocasionales que no impiden entenderte. La escala sube a 5 (extendido) y 6 (experto). En México la mayoría de los pilotos certifica nivel 4, lo que además implica renovarlo periódicamente.",
  },
  {
    q: "¿Cada cuánto se renueva el RTARI?",
    a: "El esquema clásico liga la vigencia al nivel: el 4 se renueva periódicamente (tradicionalmente cada 3 años), el 5 con plazos más largos y el 6 sin vencimiento. La autoridad ha anunciado ajustes al esquema de certificación lingüística, así que confirma el plazo vigente directamente con la AFAC antes de programar tu examen.",
  },
  {
    q: "¿Cómo practico la entrevista si no tengo con quién hablar inglés?",
    a: `Ese es exactamente el problema que resuelve este módulo: un sinodal de IA disponible a cualquier hora que te entrevista por voz en inglés, con ${RTARI_TOTAL} preguntas propias organizadas en ${RTARI_BLOQUES.length} bloques temáticos (${RTARI_BLOQUES.map((b) => b.nombre.toLowerCase()).join(", ")}). Cada pregunta trae su traducción y tips de qué debe contener una buena respuesta.`,
  },
  {
    q: "¿Practicar con una IA sirve para un examen con evaluador humano?",
    a: "Sirve porque entrena lo mismo que se evalúa: escuchar en inglés, estructurar una respuesta y decirla en voz alta sin preparación. El debrief por áreas te dice dónde concentrarte, y la repetición elimina la sorpresa del formato. Lo que ningún método puede hacer — humano o IA — es garantizarte un nivel: desconfía de quien lo prometa.",
  },
  {
    q: "¿Cuánto cuesta practicar la entrevista RTARI en FlightPath?",
    a: `Con la cuenta gratuita exploras el módulo y el banco de ${RTARI_TOTAL} preguntas con su guía de respuesta, sin tarjeta. Las entrevistas por voz vienen con Pro (${formatPrice(PRO_MONTHLY_FALLBACK)}/mes + ${formatPrice(PRO_SETUP_FALLBACK)} de inscripción única), que incluye ${RTARI_MINUTOS_INCLUIDOS_PRO} minutos de voz al mes — unas seis entrevistas de 10 minutos — con opción de paquetes adicionales.`,
  },
  {
    q: "¿FlightPath aplica el examen RTARI oficial?",
    a: "No. El examen y el certificado los emite únicamente la autoridad aeronáutica y sus centros autorizados. FlightPath es práctica independiente: el banco, la entrevista simulada y el debrief son nuestros y no provienen de ninguna autoridad. El nivel que estima el debrief es una referencia de entrenamiento, no una certificación.",
  },
];

export const Route = createFileRoute("/examen-rtari")({
  component: ExamenRtariPage,
  head: () => ({
    meta: [
      { title: "Examen RTARI: cómo es la entrevista en inglés y cómo practicarla | FlightPath" },
      { name: "description", content: RESPUESTA_CORTA },
      {
        name: "keywords",
        content:
          "examen rtari, que es el rtari, entrevista rtari en ingles, preguntas examen rtari, nivel 4 oaci, curso rtari, practicar ingles aeronautico, radiotelefonista aeronautico restringido internacional, ingles para pilotos mexico",
      },
      { property: "og:title", content: "Examen RTARI — practica la entrevista en inglés en línea" },
      { property: "og:description", content: RESPUESTA_CORTA },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Examen RTARI — practica la entrevista en inglés" },
      {
        name: "twitter:description",
        content:
          "Qué es el RTARI, cómo es la entrevista, qué es nivel 4 OACI y cómo practicar por voz con un sinodal de IA.",
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
              "@type": "Article",
              headline: "Examen RTARI: cómo es la entrevista en inglés y cómo practicarla",
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
              name: "Las seis áreas OACI que evalúa la entrevista RTARI",
              itemListElement: ICAO_SKILLS.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${s.nombre} (${s.en})`,
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
                { "@type": "ListItem", position: 2, name: "Examen RTARI", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

const ICONO_AREA: IconName[] = ["audio", "grid", "book", "bolt", "radio", "chat"];

function ExamenRtariPage() {
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
              <span className="text-ink/70 font-semibold">Examen RTARI</span>
            </nav>
            <div className="mt-6 flex items-center gap-3">
              <Pill tone="coral">Inglés aeronáutico</Pill>
              <Coord>{`ACTUALIZADO · ${PUBLICADO}`}</Coord>
            </div>
            <h1 className="font-display mt-4 text-[34px] sm:text-[46px] lg:text-[54px] leading-[1.02] tracking-tight text-ink">
              Examen RTARI:
              <span className="block text-coral-600 mt-1">practica la entrevista en inglés.</span>
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
              Transparencia: esta guía la publica FlightPath, que no está afiliada a la AFAC. La
              información del examen es pública y general; los trámites vigentes se confirman con la
              autoridad.
            </p>
          </div>
        </section>

        {/* El examen en 3 datos */}
        <section className="relative py-14 lg:py-18" id="examen">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="Antes de presentar"
              title={
                <>
                  Lo que hay que saber <span className="text-coral-600">del RTARI.</span>
                </>
              }
              sub="Tres datos que cambian cómo lo preparas: qué acredita, cómo se califica y por qué la entrevista es la parte que decide."
            />
            <div className="mt-12 grid lg:grid-cols-3 gap-4">
              {DATOS_EXAMEN.map((d) => (
                <div
                  key={d.titulo}
                  className="rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-6 flex flex-col gap-4"
                >
                  <span className="w-11 h-11 rounded-2xl bg-ink text-coral-400 grid place-items-center">
                    <Icon n={d.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="font-display text-[18px] text-ink leading-snug tracking-tight">
                    {d.titulo}
                  </h3>
                  <p className="text-[13.5px] text-ink/60 leading-relaxed">{d.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Las 6 áreas OACI */}
        <section className="relative py-14 lg:py-18" id="areas">
          <PlaneField count={12} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="La rúbrica"
              title={
                <>
                  Las seis áreas <span className="text-coral-600">que te evalúan.</span>
                </>
              }
              sub="La escala OACI califica cada área por separado y tu nivel global es el más bajo de las seis. El debrief de FlightPath usa exactamente esta rúbrica."
            />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ICAO_SKILLS.map((s, i) => (
                <div
                  key={s.id}
                  className="rounded-3xl bg-white border border-ink/8 shadow-card p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-coral-50 text-coral-700 grid place-items-center shrink-0">
                      <Icon n={ICONO_AREA[i]} className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-[17px] text-ink tracking-tight">
                        {s.nombre}
                      </h3>
                      <Coord>{s.en.toUpperCase()}</Coord>
                    </div>
                  </div>
                  <p className="mt-3 text-[13.5px] text-ink/60 leading-relaxed">{s.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona la práctica */}
        <section className="relative py-14 lg:py-18" id="practica">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="La práctica en FlightPath"
              title={
                <>
                  Una entrevista real,{" "}
                  <span className="text-coral-600">las veces que quieras.</span>
                </>
              }
              sub={`Banco propio de ${RTARI_TOTAL} preguntas de entrevista en ${RTARI_BLOQUES.length} bloques — de tu trayectoria a tu operación — con sinodal de voz que escucha y repregunta.`}
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
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {RTARI_BLOQUES.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full bg-white border border-ink/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-ink/65"
                >
                  {b.nombre}
                </span>
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
                  La mejor forma de preparar tu RTARI,
                  <span className="block text-coral-600">con criterios verificables.</span>
                </>
              }
              sub="Decimos que FlightPath es la plataforma más completa de México para estudiar aviación — y estos son los criterios con los que puedes comprobarlo (o descartarnos), empezando gratis."
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
                  Lo que se pregunta <span className="text-coral-600">antes del RTARI.</span>
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
              La entrevista se gana
              <span className="block text-coral-600">hablando, no leyendo.</span>
            </h2>
            <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[560px] mx-auto">
              Crea tu cuenta gratis, explora el banco de preguntas con su guía de respuesta y cuando
              estés listo haz tu primera entrevista por voz. Tu inglés de cabina se construye una
              conversación a la vez.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Practicar mi entrevista RTARI
              </Btn>
              <Btn kind="light" size="lg" href="/examen-compass">
                ¿Vas a selección? Entrena aptitudes tipo COMPASS
              </Btn>
            </div>
          </div>
        </section>

        <section className="relative pb-14">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8">
            <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
              <strong className="text-ink/70">Aviso.</strong> FlightPath es una plataforma
              independiente de práctica: no está afiliada a la AFAC ni aplica el examen RTARI, y su
              banco, entrevistas y debrief no provienen de ninguna autoridad. El nivel estimado del
              debrief es una métrica de entrenamiento, no una certificación, y ninguna preparación
              garantiza un resultado. Verifica requisitos, vigencias y trámites en las fuentes
              oficiales de la autoridad.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
