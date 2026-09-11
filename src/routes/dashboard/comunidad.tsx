/**
 * Comunidad — rankings de FlightPoints.
 *
 * Sólo dos pestañas: Rankings y Yo. Los cinco rankings y sus valores vienen del
 * servidor; aquí no se calcula ni un punto. La privacidad es real: quien no
 * publica su nombre aparece con su folio de FlightPath.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser } from "@/lib/store";
import { getComunidad, getFlightPoints, setCommunityPrefs } from "@/lib/fp/fp.functions";
import { sincronizarFP } from "@/lib/fp/client";
import {
  FP_PERIODOS,
  FP_RANKINGS,
  FP_ACTIVITY_LABEL,
  fpFormat,
  type FpPeriodo,
  type FpRankingId,
  type FpRankingRow,
  type FpResumen,
} from "@/lib/fp/shared";

export const Route = createFileRoute("/dashboard/comunidad")({
  component: ComunidadPage,
  head: () => ({
    meta: [
      { title: "Comunidad FlightPath — Rankings de FlightPoints" },
      {
        name: "description",
        content:
          "Compara tu avance con la comunidad FlightPath: FlightPoints totales, CIAAC, Línea Aérea, rachas y logros.",
      },
      { property: "og:title", content: "Comunidad FlightPath" },
      { property: "og:description", content: "Rankings de FlightPoints de la comunidad FlightPath." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const CARD: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(61,93,145,.14)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(15,30,60,.06)",
};

function Fila({ r, metric }: { r: FpRankingRow; metric: FpRankingId }) {
  const unidad = metric === "racha" ? "días" : metric === "logros" ? "logros" : "FP";
  const medalla = ["#F2D27A", "#C9D3E0", "#D9A273"][r.posicion - 1];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 12,
        background: r.esYo ? "rgba(61,93,145,.1)" : "transparent",
        border: r.esYo ? "1px solid rgba(61,93,145,.25)" : "1px solid transparent",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: medalla ?? "rgba(61,93,145,.12)",
          color: medalla ? "#22375C" : "#3D5D91",
          fontWeight: 800,
          fontSize: ".8rem",
          flexShrink: 0,
        }}
      >
        {r.posicion}
      </span>
      <span style={{ flex: 1, fontWeight: r.esYo ? 800 : 600, fontSize: ".9rem", color: "#22375C" }}>
        {r.display}
      </span>
      <span style={{ fontWeight: 800, color: "#3D5D91", fontSize: ".9rem" }}>
        {fpFormat(r.valor)} <small style={{ opacity: 0.6, fontWeight: 600 }}>{unidad}</small>
      </span>
    </div>
  );
}

function ComunidadPage() {
  const user = useSessionUser();
  const [tab, setTab] = useState<"rankings" | "yo">("rankings");
  const [metric, setMetric] = useState<FpRankingId>("general");
  const [periodo, setPeriodo] = useState<FpPeriodo>("semana");
  const [top, setTop] = useState<FpRankingRow[]>([]);
  const [yo, setYo] = useState<FpRankingRow[]>([]);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [resumen, setResumen] = useState<FpResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tutorial, setTutorial] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getComunidad({ data: { metric, periodo } });
      setTop(r.top);
      setYo(r.yo);
      setTotalParticipantes(r.total);
    } finally {
      setCargando(false);
    }
  }, [metric, periodo]);

  useEffect(() => {
    if (!user) return;
    void sincronizarFP(true).then(() => {
      void getFlightPoints().then((r) => {
        setResumen(r);
        if (!r.tutorialVisto && !r.tutorialOculto) setTutorial(true);
      });
    });
  }, [user?.id]);

  useEffect(() => {
    if (user) void cargar();
  }, [user?.id, cargar]);

  const cerrarTutorial = async (noMostrar: boolean) => {
    setTutorial(false);
    await setCommunityPrefs({ data: { tutorialVisto: true, tutorialOculto: noMostrar } });
  };

  const cambiarPrivacidad = async (p: "nombre" | "folio") => {
    setResumen((r) => (r ? { ...r, privacidad: p } : r));
    await setCommunityPrefs({ data: { privacidad: p } });
    void cargar();
  };

  const rankingActual = FP_RANKINGS.find((r) => r.id === metric)!;
  const soloHistorico = metric === "racha" || metric === "logros";

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <header style={{ ...CARD, background: "linear-gradient(135deg,#12315C,#22375C)", color: "white", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Icon n="trophy" size={26} color="#F2D27A" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: "1.35rem" }}>Comunidad</h1>
            <p style={{ margin: "4px 0 0", opacity: 0.82, fontSize: ".86rem" }}>
              Tus FlightPoints salen de tu actividad real en FlightPath.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#F2D27A" }}>
              {fpFormat(resumen?.total ?? 0)}
            </div>
            <div style={{ fontSize: ".72rem", opacity: 0.8 }}>FlightPoints totales</div>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", gap: 8 }}>
        {(["rankings", "yo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: ".85rem",
              background: tab === t ? "#22375C" : "rgba(61,93,145,.1)",
              color: tab === t ? "white" : "#3D5D91",
            }}
          >
            {t === "rankings" ? "Rankings" : "Yo"}
          </button>
        ))}
      </div>

      {tab === "rankings" && (
        <div style={CARD}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {FP_RANKINGS.map((r) => (
              <button
                key={r.id}
                onClick={() => setMetric(r.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(61,93,145,.2)",
                  cursor: "pointer",
                  fontSize: ".78rem",
                  fontWeight: 700,
                  background: metric === r.id ? "#3D5D91" : "white",
                  color: metric === r.id ? "white" : "#3D5D91",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {!soloHistorico && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {FP_PERIODOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: ".76rem",
                    fontWeight: 700,
                    background: periodo === p.id ? "rgba(61,93,145,.16)" : "transparent",
                    color: "#3D5D91",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <p style={{ margin: "0 0 10px", fontSize: ".78rem", color: "#6b7a90" }}>
            {rankingActual.ayuda} · {totalParticipantes} participantes
          </p>

          {cargando ? (
            <p style={{ fontSize: ".85rem", color: "#6b7a90" }}>Cargando ranking…</p>
          ) : top.length === 0 ? (
            <p style={{ fontSize: ".85rem", color: "#6b7a90" }}>
              Todavía no hay actividad suficiente en este ranking.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 4 }}>
              {top.map((r) => (
                <Fila key={r.userId} r={r} metric={metric} />
              ))}
              {yo.length > 0 && (
                <>
                  <div style={{ textAlign: "center", color: "#9aa8bb", fontSize: ".8rem" }}>···</div>
                  {yo.map((r) => (
                    <Fila key={r.userId} r={r} metric={metric} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "yo" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ ...CARD, display: "grid", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: "1rem", color: "#22375C" }}>Mi resumen</h2>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {[
                { l: "Total", v: resumen?.total ?? 0 },
                { l: "Este mes", v: resumen?.mes ?? 0 },
                { l: "Esta semana", v: resumen?.semana ?? 0 },
                { l: "Racha actual", v: resumen?.rachaActual ?? 0 },
                { l: "Logros", v: resumen?.logros ?? 0 },
              ].map((k) => (
                <div key={k.l}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#3D5D91" }}>{fpFormat(k.v)}</div>
                  <div style={{ fontSize: ".72rem", color: "#6b7a90" }}>{k.l}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: ".78rem", color: "#6b7a90" }}>
              Tu folio en la comunidad: <strong>{resumen?.folio ?? "—"}</strong>
            </p>
          </div>

          <div style={{ ...CARD, display: "grid", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: "1rem", color: "#22375C" }}>Cómo aparezco</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {(["folio", "nombre"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => void cambiarPrivacidad(p)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(61,93,145,.2)",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: ".8rem",
                    background: resumen?.privacidad === p ? "#3D5D91" : "white",
                    color: resumen?.privacidad === p ? "white" : "#3D5D91",
                  }}
                >
                  {p === "folio" ? "Sólo mi folio" : "Mi nombre"}
                </button>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: ".76rem", color: "#6b7a90" }}>
              Nadie ve tu correo ni tu actividad detallada: sólo el valor del ranking.
            </p>
          </div>

          <div style={{ ...CARD, display: "grid", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: "1rem", color: "#22375C" }}>De dónde vienen mis FP</h2>
            {(resumen?.porActividad ?? []).length === 0 ? (
              <p style={{ margin: 0, fontSize: ".84rem", color: "#6b7a90" }}>Todavía no tienes FlightPoints.</p>
            ) : (
              (resumen?.porActividad ?? []).map((a) => (
                <div key={a.tipo} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem" }}>
                  <span style={{ color: "#22375C" }}>{FP_ACTIVITY_LABEL[a.tipo] ?? a.tipo}</span>
                  <strong style={{ color: "#3D5D91" }}>{fpFormat(a.fp)} FP</strong>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tutorial && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5000,
            background: "rgba(12,24,45,.55)",
            display: "grid",
            placeItems: "center",
            padding: 18,
          }}
          onClick={() => void cerrarTutorial(false)}
        >
          <div style={{ ...CARD, maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: "#22375C", fontSize: "1.1rem" }}>¿Qué son los FlightPoints?</h2>
            <p style={{ fontSize: ".88rem", color: "#41526b" }}>
              Son puntos que ganas al estudiar de verdad: completar Learning Paths y materiales, resolver
              cuestionarios, repasar flashcards, estudiar con Pathy, sostener tu racha y desbloquear logros.
            </p>
            <p style={{ fontSize: ".88rem", color: "#41526b" }}>
              No hay niveles ni compras: es un reflejo de tu constancia. Puedes aparecer con tu nombre o sólo con
              tu folio.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => void cerrarTutorial(true)}
                style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(61,93,145,.25)", background: "white", color: "#3D5D91", cursor: "pointer", fontWeight: 700, fontSize: ".82rem" }}
              >
                No volver a mostrar
              </button>
              <button
                onClick={() => void cerrarTutorial(false)}
                style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "#22375C", color: "white", cursor: "pointer", fontWeight: 700, fontSize: ".82rem" }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
