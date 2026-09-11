/**
 * Comunidad — reconocimiento y progreso dentro de FlightPath.
 *
 * Sólo dos pestañas: Rankings y Yo. Los cinco rankings y sus valores vienen del
 * servidor; aquí no se calcula ni un punto. La privacidad es real: quien no
 * publica su nombre aparece con su folio de FlightPath. Las cuentas
 * administrativas pueden ver todo, pero no participan (se excluyen en la RPC).
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { useSessionUser } from "@/lib/store";
import {
  getComunidad,
  getFlightPoints,
  getMisPosiciones,
  setCommunityPrefs,
} from "@/lib/fp/fp.functions";
import { sincronizarFP } from "@/lib/fp/client";
import { CARD, Fila, TarjetaRanking, tinte } from "@/components/comunidad/pieces";
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
      { title: "Comunidad FlightPath — Los alumnos que están destacando" },
      {
        name: "description",
        content:
          "Conoce a los alumnos que están destacando en FlightPath: Top General, CIAAC, Línea Aérea, racha más larga y más logros.",
      },
      { property: "og:title", content: "Comunidad FlightPath" },
      {
        property: "og:description",
        content: "Aquí reconocemos a quienes están dando lo mejor de sí en FlightPath.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const TITULO_PERIODO: Record<FpPeriodo, string> = {
  semana: "Los Tops de esta semana",
  mes: "Los Tops de este mes",
  historico: "Los Tops históricos",
};

/** Orden fijo del desglose de FlightPoints en la pestaña "Yo". */
const ORDEN_DESGLOSE = [
  "learning_path",
  "cuestionario",
  "flashcards",
  "material",
  "pathy",
  "racha",
  "logro",
];

function ComunidadPage() {
  const user = useSessionUser();
  const [tab, setTab] = useState<"rankings" | "yo">("rankings");
  const [metric, setMetric] = useState<FpRankingId>("general");
  const [periodo, setPeriodo] = useState<FpPeriodo>("semana");
  const [top, setTop] = useState<FpRankingRow[]>([]);
  const [yo, setYo] = useState<FpRankingRow[]>([]);
  const [miPosicion, setMiPosicion] = useState<number | null>(null);
  const [faltan, setFaltan] = useState<number | null>(null);
  const [posicionArriba, setPosicionArriba] = useState<number | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [resumen, setResumen] = useState<FpResumen | null>(null);
  const [posiciones, setPosiciones] = useState<
    { metric: string; posicion: number | null; valor: number; total: number; faltan: number | null }[]
  >([]);
  const [cargando, setCargando] = useState(true);
  const [tutorial, setTutorial] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getComunidad({ data: { metric, periodo } });
      setTop(r.top);
      setYo(r.yo);
      setMiPosicion(r.miPosicion);
      setFaltan(r.faltan);
      setPosicionArriba(r.posicionArriba);
      setEsAdmin(r.esAdmin);
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

  useEffect(() => {
    if (!user || tab !== "yo") return;
    void getMisPosiciones({ data: { periodo } }).then((r) => {
      setPosiciones(r.posiciones);
      setEsAdmin(r.esAdmin);
    });
  }, [user?.id, tab, periodo]);

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

  const desglose = ORDEN_DESGLOSE.map((tipo) => ({
    tipo,
    fp: (resumen?.porActividad ?? []).find((a) => a.tipo === tipo)?.fp ?? 0,
  }));

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Encabezado: reconocimiento, no estadísticas. */}
      <header
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          padding: "26px 22px",
          color: "white",
          background: "linear-gradient(135deg,#0E2749 0%,#22375C 55%,#33507F 100%)",
          boxShadow: "0 16px 40px rgba(12,28,58,.24)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -30,
            top: -20,
            opacity: 0.12,
            transform: "rotate(-16deg)",
          }}
        >
          <Icon n="plane" size={170} color="#F2D27A" />
        </div>
        <div style={{ position: "relative", maxWidth: 620 }}>
          <h1 style={{ margin: 0, fontSize: "1.7rem", letterSpacing: "-.01em" }}>Comunidad</h1>
          <p style={{ margin: "8px 0 0", fontSize: "1rem", fontWeight: 600, color: "#F2D27A" }}>
            Aquí reconocemos a quienes están dando lo mejor de sí.
          </p>
          <p style={{ margin: "6px 0 0", fontSize: ".9rem", opacity: 0.85, lineHeight: 1.5 }}>
            Conoce a los alumnos que están destacando en FlightPath y descubre hasta dónde puedes llegar.
          </p>
        </div>
      </header>

      <div style={{ display: "flex", gap: 8 }}>
        {(["rankings", "yo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 20px",
              borderRadius: 999,
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

      {esAdmin && (
        <p
          style={{
            margin: 0,
            fontSize: ".78rem",
            color: "#6b7a90",
            background: "rgba(61,93,145,.07)",
            borderRadius: 10,
            padding: "8px 12px",
          }}
        >
          Tu cuenta administrativa puede ver toda la Comunidad, pero no participa en los rankings.
        </p>
      )}

      {tab === "rankings" && (
        <>
          <div>
            <h2 style={{ margin: "0 0 2px", fontSize: "1.25rem", color: "#22375C", letterSpacing: "-.01em" }}>
              {TITULO_PERIODO[rankingActual.usaFp ? periodo : "historico"]}
            </h2>
            <p style={{ margin: 0, fontSize: ".82rem", color: "#6b7a90" }}>
              Constancia, preparación y avance real dentro de FlightPath.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            {FP_RANKINGS.map((r) => (
              <TarjetaRanking
                key={r.id}
                label={r.label}
                ayuda={r.ayuda}
                icono={r.icono}
                acento={r.acento}
                activo={metric === r.id}
                onClick={() => setMetric(r.id)}
              />
            ))}
          </div>

          <div style={{ ...CARD, borderTop: `3px solid ${rankingActual.acento}` }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 170 }}>
                <Icon n={rankingActual.icono as never} size={18} color={rankingActual.acento} />
                <strong style={{ color: "#22375C", fontSize: "1rem" }}>{rankingActual.label}</strong>
              </span>

              {rankingActual.usaFp && (
                <div
                  role="tablist"
                  aria-label="Periodo"
                  style={{
                    display: "inline-flex",
                    gap: 2,
                    background: "rgba(61,93,145,.08)",
                    borderRadius: 999,
                    padding: 3,
                  }}
                >
                  {FP_PERIODOS.map((p) => (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={periodo === p.id}
                      onClick={() => setPeriodo(p.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        border: "none",
                        cursor: "pointer",
                        fontSize: ".76rem",
                        fontWeight: 700,
                        background: periodo === p.id ? "white" : "transparent",
                        color: periodo === p.id ? "#22375C" : "#6b7a90",
                        boxShadow: periodo === p.id ? "0 2px 6px rgba(15,30,60,.12)" : "none",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {cargando ? (
              <p style={{ fontSize: ".85rem", color: "#6b7a90" }}>Cargando ranking…</p>
            ) : top.length === 0 ? (
              <p style={{ fontSize: ".85rem", color: "#6b7a90" }}>
                Todavía no hay actividad suficiente en este ranking.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {top.map((r) => (
                  <Fila key={r.userId} r={r} unidad={rankingActual.unidad} acento={rankingActual.acento} destacar />
                ))}

                {yo.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px dashed rgba(61,93,145,.22)",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: ".76rem", color: "#6b7a90", fontWeight: 700 }}>
                      Tu zona del ranking (sólo tú la ves)
                    </p>
                    {yo.map((r) => (
                      <Fila key={r.userId} r={r} unidad={rankingActual.unidad} acento={rankingActual.acento} />
                    ))}
                    {rankingActual.usaFp && faltan !== null && posicionArriba !== null && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: ".82rem",
                          fontWeight: 700,
                          color: rankingActual.acento,
                          background: tinte(rankingActual.acento, 0.08),
                          borderRadius: 10,
                          padding: "8px 12px",
                        }}
                      >
                        Te faltan {fpFormat(faltan)} FP para alcanzar al #{posicionArriba}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "yo" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              ...CARD,
              display: "grid",
              gap: 14,
              background: "linear-gradient(135deg, rgba(61,93,145,.07), white)",
            }}
          >
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#22375C" }}>
                  {miPosicion ? `#${miPosicion}` : "—"}
                </div>
                <div style={{ fontSize: ".74rem", color: "#6b7a90" }}>Tu posición ({rankingActual.label})</div>
              </div>
              <div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#3D5D91" }}>
                  {fpFormat(resumen?.total ?? 0)}
                </div>
                <div style={{ fontSize: ".74rem", color: "#6b7a90" }}>Tus FlightPoints</div>
              </div>
              <div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#C9A227" }}>
                  {faltan !== null ? `${fpFormat(faltan)} FP` : "—"}
                </div>
                <div style={{ fontSize: ".74rem", color: "#6b7a90" }}>
                  {faltan !== null && posicionArriba !== null
                    ? `Próximo objetivo: alcanzar al #${posicionArriba}`
                    : "Próximo objetivo"}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: ".78rem", color: "#6b7a90" }}>
              Tu folio en la comunidad: <strong>{resumen?.folio ?? "—"}</strong>
            </p>
          </div>

          <div style={{ ...CARD, display: "grid", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: "1rem", color: "#22375C" }}>Tu posición en cada ranking</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {FP_RANKINGS.map((r) => {
                const p = posiciones.find((x) => x.metric === r.id);
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: tinte(r.acento, 0.06),
                      border: `1px solid ${tinte(r.acento, 0.18)}`,
                    }}
                  >
                    <Icon n={r.icono as never} size={16} color={r.acento} />
                    <span style={{ flex: 1, fontSize: ".88rem", fontWeight: 700, color: "#22375C" }}>{r.label}</span>
                    <span style={{ fontSize: ".84rem", color: "#6b7a90" }}>
                      {fpFormat(p?.valor ?? 0)} {r.unidad}
                    </span>
                    <strong style={{ fontSize: ".9rem", color: r.acento, minWidth: 48, textAlign: "right" }}>
                      {p?.posicion ? `#${p.posicion}` : "—"}
                    </strong>
                  </div>
                );
              })}
            </div>
            {esAdmin && (
              <p style={{ margin: 0, fontSize: ".76rem", color: "#6b7a90" }}>
                Como cuenta administrativa no apareces en los rankings de alumnos.
              </p>
            )}
          </div>

          <div style={{ ...CARD, display: "grid", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: "1rem", color: "#22375C" }}>Desglose de tus FlightPoints</h2>
            {desglose.map((a) => (
              <div
                key={a.tipo}
                style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", padding: "2px 0" }}
              >
                <span style={{ color: "#41526b" }}>{FP_ACTIVITY_LABEL[a.tipo] ?? a.tipo}</span>
                <strong style={{ color: "#3D5D91" }}>{fpFormat(a.fp)} FP</strong>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: ".95rem",
                paddingTop: 8,
                borderTop: "1px solid rgba(61,93,145,.14)",
              }}
            >
              <strong style={{ color: "#22375C" }}>Total</strong>
              <strong style={{ color: "#22375C" }}>{fpFormat(resumen?.total ?? 0)} FP</strong>
            </div>
          </div>

          <div style={{ ...CARD, display: "grid", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: "1rem", color: "#22375C" }}>Cómo aparezco</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
              Son puntos que salen de tu actividad real: completar Learning Paths y materiales, resolver
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
