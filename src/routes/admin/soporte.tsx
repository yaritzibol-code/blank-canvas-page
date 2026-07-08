/** Panel Admin — Soporte y feedback (PRD 9.9). */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { REPORT_TYPES } from "@/components/shared/ReportProblemModal";
import {
  AdminShell,
  Badge,
  cardStyle,
  Flash,
  fmtDateTime,
  inputStyle,
  labelStyle,
  useFlash,
} from "@/components/admin/AdminShell";
import {
  getReports,
  updateReport,
  useStore,
  type Report,
  type ReportStatus,
} from "@/lib/store";

export const Route = createFileRoute("/admin/soporte")({
  component: AdminSoportePage,
});

const ESTADO_LABEL: Record<ReportStatus, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

const ESTADO_COLOR: Record<ReportStatus, string> = {
  pendiente: "#e74c3c",
  en_proceso: "#f39c12",
  resuelto: "#2ecc71",
  cerrado: "#8DA1BE",
};

function AdminSoportePage() {
  const { flash, showFlash } = useFlash();
  const [fEstado, setFEstado] = useState("todos");
  const [fTipo, setFTipo] = useState("todos");
  const [query, setQuery] = useState("");

  const reports = useStore(getReports);

  const q = query.trim().toLowerCase();
  const filtered = reports.filter((r) => {
    if (fEstado !== "todos" && r.estado !== fEstado) return false;
    if (fTipo !== "todos" && r.tipo !== fTipo) return false;
    if (q && !(
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.mensaje.toLowerCase().includes(q) ||
      r.seccion.toLowerCase().includes(q) ||
      r.recurso.toLowerCase().includes(q)
    )) return false;
    return true;
  });

  const pendientes = reports.filter((r) => r.estado === "pendiente").length;

  return (
    <AdminShell title="Soporte y feedback" active="soporte">
      <Flash flash={flash} />

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#8DA1BE" }}><Icon n="search" size={15} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por estudiante, mensaje o recurso..." style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 140 }}>
          <option value="todos">Estado: todos</option>
          {(Object.keys(ESTADO_LABEL) as ReportStatus[]).map((k) => (
            <option key={k} value={k}>{ESTADO_LABEL[k]}</option>
          ))}
        </select>
        <select value={fTipo} onChange={(e) => setFTipo(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 170 }}>
          <option value="todos">Tipo: todos</option>
          {REPORT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: ".76rem", color: "#647DA0", marginBottom: 12 }}>
        {filtered.length} de {reports.length} reportes · {pendientes} pendientes
      </div>

      {filtered.length === 0 && (
        <div style={cardStyle}>
          <p style={{ fontSize: ".82rem", color: "#8DA1BE", textAlign: "center", padding: "12px 0" }}>No hay reportes que coincidan con los filtros.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((r) => (
          <ReportCard key={r.id} r={r} onFlash={showFlash} />
        ))}
      </div>
    </AdminShell>
  );
}

function ReportCard({ r, onFlash }: { r: Report; onFlash: (msg: string, error?: boolean) => void }) {
  const navigate = useNavigate();
  const [notas, setNotas] = useState(r.notasInternas);
  const isQuestion = r.recurso.startsWith("q_");

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#22375C" }}>{r.userName}</div>
          <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{r.userEmail} · {fmtDateTime(r.fecha)}</div>
        </div>
        <Badge text={r.tipo} color="#6C0820" />
        <select
          value={r.estado}
          onChange={(e) => {
            updateReport(r.id, { estado: e.target.value as ReportStatus });
            onFlash(`Reporte marcado como "${ESTADO_LABEL[e.target.value as ReportStatus]}"`);
          }}
          style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: ".76rem", fontWeight: 700, color: ESTADO_COLOR[r.estado], borderColor: `${ESTADO_COLOR[r.estado]}55` }}
        >
          {(Object.keys(ESTADO_LABEL) as ReportStatus[]).map((k) => (
            <option key={k} value={k}>{ESTADO_LABEL[k]}</option>
          ))}
        </select>
      </div>

      {/* Meta */}
      <div style={{ fontSize: ".74rem", color: "#647DA0", marginBottom: 8, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <span><strong style={{ color: "#22375C" }}>Sección:</strong> {r.seccion || "—"}</span>
        <span><strong style={{ color: "#22375C" }}>Recurso:</strong> {r.recurso || "—"}</span>
      </div>

      {/* Mensaje */}
      <div style={{ background: "#f5f7fc", borderLeft: "3px solid #3D5D91", borderRadius: 8, padding: "10px 14px", fontSize: ".84rem", color: "#22375C", lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-wrap" }}>
        {r.mensaje}
      </div>

      {isQuestion && (
        <button
          onClick={() => navigate({ to: "/admin/banco", search: { q: r.recurso } })}
          style={{ padding: "7px 14px", background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".76rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}
        >
          <Icon n="help" size={14} /> Abrir en Banco de preguntas
        </button>
      )}

      {/* Notas internas */}
      <div>
        <label style={labelStyle}>Notas internas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Notas de seguimiento (solo visibles para ti)..."
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button
            onClick={() => {
              updateReport(r.id, { notasInternas: notas });
              onFlash("Notas guardadas");
            }}
            style={{ padding: "6px 14px", background: "#3D5D91", color: "white", border: "none", borderRadius: 7, fontSize: ".74rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <Icon n="check" size={13} /> Guardar notas
          </button>
        </div>
      </div>
    </div>
  );
}
