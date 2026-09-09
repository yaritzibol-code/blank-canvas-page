import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogPost } from "@/lib/blog.functions";
import { BlogProse, extractHeadings } from "@/components/blog/prose";
import { fechaCorta } from "@/routes/blog";
import { AeroBackdrop, Btn, Coord, Footer, Icon, Nav, Pill } from "@/components/landing/shared";

/**
 * Artículo del blog. Contenido, portada y CTA vienen de `blog_posts`, así que
 * publicar o editar un artículo no requiere tocar el frontend.
 */

const BASE = "https://flightpath.mx";

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params }) => {
    const { post, related } = await getBlogPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return { post, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Artículo no disponible | FlightPath" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const canonical = `${BASE}/blog/${post.slug}`;
    const image = post.cover_image ? `${BASE}${post.cover_image}` : null;
    return {
      meta: [
        { title: `${post.title} | FlightPath` },
        { name: "description", content: post.excerpt },
        ...(post.tags?.length ? [{ name: "keywords", content: post.tags.join(", ") }] : []),
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "FlightPath" },
        { property: "og:locale", content: "es_MX" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
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
                headline: post.title,
                description: post.excerpt,
                inLanguage: "es-MX",
                datePublished: post.published_at,
                dateModified: post.updated_at,
                ...(image ? { image } : {}),
                author: { "@type": "Organization", name: post.author, url: BASE },
                publisher: { "@type": "Organization", name: "FlightPath", url: BASE },
                mainEntityOfPage: canonical,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE}/` },
                  { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
                  { "@type": "ListItem", position: 3, name: post.title, item: canonical },
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
  const { post, related } = Route.useLoaderData();
  const indice = extractHeadings(post.content);
  const actualizado =
    post.published_at && post.updated_at.slice(0, 10) !== post.published_at.slice(0, 10)
      ? fechaCorta(post.updated_at)
      : null;

  return (
    <div className="sky-base min-h-screen">
      <AeroBackdrop theme="hueso" />
      <Nav />
      <main>
        {/* Encabezado */}
        <section className="relative">
          <div className="mx-auto max-w-[860px] px-6 lg:px-8 pt-10 lg:pt-14">
            <nav
              aria-label="Breadcrumb"
              className="text-[12.5px] text-ink/45 flex items-center gap-1.5 flex-wrap"
            >
              <a href="/" className="hover:text-ink transition-colors">
                Inicio
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <a href="/blog" className="hover:text-ink transition-colors">
                Blog
              </a>
              <Icon n="chevR" className="w-3 h-3" />
              <span className="text-ink/70 font-semibold">{post.category}</span>
            </nav>

            <div className="relative mt-6 overflow-hidden rounded-[28px] bg-ink px-7 py-10 lg:px-12 lg:py-14 shadow-card">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-coral-500 to-haze-400"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-coral-500/25 to-transparent blur-2xl"
              />
              <div className="relative">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
                  {post.category}
                </span>
                <h1 className="font-display mt-5 text-[30px] sm:text-[40px] lg:text-[48px] leading-[1.05] tracking-tight text-white">
                  {post.title}
                </h1>
                <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/60">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
                  <span>Publicado el {fechaCorta(post.published_at)}</span>
                  {actualizado && <span>Actualizado el {actualizado}</span>}
                  <span>{post.reading_time} min de lectura</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Contenido */}
        <section className="relative pb-8">
          <div className="mx-auto max-w-[720px] px-6 lg:px-8">
            {indice.length >= 3 && (
              <nav
                aria-label="Contenido del artículo"
                className="mt-8 rounded-2xl border border-ink/8 bg-white/70 p-6"
              >
                <div className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-haze-500">
                  En este artículo
                </div>
                <ol className="mt-3 space-y-2">
                  {indice.map((h, i) => (
                    <li key={h.id} className="flex items-start gap-3">
                      <span className="mt-[3px] text-[11px] font-bold text-ink/30 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <a
                        href={`#${h.id}`}
                        className="text-[14.5px] leading-snug text-ink/70 hover:text-coral-700 transition-colors"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <BlogProse content={post.content} />
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-10">
          <div className="mx-auto max-w-[720px] px-6 lg:px-8">
            <div className="rounded-3xl border border-ink/8 bg-white p-7 lg:p-9 shadow-card">
              <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-haze-500">
                ¿Quieres seguir preparándote?
              </div>
              <h2 className="font-display mt-3 text-[22px] lg:text-[26px] tracking-tight text-ink">
                {post.cta_title ?? "Prepárate con FlightPath"}
              </h2>
              {post.cta_text && (
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink/55">{post.cta_text}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Btn kind="primary" size="md" icon="arrow" href={post.cta_link ?? "/precios"}>
                  Ver cómo funciona
                </Btn>
                <Btn kind="light" size="md" to="/register">
                  Crear cuenta gratis
                </Btn>
              </div>
            </div>
          </div>
        </section>

        {/* Relacionados */}
        {related.length > 0 && (
          <section className="relative pb-20">
            <div className="mx-auto max-w-[860px] px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-6">
                <Coord>ARTÍCULOS RELACIONADOS</Coord>
                <span className="flex-1 h-px bg-ink/8" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <a
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group rounded-2xl border border-ink/8 bg-white p-5 transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5"
                  >
                    <Coord>{r.category.toUpperCase()}</Coord>
                    <h3 className="font-display mt-2 text-[16px] leading-snug tracking-tight text-ink">
                      {r.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral-700">
                      Leer <Icon n="chevR" className="w-3.5 h-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
