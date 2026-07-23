import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BackLink } from "@/components/shared/BackLink";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes — FlightPath CIAAC" },
      { name: "description", content: "Respuestas sobre planes, simuladores, Yaris y Pathy, cancelación y funcionamiento de FlightPath para el examen CIAAC." },
      { property: "og:title", content: "Preguntas frecuentes — FlightPath" },
      { property: "og:description", content: "Planes, simulador CIAAC, tutores IA y todo lo que necesitas saber antes de empezar." },
      { property: "og:url", content: "https://flightpath.mx/faq" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://flightpath.mx/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
});

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Qué es FlightPath?",
    a: "FlightPath es la plataforma de preparación para el examen CIAAC: las 12 materias con Learning Paths paso a paso, un banco de más de 2,800 preguntas con explicación, simuladores con el formato del examen oficial, biblioteca de manuales, flashcards, clases grabadas y dos copilotos inteligentes — Yaris (tu tutor IA) y Pathy (tu acompañante de motivación y recordatorios).",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "FlightPath Basic es gratuito e incluye funciones limitadas y básicas para conocer la plataforma. FlightPath Pro desbloquea todo: $1,500 MXN al mes o $12,000 MXN al año. Durante los primeros 15 días del lanzamiento, el plan anual tiene precio especial de $10,000 MXN.",
  },
  {
    q: "¿Qué incluye FlightPath Basic (gratis)?",
    a: "El primer tema de cada materia, 10 preguntas de práctica por materia, un simulador al mes y una muestra de la biblioteca. Es suficiente para conocer cómo se estudia en FlightPath antes de decidir.",
  },
  {
    q: "¿Qué diferencia hay entre Basic y Pro?",
    a: "Pro desbloquea las 12 materias completas con sus Learning Paths, todo el banco de preguntas con explicación, simuladores CIAAC ilimitados, la biblioteca completa con más de 100 manuales oficiales, flashcards, clases grabadas, Estudiemos Juntos y los recordatorios de Pathy por WhatsApp. El pago mensual y el anual incluyen exactamente lo mismo.",
  },
  {
    q: "¿Hay prueba gratis?",
    a: "No manejamos prueba gratis con vencimiento: FlightPath Basic es gratuito para siempre, con funciones limitadas. Cuando quieras el acceso completo, pasas a Pro.",
  },
  {
    q: "¿Cómo funciona el simulador CIAAC?",
    a: "Reproduce el formato del examen oficial: 310 preguntas de las 12 materias con la ponderación del CIAAC y tiempo controlado. Al terminar recibes tu calificación, el desglose por materia y puedes revisar cada error con la explicación de Yaris.",
  },
  {
    q: "¿Quiénes son Yaris y Pathy?",
    a: "Yaris es tu tutor IA: responde dudas al instante, explica cada pregunta con su fuente, usa nemotecnias y se adapta a cómo aprendes. Pathy es tu copiloto de constancia: te motiva, celebra tu racha, te recuerda tus sesiones y evoluciona contigo conforme avanzas.",
  },
  {
    q: "¿Qué pasa si completo mi ruta y no me siento listo?",
    a: "Si completas tu ruta de estudio y no notas una mejora real en tu preparación y seguridad para el CIAAC, extendemos tu acceso y ajustamos contigo tu plan de estudio.",
  },
  {
    q: "¿Puedo cancelar mi suscripción?",
    a: "Sí. Puedes cancelar cuando quieras desde Configuración o escribiéndonos; conservas el acceso Pro hasta el final del periodo pagado y tu progreso nunca se pierde.",
  },
  {
    q: "¿En qué dispositivos funciona?",
    a: "FlightPath funciona en el navegador de tu computadora, tablet o celular — sin instalar nada. Tu progreso se sincroniza automáticamente entre dispositivos con tu cuenta.",
  },
  {
    q: "¿Cómo los contacto?",
    a: "Escríbenos a contacto@flowstateai.com.mx o usa el botón de Reportar problema dentro de la plataforma; el equipo da seguimiento a cada mensaje.",
  },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E3EAF5", borderRadius: 14, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
          padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: INK,
        }}
      >
        {q}
        <span style={{ color: "#6C0820", fontSize: 18, transform: open ? "rotate(45deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 18px", color: "#4A5F80", fontSize: 14.5, lineHeight: 1.75 }}>{a}</div>
      )}
    </div>
  );
}

/** Preguntas frecuentes (enlazada desde el pie de la página principal). */
function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FC", fontFamily: FONT }}>
      <header
        style={{
          background: "#fff", borderBottom: "1px solid #E3EAF5",
          padding: "16px clamp(16px, 5vw, 48px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ fontFamily: DISPLAY, fontWeight: 800, color: INK, textDecoration: "none", fontSize: 18 }}>
          FlightPath ✈
        </Link>
        <BackLink />

      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(28px, 6vw, 56px) 20px 80px" }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.6rem, 5vw, 2.2rem)", color: INK, fontWeight: 800, margin: "0 0 8px" }}>
          Preguntas frecuentes
        </h1>
        <p style={{ color: "#647DA0", fontSize: 14, marginBottom: 36 }}>
          Todo lo que necesitas saber sobre FlightPath. ¿No encuentras tu respuesta? Escríbenos a{" "}
          <a href="mailto:contacto@flowstateai.com.mx" style={{ color: "#3D5D91", fontWeight: 700 }}>contacto@flowstateai.com.mx</a>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>

        <div style={{ marginTop: 44, textAlign: "center" }}>
          <Link
            to="/register"
            style={{
              display: "inline-block", background: "#6C0820", color: "#fff", textDecoration: "none",
              fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 12, fontFamily: FONT,
            }}
          >
            Únete a FlightPath →
          </Link>
        </div>
      </main>
    </div>
  );
}
