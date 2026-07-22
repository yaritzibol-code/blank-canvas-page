/** Panel de Operaciones — observabilidad general del SaaS. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, cardStyle, cardHeadStyle } from "@/components/admin/AdminShell";
import { SparkChart, type SparkPoint } from "@/components/admin/SparkChart";
import {
  adminOverview,
  adminMrrDaily,
  adminAiDaily,
  type AdminOverview,
  type MrrDailyPoint,
  type AiDailyPoint,
} from "@/lib/admin.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

export const Route = createFileRoute("/admin/operaciones/")({ component: OperacionesPage });

function Kpi({ label, value, sub, tone = "#3D5D91" }: { label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <div style={{ ...cardStyle, padding: 18 }}>
      <div style={{ fontSize: ".72rem", color: "#647DA0", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.9rem", fontWeight: 800, color: tone, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: ".78rem", color: "#647DA0", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const shortDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
};

function OperacionesPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [mrrSeries, setMrrSeries] = useState<MrrDailyPoint[]>([]);
  const [aiSeries, setAiSeries] = useState<AiDailyPoint[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const env = isPaymentsConfigured() ? getStripeEnvironment() : "sandbox";

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const [ov, mrr, ai] = await Promise.all([
        adminOverview({ data: { environment: env } }),
        adminMrrDaily({ data: { environment: env, days: 30 } }),
        adminAiDaily({ data: { days: 30 } }),
      ]);
      if (cancel) return;
      if ("error" in ov) setErr(ov.error);
      else setData(ov);
      if (!("error" in mrr)) setMrrSeries(mrr);
      if (!("error" in ai)) setAiSeries(ai);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [env]);

  const mrrPoints: SparkPoint[] = mrrSeries.map((r) => ({ label: r.day, value: r.mrr }));
  const proPoints: SparkPoint[] = mrrSeries.map((r) => ({ label: r.day, value: r.active_count }));
  const aiCallsPoints: SparkPoint[] = aiSeries.map((r) => ({ label: r.day, value: r.calls }));
  const aiTokensPoints: SparkPoint[] = aiSeries.map((r) => ({ label: r.day, value: r.tokens_in + r.tokens_out }));

  const aiTotals = aiSeries.reduce(
    (acc, r) => ({
      calls: acc.calls + r.calls,
      errors: acc.errors + r.errors,
      tokens: acc.tokens + r.tokens_in + r.tokens_out,
      latSum: acc.latSum + r.avg_latency_ms * (r.calls > 0 ? 1 : 0),
      latN: acc.latN + (r.calls > 0 ? 1 : 0),
    }),
    { calls: 0, errors: 0, tokens: 0, latSum: 0, latN: 0 },
  );
  const avgLatency = aiTotals.latN > 0 ? Math.round(aiTotals.latSum / aiTotals.latN) : 0;

  return (
    <AdminShell title="Panel de operaciones" active="operaciones">
      {err && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", padding: 12, borderRadius: 12, marginBottom: 16 }}>
          {err}
        </div>
      )}
      {loading && !data && <div style={{ color: "#647DA0" }}>Cargando métricas…</div>}
      {data && (
        <>
          <section style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <Kpi label="MRR estimado" value={`$${data.mrr.toLocaleString("es-MX")} MXN`} sub={`${env === "live" ? "Live" : "Sandbox"}`} tone="#22375C" />
              <Kpi label="Pro activos" value={data.pro.active} sub={`${data.pro.trialing} en trial · ${data.pro.past_due} past due`} tone="#2ecc71" />
              <Kpi label="Cancelaciones (30d)" value={data.pro.canceled_last_30d} sub={`${data.pro.renewing_next_7d} renuevan en 7d`} tone="#e74c3c" />
              <Kpi label="Usuarios totales" value={data.platform.total_users} sub={`${data.platform.admins} admins`} tone="#3D5D91" />
            </div>
          </section>

          {/* Gráficos de 30 días */}
          <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", marginBottom: 20 }}>
            <div style={cardStyle}>
              <div style={cardHeadStyle}>MRR diario · últimos 30 días</div>
              <div style={{ padding: 16 }}>
                <SparkChart
                  points={mrrPoints}
                  color="#22375C"
                  fill="rgba(34,55,92,0.14)"
                  formatValue={(n) => `$${n.toLocaleString("es-MX")}`}
                  formatLabel={shortDay}
                />
              </div>
            </div>
            <div style={cardStyle}>
              <div style={cardHeadStyle}>Suscriptores Pro activos · últimos 30 días</div>
              <div style={{ padding: 16 }}>
                <SparkChart
                  points={proPoints}
                  color="#2ecc71"
                  fill="rgba(46,204,113,0.14)"
                  formatLabel={shortDay}
                />
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", marginBottom: 20 }}>
            <div style={cardStyle}>
              <div style={cardHeadStyle}>Yaris IA · llamadas por día (30d)</div>
              <div style={{ padding: 16 }}>
                <SparkChart points={aiCallsPoints} color="#6C0820" fill="rgba(108,8,32,0.12)" formatLabel={shortDay} />
                <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                  <Row k="Llamadas (30d)" v={aiTotals.calls.toLocaleString("es-MX")} />
                  <Row
                    k="Errores"
                    v={`${aiTotals.errors} (${aiTotals.calls ? ((aiTotals.errors / aiTotals.calls) * 100).toFixed(1) : "0.0"}%)`}
                  />
                  <Row k="Latencia media" v={`${avgLatency}ms`} />
                </div>
              </div>
            </div>
            <div style={cardStyle}>
              <div style={cardHeadStyle}>Yaris IA · tokens totales por día (30d)</div>
              <div style={{ padding: 16 }}>
                <SparkChart
                  points={aiTokensPoints}
                  color="#F2AEBC"
                  fill="rgba(242,174,188,0.22)"
                  formatLabel={shortDay}
                />
                <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                  <Row k="Tokens totales" v={aiTotals.tokens.toLocaleString("es-MX")} />
                  <Row k="Últimas 24h · llamadas" v={data.ai.calls} />
                  <Row k="Últimas 24h · p50 / p95" v={`${data.ai.latency_p50}ms / ${data.ai.latency_p95}ms`} />
                </div>
                <Link to="/admin/operaciones/yaris" style={{ display: "inline-block", marginTop: 10, fontSize: ".85rem", color: "#3D5D91", fontWeight: 700 }}>
                  Configurar Yaris →
                </Link>
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <div style={cardStyle}>
              <div style={cardHeadStyle}>Eventos de Stripe · últimas 24h</div>
              <div style={{ display: "flex", gap: 16, padding: 16, flexWrap: "wrap" }}>
                <Stat label="Procesados" value={data.stripe.processed} color="#2ecc71" />
                <Stat label="Fallidos" value={data.stripe.failed} color="#e74c3c" />
                <Stat label="Ignorados" value={data.stripe.ignored} color="#f39c12" />
                <Stat label="Pendientes" value={data.stripe.received} color="#3D5D91" />
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <Link to="/admin/operaciones/stripe" style={{ fontSize: ".85rem", color: "#3D5D91", fontWeight: 700 }}>
                  Ver bitácora completa →
                </Link>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardHeadStyle}>Discrepancias plan ↔ suscripción</div>
              <div style={{ padding: 16 }}>
                {data.drift.length === 0 ? (
                  <div style={{ color: "#2ecc71", fontWeight: 700 }}>✓ Sin discrepancias.</div>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {data.drift.slice(0, 8).map((d) => (
                      <li key={d.user_id} style={{ fontSize: ".85rem", color: "#22375C", borderBottom: "1px solid #F2DCDB", paddingBottom: 6 }}>
                        <strong>{d.email}</strong> · perfil={d.profile_plan ?? "?"} · sub={d.sub_status ?? "sin sub"}
                        <div style={{ color: "#e74c3c", fontSize: ".72rem" }}>{d.kind}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardHeadStyle}>Plataforma</div>
              <div style={{ padding: 16, display: "grid", gap: 8 }}>
                <Row k="Reportes abiertos" v={data.platform.reports_open} />
                <Row k="Recordatorios (24h)" v={`${data.platform.reminders_last_24h} enviados · ${data.platform.reminders_failed_24h} fallidos`} />
                <Row k="RAG chunks" v={data.platform.rag_chunks} />
              </div>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: ".72rem", color: "#647DA0", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.5rem", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", color: "#22375C" }}>
      <span style={{ color: "#647DA0" }}>{k}</span>
      <strong>{v}</strong>
    </div>
  );
}
