/**
 * Panel Admin — Bitácora de conversaciones con Yaris.
 *
 * Lee `yaris_messages`: qué escribió la estudiante, qué contestó Yaris, con
 * qué tono, en qué materia y con qué reactivo en contexto. Sirve para auditar
 * la calidad de las respuestas de la tutora.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminShell, cardStyle, inputStyle } from "@/components/admin/AdminShell";
import { adminYarisLogs, type YarisLogRow } from "@/lib/audit.functions";
import { sanitizeHtml, yarisToHtml } from "@/lib/yaris-format";
import { MATERIAS_DEF } from "@/lib/store";

export const Route = createFileRoute("/admin/yaris-chats")({
  component: YarisChatsPage,
});

const MUTED = "#647DA0";
const INK = "#22375C";
const DISPLAY = "'Bricolage Grotesque', sans-serif";

const TONOS: Record<string, string> = { formal: "Formal", normal: "Normal", amiga: "Amiga Yaris" };

const materiaName = (slug: string | null) =>
  !slug ? "—" : (MATERIAS_DEF.find((m) => m.slug === slug)?.name ?? slug);

function fecha(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function YarisChatsPage() {
  const [rows, setRows] = useState<YarisLogRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [query, setQuery] = useState("");
  const [buscar, setBuscar] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const res = await adminYarisLogs({ data: { days, query: buscar, limit: 300 } });
    if ("error" in res) setError(res.error);
    else setRows(res.rows);
    setCargando(false);
  }, [days, buscar]);

  useEffect(() => { void cargar(); }, [cargar]);

  return (
    <AdminShell title="Conversaciones con Yaris" active="yaris_chats">
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setBuscar(query.trim()); }}
          placeholder="Buscar texto en preguntas o respuestas…"
          style={{ ...inputStyle, flex: "1 1 240px", minWidth: 200 }}
        />
        <button
          onClick={() => setBuscar(query.trim())}
          style={{ padding: "9px 15px", background: "#3D5D91", color: "white", border: "none", borderRadius: 8, fontSize: ".78rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
        >
          Buscar
        </button>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ ...inputStyle, width: "auto", minWidth: 130 }}>
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      {cargando && <p style={{ fontSize: ".82rem", color: MUTED }}>Cargando conversaciones…</p>}
      {error && <p style={{ fontSize: ".82rem", color: "#c0392b" }}>{error}</p>}

      {!cargando && !error && (
        <>
          <div style={{ fontSize: ".76rem", color: MUTED, marginBottom: 10 }}>{rows.length} intercambios</div>
          <div style={{ display: "grid", gap: 10 }}>
            {rows.length === 0 && (
              <div style={{ ...cardStyle, textAlign: "center", color: MUTED, fontSize: ".82rem" }}>
                Aún no hay conversaciones registradas en este periodo.
              </div>
            )}
            {rows.map((r) => (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ flex: "1 1 200px", minWidth: 170 }}>
                    <div style={{ fontWeight: 800, color: INK, fontSize: ".84rem" }}>{r.nombre || r.email || "Anónimo"}</div>
                    <div style={{ fontSize: ".72rem", color: MUTED }}>{r.email}</div>
                  </div>
                  <span style={{ fontSize: ".72rem", color: MUTED }}>{materiaName(r.materia)}</span>
                  <span style={{ fontSize: ".72rem", fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: "rgba(242,174,188,.22)", color: "#6C0820" }}>
                    {TONOS[r.tono ?? "normal"] ?? r.tono}
                  </span>
                  {r.pre_answer && (
                    <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#3D5D91" }}>modo socrático</span>
                  )}
                  {!r.success && (
                    <span style={{ fontSize: ".7rem", fontWeight: 800, color: "#c0392b" }}>error: {r.error_message}</span>
                  )}
                  <span style={{ fontSize: ".72rem", color: MUTED }}>{fecha(r.created_at)}</span>
                  <span style={{ fontSize: ".7rem", color: "#A9B8CE" }}>
                    {r.tokens_in + r.tokens_out} tokens · {Math.round(r.latency_ms / 100) / 10}s
                  </span>
                </div>

                <div style={{ background: "#6C0820", color: "white", borderRadius: "12px 12px 12px 4px", padding: "9px 13px", fontSize: ".83rem", lineHeight: 1.5, marginBottom: 8 }}>
                  {r.pregunta || "—"}
                </div>
                <div
                  style={{
                    background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: "12px 12px 4px 12px",
                    padding: "9px 13px", fontSize: ".83rem", color: INK, lineHeight: 1.5,
                    maxHeight: abierto === r.id ? "none" : 150, overflow: "hidden",
                  }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(yarisToHtml(r.respuesta || "—")) }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setAbierto(abierto === r.id ? null : r.id)}
                    style={{ padding: "6px 12px", background: "white", color: "#3D5D91", border: "2px solid #F2DCDB", borderRadius: 8, fontSize: ".73rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
                  >
                    {abierto === r.id ? "Ver menos" : "Ver completo"}
                  </button>
                  {r.question_text && (
                    <details style={{ fontSize: ".75rem", color: MUTED }}>
                      <summary style={{ cursor: "pointer", fontWeight: 700, color: "#3D5D91" }}>Reactivo en contexto</summary>
                      <div style={{ marginTop: 6, maxWidth: 720, fontFamily: DISPLAY }}>{r.question_text}</div>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}
