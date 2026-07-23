import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/auth/AuthPage";

export const Route = createFileRoute("/register")({
  component: () => <AuthPage initialTab="register" />,
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
