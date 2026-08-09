/**
 * Página de gracias post-compra.
 *
 * Es la URL de conversión que se declara en Google Ads
 * (`https://flightpath.mx/gracias`): estable, sin parámetros obligatorios y
 * sólo alcanzable cuando el pago quedó confirmado en `/checkout/return`.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { PlaneField } from "@/components/shared/PlaneField";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { PathyBubble } from "@/components/landing/shared";
import { trackPurchase } from "@/lib/ads";
import { PRO_ANNUAL_FALLBACK, PRO_MONTHLY_FALLBACK, PRO_SETUP_FALLBACK } from "@/lib/pricing";

export const Route = createFileRoute("/gracias")({
  validateSearch: (search: Record<string, unknown>): { plan?: "mensual" | "anual"; session_id?: string } => ({
    ...(search.plan === "anual" || search.plan === "mensual" ? { plan: search.plan } : {}),
    ...(typeof search.session_id === "string" ? { session_id: search.session_id } : {}),
  }),
  head: () => ({
    meta: [
      { title: "¡Bienvenido a bordo! — FlightPath Pro" },
      { name: "description", content: "Tu acceso a FlightPath Pro está activo. Empieza a prepararte para tu examen de línea aérea." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "¡Bienvenido a bordo! — FlightPath Pro" },
      { property: "og:description", content: "Tu acceso a FlightPath Pro está activo." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: GraciasPage,
});

const FONT = "'Manrope', system-ui, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Manrope', sans-serif";
const INK = "#22375C";
const BRAND = "#6C0820";

const PASOS = [
  {
    n: "01",
    titulo: "Completa tu perfil",
    copy: "Tu nombre, escuela y WhatsApp para que los recordatorios lleguen a tiempo.",
    to: "/dashboard/perfil" as const,
    cta: "Ir a mi perfil",
  },
  {
    n: "02",
    titulo: "Haz tu primer cuestionario",
    copy: "CIAAC o Línea Aérea: elige materia y capítulo, sin límite de preguntas.",
    to: "/dashboard/linea-aerea" as const,
    cta: "Empezar a practicar",
  },
  {
    n: "03",
    titulo: "Pregúntale a Yaris",
    copy: "Tu tutora de IA te explica cualquier pregunta con el contexto del curso.",
    to: "/dashboard" as const,
    cta: "Conocer a Yaris",
  },
];

function GraciasPage() {
  const { plan, session_id } = Route.useSearch();
  const anual = plan === "anual";
  const recurrente = anual ? PRO_ANNUAL_FALLBACK : PRO_MONTHLY_FALLBACK;
  const valor = recurrente.amount + PRO_SETUP_FALLBACK.amount;

  useEffect(() => {
    trackPurchase({ value: valor, currency: recurrente.currency, transactionId: session_id });
  }, [valor, recurrente.currency, session_id]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg,#F7F9FC 0%,#FFFFFF 55%,#F7F9FC 100%)",
        fontFamily: FONT,
      }}
    >
      <PlaneField count={12} color="34,55,92" />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1080,
          margin: "0 auto",
          padding: "clamp(28px,7vw,72px) clamp(18px,5vw,32px) clamp(56px,10vw,96px)",
        }}
      >
        {/* Héroe */}
        <section style={{ textAlign: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#EAF7F0",
              border: "1px solid #BFE7D2",
              color: "#1F7A4D",
              borderRadius: 999,
              padding: "7px 15px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            <span aria-hidden="true">✓</span> Pago confirmado
          </span>

          <h1
            style={{
              fontFamily: DISPLAY,
              color: INK,
              fontSize: "clamp(2.1rem,7vw,3.8rem)",
              lineHeight: 1.03,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "18px 0 0",
            }}
          >
            Bienvenido a bordo.
          </h1>
          <p
            style={{
              color: "#5B6B86",
              fontSize: "clamp(15px,2.2vw,18px)",
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "14px auto 0",
            }}
          >
            Tu acceso a <strong style={{ color: INK }}>FlightPath Pro {anual ? "anual" : "mensual"}</strong> ya está
            activo. Pathy y Yaris te acompañan desde aquí hasta tu examen.
          </p>

          {/* Pathy y Yaris */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "clamp(4px,3vw,28px)",
              margin: "clamp(14px,4vw,26px) 0 clamp(18px,4vw,30px)",
            }}
          >
            <PathyBubble size={168} />
            <div style={{ paddingBottom: 12, textAlign: "center" }}>
              <YarisAvatar size={92} />
              <div style={{ fontSize: 12, fontWeight: 800, color: "#8DA1BE", letterSpacing: ".08em", marginTop: 8, textTransform: "uppercase" }}>
                Yaris
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link
              to="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 52,
                padding: "0 26px",
                borderRadius: 14,
                background: BRAND,
                color: "#fff",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 15,
                boxShadow: "0 12px 28px rgba(108,8,32,.22)",
              }}
            >
              Entrar a mi dashboard →
            </Link>
            <Link
              to="/dashboard/linea-aerea"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 52,
                padding: "0 26px",
                borderRadius: 14,
                background: "#fff",
                border: "1px solid #DCE5F1",
                color: INK,
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              Ver Línea Aérea
            </Link>
          </div>
        </section>

        {/* Resumen del plan */}
        <section
          style={{
            marginTop: "clamp(32px,6vw,56px)",
            background: "#fff",
            border: "1px solid #E3EAF5",
            borderRadius: 20,
            padding: "clamp(18px,3vw,26px)",
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            boxShadow: "0 18px 46px rgba(34,55,92,.06)",
          }}
        >
          <Dato etiqueta="Plan" valor={`Pro ${anual ? "anual" : "mensual"}`} />
          <Dato
            etiqueta={anual ? "Cobro anual" : "Cobro mensual"}
            valor={`$${recurrente.amount.toLocaleString("es-MX")} ${recurrente.currency}`}
          />
          <Dato
            etiqueta="Inscripción (única)"
            valor={`$${PRO_SETUP_FALLBACK.amount.toLocaleString("es-MX")} ${PRO_SETUP_FALLBACK.currency}`}
          />
          <Dato etiqueta="Estado" valor="Activo" tono="#1F7A4D" />
        </section>

        {/* Siguientes pasos */}
        <section style={{ marginTop: "clamp(34px,6vw,60px)" }}>
          <h2
            style={{
              fontFamily: DISPLAY,
              color: INK,
              fontSize: "clamp(1.4rem,3.6vw,2rem)",
              fontWeight: 800,
              textAlign: "center",
              margin: "0 0 6px",
            }}
          >
            Tus primeros tres movimientos
          </h2>
          <p style={{ textAlign: "center", color: "#8DA1BE", fontSize: 14, margin: "0 0 24px" }}>
            Checklist previo al despegue.
          </p>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {PASOS.map((p) => (
              <div
                key={p.n}
                style={{
                  background: "#fff",
                  border: "1px solid #E3EAF5",
                  borderRadius: 18,
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: BRAND, fontWeight: 700, letterSpacing: ".14em" }}>
                  {p.n}
                </span>
                <div style={{ fontFamily: DISPLAY, fontSize: "1.12rem", fontWeight: 800, color: INK }}>{p.titulo}</div>
                <p style={{ color: "#5B6B86", fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{p.copy}</p>
                <Link
                  to={p.to}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: 44,
                    color: BRAND,
                    fontWeight: 800,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <p style={{ marginTop: 36, textAlign: "center", color: "#8DA1BE", fontSize: 13 }}>
          Recibirás tu comprobante por correo. Puedes ver y descargar tus facturas en{" "}
          <Link to="/dashboard/facturacion" style={{ color: INK, fontWeight: 700 }}>
            Facturación
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

function Dato({ etiqueta, valor, tono = INK }: { etiqueta: string; valor: string; tono?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#8DA1BE", marginBottom: 6 }}>
        {etiqueta}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: "1.35rem", fontWeight: 800, color: tono }}>{valor}</div>
    </div>
  );
}
