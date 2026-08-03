import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PRO_MONTHLY_FALLBACK, PRO_SETUP_FALLBACK } from "@/lib/pricing";
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
} from "./index";

/**
 * Landing SEO pública de la convocatoria ASPA / Aeroméxico Connect —
 * Primer Oficial Embraer 190. Capta búsquedas como "convocatoria aeromexico",
 * "convocatoria aspa", "jeppesen", "ATP" y vende el acceso al cuestionario de
 * práctica: el CTA lleva a registro y de ahí directo al checkout de Stripe
 * (/dashboard/planes?checkout=1). El contenido del temario replica el material
 * oficial ya organizado en /dashboard/linea-aerea.
 */

const CANONICAL = "https://flightpath.mx/convocatoria-aeromexico";

/** El CTA aterriza en el checkout embebido de Stripe después del registro. */
const BUY_HREF = `/register?next=${encodeURIComponent("/dashboard/planes?checkout=1")}`;

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Qué es la convocatoria de ASPA y Aeroméxico Connect?",
    a: "ASPA de México invita a pilotos a unirse como Primer Oficial de la flota Embraer 190 de Aeroméxico Connect. El proceso incluye un examen teórico sobre el temario oficial, la evaluación AON (Aviation Suite, con prueba de inglés), una evaluación en simulador y una entrevista con panel.",
  },
  {
    q: "¿Qué requisitos pide la convocatoria de ASPA?",
    a: "Edad de 18 a 50 años con 11 meses, nacionalidad mexicana por nacimiento, 250 horas de vuelo certificadas en bitácora (mínimo 180 de vuelo real y hasta 70 de simulador), carta de presentación de ASPA y expediente completo y actualizado en el archivo del sindicato.",
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
    a: "Organiza el temario oficial en materias con un banco de más de 2,800 preguntas con explicación, simulacros cronometrados, flashcards y un tutor IA disponible 24/7. Practicas cada fuente del temario (ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10) hasta dominar los temas donde más fallas.",
  },
  {
    q: "¿El cuestionario reemplaza al material oficial de la convocatoria?",
    a: "No. El material de referencia es el temario y la guía oficiales proporcionados por la empresa; FlightPath únicamente organiza ese material y te da práctica estructurada sobre él. FlightPath no está afiliada a ASPA de México ni a Aeroméxico.",
  },
];

const REQUISITOS: { icon: IconName; text: string }[] = [
  { icon: "cal", text: "Edad: de 18 años hasta 50 años con 11 meses" },
  { icon: "waypoint", text: "Nacionalidad mexicana por nacimiento" },
  { icon: "clock", text: "250 horas de vuelo certificadas en bitácora: mínimo 180 de vuelo real y hasta 70 de simulador" },
  { icon: "doc", text: "Carta de presentación de ASPA" },
  { icon: "shield", text: "Expediente completo y actualizado en el área de archivo del sindicato" },
];

const EVALUACIONES: { icon: IconName; title: string; sub: string }[] = [
  { icon: "doc", title: "Examen teórico", sub: "Sobre el temario oficial de la convocatoria" },
  { icon: "brain", title: "AON (Aviation Suite)", sub: "Psicométrica y de aptitudes; incluye la prueba de inglés" },
  { icon: "sim", title: "Simulador", sub: "Evaluación práctica de vuelo" },
  { icon: "user", title: "Panel", sub: "Entrevista con panel evaluador" },
];

const TEMARIO: { icon: IconName; title: string; detail: string; materias: string[] }[] = [
  {
    icon: "book",
    title: "ATP — Airline Transport Pilot",
    detail: "Completo, excepto los capítulos de Performance y Weight & Balance.",
    materias: ["Aerodinámica", "Aeronaves y Motores", "Meteorología", "Navegación", "Operaciones"],
  },
  {
    icon: "library",
    title: "Pilot's Handbook of Aeronautical Knowledge (PHAK)",
    detail: "Completo, excepto el capítulo 1.",
    materias: ["Aerodinámica", "Meteorología", "Medicina de Aviación", "Factores Humanos"],
  },
  {
    icon: "compass",
    title: "Jeppesen General Airway Manual",
    detail: "Sección Introduction: cartas, simbología y procedimientos.",
    materias: ["Manuales AIS", "Navegación"],
  },
  {
    icon: "doc",
    title: "CPAM — Legislación nacional",
    detail: "Compendio de legislación nacional relacionada a tripulaciones de vuelo.",
    materias: ["Legislación Aeronáutica"],
  },
  {
    icon: "radio",
    title: "OACI Anexo 10, Volumen II",
    detail: "Telecomunicaciones aeronáuticas — procedimientos de comunicación.",
    materias: ["Comunicaciones"],
  },
];

const INCLUYE: string[] = [
  "Banco de 2,800+ preguntas con explicación, mapeado al temario oficial",
  "Simulacros cronometrados tipo examen",
  "Módulo Línea Aérea: la convocatoria organizada paso a paso",
  "Flashcards y repaso dirigido por materia débil",
  "Tutor IA Yaris 24/7 con el contexto del curso",
  "Análisis de desempeño por materia y tema",
];

export const Route = createFileRoute("/convocatoria-aeromexico")({
  component: ConvocatoriaAeromexicoPage,
  head: () => ({
    meta: [
      { title: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190 | FlightPath" },
      {
        name: "description",
        content:
          "Prepárate para la convocatoria de Aeroméxico Connect y ASPA: Primer Oficial Embraer 190. Practica el temario oficial — ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 — con el cuestionario de FlightPath.",
      },
      {
        name: "keywords",
        content:
          "convocatoria aeromexico, convocatoria aspa, primer oficial embraer 190, jeppesen, jeppesen general airway manual, ATP airline transport pilot, PHAK, CPAM, OACI anexo 10, examen teorico aeromexico connect",
      },
      { property: "og:title", content: "Convocatoria Aeroméxico · ASPA — Primer Oficial Embraer 190" },
      {
        property: "og:description",
        content:
          "Cuestionario de práctica del temario oficial: ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10. Compra tu acceso y practica hasta dominarlo.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
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
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Inicio", item: "https://flightpath.mx/" },
                { "@type": "ListItem", position: 2, name: "Convocatoria Aeroméxico — Embraer 190", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={24} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">ASPA de México · Aeroméxico Connect</span>
            </div>
            <h1 className="font-display mt-6 text-[40px] sm:text-[54px] lg:text-[60px] leading-[1.0] tracking-tight text-ink">
              Convocatoria Aeroméxico:
              <span className="block text-coral-600 mt-1">Primer Oficial Embraer 190.</span>
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-ink/55 max-w-xl leading-relaxed">
              ¿Vas por la convocatoria de ASPA? Practica el temario oficial del examen teórico —
              ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10 — con un cuestionario
              que te dice exactamente dónde estás fallando.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" href={BUY_HREF}>Comprar acceso al cuestionario</Btn>
              <Btn kind="light" size="lg" iconLeft="book" href="#temario">Ver el temario oficial</Btn>
            </div>
            <p className="mt-4 text-[12.5px] text-ink/45 flex items-center gap-1.5">
              <Icon n="shield" className="w-3.5 h-3.5" /> Pago seguro procesado por Stripe · Cancela cuando quieras
            </p>
          </div>

          <div className="relative lg:h-[440px] flex items-center justify-center">
            <PathyBubble size={260} className="lg:absolute lg:right-4 lg:top-4" />
            <div className="hidden lg:block absolute left-0 bottom-8 w-[250px] bg-ink rounded-2xl p-4 shadow-navy animate-float-y-sm">
              <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase tracking-[0.16em] font-semibold mb-3">
                <Icon n="target" className="w-3.5 h-3.5 text-coral-400" /> Cuestionario E190
              </div>
              <div className="text-white text-[14px] leading-snug">
                5 fuentes oficiales,<br />
                <span className="text-coral-400 font-semibold">una sola ruta de práctica.</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["ATP", "PHAK", "Jeppesen", "CPAM", "OACI A10"].map((t) => (
                  <span key={t} className="text-[10.5px] font-mono text-white/70 border border-white/15 rounded-full px-2 py-0.5">{t}</span>
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
            title={<>Requisitos de la <span className="text-coral-600">convocatoria ASPA.</span></>}
            sub="ASPA de México invita a unirse a su grupo de pilotos como Primer Oficial de la flota Embraer 190 de Aeroméxico Connect. Esto es lo que pide el proceso."
          />
          <div className="space-y-3">
            {REQUISITOS.map((r) => (
              <div key={r.text} className="flex items-start gap-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card px-5 py-4">
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
          title={<>Lo que evalúa el <span className="text-coral-600">examen teórico.</span></>}
          sub="Estas son las cinco fuentes que define la empresa para el examen de Primer Oficial Embraer 190, y las materias de FlightPath con las que practicas cada una."
        />
        <div className="mt-14 space-y-4">
          {TEMARIO.map((f) => (
            <div key={f.title} className="rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-7">
              <div className="flex items-start gap-5">
                <span className="w-12 h-12 rounded-2xl bg-ink text-coral-400 grid place-items-center shrink-0">
                  <Icon n={f.icon} className="w-6 h-6" />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-[19px] lg:text-[21px] text-ink tracking-tight">{f.title}</h3>
                  <p className="mt-1 text-[14px] text-ink/55">{f.detail}</p>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {f.materias.map((m) => (
                      <Pill key={m} tone="coral"><Icon n="check" className="w-3 h-3" />{m}</Pill>
                    ))}
                  </div>
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
          title={<>Las 4 evaluaciones <span className="text-coral-600">de la convocatoria.</span></>}
          sub="El examen teórico es la primera puerta. Llega con el temario dominado y el resto del proceso se vuela mejor."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EVALUACIONES.map((e, i) => (
            <div key={e.title} className="rounded-3xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card p-6">
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
              Compra tu acceso y <span className="text-coral-600">practica hasta dominarlo.</span>
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-ink/55 max-w-lg">
              El cuestionario Embraer 190 — Primer Oficial vive dentro de FlightPath Pro: practicas el
              temario oficial completo, mides tu avance por materia y repites los temas débiles hasta
              que el examen teórico deje de ser incógnita.
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
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.20), transparent)" }} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-coral-400">Embraer 190 · Primer Oficial</div>
                <Pill tone="light">Acceso completo</Pill>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-6xl tracking-tight text-white">
                  ${PRO_MONTHLY_FALLBACK.amount.toLocaleString("es-MX")}
                </span>
                <span className="text-white/50 text-sm">{PRO_MONTHLY_FALLBACK.currency} / mes</span>
              </div>
              <div className="mt-2 text-[13px] text-white/55">
                + ${PRO_SETUP_FALLBACK.amount.toLocaleString("es-MX")} {PRO_SETUP_FALLBACK.currency} de inscripción (pago único)
              </div>
              <p className="text-[14px] text-white/60 mt-4">
                Acceso Pro a toda la plataforma: cuestionario de la convocatoria, banco completo,
                simulacros y tutor IA. Sin plazos forzosos.
              </p>
              <Btn kind="primary" size="lg" icon="arrow" className="w-full mt-7" href={BUY_HREF}>Comprar acceso</Btn>
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
          title={<>Convocatoria, temario <span className="text-coral-600">y cuestionario.</span></>}
        />
        <div className="mt-12 space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-3xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-6 lg:p-7">
              <h3 className="font-display text-[17px] lg:text-[18px] text-ink tracking-tight">{f.q}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink/60">{f.a}</p>
            </div>
          ))}
        </div>
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
            El material de referencia de la convocatoria es el temario y la guía oficiales
            proporcionados por la empresa. FlightPath únicamente organiza ese material oficial y te da
            práctica estructurada sobre él; <strong>no está afiliada a ASPA de México ni a Aeroméxico</strong>.
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
        <div className="flex justify-center mb-8"><PathyBubble size={120} /></div>
        <h2 className="font-display text-5xl lg:text-[64px] leading-[0.98] tracking-tight text-ink">
          El examen teórico<br /><span className="text-coral-600">se gana practicando.</span>
        </h2>
        <p className="mt-6 text-lg text-ink/55 max-w-xl mx-auto leading-relaxed">
          Llega a la convocatoria con las 5 fuentes del temario dominadas y tu preparación medida
          materia por materia.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={BUY_HREF}>Comprar acceso al cuestionario</Btn>
        </div>
      </div>
    </section>
  );
}

function ConvocatoriaAeromexicoPage() {
  useEffect(() => {
    document.body.classList.add("theme-hueso");
    return () => { document.body.classList.remove("theme-hueso"); };
  }, []);

  return (
    <>
      <AeroBackdrop theme="hueso" />
      <Nav />
      <main>
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
