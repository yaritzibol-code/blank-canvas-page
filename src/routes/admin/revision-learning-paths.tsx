import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminReviewLearningPath } from "@/components/lp/AdminReviewLearningPath";
import type { ReviewPayload } from "@/lib/lp/admin-review-types";

export const Route = createFileRoute("/admin/revision-learning-paths")({
  validateSearch: (search: Record<string, unknown>): { lp?: string } => ({
    lp: typeof search.lp === "string" ? search.lp : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Revisión de Learning Paths · FlightPath" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLearningPathReviewPage,
});

function AdminLearningPathReviewPage() {
  const { lp } = Route.useSearch();
  const navigate = useNavigate();
  const [result, setResult] = useState<{ lp?: string; payload: ReviewPayload } | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | undefined;
    let generation = 0;
    const load = async () => {
      const attempt = ++generation;
      controller?.abort();
      controller = new AbortController();
      setResult(null);
      setError("");
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled || attempt !== generation) return;
        const token = data.session?.access_token;
        if (!token)
          throw new Error(
            "Inicia sesión con una cuenta administradora para revisar Learning Paths.",
          );
        const response = await fetch(
          `/api/admin/learning-path-review${lp ? `?lp=${encodeURIComponent(lp)}` : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!response.ok)
          throw new Error(
            response.status === 401 || response.status === 403
              ? "Acceso exclusivo para administradores. Tu cuenta no tiene autorización para revisar Learning Paths."
              : response.status === 404
                ? "Este recorrido no está disponible para revisión."
                : "No se pudo verificar el acceso. Inténtalo recargando la página.",
          );
        const payload = (await response.json()) as ReviewPayload;
        if (!cancelled && attempt === generation) setResult({ lp, payload });
      } catch (reason) {
        if (!cancelled && attempt === generation)
          setError(reason instanceof Error ? reason.message : "No se pudo verificar el acceso.");
      }
    };
    void load();
    // Authentication changes revoke the mounted review immediately; each load rechecks the server.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        generation++;
        controller?.abort();
        setResult(null);
        setError("Inicia sesión con una cuenta administradora para revisar Learning Paths.");
      } else if (event !== "INITIAL_SESSION") {
        setResult(null);
        void load();
      }
    });
    return () => {
      cancelled = true;
      controller?.abort();
      listener.subscription.unsubscribe();
    };
  }, [lp]);

  const payload = result?.lp === lp ? result?.payload : null;
  const select = (id?: string) =>
    void navigate({ to: "/admin/revision-learning-paths", search: id ? { lp: id } : {} });
  return (
    <div style={{ minHeight: "100vh", background: "#071b31", color: "#f8f0df" }}>
      <header
        style={{
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          borderBottom: "1px solid #d4af6b",
        }}
      >
        <strong>Revisión de administrador · Sin guardar avance</strong>
        <span>Las respuestas son temporales. Los bloqueos de alumnos no cambian.</span>
        <a href="/admin" style={{ marginLeft: "auto", color: "#f2d6a0" }}>
          Salir al panel
        </a>
      </header>
      {error ? (
        <div style={{ padding: 24 }}>
          <p role="alert">{error}</p>
          <a href="/login" style={{ color: "#f2d6a0" }}>
            Iniciar sesión
          </a>
          {lp && (
            <button type="button" onClick={() => select()}>
              Volver al selector
            </button>
          )}
        </div>
      ) : !payload ? (
        <p role="status" style={{ padding: 24 }}>
          Verificando acceso de administrador…
        </p>
      ) : payload.selected ? (
        <AdminReviewLearningPath selected={payload.selected} onExit={() => select()} />
      ) : (
        <main style={{ padding: 24, maxWidth: 1200, margin: "auto" }}>
          <h1 style={{ fontSize: "2rem" }}>Revisar Learning Paths</h1>
          <p>
            Abre cualquier recorrido disponible y salta entre sus etapas, ejercicios y figuras sin
            completar los anteriores.
          </p>
          <p>
            Se incluyen los recorridos CIAAC y Handbook disponibles del temario activo que usan el
            visor nativo compatible. Los recorridos en preparación y otros visores todavía no están
            habilitados aquí.
          </p>
          <label htmlFor="review-search">Buscar por materia, título o código</label>
          <input
            id="review-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              margin: "12px 0 24px",
              padding: 12,
              background: "#102e48",
              color: "white",
              border: "1px solid #d4af6b",
              borderRadius: 8,
            }}
          />
          <ul
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              listStyle: "none",
              padding: 0,
            }}
          >
            {payload.items
              .filter((item) =>
                `${item.id} ${item.title} ${item.category} ${item.subject}`
                  .toLocaleLowerCase("es")
                  .includes(query.toLocaleLowerCase("es")),
              )
              .map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => select(item.id)}
                    style={{
                      width: "100%",
                      height: "100%",
                      padding: 20,
                      background: "#102e48",
                      color: "#f8f0df",
                      border: "1px solid #d4af6b66",
                      borderRadius: 12,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <small>
                      {item.category} · {item.subject}
                    </small>
                    <strong style={{ display: "block", marginTop: 8 }}>{item.title}</strong>
                    <span>{item.chapter}</span>
                  </button>
                </li>
              ))}
          </ul>
        </main>
      )}
    </div>
  );
}
