import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  questionImageBucket,
  questionImageFileError,
  questionImageSignatureMatches,
} from "./question-image-policy";

/** Called only after the server function validates the authenticated admin role. */
export async function storeQuestionImage(
  data: FormData,
): Promise<{ name: string } | { error: string }> {
  const file = data.get("image");
  const fuente = data.get("fuente");
  if (
    !(file instanceof Blob) ||
    (fuente !== null && (typeof fuente !== "string" || fuente.length > 32))
  )
    return { error: "Solicitud de imagen inválida." };
  const invalid = questionImageFileError(file);
  if (invalid) return { error: invalid };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!questionImageSignatureMatches(file.type, bytes))
    return { error: "El archivo no corresponde al formato de imagen indicado." };
  const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const name = `admin_${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(questionImageBucket(fuente ?? undefined))
    .upload(name, bytes, { contentType: file.type, upsert: false });
  if (error)
    return {
      error: "No se pudo subir la imagen. Inténtalo de nuevo; la pregunta no se ha cambiado.",
    };
  return { name };
}
