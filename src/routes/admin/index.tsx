/** Panel Admin — Resumen general (PRD 9.2). */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import {
  AdminShell,
  Badge,
  cardHeadStyle,
  cardStyle,
  generalStateColor,
  scoreColor,
  timeAgo,
  activityVisual,
} from "@/components/admin/AdminShell";
import {
  adminSummary,
  getReports,
  getUserById,
  getUsers,
  recentActivity,
  studentGeneralState,
  useStore,
} from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  component: AdminResumenPage,
});

const REPORT_STATE_COLOR: Record<string, string> = {
  pendiente: "#e74c3c",
  en_proceso: "#f39c12",
};

function AdminResumenPage() {
  const summary = useStore(adminSummary);
  const pending = useStore(() =>
    getReports().filter((r) => r.estado === "pendiente" || r.estado === "en_proceso"),
  );
  const activity = useStore(() => recentActivity(undefined, 8));
  const alerts = useStore(() =>
    getUsers()
      .filter((u) => u.role === "student" && !u.deactivatedAt)
      .map((u) => ({ u, state: studentGeneralState(u) }))
      .filter((x) => x.state === "En riesgo de abandono" || x.state === "Cerca del CIAAC"),
  );

  const stats: { icon: FPIconName; num: string; lab: string; color: string }[] = [
    { icon: "users", num: String(summary.totalStudents), lab: "Estudiantes totales", color: "#3D5D91" },
    { icon: "check", num: String(summary.activeStudents), lab: "Activos (7 días)", color: "#2ecc71" },
    { icon: "clock", num: String(summary.inactiveStudents), lab: "Inactivos", color: "#f39c12" },
    { icon: "spark", num: String(summary.newLast7), lab: "Nuevos (7 días)", color: "#6C0820" },
    { icon: "chart", num: `${summary.avgCourseProgress}%`, lab: "Avance promedio", color: "#3D5D91" },
    { icon: "target", num: summary.avgReadiness !== null ? `${summary.avgReadiness}%` : "—", lab: "Preparación promedio", color: "#6C0820" },
    { icon: "sim", num: String(summary.simCount), lab: "Simuladores", color: "#3D5D91" },
    { icon: "help", num: String(summary.quizCount), lab: "Cuestionarios", color: "#3D5D91" },
  ];

  return (
    <AdminShell title="Resumen general" active="resumen">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.lab} style={{ ...cardStyle, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n={s.icon} size={17} color={s.color} />
            </div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#22375C", lineHeight: 1.1 }}>{s.num}</div>
              <div style={{ fontSize: ".7rem", color: "#647DA0", marginTop: 2 }}>{s.lab}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div style={{ background: "rgba(243,156,18,.06)", border: "2px solid rgba(243,156,18,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon n="alert" size={18} color="#f39c12" />
            <h4 style={{ fontSize: ".88rem", fontWeight: 700, color: "#8a6000" }}>Estudiantes que requieren atención</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alerts.slice(0, 6).map(({ u, state }) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: ".82rem", fontWeight: 600, color: "#22375C" }}>{u.nombre}</span>
                <Badge text={state} color={generalStateColor(state)} />
                <Link to="/admin/perfil" search={{ id: u.id }} style={{ marginLeft: "auto", fontSize: ".76rem", fontWeight: 700, color: "#3D5D91", textDecoration: "none" }}>
                  Abrir perfil →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-col: materias débiles + soporte */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18, marginBottom: 20 }}>
        {/* Materias con menor desempeño */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}><Icon n="book" size={15} /> Materias con menor desempeño</div>
          {summary.weakestMaterias.length === 0 ? (
            <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>Aún no hay datos suficientes de cuestionarios o simuladores.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {summary.weakestMaterias.map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: ".78rem", color: "#22375C", width: 170, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                  <div style={{ flex: 1, height: 6, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 10, background: scoreColor(m.avg), width: `${m.avg}%` }} />
                  </div>
                  <span style={{ fontSize: ".74rem", fontWeight: 700, width: 34, textAlign: "right", flexShrink: 0, color: scoreColor(m.avg) }}>{m.avg}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Soporte pendiente */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}><Icon n="headset" size={15} /> Soporte pendiente</div>
          {pending.length === 0 ? (
            <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>No hay reportes pendientes. Todo al día.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {pending.slice(0, 5).map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < Math.min(pending.length, 5) - 1 ? "1px solid rgba(61,93,145,.05)" : undefined }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#22375C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.userName}</div>
                    <div style={{ fontSize: ".7rem", color: "#647DA0" }}>{r.tipo} · {timeAgo(r.fecha)}</div>
                  </div>
                  <Badge text={r.estado === "pendiente" ? "Pendiente" : "En proceso"} color={REPORT_STATE_COLOR[r.estado] ?? "#3D5D91"} />
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <Link to="/admin/soporte" style={{ fontSize: ".78rem", fontWeight: 700, color: "#3D5D91", textDecoration: "none" }}>
              Ver soporte y feedback →
            </Link>
          </div>
        </div>
      </div>

      {/* Actividad reciente global */}
      <div style={cardStyle}>
        <div style={cardHeadStyle}><Icon n="clock" size={15} /> Actividad reciente</div>
        {activity.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>Sin actividad registrada todavía.</p>
        ) : (
          activity.map((a, i) => {
            const vis = activityVisual(a.kind);
            const student = getUserById(a.userId);
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < activity.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: vis.bg }}>
                  <Icon n={vis.icon} size={16} color="#22375C" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".82rem", fontWeight: 600, color: "#22375C", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</div>
                  <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{student?.nombre ?? "Estudiante"}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: ".95rem", fontWeight: 900, color: scoreColor(a.score) }}>
                    {a.score !== null ? `${a.score}%` : "—"}
                  </div>
                  <div style={{ fontSize: ".68rem", color: "#8DA1BE" }}>{timeAgo(a.date)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
