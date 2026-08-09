import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { COMPASS_MODULES, SIMULACRO_MIN_APROX } from "@/modules/compass/config";
import type { CompassModuleId } from "@/modules/compass/types";
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
 * Landing AEO/GEO para "examen COMPASS" y sus long-tail ("test de aptitud
 * para pilotos", "cómo practicar el COMPASS", "prueba psicométrica piloto").
 * Explica qué es la prueba (mención nominativa: COMPASS es de EPST, ver
 * COMPLIANCE.md §5) y presenta el Pilot Aptitude Trainer de FlightPath:
 * ejercicios originales de las mismas familias de aptitud — nunca se vende
 * como réplica y los puntajes se describen como métricas de entrenamiento.
 * El contenido del grid de ejercicios se importa de la config real del
 * módulo para no divergir de la app.
 */

const CANONICAL = "https://flightpath.mx/examen-compass";
const PUBLICADO = "2026-08-09";

const RESPUESTA_CORTA = `El COMPASS (Computerised Pilot Aptitude Screening System) es la prueba computarizada de aptitud de la firma europea EPST que muchas escuelas de vuelo y aerolíneas usan para filtrar aspirantes a piloto: mide coordinación mano-ojo, memoria de corto plazo, cálculo mental, orientación espacial y capacidad de multitarea. En FlightPath entrenas esas mismas seis familias de aptitud con ejercicios originales en línea — 5 niveles de dificultad, puntuación 0–100 comparable entre sesiones y un simulacro compacto de ~${SIMULACRO_MIN_APROX} minutos — usando solo teclado, mouse o el touch de tu celular.`;

const ICONO_MODULO: Record<CompassModuleId, IconName> = {
  control: "target",
  slalom: "plane",
  memoria: "brain",
  calculo: "grid",
  orientacion: "compass",
  multitarea: "bolt",
};

const RASGOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "chart",
    titulo: "5 niveles y dos modos por ejercicio",
    detalle:
      'Práctica libre por nivel y modo examen con formato fijo. La dificultad sube en serio: inercia del mando, acoplamiento entre ejes, viento cruzado, chicanes y más velocidad — no solo "lo mismo pero más rápido".',
  },
  {
    icon: "clock",
    titulo: `Simulacro compacto de ~${SIMULACRO_MIN_APROX} minutos`,
    detalle:
      "Los seis ejercicios encadenados en una sola sesión con formato fijo, como un día de selección en miniatura: rendir con la cabeza cansada también se entrena.",
  },
  {
    icon: "target",
    titulo: "Puntuación honesta y comparable",
    detalle:
      "Cada sesión se califica 0–100 con reglas deterministas y versionadas: tu tendencia solo compara sesiones calificadas con las mismas reglas. El radar de aptitudes te dice cuál es tu módulo débil y cada debrief trae consejos concretos según tus métricas.",
  },
  {
    icon: "sim",
    titulo: "Teclado, mouse o touch — nada más",
    detalle:
      "Diseñado para el hardware que sí tienes: teclado y mouse en escritorio, touch en el celular. Sin joystick, sin pedales, sin instalar nada — se entrena desde el navegador.",
  },
];

const CRITERIOS: { icon: IconName; titulo: string; detalle: string }[] = [
  {
    icon: "brain",
    titulo: "Entrena las aptitudes correctas",
    detalle:
      "Los seis ejercicios cubren las familias clásicas de las pruebas de selección: tracking compensatorio, pursuit, memoria de parámetros, cálculo aeronáutico, orientación QDM/QDR y multitarea con alertas.",
  },
  {
    icon: "shield",
    titulo: "Honestidad con tus números",
    detalle:
      "Tus puntajes son métricas de entrenamiento, no pronósticos: nadie puede prometerte pasar una selección. Lo que sí medimos — y mostramos — es tu progreso real contra tu propia línea base.",
  },
  {
    icon: "compass",
    titulo: "La preparación completa en un lugar",
    detalle:
      "La selección no es solo aptitud: en la misma cuenta practicas la entrevista en inglés (RTARI), el conocimiento técnico (banco CIAAC y fuentes de línea aérea) y los manuales de aeronave.",
  },
  {
    icon: "bolt",
    titulo: "Pruébalo gratis hoy",
    detalle:
      "El Pilot Aptitude Trainer está incluido con tu cuenta FlightPath: la creas gratis, sin tarjeta, y haces tu primera sesión de aptitudes en dos minutos. Audítanos antes de creernos.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Qué es el examen COMPASS y quién lo aplica?",
    a: "Es una batería computarizada de pruebas de aptitud desarrollada por EPST (European Pilot Selection & Training) que escuelas de vuelo, programas de cadetes y aerolíneas de todo el mundo usan para evaluar candidatos a piloto, normalmente al inicio del proceso de selección. Cada institución decide su versión, sus módulos y sus puntos de corte.",
  },
  {
    q: "¿Qué módulos tiene el COMPASS?",
    a: "Las versiones típicas combinan control de vuelo con dos ejes, slalom, memoria de corto plazo, matemáticas mentales, orientación espacial y multitarea; algunas añaden cuestionarios de personalidad o inglés técnico. Los seis ejercicios de FlightPath entrenan esas mismas familias de aptitud con mecánicas originales.",
  },
  {
    q: "¿Se puede practicar para una prueba de aptitud, o mide talento fijo?",
    a: "Las dos cosas son ciertas a medias. Estas pruebas miden capacidades con un componente estable, pero el desempeño el día del examen depende también de familiaridad: quien nunca ha hecho tracking compensatorio ni multitarea cronometrada pierde puntos por sorpresa, no por falta de aptitud. Practicar elimina esa variable — aunque nadie puede garantizarte un resultado.",
  },
  {
    q: "¿Qué necesito para entrenar en FlightPath?",
    a: "Un navegador. En escritorio juegas con teclado (flechas o WASD) o mouse; en el celular, con el dedo. Los ejercicios están diseñados para esos controles — no necesitas joystick ni pedales, y no se instala nada.",
  },
  {
    q: "¿Los ejercicios de FlightPath son el COMPASS real?",
    a: "No, y lo decimos con todas sus letras: COMPASS es un producto de EPST y FlightPath no está afiliada a EPST ni a ninguna aerolínea. Nuestros ejercicios son originales y entrenan las mismas familias de aptitud que evalúan las pruebas de selección — el objetivo es que llegues entrenado, no venderte una copia.",
  },
  {
    q: "¿Cómo sé si estoy mejorando de verdad?",
    a: "Porque la calificación es determinista y versionada: mismas reglas, mismos números, sin inflación. Tu radar de aptitudes compara tus últimos puntajes por módulo, la tendencia se calcula contra tu propia mediana anterior y el sistema te sugiere subir de nivel cuando tus resultados lo sostienen.",
  },
  {
    q: "¿Cuánto cuesta entrenar aptitudes en FlightPath?",
    a: "El Pilot Aptitude Trainer está incluido con tu cuenta de FlightPath, y la cuenta se crea gratis y sin tarjeta. Si después quieres la preparación completa (banco CIAAC ilimitado, simulacros, tutor IA, entrevistas RTARI por voz), existe el plan Pro — pero para entrenar aptitudes hoy no necesitas pagar nada.",
  },
];

export const Route = createFileRoute("/examen-compass")({
  component: ExamenCompassPage,
  head: () => ({
    meta: [
      {
        title: "Examen COMPASS para pilotos: qué evalúa y cómo practicarlo en línea | FlightPath",
      },
      { name: "description", content: RESPUESTA_CORTA },
      {
        name: "keywords",
        content:
          "examen compass pilotos, compass test aviacion, como practicar el examen compass, test de aptitud para pilotos, prueba psicometrica pilotos mexico, ejercicios compass online, pilot aptitude test español, seleccion de pilotos ejercicios",
      },
      {
        property: "og:title",
        content: "Examen COMPASS — entrena las 6 aptitudes de selección de pilotos",
      },
      { property: "og:description", content: RESPUESTA_CORTA },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Examen COMPASS — entrena tus aptitudes de piloto" },
      {
        name: "twitter:description",
        content:
          "Qué mide la prueba de aptitud, qué módulos tiene y cómo entrenarlos en línea con teclado, mouse o touch.",
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
              headline: "Examen COMPASS para pilotos: qué evalúa y cómo practicarlo en línea",
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
              name: "Ejercicios de aptitud del Pilot Aptitude Trainer de FlightPath",
              itemListElement: COMPASS_MODULES.map((m, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${m.nombre} — ${m.aptitud}`,
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
                { "@type": "ListItem", position: 2, name: "Examen COMPASS", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function ExamenCompassPage() {
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
              <span className="text-ink/70 font-semibold">Examen COMPASS</span>
            </nav>
            <div className="mt-6 flex items-center gap-3">
              <Pill tone="coral">Aptitudes de piloto</Pill>
              <Coord>{`ACTUALIZADO · ${PUBLICADO}`}</Coord>
            </div>
            <h1 className="font-display mt-4 text-[34px] sm:text-[46px] lg:text-[54px] leading-[1.02] tracking-tight text-ink">
              Examen COMPASS:
              <span className="block text-coral-600 mt-1">entrena antes de que te midan.</span>
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
              Transparencia: esta guía la publica FlightPath. COMPASS es un producto de EPST;
              FlightPath no está afiliada a EPST y sus ejercicios son originales — entrenan las
              mismas aptitudes, no replican la prueba.
            </p>
          </div>
        </section>

        {/* Los 6 ejercicios */}
        <section className="relative py-14 lg:py-18" id="ejercicios">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="El entrenamiento"
              title={
                <>
                  Seis ejercicios, <span className="text-coral-600">seis aptitudes.</span>
                </>
              }
              sub="Las mismas familias de aptitud que evalúan las pruebas de selección, convertidas en ejercicios jugables con teclado, mouse o touch."
            />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMPASS_MODULES.map((m) => (
                <div
                  key={m.id}
                  className="rounded-3xl bg-white border border-ink/8 shadow-card p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-ink text-coral-400 grid place-items-center shrink-0">
                      <Icon n={ICONO_MODULO[m.id]} className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-[17px] text-ink tracking-tight">
                        {m.nombre}
                      </h3>
                      <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-haze-500">
                        {m.aptitud}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[13.5px] text-ink/60 leading-relaxed">{m.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo está construido */}
        <section className="relative py-14 lg:py-18" id="como">
          <PlaneField count={12} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="Hecho para entrenar en serio"
              title={
                <>
                  No es un minijuego: <span className="text-coral-600">es un gimnasio.</span>
                </>
              }
              sub="Cada detalle está pensado para que el número que ves signifique algo y para que la dificultad se sienta como una prueba real."
            />
            <div className="mt-12 grid sm:grid-cols-2 gap-4">
              {RASGOS.map((r) => (
                <div
                  key={r.titulo}
                  className="rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-6"
                >
                  <span className="w-11 h-11 rounded-2xl bg-coral-50 text-coral-700 grid place-items-center">
                    <Icon n={r.icon} className="w-5 h-5" />
                  </span>
                  <h3 className="font-display mt-4 text-[18px] text-ink leading-snug tracking-tight">
                    {r.titulo}
                  </h3>
                  <p className="mt-2 text-[13.5px] text-ink/60 leading-relaxed">{r.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Por qué FlightPath */}
        <section className="relative py-14 lg:py-18" id="por-que">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <SectionHead
              center
              eyebrow="La comparación honesta"
              title={
                <>
                  El gimnasio de aptitudes,
                  <span className="block text-coral-600">dentro de la plataforma completa.</span>
                </>
              }
              sub="Decimos que FlightPath es la plataforma más completa de México para estudiar aviación — estos son los criterios para comprobarlo tú mismo, gratis."
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
                  Lo que se pregunta <span className="text-coral-600">antes de la selección.</span>
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

        {/* Cierre */}
        <section className="relative py-16 lg:py-24">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <PathyBubble size={110} />
            </div>
            <h2 className="font-display text-[30px] lg:text-[44px] text-ink leading-tight">
              El día de la selección
              <span className="block text-coral-600">no debería ser tu primera vez.</span>
            </h2>
            <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[560px] mx-auto">
              Crea tu cuenta gratis y haz tu primera sesión de aptitudes hoy: cinco minutos de
              slalom te dicen más sobre tu punto de partida que cualquier artículo — incluido este.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Entrenar mis aptitudes gratis
              </Btn>
              <Btn kind="light" size="lg" href="/examen-rtari">
                ¿Y el inglés? Practica la entrevista RTARI
              </Btn>
            </div>
          </div>
        </section>

        <section className="relative pb-14">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8">
            <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
              <strong className="text-ink/70">Aviso.</strong> COMPASS es un producto de EPST
              (European Pilot Selection &amp; Training). FlightPath es una plataforma independiente:
              no está afiliada a EPST ni a ninguna aerolínea o escuela, sus ejercicios son
              originales y no replican ninguna prueba oficial. Los puntajes de FlightPath son
              métricas de entrenamiento — no predicen ni garantizan el resultado de ningún proceso
              de selección. Cada institución define su propia evaluación: confirma formato y
              requisitos con la convocatoria a la que apliques.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
