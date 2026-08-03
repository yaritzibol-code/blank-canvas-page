/** Panel Admin — Lista de estudiantes (PRD 9.3). */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  Badge,
  ACCESS_COLOR,
  ACCESS_LABEL,
  cardStyle,
  fmtDate,
  generalStateColor,
  inputStyle,
  timeAgo,
} from "@/components/admin/AdminShell";
import {
  courseProgress,
  estimatedReadiness,
  getStreak,
  getUsers,
  isStudentActive,
  materiaPerformance,
  MATERIAS_DEF,
  studentGeneralState,
  useStore,
} from "@/lib/store";

export const Route = createFileRoute("/admin/estudiantes")({
  component: AdminEstudiantesPage,
});

const thStyle: CSSProperties = {
  padding: "10px 12px",
  fontSize: ".66rem",
  fontWeight: 700,
  color: "#8DA1BE",
  textTransform: "uppercase",
  letterSpacing: ".6px",
  textAlign: "left",
  whiteSpace: "nowrap",
  borderBottom: "1px solid rgba(61,93,145,.1)",
};

const tdStyle: CSSProperties = {
  padding: "12px 12px",
  fontSize: ".8rem",
  color: "#22375C",
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(61,93,145,.05)",
  whiteSpace: "nowrap",
};

function AdminEstudiantesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [fEstado, setFEstado] = useState("todos");
  const [fPlan, setFPlan] = useState("todos");
  const [fMateriaDebil, setFMateriaDebil] = useState("todas");
  const [orden, setOrden] = useState("acceso");
  const [soloInactivos, setSoloInactivos] = useState(false);
  const [proxCiaac, setProxCiaac] = useState(false);

  const rows = useStore(() =>
    getUsers()
      .filter((u) => u.role === "student")
      .map((u) => {
        const perf = materiaPerformance(u.id).filter((m) => m.avg !== null);
        const weak = perf.length > 0 ? perf.reduce((a, b) => ((a.avg ?? 100) <= (b.avg ?? 100) ? a : b)) : null;
        return {
          u,
          streak: getStreak(u.id),
          progress: courseProgress(u.id),
          readiness: estimatedReadiness(u.id),
          state: studentGeneralState(u),
          active: isStudentActive(u),
          weakSlug: weak?.slug ?? null,
        };
      }),
  );

  const q = query.trim().toLowerCase();
  const filtered = rows
    .filter((r) => {
      if (q && !(
        r.u.nombre.toLowerCase().includes(q) ||
        r.u.email.toLowerCase().includes(q) ||
        r.u.escuela.toLowerCase().includes(q)
      )) return false;
      if (fEstado !== "todos" && r.u.accessStatus !== fEstado) return false;
      if (fPlan !== "todos" && r.u.plan !== fPlan) return false;
      if (fMateriaDebil !== "todas" && r.weakSlug !== fMateriaDebil) return false;
      if (soloInactivos && r.active) return false;
      if (proxCiaac) {
        if (!r.u.fechaCiaac) return false;
        const days = (new Date(`${r.u.fechaCiaac}T12:00:00`).getTime() - Date.now()) / 86400000;
        if (days < 0 || days > 30) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (orden === "nombre") return a.u.nombre.localeCompare(b.u.nombre);
      if (orden === "avance") return a.progress - b.progress;
      if (orden === "preparacion") return (a.readiness ?? 101) - (b.readiness ?? 101);
      return b.u.lastAccess.localeCompare(a.u.lastAccess); // último acceso
    });

  return (
    <AdminShell title="Estudiantes" active="estudiantes">
      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#8DA1BE" }}>
            <Icon n="search" size={15} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o escuela..."
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
        <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
          <option value="todos">Membresía: todas</option>
          {Object.entries(ACCESS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={fPlan} onChange={(e) => setFPlan(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 130 }}>
          <option value="todos">Plan: todos</option>
          <option value="paga">Plan de paga</option>
          <option value="basica">Suscripción básica</option>
        </select>
        <select value={fMateriaDebil} onChange={(e) => setFMateriaDebil(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
          <option value="todas">Materia débil: todas</option>
          {MATERIAS_DEF.map((m) => (
            <option key={m.slug} value={m.slug}>{m.name}</option>
          ))}
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
          <option value="acceso">Orden: último acceso</option>
          <option value="nombre">Orden: nombre A–Z</option>
          <option value="avance">Orden: menor avance</option>
          <option value="preparacion">Orden: menor preparación</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "#22375C", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={soloInactivos} onChange={(e) => setSoloInactivos(e.target.checked)} style={{ accentColor: "#3D5D91", width: 15, height: 15 }} />
          Solo inactivos
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "#22375C", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={proxCiaac} onChange={(e) => setProxCiaac(e.target.checked)} style={{ accentColor: "#3D5D91", width: 15, height: 15 }} />
          Próximos al CIAAC (30 días)
        </label>
      </div>

      <div style={{ fontSize: ".76rem", color: "#647DA0", marginBottom: 10 }}>
        {filtered.length} de {rows.length} estudiantes
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1180 }}>
          <thead>
            <tr>
              <th style={thStyle}>Estudiante</th>
              <th style={thStyle}>WhatsApp</th>
              <th style={thStyle}>Escuela</th>
              <th style={thStyle}>Fecha CIAAC</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Membresía</th>
              <th style={thStyle}>Último acceso</th>
              <th style={thStyle}>Racha</th>
              <th style={thStyle}>Avance</th>
              <th style={thStyle}>Preparación</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} style={{ ...tdStyle, textAlign: "center", color: "#8DA1BE", padding: "26px 12px" }}>
                  No hay estudiantes que coincidan con los filtros.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.u.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{r.u.nombre}</div>
                  <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{r.u.email}</div>
                </td>
                <td style={tdStyle}>{r.u.whatsapp || "—"}</td>
                <td style={{ ...tdStyle, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{r.u.escuela || "—"}</td>
                <td style={tdStyle}>{r.u.fechaCiaac ? fmtDate(r.u.fechaCiaac) : "—"}</td>
                <td style={tdStyle}>{r.u.planNombre}</td>
                <td style={tdStyle}>
                  <Badge text={ACCESS_LABEL[r.u.accessStatus] ?? r.u.accessStatus} color={ACCESS_COLOR[r.u.accessStatus] ?? "#3D5D91"} />
                </td>
                <td style={tdStyle}>{timeAgo(r.u.lastAccess)}</td>
                <td style={tdStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                    <Icon n="flame" size={14} color={r.streak > 0 ? "#f39c12" : "#8DA1BE"} /> {r.streak}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 56, height: 6, background: "#F2DCDB", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 10, background: "#3D5D91", width: `${r.progress}%` }} />
                    </div>
                    <span style={{ fontSize: ".74rem", fontWeight: 700 }}>{r.progress}%</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{r.readiness !== null ? `${r.readiness}%` : "—"}</td>
                <td style={tdStyle}>
                  <Badge text={r.state} color={generalStateColor(r.state)} />
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => navigate({ to: "/admin/perfil", search: { id: r.u.id } })}
                    style={{ padding: "6px 12px", background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".74rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", whiteSpace: "nowrap" }}
                  >
                    Abrir perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
