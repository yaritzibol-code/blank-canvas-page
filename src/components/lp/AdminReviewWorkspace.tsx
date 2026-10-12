import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewItem, ReviewPayload } from "@/lib/lp/admin-review-types";
import {
  materializeReviewPacket,
  validateReviewPacket,
  REVIEW_AUTH_INTERVAL_MS,
  REVIEW_PACKET_EXPECTED_LESSONS,
  REVIEW_PACKET_MAX_BYTES,
  type MaterializedReviewPacket,
  type ReviewPacketEntry,
} from "@/lib/lp/admin-review-packet";
import { AdminReviewLearningPath } from "@/components/lp/AdminReviewLearningPath";

const statusLabels = {
  published: "Publicada · verificada en servidor",
  candidate: "Candidata · revisión privada",
  "source-pending": "Fuente pendiente · reserva",
  incomplete: "Incompleta · requiere revisión",
};
const fieldStyle: CSSProperties = {
  padding: 12,
  background: "#102e48",
  color: "#fff",
  border: "1px solid #d4af6b",
  borderRadius: 8,
};
const cardStyle: CSSProperties = {
  ...fieldStyle,
  width: "100%",
  height: "100%",
  padding: 20,
  textAlign: "left",
  cursor: "pointer",
};
class AccessError extends Error {}
class CancelledReview extends Error {}
type Operation = { generation: number; controller: AbortController };

/** Private files and answers have only this mounted workspace as their owner. */
export function AdminReviewWorkspace({
  publishedItems,
  onPublishedSelect,
  onAccessError,
}: {
  publishedItems: ReviewItem[];
  onPublishedSelect: (id: string) => void;
  onAccessError: (message: string) => void;
}) {
  const [review, setReview] = useState<MaterializedReviewPacket | null>(null);
  const [selected, setSelected] = useState<ReviewPayload["selected"]>(null);
  const [entry, setEntry] = useState<ReviewPacketEntry | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const owner = useRef<MaterializedReviewPacket | null>(null);
  const operation = useRef<Operation | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const busyRef = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const current = useCallback((attempt: Operation) => {
    if (
      !mounted.current ||
      attempt.generation !== generation.current ||
      attempt.controller.signal.aborted
    )
      throw new CancelledReview();
  }, []);
  const begin = useCallback(() => {
    operation.current?.controller.abort();
    const attempt = { generation: ++generation.current, controller: new AbortController() };
    operation.current = attempt;
    busyRef.current = true;
    setBusy(true);
    setError("");
    return attempt;
  }, []);
  const clear = useCallback(() => {
    generation.current++;
    operation.current?.controller.abort();
    operation.current = null;
    owner.current?.dispose();
    owner.current = null;
    busyRef.current = false;
    setReview(null);
    setSelected(null);
    setEntry(null);
    setBusy(false);
    setError("");
    if (input.current) input.current.value = "";
  }, []);
  const authorize = useCallback(
    async (attempt: Operation, id?: string): Promise<ReviewPayload> => {
      try {
        const { data } = await supabase.auth.getSession();
        current(attempt);
        const token = data.session?.access_token;
        if (!token)
          throw new AccessError(
            "Inicia sesión con una cuenta administradora para revisar Learning Paths.",
          );
        const response = await fetch(
          `/api/admin/learning-path-review${id ? `?lp=${encodeURIComponent(id)}` : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: attempt.controller.signal,
          },
        );
        current(attempt);
        if (!response.ok)
          throw new AccessError(
            response.status === 401 || response.status === 403
              ? "Acceso exclusivo para administradores. La revisión privada se ha borrado de memoria."
              : "No se pudo verificar el acceso. Vuelve a iniciar la revisión e importa el archivo.",
          );
        const payload = (await response.json()) as ReviewPayload;
        current(attempt);
        if (!Array.isArray(payload.items) || (id && payload.selected?.item.id !== id))
          throw new AccessError("Respuesta de revisión no válida.");
        return payload;
      } catch (reason) {
        current(attempt);
        if (reason instanceof AccessError) throw reason;
        throw new AccessError(
          "No se pudo verificar el acceso. La revisión privada se ha borrado de memoria.",
        );
      }
    },
    [current],
  );
  const finish = useCallback(
    (attempt: Operation) => {
      current(attempt);
      busyRef.current = false;
      operation.current = null;
      setBusy(false);
    },
    [current],
  );
  const reject = useCallback(
    (attempt: Operation, reason: unknown) => {
      if (
        !mounted.current ||
        attempt.generation !== generation.current ||
        reason instanceof CancelledReview
      )
        return;
      if (reason instanceof AccessError) {
        clear();
        onAccessError(reason.message);
        return;
      }
      finish(attempt);
      setError(reason instanceof Error ? reason.message : "No se pudo importar el archivo.");
    },
    [clear, finish, onAccessError],
  );
  const verifyCatalog = useCallback((active: MaterializedReviewPacket, payload: ReviewPayload) => {
    const published = new Set(payload.items.map((item) => item.id));
    for (const item of active.packet.catalog) {
      if ((item.status === "published") !== published.has(item.id))
        throw new AccessError(
          "Cambió el catálogo autorizado. Importa de nuevo un paquete actualizado.",
        );
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // This counter is intentionally read at teardown to invalidate every pending import.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      operation.current?.controller.abort();
      owner.current?.dispose();
      owner.current = null;
    };
  }, []);
  useEffect(() => {
    const verify = async () => {
      const active = owner.current;
      if (!active || busyRef.current) return;
      const attempt = begin();
      try {
        verifyCatalog(active, await authorize(attempt));
        finish(attempt);
      } catch (reason) {
        reject(attempt, reason);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void verify();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) clear();
    };
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", verify);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(verify, REVIEW_AUTH_INTERVAL_MS);
    return () => {
      window.removeEventListener("pagehide", clear);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", verify);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, [authorize, begin, clear, finish, reject, verifyCatalog]);

  const importFile = async (file: File) => {
    clear(); // Replacement discards the old package before any asynchronous read.
    const attempt = begin();
    try {
      if (file.size > REVIEW_PACKET_MAX_BYTES) throw new Error("El archivo supera 32 MiB.");
      if (!file.name.toLowerCase().endsWith(".json"))
        throw new Error("Selecciona un único archivo JSON de revisión.");
      const first = await authorize(attempt);
      const text = await file.text();
      current(attempt);
      const packet = validateReviewPacket(text, new Set(first.items.map((item) => item.id)));
      // Parsing never grants authorization. Recheck after the asynchronous file read and validation.
      const latest = await authorize(attempt);
      current(attempt);
      const pending = { packet } as MaterializedReviewPacket;
      verifyCatalog(pending, latest);
      const materialized = materializeReviewPacket(packet);
      owner.current = materialized;
      setReview(materialized);
      setQuery("");
      setFilter("all");
      finish(attempt);
      heading.current?.focus();
    } catch (reason) {
      reject(attempt, reason);
    }
  };
  const selectPrivate = async (item: ReviewPacketEntry) => {
    const active = owner.current;
    if (!active) return;
    const attempt = begin();
    setSelected(null);
    setEntry(null);
    try {
      const payload = await authorize(attempt, item.status === "published" ? item.id : undefined);
      verifyCatalog(active, payload);
      current(attempt);
      const document = active.documents[item.id];
      if (item.status === "published") setSelected(payload.selected);
      else if (document)
        setSelected({
          item: {
            id: item.id,
            title: item.title,
            category: "CIAAC",
            subject: item.subject,
            chapter: `${item.code} · Revisión privada`,
            renderer: "approved-aircraft",
          },
          document,
        });
      setEntry(item);
      finish(attempt);
      heading.current?.focus();
    } catch (reason) {
      reject(attempt, reason);
    }
  };
  const backToCatalog = () => {
    operation.current?.controller.abort();
    generation.current++;
    busyRef.current = false;
    setBusy(false);
    setEntry(null);
    setSelected(null);
    heading.current?.focus();
  };
  const matches = (value: string) =>
    value.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"));
  const entries = review?.packet.catalog
    .slice()
    .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code));
  const counts = entries?.reduce(
    (all, item) => {
      all[item.status]++;
      return all;
    },
    { published: 0, candidate: 0, "source-pending": 0, incomplete: 0 },
  );
  return (
    <main style={{ padding: 24, maxWidth: 1400, margin: "auto" }}>
      <h1 ref={heading} tabIndex={-1} style={{ fontSize: "2rem" }}>
        Revisar Learning Paths
      </h1>
      <section
        aria-label="Importar revisión privada"
        style={{ border: "1px solid #d4af6b", padding: 16, borderRadius: 12, marginBottom: 20 }}
      >
        <label htmlFor="private-review-file" style={{ display: "block", fontWeight: 700 }}>
          Importar paquete privado de revisión (.json)
        </label>
        <p>
          El archivo se lee solo en la memoria de esta pestaña y no se sube al servidor. Impórtalo
          una vez por sesión de revisión. Al salir, recargar, cerrar sesión o borrar el paquete, se
          descarta.
        </p>
        <input
          ref={input}
          id="private-review-file"
          type="file"
          accept=".json,application/json"
          aria-describedby="private-review-limits"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
          }}
        />
        <p id="private-review-limits">
          Máximo 32 MiB y 129 recorridos. Respuestas temporales; sin guardar avance, publicar
          contenido ni modificar bloqueos de alumnos.
        </p>
        {(review || busy) && (
          <button type="button" style={fieldStyle} onClick={clear}>
            Borrar paquete privado
          </button>
        )}
      </section>
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Verificando acceso y preparando la revisión…</p>}
      {review && (
        <section
          hidden={busy}
          style={busy ? { display: "none" } : undefined}
          aria-label="Paquete privado"
        >
          <h2>{review.packet.title}</h2>
          <p role="status">
            Catálogo: {entries!.length} de {REVIEW_PACKET_EXPECTED_LESSONS} esperados.{" "}
            {counts!.published} publicadas; {counts!.candidate} candidatas;{" "}
            {counts!["source-pending"]} con fuente pendiente; {counts!.incomplete} incompletas.
          </p>
          {entries!.length < REVIEW_PACKET_EXPECTED_LESSONS && (
            <p role="alert">
              Faltan {REVIEW_PACKET_EXPECTED_LESSONS - entries!.length} recorridos en este archivo.
              Este paquete no acredita que estén completos.
            </p>
          )}
          {entry ? (
            <>
              <button type="button" style={fieldStyle} onClick={backToCatalog}>
                Volver al catálogo privado
              </button>
              <section aria-label="Estado de la lección" style={{ padding: "16px 0" }}>
                <strong>
                  {entry.code} · {statusLabels[entry.status]}
                </strong>
                {entry.notes.length > 0 && (
                  <ul>
                    {entry.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                )}
                {entry.status !== "published" && (
                  <p>
                    Contenido candidato para revisión. Su presencia aquí no indica publicación ni
                    aprobación de fuentes.
                  </p>
                )}
                {!selected && (
                  <p>Documento pendiente: este recorrido no tiene cuerpo en el paquete.</p>
                )}
              </section>
              {selected && (
                <AdminReviewLearningPath
                  key={entry.id}
                  selected={selected}
                  onExit={backToCatalog}
                />
              )}
            </>
          ) : (
            <>
              <label htmlFor="private-review-filter">Estado</label>{" "}
              <select
                id="private-review-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                style={fieldStyle}
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <label htmlFor="review-search" style={{ display: "block", marginTop: 16 }}>
                Buscar por materia, título o código
              </label>
              <input
                id="review-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ ...fieldStyle, width: "100%", margin: "12px 0 24px" }}
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
                {entries!
                  .filter(
                    (item) =>
                      (filter === "all" || item.status === filter) &&
                      matches(`${item.id} ${item.code} ${item.title} ${item.subject}`),
                  )
                  .map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        style={cardStyle}
                        onClick={() => void selectPrivate(item)}
                      >
                        <small>
                          {item.subject} · {item.code}
                        </small>
                        <strong style={{ display: "block", marginTop: 8 }}>{item.title}</strong>
                        <span>{statusLabels[item.status]}</span>
                        {!review.documents[item.id] && item.status !== "published" && (
                          <span style={{ display: "block" }}>Documento pendiente</span>
                        )}
                        {item.notes.length > 0 && (
                          <span style={{ display: "block" }}>
                            {item.notes.length} nota(s) o reserva(s)
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </section>
      )}
      {!busy && !review && (
        <>
          <p>
            Abre cualquier recorrido disponible y salta entre sus etapas, ejercicios y figuras sin
            completar los anteriores.
          </p>
          <p>
            Se incluyen los recorridos CIAAC y Handbook disponibles del temario activo que usan el
            visor nativo compatible. Los recorridos en preparación y otros visores todavía no están
            habilitados aquí. Usa el paquete privado para revisar candidatos.
          </p>
          <label htmlFor="review-search">Buscar por materia, título o código</label>
          <input
            id="review-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ ...fieldStyle, display: "block", width: "100%", margin: "12px 0 24px" }}
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
            {publishedItems
              .filter((item) =>
                matches(`${item.id} ${item.title} ${item.category} ${item.subject}`),
              )
              .map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    style={cardStyle}
                    onClick={() => onPublishedSelect(item.id)}
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
        </>
      )}
    </main>
  );
}
