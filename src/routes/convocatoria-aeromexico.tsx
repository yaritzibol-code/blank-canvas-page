import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PRO_MONTHLY_FALLBACK, PRO_SETUP_FALLBACK, formatPrice } from "@/lib/pricing";
import { LA_CONVOCATORIA_AVISO, LA_CONVOCATORIA_ESTADO } from "@/lib/convocatoria";
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
 * Landing SEO pública de la convocatoria ASPA / Aeroméxico Connect —
 * Primer Oficial Embraer 190. Capta búsquedas como "convocatoria aeromexico",
 * "convocatoria aspa", "jeppesen", "ATP" y vende el acceso al cuestionario de
 * práctica: el CTA lleva a registro y de ahí directo al checkout de Stripe
 * (/dashboard/planes?checkout=1).
 *
 * Estado: la convocatoria publicada fue cancelada (ver `lib/convocatoria.ts`).
 * La página no promete un proceso abierto — está escrita como preparación
 * anticipada para cuando salga la siguiente, porque el temario publicado es el
 * mismo y estudiarlo antes es justamente la ventaja que se vende.
 *
 * Regla de compliance: FlightPath menciona el temario público de la
 * convocatoria (uso informativo legítimo), pero nunca afirma replicar,
 * copiar ni contener material de examen propiedad de la empresa. El banco
 * que se vende es propio e independiente. Sin logotipos de Aeroméxico,
 * ASPA, Volaris ni AFAC, y con el aviso de no afiliación siempre visible.
 */

const CANONICAL = "https://flightpath.mx/convocatoria-aeromexico";

/** El CTA aterriza en el checkout embebido de Stripe después del registro. */
const BUY_HREF = `/register?next=${encodeURIComponent("/dashboard/planes?checkout=1")}`;

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿La convocatoria de Aeroméxico Connect sigue abierta?",
    a: "No. La convocatoria de Primer Oficial Embraer 190 fue cancelada y por ahora no hay un proceso abierto ni una fecha anunciada para el siguiente. Conviene seguir los canales oficiales de ASPA de México para enterarte en cuanto se publique uno nuevo.",
  },
  {
    q: "Si se canceló, ¿tiene caso prepararse ahora?",
    a: "Sí, y es el mejor momento. El temario del examen teórico es material publicado y estable — ATP, PHAK, Jeppesen, legislación nacional y el Anexo 10 de la OACI — así que no cambia de un proceso a otro. Quien empieza cuando sale la convocatoria estudia contrarreloj; quien ya lo tiene cubierto sólo repasa. Además, las mismas fuentes se usan en procesos de otras aerolíneas.",
  },
  {
    q: "¿Qué es la convocatoria de ASPA y Aeroméxico Connect?",
    a: "Es la invitación de ASPA de México a pilotos para unirse como Primer Oficial de la flota Embraer 190 de Aeroméxico Connect. El proceso incluye un examen teórico sobre el temario oficial, la evaluación AON (Aviation Suite, con prueba de inglés), una evaluación en simulador y una entrevista con panel. La última convocatoria publicada fue cancelada.",
  },
  {
    q: "¿Qué requisitos pedía la convocatoria de ASPA?",
    a: "Edad de 18 a 50 años con 11 meses, nacionalidad mexicana por nacimiento, 250 horas de vuelo certificadas en bitácora (mínimo 180 de vuelo real y hasta 70 de simulador), carta de presentación de ASPA y expediente completo y actualizado en el archivo del sindicato. Son la referencia de la convocatoria cancelada: la próxima puede ajustarlos, así que verifícalos en la publicación oficial cuando salga.",
  },
  {
    q: "¿Qué se estudia para el examen teórico del Embraer 190?",
    a: "El temario oficial se compone del ATP — Airline Transport Pilot (excepto los capítulos de Performance y Weight & Balance), el Pilot's Handbook of Aeronautical Knowledge (excepto el capítulo 1), la sección Introduction del Jeppesen General Airway Manual, el CPAM (Compendio de legislación nacional relacionada a tripulaciones de vuelo) y el Anexo 10 de la OACI, Volumen II.",
  },
  {
    q: "¿Qué es el Jeppesen General Airway Manual?",
    a: "Es el manual de referencia de Jeppesen sobre cartas, procedimientos y navegación aérea. Para esta convocatoria se evalúa la sección Introduction, que cubre la interpretación de cartas y simbología. En FlightPath la practicas con las materias de Manuales AIS y Navegación.",
  },
  {
    q: "¿Cómo me ayuda el cuestionario de práctica de FlightPath?",
    a: "Cubre el temario publicado de la convocatoria con un banco propio de más de 2,800 preguntas con explicación, simulacros cronometrados y un tutor IA disponible 24/7. Practicas cada fuente del temario (ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10) hasta dominar los temas donde más fallas, y llegas listo el día que se publique la siguiente convocatoria.",
  },
  {
    q: "¿Qué es la evaluación AON Aviation Suite y cómo se prepara?",
    a: "AON Aviation Suite es la batería psicométrica y de aptitudes que aplica Aeroméxico Connect: atención dividida, memoria de trabajo, razonamiento y una prueba de inglés. Se prepara con práctica cronometrada y descanso: en FlightPath entrenas la parte teórica y el manejo del tiempo con simulacros con reloj.",
  },
  {
    q: "¿Cuántas preguntas de práctica hay para el examen teórico de Primer Oficial Embraer 190?",
    a: "FlightPath cuenta con un banco propio de más de 2,800 preguntas de práctica, desarrollado de forma independiente y mapeado al temario oficial publicado para la convocatoria. Puedes practicarlo por fuente (ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10) o mezclado en simulacros cronometrados.",
  },
  {
    q: "¿Cuánto cuesta prepararte con FlightPath para la convocatoria?",
    a: `El acceso completo tiene un pago único de inscripción de ${formatPrice(PRO_SETUP_FALLBACK)} y una mensualidad de ${formatPrice(PRO_MONTHLY_FALLBACK)}. Incluye el banco completo, simulacros cronometrados, el módulo Línea Aérea, análisis por materia y Yaris, la tutora IA entrenada en los materiales del curso.`,
  },
  {
    q: "¿Qué extras de estudio incluye el cuestionario?",
    a: "Además de las preguntas con explicación, incluye simulacros cronometrados, análisis de desempeño por materia y un chat con Yaris que consulta el material curado y cita la fuente del curso. Las flashcards, los audio-repasos tipo podcast y las presentaciones con puntos clave están en construcción y se liberarán próximamente.",
  },
  {
    q: "¿El cuestionario reemplaza al material oficial de la convocatoria?",
    a: "No. El material de referencia es el temario y la guía oficiales que la empresa entrega a cada candidato. FlightPath es una plataforma independiente: su banco de práctica es propio y está mapeado al temario público para darte práctica estructurada. FlightPath no está afiliada a ASPA de México ni a Aeroméxico.",
  },
];

const REQUISITOS: { icon: IconName; text: string }[] = [
  { icon: "cal", text: "Edad: de 18 años hasta 50 años con 11 meses" },
  { icon: "waypoint", text: "Nacionalidad mexicana por nacimiento" },
  {
    icon: "clock",
    text: "250 horas de vuelo certificadas en bitácora: mínimo 180 de vuelo real y hasta 70 de simulador",
  },
  { icon: "doc", text: "Carta de presentación de ASPA" },
  { icon: "shield", text: "Expediente completo y actualizado en el área de archivo del sindicato" },
];

const EVALUACIONES: { icon: IconName; title: string; sub: string }[] = [
  { icon: "doc", title: "Examen teórico", sub: "Sobre el temario oficial de la convocatoria" },
  {
    icon: "brain",
    title: "AON (Aviation Suite)",
    sub: "Psicométrica y de aptitudes; incluye la prueba de inglés",
  },
  { icon: "sim", title: "Simulador", sub: "Evaluación práctica de vuelo" },
  { icon: "user", title: "Panel", sub: "Entrevista con panel evaluador" },
];

const TEMARIO: {
  icon: IconName;
  title: string;
  detail: string;
  materias: string[];
  href: string;
}[] = [
  {
    icon: "book",
    title: "ATP — Airline Transport Pilot",
    detail: "Completo, excepto los capítulos de Performance y Weight & Balance.",
    materias: ["Aerodinámica", "Aeronaves y Motores", "Meteorología", "Navegación", "Operaciones"],
    href: "/linea-aerea/atp",
  },
  {
    icon: "library",
    title: "Pilot's Handbook of Aeronautical Knowledge (PHAK)",
    detail: "Completo, excepto el capítulo 1.",
    materias: ["Aerodinámica", "Meteorología", "Medicina de Aviación", "Factores Humanos"],
    href: "/linea-aerea/phak",
  },
  {
    icon: "compass",
    title: "Jeppesen General Airway Manual",
    detail: "Sección Introduction: cartas, simbología y procedimientos.",
    materias: ["Manuales AIS", "Navegación"],
    href: "/linea-aerea/jeppesen",
  },
  {
    icon: "doc",
    title: "CPAM — Legislación nacional",
    detail: "Compendio de legislación nacional relacionada a tripulaciones de vuelo.",
    materias: ["Legislación Aeronáutica"],
    href: "/linea-aerea/cpam",
  },
  {
    icon: "radio",
    title: "OACI Anexo 10, Volumen II",
    detail: "Telecomunicaciones aeronáuticas — procedimientos de comunicación.",
    materias: ["Comunicaciones"],
    href: "/linea-aerea/oaci-anexo-10",
  },
];

const INCLUYE: string[] = [
  "Banco propio de 2,800+ preguntas con explicación, mapeado al temario oficial",
  "Simulacros cronometrados tipo examen",
  "Módulo Línea Aérea: la convocatoria organizada paso a paso",
  "Repaso dirigido a tus materias débiles, tema por tema",
  "Tutor IA Yaris 24/7 con el contexto del curso",
  "Análisis de desempeño por materia y tema",
];

export const Route = createFileRoute("/convocatoria-aeromexico")({
  component: ConvocatoriaAeromexicoPage,
  head: () => ({
    meta: [
      {
        title:
          "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190: cancelada | FlightPath",
      },
      {
        name: "description",
        content:
          "La convocatoria de Primer Oficial Embraer 190 (ASPA · Aeroméxico Connect) fue cancelada. El temario del examen teórico no cambia: prepara ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 desde ahora y llega listo a la próxima.",
      },
      {
        name: "keywords",
        content:
          "convocatoria aeromexico, convocatoria aspa, primer oficial embraer 190, jeppesen, jeppesen general airway manual, ATP airline transport pilot, PHAK, CPAM, OACI anexo 10, examen teorico aeromexico connect",
      },
      {
        property: "og:title",
        content: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190: cancelada",
      },
      {
        property: "og:description",
        content:
          "Se canceló la convocatoria, pero el temario sigue igual: ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10. Prepáralo con calma y llega listo a la próxima.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190: cancelada",
      },
      {
        name: "twitter:description",
        content:
          "Convocatoria cancelada, temario intacto: prepara ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10 con un banco propio de 2,800+ preguntas, simulacros cronometrados y tutor IA.",
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
              name: "Preparación para la convocatoria ASPA · Aeroméxico Connect — Primer Oficial Embraer 190",
              description:
                "Preparación anticipada del temario publicado (ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10) para la próxima convocatoria de Primer Oficial Embraer 190: banco propio de 2,800+ preguntas, simulacros cronometrados y tutor IA. La última convocatoria publicada fue cancelada.",
              inLanguage: "es-MX",
              url: CANONICAL,
              provider: {
                "@type": "Organization",
                name: "FlightPath",
                url: "https://flightpath.mx/",
              },
              offers: {
                "@type": "Offer",
                price: String(PRO_SETUP_FALLBACK.amount),
                priceCurrency: PRO_SETUP_FALLBACK.currency,
                category: "Paid",
                url: CANONICAL,
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                courseWorkload: "PT20H",
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
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Convocatoria Aeroméxico — Embraer 190",
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

/** Cintillo de estado: lo primero que ve quien llega buscando la convocatoria. */
function EstadoConvocatoria() {
  return (
    <section className="relative pt-6">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <div className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/80 backdrop-blur px-5 py-4 shadow-card">
          <span className="w-9 h-9 rounded-xl bg-ink/5 text-ink/60 grid place-items-center shrink-0">
            <Icon n="bell" className="w-[18px] h-[18px]" />
          </span>
          <p className="text-[13.5px] leading-relaxed text-ink/65">
            <strong className="text-ink">{LA_CONVOCATORIA_ESTADO}.</strong> {LA_CONVOCATORIA_AVISO}{" "}
            Esta página es una guía de preparación anticipada, no un aviso de proceso abierto: las
            fechas y requisitos oficiales los publica ASPA de México.
          </p>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={24} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-ink/35" />
              <span className="text-[12px] font-semibold text-ink/70">
                ASPA de México · Aeroméxico Connect · {LA_CONVOCATORIA_ESTADO}
              </span>
            </div>
            <h1 className="font-display mt-6 text-[40px] sm:text-[54px] lg:text-[60px] leading-[1.0] tracking-tight text-ink">
              Convocatoria Aeroméxico:
              <span className="block text-coral-600 mt-1">prepárate para la próxima.</span>
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-ink/55 max-w-xl leading-relaxed">
              La convocatoria de Primer Oficial Embraer 190 fue cancelada. El temario del examen
              teórico no cambia — ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 —
              así que puedes llegar con él dominado el día que se publique la siguiente, en lugar de
              empezar contrarreloj.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" href={BUY_HREF}>
                Empezar mi preparación
              </Btn>
              <Btn kind="light" size="lg" iconLeft="book" href="#temario">
                Ver el temario oficial
              </Btn>
            </div>
            <p className="mt-4 text-[12.5px] text-ink/45 flex items-center gap-1.5">
              <Icon n="shield" className="w-3.5 h-3.5" /> Pago seguro procesado por Stripe · Cancela
              cuando quieras
            </p>
          </div>

          <div className="relative lg:h-[440px] flex items-center justify-center">
            <PathyBubble size={260} className="lg:absolute lg:right-4 lg:top-4" />
            <div className="hidden lg:block absolute left-0 bottom-8 w-[250px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon n="target" className="w-3.5 h-3.5 text-coral-400" /> Cuestionario E190
              </div>
              <div className="text-white text-[14px] leading-snug">
                5 fuentes del temario,
                <br />
                <span className="text-coral-400 font-semibold">listas antes de que abra.</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["ATP", "PHAK", "Jeppesen", "CPAM", "OACI A10"].map((t) => (
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

function Requisitos() {
  return (
    <section className="relative py-20 lg:py-24" id="requisitos">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <SectionHead
            eyebrow="La convocatoria"
            title={
              <>
                Requisitos de la <span className="text-coral-600">convocatoria ASPA.</span>
              </>
            }
            sub="Así se perfilaba el candidato en la última convocatoria publicada para Primer Oficial del Embraer 190 de Aeroméxico Connect. Tenlos listos —expediente, horas y carta— para no perder tiempo cuando se abra la siguiente."
          />
          <div className="space-y-3">
            {REQUISITOS.map((r) => (
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
              <Coord>FUENTE · TEMARIO Y GUÍA OFICIALES DE LA CONVOCATORIA</Coord>
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
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Temario oficial"
          title={
            <>
              Lo que evalúa el <span className="text-coral-600">examen teórico.</span>
            </>
          }
          sub="Estas son las cinco fuentes que define la empresa para el examen de Primer Oficial Embraer 190, y las materias de FlightPath con las que practicas cada una. Es material publicado y estable: lo que estudias hoy sigue vigente cuando abra el próximo proceso."
        />
        <div className="mt-14 space-y-4">
          {TEMARIO.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-7"
            >
              <div className="flex items-start gap-5">
                <span className="w-12 h-12 rounded-2xl bg-ink text-coral-400 grid place-items-center shrink-0">
                  <Icon n={f.icon} className="w-6 h-6" />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-[19px] lg:text-[21px] text-ink tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-[14px] text-ink/55">{f.detail}</p>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {f.materias.map((m) => (
                      <Pill key={m} tone="coral">
                        <Icon n="check" className="w-3 h-3" />
                        {m}
                      </Pill>
                    ))}
                  </div>
                  <a
                    href={f.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral-700 hover:text-coral-600 transition-colors"
                  >
                    Guía completa de esta fuente <Icon n="chevR" className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[13.5px] text-ink/45 max-w-2xl mx-auto">
          El banco de FlightPath cubre estas fuentes con más de 2,800 preguntas con explicación,
          organizadas por materia y tema — del ATP al Anexo 10 de la OACI.
        </p>
      </div>
    </section>
  );
}

function Evaluaciones() {
  return (
    <section className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="El proceso"
          title={
            <>
              Las 4 evaluaciones <span className="text-coral-600">de la convocatoria.</span>
            </>
          }
          sub="El examen teórico es la primera puerta. Es también la única que puedes tener ganada de antemano: llega con el temario dominado y el resto del proceso se vuela mejor."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EVALUACIONES.map((e, i) => (
            <div
              key={e.title}
              className="rounded-3xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-coral-50 text-coral-700 grid place-items-center">
                  <Icon n={e.icon} className="w-5 h-5" />
                </span>
                <Coord>{String(i + 1).padStart(2, "0")}</Coord>
              </div>
              <h3 className="mt-4 font-display text-[17px] text-ink tracking-tight">{e.title}</h3>
              <p className="mt-1.5 text-[13px] text-ink/55 leading-relaxed">{e.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-7 text-center text-[14px] text-ink/55 max-w-[680px] mx-auto leading-relaxed">
          Las otras puertas también se entrenan en FlightPath: practica la{" "}
          <a href="/examen-rtari" className="font-semibold text-coral-700 hover:text-coral-600">
            entrevista en inglés (RTARI)
          </a>{" "}
          con un sinodal de voz y entrena las{" "}
          <a href="/examen-compass" className="font-semibold text-coral-700 hover:text-coral-600">
            aptitudes tipo COMPASS
          </a>{" "}
          con ejercicios en línea — todo en la misma cuenta.
        </p>
      </div>
    </section>
  );
}

function Comprar() {
  return (
    <section className="relative py-20 lg:py-28" id="comprar">
      <PlaneField count={14} />
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Eyebrow>Cuestionario de práctica</Eyebrow>
            <h2 className="font-display mt-5 text-4xl lg:text-[48px] leading-[1.02] tracking-tight text-ink">
              Empieza hoy y <span className="text-coral-600">llega listo el día uno.</span>
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-ink/55 max-w-lg">
              El cuestionario Embraer 190 — Primer Oficial vive dentro de FlightPath Pro: practicas
              el temario publicado completo, mides tu avance por materia y repites los temas débiles
              hasta que el examen teórico deje de ser incógnita. Sin convocatoria abierta no hay
              prisa, y esa es justo la ventaja: estudias con calma lo que otros estudiarán con
              reloj.
            </p>
            <div className="mt-7 space-y-3">
              {INCLUYE.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <Icon n="check" className="w-4 h-4 text-coral-600 mt-0.5 shrink-0" sw={2.2} />
                  <span className="text-[14.5px] text-ink/70">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl bg-ink p-8 lg:p-10 shadow-navy overflow-hidden">
            <div
              className="absolute -top-12 -right-12 w-52 h-52 rounded-full"
              style={{
                background: "radial-gradient(closest-side, rgba(242,174,188,0.20), transparent)",
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-coral-400">
                  Embraer 190 · Primer Oficial
                </div>
                <Pill tone="light">Acceso completo</Pill>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-6xl tracking-tight text-white">
                  ${PRO_MONTHLY_FALLBACK.amount.toLocaleString()}
                </span>
                <span className="text-white/50 text-sm">{PRO_MONTHLY_FALLBACK.currency} / mes</span>
              </div>
              <div className="mt-2 text-[13px] text-white/55">
                + ${PRO_SETUP_FALLBACK.amount.toLocaleString()} {PRO_SETUP_FALLBACK.currency} de
                inscripción (pago único)
              </div>
              <p className="text-[14px] text-white/60 mt-4">
                Acceso Pro a toda la plataforma: temario de línea aérea, banco completo, simulacros
                y tutor IA. Sin plazos forzosos.
              </p>
              <Btn kind="primary" size="lg" icon="arrow" className="w-full mt-7" href={BUY_HREF}>
                Empezar mi preparación
              </Btn>
              <p className="mt-4 text-center text-[12px] text-white/45">
                Crea tu cuenta y paga en la página segura de Stripe. Cancela cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreguntasFrecuentes() {
  return (
    <section className="relative py-20 lg:py-24" id="faq">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Preguntas frecuentes"
          title={
            <>
              Convocatoria, temario <span className="text-coral-600">y cuestionario.</span>
            </>
          }
        />
        <div className="mt-12 space-y-4">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-3xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-6 lg:p-7"
            >
              <h3 className="font-display text-[17px] lg:text-[18px] text-ink tracking-tight">
                {f.q}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink/60">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[13.5px] text-ink/50">
          ¿Comparando opciones? Lee{" "}
          <a
            href="/mejor-plataforma-convocatoria-aeromexico"
            className="font-semibold text-coral-700 hover:text-coral-600"
          >
            cómo elegir tu preparación para esta convocatoria
          </a>
          , criterio por criterio.
        </p>
      </div>
    </section>
  );
}

function Aviso() {
  return (
    <section className="relative pb-20">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-50/70 px-5 py-4 text-[13px] leading-relaxed text-amber-900/80">
          <Icon n="bell" className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            La convocatoria de Primer Oficial Embraer 190 fue cancelada y FlightPath no anuncia,
            gestiona ni garantiza ningún proceso de selección: las fechas, requisitos y resultados
            los publica exclusivamente ASPA de México. El material de referencia es el temario y la
            guía oficiales proporcionados por la empresa. FlightPath es una plataforma
            independiente: su banco de práctica es propio, desarrollado de forma independiente y
            mapeado al temario público;{" "}
            <strong>no está afiliada a ASPA de México ni a Aeroméxico</strong>.
          </span>
        </div>
      </div>
    </section>
  );
}

function CierreCta() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <PathyBubble size={120} />
        </div>
        <h2 className="font-display text-5xl lg:text-[64px] leading-[0.98] tracking-tight text-ink">
          La convocatoria avisa tarde.
          <br />
          <span className="text-coral-600">Tú puedes ir adelantado.</span>
        </h2>
        <p className="mt-6 text-lg text-ink/55 max-w-xl mx-auto leading-relaxed">
          Cuando se publique la siguiente, el temario será el mismo y el plazo será corto. Llega con
          las 5 fuentes dominadas y tu preparación medida materia por materia.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={BUY_HREF}>
            Empezar mi preparación
          </Btn>
        </div>
      </div>
    </section>
  );
}

function ConvocatoriaAeromexicoPage() {
  useEffect(() => {
    document.body.classList.add("theme-hueso");
    return () => {
      document.body.classList.remove("theme-hueso");
    };
  }, []);

  return (
    <>
      <AeroBackdrop theme="hueso" />
      <Nav />
      <main>
        <EstadoConvocatoria />
        <Hero />
        <Requisitos />
        <Temario />
        <Evaluaciones />
        <Comprar />
        <PreguntasFrecuentes />
        <Aviso />
        <CierreCta />
      </main>
      <Footer />
    </>
  );
}
