/** Panel Admin — WhatsApp y recordatorios (PRD 9.10): vista operativa, sin conversaciones. */
import { createFileRoute } from "@tanstack/react-router";
import { type CSSProperties } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  Badge,
  cardStyle,
  Flash,
  timeAgo,
  useFlash,
} from "@/components/admin/AdminShell";
import {
  getReminders,
  getUsers,
  saveReminder,
  useStore,
  type Reminder,
  type User,
} from "@/lib/store";

export const Route = createFileRoute("/admin/whatsapp")({
  component: AdminWhatsappPage,
});

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

const WA_ESTADO_LABEL: Record<User["whatsappEstado"], string> = {
  registrado: "Registrado",
  confirmado: "Confirmado",
  no_confirmado: "No confirmado",
  sin_numero: "Sin número",
  con_error: "Con error",
};

const WA_ESTADO_COLOR: Record<User["whatsappEstado"], string> = {
  registrado: "#C7A052",
  confirmado: "#2ecc71",
  no_confirmado: "#f39c12",
  sin_numero: "#93A4BF",
  con_error: "#e74c3c",
};

const thStyle: CSSProperties = {
  padding: "10px 12px",
  fontSize: ".66rem",
  fontWeight: 700,
  color: "#93A4BF",
  textTransform: "uppercase",
  letterSpacing: ".6px",
  textAlign: "left",
  whiteSpace: "nowrap",
  borderBottom: "1px solid rgba(199,160,82,.14)",
};

const tdStyle: CSSProperties = {
  padding: "12px 12px",
  fontSize: ".8rem",
  color: "#FFFFFF",
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(61,93,145,.05)",
  whiteSpace: "nowrap",
};

interface Row {
  u: User;
  reminders: Reminder[];
  activos: number;
  pausados: number;
  hora: string | null;
  dias: boolean[];
  ultimoEnvio: string | null;
}

function estadoGeneral(row: Row): { label: string; color: string } {
  const { u, activos, reminders } = row;
  if (!u.whatsapp || u.whatsappEstado === "sin_numero") return { label: "Sin número", color: "#93A4BF" };
  if (u.whatsappEstado === "con_error") return { label: "Error de número", color: "#e74c3c" };
  if (u.whatsappEstado !== "confirmado") return { label: "Por confirmar", color: "#f39c12" };
  if (activos > 0) return { label: "OK", color: "#2ecc71" };
  if (reminders.length > 0) return { label: "Pausado", color: "#f39c12" };
  return { label: "Sin recordatorios", color: "#93A4BF" };
}

function AdminWhatsappPage() {
  const { flash, showFlash } = useFlash();

  const rows: Row[] = useStore(() =>
    getUsers()
      .filter((u) => u.role === "student" && !u.deactivatedAt)
      .map((u) => {
        const reminders = getReminders(u.id);
        const act = reminders.filter((r) => r.enabled);
        const freq: Record<string, number> = {};
        act.forEach((r) => { freq[r.hora] = (freq[r.hora] ?? 0) + 1; });
        const hora = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        const dias = [false, false, false, false, false, false, false];
        act.forEach((r) => r.dias.forEach((d, i) => { if (d) dias[i] = true; }));
        const ultimoEnvio = reminders
          .map((r) => r.ultimoEnvio)
          .filter((x): x is string => !!x)
          .sort()
          .pop() ?? null;
        return { u, reminders, activos: act.length, pausados: reminders.length - act.length, hora, dias, ultimoEnvio };
      }),
  );

  const pauseAll = (row: Row) => {
    row.reminders.filter((r) => r.enabled).forEach((r) => saveReminder({ ...r, enabled: false }));
    showFlash(`Recordatorios de ${row.u.nombre.split(" ")[0]} pausados`);
  };

  const resumeAll = (row: Row) => {
    row.reminders.filter((r) => !r.enabled).forEach((r) => saveReminder({ ...r, enabled: true }));
    showFlash(`Recordatorios de ${row.u.nombre.split(" ")[0]} reactivados`);
  };

  return (
    <AdminShell title="WhatsApp y recordatorios" active="whatsapp">
      <Flash flash={flash} />

      {/* Aviso de privacidad */}
      <div style={{ background: "rgba(61,93,145,.05)", border: "1px solid rgba(61,93,145,.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon n="shield" size={16} color="#C7A052" />
        <span style={{ fontSize: ".76rem", color: "#93A4BF", lineHeight: 1.5 }}>
          No se muestran conversaciones privadas, solo información operativa.
        </span>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
          <thead>
            <tr>
              <th style={thStyle}>Estudiante</th>
              <th style={thStyle}>WhatsApp</th>
              <th style={thStyle}>Número</th>
              <th style={thStyle}>Recordatorios</th>
              <th style={thStyle}>Horario</th>
              <th style={thStyle}>Días</th>
              <th style={thStyle}>Último envío</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} style={{ ...tdStyle, textAlign: "center", color: "#93A4BF", padding: "26px 12px" }}>
                  No hay estudiantes registrados.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const eg = estadoGeneral(row);
              return (
                <tr key={row.u.id}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700 }}>{row.u.nombre}</div>
                    <div style={{ fontSize: ".72rem", color: "#93A4BF" }}>{row.u.email}</div>
                  </td>
                  <td style={tdStyle}>{row.u.whatsapp || "—"}</td>
                  <td style={tdStyle}>
                    <Badge text={WA_ESTADO_LABEL[row.u.whatsappEstado]} color={WA_ESTADO_COLOR[row.u.whatsappEstado]} />
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700, color: row.activos > 0 ? "#2ecc71" : "#93A4BF" }}>{row.activos} activos</span>
                    <span style={{ color: "#93A4BF" }}> · {row.pausados} pausados</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{row.hora ?? "—"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 3 }}>
                      {DIAS.map((d, i) => (
                        <span key={i} style={{ width: 18, height: 18, borderRadius: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: ".62rem", fontWeight: 700, background: row.dias[i] ? "#C7A052" : "rgba(255,255,255,.10)", color: row.dias[i] ? "#0B1220" : "#93A4BF" }}>{d}</span>
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle}>{row.ultimoEnvio ? timeAgo(row.ultimoEnvio) : "—"}</td>
                  <td style={tdStyle}>
                    <Badge text={eg.label} color={eg.color} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => pauseAll(row)}
                        disabled={row.activos === 0}
                        style={{ padding: "6px 10px", background: "#0A1B33", color: row.activos === 0 ? "#93A4BF" : "#f39c12", border: "2px solid rgba(199,160,82,.28)", borderRadius: 8, fontSize: ".72rem", fontWeight: 700, cursor: row.activos === 0 ? "default" : "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Icon n="pause" size={12} /> Pausar todos
                      </button>
                      <button
                        onClick={() => resumeAll(row)}
                        disabled={row.pausados === 0}
                        style={{ padding: "6px 10px", background: "#0A1B33", color: row.pausados === 0 ? "#93A4BF" : "#2ecc71", border: "2px solid rgba(199,160,82,.28)", borderRadius: 8, fontSize: ".72rem", fontWeight: 700, cursor: row.pausados === 0 ? "default" : "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Icon n="play" size={12} /> Reactivar todos
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: ".74rem", color: "#93A4BF", marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <Icon n="info" size={14} /> El envío real requiere conectar el proveedor de WhatsApp Business en Configuración interna.
      </p>
    </AdminShell>
  );
}
