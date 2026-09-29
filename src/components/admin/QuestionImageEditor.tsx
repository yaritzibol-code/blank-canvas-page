import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { labelStyle, secondaryBtnStyle } from "./AdminShell";
import { supa } from "@/lib/store/cloud";
import { questionImageBucket, questionImageFileError } from "@/lib/question-image-policy";
import { uploadQuestionImage } from "@/lib/admin-question-images.functions";

export interface QuestionImageDraft {
  id: string;
  name?: string;
  file?: File;
}
export function questionImageDrafts(names?: string[]): QuestionImageDraft[] {
  return (names ?? []).map((name, index) => ({ id: `${index}:${name}`, name }));
}

// A retry of the question save reuses its uploaded replacement, never overwrites a shared figure.
const uploaded = new WeakMap<File, Map<string, string>>();
export async function prepareQuestionImages(
  drafts: QuestionImageDraft[],
  fuente?: string,
): Promise<string[]> {
  const names: string[] = [];
  for (const draft of drafts) {
    if (!draft.file) {
      if (draft.name) names.push(draft.name);
      continue;
    }
    const bucket = questionImageBucket(fuente);
    let name = uploaded.get(draft.file)?.get(bucket);
    if (!name) {
      const data = new FormData();
      data.set("image", draft.file);
      if (fuente) data.set("fuente", fuente);
      const result = await uploadQuestionImage({ data });
      if ("error" in result) throw new Error(result.error);
      name = result.name;
      const cache = uploaded.get(draft.file) ?? new Map<string, string>();
      cache.set(bucket, name);
      uploaded.set(draft.file, cache);
    }
    names.push(name);
  }
  return names;
}

function ImagePreview({ draft, fuente }: { draft: QuestionImageDraft; fuente?: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    setUrl("");
    setError(false);
    if (draft.file) {
      const local = URL.createObjectURL(draft.file);
      setUrl(local);
      return () => {
        URL.revokeObjectURL(local);
      };
    }
    void (async () => {
      try {
        const s = supa();
        if (!s || !draft.name) throw new Error("No image");
        const { data, error } = await s.storage
          .from(questionImageBucket(fuente))
          .createSignedUrl(draft.name, 3600);
        if (alive) {
          if (error || !data?.signedUrl) setError(true);
          else setUrl(data.signedUrl);
        }
      } catch {
        if (alive) setError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [draft.name, draft.file, fuente, retry]);
  return (
    <>
      {url && !error && (
        <img
          src={url}
          alt={`Imagen de la pregunta: ${draft.file?.name ?? draft.name}`}
          onError={() => setError(true)}
          style={{
            display: "block",
            width: "100%",
            maxHeight: 220,
            objectFit: "contain",
            background: "white",
            borderRadius: 8,
          }}
        />
      )}
      {error ? (
        <p role="status" style={{ color: "#F0C27A", fontSize: ".78rem", margin: "8px 0" }}>
          No se pudo cargar la imagen asociada. Puedes cambiarla o quitarla.
          <button
            type="button"
            onClick={() => setRetry((n) => n + 1)}
            style={{ ...secondaryBtnStyle, marginTop: 8 }}
          >
            Reintentar imagen
          </button>
        </p>
      ) : !url ? (
        <p role="status" style={{ color: "#93A4BF", fontSize: ".78rem" }}>
          Cargando imagen…
        </p>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...secondaryBtnStyle, marginTop: 8, textDecoration: "none" }}
        >
          Ver imagen
        </a>
      )}
    </>
  );
}

export function QuestionImageEditor({
  drafts,
  fuente,
  disabled,
  onChange,
}: {
  drafts: QuestionImageDraft[];
  fuente?: string;
  disabled?: boolean;
  onChange: (next: QuestionImageDraft[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const replace = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const choose = (id: string | null) => {
    replace.current = id;
    setError(null);
    input.current?.click();
  };
  const picked = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled) return;
    const invalid = questionImageFileError(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    const next = { id: replace.current ?? crypto.randomUUID(), file };
    onChange(
      replace.current
        ? drafts.map((d) => (d.id === replace.current ? next : d))
        : [...drafts, next],
    );
  };
  return (
    <section aria-label="Imágenes de la pregunta" style={{ marginBottom: 14, minWidth: 0 }}>
      <div style={labelStyle}>Imagen / recurso visual</div>
      <input
        ref={input}
        type="file"
        aria-label="Seleccionar imagen de la pregunta"
        accept="image/png,image/jpeg,image/webp"
        onChange={picked}
        disabled={disabled}
        hidden
      />
      {drafts.length === 0 && (
        <p style={{ fontSize: ".78rem", color: "#93A4BF", margin: "8px 0" }}>
          Esta pregunta no tiene imagen.
        </p>
      )}
      {drafts.map((draft, index) => (
        <div
          key={draft.id}
          style={{
            border: "1px solid rgba(199,160,82,.25)",
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              color: "#B8C5DA",
              fontSize: ".72rem",
              marginBottom: 8,
              overflowWrap: "anywhere",
            }}
          >
            Imagen {index + 1} · {draft.file?.name ?? draft.name}
            {draft.file ? " · Cambio pendiente" : ""}
          </div>
          <ImagePreview draft={draft} fuente={fuente} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => choose(draft.id)}
              style={secondaryBtnStyle}
            >
              Cambiar imagen
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(drafts.filter((d) => d.id !== draft.id))}
              style={{ ...secondaryBtnStyle, color: "#F0A09B" }}
            >
              Quitar imagen
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => choose(null)}
        style={secondaryBtnStyle}
      >
        Añadir imagen
      </button>
      <p style={{ color: "#93A4BF", fontSize: ".72rem", margin: "8px 0 0" }}>
        PNG, JPG o WebP · Máximo 8 MB. Los cambios se aplican al guardar la pregunta.
      </p>
      {error && (
        <p role="alert" style={{ color: "#F0A09B", fontSize: ".78rem" }}>
          {error}
        </p>
      )}
    </section>
  );
}
