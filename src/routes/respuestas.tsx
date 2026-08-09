import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { RESPUESTAS_CATEGORIAS, RESPUESTAS_SEO } from "@/lib/seo/respuestas-seo";
import { AeroBackdrop, Btn, Coord, Footer, Icon, Nav, PathyBubble, PlaneField } from "@/components/landing/shared";

/**
 * Hub del centro de respuestas (cluster AEO/GEO): agrupa las preguntas
 * conversacionales sobre el CIAAC y las convocatorias de línea aérea, cada
 * una con su página answer-first en /respuestas/$slug.
 */

const CANONICAL = "https://flightpath.mx/respuestas";

export const Route = createFileRoute("/respuestas")({
  component: RespuestasHub,
  head: () => ({
    meta: [
      { title: "Respuestas sobre el CIAAC y la convocatoria de línea aérea | FlightPath" },
      {
        name: "description",
        content:
          "Respuestas directas a las preguntas más buscadas: cuántas preguntas tiene el CIAAC, con cuánto se aprueba, qué es AON Aviation Suite, requisitos de la convocatoria de Aeroméxico y más — con datos y sin rodeos.",
      },
      {
        name: "keywords",
        content:
          "preguntas frecuentes ciaac, respuestas examen ciaac, dudas convocatoria aeromexico, preguntas piloto comercial mexico",
      },
      { property: "og:title", content: "Centro de respuestas: CIAAC y línea aérea | FlightPath" },
      {
        property: "og:description",
        content:
          "Las preguntas más buscadas del examen CIAAC y la convocatoria de línea aérea, respondidas con datos.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Centro de respuestas: CIAAC y línea aérea | FlightPath" },
      {
        name: "twitter:description",
        content:
          "Respuestas directas, con datos, a las preguntas más buscadas del CIAAC y la convocatoria.",
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
              name: "Centro de respuestas de FlightPath",
              itemListElement: RESPUESTAS_SEO.map((r, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: r.pregunta,
                url: `https://flightpath.mx/respuestas/${r.slug}`,
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
                { "@type": "ListItem", position: 2, name: "Respuestas", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function RespuestasHub() {
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
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-16 lg:pt-24 pb-12 lg:pb-14">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 backdrop-blur px-3 py-1.5 shadow-card">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral-600 animate-pulse-dot" />
                  <span className="text-[12px] font-semibold text-ink/70">
                    Centro de respuestas
                  </span>
                </div>
                <h1 className="font-display mt-6 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
                  Las preguntas del CIAAC,
                  <span className="block text-coral-600 mt-1">respondidas con datos.</span>
                </h1>
                <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
                  Cada página responde una sola pregunta, directo y con fuentes: del examen CIAAC a
                  la convocatoria de línea aérea. Sin rodeos, sin rumores de grupo de WhatsApp.
                </p>
              </div>
              <div className="relative hidden lg:flex items-center justify-center">
                <PathyBubble size={200} />
              </div>
            </div>
          </div>
        </section>

        <section className="relative pb-16 lg:pb-20">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 space-y-12">
            {RESPUESTAS_CATEGORIAS.map((cat) => {
              const items = RESPUESTAS_SEO.filter((r) => r.categoria === cat);
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-5">
                    <Coord>{cat.toUpperCase()}</Coord>
                    <span className="flex-1 h-px bg-ink/8" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {items.map((r) => (
                      <a
                        key={r.slug}
                        href={`/respuestas/${r.slug}`}
                        className="group flex items-start gap-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-5 py-4 hover:border-coral-300 hover:shadow-lift transition-all"
                      >
                        <span className="w-8 h-8 rounded-xl bg-coral-50 text-coral-700 grid place-items-center shrink-0 mt-0.5">
                          <Icon n="chat" className="w-4 h-4" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-[15px] font-semibold text-ink/85 leading-snug">
                            {r.pregunta}
                          </span>
                          <span className="mt-1 block text-[12.5px] text-ink/45 leading-relaxed">
                            {r.respuestaCorta.slice(0, 110)}…
                          </span>
                        </span>
                        <Icon
                          n="chevR"
                          className="w-4 h-4 text-ink/30 group-hover:text-coral-600 transition-colors shrink-0 mt-1"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative py-14 lg:py-16">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8 text-center">
            <h2 className="font-display text-[28px] lg:text-[40px] text-ink leading-tight">
              ¿Tu pregunta es
              <span className="text-coral-600"> "cómo apruebo"?</span>
            </h2>
            <p className="mt-4 text-[16px] text-ink/55 leading-relaxed max-w-[520px] mx-auto">
              Esa se responde practicando: banco de preguntas con explicación, simulacros
              cronometrados y análisis por materia. Empieza gratis.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Crear mi cuenta gratis
              </Btn>
              <Btn kind="light" size="lg" href="/ciaac">
                Conocer el examen CIAAC
              </Btn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
