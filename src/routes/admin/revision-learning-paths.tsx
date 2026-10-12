import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminReviewLearningPath } from "@/components/lp/AdminReviewLearningPath";
import { AdminReviewWorkspace } from "@/components/lp/AdminReviewWorkspace";
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
        <AdminReviewWorkspace
          publishedItems={payload.items}
          onPublishedSelect={select}
          onAccessError={(message) => {
            setResult(null);
            setError(message);
          }}
        />
      )}
    </div>
  );
}
