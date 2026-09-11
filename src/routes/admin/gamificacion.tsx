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
  adminCommunityDirectory,
  adminFpAdjust,
  adminFpBackfill,
  adminFpPanel,
  adminFpRevert,
  adminSaveFpRule,
  type AdminComunidadFila,
} from "@/lib/fp/fp.functions";
import { fpFormat } from "@/lib/fp/shared";
import { Callsign, Insignia } from "@/components/comunidad/pieces";

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
  reglas: { key: string; label: string; categoria: string; fp: number; enabled: boolean }[];
  historial: { id: string; key: string; antes: string; despues: string; createdAt: string }[];
  alertas: { id: string; userId: string; mensaje: string; createdAt: string }[];
  economia: string;
  top: { userId: string; total: number }[];
}

const CARD: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(61,93,145,.14)",
  borderRadius: 14,
  padding: 16,
};

function GamificacionPage() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [directorio, setDirectorio] = useState<AdminComunidadFila[]>([]);
  const [tab, setTab] = useState<"reglas" | "economia" | "historial" | "ajustes" | "alertas">("reglas");
  const [msg, setMsg] = useState("");
  const [ajuste, setAjuste] = useState({ userId: "", amount: 0, motivo: "" });
  const [reversa, setReversa] = useState({ txId: "", motivo: "" });

  const cargar = () => {
    void adminFpPanel()
      .then((p) => setPanel(p as unknown as Panel))
      .catch(() => setMsg("No se pudo cargar el panel."));
    void adminCommunityDirectory()
      .then(setDirectorio)
      .catch(() => undefined);
  };

  /** Quién es: indicativo + nombre real, para no mostrar ids crudos. */
  const quien = (userId: string) => directorio.find((f) => f.userId === userId) ?? null;

  /** Acepta id, correo o indicativo del alumno y devuelve su id. */
  const resolverUsuario = (texto: string): string => {
    const t = texto.trim().toLowerCase();
    const f = directorio.find(
      (x) => x.userId === t || x.email.toLowerCase() === t || x.callsign.toLowerCase() === t,
    );
    return f?.userId ?? texto.trim();
  };
  useEffect(cargar, []);

  const guardarRegla = async (key: string, fp: number, enabled: boolean) => {
    await adminSaveFpRule({ data: { key, fp, enabled } });
    setMsg("Regla actualizada.");
    cargar();
  };

  const eco: Record<string, unknown> = panel ? JSON.parse(panel.economia) : {};

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
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setMsg("Recalculando FlightPoints de todos los alumnos…");
              void adminFpBackfill()
                .then((r) => setMsg(`Listo: ${r.usuarios} alumnos revisados, ${fpFormat(r.fpNuevo)} FP nuevos.`))
                .catch(() => setMsg("No se pudo recalcular."));
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(61,93,145,.25)",
              background: "white",
              color: "#3D5D91",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: ".82rem",
            }}
          >
            Recalcular desde actividad real
          </button>
          <span style={{ fontSize: ".76rem", color: "#6b7a90" }}>
            La sincronización también corre sola cada hora.
          </span>
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
                  defaultValue={r.fp}
                  onBlur={(e) => void guardarRegla(r.key, Number(e.target.value), r.enabled)}
                  style={{ width: 90, padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }}
                />
                <button
                  onClick={() => void guardarRegla(r.key, r.fp, !r.enabled)}
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
              {(panel?.top ?? []).map((t) => {
                const q = quien(t.userId);
                return (
                  <div key={t.userId} className="cm-root" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".78rem" }}>
                    {q ? <Insignia callsign={q.callsign} size={24} /> : null}
                    <span style={{ flex: 1, minWidth: 0, display: "grid" }}>
                      <strong style={{ color: "#22375C" }}>{q ? <Callsign texto={q.callsign} /> : <code>{t.userId.slice(0, 8)}…</code>}</strong>
                      {q && (
                        <small style={{ color: "#647DA0" }}>
                          {q.nombre} · {q.email} · {q.privacidad === "nombre" ? "muestra su nombre" : "anónimo"}
                        </small>
                      )}
                    </span>
                    <span style={{ fontWeight: 700, color: "#3D5D91" }}>{fpFormat(t.total)} FP</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "historial" && (
          <div style={{ ...CARD, display: "grid", gap: 6 }}>
            {(panel?.historial ?? []).length === 0 && <p style={{ margin: 0, fontSize: ".84rem" }}>Sin cambios registrados.</p>}
            {(panel?.historial ?? []).map((h) => (
              <div key={h.id} style={{ fontSize: ".78rem", color: "#41526b" }}>
                <strong>{h.key}</strong> · {h.antes} → {h.despues}{" "}
                <small style={{ color: "#9aa8bb" }}>{new Date(h.createdAt).toLocaleString("es-MX")}</small>
              </div>
            ))}
          </div>
        )}

        {tab === "ajustes" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ ...CARD, display: "grid", gap: 8 }}>
              <strong style={{ fontSize: ".9rem", color: "#22375C" }}>Ajuste manual</strong>
              <input placeholder="ID, correo o indicativo del alumno" value={ajuste.userId} onChange={(e) => setAjuste({ ...ajuste, userId: e.target.value })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <input type="number" placeholder="FP (puede ser negativo)" value={ajuste.amount} onChange={(e) => setAjuste({ ...ajuste, amount: Number(e.target.value) })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <input placeholder="Motivo" value={ajuste.motivo} onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(61,93,145,.25)" }} />
              <button
                onClick={() =>
                  void adminFpAdjust({ data: { ...ajuste, userId: resolverUsuario(ajuste.userId) } }).then(() => {
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
              <div key={a.id} style={{ fontSize: ".8rem", color: "#41526b" }}>
                <strong>{a.mensaje}</strong> ·{" "}
                {quien(a.userId) ? (
                  <span>
                    {quien(a.userId)!.callsign} ({quien(a.userId)!.nombre || quien(a.userId)!.email})
                  </span>
                ) : (
                  <code>{a.userId.slice(0, 8)}…</code>
                )}{" "}
                <small style={{ color: "#9aa8bb" }}>{new Date(a.createdAt).toLocaleString("es-MX")}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
