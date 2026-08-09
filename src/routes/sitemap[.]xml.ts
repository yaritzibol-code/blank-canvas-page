import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { MATERIAS_DEF } from "@/lib/store/materias";
import { FUENTES_SEO } from "@/lib/seo/fuentes-seo";
import { RESPUESTAS_PUBLICADO, RESPUESTAS_SEO } from "@/lib/seo/respuestas-seo";
import { BLOG_POSTS } from "@/lib/seo/blog-posts";

const BASE_URL = "https://flightpath.mx";

/** Última edición editorial de las capas del sitio (actualízalas al editar). */
const V1 = "2026-08-06"; // primera ola SEO
const V2 = "2026-08-09"; // ola AEO/GEO: verticales nuevas + formato snippet

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  /** ISO YYYY-MM-DD de la última modificación real del contenido. */
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: V2 },
          { path: "/ciaac", changefreq: "weekly", priority: "0.9", lastmod: V2 },
          { path: "/convocatoria-aeromexico", changefreq: "weekly", priority: "0.9", lastmod: V2 },
          { path: "/precios", changefreq: "monthly", priority: "0.8", lastmod: V2 },
          { path: "/calculadora-ciaac", changefreq: "monthly", priority: "0.8", lastmod: V2 },
          { path: "/linea-aerea", changefreq: "weekly", priority: "0.8", lastmod: V2 },
          // Cluster CIAAC: una guía por materia (mismo catálogo que la app).
          ...MATERIAS_DEF.map((m) => ({
            path: `/ciaac/${m.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
            lastmod: V2,
          })),
          // Cluster Línea Aérea: una guía por fuente del temario.
          ...FUENTES_SEO.map((f) => ({
            path: `/linea-aerea/${f.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
            lastmod: V1,
          })),

          // Capa AEO/GEO: comparativas, entidad, estacional y features.
          { path: "/mejor-plataforma-ciaac", changefreq: "monthly", priority: "0.9", lastmod: V2 },
          {
            path: "/mejor-plataforma-convocatoria-aeromexico",
            changefreq: "monthly",
            priority: "0.9",
            lastmod: V2,
          },
          { path: "/convocatoria-ciaac-2026", changefreq: "weekly", priority: "0.9", lastmod: V2 },
          { path: "/banco-de-preguntas-ciaac", changefreq: "monthly", priority: "0.8", lastmod: V2 },
          { path: "/simulador-ciaac", changefreq: "monthly", priority: "0.8", lastmod: V2 },
          // Verticales long-tail: inglés RTARI, aptitudes tipo COMPASS y 737 MAX.
          { path: "/examen-rtari", changefreq: "monthly", priority: "0.9", lastmod: V2 },
          { path: "/examen-compass", changefreq: "monthly", priority: "0.9", lastmod: V2 },
          { path: "/estudiar-737-max", changefreq: "monthly", priority: "0.9", lastmod: V2 },
          { path: "/sobre-flightpath", changefreq: "monthly", priority: "0.7", lastmod: V1 },
          { path: "/respuestas", changefreq: "weekly", priority: "0.8", lastmod: V2 },
          // Centro de respuestas: una página por pregunta conversacional.
          ...RESPUESTAS_SEO.map((r) => ({
            path: `/respuestas/${r.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
            lastmod: r.publicado ?? RESPUESTAS_PUBLICADO,
          })),

          { path: "/faq", changefreq: "monthly", priority: "0.7", lastmod: V2 },
          { path: "/blog", changefreq: "weekly", priority: "0.7", lastmod: V2 },
          // Artículos del blog (cluster TOFU de carrera).
          ...BLOG_POSTS.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
            lastmod: p.publicado,
          })),
          { path: "/legal", changefreq: "yearly", priority: "0.3" },
          // /register queda fuera a propósito: está bloqueada en robots.txt y
          // listarla aquí mandaba señales contradictorias a Google.
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
