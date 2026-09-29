/**
 * Landing de conversión para tráfico pagado (Meta Ads y similares).
 *
 * A diferencia del home, aquí hay una sola meta: suscribirse a Pro. Sin menú
 * de navegación ni enlaces que saquen a la persona de la página; el único
 * camino alterno es la cuenta gratis, que sigue siendo un registro medible.
 * `noindex`: la versión que posiciona en buscadores es `/`.
 *
 * El CTA lleva al registro y de ahí directo al checkout embebido de Stripe
 * (`/dashboard/planes?checkout=1&plan=…`). Los `fbclid`/UTM del anuncio los
 * guarda `useMetaPixel` y viajan hasta el webhook para atribuir la compra.
 *
 * Compliance (COMPLIANCE.md): sólo cifras propias verificables, cero
 * testimonios inventados y aviso de no afiliación visible.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Btn,
  Eyebrow,
  Icon,
  Logo,
  PathyBubble,
  Pill,
  PlaneField,
  SectionHead,
  type IconName,
} from "@/components/landing/shared";
import { useSessionUser } from "@/lib/store";
import { SIM_TOTAL_QS } from "@/lib/store/materias";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import {
  getPublicAnnualPricing,
  getPublicPricing,
  getPublicSetupPricing,
} from "@/lib/payments.functions";
import { metaTrack } from "@/lib/meta";
import {
  PRO_ANNUAL_FALLBACK,
  PRO_MONTHLY_FALLBACK,
  PRO_SETUP_FALLBACK,
  PRO_SETUP_LIST_PRICE,
  formatPrice,
  type PlanPrice,
} from "@/lib/pricing";

const TITLE = "FlightPath Pro — Prepárate para tu examen de piloto con un plan";
const DESC =
  "Banco propio de 2,800+ preguntas con explicación, simulacros cronometrados y Yaris, tutora con IA. Para el CIAAC y convocatorias de línea aérea. Cancela cuando quieras.";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://flightpath.mx/landing" },
    ],
    links: [{ rel: "canonical", href: "https://flightpath.mx/" }],
  }),
  component: LandingPage,
});

/* ───────────────────────── Contenido ───────────────────────── */

const PRUEBAS = [
  { n: "2,800+", t: "preguntas con explicación" },
  { n: String(SIM_TOTAL_QS), t: "preguntas por simulacro" },
  { n: "12", t: "materias del temario" },
  { n: "100+", t: "manuales en la biblioteca" },
];

const DOLORES: { icon: IconName; t: string; d: string }[] = [
  {
    icon: "doc",
    t: "PDFs sueltos y guías de hace años",
    d: "Horas buscando material sin saber si está vigente ni si cubre todo el temario.",
  },
  {
    icon: "target",
    t: "No sabes si ya estás preparado",
    d: "Sin un simulacro con reloj, el día del examen es la primera vez que te mides de verdad.",
  },
  {
    icon: "chat",
    t: "Dudas a las 11 de la noche",
    d: "Fallas una pregunta, no entiendes por qué y no hay nadie a quién preguntarle.",
  },
];

const PASOS = [
  {
    n: "01",
    t: "Activa tu acceso",
    d: "Creas tu cuenta y pagas en un par de minutos. Entras al banco completo de inmediato.",
  },
  {
    n: "02",
    t: "Haz tu diagnóstico",
    d: "Un simulacro cronometrado te muestra en qué materias vas fuerte y dónde se te va el puntaje.",
  },
  {
    n: "03",
    t: "Practica lo que te falta",
    d: "Cuestionarios por materia y capítulo, con Yaris explicándote cada error hasta dominarlo.",
  },
];

const INCLUYE: { icon: IconName; t: string; d: string }[] = [
  {
    icon: "book",
    t: "Banco completo CIAAC y Línea Aérea",
    d: "2,800+ preguntas con explicación, más ATP, Jeppesen y Handbook por capítulos.",
  },
  {
    icon: "sim",
    t: "Simulacros ilimitados con reloj",
    d: `${SIM_TOTAL_QS} preguntas cronometradas para medir tu ritmo antes del día real.`,
  },
  {
    icon: "spark",
    t: "Yaris, tu tutora con IA",
    d: "Te explica por qué fallaste, con el contexto del curso, a cualquier hora.",
  },
  {
    icon: "chart",
    t: "Análisis por materia",
    d: "Ves tu avance y tus puntos débiles para estudiar sólo lo que te falta.",
  },
  {
    icon: "library",
    t: "Biblioteca de 100+ manuales",
    d: "Todo el material de consulta en un solo lugar, desde el celular o la compu.",
  },
  {
    icon: "bell",
    t: "Recordatorios por WhatsApp",
    d: "Pathy te avisa cuándo toca estudiar para que no pierdas tu racha.",
  },
];

const COMPARA = [
  {
    k: "Material",
    solo: "PDFs dispersos y guías viejas",
    fp: "Banco organizado por materia y capítulo",
  },
  {
    k: "¿Ya estás listo?",
    solo: "Lo descubres el día del examen",
    fp: "Simulacros con reloj y análisis por materia",
  },
  { k: "Dudas", solo: "Foros y grupos de WhatsApp", fp: "Yaris te explica cada pregunta" },
  {
    k: "Constancia",
    solo: "Depende sólo de tu fuerza de voluntad",
    fp: "Recordatorios y racha de estudio",
  },
];

const FAQS = [
  {
    q: "¿Me sirve para el CIAAC y para convocatorias de línea aérea?",
    a: "Sí. Pro incluye el banco CIAAC y los bancos de Línea Aérea (ATP, Jeppesen y Handbook) por capítulos, además de simulacros cronometrados y análisis por materia.",
  },
  {
    q: "¿Es material oficial?",
    a: "No. FlightPath es una plataforma independiente: su banco de más de 2,800 preguntas es propio, desarrollado de forma independiente y mapeado al temario oficial publicado. No está afiliada a la AFAC, al CIAAC ni a ninguna aerolínea.",
  },
  {
    q: "Tengo poco tiempo, ¿vale la pena?",
    a: "Justo para eso está el análisis por materia: en lugar de repasar todo, practicas donde pierdes puntos. Sesiones cortas desde el celular también cuentan.",
  },
  {
    q: "¿Puedo probar antes de pagar?",
    a: "Sí. La cuenta Básica es gratis y sin tarjeta: tienes una muestra del banco por materia, un simulador al mes y tu bitácora de estudio.",
  },
  {
    q: "¿Por qué hay un pago de inscripción?",
    a: "La inscripción es un pago único que cubre la activación de tu cuenta y el acceso al material del curso. Después eliges cómo continuar: mensualidad o anualidad.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Cancelas desde tu panel de facturación en un clic y conservas el acceso hasta el final del periodo que ya pagaste. Sin penalizaciones ni permanencia.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Tarjetas de crédito y débito a través de Stripe, con cobro en pesos mexicanos y factura disponible desde tu panel.",
  },
];

/* ───────────────────────── Página ───────────────────────── */

type Ciclo = "mensual" | "anual";

/** Precios vivos de Stripe con respaldo en `@/lib/pricing` (igual que /precios). */
function usePublicPricing() {
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

  return { monthly, annual, setup };
}

function LandingPage() {
  const user = useSessionUser();
  const { monthly, annual, setup } = usePublicPricing();
  const [ciclo, setCiclo] = useState<Ciclo>("anual");
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    metaTrack("ViewContent", { content_name: "FlightPath Pro", content_category: "landing" });
  }, []);

  // Barra fija de CTA en móvil en cuanto el héroe sale de pantalla.
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Con sesión, directo al checkout; sin ella, registro y luego checkout del mismo plan. */
  const buy = {
    to: user ? "/dashboard/planes" : "/register",
    search: user
      ? { checkout: 1, plan: ciclo }
      : { next: `/dashboard/planes?checkout=1&plan=${ciclo}` },
  };
  const ctaLabel = user ? "Activar mi acceso Pro" : "Quiero mi acceso Pro";

  return (
    <div className="min-h-screen bg-ink-50 text-ink">
      <LandingHeader buy={buy} />

      <main>
        <Hero buy={buy} ctaLabel={ctaLabel} />
        <ProofBar />
        <Dolores />
        <ComoFunciona />
        <Incluye />
        <Comparativa />
        <Oferta
          ciclo={ciclo}
          setCiclo={setCiclo}
          monthly={monthly}
          annual={annual}
          setup={setup}
          buy={buy}
          ctaLabel={ctaLabel}
        />
        <Faq />
        <CtaFinal buy={buy} ctaLabel={ctaLabel} />
      </main>

      <LandingFooter />

      {/* CTA fijo en móvil: el botón siempre a un pulgar de distancia. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${
          sticky ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!sticky}
      >
        <Btn
          kind="primary"
          size="lg"
          icon="arrow"
          className="w-full"
          to={buy.to}
          search={buy.search}
        >
          {ctaLabel}
        </Btn>
      </div>
    </div>
  );
}

type Buy = { to: string; search: Record<string, unknown> };

/* ───────────────────────── Secciones ───────────────────────── */

function LandingHeader({ buy }: { buy: Buy }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo size={30} />
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden min-h-11 items-center px-3 text-[14px] font-semibold text-ink/60 hover:text-ink sm:inline-flex"
          >
            Entrar
          </Link>
          <Btn kind="navy" size="sm" to={buy.to} search={buy.search}>
            Empezar
          </Btn>
        </div>
      </div>
    </header>
  );
}

function Hero({ buy, ctaLabel }: { buy: Buy; ctaLabel: string }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 lg:pt-36 lg:pb-20">
      <PlaneField count={18} />
      <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <Pill tone="coral">CIAAC · Convocatorias de línea aérea</Pill>
          <h1 className="font-display mt-6 text-[40px] leading-[1.02] tracking-tight text-ink sm:text-5xl lg:text-[60px]">
            Deja de estudiar a ciegas.{" "}
            <span className="text-coral-600">Llega a tu examen con un plan.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/60 lg:text-[18px]">
            Un banco propio de <b className="text-ink">2,800+ preguntas con explicación</b>,
            simulacros cronometrados de {SIM_TOTAL_QS} preguntas y{" "}
            <b className="text-ink">Yaris, tu tutora con IA</b>, te muestran qué dominas y qué te
            falta, materia por materia.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Btn kind="primary" size="lg" icon="arrow" to={buy.to} search={buy.search}>
              {ctaLabel}
            </Btn>
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center justify-center px-2 text-[14px] font-semibold text-ink/60 underline-offset-4 hover:text-ink hover:underline"
            >
              o crea tu cuenta gratis
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink/55">
            {["Acceso inmediato", "Pago seguro con Stripe", "Cancela cuando quieras"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Icon n="check" className="h-4 w-4 text-coral-600" sw={2.4} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <HeroMock />
      </div>
    </section>
  );
}

/** Vista ilustrativa del producto: una pregunta explicada y un análisis de ejemplo. */
function HeroMock() {
  const opciones = ["Disminuye", "Permanece igual", "Aumenta", "Depende sólo del peso"];
  const barras = [
    { m: "Aerodinámica", v: 91 },
    { m: "Meteorología", v: 82 },
    { m: "Navegación", v: 64 },
    { m: "Legislación", v: 48 },
  ];
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden="true">
      <div className="rounded-3xl border border-ink/8 bg-white p-5 shadow-lift sm:p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-wide text-haze-400">
            SIMULACRO · 12 / {SIM_TOTAL_QS}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-coral-600">
            <Icon n="clock" className="h-3.5 w-3.5" /> 38:12
          </span>
        </div>
        <p className="mt-4 text-[15px] font-semibold leading-snug text-ink">
          En un viraje aumenta el factor de carga. ¿Qué ocurre con la velocidad de pérdida?
        </p>
        <div className="mt-4 space-y-2">
          {opciones.map((o, i) => {
            const ok = i === 2;
            return (
              <div
                key={o}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[14px] ${
                  ok
                    ? "border-coral-300 bg-coral-50 font-semibold text-coral-700"
                    : "border-ink/8 text-ink/65"
                }`}
              >
                {o}
                {ok && <Icon n="check" className="h-4 w-4" sw={2.4} />}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-3 rounded-2xl bg-ink-50 p-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white">
            <Icon n="spark" className="h-4 w-4" />
          </span>
          <p className="text-[13px] leading-relaxed text-ink/70">
            <b className="text-ink">Yaris:</b> la velocidad de pérdida crece con la raíz cuadrada
            del factor de carga. En un viraje de 60° (factor 2) sube cerca de 41&nbsp;%.
          </p>
        </div>
      </div>

      <div className="relative -mt-5 -mr-2 ml-auto hidden w-[230px] rounded-2xl border border-ink/8 bg-white p-4 shadow-lift sm:block lg:-mr-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-haze-500">
          Tu análisis · ejemplo
        </div>
        <div className="mt-3 space-y-2.5">
          {barras.map((b) => (
            <div key={b.m}>
              <div className="flex justify-between text-[12px] text-ink/65">
                <span>{b.m}</span>
                <span className="font-semibold text-ink">{b.v}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-ink/8">
                <div
                  className={`h-1.5 rounded-full ${b.v >= 70 ? "bg-coral-400" : "bg-ink/35"}`}
                  style={{ width: `${b.v}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProofBar() {
  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/8 bg-ink/8 shadow-card lg:grid-cols-4">
          {PRUEBAS.map((p) => (
            <div key={p.t} className="bg-white px-5 py-6 text-center">
              <div className="font-display text-3xl tracking-tight text-ink lg:text-4xl">{p.n}</div>
              <div className="mt-1 text-[13px] text-ink/55">{p.t}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[12px] text-ink/40">
          Banco propio, desarrollado de forma independiente y mapeado al temario oficial publicado.
        </p>
      </div>
    </section>
  );
}

function Dolores() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="El problema"
          title={
            <>
              Estudiar mucho no es lo mismo que{" "}
              <span className="text-coral-600">estudiar lo correcto</span>
            </>
          }
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {DOLORES.map((d) => (
            <div key={d.t} className="rounded-3xl border border-ink/8 bg-white p-7 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-50 text-ink/70">
                <Icon n={d.icon} className="h-5 w-5" />
              </span>
              <h3 className="font-display mt-5 text-[20px] leading-snug text-ink">{d.t}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">{d.d}</p>
            </div>
          ))}
        </div>
        <p className="font-display mt-10 text-center text-[22px] text-ink">
          FlightPath resuelve las tres. <span className="text-coral-600">Así funciona:</span>
        </p>
      </div>
    </section>
  );
}

function ComoFunciona() {
  return (
    <section className="relative pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {PASOS.map((p) => (
            <div key={p.n} className="relative rounded-3xl bg-ink p-7 text-white shadow-navy">
              <span className="font-mono text-[12px] font-bold tracking-[0.14em] text-coral-300">
                {p.n}
              </span>
              <h3 className="font-display mt-3 text-[22px] leading-snug">{p.t}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/65">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Incluye() {
  return (
    <section className="relative py-16 lg:py-24">
      <PlaneField count={12} />
      <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="FlightPath Pro"
          title={
            <>
              Todo lo que necesitas, <span className="text-coral-600">en un solo lugar</span>
            </>
          }
          sub="Sin armar tu propio temario con PDFs: entras y sabes exactamente qué estudiar hoy."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUYE.map((f) => (
            <div
              key={f.t}
              className="flex gap-4 rounded-3xl border border-ink/8 bg-white p-6 shadow-card"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600">
                <Icon n={f.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[16px] font-bold text-ink">{f.t}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink/60">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparativa() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="La diferencia"
          title={
            <>
              Por tu cuenta vs. <span className="text-coral-600">con FlightPath</span>
            </>
          }
        />
        <div className="mt-10 overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-card">
          {COMPARA.map((r) => (
            <div
              key={r.k}
              className="grid gap-2 border-b border-ink/6 p-5 last:border-0 sm:grid-cols-[150px_1fr_1fr] sm:items-center sm:gap-6"
            >
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-haze-500">
                {r.k}
              </div>
              <div className="flex items-start gap-2 text-[14.5px] text-ink/50">
                <Icon n="close" className="mt-0.5 h-4 w-4 shrink-0 text-ink/30" />
                {r.solo}
              </div>
              <div className="flex items-start gap-2 text-[14.5px] font-semibold text-ink">
                <Icon n="check" className="mt-0.5 h-4 w-4 shrink-0 text-coral-600" sw={2.4} />
                {r.fp}
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-[15px] leading-relaxed text-ink/60">
          Presentar de nuevo cuesta otra cuota, más meses de estudio y esperar la siguiente fecha.
          <b className="text-ink"> Prepararte bien a la primera es la inversión más barata.</b>
        </p>
      </div>
    </section>
  );
}

function Oferta({
  ciclo,
  setCiclo,
  monthly,
  annual,
  setup,
  buy,
  ctaLabel,
}: {
  ciclo: Ciclo;
  setCiclo: (c: Ciclo) => void;
  monthly: PlanPrice;
  annual: PlanPrice;
  setup: PlanPrice;
  buy: Buy;
  ctaLabel: string;
}) {
  const anual = ciclo === "anual";
  const doceMeses = monthly.amount * 12;
  const ahorroPct =
    doceMeses > 0 ? Math.max(0, Math.round(((doceMeses - annual.amount) / doceMeses) * 100)) : 0;
  const precio = anual ? annual : monthly;
  const equivalente = Math.round(annual.amount / 12);

  return (
    <section id="oferta" className="relative scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <SectionHead
          center
          eyebrow="Tu acceso"
          title={
            <>
              Un solo plan. <span className="text-coral-600">Todo incluido.</span>
            </>
          }
          sub="Sin letras chiquitas: banco completo, simulacros ilimitados y Yaris con IA desde el primer minuto."
        />

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

        <div className="relative mt-8 overflow-hidden rounded-[32px] bg-ink shadow-navy">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(199,160,82,0.22), transparent)",
            }}
          />
          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1fr] lg:p-12">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-300">
                  FlightPath Pro {anual ? "Anual" : "Mensual"}
                </span>
                {anual && <Pill tone="light">Más recomendado</Pill>}
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-6xl tracking-tight text-white">
                  ${precio.amount.toLocaleString("es-MX")}
                </span>
                <span className="text-sm text-white/50">
                  {precio.currency} {anual ? "/ año" : "/ mes"}
                </span>
              </div>
              <p className="mt-2 text-[13.5px] text-white/60">
                {anual ? (
                  <>
                    Equivale a ${equivalente.toLocaleString("es-MX")} {annual.currency} al mes ·
                    ahorras <b className="text-coral-300">{ahorroPct}%</b>
                  </>
                ) : (
                  <>
                    Con el anual pagas ${annual.amount.toLocaleString("es-MX")} {annual.currency} y
                    ahorras <b className="text-coral-300">{ahorroPct}%</b>
                  </>
                )}
              </p>

              <div className="mt-6 rounded-2xl border border-white/12 bg-white/5 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Inscripción · pago único
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-display text-2xl text-white">{formatPrice(setup)}</span>
                  {setup.amount < PRO_SETUP_LIST_PRICE && (
                    <>
                      <span className="text-[13px] text-white/40 line-through">
                        ${PRO_SETUP_LIST_PRICE.toLocaleString("es-MX")}
                      </span>
                      <span className="text-[12px] font-bold text-coral-300">
                        Precio de promoción
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
                  Se cobra una sola vez junto con tu primer periodo y activa tu acceso al material
                  del curso.
                </p>
              </div>

              <Btn
                kind="primary"
                size="lg"
                icon="arrow"
                className="mt-7 w-full"
                to={buy.to}
                search={buy.search}
              >
                {ctaLabel}
              </Btn>
              <p className="mt-3 text-center text-[12px] text-white/45">
                Pago seguro con Stripe · Factura disponible
              </p>
            </div>

            <div className="lg:border-l lg:border-white/10 lg:pl-10">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                Incluye
              </div>
              <ul className="mt-5 space-y-3.5">
                {[
                  "Banco completo: CIAAC, ATP, Jeppesen y Handbook",
                  "Cuestionarios y simulacros ilimitados",
                  "Yaris con IA: te explica y te acompaña",
                  "Análisis de desempeño por materia",
                  "Biblioteca y manuales completos",
                  "Recordatorios de estudio por WhatsApp",
                  "Módulos nuevos conforme se liberan",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Icon n="check" className="mt-0.5 h-4 w-4 shrink-0 text-coral-300" sw={2.4} />
                    <span className="text-[14.5px] text-white/85">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3 rounded-2xl bg-white/5 p-5">
                {[
                  {
                    icon: "shield" as const,
                    t: "Cancela en un clic desde tu panel, sin permanencia.",
                  },
                  {
                    icon: "clock" as const,
                    t: "Conservas el acceso hasta el final del periodo pagado.",
                  },
                ].map((g) => (
                  <div key={g.t} className="flex items-start gap-3 text-[13.5px] text-white/70">
                    <Icon n={g.icon} className="mt-0.5 h-4 w-4 shrink-0 text-coral-300" />
                    {g.t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[13.5px] text-ink/55">
          ¿Aún no te decides?{" "}
          <Link to="/register" className="font-semibold text-ink underline underline-offset-4">
            Empieza con la cuenta gratis
          </Link>{" "}
          y actualiza cuando quieras.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-[820px] px-4 sm:px-6 lg:px-8">
        <SectionHead center eyebrow="Preguntas" title={<>Antes de despegar</>} />
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-ink/8 bg-white px-5 py-4 shadow-card"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink">
                <h3 style={{ margin: 0, font: "inherit" }}>{f.q}</h3>
                <Icon
                  n="arrow"
                  className="h-4 w-4 shrink-0 text-coral-600 transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink/60">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaFinal({ buy, ctaLabel }: { buy: Buy; ctaLabel: string }) {
  return (
    <section className="relative pb-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-center shadow-navy sm:px-12 lg:py-16">
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(199,160,82,0.18), transparent)",
            }}
          />
          <div className="relative">
            <div className="mb-4 flex justify-center">
              <PathyBubble size={120} />
            </div>
            <Eyebrow light>Pathy y Yaris te esperan</Eyebrow>
            <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl leading-tight text-white lg:text-[44px]">
              Tu examen tiene fecha.{" "}
              <span className="text-coral-300">Tu preparación también debería.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/60">
              Empieza hoy con el banco completo, simulacros ilimitados y una tutora con IA que no se
              cansa de explicarte.
            </p>
            <div className="mt-8 flex justify-center">
              <Btn kind="primary" size="lg" icon="arrow" to={buy.to} search={buy.search}>
                {ctaLabel}
              </Btn>
            </div>
            <p className="mt-4 text-[12.5px] text-white/40">
              Acceso inmediato · Cancela cuando quieras
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-ink pb-24 text-white lg:pb-0">
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo light size={26} />
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-white/60">
            <Link to="/legal" className="hover:text-white">
              Términos y privacidad
            </Link>
            <a href="mailto:contacto@flightpath.mx" className="hover:text-white">
              contacto@flightpath.mx
            </a>
          </nav>
        </div>
        {/* Disclaimer permanente de no afiliación — no quitar (regla de compliance). */}
        <p className="mt-6 max-w-3xl text-[11.5px] leading-relaxed text-white/40">
          FlightPath es una plataforma independiente. No está afiliada a la AFAC ni al CIAAC, ni a
          ASPA de México, Aeroméxico, Volaris o ninguna otra aerolínea o institución. El banco de
          preguntas es propio, desarrollado de forma independiente y mapeado al temario oficial
          publicado.
        </p>
        <p className="mt-4 text-[12px] text-white/35">
          © 2026 FlightPath. Hecho con cuidado en CDMX.
        </p>
      </div>
    </footer>
  );
}
