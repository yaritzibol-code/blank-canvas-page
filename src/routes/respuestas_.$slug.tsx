import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  RESPUESTAS_PUBLICADO,
  RESPUESTAS_SEO,
  respuestaBySlug,
  type RespuestaSeo,
} from "@/lib/seo/respuestas-seo";
import { AeroBackdrop, Btn, Coord, Footer, Icon, Nav, Pill } from "./index";

/**
 * Cluster AEO/GEO /respuestas/$slug — una página por pregunta conversacional,
 * con el patrón answer-first: bloque de respuesta directa citable (40–60
 * palabras), H2 en formato pregunta, párrafos cortos y FAQPage + Article +
 * BreadcrumbList en JSON-LD. Contenido en `@/lib/seo/respuestas-seo`
 * (solo hechos del sitio; ver COMPLIANCE.md).
 */

const BASE = "https://flightpath.mx";

export const Route = createFileRoute("/respuestas_/$slug")({
  loader: ({ params }) => {
    const r = respuestaBySlug(params.slug);
    if (!r) throw notFound();
    return { r };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Respuestas — FlightPath" }] };
    const { r } = loaderData;
    const canonical = `${BASE}/respuestas/${r.slug}`;
    const title = `${r.pregunta} | FlightPath`;
    return {
      meta: [
        { title },
        { name: "description", content: r.respuestaCorta },
        { name: "keywords", content: r.keywords },
        { property: "og:title", content: r.pregunta },
        { property: "og:description", content: r.respuestaCorta },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "FlightPath" },
        { property: "og:locale", content: "es_MX" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: r.pregunta },
        { name: "twitter:description", content: r.respuestaCorta },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: r.pregunta,
                    acceptedAnswer: { "@type": "Answer", text: r.respuestaCorta },
                  },
                  ...r.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                ],
              },
              {
                "@type": "Article",
                headline: r.pregunta,
                description: r.respuestaCorta,
                inLanguage: "es-MX",
                datePublished: RESPUESTAS_PUBLICADO,
                dateModified: RESPUESTAS_PUBLICADO,
                author: { "@type": "Organization", name: "FlightPath", url: BASE },
                publisher: { "@type": "Organization", name: "FlightPath", url: BASE },
                mainEntityOfPage: canonical,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Respuestas",
                    item: `${BASE}/respuestas`,
                  },
                  { "@type": "ListItem", position: 3, name: r.pregunta, item: canonical },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: RespuestaPage,
});

function Relacionadas({ r }: { r: RespuestaSeo }) {
  const items = r.relacionadas
    .map((slug) => RESPUESTAS_SEO.find((x) => x.slug === slug))
    .filter((x): x is RespuestaSeo => Boolean(x));
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-haze-500 mb-4">
        Otras preguntas relacionadas
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((x) => (
          <a
            key={x.slug}
            href={`/respuestas/${x.slug}`}
            className="group flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-ink/8 shadow-card px-4 py-3.5 hover:border-coral-300 hover:shadow-lift transition-all"
          >
            <span className="flex-1 text-[14px] font-semibold text-ink/80 leading-snug">
              {x.pregunta}
            </span>
            <Icon
              n="chevR"
              className="w-4 h-4 text-ink/30 group-hover:text-coral-600 transition-colors shrink-0"
            />
          </a>
        ))}
      </div>
    </section>
  );
}

function RespuestaPage() {
  const { r }: { r: RespuestaSeo } = Route.useLoaderData();

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
      <main className="mx-auto max-w-[860px] px-6 lg:px-8 pt-12 lg:pt-16 pb-20">
        <nav
          aria-label="Breadcrumb"
          className="text-[12.5px] text-ink/45 flex items-center gap-1.5 flex-wrap"
        >
          <a href="/" className="hover:text-ink transition-colors">
            Inicio
          </a>
          <Icon n="chevR" className="w-3 h-3" />
          <a href="/respuestas" className="hover:text-ink transition-colors">
            Respuestas
          </a>
          <Icon n="chevR" className="w-3 h-3" />
          <span className="text-ink/70 font-semibold">{r.categoria}</span>
        </nav>

        <div className="mt-6 flex items-center gap-3">
          <Pill tone="coral">{r.categoria}</Pill>
          <Coord>{`ACTUALIZADO · ${RESPUESTAS_PUBLICADO}`}</Coord>
        </div>

        <h1 className="font-display mt-4 text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.04] tracking-tight text-ink">
          {r.pregunta}
        </h1>

        {/* Bloque de respuesta directa — el snippet citable (AEO/GEO). */}
        <div className="mt-7 rounded-3xl bg-ink text-white shadow-navy p-6 lg:p-8 relative overflow-hidden">
          <div
            className="absolute -top-14 -right-14 w-52 h-52 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(closest-side, rgba(242,174,188,0.20), transparent)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-coral-400 mb-3">
              <Icon n="spark" className="w-4 h-4" /> Respuesta rápida
            </div>
            <p className="text-[16.5px] lg:text-[18px] leading-relaxed text-white/90">
              {r.respuestaCorta}
            </p>
          </div>
        </div>

        {r.dato && (
          <div className="mt-5 flex items-center gap-5 rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-6 py-5">
            <div className="font-display text-[38px] lg:text-[44px] leading-none text-coral-600 shrink-0">
              {r.dato.valor}
            </div>
            <div>
              <div className="text-[14.5px] font-semibold text-ink/80 leading-snug">
                {r.dato.etiqueta}
              </div>
              <div className="text-[12px] text-ink/45 mt-0.5">Fuente: {r.dato.fuente}</div>
            </div>
          </div>
        )}

        <article className="mt-10 space-y-9">
          {r.secciones.map((s) => (
            <section key={s.h2}>
              <h2 className="font-display text-[22px] lg:text-[26px] tracking-tight text-ink">
                {s.h2}
              </h2>
              <div className="mt-3 space-y-3.5">
                {s.parrafos.map((p) => (
                  <p key={p.slice(0, 40)} className="text-[15px] leading-relaxed text-ink/65">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        {r.paginas.length > 0 && (
          <div className="mt-10 rounded-3xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold text-haze-500 mb-4">
              <Icon n="compass" className="w-4 h-4 text-coral-600" /> Para profundizar en FlightPath
            </div>
            <div className="flex flex-wrap gap-2.5">
              {r.paginas.map((p) => (
                <a
                  key={p.href + p.label}
                  href={p.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-coral-300/50 bg-coral-50 px-3.5 py-1.5 text-[13px] font-semibold text-coral-700 hover:bg-coral-100 transition-colors"
                >
                  {p.label} <Icon n="chevR" className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        )}

        <section className="mt-12" id="faq">
          <h2 className="font-display text-[22px] lg:text-[26px] tracking-tight text-ink">
            Preguntas frecuentes
          </h2>
          <div className="mt-5 space-y-3">
            {r.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-6 py-5"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15px] font-semibold text-ink">
                  {f.q}
                  <span className="text-coral-600 shrink-0 transition-transform group-open:rotate-180">
                    <Icon n="chevD" className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-4 text-[14.5px] text-ink/60 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Relacionadas r={r} />

        <div className="mt-12 rounded-2xl border border-ink/8 bg-white/70 px-6 py-5 text-[13px] text-ink/50 leading-relaxed">
          <strong className="text-ink/70">Aviso.</strong> FlightPath es una plataforma independiente
          de preparación: no está afiliada a la AFAC, al CIAAC, a ASPA de México ni a ninguna
          aerolínea. La información administrativa oficial (fechas, trámites, requisitos) debe
          verificarse siempre en las fuentes oficiales.
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Btn kind="primary" size="lg" icon="arrow" to="/register">
            Empezar a prepararme gratis
          </Btn>
          <Btn kind="light" size="lg" href="/respuestas">
            Ver todas las respuestas
          </Btn>
        </div>
      </main>
      <Footer />
    </div>
  );
}
