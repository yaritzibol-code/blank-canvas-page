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
};

const BUCKET_POR_DEFECTO = "jeppesen-images";

function bucketFor(fuente?: string): string {
  return (fuente && BUCKETS[fuente]) || BUCKET_POR_DEFECTO;
}


/** Cache de la sesión: evita volver a firmar la misma lámina al navegar. */
const signed = new Map<string, string>();

/**
 * Marco con altura reservada: la lámina entra encima del esqueleto sin mover
 * el resto de la pregunta (evita CLS mientras se firma y descarga la imagen).
 */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative", width: "100%", minHeight: 320, borderRadius: "var(--fd-radius, 12px)",
        overflow: "hidden", background: "var(--fd-panel, white)", border: "1px solid var(--fd-border, #EEE1C5)",
      }}
    >
      {children}
    </div>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        background: "linear-gradient(100deg, rgba(8,26,53,.06) 30%, rgba(199,160,82,.16) 50%, rgba(8,26,53,.06) 70%)",
        backgroundSize: "220% 100%", animation: "fp-figure-shimmer 1.35s ease-in-out infinite",
        font: "8px 'JetBrains Mono', monospace", letterSpacing: ".2em", color: "var(--fd-muted, #7E90AD)",
      }}
    >
      {label}
    </div>
  );
}

export function QuestionImages({ files, fuente, fallbackSrc }: { files?: string[]; fuente?: string; fallbackSrc?: string }) {
  const BUCKET = bucketFor(fuente);
  const key = (files ?? []).join(",");
  const [urls, setUrls] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const names = key ? key.split(",") : [];
    if (names.length === 0) {
      setUrls([]);
      return;
    }
    let alive = true;
    setFailed(false);
    setMissing({});
    setLoaded({});

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

  const cargando = !failed && urls.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
      {cargando && (
        <Frame>
          {fallbackSrc && (
            <img
              src={fallbackSrc}
              alt=""
              aria-hidden
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22, filter: "blur(2px)" }}
            />
          )}
          <Skeleton label="CARGANDO LÁMINA" />
        </Frame>
      )}
      {failed && (
        <Frame>
          {fallbackSrc && (
            <img
              src={fallbackSrc}
              alt=""
              aria-hidden
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28 }}
            />
          )}
          <div
            style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 10,
              alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center",
              background: "color-mix(in srgb, var(--fd-panel, white) 76%, transparent)",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--fd-muted, #7E90AD)", fontFamily: "'Manrope', sans-serif", margin: 0 }}>
              No se pudo cargar la lámina de esta pregunta.
            </p>
            <button
              type="button"
              onClick={() => { setFailed(false); setRetry((n) => n + 1); }}
              style={{
                minHeight: 44, padding: "8px 14px", borderRadius: "var(--fd-radius, 10px)", cursor: "pointer",
                border: "1px solid #163D70", background: "var(--fd-panel, white)", color: "var(--fd-text, #081A35)",
                fontWeight: 700, fontSize: "0.8rem", fontFamily: "'Manrope', sans-serif",
              }}
            >
              Reintentar
            </button>
          </div>
        </Frame>
      )}
      {urls.map((u, i) =>
        missing[u] ? (
          // El archivo no está en el manual todavía: reintentar no sirve de nada,
          // así que se avisa con claridad en vez de invitar a un botón inútil.
          <Frame key={u}>
            {fallbackSrc && (
              <img
                src={fallbackSrc}
                alt=""
                aria-hidden
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28 }}
              />
            )}
            <p
              style={{
                position: "absolute", inset: 0, display: "grid", placeItems: "center", margin: 0, padding: "14px 16px",
                textAlign: "center", fontSize: "0.8rem", color: "var(--fd-muted, #7E90AD)", fontFamily: "'Manrope', sans-serif",
                background: "color-mix(in srgb, var(--fd-panel, white) 76%, transparent)",
              }}
            >
              Esta figura todavía no está disponible. La pregunta se puede contestar con el texto.
            </p>
          </Frame>
        ) : (
          <a key={u} href={u} target="_blank" rel="noreferrer" style={{ display: "block" }}>
            <Frame>
              {!loaded[u] && <Skeleton label="CARGANDO LÁMINA" />}
              <img
                src={u}
                alt={`${fuente === "ATP" ? "Figura del suplemento FAA (AKTS)" : fuente === "LAOF" ? "Figura de la guía Embraer 190" : "Lámina del manual Jeppesen"} ${i + 1} de ${urls.length}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => setLoaded((m) => ({ ...m, [u]: true }))}
                onError={() => setMissing((m) => ({ ...m, [u]: true }))}
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: 460,
                  minHeight: 320,
                  objectFit: "contain",
                  background: "var(--fd-panel, white)",
                  opacity: loaded[u] ? 1 : 0,
                  transform: loaded[u] ? "scale(1)" : "scale(1.012)",
                  transition: "opacity .38s ease, transform .38s ease",
                }}
              />
            </Frame>
          </a>
        ),
      )}

    </div>
  );
}
