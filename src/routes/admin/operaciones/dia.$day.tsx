/** Drill-down por día: subs activas, eventos de estudio, fallos de webhook, drift. */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, cardStyle, cardHeadStyle } from "@/components/admin/AdminShell";
import { adminDayDrilldown, type DayDrilldown } from "@/lib/admin.functions";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

export const Route = createFileRoute("/admin/operaciones/dia/$day")({
  component: DrilldownPage,
  head: () => ({
    meta: [
      { title: "Detalle del día · Panel Admin FlightPath" },
      { name: "description", content: "Suscripciones activas, eventos de estudio y errores de sincronización de un día específico." },
    ],
  }),
});

function DrilldownPage() {
  const { day } = Route.useParams();
  const [data, setData] = useState<DayDrilldown | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const env = isPaymentsConfigured() ? getStripeEnvironment() : "sandbox";

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const res = await adminDayDrilldown({ data: { day, environment: env } });
      if (cancel) return;
      if ("error" in res) setErr(res.error);
      else setData(res);
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [day, env]);

  const prettyDay = new Date(`${day}T12:00:00`).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <AdminShell title={`Detalle · ${prettyDay}`} active="operaciones">
      <div style={{ marginBottom: 16 }}>
        <Link to="/admin/operaciones" style={{ color: "#3D5D91", fontWeight: 700, fontSize: ".9rem" }}>
          ← Volver al panel
        </Link>
      </div>

      {err && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", padding: 12, borderRadius: 12, marginBottom: 16 }}>
          {err}
        </div>
      )}
      {loading && <div style={{ color: "#647DA0" }}>Cargando datos del día…</div>}

      {data && (
        <>
          <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 20 }}>
            <Kpi label="Subs activas" value={data.totals.subs} tone="#2ecc71" />
            <Kpi label="Eventos de estudio" value={data.totals.events} tone="#3D5D91" />
            <Kpi label="Fallos de webhook" value={data.totals.failures} tone="#e74c3c" />
            <Kpi label="Drift usuarios (actual)" value={data.totals.drift} tone="#f39c12" />
          </section>

          <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
            <div style={cardStyle}>
              <div style={cardHeadStyle}>Suscripciones activas ese día</div>
              <div style={{ padding: 16 }}>
                {data.active_subscriptions.length === 0 ? (
                  <Empty text="Sin suscripciones activas." />
                ) : (
                  <Table
                    head={["Usuario", "Estado", "Fin de período"]}
                    rows={data.active_subscriptions.map((s) => [
                      s.email ?? s.user_id.slice(0, 8),
                      s.status,
                      s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("es-MX") : "—",
                    ])}
                  />
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardHeadStyle}>Eventos de estudio</div>
              <div style={{ padding: 16 }}>
                {data.study_events.length === 0 ? (
                  <Empty text="Sin eventos de estudio ese día." />
                ) : (
                  <Table
                    head={["Usuario", "Colección", "Registros"]}
                    rows={data.study_events.map((e) => [
                      e.email ?? e.user_id.slice(0, 8),
                      e.collection,
                      String(e.count),
                    ])}
                  />
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardHeadStyle}>Errores de sincronización (Stripe)</div>
              <div style={{ padding: 16 }}>
                {data.stripe_failures.length === 0 ? (
                  <Empty text="Sin fallos de webhook." />
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                    {data.stripe_failures.map((f) => (
                      <li key={f.id} style={{ borderBottom: "1px solid #F2DCDB", paddingBottom: 8 }}>
                        <div style={{ fontSize: ".85rem", color: "#22375C", fontWeight: 700 }}>{f.type}</div>
                        <div style={{ fontSize: ".72rem", color: "#647DA0" }}>{new Date(f.received_at).toLocaleString("es-MX")}</div>
                        {f.error_message && <div style={{ fontSize: ".78rem", color: "#e74c3c", marginTop: 4 }}>{f.error_message}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardHeadStyle}>Drift plan ↔ suscripción (estado actual)</div>
              <div style={{ padding: 16 }}>
                {data.drift_users.length === 0 ? (
                  <Empty text="✓ Sin desincronizaciones." />
                ) : (
                  <Table
                    head={["Usuario", "Perfil", "Sub", "Tipo"]}
                    rows={data.drift_users.map((d) => [d.email, d.profile_plan ?? "?", d.sub_status ?? "sin sub", d.kind])}
                  />
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div style={{ ...cardStyle, padding: 18 }}>
      <div style={{ fontSize: ".72rem", color: "#647DA0", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.9rem", fontWeight: 800, color: tone, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ color: "#647DA0", fontSize: ".85rem" }}>{text}</div>;
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "#647DA0", borderBottom: "1px solid #F2DCDB", fontSize: ".72rem", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={{ padding: "8px", borderBottom: "1px solid #F7EEEE", color: "#22375C" }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
