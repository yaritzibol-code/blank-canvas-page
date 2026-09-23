/** Panel Admin — Analítica general (PRD 9.11): uso, avance y desempeño global. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  AdminShell,
  cardHeadStyle,
  cardStyle,
  scoreColor,
} from "@/components/admin/AdminShell";
import { getReports, globalAnalytics, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/analitica")({
  component: AdminAnaliticaPage,
});

function AdminAnaliticaPage() {
  const g = useStore(globalAnalytics);
  const reportadas = useStore(() =>
    getReports().filter((r) => /pregunta|respuesta|explicaci/i.test(r.tipo)).slice(0, 6),
  );

  const tiles: { icon: FPIconName; num: string; lab: string; color: string }[] = [
    { icon: "users", num: String(g.totalStudents), lab: "Estudiantes totales", color: "#B8C5DA" },
    { icon: "check", num: String(g.activeStudents), lab: "Activos (7 días)", color: "#2ecc71" },
    { icon: "clock", num: String(g.inactiveStudents), lab: "Inactivos", color: "#f39c12" },
    { icon: "spark", num: String(g.newLast7), lab: "Nuevos registros (7 días)", color: "#6C0820" },
    { icon: "chart", num: `${g.avgCourseProgress}%`, lab: "Promedio de avance", color: "#B8C5DA" },
    { icon: "target", num: g.avgReadiness !== null ? `${g.avgReadiness}%` : "—", lab: "Preparación estimada", color: "#6C0820" },
    { icon: "checkCircle", num: g.avgScore !== null ? `${g.avgScore}%` : "—", lab: "Promedio de aciertos", color: "#2ecc71" },
    { icon: "help", num: String(g.answered), lab: "Preguntas respondidas", color: "#B8C5DA" },
    { icon: "cards", num: String(g.quizCount), lab: "Cuestionarios realizados", color: "#B8C5DA" },
    { icon: "sim", num: String(g.simCount), lab: "Simuladores completados", color: "#B8C5DA" },
    { icon: "map", num: String(g.temasDone), lab: "Learning Paths completados", color: "#B8C5DA" },
    { icon: "play", num: String(g.clasesVistas), lab: "Clases vistas", color: "#B8C5DA" },
    { icon: "brain", num: String(g.flashRepasadas), lab: "Flashcards repasadas", color: "#B8C5DA" },
    { icon: "alert", num: String(g.preguntasReportadas), lab: "Preguntas reportadas", color: "#e74c3c" },
  ];

  return (
    <AdminShell title="Analítica general" active="analitica">
      {/* Métricas globales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {tiles.map((s) => (
          <div key={s.lab} style={{ ...cardStyle, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n={s.icon} size={17} color={s.color} />
            </div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>{s.num}</div>
              <div style={{ fontSize: ".7rem", color: "#93A4BF", marginTop: 2 }}>{s.lab}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18, marginBottom: 20 }}>
        {/* Desempeño por materia (global) */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}><Icon n="book" size={15} /> Desempeño por materia</div>
          {g.materias.length === 0 ? (
            <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>Aún no hay datos de cuestionarios o simuladores.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {g.materias.map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: ".76rem", color: "#FFFFFF", width: 170, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.08)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 10, background: scoreColor(m.avg), width: `${m.avg}%` }} />
                  </div>
                  <span style={{ fontSize: ".72rem", fontWeight: 700, width: 34, textAlign: "right", flexShrink: 0, color: scoreColor(m.avg) }}>{m.avg}%</span>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: ".7rem", color: "#8DA1BE", marginTop: 10 }}>Los primeros lugares de la lista son los temas más fallados a nivel plataforma.</p>
        </div>

        {/* Uso de herramientas de estudio */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}><Icon n="gauge" size={15} /> Uso de herramientas de estudio</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(() => {
              const max = Math.max(1, ...g.usoHerramientas.map((h) => h.count));
              return g.usoHerramientas.map((h) => (
                <div key={h.kind} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: ".76rem", color: "#FFFFFF", width: 150, flexShrink: 0 }}>{h.label}</span>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.08)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 10, background: "#3D5D91", width: `${Math.round((h.count / max) * 100)}%` }} />
                  </div>
                  <span style={{ fontSize: ".72rem", fontWeight: 700, width: 40, textAlign: "right", flexShrink: 0, color: "#FFFFFF" }}>{h.count}</span>
                </div>
              ));
            })()}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(61,93,145,.08)" }}>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", fontWeight: 900, color: "#FFFFFF" }}>{g.actividad7d}</div>
              <div style={{ fontSize: ".68rem", color: "#93A4BF" }}>eventos · últimos 7 días</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", fontWeight: 900, color: "#FFFFFF" }}>{g.actividad30d}</div>
              <div style={{ fontSize: ".68rem", color: "#93A4BF" }}>eventos · últimos 30 días</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preguntas reportadas */}
      <div style={cardStyle}>
        <div style={cardHeadStyle}><Icon n="alert" size={15} /> Preguntas y contenido reportado</div>
        {reportadas.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>No hay reportes de preguntas o contenido. Todo en orden.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {reportadas.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < reportadas.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.tipo} · {r.seccion}</div>
                  <div style={{ fontSize: ".72rem", color: "#93A4BF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.mensaje}</div>
                </div>
                <Link to="/admin/soporte" style={{ fontSize: ".74rem", fontWeight: 700, color: "#B8C5DA", textDecoration: "none", flexShrink: 0 }}>
                  Ver en soporte →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
