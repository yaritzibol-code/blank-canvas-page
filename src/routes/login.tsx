import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthPage } from "@/components/auth/AuthPage";

export const Route = createFileRoute("/login")({
  component: () => <AuthPage initialTab="login" />,
  head: () => ({
    meta: [
      { title: "Inicia sesión — FlightPath" },
      { name: "description", content: "Entra a tu cuenta FlightPath para continuar tu preparación del examen CIAAC." },
      { property: "og:title", content: "Inicia sesión — FlightPath" },
      { property: "og:description", content: "Entra a tu cuenta FlightPath y continúa tu preparación CIAAC." },
      { property: "og:url", content: "https://flightpath.mx/login" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://flightpath.mx/login" }],
  }),
});
