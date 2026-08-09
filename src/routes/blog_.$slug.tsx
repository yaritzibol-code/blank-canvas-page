import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { blogPostBySlug, BLOG_POSTS, type BlogPost } from "@/lib/seo/blog-posts";
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
} from "@/components/landing/shared";

/**
 * Artículo del blog /blog/$slug — cluster TOFU "carrera de piloto en México".
 * Patrón answer-first: resumen citable arriba, H2 temáticos, FAQs con <h3> y
 * Article + FAQPage + BreadcrumbList en JSON-LD. Contenido en
 * `@/lib/seo/blog-posts` (reglas de COMPLIANCE.md aplicadas ahí).
 */

const BASE = "https://flightpath.mx";

export const Route = createFileRoute("/blog_/$slug")({
  loader: ({ params }) => {
    const post = blogPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Blog — FlightPath" }] };
    const { post } = loaderData;
    const canonical = `${BASE}/blog/${post.slug}`;
    return {
      meta: [
        { title: `${post.titulo} | FlightPath` },
        { name: "description", content: post.resumen },
        { name: "keywords", content: post.keywords },
        { property: "og:title", content: post.titulo },
        { property: "og:description", content: post.gancho },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "FlightPath" },
        { property: "og:locale", content: "es_MX" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.titulo },
        { name: "twitter:description", content: post.gancho },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: post.titulo,
                description: post.resumen,
                inLanguage: "es-MX",
                datePublished: post.publicado,
                dateModified: post.publicado,
                author: {
                  "@type": "Organization",
                  name: "FlightPath",
                  url: BASE,
                },
                publisher: { "@type": "Organization", name: "FlightPath", url: BASE },
                mainEntityOfPage: canonical,
              },
              {
                "@type": "FAQPage",
                mainEntity: post.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE}/` },
                  { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
                  { "@type": "ListItem", position: 3, name: post.titulo, item: canonical },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData() as { post: BlogPost };
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const relacionados = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="sky-base min-h-screen">
      <AeroBackdrop />
      <Nav />
      <main>
        {/* Hero + resumen citable */}
        <section className="relative">
          <PlaneField count={14} />
          <div className="mx-auto max-w-[860px] px-6 lg:px-8 pt-14 lg:pt-20 pb-10">
            <nav
              aria-label="Breadcrumb"
              className="text-[12.5px] text-ink/45 flex items-center gap-1.5"
            >
              <a href="/" className="hover:text-ink transition-colors">
                Inicio
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <a href="/blog" className="hover:text-ink transition-colors">
                Blog
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <span className="text-ink/70 font-semibold">{post.categoria}</span>
            </nav>
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <Pill tone="coral">{post.categoria}</Pill>
              <Coord>{`PUBLICADO · ${post.publicado}`}</Coord>
              <Coord>{`LECTURA · ${post.lecturaMin} MIN`}</Coord>
            </div>
            <h1 className="font-display mt-4 text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.04] tracking-tight text-ink">
              {post.titulo}
            </h1>
            <div className="mt-7 rounded-3xl bg-ink text-white shadow-navy p-6 lg:p-8 relative overflow-hidden">
              <div
                className="absolute -top-14 -right-14 w-52 h-52 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(closest-side, rgba(242,174,188,0.20), transparent)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-coral-400 mb-3">
                  <Icon n="spark" className="w-4 h-4" /> En corto
                </div>
                <p className="text-[16px] lg:text-[17px] leading-relaxed text-white/90">
                  {post.resumen}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cuerpo */}
        <section className="relative pb-6">
          <div className="mx-auto max-w-[760px] px-6 lg:px-8">
            {post.secciones.map((s) => (
              <div key={s.h2} className="mt-10">
                <h2 className="font-display text-[24px] lg:text-[28px] text-ink tracking-tight">
                  {s.h2}
                </h2>
                {s.parrafos.map((p, i) => (
                  <p key={i} className="mt-4 text-[15.5px] text-ink/65 leading-relaxed">
                    {p}
                  </p>
                ))}
                {s.lista && (
                  <ul className="mt-4 space-y-2.5">
                    {s.lista.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Icon
                          n="check"
                          className="w-4 h-4 text-coral-600 mt-1 shrink-0"
                          sw={2.2}
                        />
                        <span className="text-[14.5px] text-ink/65 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-12" id="faq">
          <div className="mx-auto max-w-[760px] px-6 lg:px-8">
            <h2 className="font-display text-[24px] lg:text-[28px] text-ink tracking-tight">
              Preguntas frecuentes
            </h2>
            <div className="mt-6 space-y-3">
              {post.faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/8 shadow-card px-6 py-5"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15.5px] font-semibold text-ink">
                    <h3 style={{ margin: 0, font: "inherit" }}>{f.q}</h3>
                    <span className="text-coral-600 shrink-0 transition-transform group-open:rotate-180">
                      <Icon n="chevD" className="w-4 h-4" />
                    </span>
                  </summary>
                  <p className="mt-4 text-[14.5px] text-ink/60 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Profundiza */}
        <section className="relative py-10">
          <div className="mx-auto max-w-[760px] px-6 lg:px-8">
            <div className="rounded-3xl bg-white border border-ink/8 shadow-card p-6 lg:p-7">
              <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-haze-500">
                Profundiza
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {post.paginas.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 py-2 text-[13.5px] font-semibold text-ink/75 hover:border-coral-300 hover:text-coral-700 transition-colors"
                  >
                    {p.label} <Icon n="chevR" className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section className="relative py-14 lg:py-20">
          <div className="mx-auto max-w-[760px] px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <PathyBubble size={96} />
            </div>
            <h2 className="font-display text-[26px] lg:text-[34px] text-ink leading-tight">
              La carrera se construye
              <span className="block text-coral-600">una sesión a la vez.</span>
            </h2>
            <p className="mt-4 text-[15px] text-ink/55 leading-relaxed max-w-[520px] mx-auto">
              Crea tu cuenta gratis y empieza hoy: banco CIAAC, inglés RTARI, aptitudes y manuales
              — todo el camino del piloto mexicano en un solo lugar.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Btn kind="primary" size="lg" icon="arrow" to="/register">
                Empezar gratis
              </Btn>
              {relacionados.map((r) => (
                <Btn key={r.slug} kind="light" size="lg" href={`/blog/${r.slug}`}>
                  {r.categoria === "Datos" ? "Ver los datos" : "Seguir leyendo"}: {r.titulo.split(":")[0]}
                </Btn>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
