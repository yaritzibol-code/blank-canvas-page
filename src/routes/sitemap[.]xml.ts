import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { MATERIAS_DEF } from "@/lib/store/materias";
import { FUENTES_SEO } from "@/lib/seo/fuentes-seo";
import { RESPUESTAS_SEO } from "@/lib/seo/respuestas-seo";

const BASE_URL = "https://flightpath.mx";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/ciaac", changefreq: "weekly", priority: "0.9" },
          { path: "/convocatoria-aeromexico", changefreq: "weekly", priority: "0.9" },
          { path: "/precios", changefreq: "monthly", priority: "0.8" },
          { path: "/calculadora-ciaac", changefreq: "monthly", priority: "0.8" },
          { path: "/linea-aerea", changefreq: "weekly", priority: "0.8" },
          // Cluster CIAAC: una guía por materia (mismo catálogo que la app).
          ...MATERIAS_DEF.map((m) => ({
            path: `/ciaac/${m.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          // Cluster Línea Aérea: una guía por fuente del temario.
          ...FUENTES_SEO.map((f) => ({
            path: `/linea-aerea/${f.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),

          // Capa AEO/GEO: comparativas, entidad, estacional y features.
          { path: "/mejor-plataforma-ciaac", changefreq: "monthly", priority: "0.9" },
          { path: "/mejor-plataforma-convocatoria-aeromexico", changefreq: "monthly", priority: "0.9" },
          { path: "/convocatoria-ciaac-2026", changefreq: "weekly", priority: "0.9" },
          { path: "/banco-de-preguntas-ciaac", changefreq: "monthly", priority: "0.8" },
          { path: "/simulador-ciaac", changefreq: "monthly", priority: "0.8" },
          { path: "/sobre-flightpath", changefreq: "monthly", priority: "0.7" },
          { path: "/respuestas", changefreq: "weekly", priority: "0.8" },
          // Centro de respuestas: una página por pregunta conversacional.
          ...RESPUESTAS_SEO.map((r) => ({
            path: `/respuestas/${r.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),

          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/legal", changefreq: "yearly", priority: "0.3" },
          { path: "/register", changefreq: "monthly", priority: "0.5" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
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
