/** Existing private figure buckets; also used for administrator replacements. */
export function questionImageBucket(fuente?: string): string {
  if (fuente === "ATP") return "atp-images";
  if (fuente === "LAOF") return "e190-images";
  return "jeppesen-images";
}

export const QUESTION_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const QUESTION_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function questionImageFileError(file: { size: number; type: string }): string | null {
  if (!QUESTION_IMAGE_TYPES.includes(file.type)) return "Elige una imagen PNG, JPG o WebP.";
  if (!file.size || file.size > QUESTION_IMAGE_MAX_BYTES)
    return "La imagen debe pesar entre 1 byte y 8 MB.";
  return null;
}

/** Reject disguised HTML/SVG even when its declared MIME type is an image. */
export function questionImageSignatureMatches(type: string, bytes: Uint8Array): boolean {
  if (type === "image/png")
    return [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  if (type === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === "image/webp")
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}
