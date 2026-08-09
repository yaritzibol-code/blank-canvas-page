import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { BLOG_POSTS } from "@/lib/seo/blog-posts";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Eyebrow,
  Footer,
  Icon,
  Nav,
  PathyBubble,
  Pill,
  PlaneField,
  type IconName,
} from "@/components/landing/shared";

/**
 * Índice del blog — cluster TOFU "carrera de piloto en México". Lista los
 * artículos reales (datos en `@/lib/seo/blog-posts`) y mantiene la fila de
 * "próximamente" para las piezas planeadas, sin inventar contenido.
 */

const CANONICAL = "https://flightpath.mx/blog";

const ICONO_CATEGORIA: Record<string, IconName> = {
  Carrera: "compass",
  Exámenes: "target",
  Datos: "chart",
};

const PROXIMOS: { tag: string; icon: IconName; t: string; sub: string }[] = [
  {
    tag: "Guía de estudio",
    icon: "cal",
    t: "Cómo organizar tus últimas 4 semanas antes del CIAAC",
    sub: "Un plan semana a semana para llegar al examen con el temario dominado y sin desvelos de pánico.",
  },
  {
    tag: "Materias",
    icon: "book",
    t: "Meteorología sin miedo: los 10 conceptos que más se preguntan",
    sub: "Nubes, frentes y vientos — lo que el examen pregunta una y otra vez, explicado claro.",
  },
];

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog de FlightPath: la carrera de piloto en México, con método" },
      {
        name: "description",
        content:
          "Guías para la carrera de piloto en México: cómo empezar, cuánto cuesta, las licencias PPA/PCA/TPA, el examen CIAAC, el inglés RTARI y datos propios sobre pruebas de aptitud.",
      },
      { property: "og:title", content: "Blog de FlightPath — la carrera de piloto en México" },
      {
        property: "og:description",
        content:
          "Cómo ser piloto, cuánto cuesta, las licencias y los exámenes — guías con método y datos.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Blog",
              name: "Blog de FlightPath",
              url: CANONICAL,
              inLanguage: "es-MX",
              publisher: {
                "@type": "Organization",
                name: "FlightPath",
                url: "https://flightpath.mx",
              },
              blogPost: BLOG_POSTS.map((p) => ({
                "@type": "BlogPosting",
                headline: p.titulo,
                url: `https://flightpath.mx/blog/${p.slug}`,
                datePublished: p.publicado,
                description: p.gancho,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Inicio", item: "https://flightpath.mx/" },
                { "@type": "ListItem", position: 2, name: "Blog", item: CANONICAL },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function BlogPage() {
  useEffect(() => {
    document.body.classList.add("theme-hueso");
    return () => {
      document.body.classList.remove("theme-hueso");
    };
  }, []);

  return (
    <>
      <AeroBackdrop theme="hueso" />
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative">
          <PlaneField count={18} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-16 lg:pt-24 pb-14 lg:pb-16">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
              <div className="relative z-10">
                <Eyebrow>Blog de FlightPath</Eyebrow>
                <h1 className="font-display mt-5 text-[38px] sm:text-[50px] lg:text-[56px] leading-[1.0] tracking-tight text-ink">
                  La carrera de piloto,
                  <br />
                  <span className="text-coral-600">con método y datos.</span>
                </h1>
                <p className="mt-6 text-lg text-ink/55 max-w-xl leading-relaxed">
                  Cómo empezar, cuánto cuesta, qué licencias existen y cómo se ganan los exámenes —
                  todo lo que aprendemos preparando pilotos para el CIAAC y la línea aérea.
                </p>
              </div>
              <div className="relative hidden lg:flex items-center justify-center">
                <PathyBubble size={210} />
              </div>
            </div>
          </div>
        </section>

        {/* Artículos publicados */}
        <section className="relative pb-14">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-7">
              <Coord>ARTÍCULOS</Coord>
              <span className="flex-1 h-px bg-ink/8" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {BLOG_POSTS.map((p) => (
                <a
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group relative rounded-3xl bg-white/90 backdrop-blur-sm border border-ink/8 shadow-card p-7 lg:p-8 overflow-hidden transition-all duration-300 hover:shadow-lift hover:-translate-y-1"
                >
                  <div
                    className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(closest-side, rgba(242,174,188,0.25), transparent)",
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <Pill tone="coral">
                        <Icon n={ICONO_CATEGORIA[p.categoria] ?? "doc"} className="w-3 h-3" />
                        {p.categoria}
                      </Pill>
                      <Coord>{`${p.lecturaMin} MIN · ${p.publicado}`}</Coord>
                    </div>
                    <h2 className="font-display mt-4 text-[20px] lg:text-[22px] leading-snug tracking-tight text-ink">
                      {p.titulo}
                    </h2>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink/55">{p.gancho}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-coral-700 group-hover:text-coral-600 transition-colors">
                      Leer el artículo <Icon n="chevR" className="w-4 h-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* En preparación */}
        <section className="relative pb-16">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-7">
              <Coord>EN PREPARACIÓN</Coord>
              <span className="flex-1 h-px bg-ink/8" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {PROXIMOS.map((p) => (
                <article
                  key={p.t}
                  className="relative rounded-3xl bg-white/70 border border-ink/8 shadow-card p-7 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <Pill tone="ink">
                      <Icon n={p.icon} className="w-3 h-3" />
                      {p.tag}
                    </Pill>
                    <span className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-haze-400">
                      Próximamente
                    </span>
                  </div>
                  <h2 className="font-display mt-4 text-[18px] leading-snug tracking-tight text-ink/80">
                    {p.t}
                  </h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink/50">{p.sub}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8">
            <div className="relative rounded-[28px] bg-ink shadow-navy overflow-hidden p-9 lg:p-12 text-center">
              <div
                className="absolute -top-14 -right-10 w-56 h-56 rounded-full"
                style={{
                  background: "radial-gradient(closest-side, rgba(242,174,188,0.22), transparent)",
                }}
              />
              <div className="relative">
                <h2 className="font-display text-3xl lg:text-[40px] leading-tight tracking-tight text-white">
                  Leer está bien.
                  <br />
                  Practicar <span className="text-coral-400">gana exámenes.</span>
                </h2>
                <p className="mt-4 text-[15px] text-white/60 max-w-md mx-auto leading-relaxed">
                  Crea tu cuenta gratis y convierte la lectura en preparación medida: banco CIAAC,
                  inglés RTARI y aptitudes.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Btn kind="primary" size="lg" icon="arrow" to="/register">
                    Únete a FlightPath
                  </Btn>
                  <Btn kind="outlineLight" size="lg" href="/ciaac">
                    Conocer el examen CIAAC
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
