/**
 * Módulo "Línea Aérea": dashboard de estudio profesional para la convocatoria
 * de Primer Oficial (Embraer 190 — Aeroméxico Connect / ASPA de México).
 *
 * Al llegar el piloto elige simulador, revisa los requisitos y evaluaciones
 * del proceso, y resuelve los cuestionarios oficiales del curso.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { useRequireAuth } from "@/lib/store";
import { LINEA_AEREA_QUIZZES } from "@/lib/store/linea-aerea-meta";
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
    <BancoScreen la header={<LineaAereaHero />} footer={<LineaAereaInfo />} />
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
        Elige cómo practicar: solo las preguntas oficiales del proceso o el banco potenciado de FlightPath.
      </p>
      <div style={{ display: "flex", gap: 22, marginTop: 18, flexWrap: "wrap" }}>
        {[
          { k: "Manuales del curso", v: String(LINEA_AEREA_QUIZZES.length) },
          { k: "Preguntas del curso", v: totalPreguntas.toLocaleString("es-MX") },
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

      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <h3 style={h3Style}><Icon n="book" size={18} color="#3D5D91" /> Manuales del curso</h3>
        <p style={{ fontSize: "0.82rem", color: "#647DA0", marginBottom: 16, lineHeight: 1.55 }}>
          Las preguntas de estos manuales son las que se intercalan en el modo potenciado.
          También puedes abrir el PDF fuente.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          {LINEA_AEREA_QUIZZES.map((q) => (
            <div key={q.code} style={{ border: "1px solid #E8EEF6", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#FAEFEE", color: "#6C0820", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon n={q.icon as FPIconName} size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, lineHeight: 1.35 }}>{q.titulo}</div>
                  <div style={{ fontSize: "0.76rem", color: "#647DA0", margin: "2px 0 10px" }}>
                    {q.total} preguntas · {q.code}
                  </div>
                  <a
                    href={q.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.74rem", fontWeight: 700, color: "#3D5D91",
                      background: "rgba(61,93,145,0.08)", padding: "6px 12px", borderRadius: 14,
                      textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <Icon n="book" size={12} /> Ver PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
