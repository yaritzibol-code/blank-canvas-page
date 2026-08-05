/**
 * Landing dedicada a precios.
 *
 * Es el destino de todos los candados de la app: cuando una estudiante con
 * plan Básica intenta usar Yaris con IA, más cuestionarios o cualquier función
 * Pro, el popup de suscripción la trae aquí. Vive fuera del dashboard (misma
 * nav y pie que la landing) para que también funcione como página pública que
 * se puede compartir y posicionar.
 *
 * Los importes que se muestran salen de `@/lib/pricing` (respaldo) y, cuando
 * hay conexión, de Stripe: el cobro real siempre lo resuelve el `lookup_key`.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav, Footer, SectionHead, Btn, Pill, Icon, PlaneField } from "@/routes/index";
import { useSessionUser } from "@/lib/store";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import {
  getPublicPricing,
  getPublicSetupPricing,
  getPublicAnnualPricing,
} from "@/lib/payments.functions";
import {
  PRO_ANNUAL_FALLBACK,
  PRO_MONTHLY_FALLBACK,
  PRO_SETUP_FALLBACK,
  PRO_SETUP_LIST_PRICE,
  formatPrice,
  type PlanPrice,
} from "@/lib/pricing";

const TITLE = "Precios de FlightPath — Básica gratis y Pro desde $500 MXN";
const DESC =
  "Compara FlightPath Básica (gratis) contra Pro: banco completo, simuladores ilimitados, Yaris con IA y todos los módulos. Mensual o anual, cancela cuando quieras.";

const FAQS = [
  {
    q: "¿Qué incluye el plan Básica?",
    a: "Crear tu cuenta es gratis y sin tarjeta: tienes una muestra del banco de preguntas por materia, un simulador al mes, la bitácora de estudio y una parte de la biblioteca. Yaris responde con la explicación oficial del curso, pero sin conversación con IA.",
  },
  {
    q: "¿Qué desbloquea FlightPath Pro?",
    a: "Todo el banco de preguntas (CIAAC y Línea Aérea: ATP, Jeppesen y Handbook), simuladores y cuestionarios ilimitados, Yaris con IA conversacional, análisis por materia, biblioteca completa y los módulos nuevos conforme se liberan.",
  },
  {
    q: "¿Por qué hay un pago de inscripción?",
    a: "La inscripción es un pago único que cubre la activación de tu cuenta y el acceso al material del curso. Después eliges cómo continuar: mensualidad o anualidad.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Cancelas desde tu panel de facturación en un clic y conservas el acceso hasta el final del periodo que ya pagaste. No hay penalizaciones ni permanencia.",
  },
  {
    q: "¿Puedo cambiar de mensual a anual?",
    a: "Sí, desde Facturación puedes cambiar de plan cuando quieras: se cobra la diferencia proporcional y el cambio se aplica de inmediato.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Tarjetas de crédito y débito a través de Stripe, con cobro en pesos mexicanos y factura disponible desde tu panel de facturación.",
  },
];

const COMPARE: Array<{ label: string; basica: string | boolean; pro: string | boolean }> = [
  { label: "Banco de preguntas CIAAC", basica: "Muestra por materia", pro: "Completo" },
  { label: "Bancos de Línea Aérea (ATP · Jeppesen · Handbook)", basica: false, pro: "Completo por capítulos" },
  { label: "Cuestionarios de práctica", basica: "Limitados", pro: "Ilimitados" },
  { label: "Simulador de examen", basica: "1 al mes", pro: "Ilimitados" },
  { label: "Yaris con IA conversacional", basica: false, pro: true },
  { label: "Explicación oficial de cada pregunta", basica: true, pro: true },
  { label: "Análisis de desempeño por materia", basica: "Básico", pro: "Completo" },
  { label: "Biblioteca y manuales", basica: "Parcial", pro: "Completa" },
  { label: "Recordatorios de estudio por WhatsApp", basica: false, pro: true },
  { label: "Módulos nuevos conforme se liberan", basica: false, pro: true },
];

export const Route = createFileRoute("/precios")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreciosPage,
});

function PreciosPage() {
  const user = useSessionUser();
  const [ciclo, setCiclo] = useState<"mensual" | "anual">("anual");
  const [monthly, setMonthly] = useState<PlanPrice>(PRO_MONTHLY_FALLBACK);
  const [annual, setAnnual] = useState<PlanPrice>(PRO_ANNUAL_FALLBACK);
  const [setup, setSetup] = useState<PlanPrice>(PRO_SETUP_FALLBACK);

  useEffect(() => {
    if (!isPaymentsConfigured()) return;
    let cancelled = false;
    void (async () => {
      try {
        const environment = getStripeEnvironment();
        const [m, s, a] = await Promise.all([
          getPublicPricing({ data: { environment } }),
          getPublicSetupPricing({ data: { environment } }),
          getPublicAnnualPricing({ data: { environment } }),
        ]);
        if (cancelled) return;
        if (m) setMonthly(m);
        if (s) setSetup(s);
        if (a) setAnnual(a);
      } catch {
        /* se queda el respaldo de @/lib/pricing */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const anual = ciclo === "anual";
  const doceMeses = monthly.amount * 12;
  const ahorroPct = doceMeses > 0 ? Math.max(0, Math.round(((doceMeses - annual.amount) / doceMeses) * 100)) : 0;
  const precioPro = anual ? annual : monthly;
  const periodo = anual ? "/ año" : "/ mes";
  const equivalente = anual ? Math.round(annual.amount / 12) : monthly.amount;

  /** A dónde manda el botón de compra según haya sesión o no, conservando el
   *  ciclo elegido para que el checkout abra exactamente el plan mostrado. */
  const plan = anual ? "anual" : "mensual";
  const buyTo = user ? "/dashboard/planes" : "/register";
  const buySearch: Record<string, unknown> = user
    ? { checkout: 1, plan }
    : { next: `/dashboard/planes?checkout=1&plan=${plan}` };


  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-bone text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-28 lg:pt-36 pb-14">
        <PlaneField count={22} />
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
          <SectionHead
            center
            eyebrow="Precios"
            title={
              <>
                Empieza gratis. <span className="text-coral-600">Vuela Pro.</span>
              </>
            }
            sub="Un solo plan de pago, sin letras chiquitas: acceso completo al banco, simuladores ilimitados y Yaris con IA. Cancela cuando quieras."
          />

          {/* Interruptor mensual / anual */}
          <div className="mt-10 flex justify-center">
            <div
              role="group"
              aria-label="Periodicidad del plan Pro"
              className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1 shadow-card"
            >
              {(["mensual", "anual"] as const).map((c) => {
                const on = ciclo === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCiclo(c)}
                    aria-pressed={on}
                    className={`min-h-11 rounded-full px-5 text-[14px] font-semibold transition-all ${
                      on ? "bg-ink text-white shadow-navy" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    {c === "mensual" ? "Mensual" : `Anual · ahorra ${ahorroPct}%`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Tarjetas ──────────────────────────────────────── */}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {/* Básica */}
            <div className="rounded-3xl border border-ink/8 bg-white p-8 shadow-card lg:p-10">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-haze-500">FlightPath Básica</div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-6xl tracking-tight text-ink">$0</span>
                <span className="text-sm text-ink/45">MXN</span>
              </div>
              <p className="mt-3 text-[14px] text-ink/55">
                Para conocer la plataforma: una muestra del banco, un simulador al mes y tu bitácora de estudio.
              </p>
              <Btn kind="light" size="lg" icon="arrow" className="mt-7 w-full" to={user ? "/dashboard" : "/register"}>
                {user ? "Ir a mi dashboard" : "Crear cuenta gratis"}
              </Btn>
              <ul className="mt-8 space-y-3">
                {[
                  "Muestra del banco por materia",
                  "1 simulador al mes",
                  "Explicación oficial de cada pregunta",
                  "Bitácora y recordatorios básicos",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Icon n="check" className="mt-0.5 h-4 w-4 shrink-0 text-haze-400" sw={2.2} />
                    <span className="text-[14px] text-ink/65">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 shadow-navy lg:p-10">
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full"
                style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.22), transparent)" }}
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-400">
                    FlightPath Pro {anual ? "Anual" : "Mensual"}
                  </div>
                  <Pill tone="light">{anual ? "Más recomendado" : "Acceso completo"}</Pill>
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-6xl tracking-tight text-white">
                    ${precioPro.amount.toLocaleString("es-MX")}
                  </span>
                  <span className="text-sm text-white/50">
                    {precioPro.currency} {periodo}
                  </span>
                </div>
                <div className="mt-2 text-[13px] text-white/60">
                  {anual ? (
                    <>
                      Equivale a ${equivalente.toLocaleString("es-MX")} {annual.currency} al mes · ahorras{" "}
                      <b className="text-coral-300">{ahorroPct}%</b> frente al mensual
                    </>
                  ) : (
                    <>
                      Con el anual pagas ${annual.amount.toLocaleString("es-MX")} {annual.currency} y ahorras{" "}
                      <b className="text-coral-300">{ahorroPct}%</b>
                    </>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-white/12 bg-white/5 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Inscripción · pago único
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-display text-2xl text-white">{formatPrice(setup)}</span>
                    {setup.amount < PRO_SETUP_LIST_PRICE && (
                      <span className="text-[13px] text-white/40 line-through">
                        ${PRO_SETUP_LIST_PRICE.toLocaleString("es-MX")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
                    Se cobra una sola vez junto con tu primer periodo y activa tu acceso al material del curso.
                  </p>
                </div>

                <Btn kind="primary" size="lg" icon="arrow" className="mt-6 w-full" to={buyTo} search={buySearch}>
                  {user ? "Suscribirme a Pro" : "Empezar con Pro"}
                </Btn>
                <p className="mt-3 text-center text-[12px] text-white/45">
                  Pago seguro con Stripe · cancela cuando quieras
                </p>

                <ul className="mt-7 space-y-3">
                  {[
                    "Banco completo: CIAAC, ATP, Jeppesen y Handbook",
                    "Cuestionarios y simuladores ilimitados",
                    "Yaris con IA: te explica y te acompaña",
                    "Análisis de desempeño por materia",
                    "Biblioteca y manuales completos",
                    "Módulos nuevos conforme se liberan",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Icon n="check" className="mt-0.5 h-4 w-4 shrink-0 text-coral-400" sw={2.2} />
                      <span className="text-[14px] text-white/80">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparativa ──────────────────────────────────────── */}
      <section className="relative py-16 lg:py-24">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
          <SectionHead
            center
            eyebrow="Comparativa"
            title={
              <>
                Qué cambia al <span className="text-coral-600">volar Pro</span>
              </>
            }
          />
          <div className="mt-10 overflow-x-auto rounded-3xl border border-ink/8 bg-white shadow-card">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">Comparación de funciones entre el plan Básica y el plan Pro</caption>
              <thead>
                <tr className="border-b border-ink/8">
                  <th scope="col" className="px-5 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-haze-500">
                    Función
                  </th>
                  <th scope="col" className="px-5 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-haze-500">
                    Básica
                  </th>
                  <th scope="col" className="px-5 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-coral-700">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label} className="border-b border-ink/5 last:border-0">
                    <th scope="row" className="px-5 py-4 text-[14px] font-medium text-ink/75">
                      {row.label}
                    </th>
                    <td className="px-5 py-4 text-[14px] text-ink/55">
                      <Cell value={row.basica} />
                    </td>
                    <td className="px-5 py-4 text-[14px] font-semibold text-ink">
                      <Cell value={row.pro} pro />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="relative py-16 lg:py-24">
        <PlaneField count={16} />
        <div className="mx-auto max-w-[880px] px-6 lg:px-8">
          <SectionHead center eyebrow="Preguntas" title={<>Dudas frecuentes de pago</>} />
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-ink/8 bg-white px-5 py-4 shadow-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink">
                  {f.q}
                  <Icon n="arrow" className="h-4 w-4 shrink-0 text-coral-600 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-ink px-8 py-14 text-center shadow-navy lg:px-16">
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(242,174,188,0.18), transparent)" }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl leading-tight text-white lg:text-[42px]">
                Tu examen no espera. <span className="text-coral-400">Tú tampoco deberías.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/60">
                Desbloquea el banco completo, los simuladores ilimitados y a Yaris con IA hoy mismo.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Btn kind="primary" size="lg" icon="arrow" to={buyTo} search={buySearch}>
                  {user ? "Suscribirme a Pro" : "Empezar con Pro"}
                </Btn>
                <Btn kind="outlineLight" size="lg" to={user ? "/dashboard" : "/register"}>
                  {user ? "Seguir en Básica" : "Crear cuenta gratis"}
                </Btn>
              </div>
              <p className="mt-5 text-[12.5px] text-white/40">
                ¿Dudas antes de pagar?{" "}
                <Link to="/faq" className="underline underline-offset-4 hover:text-white/70">
                  Revisa las preguntas frecuentes
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** Celda de la comparativa: palomita, guion o texto. */
function Cell({ value, pro = false }: { value: string | boolean; pro?: boolean }) {
  if (value === true)
    return (
      <span className="inline-flex items-center gap-1.5">
        <Icon n="check" className={`h-4 w-4 ${pro ? "text-coral-600" : "text-haze-400"}`} sw={2.2} />
        <span className="sr-only">Incluido</span>
      </span>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden="true" className="text-ink/25">
          —
        </span>
        <span className="sr-only">No incluido</span>
      </>
    );
  return <>{value}</>;
}
