import { createFileRoute, Link } from "@tanstack/react-router";
import { BackLink } from "@/components/shared/BackLink";

export const Route = createFileRoute("/blog")({ component: BlogPage });

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";

const PROXIMOS = [
  { tag: "Guía de estudio", t: "Cómo organizar tus últimas 4 semanas antes del CIAAC" },
  { tag: "Historias", t: "Historias de pilotos: de la primera sesión al examen aprobado" },
  { tag: "Materias", t: "Meteorología sin miedo: los 10 conceptos que más se preguntan" },
  { tag: "Bienestar", t: "Estudiar sin quemarte: rachas, descanso y constancia real" },
];

/** Blog (enlazado desde la navegación y el pie de la página principal). */
function BlogPage() {
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
          Blog e historias FlightPath
        </h1>
        <p style={{ color: "#647DA0", fontSize: 14, marginBottom: 40 }}>
          Guías de estudio, historias de pilotos y novedades de la plataforma. Estamos preparando los
          primeros artículos — esto es lo que viene:
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          {PROXIMOS.map((p, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E3EAF5", borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6C0820", background: "#F2DCDB", borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>
                  {p.tag}
                </span>
                <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: INK, lineHeight: 1.35 }}>{p.t}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8DA1BE", whiteSpace: "nowrap" }}>Próximamente</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44, textAlign: "center", color: "#647DA0", fontSize: 13.5 }}>
          Mientras tanto, tu preparación no espera:
          <div style={{ marginTop: 14 }}>
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
        </div>
      </main>
    </div>
  );
}
