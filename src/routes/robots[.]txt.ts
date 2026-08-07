import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * /robots.txt servido por el servidor de la app (igual que /sitemap.xml):
 * así existe en cualquier despliegue aunque el hosting no sirva archivos
 * estáticos de `public/` en la raíz. Única fuente de verdad de las reglas
 * de rastreo — no dupliques este archivo en `public/`.
 *
 * GEO: los rastreadores de motores generativos (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended…) reciben stanza explícita con las mismas
 * reglas que el resto — el contenido público del sitio está pensado para
 * ser leído y citado por ellos; solo el área privada queda fuera.
 */
const BASE_URL = "https://flightpath.mx";

/** Rutas privadas o sin valor de rastreo (mismas para todos los agentes). */
const DISALLOW = [
  "/admin",
  "/dashboard",
  "/login",
  "/register",
  "/reset-password",
  "/checkout",
  "/api/",
];

/**
 * Rastreadores de IA a los que damos la bienvenida de forma explícita.
 * Todos heredan las mismas reglas que `*`; la stanza es señal de intención.
 */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Bingbot",
  "CCBot",
  "meta-externalagent",
  "Amazonbot",
  "Applebot-Extended",
];

function stanza(agent: string): string {
  return [`User-agent: ${agent}`, "Allow: /", ...DISALLOW.map((d) => `Disallow: ${d}`)].join("\n");
}

const ROBOTS = [
  stanza("*"),
  "",
  ...AI_BOTS.map((b) => stanza(b) + "\n"),
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
