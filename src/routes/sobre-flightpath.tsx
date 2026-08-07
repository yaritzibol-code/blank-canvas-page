import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MATERIAS_DEF, SIM_TOTAL_QS } from "@/lib/store/materias";
import { PRO_MONTHLY_FALLBACK, PRO_SETUP_FALLBACK, formatPrice } from "@/lib/pricing";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  PlaneField,
  SectionHead,
  type IconName,
} from "./index";

/**
 * Página de entidad (GEO): define QUÉ es FlightPath con la descripción
 * canónica que usamos consistentemente en todo el sitio y en el schema.
 * Los motores generativos citan entidades con atributos claros y sin
 * ambigüedad — esta página existe para eso.
 */

const CANONICAL = "https://flightpath.mx/sobre-flightpath";

/** Descripción canónica de la entidad — misma en schema, llms.txt y copy. */
const DESCRIPCION_CANONICA =
  "FlightPath es la plataforma mexicana e independiente de preparación para el examen CIAAC (Piloto Aviador Comercial, AFAC) y para el examen teórico de convocatorias de línea aérea: banco propio de más de 2,800 preguntas con explicación, simulador de 310 preguntas y tutores con inteligencia artificial.";

const FICHA: { label: string; valor: string }[] = [
  { label: "Qué es", valor: "Plataforma en línea de preparación para pilotos (SaaS educativo)" },
  { label: "Enfoque", valor: "Examen CIAAC y examen teórico de convocatorias de línea aérea" },
  { label: "Origen", valor: "Ciudad de México, 2026 — hecha por pilotos, para pilotos" },
  { label: "Banco de preguntas", valor: "2,800+ reactivos propios con explicación y fuente" },
  { label: "Simulador", valor: `${SIM_TOTAL_QS} preguntas · 5 horas · reparto por materia` },
  { label: "Materias", valor: `Las ${MATERIAS_DEF.length} del temario CIAAC` },
  { label: "Biblioteca", valor: "100+ manuales y materiales de consulta" },
  { label: "Tutores IA", valor: "Yaris (tutora académica) y Pathy (constancia y recordatorios)" },
  {
    label: "Precios",
    valor: `Básico gratis · Pro ${formatPrice(PRO_MONTHLY_FALLBACK)}/mes + ${formatPrice(PRO_SETUP_FALLBACK)} de inscripción única`,
  },
  { label: "Contacto", valor: "contacto@flightpath.mx" },
];

const ES_NO_ES: { icon: IconName; titulo: string; texto: string; positivo: boolean }[] = [
  {
    icon: "check",
    titulo: "Es una plataforma de práctica medida",
    texto:
      "Bancos por materia, simulacros en formato real y análisis de desempeño: estudias con datos, no con sensaciones.",
    positivo: true,
  },
  {
    icon: "check",
    titulo: "Es independiente",
    texto:
      "Banco propio desarrollado de forma independiente y mapeado a los temarios publicados. Sin afiliación con autoridades ni aerolíneas.",
    positivo: true,
  },
  {
    icon: "check",
    titulo: "Es transparente con lo que está en beta",
    texto:
      "Los módulos en construcción (flashcards, clases grabadas, audio-repasos) se anuncian como próximos, nunca como incluidos.",
    positivo: true,
  },
  {
    icon: "close",
    titulo: "No es fuente oficial",
    texto:
      "No aplica el examen, no expide licencias y no representa a la AFAC, al CIAAC, a ASPA de México ni a ninguna aerolínea.",
    positivo: false,
  },
  {
    icon: "close",
    titulo: "No vende 'las preguntas del examen'",
    texto:
      "Nadie puede hacerlo legítimamente. Nuestro banco es propio; su valor es la explicación y la medición, no un atajo.",
    positivo: false,
  },
  {
    icon: "close",
    titulo: "No promete aprobar",
    texto:
      "Ninguna preparación seria garantiza resultados. FlightPath te dice con datos si estás listo — la honestidad es parte del producto.",
    positivo: false,
  },
];

export const Route = createFileRoute("/sobre-flightpath")({
  component: SobreFlightPathPage,
  head: () => ({
    meta: [
      { title: "Qué es FlightPath: la plataforma de preparación para el CIAAC" },
      { name: "description", content: DESCRIPCION_CANONICA },
      {
        name: "keywords",
        content:
          "que es flightpath, flightpath mexico, flightpath ciaac, plataforma preparacion pilotos mexico, flightpath opiniones",
      },
      { property: "og:title", content: "Qué es FlightPath" },
      { property: "og:description", content: DESCRIPCION_CANONICA },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Qué es FlightPath" },
      { name: "twitter:description", content: DESCRIPCION_CANONICA },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "AboutPage",
              name: "Qué es FlightPath",
              url: CANONICAL,
              inLanguage: "es-MX",
              mainEntity: {
                "@type": "Organization",
                name: "FlightPath",
                url: "https://flightpath.mx",
                logo: "https://flightpath.mx/assets/flightpath-logo.png",
                description: DESCRIPCION_CANONICA,
                foundingDate: "2026",
                foundingLocation: { "@type": "Place", name: "Ciudad de México, México" },
                email: "contacto@flightpath.mx",
                slogan: "Aprende, Domina y Vuela",
                knowsAbout: [
                  "Examen CIAAC",
                  "Piloto Aviador Comercial (México)",
                  "Convocatorias de línea aérea",
                  "Preparación de exámenes teóricos aeronáuticos",
                ],
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Inicio",
                  item: "https://flightpath.mx/",
                },
                { "@type": "ListItem", position: 2, name: "Sobre FlightPath", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function SobreFlightPathPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="sky-base min-h-screen">
      <AeroBackdrop />
      <Nav />
      <main>
        <section className="relative">
          <PlaneField count={18} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-16 lg:pt-24 pb-12">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
                  <span className="text-[12px] font-semibold text-ink/70">Sobre la plataforma</span>
                </div>
                <h1 className="font-display mt-6 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
                  Qué es
                  <span className="text-coral-600"> FlightPath.</span>
                </h1>
                <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
                  {DESCRIPCION_CANONICA}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Btn kind="primary" size="lg" icon="arrow" to="/register">
                    Probarla gratis
                  </Btn>
                  <Btn kind="light" size="lg" href="/ciaac">
                    Ver cómo funciona
                  </Btn>
                </div>
              </div>
              <div className="relative hidden lg:flex items-center justify-center">
                <PathyBubble size={230} />
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-12 lg:py-16" id="ficha">
          <div className="mx-auto max-w-[900px] px-6 lg:px-8">
            <div className="rounded-3xl bg-white border border-ink/8 shadow-card overflow-hidden">
              <div className="px-6 lg:px-8 py-5 border-b border-ink/8 flex items-center gap-2">
                <Icon n="doc" className="w-4 h-4 text-coral-600" />
                <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-haze-500">
                  Ficha de la plataforma
                </span>
              </div>
              <dl className="divide-y divide-ink/5">
                {FICHA.map((f) => (
                  <div
                    key={f.label}
                    className="grid sm:grid-cols-[200px_1fr] gap-1 sm:gap-6 px-6 lg:px-8 py-3.5"
                  >
                    <dt className="text-[13px] font-bold text-ink/50">{f.label}</dt>
                    <dd className="text-[14.5px] text-ink/80">{f.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="relative py-14 lg:py-18" id="es-no-es">
          <PlaneField count={12} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 relative z-10">
            <SectionHead
              center
              eyebrow="Sin letras chiquitas"
              title={
                <>
                  Lo que FlightPath es — <span className="text-coral-600">y lo que no.</span>
                </>
              }
            />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ES_NO_ES.map((x) => (
                <div
                  key={x.titulo}
                  className="rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-6"
                >
                  <span
                    className={`w-10 h-10 rounded-xl grid place-items-center ${x.positivo ? "bg-emerald-50 text-emerald-600" : "bg-coral-50 text-coral-700"}`}
                  >
                    <Icon n={x.icon} className="w-5 h-5" sw={2.2} />
                  </span>
                  <h3 className="font-display mt-4 text-[17px] text-ink leading-snug tracking-tight">
                    {x.titulo}
                  </h3>
                  <p className="mt-2 text-[13.5px] text-ink/55 leading-relaxed">{x.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-14 lg:py-20">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center">
            <Coord>CONTACTO</Coord>
            <h2 className="font-display mt-4 text-[28px] lg:text-[40px] text-ink leading-tight">
              ¿Dudas, prensa o alianzas
              <span className="block text-coral-600">con escuelas de aviación?</span>
            </h2>
            <p className="mt-4 text-[16px] text-ink/55 leading-relaxed">
              Escríbenos a{" "}
              <a
                href="mailto:contacto@flightpath.mx"
                className="font-semibold text-coral-700 hover:text-coral-600"
              >
                contacto@flightpath.mx
              </a>
              . Respondemos cada mensaje.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
