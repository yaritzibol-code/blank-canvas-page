import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listBlogPosts, type BlogPostCard } from "@/lib/blog.functions";
import {
  AeroBackdrop,
  Btn,
  Coord,
  Eyebrow,
  Footer,
  Icon,
  Nav,
  Pill,
  PlaneField,
} from "@/components/landing/shared";

/**
 * Índice del blog. El contenido vive en la tabla `blog_posts`: aquí solo se
 * ordena y se presenta (destacado, categorías y últimos artículos).
 */

const CANONICAL = "https://flightpath.mx/blog";

const CATEGORIAS = ["CIAAC", "Aerolíneas", "Convocatorias"] as const;

export function fechaCorta(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export const Route = createFileRoute("/blog")({
  loader: async () => ({ posts: await listBlogPosts() }),
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog de FlightPath: CIAAC, aerolíneas y convocatorias" },
      {
        name: "description",
        content:
          "Información para avanzar en tu carrera como piloto: guías del CIAAC y el EGE-PC, requisitos de aerolíneas y cómo prepararte para una convocatoria.",
      },
      { property: "og:title", content: "Blog de FlightPath" },
      {
        property: "og:description",
        content: "Información para avanzar en tu carrera como piloto.",
      },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FlightPath" },
      { property: "og:locale", content: "es_MX" },
      { property: "og:image", content: "https://flightpath.mx/blog/portada-ciaac.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://flightpath.mx/blog/portada-ciaac.jpg" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
});

/** Acento visual por categoría (sustituye a las portadas fotográficas). */
const ACENTO: Record<string, { grad: string; code: string }> = {
  CIAAC: { grad: "from-coral-500 to-coral-300", code: "EGE-PC" },
  Aerolíneas: { grad: "from-ink to-haze-500", code: "AIRLINE" },
  Convocatorias: { grad: "from-haze-600 to-coral-400", code: "CONVOC" },
};

function acento(cat: string) {
  return ACENTO[cat] ?? { grad: "from-ink to-haze-500", code: "FLIGHTPATH" };
}


function BlogPage() {
  const { posts } = Route.useLoaderData();
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("theme-hueso");
    return () => {
      document.body.classList.remove("theme-hueso");
    };
  }, []);

  const destacado = useMemo(() => posts.find((p) => p.featured) ?? posts[0] ?? null, [posts]);
  const lista = useMemo(
    () =>
      posts.filter((p) => (!destacado || p.slug !== destacado.slug) && (!cat || p.category === cat)),
    [posts, cat, destacado],
  );

  return (
    <>
      <AeroBackdrop theme="hueso" />
      <Nav />
      <main>
        {/* Encabezado */}
        <section className="relative">
          <PlaneField count={14} />
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14 lg:pt-20 pb-8">
            <Eyebrow>Blog</Eyebrow>
            <h1 className="font-display mt-5 text-[36px] sm:text-[46px] lg:text-[54px] leading-[1.03] tracking-tight text-ink">
              Blog
            </h1>
            <p className="mt-4 text-lg text-ink/55 max-w-xl leading-relaxed">
              Información para avanzar en tu carrera como piloto.
            </p>
          </div>
        </section>

        {/* Artículo destacado */}
        {destacado && (
          <section className="relative pb-10">
            <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
              <a
                href={`/blog/${destacado.slug}`}
                className="group grid lg:grid-cols-[1.05fr_1fr] gap-0 overflow-hidden rounded-[28px] border border-ink/8 bg-white shadow-card transition-all duration-300 hover:shadow-lift"
              >
                <Portada post={destacado} className="h-56 w-full lg:h-full min-h-[220px]" />
                <div className="p-7 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Pill tone="coral">{destacado.category}</Pill>
                    <Coord>DESTACADO</Coord>
                  </div>
                  <h2 className="font-display mt-4 text-[24px] lg:text-[32px] leading-tight tracking-tight text-ink">
                    {destacado.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/55">
                    {destacado.excerpt}
                  </p>
                  <div className="mt-5 text-[12.5px] text-ink/40">
                    {fechaCorta(destacado.published_at)} · {destacado.reading_time} min de lectura
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-coral-700 group-hover:text-coral-600 transition-colors">
                    Leer el artículo <Icon n="chevR" className="w-4 h-4" />
                  </span>
                </div>
              </a>
            </div>
          </section>
        )}

        {/* Categorías */}
        <section className="relative pb-6">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setCat(null)}
                aria-pressed={cat === null}
                className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                  cat === null
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 bg-white text-ink/65 hover:border-coral-300 hover:text-coral-700"
                }`}
              >
                Todos
              </button>
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                    cat === c
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink/65 hover:border-coral-300 hover:text-coral-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Últimos artículos */}
        <section className="relative pb-16">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-7">
              <Coord>ÚLTIMOS ARTÍCULOS</Coord>
              <span className="flex-1 h-px bg-ink/8" />
            </div>
            {lista.length === 0 ? (
              <p className="text-[14.5px] text-ink/50">
                Todavía no hay artículos en esta categoría.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {lista.map((p) => (
                  <a
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5"
                  >
                    <Portada post={p} className="h-40 w-full" />
                    <div className="flex flex-1 flex-col p-6">
                      <Pill tone="ink">{p.category}</Pill>
                      <h3 className="font-display mt-3 text-[18px] leading-snug tracking-tight text-ink">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink/55 flex-1">
                        {p.excerpt}
                      </p>
                      <div className="mt-4 text-[12px] text-ink/40">
                        {fechaCorta(p.published_at)} · {p.reading_time} min
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cierre */}
        <section className="relative pb-20">
          <div className="mx-auto max-w-[820px] px-6 lg:px-8">
            <div className="rounded-[28px] border border-ink/8 bg-white p-9 lg:p-11 text-center shadow-card">
              <h2 className="font-display text-[24px] lg:text-[30px] leading-tight tracking-tight text-ink">
                ¿Quieres seguir preparándote?
              </h2>
              <p className="mt-3 text-[15px] text-ink/55 max-w-md mx-auto leading-relaxed">
                Banco de preguntas, simulador, inglés RTARI y análisis de tus errores en un solo
                lugar.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Btn kind="primary" size="lg" icon="arrow" to="/register">
                  Crear cuenta gratis
                </Btn>
                <Btn kind="light" size="lg" href="/ciaac">
                  Conocer el examen CIAAC
                </Btn>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
