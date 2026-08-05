/**
 * Láminas de una pregunta (manual Jeppesen).
 *
 * Las imágenes viven en el bucket privado `jeppesen-images` con el mismo
 * nombre que trae el reactivo (ej. `jeppesen_gam_page_0174.png`), así que se
 * piden URLs firmadas al vuelo para el estudiante con sesión iniciada.
 */
import { useEffect, useState } from "react";
import { supa } from "@/lib/store/cloud";

const BUCKET = "jeppesen-images";
const TTL = 60 * 60; // 1 hora

/** Cache de la sesión: evita volver a firmar la misma lámina al navegar. */
const signed = new Map<string, string>();

export function QuestionImages({ files }: { files?: string[] }) {
  const key = (files ?? []).join(",");
  const [urls, setUrls] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const names = key ? key.split(",") : [];
    if (names.length === 0) {
      setUrls([]);
      return;
    }
    let alive = true;
    setFailed(false);

    const cached = names.map((n) => signed.get(n));
    if (cached.every((u): u is string => !!u)) {
      setUrls(cached);
      return;
    }

    void (async () => {
      const s = supa();
      if (!s) {
        if (alive) setFailed(true);
        return;
      }
      const { data, error } = await s.storage.from(BUCKET).createSignedUrls(names, TTL);
      if (!alive) return;
      if (error || !data) {
        setFailed(true);
        return;
      }
      const out: string[] = [];
      data.forEach((row, i) => {
        if (row.signedUrl) {
          signed.set(names[i], row.signedUrl);
          out.push(row.signedUrl);
        }
      });
      if (out.length === 0) setFailed(true);
      setUrls(out);
    })();

    return () => {
      alive = false;
    };
  }, [key]);

  if (!files || files.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
      {failed && (
        <p style={{ fontSize: "0.8rem", color: "#8DA1BE", fontFamily: "'Manrope', sans-serif" }}>
          No se pudo cargar la lámina de esta pregunta.
        </p>
      )}
      {urls.map((u, i) => (
        <a key={u} href={u} target="_blank" rel="noreferrer" style={{ display: "block" }}>
          <img
            src={u}
            alt={`Lámina del manual Jeppesen ${i + 1} de ${urls.length}`}
            loading="lazy"
            style={{
              width: "100%",
              maxHeight: 460,
              objectFit: "contain",
              borderRadius: 12,
              border: "1px solid #F2DCDB",
              background: "white",
            }}
          />
        </a>
      ))}
    </div>
  );
}
