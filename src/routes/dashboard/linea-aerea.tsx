/**
 * Módulo "Línea Aérea": dashboard de estudio profesional para la convocatoria
 * de Primer Oficial (Embraer 190 — Aeroméxico Connect / ASPA de México).
 *
 * Al llegar el piloto elige simulador, revisa los requisitos y evaluaciones
 * del proceso, y resuelve los cuestionarios oficiales del curso.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { MATERIAS_DEF, useRequireAuth } from "@/lib/store";
import { LINEA_AEREA_OFICIAL_TOTAL, LINEA_AEREA_QUIZZES } from "@/lib/store/linea-aerea-meta";
import { BancoScreen } from "@/components/banco/BancoScreen";

export const Route = createFileRoute("/dashboard/linea-aerea")({
  component: LineaAereaPage,
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const INK = "#22375C";

const REQUISITOS: { icon: FPIconName; text: string }[] = [
  { icon: "calendar", text: "Edad: de 18 años hasta 50 años con 11 meses" },
  { icon: "flag", text: "Nacionalidad mexicana por nacimiento" },
  { icon: "clock", text: "250 horas de vuelo certificadas en bitácora: mínimo 180 de vuelo real y hasta 70 de simulador" },
  { icon: "doc", text: "Carta de presentación de ASPA" },
  { icon: "info", text: "Expediente completo y actualizado en el área de archivo del sindicato (entrega física de documentos — contactar a Erika Pineda, ext. 1620)" },
];

const EVALUACIONES: { icon: FPIconName; title: string; sub: string }[] = [
  { icon: "doc", title: "Examen teórico", sub: "Sobre el temario oficial de la convocatoria" },
  { icon: "brain", title: "AON (Aviation Suite)", sub: "Evaluación psicométrica y de aptitudes; incluye la prueba de inglés" },
  { icon: "sim", title: "Simulador", sub: "Evaluación práctica de vuelo" },
  { icon: "users", title: "Panel", sub: "Entrevista con panel evaluador" },
];

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 2px 16px rgba(61,93,145,0.07)",
};

const h3Style: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontSize: "1.05rem",
  color: INK,
  marginBottom: 14,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

function LineaAereaPage() {
  const { ready } = useRequireAuth();
  if (!ready) return <div style={{ minHeight: "60vh" }} />;

  return (
    <BancoScreen
      la
      modes={false}
      header={
        <>
          <LineaAereaHero />
          <QuizCardsManuales />
        </>
      }
      footer={<LineaAereaInfo />}
    />
  );
}

/* ─── Tarjetas de cuestionarios ──────────────────────── */

const materiaDe = (slug: string) => MATERIAS_DEF.find((m) => m.slug === slug);

const quizCardsCss = `
  .fp-la-card { transition: transform .22s cubic-bezier(.3,1,.4,1), box-shadow .22s ease, border-color .22s ease; }
  @media (hover: hover) {
    .fp-la-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px -18px rgba(34,55,92,.35); border-color: rgba(61,93,145,.35) !important; }
    .fp-la-card:hover .fp-la-go { color: #6C0820; }
  }
  .fp-la-card:active { transform: scale(.985); }
`;

function LaSectionHead({ icon, title, sub }: { icon: FPIconName; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "1.15rem", color: INK, display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Icon n={icon} size={18} color="#6C0820" /> {title}
      </h2>
      <p style={{ fontSize: "0.8rem", color: "#647DA0", lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}

/** Los cuestionarios del curso, uno por manual (ATP, PHAK, CPAM, Jeppesen, Anexo 10). */
function QuizCardsManuales() {
  return (
    <div style={{ maxWidth: 820, width: "100%", fontFamily: FONT, color: INK, marginBottom: 8 }}>
      <style>{quizCardsCss}</style>
      <LaSectionHead
        icon="book"
        title="Cuestionarios por manual"
        sub="Cada manual es un mini simulador en modo aprendiendo: 50 reactivos de ATP, Handbook (PHAK), Legislación (CPAM), Jeppesen u OACI Anexo 10, con feedback inmediato, “Explícamelo Yaris” en cada pregunta y el PDF fuente a la mano."
      />

      {/* Examen oficial completo destacado */}
      <Link
        to="/cuestionario"
        search={{ banco: "la", modo: "oficial", qty: LINEA_AEREA_OFICIAL_TOTAL }}
        className="fp-la-card"
        style={{
          display: "flex", alignItems: "center", gap: 16, textDecoration: "none",
          background: "linear-gradient(135deg, #6C0820, #8f1f3c)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
          padding: "18px 20px", marginBottom: 12, color: "white",
        }}
      >
        <span style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon n="trophy" size={23} color="#F2AEBC" />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: DISPLAY, fontSize: "1.02rem", fontWeight: 800 }}>
            Examen oficial completo
          </span>
          <span style={{ display: "block", fontSize: "0.78rem", opacity: 0.85, marginTop: 2 }}>
            Las {LINEA_AEREA_OFICIAL_TOTAL} preguntas oficiales del proceso
          </span>
        </span>
        <span className="fp-la-go" style={{ fontSize: "0.82rem", fontWeight: 800, color: "#F2AEBC", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}>
          Iniciar <Icon n="arrow" size={15} />
        </span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
        {LINEA_AEREA_QUIZZES.map((q) => {
          const def = materiaDe(q.materia);
          return (
            <div
              key={q.code}
              className="fp-la-card"
              style={{ background: "white", border: "1px solid #E8EEF6", borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FAEFEE", color: "#6C0820", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon n={q.icon as FPIconName} size={19} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: "0.92rem", fontWeight: 800, color: INK, lineHeight: 1.3 }}>{q.titulo}</div>
                  <div style={{ fontSize: "0.73rem", color: "#8DA1BE", marginTop: 3 }}>
                    {q.total} preguntas · {q.code}{def ? ` · ${def.name}` : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link
                  to="/cuestionario"
                  search={{ fuente: q.code }}
                  style={{
                    fontSize: "0.78rem", fontWeight: 800, color: "white", background: "#6C0820",
                    padding: "9px 16px", borderRadius: 11, textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  <Icon n="help" size={14} /> Iniciar cuestionario
                </Link>
                <a
                  href={q.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.78rem", fontWeight: 700, color: "#3D5D91", background: "rgba(61,93,145,0.08)",
                    padding: "9px 14px", borderRadius: 11, textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  <Icon n="book" size={14} /> Ver PDF
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Hero: convocatoria ─────────────────────────────── */

function LineaAereaHero() {
  const totalPreguntas = LINEA_AEREA_QUIZZES.reduce((s, q) => s + q.total, 0);
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #22375C, #2a2a4e)",
        borderRadius: 20,
        padding: "30px 28px",
        marginBottom: 32,
        maxWidth: 820,
        width: "100%",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(242,174,188,0.2)", color: "#F2AEBC",
          padding: "5px 12px", borderRadius: 20,
          fontSize: "0.72rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14,
        }}
      >
        <Icon n="plane" size={14} /> Convocatoria activa
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontSize: "1.7rem", color: "white", marginBottom: 8, lineHeight: 1.2 }}>
        Primer Oficial — Embraer 190
      </h1>
      <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 620 }}>
        Tu tablero de estudio para la convocatoria de ASPA de México con Aeroméxico Connect.
        Cada manual del curso es su propio cuestionario: un mini simulador en modo aprendiendo,
        con feedback inmediato y Yaris explicándote cada pregunta.
      </p>
      <div style={{ display: "flex", gap: 22, marginTop: 18, flexWrap: "wrap" }}>
        {[
          { k: "Preguntas oficiales", v: LINEA_AEREA_OFICIAL_TOTAL.toLocaleString("es-MX") },
          { k: "Manuales del curso", v: String(LINEA_AEREA_QUIZZES.length) },
          { k: "Preguntas de manuales", v: totalPreguntas.toLocaleString("es-MX") },
          { k: "Evaluaciones", v: String(EVALUACIONES.length) },
        ].map((s) => (
          <div key={s.k}>
            <div style={{ fontFamily: DISPLAY, fontSize: "1.35rem", color: "white", lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Requisitos, evaluaciones y cuestionarios ───────── */

function LineaAereaInfo() {
  return (
    <div style={{ maxWidth: 820, width: "100%", fontFamily: FONT, color: INK, marginTop: 40 }}>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, marginBottom: 16 }}>
        <div style={cardStyle}>
          <h3 style={h3Style}><Icon n="checkCircle" size={18} color="#3D5D91" /> Requisitos</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {REQUISITOS.map((r) => (
              <div key={r.text} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.84rem", lineHeight: 1.5, color: "#33527F" }}>
                <span style={{ flexShrink: 0, marginTop: 2, color: "#3D5D91", display: "flex" }}><Icon n={r.icon} size={15} /></span>
                {r.text}
              </div>
            ))}
          </div>
        </div>
        <div style={cardStyle}>
          <h3 style={h3Style}><Icon n="target" size={18} color="#3D5D91" /> Evaluaciones del proceso</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {EVALUACIONES.map((e) => (
              <div key={e.title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(61,93,145,0.08)", color: "#3D5D91", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon n={e.icon} size={17} />
                </div>
                <div>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700 }}>{e.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "#647DA0" }}>{e.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
