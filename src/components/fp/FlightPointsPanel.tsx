/**
 * Bloque de FlightPoints en Mi perfil: indicativo de Comunidad, total,
 * desglose, últimos movimientos e historial completo con filtro. Todo viene
 * del servidor.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/fp-icon";
import { Callsign, Insignia } from "@/components/comunidad/pieces";
import { getFlightPoints, getFlightPointsHistory } from "@/lib/fp/fp.functions";
import { sincronizarFP } from "@/lib/fp/client";
import { FP_ACTIVITY_LABEL, fpFormat, type FpResumen, type FpTx } from "@/lib/fp/shared";

const CARD: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(61,93,145,.14)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(15,30,60,.06)",
};

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export function FlightPointsPanel() {
  const [resumen, setResumen] = useState<FpResumen | null>(null);
  const [historial, setHistorial] = useState<FpTx[] | null>(null);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    void sincronizarFP().then(() => getFlightPoints().then(setResumen).catch(() => setResumen(null)));
  }, []);

  useEffect(() => {
    if (historial === null) return;
    void getFlightPointsHistory({ data: { tipo: filtro } }).then(setHistorial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const tipos = ["todos", ...new Set((resumen?.porActividad ?? []).map((a) => a.tipo))];
  const anonimo = (resumen?.privacidad ?? "folio") !== "nombre";

  return (
    <section style={{ ...CARD, display: "grid", gap: 14, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Icon n="spark" size={20} color="#6C0820" />
        <h2 style={{ margin: 0, fontSize: "1.05rem", color: "#22375C", flex: 1 }}>FlightPoints</h2>
        <Link
          to="/dashboard/comunidad"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".8rem", fontWeight: 700, color: "#3D5D91" }}
        >
          Ver Comunidad <Icon n="arrow" size={13} />
        </Link>
      </div>

      {/* Indicativo de Comunidad: es como aparece quien no publica su nombre. */}
      {resumen?.callsign && (
        <div
          className="cm-root"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(61,93,145,.07), rgba(242,174,188,.12))",
            border: "1px solid rgba(61,93,145,.12)",
            flexWrap: "wrap",
          }}
        >
          <Insignia callsign={resumen.callsign} size={40} />
          <div style={{ flex: 1, minWidth: 180, display: "grid", gap: 2 }}>
            <span style={{ fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "#647DA0", fontFamily: "'JetBrains Mono', monospace" }}>
              Tu indicativo en Comunidad
            </span>
            <strong style={{ color: "#22375C", fontSize: ".98rem", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              <Callsign texto={resumen.callsign} />
            </strong>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 11px",
              borderRadius: 999,
              fontSize: ".72rem",
              fontWeight: 700,
              background: anonimo ? "rgba(61,93,145,.1)" : "rgba(108,8,32,.08)",
              color: anonimo ? "#3D5D91" : "#6C0820",
            }}
          >
            <Icon n={anonimo ? "eyeOff" : "eye"} size={13} />
            {anonimo ? "Apareces anónimo" : "Apareces con tu nombre"}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { l: "Total", v: resumen?.total ?? 0 },
          { l: "Este mes", v: resumen?.mes ?? 0 },
          { l: "Esta semana", v: resumen?.semana ?? 0 },
        ].map((k) => (
          <div key={k.l}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#3D5D91" }}>{fpFormat(k.v)}</div>
            <div style={{ fontSize: ".72rem", color: "#6b7a90" }}>{k.l}</div>
          </div>
        ))}
      </div>

      {(resumen?.porActividad ?? []).length > 0 && (
        <div style={{ display: "grid", gap: 6 }}>
          {(resumen?.porActividad ?? []).map((a) => (
            <div key={a.tipo} style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem" }}>
              <span style={{ color: "#22375C" }}>
                {FP_ACTIVITY_LABEL[a.tipo] ?? a.tipo} <small style={{ color: "#9aa8bb" }}>({a.n})</small>
              </span>
              <strong style={{ color: "#3D5D91" }}>{fpFormat(a.fp)} FP</strong>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gap: 6 }}>
        <h3 style={{ margin: 0, fontSize: ".85rem", color: "#6b7a90", textTransform: "uppercase", letterSpacing: ".04em" }}>
          Últimos movimientos
        </h3>
        {(resumen?.recientes ?? []).length === 0 ? (
          <p style={{ margin: 0, fontSize: ".84rem", color: "#6b7a90" }}>
            Estudia un rato y aquí verás tus primeros FlightPoints.
          </p>
        ) : (
          (resumen?.recientes ?? []).map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: ".82rem" }}>
              <span style={{ color: "#22375C" }}>
                {t.activity_label}
                {t.detail ? <small style={{ color: "#9aa8bb" }}> · {t.detail}</small> : null}
              </span>
              <span style={{ whiteSpace: "nowrap", color: "#6b7a90" }}>
                {fecha(t.occurred_at)} <strong style={{ color: "#3D5D91" }}>+{t.amount}</strong>
              </span>
            </div>
          ))
        )}
      </div>

      {historial === null ? (
        <button
          onClick={() => void getFlightPointsHistory({ data: { tipo: "todos" } }).then(setHistorial)}
          style={{ justifySelf: "start", padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(61,93,145,.25)", background: "white", color: "#3D5D91", fontWeight: 700, fontSize: ".82rem", cursor: "pointer" }}
        >
          Ver historial completo
        </button>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tipos.map((t) => (
              <button
                key={t}
                onClick={() => setFiltro(t)}
                style={{
                  padding: "5px 11px",
                  borderRadius: 999,
                  border: "1px solid rgba(61,93,145,.2)",
                  cursor: "pointer",
                  fontSize: ".74rem",
                  fontWeight: 700,
                  background: filtro === t ? "#3D5D91" : "white",
                  color: filtro === t ? "white" : "#3D5D91",
                }}
              >
                {t === "todos" ? "Todo" : (FP_ACTIVITY_LABEL[t] ?? t)}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto", display: "grid", gap: 6 }}>
            {historial.map((t) => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: ".8rem", opacity: t.status === "procesada" ? 1 : 0.5 }}>
                <span style={{ color: "#22375C" }}>
                  {t.activity_label}
                  {t.detail ? <small style={{ color: "#9aa8bb" }}> · {t.detail}</small> : null}
                </span>
                <span style={{ whiteSpace: "nowrap", color: "#6b7a90" }}>
                  {fecha(t.occurred_at)} <strong style={{ color: t.amount < 0 ? "#b03030" : "#3D5D91" }}>{t.amount > 0 ? "+" : ""}{t.amount}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
