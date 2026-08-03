import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/auth/AuthPage";

export const Route = createFileRoute("/register")({
  // `next` permite aterrizar en una ruta interna tras crear la cuenta
  // (p. ej. /dashboard/planes?checkout=1 desde la landing de la convocatoria).
  validateSearch: (search: Record<string, unknown>): { next?: string } =>
    typeof search.next === "string" && search.next.startsWith("/") ? { next: search.next } : {},
  component: RegisterRoute,
  head: () => ({
    meta: [
      { title: "Crea tu cuenta — FlightPath CIAAC" },
      { name: "description", content: "Regístrate en FlightPath y empieza a prepararte para el examen CIAAC con simuladores, banco de preguntas y tutores IA." },
      { property: "og:title", content: "Crea tu cuenta — FlightPath" },
      { property: "og:description", content: "Regístrate y empieza tu preparación CIAAC en FlightPath." },
      { property: "og:url", content: "https://flightpath.mx/register" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://flightpath.mx/register" }],
  }),
});

function RegisterRoute() {
  const { next } = Route.useSearch();
  return <AuthPage initialTab="register" redirectTo={next} />;
}
