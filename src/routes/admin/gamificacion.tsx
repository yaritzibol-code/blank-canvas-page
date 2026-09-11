/**
 * Admin — Gamificación (FlightPoints).
 *
 * Reglas configurables, economía, historial de cambios, ajustes manuales y
 * alertas de comportamiento raro. Cambiar un monto aquí no reescribe el pasado:
 * las transacciones guardan el snapshot de la regla con la que se otorgaron.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminFpAdjust,
  adminFpPanel,
  adminFpRevert,
  adminSaveFpRule,
} from "@/lib/fp/fp.functions";
import { fpFormat } from "@/lib/fp/shared";

export const Route = createFileRoute("/admin/gamificacion")({
  component: GamificacionPage,
  head: () => ({
    meta: [
      { title: "Gamificación — Admin FlightPath" },
      { name: "description", content: "Reglas, economía y auditoría del sistema de FlightPoints." },
      { property: "og:title", content: "Gamificación — Admin FlightPath" },
      { property: "og:description", content: "Panel interno de FlightPoints." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

interface Panel {
  reglas: { key: string; label: string; categoria: string; value: Record<string, number>; enabled: boolean }[];
  historial: Record<string, unknown>[];
  alertas: Record<string, unknown>[];
  economia: Record<string, unknown>;
  top: { user_id: string; total: number }[];
}

const CARD: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(61,93,145,.14)",
  borderRadius: 14,
  padding: 16,
};

function GamificacionPage() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [tab, setTab] = useState<"reglas" | "economia" | "historial" | "ajustes" | "alertas">("reglas");
  const [msg, setMsg] = useState("");
  const [ajuste, setAjuste] = useState({ userId: "", amount: 0, motivo: "" });
  const [reversa, setReversa] = useState({ txId: "", motivo: "" });

  const cargar = () => {
    void adminFpPanel()
      .then((p) => setPanel(p as unknown as Panel))
      .catch(() => setMsg("No se pudo cargar el panel."));
  };
  useEffect(cargar, []);

  const guardarRegla = async (key: string, fp: number, enabled: boolean) => {
    await adminSaveFpRule({ data: { key, fp, enabled } });
    setMsg("Regla actualizada.");
    cargar();
  };

  const eco = panel?.economia ?? {};

  return (
    <AdminShell title="Gamificación — FlightPoints" active="gamificacion">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["reglas", "economia", "historial", "ajustes", "alertas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: ".82rem",
                background: tab === t ? "#22375C" : "rgba(61,93,145,.1)",
                color: tab === t ? "white" : "#3D5D91",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {msg && <p style={{ margin: 0, fontSize: ".82rem", color: "#3D5D91" }}>{msg}</p>}

        {tab === "reglas" && (
          <div style={{ ...CARD, display: "grid", gap: 10 }}>
            {(panel?.reglas ?? []).map((r) => (
              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ flex: 1, minWidth: 220, fontSize: ".86rem", color: "#22375C" }}>
                  {r.label} <small style={{ color: "#9aa8bb" }}>· {r.categoria}</small>
                </span>
                <input
                  type="number"
                  defaultValue={Number(r.value?.["fp"] ?? 0)}
                  onBlur={(e) => void guardarRegla(r.key, Number(e.target.value), r.enabled)}
                  style={{ width: 90, padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }}
                />
                <button
                  onClick={() => void guardarRegla(r.key, Number(r.value?.["fp"] ?? 0), !r.enabled)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: ".76rem", background: r.enabled ? "rgba(46,204,113,.16)" : "rgba(176,48,48,.12)", color: r.enabled ? "#1e7b47" : "#b03030" }}
                >
                  {r.enabled ? "Activa" : "Apagada"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "economia" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ ...CARD, display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { l: "FP esta semana", v: eco["semana"] },
                { l: "FP este mes", v: eco["mes"] },
                { l: "FP histórico", v: eco["historico"] },
                { l: "Usuarios con FP", v: eco["usuarios"] },
                { l: "Transacciones", v: eco["transacciones"] },
              ].map((k) => (
                <div key={k.l}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#3D5D91" }}>{fpFormat(Number(k.v ?? 0))}</div>
                  <div style={{ fontSize: ".72rem", color: "#6b7a90" }}>{k.l}</div>
                </div>
              ))}
            </div>
            <div style={{ ...CARD, display: "grid", gap: 6 }}>
              <strong style={{ fontSize: ".85rem", color: "#22375C" }}>Por actividad</strong>
              {((eco["por_actividad"] as { tipo: string; fp: number; n: number }[]) ?? []).map((a) => (
                <div key={a.tipo} style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}>
                  <span>{a.tipo}</span>
                  <span>{fpFormat(a.fp)} FP · {a.n}</span>
                </div>
              ))}
            </div>
            <div style={{ ...CARD, display: "grid", gap: 6 }}>
              <strong style={{ fontSize: ".85rem", color: "#22375C" }}>Top 20 saldos</strong>
              {(panel?.top ?? []).map((t) => (
                <div key={t.user_id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem" }}>
                  <code>{t.user_id.slice(0, 8)}…</code>
                  <span>{fpFormat(t.total)} FP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "historial" && (
          <div style={{ ...CARD, display: "grid", gap: 6 }}>
            {(panel?.historial ?? []).length === 0 && <p style={{ margin: 0, fontSize: ".84rem" }}>Sin cambios registrados.</p>}
            {(panel?.historial ?? []).map((h) => (
              <div key={String(h["id"])} style={{ fontSize: ".78rem", color: "#41526b" }}>
                <strong>{String(h["key"])}</strong> · {JSON.stringify(h["old_value"])} → {JSON.stringify(h["new_value"])}{" "}
                <small style={{ color: "#9aa8bb" }}>{new Date(String(h["created_at"])).toLocaleString("es-MX")}</small>
              </div>
            ))}
          </div>
        )}

        {tab === "ajustes" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ ...CARD, display: "grid", gap: 8 }}>
              <strong style={{ fontSize: ".9rem", color: "#22375C" }}>Ajuste manual</strong>
              <input placeholder="ID del usuario" value={ajuste.userId} onChange={(e) => setAjuste({ ...ajuste, userId: e.target.value })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <input type="number" placeholder="FP (puede ser negativo)" value={ajuste.amount} onChange={(e) => setAjuste({ ...ajuste, amount: Number(e.target.value) })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <input placeholder="Motivo" value={ajuste.motivo} onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <button
                onClick={() =>
                  void adminFpAdjust({ data: ajuste }).then(() => {
                    setMsg("Ajuste aplicado.");
                    cargar();
                  })
                }
                style={{ justifySelf: "start", padding: "8px 16px", borderRadius: 10, border: "none", background: "#22375C", color: "white", fontWeight: 700, cursor: "pointer", fontSize: ".82rem" }}
              >
                Aplicar ajuste
              </button>
            </div>
            <div style={{ ...CARD, display: "grid", gap: 8 }}>
              <strong style={{ fontSize: ".9rem", color: "#22375C" }}>Revertir transacción</strong>
              <input placeholder="ID de la transacción" value={reversa.txId} onChange={(e) => setReversa({ ...reversa, txId: e.target.value })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <input placeholder="Motivo" value={reversa.motivo} onChange={(e) => setReversa({ ...reversa, motivo: e.target.value })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <button
                onClick={() =>
                  void adminFpRevert({ data: reversa }).then(() => {
                    setMsg("Transacción revertida.");
                    cargar();
                  })
                }
                style={{ justifySelf: "start", padding: "8px 16px", borderRadius: 10, border: "none", background: "#6C0820", color: "white", fontWeight: 700, cursor: "pointer", fontSize: ".82rem" }}
              >
                Revertir
              </button>
            </div>
          </div>
        )}

        {tab === "alertas" && (
          <div style={{ ...CARD, display: "grid", gap: 6 }}>
            {(panel?.alertas ?? []).length === 0 && <p style={{ margin: 0, fontSize: ".84rem" }}>Sin alertas.</p>}
            {(panel?.alertas ?? []).map((a) => (
              <div key={String(a["id"])} style={{ fontSize: ".8rem", color: "#41526b" }}>
                <strong>{String(a["mensaje"])}</strong> · <code>{String(a["user_id"] ?? "").slice(0, 8)}…</code>{" "}
                <small style={{ color: "#9aa8bb" }}>{new Date(String(a["created_at"])).toLocaleString("es-MX")}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
