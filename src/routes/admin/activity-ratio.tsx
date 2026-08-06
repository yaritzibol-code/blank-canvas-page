/** Panel Admin — Activity Ratio: bounce rate y comportamiento real de uso. */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminShell, cardStyle } from "@/components/admin/AdminShell";
import {
  adminActivityReport,
  adminActivityTimeline,
  type ActivityFunnelRow,
  type ActivityOverview,
  type ActivityScreenRow,
  type ActivityTimelineRow,
  type ActivityUserRow,
} from "@/lib/activity.functions";

export const Route = createFileRoute("/admin/activity-ratio")({
  component: ActivityRatioPage,
});

const MUTED = "#647DA0";
const DISPLAY = "'Bricolage Grotesque', sans-serif";

const PASOS_LEGIBLES: Record<string, string> = {
  onboarding_inicio: "Abrió el onboarding",
  onboarding_nombre: "Escribió su nombre",
  onboarding_whatsapp: "Dejó su WhatsApp",
  onboarding_escuela: "Eligió escuela de aviación",
  onboarding_tono: "Eligió el tono de Yaris",
  onboarding_avatar: "Subió foto de perfil",
  onboarding_completado: "Terminó el onboarding",
  perfil_editado: "Editó su perfil",
  perfil_completo: "Perfil completo",
  pago_abierto: "Abrió el pago",
  pago_abandonado: "Se salió del pago",
  cuestionario_iniciado: "Inició un cuestionario",
  cuestionario_abandonado: "Dejó el cuestionario a medias",
  simulador_iniciado: "Inició un simulador",
  simulador_abandonado: "Dejó el simulador a medias",
  yaris_abierto: "Abrió a Yaris",
};

function pasoLabel(step: string): string {
  return PASOS_LEGIBLES[step] ?? step.replace(/_/g, " ");
}

function ms(v: number): string {
  const s = Math.round(v / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Metric({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div style={{ ...cardStyle, padding: 18 }}>
      <div style={{ fontSize: ".7rem", color: MUTED, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 900, color: tone ?? "#0A1F44", lineHeight: 1.1, marginTop: 6 }}>
        {value}
      </div>
      {hint ? <div style={{ fontSize: ".74rem", color: MUTED, marginTop: 4 }}>{hint}</div> : null}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardStyle, padding: 18, marginBottom: 16 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, color: "#0A1F44", fontSize: "1.02rem" }}>{title}</div>
      {subtitle ? <div style={{ fontSize: ".78rem", color: MUTED, marginTop: 2, marginBottom: 10 }}>{subtitle}</div> : <div style={{ height: 10 }} />}
      {children}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: ".7rem",
  textTransform: "uppercase",
  letterSpacing: ".6px",
  color: MUTED,
  fontWeight: 700,
  padding: "8px 10px",
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "10px",
  borderTop: "1px solid #E6ECF6",
  fontSize: ".84rem",
  color: "#0A1F44",
  whiteSpace: "nowrap",
};

function Barra({ pct, tone }: { pct: number; tone: string }) {
  return (
    <div style={{ background: "#E6ECF6", borderRadius: 999, height: 8, minWidth: 90, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", background: tone, borderRadius: 999 }} />
    </div>
  );
}

function ActivityRatioPage() {
  const [days, setDays] = useState(7);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<ActivityOverview | null>(null);
  const [screens, setScreens] = useState<ActivityScreenRow[]>([]);
  const [funnel, setFunnel] = useState<ActivityFunnelRow[]>([]);
  const [users, setUsers] = useState<ActivityUserRow[]>([]);
  const [abierto, setAbierto] = useState<ActivityUserRow | null>(null);
  const [timeline, setTimeline] = useState<ActivityTimelineRow[]>([]);
  const [cargandoTimeline, setCargandoTimeline] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await adminActivityReport({ data: { days } });
      if ("error" in res && res.error) {
        setError(res.error);
      } else if ("overview" in res) {
        setOverview(res.overview ?? null);
        setScreens(res.screens ?? []);
        setFunnel(res.funnel ?? []);
        setUsers(res.users ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la actividad.");
    } finally {
      setCargando(false);
    }
  }, [days]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirUsuario = async (u: ActivityUserRow) => {
    setAbierto(u);
    setTimeline([]);
    setCargandoTimeline(true);
    try {
      const res = await adminActivityTimeline({ data: { userId: u.user_id } });
      if ("rows" in res && res.rows) setTimeline(res.rows);
    } catch {
      /* noop */
    } finally {
      setCargandoTimeline(false);
    }
  };

  const maxFunnel = Math.max(1, ...funnel.map((f) => f.people));

  return (
    <AdminShell
      title="Activity Ratio"
      active="activity_ratio"
      maxWidth={1180}
      actions={
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                minHeight: 40,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid " + (days === d ? "#0A1F44" : "#D5DEED"),
                background: days === d ? "#0A1F44" : "#fff",
                color: days === d ? "#fff" : "#0A1F44",
                fontWeight: 700,
                fontSize: ".8rem",
                cursor: "pointer",
              }}
            >
              {d === 1 ? "24 h" : `${d} días`}
            </button>
          ))}
        </div>
      }
    >
      {error ? (
        <div style={{ ...cardStyle, padding: 16, marginBottom: 16, color: "#A31637", fontSize: ".85rem" }}>{error}</div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
        <Metric label="Sesiones" value={String(overview?.sessions ?? 0)} hint={`${overview?.anon_sessions ?? 0} sin cuenta`} />
        <Metric label="Usuarios" value={String(overview?.users ?? 0)} hint="con sesión iniciada" />
        <Metric
          label="Bounce rate"
          value={`${overview?.bounce_rate ?? 0}%`}
          tone={(overview?.bounce_rate ?? 0) > 55 ? "#A31637" : "#2ecc71"}
          hint={`${overview?.bounces ?? 0} rebotes`}
        />
        <Metric label="Atención promedio" value={ms(overview?.avg_engaged_ms ?? 0)} hint="por sesión" />
        <Metric label="Pantallas / sesión" value={String(overview?.avg_screens ?? 0)} />
        <Metric
          label="Onboarding"
          value={`${overview?.onboarding_done ?? 0}/${overview?.onboarding_started ?? 0}`}
          hint="terminados / iniciados"
        />
      </div>

      <Card title="Rebote por pantalla de entrada" subtitle="Dónde llega la gente y se va sin hacer nada.">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead>
              <tr>
                <th style={th}>Pantalla</th>
                <th style={th}>Entradas</th>
                <th style={th}>Rebote</th>
                <th style={th}>Vistas</th>
                <th style={th}>Salidas</th>
                <th style={th}>Tiempo prom.</th>
              </tr>
            </thead>
            <tbody>
              {screens.length === 0 && !cargando ? (
                <tr>
                  <td style={{ ...td, color: MUTED }} colSpan={6}>
                    Todavía no hay datos en este rango.
                  </td>
                </tr>
              ) : null}
              {screens.map((s) => (
                <tr key={s.path}>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: ".72rem", color: MUTED }}>{s.path}</div>
                  </td>
                  <td style={td}>{s.entries}</td>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Barra pct={Number(s.bounce_rate)} tone={Number(s.bounce_rate) > 55 ? "#A31637" : "#2ecc71"} />
                      <span style={{ fontWeight: 700 }}>{s.bounce_rate}%</span>
                    </div>
                  </td>
                  <td style={td}>{s.views}</td>
                  <td style={td}>{s.exits}</td>
                  <td style={td}>{ms(s.avg_ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Embudo de onboarding y abandonos" subtitle="Hasta dónde llega cada persona antes de soltar.">
        {funnel.length === 0 ? (
          <div style={{ color: MUTED, fontSize: ".84rem" }}>Sin hitos registrados en este rango.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {funnel.map((f) => (
              <div key={f.step} style={{ display: "grid", gridTemplateColumns: "minmax(140px, 1fr) 2fr auto", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: ".84rem", color: "#0A1F44", fontWeight: 600 }}>{pasoLabel(f.step)}</div>
                <Barra pct={(f.people / maxFunnel) * 100} tone={f.step.includes("abandon") ? "#A31637" : "#0A1F44"} />
                <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#0A1F44" }}>{f.people}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Actividad por usuario" subtitle="Toca a alguien para ver su línea de tiempo completa.">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr>
                <th style={th}>Usuario</th>
                <th style={th}>Plan</th>
                <th style={th}>Sesiones</th>
                <th style={th}>Tiempo</th>
                <th style={th}>Pantallas</th>
                <th style={th}>Onboarding</th>
                <th style={th}>Última pantalla</th>
                <th style={th}>Visto</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !cargando ? (
                <tr>
                  <td style={{ ...td, color: MUTED }} colSpan={8}>
                    Nadie con cuenta ha navegado en este rango.
                  </td>
                </tr>
              ) : null}
              {users.map((u) => (
                <tr
                  key={u.user_id}
                  onClick={() => void abrirUsuario(u)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{u.nombre || "Sin nombre"}</div>
                    <div style={{ fontSize: ".72rem", color: MUTED }}>{u.email}</div>
                  </td>
                  <td style={td}>{u.plan}</td>
                  <td style={td}>
                    {u.sessions} <span style={{ color: MUTED }}>({u.bounces} rebote)</span>
                  </td>
                  <td style={td}>{ms(Number(u.engaged_ms))}</td>
                  <td style={td}>{u.screens}</td>
                  <td style={{ ...td, color: u.onboarding_done ? "#2ecc71" : "#A31637", fontWeight: 700 }}>
                    {u.onboarding_done ? "Completo" : "Incompleto"}
                  </td>
                  <td style={td}>{u.last_label || u.last_path || "—"}</td>
                  <td style={td}>{fecha(u.last_seen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {abierto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Línea de tiempo de ${abierto.nombre || abierto.email}`}
          onClick={() => setAbierto(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,31,68,0.6)",
            zIndex: 60,
            display: "grid",
            placeItems: "center",
            padding: 14,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              width: "min(640px, 100%)",
              maxHeight: "86vh",
              overflowY: "auto",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "1.1rem", color: "#0A1F44" }}>
                  {abierto.nombre || "Sin nombre"}
                </div>
                <div style={{ fontSize: ".78rem", color: MUTED }}>{abierto.email}</div>
              </div>
              <button
                onClick={() => setAbierto(null)}
                style={{ minHeight: 40, minWidth: 40, borderRadius: 10, border: "1px solid #D5DEED", background: "#fff", cursor: "pointer", color: "#0A1F44" }}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
              {cargandoTimeline ? <div style={{ color: MUTED, fontSize: ".84rem" }}>Cargando…</div> : null}
              {!cargandoTimeline && timeline.length === 0 ? (
                <div style={{ color: MUTED, fontSize: ".84rem" }}>Sin eventos registrados.</div>
              ) : null}
              {timeline.map((t, i) => (
                <div
                  key={`${t.created_at}_${i}`}
                  style={{
                    borderLeft: `3px solid ${t.type === "abandon" ? "#A31637" : t.type === "milestone" ? "#0A1F44" : "#D5DEED"}`,
                    padding: "6px 0 6px 10px",
                  }}
                >
                  <div style={{ fontSize: ".84rem", color: "#0A1F44", fontWeight: 600 }}>
                    {t.step ? pasoLabel(t.step) : t.label || t.path || "Vista"}
                  </div>
                  <div style={{ fontSize: ".72rem", color: MUTED }}>
                    {fecha(t.created_at)}
                    {t.duration_ms ? ` · ${ms(t.duration_ms)}` : ""}
                    {t.path ? ` · ${t.path}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
