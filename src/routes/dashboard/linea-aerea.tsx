/**
 * Módulo "Línea Aérea": preparación profesional para convocatorias de
 * aerolínea. Primera convocatoria cubierta: ASPA de México — Primer Oficial
 * de la flota Embraer 190 de Aeroméxico Connect.
 *
 * La sección organiza el material de referencia OFICIAL de la convocatoria
 * (temario y guía proporcionados por la empresa) y lo conecta con la práctica
 * en FlightPath. La propia convocatoria desaconseja cursos de terceros sin
 * respaldo: aquí no se vende un curso, se organiza el material oficial.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { useRequireAuth } from "@/lib/store";

export const Route = createFileRoute("/dashboard/linea-aerea")({
  component: LineaAereaPage,
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const INK = "#22375C";

const DRIVE_URL = "https://drive.google.com/drive/folders/1REwNEDY3N_Gcq0SJcO2o0B-kxGQQub0u";

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

interface Fuente {
  icon: FPIconName;
  title: string;
  detail: string;
  materias: { label: string; slugs: string }[];
}

const TEMARIO: Fuente[] = [
  {
    icon: "book",
    title: "ATP — Airline Transport Pilot",
    detail: "Completo, excepto los capítulos de Performance y Weight & Balance.",
    materias: [
      { label: "Aerodinámica", slugs: "aerodinamica" },
      { label: "Aeronaves y Motores", slugs: "aeronaves-motores" },
      { label: "Meteorología", slugs: "meteorologia" },
      { label: "Navegación", slugs: "navegacion" },
      { label: "Operaciones", slugs: "operaciones" },
    ],
  },
  {
    icon: "graduation",
    title: "Pilot's Handbook of Aeronautical Knowledge (PHAK)",
    detail: "Completo, excepto el capítulo 1.",
    materias: [
      { label: "Aerodinámica", slugs: "aerodinamica" },
      { label: "Meteorología", slugs: "meteorologia" },
      { label: "Medicina de Aviación", slugs: "medicina" },
      { label: "Factores Humanos", slugs: "factores-humanos" },
    ],
  },
  {
    icon: "map",
    title: "Jeppesen General Airway Manual",
    detail: "Sección Introduction.",
    materias: [
      { label: "Manuales AIS", slugs: "manuales-ais" },
      { label: "Navegación", slugs: "navegacion" },
    ],
  },
  {
    icon: "scale",
    title: "CPAM — Legislación nacional",
    detail: "Compendio de legislación nacional relacionada a tripulaciones de vuelo.",
    materias: [{ label: "Legislación Aeronáutica", slugs: "legislacion" }],
  },
  {
    icon: "radio",
    title: "OACI Anexo 10, Volumen II",
    detail: "Telecomunicaciones aeronáuticas — procedimientos de comunicación.",
    materias: [{ label: "Comunicaciones", slugs: "comunicaciones" }],
  },
];

const PLAN_SEMANAS: { sem: string; foco: string; fuentes: string }[] = [
  { sem: "Semana 1", foco: "Base teórica: aerodinámica, performance conceptual y sistemas", fuentes: "PHAK (caps. 2-7) + ATP" },
  { sem: "Semana 2", foco: "Meteorología, navegación y cartas", fuentes: "PHAK + ATP + Jeppesen GAM (Introduction)" },
  { sem: "Semana 3", foco: "Legislación nacional y comunicaciones", fuentes: "CPAM + OACI Anexo 10 Vol. II" },
  { sem: "Semana 4", foco: "Repaso integral, cuestionarios por materia débil y simulacros", fuentes: "Todo el temario + banco FlightPath" },
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
    <div style={{ fontFamily: FONT, color: INK, maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(145deg, #22375C, #2a2a4e)",
          borderRadius: 20,
          padding: "32px 28px",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(242,174,188,0.2)", color: "#F2AEBC",
            padding: "5px 12px", borderRadius: 20,
            fontSize: "0.72rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16,
          }}
        >
          <Icon n="plane" size={14} /> Preparación profesional · Convocatoria activa
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "1.7rem", color: "white", marginBottom: 8, lineHeight: 1.2 }}>
          Primer Oficial — Embraer 190
        </h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 560 }}>
          ASPA de México invita a unirse a su grupo de pilotos como Primer Oficial de la flota
          Embraer 190 de <strong style={{ color: "white" }}>Aeroméxico Connect</strong>. Aquí tienes la
          convocatoria organizada: requisitos, evaluaciones, temario oficial y cómo practicarlo en FlightPath.
        </p>
        <a
          href={DRIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginTop: 18, padding: "12px 20px",
            background: "#F2AEBC", color: "#6C0820",
            borderRadius: 11, fontSize: "0.88rem", fontWeight: 700, textDecoration: "none",
          }}
        >
          <Icon n="download" size={16} /> Abrir material de estudio oficial (Drive)
        </a>
      </div>

      {/* Requisitos + Evaluaciones */}
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

      {/* Temario oficial */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h3 style={h3Style}><Icon n="book" size={18} color="#3D5D91" /> Temario de evaluación (material de referencia oficial)</h3>
        <p style={{ fontSize: "0.82rem", color: "#647DA0", marginBottom: 16, lineHeight: 1.55 }}>
          Estas son las fuentes que la empresa define para el examen teórico. Junto a cada una tienes
          las materias del banco de FlightPath con las que puedes practicarla.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TEMARIO.map((f) => (
            <div key={f.title} style={{ border: "1px solid #E8EEF6", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#FAEFEE", color: "#6C0820", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon n={f.icon} size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{f.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "#647DA0", marginBottom: 8 }}>{f.detail}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {f.materias.map((m) => (
                      <Link
                        key={m.slugs}
                        to="/cuestionario"
                        search={{ materias: m.slugs }}
                        style={{
                          fontSize: "0.72rem", fontWeight: 700, color: "#3D5D91",
                          background: "rgba(61,93,145,0.08)", padding: "4px 10px",
                          borderRadius: 14, textDecoration: "none",
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <Icon n="help" size={12} /> Practicar {m.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan sugerido */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h3 style={h3Style}><Icon n="calendar" size={18} color="#3D5D91" /> Plan de estudio sugerido (4 semanas)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PLAN_SEMANAS.map((s) => (
            <div key={s.sem} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#f8f9ff", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#6C0820", minWidth: 76, marginTop: 2 }}>{s.sem}</div>
              <div>
                <div style={{ fontSize: "0.84rem", fontWeight: 600 }}>{s.foco}</div>
                <div style={{ fontSize: "0.76rem", color: "#647DA0" }}>{s.fuentes}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Link
            to="/dashboard/banco"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "11px 18px", background: "#6C0820", color: "white",
              borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
            }}
          >
            <Icon n="help" size={15} /> Practicar con el banco
          </Link>
          <Link
            to="/simulador"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "11px 18px", background: "white", color: "#3D5D91",
              border: "2px solid #3D5D91", borderRadius: 10,
              fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
            }}
          >
            <Icon n="sim" size={15} /> Hacer un simulacro
          </Link>
        </div>
      </div>

      {/* Aviso importante */}
      <div
        style={{
          background: "rgba(243,156,18,0.08)",
          border: "1px solid rgba(243,156,18,0.4)",
          borderRadius: 12,
          padding: "14px 18px",
          fontSize: "0.8rem",
          color: "#8a6000",
          lineHeight: 1.6,
          marginBottom: 32,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <span style={{ flexShrink: 0, display: "flex", marginTop: 2 }}><Icon n="alert" size={16} /></span>
        <span>
          La Secretaría de Trabajo y Conflictos de ASPA <strong>no recomienda contratar cursos de
          preparación de terceros</strong> para esta convocatoria: el material de referencia es el temario
          y la guía oficiales proporcionados por la empresa. Esta sección de FlightPath únicamente
          organiza ese material oficial y lo conecta con tu práctica; FlightPath no está afiliada a
          ASPA de México ni a Aeroméxico.
        </span>
      </div>
    </div>
  );
}
