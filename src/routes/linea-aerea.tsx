import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { FUENTES_SEO } from "@/lib/seo/fuentes-seo";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  type IconName,
} from "@/components/landing/shared";

/**
 * Hub público del cluster /linea-aerea: presenta las 5 fuentes del temario
 * del examen teórico de la convocatoria de línea aérea y enlaza a la guía de
 * cada una. Complementa a /convocatoria-aeromexico (la landing de venta).
 */

const CANONICAL = "https://flightpath.mx/linea-aerea";
const START_HREF = "/register";

export const Route = createFileRoute("/linea-aerea")({
  component: LineaAereaHub,
  head: () => ({
    meta: [
      { title: "Temario de línea aérea: las 5 fuentes del examen teórico | FlightPath" },
      {
        name: "description",
        content:
          "ATP, PHAK, Jeppesen General Airway Manual, CPAM y OACI Anexo 10: qué es cada fuente del temario del examen teórico de la convocatoria de línea aérea, qué entra y cómo estudiarla.",
      },
      {
        name: "keywords",
        content:
          "temario linea aerea, fuentes examen primer oficial, ATP PHAK Jeppesen CPAM OACI, examen teorico convocatoria, que estudiar para linea aerea",
      },
      { property: "og:title", content: "Las 5 fuentes del temario de línea aérea | FlightPath" },
      {
        property: "og:description",
        content:
          "ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10 — qué es cada fuente, qué entra en el examen y cómo estudiarla.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Las 5 fuentes del temario de línea aérea | FlightPath" },
      {
        name: "twitter:description",
        content:
          "ATP, PHAK, Jeppesen, CPAM y OACI Anexo 10 — qué es cada fuente y cómo estudiarla para el examen teórico.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ItemList",
              name: "Fuentes del temario del examen teórico de línea aérea",
              itemListElement: FUENTES_SEO.map((f, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: f.nombre,
                url: `https://flightpath.mx/linea-aerea/${f.slug}`,
              })),
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
                { "@type": "ListItem", position: 2, name: "Temario Línea Aérea", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function Hero() {
  return (
    <section className="relative">
      <PlaneField count={22} />
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8 pt-16 lg:pt-24 pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
              <span className="text-[12px] font-semibold text-ink/70">
                Examen teórico · Convocatoria de línea aérea
              </span>
            </div>
            <h1 className="font-display mt-6 text-[38px] sm:text-[52px] lg:text-[58px] leading-[1.0] tracking-tight text-ink">
              Las 5 fuentes del temario,
              <span className="block text-coral-600 mt-1">una por una.</span>
            </h1>
            <p className="mt-7 text-lg lg:text-xl text-ink/55 max-w-xl leading-relaxed">
              El examen teórico de la convocatoria sale de cinco fuentes: ATP, PHAK, Jeppesen
              General Airway Manual, CPAM y OACI Anexo 10. Aquí está qué es cada una, qué entra y
              cómo estudiarla sin perderte.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
                Empezar a practicar
              </Btn>
              <Btn kind="light" size="lg" iconLeft="book" href="/convocatoria-aeromexico">
                Ver la convocatoria
              </Btn>
            </div>
          </div>
          <div className="relative lg:h-[400px] flex items-center justify-center">
            <PathyBubble size={240} className="lg:absolute lg:right-4 lg:top-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Fuentes() {
  return (
    <section className="relative py-14 lg:py-20" id="fuentes">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="space-y-4">
          {FUENTES_SEO.map((f, i) => (
            <a
              key={f.slug}
              href={`/linea-aerea/${f.slug}`}
              className="group block rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-7 hover:border-coral-300 hover:shadow-lift transition-all"
            >
              <div className="flex items-start gap-5">
                <span className="w-12 h-12 rounded-2xl bg-ink text-coral-400 grid place-items-center shrink-0">
                  <Icon n={(f.icon as IconName) ?? "book"} className="w-6 h-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Coord>{`FUENTE ${String(i + 1).padStart(2, "0")}`}</Coord>
                    <Pill tone="coral">{f.corto}</Pill>
                  </div>
                  <h2 className="font-display mt-2 text-[19px] lg:text-[22px] text-ink tracking-tight">
                    {f.nombre}
                  </h2>
                  <p className="mt-1.5 text-[14px] text-ink/55 leading-relaxed max-w-2xl">
                    {f.intro}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-coral-700 group-hover:text-coral-600 transition-colors">
                    Leer la guía de {f.corto} <Icon n="chevR" className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <p className="mt-10 text-center text-[13.5px] text-ink/50 max-w-2xl mx-auto">
          En FlightPath practicas las cinco fuentes con un banco propio de más de 2,800 preguntas
          con explicación, mapeado al temario publicado, y simulacros cronometrados. ¿Tu meta
          incluye equipo Boeing? También puedes{" "}
          <a href="/estudiar-737-max" className="font-semibold text-coral-700 hover:text-coral-600">
            estudiar el 737 MAX por capítulos del FCOM
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function Aviso() {
  return (
    <section className="relative pb-14">
      <div className="mx-auto max-w-[900px] px-6 lg:px-8">
        <div className="rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
          <strong className="text-ink/70">Aviso.</strong> FlightPath es una plataforma
          independiente: no está afiliada a ASPA de México, a Aeroméxico ni a ninguna aerolínea o
          autoridad. Los manuales y marcas mencionados pertenecen a sus titulares y se citan
          únicamente para describir el temario publicado de la convocatoria.
        </div>
      </div>
    </section>
  );
}

function CierreCta() {
  return (
    <section className="relative py-16 lg:py-24">
      <PlaneField count={12} />
      <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center relative z-10">
        <h2 className="font-display text-[30px] lg:text-[44px] text-ink leading-tight">
          Cinco fuentes.
          <span className="block text-coral-600">Una sola ruta de práctica.</span>
        </h2>
        <p className="mt-5 text-[16px] text-ink/55 leading-relaxed max-w-[540px] mx-auto">
          Deja de saltar entre PDFs: practica todo el temario en un solo lugar, mide tu avance por
          fuente y llega al examen sabiendo cuánto sabes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" href={START_HREF}>
            Crear mi cuenta gratis
          </Btn>
          <Btn kind="light" size="lg" href="/convocatoria-aeromexico">
            Cómo funciona la convocatoria
          </Btn>
        </div>
      </div>
    </section>
  );
}

function LineaAereaHub() {
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
      <Hero />
      <Fuentes />
      <Aviso />
      <CierreCta />
      <Footer />
    </div>
  );
}
