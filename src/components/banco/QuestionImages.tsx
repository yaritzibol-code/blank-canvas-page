/**
 * Láminas de una pregunta (manual Jeppesen).
 *
 * Las imágenes viven en el bucket privado `jeppesen-images` con el mismo
 * nombre que trae el reactivo (ej. `jeppesen_gam_page_0174.png`), así que se
 * piden URLs firmadas al vuelo para el estudiante con sesión iniciada.
 */
import { useEffect, useState } from "react";
import { supa } from "@/lib/store/cloud";

const TTL = 60 * 60; // 1 hora

/**
 * Bucket de figuras por manual.
 *
 * Cada manual con láminas propias tiene su bucket; las fuentes sin bucket
 * declarado (PHAK, LEG, ANX10…) caen a `jeppesen-images`, así que si alguna
 * de ellas llega a traer figuras hay que darle su propia entrada aquí Y su
 * política de lectura en `storage.objects` — sin las dos cosas la lámina no
 * se firma y la pregunta se ve sin imagen.
 */
const BUCKETS: Record<string, string> = {
  JEPP: "jeppesen-images",
  ATP: "atp-images",
  LAOF: "e190-images",
  B737MAX: "737-images",
};

const BUCKET_POR_DEFECTO = "jeppesen-images";

function bucketFor(fuente?: string): string {
  return (fuente && BUCKETS[fuente]) || BUCKET_POR_DEFECTO;
}


/** Cache de la sesión: evita volver a firmar la misma lámina al navegar. */
const signed = new Map<string, string>();

export function QuestionImages({ files, fuente }: { files?: string[]; fuente?: string }) {
  const BUCKET = bucketFor(fuente);
  const key = (files ?? []).join(",");
  const [urls, setUrls] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const names = key ? key.split(",") : [];
    if (names.length === 0) {
      setUrls([]);
      return;
    }
    let alive = true;
    setFailed(false);

    const cached = names.map((n) => signed.get(`${BUCKET}/${n}`));
    if (cached.every((u): u is string => !!u)) {
      setUrls(cached);
      return;
    }

    void (async () => {
      // Las láminas son parte de la pregunta: si la firma falla (sesión que
      // acaba de refrescar, red intermitente) reintentamos antes de rendirnos.
      for (let intento = 0; intento < 3 && alive; intento++) {
        const s = supa();
        if (s) {
          const { data, error } = await s.storage.from(BUCKET).createSignedUrls(names, TTL);
          if (!alive) return;
          if (!error && data) {
            const out: string[] = [];
            data.forEach((row, i) => {
              const name = names[i];
              if (row.signedUrl && name) {
                signed.set(`${BUCKET}/${name}`, row.signedUrl);
                out.push(row.signedUrl);
              }
            });
            if (out.length > 0) {
              setUrls(out);
              setFailed(false);
              return;
            }
          }
        }
        await new Promise((r) => setTimeout(r, 400 * (intento + 1)));
      }
      if (alive) setFailed(true);
    })();

    return () => {
      alive = false;
    };
  }, [key, BUCKET, retry]);

  if (!files || files.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
      {failed && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <p style={{ fontSize: "0.8rem", color: "#8DA1BE", fontFamily: "'Manrope', sans-serif", margin: 0 }}>
            No se pudo cargar la lámina de esta pregunta.
          </p>
          <button
            type="button"
            onClick={() => { setFailed(false); setRetry((n) => n + 1); }}
            style={{
              minHeight: 44, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              border: "1px solid #3D5D91", background: "white", color: "#22375C",
              fontWeight: 700, fontSize: "0.8rem", fontFamily: "'Manrope', sans-serif",
            }}
          >
            Reintentar
          </button>
        </div>
      )}
      {urls.map((u, i) =>
        missing[u] ? (
          // El archivo no está en el manual todavía: reintentar no sirve de nada,
          // así que se avisa con claridad en vez de invitar a un botón inútil.
          <p
            key={u}
            style={{
              fontSize: "0.8rem", color: "#8DA1BE", fontFamily: "'Manrope', sans-serif",
              margin: 0, padding: "14px 16px", borderRadius: 12,
              border: "1px dashed #D9E2F0", background: "#F8FAFD",
            }}
          >
            Esta figura todavía no está disponible. La pregunta se puede contestar con el texto.
          </p>
        ) : (
          <a key={u} href={u} target="_blank" rel="noreferrer" style={{ display: "block" }}>
            <img
              src={u}
              alt={`${fuente === "ATP" ? "Figura del suplemento FAA (AKTS)" : fuente === "LAOF" ? "Figura de la guía Embraer 190" : "Lámina del manual Jeppesen"} ${i + 1} de ${urls.length}`}
              loading="lazy"
              onError={() => setMissing((m) => ({ ...m, [u]: true }))}
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
        ),
      )}

    </div>
  );
}
