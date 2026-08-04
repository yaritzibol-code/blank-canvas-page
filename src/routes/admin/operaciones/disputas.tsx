/**
 * Panel Admin — Disputas y evidencias (Evidence Engine).
 *
 * Lista las disputas de Stripe recibidas por webhook (charge.dispute.*) y
 * genera el expediente de defensa de cualquier estudiante: score de
 * ganabilidad con razones, resumen ejecutivo, línea de tiempo cronológica
 * (evidencias + facturación + Stripe + soporte), uso real del producto,
 * términos aceptados y cobros con señal de riesgo. Exportable como JSON o
 * imprimible como PDF (Ctrl/Cmd+P) listo para subir a Stripe.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  AdminShell,
  cardHeadStyle,
  cardStyle,
  Flash,
  inputStyle,
  labelStyle,
  primaryBtnStyle,
  useFlash,
} from "@/components/admin/AdminShell";
import { cloudEnabled } from "@/lib/store";
import {
  adminEvidenceDossier,
  adminListDisputes,
  type DisputeRow,
  type EvidenceDossier,
} from "@/lib/evidence.functions";
import type { StripeEnv } from "@/lib/stripe.server";

export const Route = createFileRoute("/admin/operaciones/disputas")({
  component: AdminDisputasPage,
});

const MONO = "'JetBrains Mono', monospace";
const INK = "#22375C";

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";

const REASON_ES: Record<string, string> = {
  fraudulent: "Fraude",
  subscription_canceled: "Suscripción cancelada",
  product_not_received: "Producto no recibido",
  product_unacceptable: "Producto inaceptable",
  unrecognized: "Cargo no reconocido",
  duplicate: "Cargo duplicado",
  credit_not_processed: "Reembolso no procesado",
  general: "General",
};

function AdminDisputasPage() {
  const { flash, showFlash } = useFlash();
  const [env, setEnv] = useState<StripeEnv>("live");
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const [who, setWho] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<EvidenceDossier | null>(null);

  useEffect(() => {
    if (!cloudEnabled()) {
      setDisputesError("Modo local: las disputas y evidencias viven en la nube (Lovable Cloud).");
      return;
    }
    (async () => {
      try {
        const res = await adminListDisputes();
        if ("error" in res) setDisputesError(res.error);
        else setDisputes(res.disputes);
      } catch (e) {
        setDisputesError(e instanceof Error ? e.message : "No se pudieron cargar las disputas.");
      }
    })();
  }, []);

  async function generate(target?: string) {
    const needle = (target ?? who).trim();
    if (!needle) {
      showFlash("Escribe el correo o ID del estudiante");
      return;
    }
    setLoading(true);
    setDossier(null);
    try {
      const res = await adminEvidenceDossier({ data: { userIdOrEmail: needle, environment: env } });
      if ("error" in res) showFlash(res.error);
      else {
        setDossier(res);
        showFlash("Expediente generado");
      }
    } catch (e) {
      showFlash(e instanceof Error ? e.message : "No se pudo generar el expediente.");
    } finally {
      setLoading(false);
    }
  }

  function downloadJson() {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `expediente-${dossier.user.email}-${dossier.generatedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <AdminShell title="Disputas y evidencias" active="operaciones_disputas" maxWidth={1040}>
      <Flash flash={flash} />
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #expediente-print, #expediente-print * { visibility: visible !important; }
          #expediente-print { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
        }
      `}</style>

      {/* Disputas recibidas */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={cardHeadStyle}><Icon n="shield" size={15} /> Disputas de Stripe</div>
        {disputesError ? (
          <p style={{ fontSize: ".82rem", color: "#8DA1BE" }}>{disputesError}</p>
        ) : disputes.length === 0 ? (
          <p style={{ fontSize: ".82rem", color: "#647DA0", lineHeight: 1.6 }}>
            Sin disputas registradas. Cuando Stripe envíe <code style={{ fontFamily: MONO, fontSize: ".76rem" }}>charge.dispute.created</code>,
            aparecerá aquí automáticamente con su expediente a un clic.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".8rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#8DA1BE", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  <th style={{ padding: "6px 8px" }}>Fecha</th>
                  <th style={{ padding: "6px 8px" }}>Estudiante</th>
                  <th style={{ padding: "6px 8px" }}>Motivo</th>
                  <th style={{ padding: "6px 8px" }}>Monto</th>
                  <th style={{ padding: "6px 8px" }}>Estado</th>
                  <th style={{ padding: "6px 8px" }}>Evidencia vence</th>
                  <th style={{ padding: "6px 8px" }} />
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id} style={{ borderTop: "1px solid #EDF2F9", color: "#33527F" }}>
                    <td style={{ padding: "8px" }}>{fmtDate(d.created_at)}</td>
                    <td style={{ padding: "8px" }}>{d.email ?? d.user_id ?? "—"}</td>
                    <td style={{ padding: "8px" }}>{REASON_ES[d.reason ?? ""] ?? d.reason ?? "—"}</td>
                    <td style={{ padding: "8px", fontFamily: MONO }}>{d.amount != null ? `$${d.amount.toLocaleString("es-MX")} ${d.currency ?? ""}` : "—"}</td>
                    <td style={{ padding: "8px" }}>{d.status ?? "—"}</td>
                    <td style={{ padding: "8px" }}>{fmtDate(d.evidence_due_by)}</td>
                    <td style={{ padding: "8px" }}>
                      {(d.email || d.user_id) && (
                        <button
                          onClick={() => { setWho(d.email ?? d.user_id ?? ""); void generate(d.email ?? d.user_id ?? ""); }}
                          style={{ ...primaryBtnStyle, padding: "6px 12px", fontSize: ".74rem" }}
                        >
                          Expediente →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generador de expediente */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={cardHeadStyle}><Icon n="doc" size={15} /> Generar expediente de defensa</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={labelStyle}>Correo o ID del estudiante</label>
            <input
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder="estudiante@correo.com"
              style={inputStyle}
              onKeyDown={(e) => { if (e.key === "Enter") void generate(); }}
            />
          </div>
          <div>
            <label style={labelStyle}>Ambiente</label>
            <select value={env} onChange={(e) => setEnv(e.target.value as StripeEnv)} style={{ ...inputStyle, width: 140 }}>
              <option value="live">live</option>
              <option value="sandbox">sandbox</option>
            </select>
          </div>
          <button onClick={() => void generate()} disabled={loading} style={{ ...primaryBtnStyle, padding: "11px 20px" }}>
            {loading ? "Generando…" : "Generar expediente"}
          </button>
        </div>
        <p style={{ fontSize: ".72rem", color: "#8DA1BE", marginTop: 10, lineHeight: 1.5 }}>
          Reúne el ledger de evidencias (registro, términos aceptados, logins con IP, uso real), la bitácora de
          facturación, los eventos de Stripe con señal de riesgo (Radar, 3DS) y el historial de soporte, en orden
          cronológico y con score de ganabilidad.
        </p>
      </div>

      {/* Expediente */}
      {dossier && (
        <div id="expediente-print">
          <div style={{ ...cardStyle, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: ".7rem", color: "#8DA1BE", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>
                  Expediente de defensa · {fmtDate(dossier.generatedAt)} · {dossier.environment}
                </div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", color: INK, margin: "6px 0 2px" }}>
                  {dossier.user.nombre ?? dossier.user.email}
                </h2>
                <div style={{ fontSize: ".8rem", color: "#647DA0", fontFamily: MONO }}>{dossier.user.email} · {dossier.user.id}</div>
                <div style={{ fontSize: ".8rem", color: "#647DA0", marginTop: 4 }}>
                  Plan: <strong>{dossier.user.plan ?? "—"}</strong>
                  {dossier.user.accessStart ? ` · acceso desde ${fmtDate(dossier.user.accessStart)}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }} className="print:hidden">
                <button onClick={downloadJson} style={{ ...primaryBtnStyle, padding: "9px 16px", background: "#3D5D91" }}>
                  <Icon n="download" size={14} /> JSON
                </button>
                <button onClick={() => window.print()} style={{ ...primaryBtnStyle, padding: "9px 16px" }}>
                  <Icon n="doc" size={14} /> Imprimir / PDF
                </button>
              </div>
            </div>

            {/* Score */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 200px) 1fr", gap: 18, marginTop: 18, alignItems: "start" }}>
              <div style={{ textAlign: "center", background: "#F7F9FC", borderRadius: 14, padding: "18px 12px" }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "2.6rem", fontWeight: 800, color: dossier.score.pct >= 60 ? "#1d8a4c" : dossier.score.pct >= 35 ? "#b07d00" : "#c0392b" }}>
                  {dossier.score.pct}%
                </div>
                <div style={{ fontSize: ".72rem", color: "#647DA0", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                  Probabilidad de ganar
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 6 }}>
                {dossier.score.reasons.map((r) => (
                  <div key={r.label} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: ".8rem", color: r.ok ? "#1d6f43" : "#98A8C0" }}>
                    <span style={{ marginTop: 2, flexShrink: 0 }}>
                      <Icon n={r.ok ? "checkCircle" : "minus"} size={14} />
                    </span>
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen: términos, logins, uso */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 18 }}>
            <div style={cardStyle}>
              <div style={cardHeadStyle}><Icon n="doc" size={15} /> Términos aceptados</div>
              {dossier.terms.accepted ? (
                <div style={{ fontSize: ".82rem", color: "#33527F", lineHeight: 1.8 }}>
                  Versión <strong style={{ fontFamily: MONO }}>{dossier.terms.version ?? "—"}</strong><br />
                  {fmtDate(dossier.terms.at)}<br />
                  IP <span style={{ fontFamily: MONO }}>{dossier.terms.ip ?? "—"}</span>
                </div>
              ) : (
                <p style={{ fontSize: ".8rem", color: "#98A8C0" }}>Sin registro (cuenta previa al ledger).</p>
              )}
            </div>
            <div style={cardStyle}>
              <div style={cardHeadStyle}><Icon n="user" size={15} /> Sesiones</div>
              <div style={{ fontSize: ".82rem", color: "#33527F", lineHeight: 1.8 }}>
                <strong>{dossier.logins.total}</strong> inicios de sesión · {dossier.logins.distinctIps} IP distintas<br />
                Primero: {fmtDate(dossier.logins.first)}<br />
                Último: {fmtDate(dossier.logins.last)}<br />
                IP principal: <span style={{ fontFamily: MONO }}>{dossier.logins.topIp ?? "—"}</span>
              </div>
            </div>
            <div style={cardStyle}>
              <div style={cardHeadStyle}><Icon n="stats" size={15} /> Uso real del producto</div>
              <div style={{ fontSize: ".82rem", color: "#33527F", lineHeight: 1.8 }}>
                {dossier.usage.quizzes} cuestionarios · {dossier.usage.sims} simulacros<br />
                {dossier.usage.questionsAnswered.toLocaleString("es-MX")} preguntas respondidas
                {dossier.usage.avgScorePct != null ? ` · ${dossier.usage.avgScorePct}% aciertos` : ""}<br />
                {dossier.usage.studyMinutes.toLocaleString("es-MX")} min de estudio en {dossier.usage.activeDays} días activos<br />
                {dossier.usage.flashSessions} sesiones de flashcards · {dossier.usage.clasesVistas} clases vistas
              </div>
            </div>
          </div>

          {/* Cobros y suscripciones */}
          <div style={{ ...cardStyle, marginBottom: 18 }}>
            <div style={cardHeadStyle}><Icon n="shield" size={15} /> Cobros y señal de riesgo (Stripe)</div>
            {dossier.charges.length === 0 ? (
              <p style={{ fontSize: ".8rem", color: "#98A8C0" }}>Sin cobros consultables para este ambiente.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".78rem" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#8DA1BE", fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".08em" }}>
                      <th style={{ padding: "5px 8px" }}>Fecha</th>
                      <th style={{ padding: "5px 8px" }}>Monto</th>
                      <th style={{ padding: "5px 8px" }}>Estado</th>
                      <th style={{ padding: "5px 8px" }}>Radar</th>
                      <th style={{ padding: "5px 8px" }}>3DS</th>
                      <th style={{ padding: "5px 8px" }}>CVC</th>
                      <th style={{ padding: "5px 8px" }}>Disputado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossier.charges.map((c) => (
                      <tr key={c.id} style={{ borderTop: "1px solid #EDF2F9", color: "#33527F" }}>
                        <td style={{ padding: "7px 8px" }}>{fmtDate(c.created)}</td>
                        <td style={{ padding: "7px 8px", fontFamily: MONO }}>${c.amount.toLocaleString("es-MX")} {c.currency}</td>
                        <td style={{ padding: "7px 8px" }}>{c.status}</td>
                        <td style={{ padding: "7px 8px" }}>{c.riskLevel ?? "—"}{c.riskScore != null ? ` (${c.riskScore})` : ""}</td>
                        <td style={{ padding: "7px 8px" }}>{c.threeDSecure ?? "—"}</td>
                        <td style={{ padding: "7px 8px" }}>{c.cvcCheck ?? "—"}</td>
                        <td style={{ padding: "7px 8px" }}>{c.disputed ? "⚠️ sí" : "no"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {dossier.subscriptions.length > 0 && (
              <p style={{ fontSize: ".76rem", color: "#647DA0", marginTop: 10 }}>
                Suscripciones: {dossier.subscriptions.map((s) => `${s.price_id} (${s.status}, hasta ${fmtDate(s.current_period_end)})`).join(" · ")}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div style={{ ...cardStyle, marginBottom: 18 }}>
            <div style={cardHeadStyle}><Icon n="clock" size={15} /> Línea de tiempo ({dossier.timeline.length} eventos)</div>
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              {dossier.timeline.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: i ? "1px solid #F0F4FA" : "none", fontSize: ".78rem" }}>
                  <span style={{ fontFamily: MONO, color: "#8DA1BE", whiteSpace: "nowrap", fontSize: ".72rem", minWidth: 128 }}>
                    {fmtDate(t.at)}
                  </span>
                  <span style={{
                    flexShrink: 0, fontSize: ".64rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em",
                    padding: "2px 8px", borderRadius: 10, height: "fit-content",
                    background: t.source === "evidencia" ? "rgba(61,93,145,.1)" : t.source === "facturación" ? "rgba(108,8,32,.08)" : t.source === "stripe" ? "rgba(99,91,255,.1)" : "rgba(243,156,18,.12)",
                    color: t.source === "evidencia" ? "#3D5D91" : t.source === "facturación" ? "#6C0820" : t.source === "stripe" ? "#5851c9" : "#8a6000",
                  }}>{t.source}</span>
                  <span style={{ color: "#33527F" }}>
                    <strong>{t.event}</strong>
                    {t.ip ? <span style={{ fontFamily: MONO, color: "#8DA1BE" }}> · {t.ip}</span> : null}
                    {t.detail ? <span style={{ color: "#647DA0" }}> — {t.detail}</span> : null}
                  </span>
                </div>
              ))}
              {dossier.timeline.length === 0 && (
                <p style={{ fontSize: ".8rem", color: "#98A8C0" }}>Aún no hay eventos registrados para este estudiante.</p>
              )}
            </div>
          </div>

          {/* Soporte */}
          {dossier.support.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: 18 }}>
              <div style={cardHeadStyle}><Icon n="headset" size={15} /> Historial de soporte</div>
              {dossier.support.map((s, i) => (
                <div key={i} style={{ fontSize: ".8rem", color: "#33527F", padding: "5px 0", borderTop: i ? "1px solid #F0F4FA" : "none" }}>
                  <span style={{ fontFamily: MONO, color: "#8DA1BE", fontSize: ".72rem" }}>{fmtDate(s.at)}</span> — {s.detail}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
