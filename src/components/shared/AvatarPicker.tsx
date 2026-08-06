/**
 * Foto de perfil del estudiante.
 *
 * El archivo vive en el bucket privado `avatars` bajo `<uid>/avatar.<ext>`
 * (política RLS por carpeta), así que se muestra con URL firmada. La imagen se
 * reescala en el navegador a 512px antes de subir para no guardar fotos de 5MB.
 */
import { useEffect, useRef, useState } from "react";
import { supa } from "@/lib/store/cloud";

const BUCKET = "avatars";
const TTL = 60 * 60;
const MAX = 512;

const cache = new Map<string, string>();

/** Devuelve una URL firmada para la foto guardada (o null). */
export function useAvatarUrl(path?: string): string | null {
  const [url, setUrl] = useState<string | null>(() => (path ? cache.get(path) ?? null : null));

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    const hit = cache.get(path);
    if (hit) {
      setUrl(hit);
      return;
    }
    let alive = true;
    void (async () => {
      const s = supa();
      if (!s) return;
      const { data } = await s.storage.from(BUCKET).createSignedUrl(path, TTL);
      if (alive && data?.signedUrl) {
        cache.set(path, data.signedUrl);
        setUrl(data.signedUrl);
      }
    })();
    return () => {
      alive = false;
    };
  }, [path]);

  return url;
}

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no-blob"))), "image/jpeg", 0.85),
  );
}

interface Props {
  userId: string;
  /** Ruta actual dentro del bucket. */
  path?: string;
  /** Iniciales de respaldo cuando no hay foto. */
  initials: string;
  size?: number;
  onChange: (path: string | undefined) => void;
}

export function AvatarPicker({ userId, path, initials, size = 88, onChange }: Props) {
  const url = useAvatarUrl(path);
  const [preview, setPreview] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const shown = preview ?? url;

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setSubiendo(true);
    try {
      const blob = await shrink(file);
      const s = supa();
      if (!s) throw new Error("sin-sesion");
      const dest = `${userId}/avatar.jpg`;
      const { error: upErr } = await s.storage
        .from(BUCKET)
        .upload(dest, blob, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      cache.delete(dest);
      setPreview(URL.createObjectURL(blob));
      onChange(dest);
    } catch {
      setError("No se pudo subir la foto. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          background: "linear-gradient(135deg,#3D5D91,#5A86CB)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: size / 2.75,
          fontWeight: 900,
          color: "white",
          border: "3px solid rgba(255,255,255,.2)",
          flexShrink: 0,
        }}
      >
        {shown ? (
          <img src={shown} alt="Tu foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={subiendo}
            style={{
              minHeight: 44,
              padding: "10px 16px",
              borderRadius: 10,
              cursor: subiendo ? "wait" : "pointer",
              border: "1px solid rgba(255,255,255,.35)",
              background: "rgba(255,255,255,.12)",
              color: "white",
              fontWeight: 700,
              fontSize: ".82rem",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            {subiendo ? "Subiendo…" : shown ? "Cambiar foto" : "Subir foto"}
          </button>
          {shown && !subiendo && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onChange(undefined);
              }}
              style={{
                minHeight: 44,
                padding: "10px 14px",
                borderRadius: 10,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,.25)",
                background: "transparent",
                color: "rgba(255,255,255,.85)",
                fontWeight: 700,
                fontSize: ".82rem",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Quitar
            </button>
          )}
        </div>
        <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.7)", fontFamily: "'Manrope', sans-serif" }}>
          {error ?? "JPG o PNG · se recorta a 512px"}
        </span>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => void pick(e.target.files?.[0])}
        style={{ display: "none" }}
        aria-label="Subir foto de perfil"
      />
    </div>
  );
}
