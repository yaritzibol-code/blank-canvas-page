import { createFileRoute } from "@tanstack/react-router";
import { BancoScreen } from "@/components/banco/BancoScreen";

export const Route = createFileRoute("/dashboard/banco")({
  component: BancoPage,
  validateSearch: (
    s: Record<string, unknown>,
  ): { banco?: "la"; open?: "examen" | "aprendiendo" } => {
    const out: { banco?: "la"; open?: "examen" | "aprendiendo" } = {};
    if (s["banco"] === "la") out.banco = "la";
    if (s["open"] === "examen" || s["open"] === "aprendiendo") out.open = s["open"];
    return out;
  },
});

function BancoPage() {
  const search = Route.useSearch();
  // CIAAC no muestra el panel de Extras del cuestionario.
  return <BancoScreen la={search.banco === "la"} extras={false} initialModal={search.open ?? null} />;
}
