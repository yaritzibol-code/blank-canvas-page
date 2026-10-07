/**
 * Popup de conversión para alumnos en plan gratis (reglas en `@/lib/oferta-pro`).
 *
 * Una vez al día pregunta al servidor si toca el popup del 20%. Si lo rechaza
 * la primera vez, abre la oferta relámpago de siempre (50%, 10 minutos); si lo
 * rechaza la segunda, pregunta brevemente por qué no quiere Pro. Espera a que
 * no haya otro diálogo abierto y no interrumpe pagos, COMPASS ni la RTARI.
 */
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import { trackMilestone } from "@/lib/activity-tracker";
import { adoptFlashOffer } from "@/lib/flash-offer";
import {
  MOTIVOS_RECHAZO,
  OFERTA_PRO_PCT,
  diaLocal,
  precioConOferta,
  type IntentoOferta,
  type MotivoRechazo,
} from "@/lib/oferta-pro";
import {
  guardarMotivoOfertaPro,
  responderOfertaPro,
  revisarOfertaPro,
} from "@/lib/oferta-pro.functions";
import { getPublicPricing, getPublicSetupPricing, startFlashOffer } from "@/lib/payments.functions";
import {
  BENEFICIOS_PRO,
  PRO_MONTHLY_FALLBACK,
  PRO_SETUP_FALLBACK,
  formatPriceWithInterval,
  type PlanPrice,
} from "@/lib/pricing";
import { generoDe, isPaid, listo, useSessionUser } from "@/lib/store";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

const BRAND = "#7A5C1E";
const GOLD = "#C7A052";
const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";

/** Pantallas donde nunca se interrumpe: pago, facturación y prácticas en curso. */
const RUTAS_SIN_POPUP = /^\/dashboard\/(planes|facturacion|compass|rtari)(\/|$)/;
/** Ya se preguntó hoy en esta pestaña: el servidor no tendría nada nuevo. */
const REVISADA_KEY = "fp_oferta_pro_revisada";

function hayOtroDialogo(): boolean {
  const abiertos = document.querySelectorAll<HTMLElement>(
    'dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]',
  );
  return [...abiertos].some(
    (el) => !el.closest(".fp-oferta-pro") && el.getClientRects().length > 0,
  );
}

function yaRevisada(marca: string): boolean {
  try {
    return sessionStorage.getItem(REVISADA_KEY) === marca;
  } catch {
    return false;
  }
}

function marcarRevisada(marca: string) {
  try {
    sessionStorage.setItem(REVISADA_KEY, marca);
  } catch {
    /* noop */
  }
}

const mxn = (n: number) => `$${n.toLocaleString("es-MX")}`;

type Fase = "oferta" | "motivo" | "gracias";

export function OfertaProWatcher() {
  const user = useSessionUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [intento, setIntento] = useState<IntentoOferta | null>(null);
  const [fase, setFase] = useState<Fase | null>(null);
  const [libre, setLibre] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [setup, setSetup] = useState<PlanPrice>(PRO_SETUP_FALLBACK);
  const [mensual, setMensual] = useState<PlanPrice>(PRO_MONTHLY_FALLBACK);
  const [motivo, setMotivo] = useState<MotivoRechazo | null>(null);
  const [detalle, setDetalle] = useState("");
  const revisando = useRef(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const candidato = !!user && user.role !== "admin" && !isPaid(user);
  const rutaLibre = !RUTAS_SIN_POPUP.test(pathname);
  const userId = user?.id;

  // Una consulta por día y pestaña, unos segundos después de entrar.
  useEffect(() => {
    if (!candidato || !rutaLibre || !userId || revisando.current) return;
    const marca = `${userId}:${diaLocal(Date.now())}`;
    if (yaRevisada(marca)) return;
    const t = setTimeout(() => {
      revisando.current = true;
      void revisarOfertaPro()
        .then((r) => {
          marcarRevisada(marca);
          if (r.intento) {
            setIntento(r.intento);
            setFase("oferta");
          }
        })
        .catch(() => {
          revisando.current = false;
        });
    }, 2500);
    return () => clearTimeout(t);
  }, [candidato, rutaLibre, userId]);

  // Espera su turno: no se encima a la bienvenida, transmisiones ni otras ofertas.
  const pendiente = fase !== null && !libre;
  useEffect(() => {
    if (!pendiente) return;
    const revisar = () =>
      !RUTAS_SIN_POPUP.test(window.location.pathname) && !hayOtroDialogo() && setLibre(true);
    revisar();
    const id = setInterval(revisar, 2000);
    return () => clearInterval(id);
  }, [pendiente]);

  const visible = fase !== null && libre && intento !== null;
  const mostrandoOferta = visible && fase === "oferta";

  useEffect(() => {
    if (!mostrandoOferta || !intento) return;
    trackMilestone(`oferta_pro_${intento}_vista`);
    ctaRef.current?.focus();
    if (!isPaymentsConfigured()) return;
    let cancelado = false;
    const environment = getStripeEnvironment();
    void Promise.all([
      getPublicSetupPricing({ data: { environment } }),
      getPublicPricing({ data: { environment } }),
    ])
      .then(([s, m]) => {
        if (cancelado) return;
        if (s) setSetup(s);
        if (m) setMensual(m);
      })
      .catch(() => undefined);
    return () => {
      cancelado = true;
    };
  }, [mostrandoOferta, intento]);

  const cerrar = () => {
    setFase(null);
    setLibre(false);
  };

  async function aceptar() {
    if (!intento || ocupado) return;
    setOcupado(true);
    trackMilestone(`oferta_pro_${intento}_aceptada`);
    await responderOfertaPro({ data: { intento, respuesta: "acepto" } }).catch(() => undefined);
    cerrar();
    setOcupado(false);
    void navigate({ to: "/dashboard/planes", search: { checkout: 1, oferta: 20 } as never });
  }

  async function rechazar() {
    if (!intento || ocupado) return;
    setOcupado(true);
    trackMilestone(`oferta_pro_${intento}_rechazada`);
    // En orden: las dos llamadas reescriben el perfil y en paralelo una pisaría a la otra.
    await responderOfertaPro({ data: { intento, respuesta: "rechazo" } }).catch(() => undefined);
    if (intento === 2) {
      setOcupado(false);
      setFase("motivo");
      return;
    }
    cerrar();
    setOcupado(false);
    // Primer rechazo: la oferta relámpago de siempre (50%), sólo 10 minutos.
    try {
      const r = await startFlashOffer({ data: { origen: "rechazo_oferta" } });
      if ("expiresAt" in r) adoptFlashOffer(r.expiresAt);
    } catch {
      /* sin relámpago: la oferta del 20% sigue vigente desde planes */
    }
  }

  async function enviarMotivo() {
    if (!motivo || ocupado) return;
    setOcupado(true);
    const texto = motivo === "otro" ? detalle.trim().slice(0, 280) : "";
    trackMilestone(`oferta_pro_motivo_${motivo}`, texto ? { detalle: texto } : undefined);
    await guardarMotivoOfertaPro({ data: { motivo, ...(texto ? { detalle: texto } : {}) } }).catch(
      () => undefined,
    );
    setOcupado(false);
    setFase("gracias");
  }

  // Escape equivale a "No, gracias" en la oferta y a cerrar en la encuesta.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (fase === "oferta") void rechazar();
      else cerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!visible) return null;

  const nombre = user?.nombre?.trim().split(/\s+/)[0] ?? "";
  const conDescuento = precioConOferta(setup.amount);

  return (
    <div
      className="fp-oferta-pro"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fp-oferta-pro-titulo"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        background: "rgba(3,8,15,0.84)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        fontFamily: FONT,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(560px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "linear-gradient(180deg,#071326 0%,#050F22 100%)",
          borderRadius: 8,
          padding: "clamp(24px, 5vw, 36px) clamp(18px, 4vw, 30px)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
          border: "1px solid rgba(199,160,82,0.35)",
          color: "#fff",
        }}
      >
        <button
          onClick={() => (fase === "oferta" ? void rechazar() : cerrar())}
          aria-label="Cerrar"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}
        >
          <Icon n="close" size={18} />
        </button>

        {fase === "oferta" && (
          <>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "1.4px",
                  color: GOLD,
                  textTransform: "uppercase",
                }}
              >
                {intento === 1 ? "Regalo para ti" : "Te guardamos tu descuento"}
              </div>
              <h2
                id="fp-oferta-pro-titulo"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
                  margin: "10px 0 8px",
                  lineHeight: 1.12,
                }}
              >
                {nombre ? `${nombre}, desbloquea` : "Desbloquea"} todo FlightPath Pro con{" "}
                {OFERTA_PRO_PCT}% de descuento
              </h2>
              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.95rem",
                  lineHeight: 1.45,
                }}
              >
                Ya viste cómo funciona la versión gratis. Con Pro tienes todo el banco, simuladores
                ilimitados y a Yaris con IA para llegar {listo(generoDe(user))} a tu examen.
              </p>
            </div>

            <div
              style={{
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "1.2px",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                FlightPath Pro · Inscripción
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "1.1rem",
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "line-through",
                  }}
                >
                  {mxn(setup.amount)}
                </span>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: "clamp(2.4rem, 9vw, 3rem)",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {mxn(conDescuento)}
                </span>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                  {setup.currency}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#A31637",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                >
                  {OFERTA_PRO_PCT}% menos
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>
                Más tu plan de {formatPriceWithInterval(mensual)} o el anual.
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "14px 0 0",
                  display: "grid",
                  gap: 9,
                }}
              >
                {BENEFICIOS_PRO.map((b) => (
                  <li key={b} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span
                      aria-hidden="true"
                      style={{ color: GOLD, fontWeight: 900, lineHeight: 1.35 }}
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(255,255,255,0.8)",
                        lineHeight: 1.35,
                      }}
                    >
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                margin: "14px 0",
                fontSize: "0.8rem",
                color: GOLD,
                fontWeight: 700,
              }}
            >
              <Icon n="timer" size={14} />
              Tu descuento es válido por 24 horas
            </div>

            <button
              ref={ctaRef}
              onClick={() => void aceptar()}
              disabled={ocupado}
              style={{
                width: "100%",
                minHeight: 58,
                borderRadius: 14,
                border: "none",
                background: `linear-gradient(90deg, ${BRAND}, #A31637)`,
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.05rem",
                cursor: ocupado ? "wait" : "pointer",
              }}
            >
              Quiero mi {OFERTA_PRO_PCT}% de descuento
            </button>
            <button
              onClick={() => void rechazar()}
              disabled={ocupado}
              style={{
                marginTop: 8,
                minHeight: 44,
                width: "100%",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.88rem",
                cursor: ocupado ? "wait" : "pointer",
                fontFamily: FONT,
              }}
            >
              No, gracias, sigo con la versión gratis
            </button>
          </>
        )}

        {fase === "motivo" && (
          <>
            <h2
              id="fp-oferta-pro-titulo"
              style={{
                fontFamily: DISPLAY,
                fontSize: "1.5rem",
                margin: "4px 40px 6px 0",
                lineHeight: 1.2,
              }}
            >
              ¿Por qué no quieres FlightPath Pro por ahora?
            </h2>
            <p style={{ margin: "0 0 16px", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
              Es una pregunta rápida y nos ayuda a mejorar.
            </p>
            <div role="radiogroup" aria-label="Motivo" style={{ display: "grid", gap: 8 }}>
              {MOTIVOS_RECHAZO.map((m) => {
                const activo = motivo === m.id;
                return (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setMotivo(m.id)}
                    style={{
                      minHeight: 46,
                      padding: "10px 14px",
                      textAlign: "left",
                      borderRadius: 10,
                      border: `1.5px solid ${activo ? GOLD : "rgba(255,255,255,0.14)"}`,
                      background: activo ? "rgba(199,160,82,0.14)" : "rgba(255,255,255,0.04)",
                      color: "#fff",
                      fontFamily: FONT,
                      fontSize: "0.92rem",
                      fontWeight: activo ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
            {motivo === "otro" && (
              <textarea
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                maxLength={280}
                rows={3}
                aria-label="Cuéntanos tu motivo"
                placeholder="Cuéntanos brevemente (opcional)"
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontFamily: FONT,
                  fontSize: "0.9rem",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            )}
            <button
              onClick={() => void enviarMotivo()}
              disabled={!motivo || ocupado}
              style={{
                width: "100%",
                minHeight: 52,
                marginTop: 16,
                borderRadius: 12,
                border: "none",
                background: motivo
                  ? `linear-gradient(90deg, ${BRAND}, ${GOLD})`
                  : "rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: !motivo ? "not-allowed" : ocupado ? "wait" : "pointer",
              }}
            >
              Enviar
            </button>
            <button
              onClick={cerrar}
              style={{
                marginTop: 8,
                minHeight: 44,
                width: "100%",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.86rem",
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Prefiero no responder
            </button>
          </>
        )}

        {fase === "gracias" && (
          <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div style={{ color: GOLD, display: "flex", justifyContent: "center" }}>
              <Icon n="checkCircle" size={44} />
            </div>
            <h2
              id="fp-oferta-pro-titulo"
              style={{ fontFamily: DISPLAY, fontSize: "1.5rem", margin: "12px 0 6px" }}
            >
              ¡Gracias por contarnos!
            </h2>
            <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.65)", fontSize: "0.92rem" }}>
              Lo tomamos en cuenta para mejorar FlightPath. Sigue estudiando con la versión gratis.
            </p>
            <button
              onClick={cerrar}
              style={{
                width: "100%",
                minHeight: 50,
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(90deg, ${BRAND}, ${GOLD})`,
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Seguir estudiando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
