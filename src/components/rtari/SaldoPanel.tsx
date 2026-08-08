/**
 * Saldo de minutos de entrevista y compra de más.
 *
 * La entrevista se mide en minutos porque así se cobra el audio: una sesión de
 * tres minutos y una de veinte no cuestan lo mismo. La pantalla separa los dos
 * bolsillos —los incluidos del ciclo, que se reinician cada mes, y los
 * comprados, que no vencen— porque son promesas distintas y el alumno tiene
 * derecho a saber cuál se está gastando.
 */
import { Icon } from "@/components/ui/fp-icon";
import {
  RTARI_MINUTOS_INCLUIDOS_PRO,
  RTARI_PAQUETES,
  type RtariPaqueteDef,
} from "@/modules/rtari/config";
import type { RtariSaldoInfo } from "@/lib/rtari-client";

const NAVY = "#22375C";
const CORAL = "#6C0820";
const CREAM = "#FBFAF7";
const HAZE = "#647DA0";
const ROSE = "#F2AEBC";
const SALMON = "#F2DCDB";
const SERIF = "'Instrument Serif', serif";
const MONO = "'JetBrains Mono', monospace";

const min = (segundos: number) => Math.floor(segundos / 60);

export function SaldoPanel({
  saldo,
  cargando,
  comprando,
  onComprar,
  destacarCompra,
}: {
  saldo: RtariSaldoInfo | null;
  cargando: boolean;
  /** `lookupKey` del paquete en curso, si se está abriendo un pago. */
  comprando: string | null;
  onComprar: (paquete: RtariPaqueteDef) => void;
  /** Resalta la compra cuando el alumno se quedó sin minutos. */
  destacarCompra?: boolean;
}) {
  const ilimitado = saldo?.ilimitado === true;
  const incluidos = saldo ? min(saldo.incluidosRestantes) : 0;
  const incluidosTotales = saldo ? min(saldo.incluidosTotales) : RTARI_MINUTOS_INCLUIDOS_PRO;
  const comprados = saldo ? min(saldo.comprados) : 0;
  const total = incluidos + comprados;
  const pct = ilimitado
    ? 100
    : incluidosTotales > 0
      ? Math.min(100, (incluidos / incluidosTotales) * 100)
      : 0;

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${destacarCompra ? ROSE : `${NAVY}14`}`,
        borderRadius: 22,
        padding: "22px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: `${NAVY}66`,
            }}
          >
            Tus minutos de entrevista
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "2.6rem",
              lineHeight: 1.1,
              color: !ilimitado && total === 0 ? CORAL : NAVY,
            }}
          >
            {cargando ? "…" : ilimitado ? "Sin límite" : `${total} min`}
          </div>
          <div style={{ fontSize: "0.8rem", color: HAZE, marginTop: 2 }}>
            {cargando
              ? "Consultando tu saldo…"
              : ilimitado
                ? "Cuenta de administración: no gastas minutos, pero el costo sí se registra."
                : comprados > 0
                  ? `${incluidos} de tu plan este mes · ${comprados} comprados`
                  : `${incluidos} de los ${incluidosTotales} incluidos este mes`}
          </div>
        </div>

        <div style={{ textAlign: "right", maxWidth: 260 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: HAZE,
              lineHeight: 1.7,
            }}
          >
            {ilimitado ? "Acceso de administración" : "Sólo se cobran los minutos que hablas"}
          </div>
          <div style={{ fontSize: "0.76rem", color: HAZE, marginTop: 4, lineHeight: 1.5 }}>
            {ilimitado
              ? "Puedes probar el módulo sin tope. Tu consumo aparece en Operaciones como el de cualquier otra llamada."
              : "Los minutos del plan se renuevan cada mes y no se acumulan. Los que compras no vencen."}
          </div>
        </div>
      </div>

      {/* Barra de los incluidos del ciclo */}
      <div style={{ marginTop: 16, height: 6, background: SALMON, borderRadius: 999 }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: pct > 20 ? NAVY : CORAL,
            borderRadius: 999,
            transition: "width .4s ease",
          }}
        />
      </div>

      {destacarCompra && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: "#FFF1F2",
            border: `1px solid ${ROSE}`,
            borderRadius: 14,
            padding: "12px 16px",
            color: CORAL,
            fontSize: "0.86rem",
            lineHeight: 1.5,
          }}
        >
          <span style={{ display: "flex", paddingTop: 2 }}>
            <Icon n="alert" size={16} />
          </span>
          <span>
            Te quedaste sin minutos este ciclo. Compra un paquete para seguir practicando hoy, o
            espera a que se renueven tus {incluidosTotales} minutos del plan.
          </span>
        </div>
      )}

      {/* Paquetes — a quien no gasta minutos no se le ofrece comprarlos. */}
      <div style={{ marginTop: 20, display: ilimitado ? "none" : undefined }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.58rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: `${NAVY}66`,
            marginBottom: 10,
          }}
        >
          Comprar más minutos
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 10,
          }}
        >
          {RTARI_PAQUETES.map((p) => {
            const enCurso = comprando === p.lookupKey;
            const bloqueado = comprando !== null && !enCurso;
            return (
              <button
                key={p.lookupKey}
                onClick={() => onComprar(p)}
                disabled={bloqueado || enCurso}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: `1px solid ${p.destacado ? CORAL : `${NAVY}18`}`,
                  background: p.destacado ? CREAM : "white",
                  cursor: bloqueado || enCurso ? "wait" : "pointer",
                  opacity: bloqueado ? 0.5 : 1,
                  fontFamily: "inherit",
                  position: "relative",
                }}
              >
                {p.destacado && (
                  <span
                    style={{
                      position: "absolute",
                      top: -9,
                      right: 12,
                      background: CORAL,
                      color: "white",
                      fontFamily: MONO,
                      fontSize: "0.52rem",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 999,
                    }}
                  >
                    El más pedido
                  </span>
                )}
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: NAVY }}>{p.nombre}</div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "1.5rem",
                    color: CORAL,
                    lineHeight: 1.2,
                  }}
                >
                  ${p.precioMXN} MXN
                </div>
                <div style={{ fontSize: "0.72rem", color: HAZE, marginTop: 2 }}>
                  {enCurso
                    ? "Abriendo el pago…"
                    : `≈ ${Math.round(p.minutos / 10)} entrevistas de 10 min`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
