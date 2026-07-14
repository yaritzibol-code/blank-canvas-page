/** Panel Admin — Accesos y membresías (PRD 9.8): quién entra a FlightPath y hasta cuándo. */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  ACCESS_COLOR,
  ACCESS_LABEL,
  Badge,
  cardHeadStyle,
  cardStyle,
  Flash,
  fmtDate,
  fmtDateTime,
  inputStyle,
  useFlash,
} from "@/components/admin/AdminShell";
import {
  getAccessChanges,
  getUserById,
  getUsers,
  logAccessChange,
  updateUser,
  useStore,
  type User,
} from "@/lib/store";

export const Route = createFileRoute("/admin/accesos")({
  component: AdminAccesosPage,
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
  padding: "11px 12px",
  fontSize: ".8rem",
  color: "#22375C",
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(61,93,145,.05)",
  whiteSpace: "nowrap",
};

const actionBtn: CSSProperties = {
  padding: "5px 9px",
  background: "white",
  border: "2px solid #F2DCDB",
  borderRadius: 7,
  fontSize: ".7rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
  color: "#3D5D91",
  whiteSpace: "nowrap",
};

/** Tipo de acceso (PRD 9.8) derivado del plan y estado. */
function accessType(u: User): string {
  if (u.accessStatus === "prueba") return "Prueba";
  if (u.accessStatus === "extendido") return "Extendido";
  if (u.plan === "basica") return "Gratuito";
  return "De paga";
}

function AdminAccesosPage() {
  const navigate = useNavigate();
  const { flash, showFlash } = useFlash();
  const [fEstado, setFEstado] = useState("todos");

  const students = useStore(() => getUsers().filter((u) => u.role === "student"));
  const changes = useStore(() => getAccessChanges().slice(0, 12));

  const filtered = students.filter((u) => fEstado === "todos" || u.accessStatus === fEstado);

  const doExtend = (u: User) => {
    const base = u.accessEnd ? new Date(u.accessEnd) : new Date();
    updateUser(u.id, {
      accessEnd: new Date(base.getTime() + 30 * 86400000).toISOString(),
      accessStatus: "extendido",
    });
    logAccessChange(u.id, "Extender acceso", "30 días — desde Accesos y membresías");
    showFlash(`Acceso de ${u.nombre.split(" ")[0]} extendido 30 días`);
  };

  const doPauseToggle = (u: User) => {
    const paused = u.accessStatus === "pausado";
    updateUser(u.id, { accessStatus: paused ? "activo" : "pausado" });
    logAccessChange(u.id, paused ? "Reactivar acceso" : "Pausar acceso", paused ? "Acceso reactivado" : "Acceso pausado");
    showFlash(paused ? "Acceso reactivado" : "Acceso pausado");
  };

  const doActivate = (u: User) => {
    updateUser(u.id, { accessStatus: "activo" });
    logAccessChange(u.id, "Activar acceso", "Acceso activado por la administradora");
    showFlash("Acceso activado");
  };

  const doCancel = (u: User) => {
    updateUser(u.id, { accessStatus: "cancelado" });
    logAccessChange(u.id, "Cancelar acceso", "Acceso cancelado por la administradora");
    showFlash("Acceso cancelado", true);
  };

  return (
    <AdminShell title="Accesos y membresías" active="accesos">
      <Flash flash={flash} />

      {/* Filtro por estado */}
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 170 }}>
          <option value="todos">Estado: todos</option>
          {Object.entries(ACCESS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <span style={{ fontSize: ".76rem", color: "#647DA0" }}>{filtered.length} de {students.length} estudiantes</span>
      </div>

      {/* Tabla de accesos */}
      <div style={{ ...cardStyle, padding: 0, overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={thStyle}>Estudiante</th>
              <th style={thStyle}>WhatsApp</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Inicio</th>
              <th style={thStyle}>Vencimiento</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Notas</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ ...tdStyle, textAlign: "center", color: "#8DA1BE", padding: "26px 12px" }}>
                  No hay estudiantes con ese estado de acceso.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{u.nombre}</div>
                  <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{u.email}</div>
                </td>
                <td style={tdStyle}>{u.whatsapp || "—"}</td>
                <td style={tdStyle}>{u.planNombre}</td>
                <td style={tdStyle}>{accessType(u)}</td>
                <td style={tdStyle}>{fmtDate(u.accessStart)}</td>
                <td style={tdStyle}>{u.accessEnd ? fmtDate(u.accessEnd) : "Sin vencimiento"}</td>
                <td style={tdStyle}>
                  <Badge text={ACCESS_LABEL[u.accessStatus] ?? u.accessStatus} color={ACCESS_COLOR[u.accessStatus] ?? "#3D5D91"} />
                </td>
                <td style={{ ...tdStyle, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }} title={u.notasInternas}>
                  {u.notasInternas || "—"}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <button style={actionBtn} onClick={() => doExtend(u)} title="Extender 30 días">+30 días</button>
                    {u.accessStatus === "cancelado" || u.accessStatus === "vencido" ? (
                      <button style={{ ...actionBtn, color: "#1a7a4a", borderColor: "rgba(46,204,113,.4)" }} onClick={() => doActivate(u)}>Activar</button>
                    ) : (
                      <button style={actionBtn} onClick={() => doPauseToggle(u)}>{u.accessStatus === "pausado" ? "Reactivar" : "Pausar"}</button>
                    )}
                    {u.accessStatus !== "cancelado" && (
                      <button style={{ ...actionBtn, color: "#e74c3c", borderColor: "rgba(231,76,60,.3)" }} onClick={() => doCancel(u)}>Cancelar</button>
                    )}
                    <button
                      style={actionBtn}
                      onClick={() => navigate({ to: "/admin/perfil", search: { id: u.id } })}
                      title="Cambiar plan, editar fechas y notas desde el perfil"
                    >
                      Perfil →
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historial de cambios (global) */}
      <div style={cardStyle}>
        <div style={cardHeadStyle}><Icon n="list" size={15} /> Historial de cambios recientes</div>
        {changes.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>Sin cambios de acceso registrados todavía.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {changes.map((c, i) => (
              <div key={c.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < changes.length - 1 ? "1px solid rgba(61,93,145,.05)" : undefined, flexWrap: "wrap", alignItems: "baseline" }}>
                <span style={{ fontSize: ".72rem", color: "#8DA1BE", width: 150, flexShrink: 0 }}>{fmtDateTime(c.fecha)}</span>
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#22375C", width: 170, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {getUserById(c.userId)?.nombre ?? "Estudiante"}
                </span>
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#3D5D91" }}>{c.accion}</span>
                <span style={{ fontSize: ".76rem", color: "#647DA0", flex: 1, minWidth: 160 }}>{c.detalle}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
