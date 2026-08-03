import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * /robots.txt servido por el servidor de la app (igual que /sitemap.xml):
 * así existe en cualquier despliegue aunque el hosting no sirva archivos
 * estáticos de `public/` en la raíz. Única fuente de verdad de las reglas
 * de rastreo — no dupliques este archivo en `public/`.
 */
const BASE_URL = "https://flightpath.mx";

const ROBOTS = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /admin",
  "Disallow: /dashboard",
  "Disallow: /login",
  "Disallow: /register",
  "Disallow: /reset-password",
  "Disallow: /checkout",
  "Disallow: /api/",
  "",
  `Sitemap: ${BASE_URL}/sitemap.xml`,
  "",
].join("\n");

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(ROBOTS, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
