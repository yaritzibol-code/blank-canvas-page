/**
 * Landing de conversión para tráfico pagado (Meta Ads y similares).
 *
 * Está construida con el mismo sistema visual y de movimiento del home
 * (`reference-home.css` + `mountReferenceMotion`): globo WebGL con rutas de
 * vuelo, aviones en canvas, parallax de nubes, etapas "sticky" y tarjetas que
 * se apilan con el scroll. Encima, capas propias en `landing-motion.css`:
 * titular palabra por palabra, revelado al hacer scroll, brillo en los CTA,
 * chat de Yaris que se escribe solo y borde animado en la oferta.
 *
 * A diferencia del home hay una sola meta: suscribirse a Pro. Sin menú de
 * navegación; el único camino alterno es la cuenta gratis. `noindex`: la
 * versión que posiciona en buscadores es `/`.
 *
 * El CTA lleva al registro y de ahí directo al checkout embebido de Stripe
 * (`/dashboard/planes?checkout=1&plan=…`). Los `fbclid`/UTM del anuncio los
 * guarda `useMetaPixel` y viajan hasta el webhook para atribuir la compra.
 *
 * Compliance (COMPLIANCE.md): sólo cifras propias verificables, cero
 * testimonios inventados y aviso de no afiliación visible.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpenText,
  Brain,
  Books,
  ChartLineUp,
  ChatCircleDots,
  CheckCircle,
  Clock,
  Files,
  Lightning,
  LockKey,
  Path,
  Question,
  ShieldCheck,
  Sparkle,
  Target,
  Timer,
  XCircle,
} from "@phosphor-icons/react";
import { CountUp } from "@/components/landing/shared";
import { mountReferenceMotion } from "@/components/landing/reference-motion";
import "@/components/landing/reference-home.css";
import "@/components/landing/landing-motion.css";
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
    links: [
      { rel: "canonical", href: "https://flightpath.mx/" },
      // El póster del globo pinta el héroe antes de que cargue WebGL.
      { rel: "preload", as: "image", href: "/redesign/earth-night.png" },
    ],
  }),
  component: LandingPage,
});

/* ───────────────────────── Contenido ───────────────────────── */

const STATS = [
  { n: "2,800+", t: "preguntas con explicación" },
  { n: String(SIM_TOTAL_QS), t: "preguntas por simulacro" },
  { n: "12", t: "materias del temario" },
  { n: "5", t: "fuentes de línea aérea" },
  { n: "100+", t: "manuales en la biblioteca" },
  { n: "24/7", t: "Yaris, tutora con IA" },
];

const MARQUEE = [
  "Examen CIAAC",
  "ATP",
  "Jeppesen",
  "Handbook",
  "Simulacros con reloj",
  "Yaris con IA",
  "Análisis por materia",
  "Convocatorias de línea aérea",
];

const DOLORES: { icon: ReactNode; t: string; d: string }[] = [
  {
    icon: <Files size={24} weight="duotone" />,
    t: "PDFs sueltos y guías de hace años",
    d: "Horas buscando material sin saber si está vigente ni si cubre todo el temario.",
  },
  {
    icon: <Target size={24} weight="duotone" />,
    t: "No sabes si ya estás preparado",
    d: "Sin un simulacro con reloj, el día del examen es la primera vez que te mides de verdad.",
  },
  {
    icon: <Question size={24} weight="duotone" />,
    t: "Dudas a las 11 de la noche",
    d: "Fallas una pregunta, no entiendes por qué y no hay nadie a quién preguntarle.",
  },
];

const ETAPAS: {
  icon: ReactNode;
  img: string;
  alt: string;
  t: string;
  d: string;
  chips: string[];
}[] = [
  {
    icon: <Lightning size={24} weight="duotone" />,
    img: "/redesign/64b895fbc7418153.jpg",
    alt: "Estudiante de piloto estudiando con cartas aeronáuticas y un computador de vuelo",
    t: "Activa tu acceso",
    d: "Creas tu cuenta y pagas en un par de minutos. Entras al banco completo en ese momento, sin esperas.",
    chips: ["Acceso inmediato", "Pago seguro con Stripe", "Cancela cuando quieras"],
  },
  {
    icon: <Timer size={24} weight="duotone" />,
    img: "/redesign/feb8a7194679fec4.jpg",
    alt: "Laptop con un simulador de examen cronometrado y un headset de piloto al lado",
    t: "Haz tu diagnóstico",
    d: `Un simulacro cronometrado de ${SIM_TOTAL_QS} preguntas te muestra en qué materias vas fuerte y dónde se te va el puntaje.`,
    chips: [`Simulacro de ${SIM_TOTAL_QS}`, "Con reloj", "Resultado por materia"],
  },
  {
    icon: <Brain size={24} weight="duotone" />,
    img: "/redesign/4bbe0ae2e413c22b.jpg",
    alt: "Manuales de aviación apilados junto a una tableta con análisis de avance",
    t: "Practica lo que te falta",
    d: "Cuestionarios por materia y capítulo. Cada error trae su explicación y Yaris te lo aclara con el contexto del curso.",
    chips: ["Por materia y capítulo", "Explicación en cada pregunta", "Yaris con IA"],
  },
  {
    icon: <Target size={24} weight="duotone" />,
    img: "/redesign/a79f863e1813a98f.jpg",
    alt: "Jet regional despegando al anochecer con las luces de pista encendidas",
    t: "Llega con confianza",
    d: "Tu análisis te dice cuándo ya dominas cada materia. El día del examen no es la primera vez que te mides.",
    chips: ["Análisis por materia", "Simulacros ilimitados"],
  },
];

const COMPARA = [
  { solo: "PDFs dispersos y guías viejas", fp: "Banco organizado por materia y capítulo" },
  {
    solo: "Descubres si estás listo el día del examen",
    fp: "Simulacros con reloj y análisis por materia",
  },
  { solo: "Dudas en foros y grupos de WhatsApp", fp: "Yaris te explica cada pregunta" },
  { solo: "Constancia a pura fuerza de voluntad", fp: "Recordatorios y racha de estudio" },
];

const INCLUYE = [
  "Banco completo: CIAAC, ATP, Jeppesen y Handbook",
  "Cuestionarios y simulacros ilimitados",
  "Yaris con IA: te explica y te acompaña",
  "Análisis de desempeño por materia",
  "Biblioteca y manuales completos",
  "Recordatorios de estudio por WhatsApp",
  "Módulos nuevos conforme se liberan",
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

/** Conversación de ejemplo del chat de Yaris (contenido original del curso). */
const CHAT: { me: boolean; t: string }[] = [
  { me: true, t: "¿Por qué sube la velocidad de pérdida en un viraje?" },
  {
    me: false,
    t: "Porque aumenta el factor de carga: el ala necesita más sustentación. La velocidad de pérdida crece con la raíz cuadrada de ese factor.",
  },
  { me: true, t: "¿Y en un viraje de 60°?" },
  {
    me: false,
    t: "El factor de carga es 2, así que sube cerca de 41 %. Por eso en virajes cerrados conviene llevar más velocidad.",
  },
];

/* ───────────────────────── Utilidades ───────────────────────── */

type Ciclo = "mensual" | "anual";
type Buy = { to: string; search: Record<string, unknown> };

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

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

/**
 * Revelado al hacer scroll: marca la página como lista y añade `is-in` a cada
 * `.lp-reveal` cuando entra a pantalla. Sin IntersectionObserver o con
 * movimiento reducido no se oculta nada.
 */
function useScrollReveal(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion() || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    el.querySelectorAll(".lp-reveal").forEach((n) => io.observe(n));
    el.setAttribute("data-lp-ready", "");
    return () => {
      io.disconnect();
      el.removeAttribute("data-lp-ready");
    };
  }, [root]);
}

/** Texto partido en palabras que suben una tras otra. */
function Words({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i}>
          <span className="lp-w" style={{ "--i": start + i } as React.CSSProperties}>
            {w}
          </span>{" "}
        </span>
      ))}
    </>
  );
}

function Arrow({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden="true">
      <g fill="currentColor">
        <path d="m216 128l-72 72V56Z" opacity=".28"></path>
        <path d="m221.66 122.34l-72-72A8 8 0 0 0 136 56v64H40a8 8 0 0 0 0 16h96v64a8 8 0 0 0 13.66 5.66l72-72a8 8 0 0 0 0-11.32M152 180.69V75.31L204.69 128Z"></path>
      </g>
    </svg>
  );
}

function BuyLink({
  buy,
  className,
  children,
}: {
  buy: Buy;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link to={buy.to} search={buy.search as never} className={className}>
      {children}
    </Link>
  );
}

/* ───────────────────────── Página ───────────────────────── */

function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  const user = useSessionUser();
  const { monthly, annual, setup } = usePublicPricing();
  const [ciclo, setCiclo] = useState<Ciclo>("mensual");
  const [scrolled, setScrolled] = useState(false);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    if (root.current) return mountReferenceMotion(root.current);
  }, []);
  useScrollReveal(root);

  // Una sola vez por visita, aunque el efecto se repita (StrictMode en desarrollo).
  const vistaRegistrada = useRef(false);
  useEffect(() => {
    if (vistaRegistrada.current) return;
    vistaRegistrada.current = true;
    metaTrack("ViewContent", { content_name: "FlightPath Pro", content_category: "landing" });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setSticky(window.scrollY > 760);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Con sesión, directo al checkout; sin ella, registro y luego checkout del mismo plan. */
  const buy: Buy = {
    to: user ? "/dashboard/planes" : "/register",
    search: user
      ? { checkout: 1, plan: ciclo }
      : { next: `/dashboard/planes?checkout=1&plan=${ciclo}` },
  };
  const cta = user ? "Activar mi acceso Pro" : "Quiero mi acceso Pro";

  return (
    <div ref={root} className="flightpath-redesign">
      <header className={`lp-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="lp-header-in">
          <span className="lp-brand">
            <img src="/redesign/3585687c1b6a244a.png" alt="" width={32} height={32} />
            <span>
              Flight<b>Path</b>
            </span>
          </span>
          <div className="lp-header-actions">
            <Link to="/login" className="lp-login">
              Iniciar sesión
            </Link>
            <Link to="/register" className="lp-btn-sm lp-shine">
              Crear cuenta gratis
              <Arrow size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero buy={buy} cta={cta} />
        <Marquee />
        <Problema />
        <Incluye />
        <Comparativa />
        <Oferta
          ciclo={ciclo}
          setCiclo={setCiclo}
          monthly={monthly}
          annual={annual}
          setup={setup}
          buy={buy}
          cta={cta}
        />
        <Faq />
        <Cierre buy={buy} cta={cta} />
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-row">
            <span className="lp-brand">
              <img src="/redesign/3585687c1b6a244a.png" alt="" width={32} height={32} />
              <span>
                Flight<b>Path</b>
              </span>
            </span>
            <nav>
              <Link to="/legal">Términos y privacidad</Link>
              <a href="mailto:contacto@flightpath.mx">contacto@flightpath.mx</a>
            </nav>
          </div>
          {/* Disclaimer permanente de no afiliación — no quitar (regla de compliance). */}
          <p className="lp-legal">
            FlightPath es una plataforma independiente. No está afiliada a la AFAC ni al CIAAC, ni a
            ASPA de México, Aeroméxico, Volaris o ninguna otra aerolínea o institución. El banco de
            preguntas es propio, desarrollado de forma independiente y mapeado al temario oficial
            publicado. © 2026 FlightPath · Hecho en CDMX.
          </p>
        </div>
      </footer>

      {/* CTA fijo en móvil: el botón siempre a un pulgar de distancia. */}
      <div className={`lp-sticky${sticky ? " is-on" : ""}`} aria-hidden={!sticky}>
        <BuyLink buy={buy} className="btn btn-gold rd-10 lp-shine">
          {cta}
          <Arrow />
        </BuyLink>
      </div>
    </div>
  );
}

/* ───────────────────────── Secciones ───────────────────────── */

function Hero({ buy, cta }: { buy: Buy; cta: string }) {
  return (
    <section className="rd-hero rd-1 lp-hero">
      <div className="rd-2"></div>
      <div className="rd-hero-copy rd-3">
        <div className="soft-in rd-4">
          <span className="rd-5"></span>
          <span>CIAAC · Convocatorias de línea aérea</span>
          <span className="rd-5"></span>
        </div>
        <h1 className="rd-6 lp-words">
          <Words text="Deja de estudiar a ciegas." />
          <span className="rd-7">
            <Words text="Llega a tu examen con un plan." start={4} />
          </span>
        </h1>
        <p className="soft-in-2 rd-8">
          Un banco propio de 2,800+ preguntas con explicación, simulacros cronometrados de{" "}
          {SIM_TOTAL_QS} preguntas y Yaris, tu tutora con IA, te muestran qué dominas y qué te
          falta, materia por materia.
        </p>
        <div className="soft-in-3 rd-9">
          <BuyLink buy={buy} className="btn btn-gold rd-10 lp-shine">
            {cta}
            <Arrow />
          </BuyLink>
          <Link className="btn rd-12" to="/register">
            Empieza gratis · sin tarjeta
          </Link>
        </div>
        <ul className="soft-in-3 lp-trust">
          <li>
            <span className="pulse-dot" aria-hidden="true"></span>
            Acceso inmediato
          </li>
          <li>
            <LockKey size={16} weight="duotone" />
            Pago seguro con Stripe
          </li>
          <li>
            <ShieldCheck size={16} weight="duotone" />
            Cancela cuando quieras
          </li>
        </ul>
      </div>
      <div className="rd-globe-wrap rd-13">
        <div className="rd-globe-poster" aria-hidden="true"></div>
        <canvas className="rd-14" aria-hidden="true" data-motion="globe"></canvas>
        <canvas className="rd-15" aria-hidden="true" data-motion="globe-fx"></canvas>
        <div className="rd-16"></div>
      </div>
      <div className="rd-stats rd-17">
        {STATS.map((s, i) => (
          <div key={s.t} className={i === STATS.length - 1 ? "rd-21" : "rd-18"}>
            <CountUp value={s.n} className="rd-19" />
            <span className="rd-20">{s.t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Marquee() {
  // Dos copias idénticas: la animación recorre el 50 % y vuelve sin salto.
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="rd-22" aria-hidden="true">
      <div className="marquee rd-23">
        {items.flatMap((t, i) => [
          <span key={`t${i}`}>{t.toUpperCase()}</span>,
          <span key={`s${i}`} className="rd-24 rd-25">
            <Sparkle size={14} weight="fill" />
          </span>,
        ])}
      </div>
    </div>
  );
}

function Problema() {
  return (
    <section className="rd-26" id="tu-ruta">
      <div className="rd-27" data-motion="parallax">
        <img
          className="rd-28"
          data-depth="0.5"
          loading="lazy"
          decoding="async"
          src="/redesign/e262e5c0cc1ebd63.jpg"
          alt=""
        />
        <div className="rd-29"></div>
        <img
          className="rd-30"
          data-depth="0.34"
          loading="lazy"
          decoding="async"
          src="/redesign/d570a146527c74e6.webp"
          alt=""
        />
        <div className="rd-31" data-depth="0.2">
          <div className="rd-4">
            <span className="rd-5"></span>
            <span>El problema</span>
            <span className="rd-5"></span>
          </div>
          <h2 className="rd-32">
            Estudiar mucho no es <span className="rd-7">lo mismo que estudiar bien.</span>
          </h2>
        </div>
        <img
          className="rd-33"
          data-depth="0.06"
          loading="lazy"
          decoding="async"
          src="/redesign/6d490e09a9343478.webp"
          alt=""
        />
        <div className="rd-34"></div>
      </div>
      <canvas className="rd-35" aria-hidden="true" data-tone="light" data-motion="planes"></canvas>

      <div className="rd-36">
        <div className="lp-pains">
          {DOLORES.map((d, i) => (
            <article
              key={d.t}
              className="lp-pain lp-reveal"
              style={{ "--d": `${i * 120}ms` } as React.CSSProperties}
            >
              <span className="lp-pain-ic">{d.icon}</span>
              <h3>{d.t}</h3>
              <p>{d.d}</p>
            </article>
          ))}
        </div>
        <p className="lp-bridge lp-reveal">
          FlightPath resuelve las tres. <em>Así se ve tu ruta:</em>
        </p>

        <div className="rd-38" data-motion="stages">
          <div className="rd-39" data-stage-panel="">
            {ETAPAS.map((e, i) => (
              <img
                key={e.img}
                className={i === 0 ? "rd-40" : "rd-41"}
                data-stage-img={i}
                loading="lazy"
                decoding="async"
                src={e.img}
                alt={e.alt}
              />
            ))}
            <div className="rd-42"></div>
            <div className="rd-43">
              <div className="rd-44">
                <span className="rd-25">PASO</span>
                <span className="rd-45">
                  {ETAPAS.map((_, i) => (
                    <span key={i} className={i === 0 ? "rd-46" : "rd-47"} data-stage-num={i}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  ))}
                </span>
                <span className="rd-48">/ {String(ETAPAS.length).padStart(2, "0")}</span>
              </div>
              <div className="rd-49">
                {ETAPAS.map((_, i) => (
                  <span key={i} className={i === 0 ? "rd-50" : "rd-51"} data-stage-seg={i}></span>
                ))}
              </div>
            </div>
          </div>
          <div className="rd-52">
            {ETAPAS.map((e, i) => (
              <article key={e.t} className={i === 0 ? "rd-53" : "rd-62"} data-stage-item={i}>
                <div className="rd-54">
                  <span className="rd-55">{e.icon}</span>
                  <span className="rd-56">
                    PASO {String(i + 1).padStart(2, "0")} · DE{" "}
                    {String(ETAPAS.length).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="rd-57">{e.t}</h3>
                <p className="rd-58">{e.d}</p>
                <div className="rd-59">
                  {e.chips.map((c) => (
                    <span key={c} className="rd-60">
                      {c}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Incluye() {
  return (
    <section className="rd-63" id="incluye">
      <canvas className="rd-64" aria-hidden="true" data-tone="light" data-motion="planes"></canvas>
      <div className="rd-65">
        <div className="rd-66">
          <div className="rd-67 lp-reveal lp-from-left">
            <div className="rd-68">
              <span className="rd-5"></span>
              <span>FlightPath Pro</span>
            </div>
            <h2 className="rd-69">
              Todo lo que necesitas <span className="rd-70">en un solo lugar.</span>
            </h2>
          </div>
          <p className="rd-71 lp-reveal lp-from-right">
            Sin armar tu propio temario con PDFs: entras y sabes exactamente qué estudiar hoy. Estas
            son las herramientas que hacen el trabajo pesado.
          </p>
        </div>

        <div className="rd-72" data-motion="stack">
          <div className="rd-73" data-stack-slot="0">
            <div className="rd-74" data-stack-card="0">
              <div className="rd-75">
                <div className="rd-54">
                  <span className="rd-76" style={{ color: "#c7a052" }}>
                    <BookOpenText size={28} weight="duotone" />
                  </span>
                  <span className="rd-77">01 / 05</span>
                </div>
                <h3 className="rd-79">Banco completo</h3>
                <p className="rd-80">
                  2,800+ preguntas CIAAC con explicación, más ATP, Jeppesen y Handbook por
                  capítulos.
                </p>
              </div>
              <img
                className="rd-81"
                loading="lazy"
                decoding="async"
                src="/redesign/6c09800564036fbe.jpg"
                alt="Mano respondiendo un cuestionario de opción múltiple en una tableta"
              />
            </div>
          </div>

          <div className="rd-73" data-stack-slot="1">
            <div className="rd-82" data-stack-card="1">
              <div className="rd-75">
                <div className="rd-54">
                  <span className="rd-83" style={{ color: "#e3c98a" }}>
                    <ChartLineUp size={28} weight="duotone" />
                  </span>
                  <span className="rd-84">02 / 05</span>
                </div>
                <h3 className="rd-79">Tu análisis, tu ruta</h3>
                <p className="rd-80">
                  Ves tu avance por materia y tus puntos débiles. Estudias sólo lo que te falta.
                </p>
              </div>
              <img
                className="rd-81"
                loading="lazy"
                decoding="async"
                src="/redesign/bab3f7d3613131e0.jpg"
                alt="Ruta dorada con waypoints sobre un mapa topográfico azul marino"
              />
            </div>
          </div>

          <div className="rd-73" data-stack-slot="2">
            <div className="rd-85" data-stack-card="2">
              <div className="rd-75">
                <div className="rd-54">
                  <span className="rd-86" style={{ color: "#c7a052" }}>
                    <ChatCircleDots size={28} weight="duotone" />
                  </span>
                  <span className="rd-56">03 / 05</span>
                </div>
                <h3 className="rd-79">Yaris, tu tutora con IA</h3>
                <p className="rd-87">
                  Te explica por qué fallaste, con el contexto del curso, a la hora que estudies.
                </p>
              </div>
              <YarisChat />
            </div>
          </div>

          <div className="rd-73" data-stack-slot="3">
            <div className="rd-88" data-stack-card="3">
              <div className="rd-75">
                <div className="rd-54">
                  <span className="rd-86" style={{ color: "#c7a052" }}>
                    <Books size={28} weight="duotone" />
                  </span>
                  <span className="rd-89">04 / 05</span>
                </div>
                <h3 className="rd-79">Biblioteca de 100+ manuales</h3>
                <p className="rd-90">
                  Todo el material de consulta en un solo lugar, desde el celular o la compu.
                </p>
              </div>
              <img
                className="rd-81"
                loading="lazy"
                decoding="async"
                src="/redesign/2825076171976561.jpg"
                alt="Librero con manuales de aviación azul marino y un avión a escala"
              />
            </div>
          </div>

          <div className="rd-73" data-stack-slot="4">
            <div className="rd-91" data-stack-card="4">
              <div className="rd-75">
                <div className="rd-54">
                  <span className="rd-92 rd-93">
                    <Clock size={28} weight="duotone" />
                  </span>
                  <span className="rd-94">05 / 05</span>
                </div>
                <h3 className="rd-79">Pathy te cuida la racha</h3>
                <p className="rd-96">
                  Recordatorios por WhatsApp para que estudiar se vuelva hábito, no fuerza de
                  voluntad.
                </p>
              </div>
              <div className="lp-pathy-card">
                <img
                  className="float-y"
                  loading="lazy"
                  decoding="async"
                  src="/redesign/b079792a862094a0.png"
                  alt="Pathy, la nube copiloto de FlightPath"
                />
                <span className="lp-bubble lp-bubble-1 float-y-late">¡Hora de estudiar! ✈️</span>
                <span className="lp-bubble lp-bubble-2 float-y">🔥 Racha de 12 días</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Chat de ejemplo que se escribe solo al entrar a pantalla (en bucle). */
function YarisChat() {
  const ref = useRef<HTMLDivElement>(null);
  // SSR y movimiento reducido: la conversación completa, sin animar.
  const [shown, setShown] = useState(CHAT.length);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || typeof IntersectionObserver === "undefined") return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const run = () => {
      setShown(0);
      setTyping(false);
      let t = 500;
      CHAT.forEach((m, i) => {
        if (!m.me) {
          later(() => setTyping(true), t);
          t += 1400;
        }
        later(() => {
          setTyping(false);
          setShown(i + 1);
        }, t);
        t += m.me ? 900 : 1800;
      });
      later(run, t + 3500);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        run();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div ref={ref} className="lp-chat" aria-label="Ejemplo de conversación con Yaris">
      <div className="lp-chat-top">
        <span className="lp-chat-av">
          <Sparkle size={18} weight="fill" />
        </span>
        <span>
          <b>Yaris</b> · tutora con IA
        </span>
      </div>
      {CHAT.slice(0, shown).map((m, i) => (
        <div key={i} className={`lp-msg lp-msg-in ${m.me ? "lp-msg-me" : "lp-msg-ai"}`}>
          {m.t}
        </div>
      ))}
      {typing && (
        <div className="lp-msg lp-msg-ai lp-msg-in" aria-hidden="true">
          <span className="lp-typing">
            <i></i>
            <i></i>
            <i></i>
          </span>
        </div>
      )}
    </div>
  );
}

function Comparativa() {
  return (
    <section className="lp-compare">
      <canvas className="rd-64" aria-hidden="true" data-tone="light" data-motion="planes"></canvas>
      <div className="lp-wrap">
        <div className="lp-head lp-reveal">
          <div className="lp-kicker">
            <span className="rd-5"></span>
            <span>La diferencia</span>
            <span className="rd-5"></span>
          </div>
          <h2 className="lp-h2">
            Por tu cuenta vs. <em>con FlightPath</em>
          </h2>
        </div>
        <div className="lp-vs">
          <div className="lp-col lp-col-solo lp-reveal lp-from-left">
            <h3>Por tu cuenta</h3>
            <ul>
              {COMPARA.map((r, i) => (
                <li key={r.solo}>
                  <XCircle size={20} weight="duotone" />
                  <span
                    className="lp-strike"
                    style={{ "--d": `${400 + i * 160}ms` } as React.CSSProperties}
                  >
                    {r.solo}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="lp-col lp-col-fp lp-reveal lp-from-right"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            <h3>Con FlightPath Pro</h3>
            <ul>
              {COMPARA.map((r, i) => (
                <li key={r.fp}>
                  <span
                    className="lp-pop"
                    style={
                      { "--d": `${500 + i * 160}ms`, display: "inline-flex" } as React.CSSProperties
                    }
                  >
                    <CheckCircle size={20} weight="duotone" />
                  </span>
                  <span>{r.fp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="lp-note lp-reveal">
          Presentar de nuevo cuesta otra cuota, más meses de estudio y esperar la siguiente fecha.{" "}
          <b>Prepararte bien a la primera es la inversión más barata.</b>
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
  cta,
}: {
  ciclo: Ciclo;
  setCiclo: (c: Ciclo) => void;
  monthly: PlanPrice;
  annual: PlanPrice;
  setup: PlanPrice;
  buy: Buy;
  cta: string;
}) {
  const anual = ciclo === "anual";
  const doceMeses = monthly.amount * 12;
  const ahorroPct =
    doceMeses > 0 ? Math.max(0, Math.round(((doceMeses - annual.amount) / doceMeses) * 100)) : 0;
  const precio = anual ? annual : monthly;
  const equivalente = Math.round(annual.amount / 12);

  // Píldora del selector: se desliza hasta el botón activo.
  const group = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const btn = group.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (btn) setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [ciclo, ahorroPct]);

  return (
    <section className="lp-offer" id="oferta">
      <canvas className="rd-64" aria-hidden="true" data-tone="dark" data-motion="planes"></canvas>
      <div className="lp-wrap">
        <div className="lp-head lp-reveal">
          <div className="lp-kicker is-light">
            <span className="rd-5"></span>
            <span>Tu acceso</span>
            <span className="rd-5"></span>
          </div>
          <h2 className="lp-h2 is-light">
            Un solo plan. <em>Todo incluido.</em>
          </h2>
          <p className="lp-sub is-light">
            Sin letras chiquitas: banco completo, simulacros ilimitados y Yaris con IA desde el
            primer minuto.
          </p>
          <div
            ref={group}
            role="group"
            aria-label="Periodicidad del plan Pro"
            className="lp-toggle"
          >
            {pill && (
              <span
                className="lp-toggle-pill"
                aria-hidden="true"
                style={{ left: pill.left, width: pill.width }}
              />
            )}
            {(["mensual", "anual"] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={ciclo === c}
                onClick={() => setCiclo(c)}
                style={!pill && ciclo === c ? { background: "#c7a052" } : undefined}
              >
                {c === "mensual" ? "Mensual" : `Anual · ahorra ${ahorroPct}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="lp-card-ring lp-reveal lp-zoom">
          <div className="lp-card">
            <div>
              <div className="lp-plan">
                FlightPath Pro {anual ? "Anual" : "Mensual"}
                {anual && <span className="lp-badge">Más recomendado</span>}
              </div>
              <div className="lp-price">
                <span key={ciclo} className="lp-price-n">
                  ${precio.amount.toLocaleString("es-MX")}
                </span>
                <span className="lp-price-u">
                  {precio.currency} {anual ? "/ año" : "/ mes"}
                </span>
              </div>
              <p className="lp-price-eq">
                {anual ? (
                  <>
                    Equivale a ${equivalente.toLocaleString("es-MX")} {annual.currency} al mes ·
                    ahorras <b>{ahorroPct}%</b>
                  </>
                ) : (
                  <>
                    Con el anual pagas ${annual.amount.toLocaleString("es-MX")} {annual.currency} y
                    ahorras <b>{ahorroPct}%</b>
                  </>
                )}
              </p>

              <div className="lp-setup">
                <div className="lp-setup-k">Inscripción · pago único</div>
                <div className="lp-setup-v">
                  <strong>{formatPrice(setup)}</strong>
                  {setup.amount < PRO_SETUP_LIST_PRICE && (
                    <>
                      <s>${PRO_SETUP_LIST_PRICE.toLocaleString("es-MX")}</s>
                      <em>Precio de promoción</em>
                    </>
                  )}
                </div>
                <p>
                  Se cobra una sola vez junto con tu primer periodo y activa tu acceso al material
                  del curso.
                </p>
              </div>

              <BuyLink buy={buy} className="btn btn-gold rd-10 lp-shine">
                {cta}
                <Arrow />
              </BuyLink>
              <p className="lp-secure">Pago seguro con Stripe · Factura disponible</p>
            </div>

            <div>
              <div className="lp-includes-k">Incluye</div>
              <ul className="lp-includes">
                {INCLUYE.map((f) => (
                  <li key={f}>
                    <CheckCircle size={20} weight="duotone" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="lp-guarantee">
                <div>
                  <ShieldCheck size={20} weight="duotone" />
                  Cancela en un clic desde tu panel, sin permanencia.
                </div>
                <div>
                  <Path size={20} weight="duotone" />
                  Conservas el acceso hasta el final del periodo que pagaste.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-free-card lp-reveal">
          <div>
            <div className="lp-free-k">FlightPath Básica · $0 MXN</div>
            <p>
              ¿Aún no te decides? Crea tu cuenta gratis, sin tarjeta: practica con preguntas reales,
              conoce a Yaris y actualiza a Pro cuando estés listo.
            </p>
          </div>
          <Link to="/register" className="btn rd-12">
            Crear cuenta gratis
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="lp-faq">
      <div className="lp-wrap">
        <div className="lp-head lp-reveal">
          <div className="lp-kicker">
            <span className="rd-5"></span>
            <span>Preguntas</span>
            <span className="rd-5"></span>
          </div>
          <h2 className="lp-h2">
            Antes de <em>despegar</em>
          </h2>
        </div>
        <div className="lp-faq-list">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              className="lp-reveal"
              style={{ "--d": `${i * 60}ms` } as React.CSSProperties}
            >
              <summary>
                <h3>{f.q}</h3>
                <span className="lp-plus" aria-hidden="true"></span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cierre({ buy, cta }: { buy: Buy; cta: string }) {
  return (
    <section className="rd-152 lp-final">
      <canvas className="rd-64" aria-hidden="true" data-tone="dark" data-motion="planes"></canvas>
      <div className="rd-153">
        <div className="rd-99 lp-reveal lp-from-left">
          <h2 className="rd-154">
            Tu examen tiene fecha. <span className="rd-7">Tu preparación también.</span>
          </h2>
          <p className="rd-155">
            Empieza hoy con el banco completo, simulacros ilimitados y una tutora con IA que no se
            cansa de explicarte.
          </p>
          <BuyLink buy={buy} className="btn btn-gold rd-156 lp-shine">
            {cta}
            <Arrow />
          </BuyLink>
          <Link to="/register" className="lp-final-free">
            o empieza gratis, sin tarjeta →
          </Link>
          <p className="lp-final-trust">Acceso inmediato · Cancela cuando quieras</p>
        </div>
        <div className="lp-reveal lp-zoom" style={{ display: "grid", justifyItems: "center" }}>
          <img
            className="float-y rd-157"
            loading="lazy"
            decoding="async"
            src="/redesign/b079792a862094a0.png"
            alt="Pathy, la nube copiloto de FlightPath"
          />
        </div>
      </div>
    </section>
  );
}
