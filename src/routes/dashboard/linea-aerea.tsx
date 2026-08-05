/**
 * Módulo "Línea Aérea": tablero de estudio para la convocatoria de Primer
 * Oficial (Embraer 190 — Aeroméxico Connect / ASPA de México).
 *
 * Cada tarjeta es un cuestionario en modo aprendiendo: la guía oficial del
 * proceso y un manual del curso por tarjeta. Debajo, el historial permite
 * reanudar lo que quedó a medias.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { useRequireAuth } from "@/lib/store";
import {
  LINEA_AEREA_OFICIAL,
  LINEA_AEREA_OFICIAL_TOTAL,
  LINEA_AEREA_QUIZZES,
} from "@/lib/store/linea-aerea-meta";
import { BancoScreen } from "@/components/banco/BancoScreen";

export const Route = createFileRoute("/dashboard/linea-aerea")({
  component: LineaAereaPage,
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const INK = "#22375C";

function LineaAereaPage() {
  const { ready } = useRequireAuth();
  if (!ready) return <div style={{ minHeight: "60vh" }} />;

  return (
    <BancoScreen
      la
      modes={false}
      extras={false}
      header={
        <>
          <LineaAereaHero />
          <QuizCards />
        </>
      }
    />
  );
}

/* ─── Hero: convocatoria ─────────────────────────────── */

function LineaAereaHero() {
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
        Cada cuestionario es un mini simulador en modo aprendiendo, con feedback inmediato
        y Yaris explicándote cada pregunta.
      </p>
    </div>
  );
}

/* ─── Tarjetas de cuestionarios ──────────────────────── */

const quizCardsCss = `
  .fp-la-card { transition: transform .25s cubic-bezier(.3,1,.4,1), box-shadow .25s ease; }
  @media (hover: hover) {
    .fp-la-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(26,26,46,0.18); }
    .fp-la-card.fp-la-dark:hover { box-shadow: 0 20px 48px rgba(26,26,46,0.4); }
  }
  .fp-la-card:active { transform: scale(.99); }
`;

/**
 * Tarjeta con la anatomía de los modos del CIAAC: distintivo, ícono, título,
 * descripción, lista de lo que incluye y botón de ancho completo.
 */
function QuizCard({
  dark = false,
  badge,
  icon,
  titulo,
  descripcion,
  features,
  to,
  search,
  pdfUrl,
  onStart,
  ctaLabel = "Iniciar cuestionario →",
}: {
  dark?: boolean;
  badge: string;
  icon: FPIconName;
  titulo: string;
  descripcion: string;
  features: string[];
  to?: string;
  search?: Record<string, unknown>;
  pdfUrl?: string;
  /** Si se define, la tarjeta abre un selector en vez de navegar. */
  onStart?: () => void;
  ctaLabel?: string;
}) {

  return (
    <div
      className={`fp-la-card${dark ? " fp-la-dark" : ""}`}
      style={{
        borderRadius: 20,
        padding: "28px 26px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT,
        background: dark ? "linear-gradient(145deg, #22375C, #2a2a4e)" : "white",
        border: dark ? "3px solid transparent" : "3px solid #F2DCDB",
        boxShadow: dark ? "none" : "0 2px 16px rgba(61,93,145,0.07)",
      }}
    >
      {/* Distintivo */}
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
          background: dark ? "rgba(242,174,188,0.16)" : "rgba(61,93,145,0.08)",
          color: dark ? "#F2AEBC" : "#3D5D91",
          padding: "5px 12px", borderRadius: 20, marginBottom: 18,
          fontSize: "0.68rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}
      >
        <Icon n={icon} size={13} /> {badge}
      </div>

      <div style={{ color: dark ? "#F2AEBC" : "#6C0820", marginBottom: 12, display: "flex" }}>
        <Icon n={icon} size={26} />
      </div>

      <h3
        style={{
          fontFamily: DISPLAY,
          fontSize: "1.3rem",
          lineHeight: 1.2,
          color: dark ? "white" : INK,
          marginBottom: 8,
        }}
      >
        {titulo}
      </h3>
      <p
        style={{
          fontSize: "0.85rem",
          lineHeight: 1.55,
          color: dark ? "rgba(255,255,255,0.72)" : "#647DA0",
          marginBottom: 16,
        }}
      >
        {descripcion}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {features.map((f) => (
          <div
            key={f}
            style={{
              display: "flex", alignItems: "flex-start", gap: 9,
              fontSize: "0.8rem", lineHeight: 1.45,
              color: dark ? "rgba(255,255,255,0.85)" : "#33527F",
            }}
          >
            <span
              style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 7,
                background: dark ? "#F2AEBC" : "#6C0820",
              }}
            />
            {f}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {onStart ? (
          <button
            type="button"
            onClick={onStart}
            style={{
              padding: "13px 20px",
              borderRadius: 12,
              fontSize: "0.9rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: dark ? "#F2AEBC" : "#3D5D91",
              color: dark ? "#6C0820" : "white",
            }}
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            to={to!}
            search={(search ?? {}) as never}
            style={{
              padding: "13px 20px",
              borderRadius: 12,
              fontSize: "0.9rem",
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: dark ? "#F2AEBC" : "#3D5D91",
              color: dark ? "#6C0820" : "white",
            }}
          >
            {ctaLabel}
          </Link>
        )}

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: "rgba(61,93,145,0.08)",
              color: "#3D5D91",
            }}
          >
            <Icon n="book" size={14} /> Ver PDF
          </a>
        )}
      </div>
    </div>
  );
}

function QuizCards() {
  return (
    <div style={{ maxWidth: 820, width: "100%", fontFamily: FONT, color: INK, marginBottom: 8 }}>
      <style>{quizCardsCss}</style>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "1.15rem", color: INK, display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <Icon n="book" size={18} color="#6C0820" /> Cuestionarios
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
        {/* Guía oficial del proceso */}
        <QuizCard
          dark
          badge="Preguntas oficiales"
          icon="target"
          titulo={LINEA_AEREA_OFICIAL.titulo}
          descripcion={LINEA_AEREA_OFICIAL.descripcion}
          features={[
            `${LINEA_AEREA_OFICIAL_TOTAL} preguntas de la guía oficial`,
            "Feedback inmediato por respuesta",
            'Botón "Explícamelo Yaris" siempre visible',
            "Sin límite de tiempo",
          ]}
          to="/cuestionario"
          search={{ banco: "la", modo: "oficial", qty: LINEA_AEREA_OFICIAL_TOTAL }}
        />

        {/* Un cuestionario por manual del curso */}
        {LINEA_AEREA_QUIZZES.map((q) => (
          <QuizCard
            key={q.code}
            badge="Manual del curso"
            icon={q.icon as FPIconName}
            titulo={q.titulo}
            descripcion={q.descripcion}
            features={[
              `${q.total} preguntas del manual`,
              "Feedback inmediato por respuesta",
              'Botón "Explícamelo Yaris" siempre visible',
              "PDF del manual a la mano",
            ]}
            to="/cuestionario"
            search={{ fuente: q.code }}
            pdfUrl={q.fileUrl}
          />
        ))}
      </div>
    </div>
  );
}
