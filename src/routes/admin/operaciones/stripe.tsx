/** Bitácora de eventos de Stripe. */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, cardStyle, cardHeadStyle } from "@/components/admin/AdminShell";
import { adminListStripeEvents, adminReprocessStripeEvent, type StripeEventRow } from "@/lib/admin.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

export const Route = createFileRoute("/admin/operaciones/stripe")({ component: StripeEventsPage });

const STATUS_COLOR: Record<string, string> = {
  processed: "#2ecc71",
  failed: "#e74c3c",
  ignored: "#f39c12",
  received: "#3D5D91",
};

function StripeEventsPage() {
  const [rows, setRows] = useState<StripeEventRow[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const env = isPaymentsConfigured() ? getStripeEnvironment() : "sandbox";

  async function load() {
    setErr(null);
    const res = await adminListStripeEvents({ data: { environment: env, status, limit: 200 } });
    if ("error" in res) setErr(res.error);
    else setRows(res);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, env]);

  async function reprocess(eventId: string) {
    setBusy(eventId);
    const res = await adminReprocessStripeEvent({ data: { stripeEventId: eventId } });
    if ("error" in res) setErr(res.error);
    await load();
    setBusy(null);
  }

  return (
    <AdminShell title="Eventos de Stripe" active="operaciones_stripe" backTo={{ label: "Panel", to: "/admin/operaciones" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: ".85rem", color: "#647DA0" }}>Estado:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E3EAF5", fontSize: ".85rem" }}
        >
          <option value="all">Todos</option>
          <option value="processed">Procesados</option>
          <option value="failed">Fallidos</option>
          <option value="ignored">Ignorados</option>
          <option value="received">Pendientes</option>
        </select>
        <span style={{ fontSize: ".78rem", color: "#647DA0" }}>{rows.length} eventos · env {env}</span>
        <button
          onClick={load}
          style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 8, border: "1px solid #E3EAF5", background: "#fff", cursor: "pointer", fontSize: ".85rem", fontWeight: 700 }}
        >
          Actualizar
        </button>
      </div>

      {err && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", padding: 12, borderRadius: 12, marginBottom: 16 }}>
          {err}
        </div>
      )}

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={cardHeadStyle}>Bitácora</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
            <thead>
              <tr style={{ background: "#F7F9FC", color: "#647DA0", textAlign: "left" }}>
                <th style={th}>Fecha</th>
                <th style={th}>Tipo</th>
                <th style={th}>Env</th>
                <th style={th}>Estado</th>
                <th style={th}>Usuario / Sub</th>
                <th style={th}>Error</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <>
                  <tr key={r.id} style={{ borderTop: "1px solid #F2DCDB" }}>
                    <td style={td}>{new Date(r.received_at).toLocaleString("es-MX")}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: ".78rem" }}>{r.type}</td>
                    <td style={td}>{r.environment}</td>
                    <td style={td}>
                      <span style={{ background: STATUS_COLOR[r.status] ?? "#647DA0", color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700 }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: ".72rem", color: "#647DA0" }}>
                      {r.user_id?.slice(0, 8) ?? "—"}
                      <br />
                      {r.stripe_subscription_id ?? ""}
                    </td>
                    <td style={{ ...td, color: "#e74c3c", maxWidth: 240, wordBreak: "break-word" }}>{r.error_message ?? ""}</td>
                    <td style={td}>
                      <button
                        onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                        style={linkBtn}
                      >
                        {expanded === r.id ? "Ocultar" : "Ver JSON"}
                      </button>
                      {(r.status === "failed" || r.status === "ignored") && (
                        <>
                          {" · "}
                          <button
                            onClick={() => reprocess(r.stripe_event_id)}
                            disabled={busy === r.stripe_event_id}
                            style={linkBtn}
                          >
                            {busy === r.stripe_event_id ? "…" : "Reprocesar"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr>
                      <td colSpan={7} style={{ background: "#F7F9FC", padding: 14 }}>
                        <pre style={{ margin: 0, fontSize: ".72rem", color: "#22375C", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {JSON.stringify(r.payload, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#647DA0" }}>
                    Sin eventos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

const th: React.CSSProperties = { padding: "10px 12px", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700 };
const td: React.CSSProperties = { padding: "10px 12px", color: "#22375C", verticalAlign: "top" };
const linkBtn: React.CSSProperties = { background: "none", border: "none", color: "#3D5D91", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: ".82rem" };
