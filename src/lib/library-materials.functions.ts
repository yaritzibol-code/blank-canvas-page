import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "library-materials";
const PREFIX = `storage://${BUCKET}/`;
const MAX_PDF_BYTES = 30 * 1024 * 1024;

/** Admin-only PDF upload. Storage stays private; the catalog saves only its stable path. */
export const uploadLibraryPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Solicitud de archivo inválida.");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ fileUrl: string } | { error: string }> => {
    const { data: admin, error: roleError } = await context.supabase.rpc("is_admin");
    if (roleError || admin !== true) return { error: "Requiere rol administrador." };

    const file = data.get("pdf");
    const rawMaterial = data.get("material");
    let material: Record<string, unknown>;
    try {
      material = JSON.parse(String(rawMaterial));
    } catch {
      return { error: "Datos del material inválidos." };
    }
    if (typeof material.id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/.test(material.id) ||
        typeof material.titulo !== "string" || !material.titulo.trim() ||
        !["borrador", "publicada", "oculta"].includes(String(material.status)))
      return { error: "Datos del material incompletos." };
    if (!(file instanceof Blob) || (file.type && file.type !== "application/pdf") || file.size < 8 || file.size > MAX_PDF_BYTES)
      return { error: "Selecciona un PDF válido de hasta 30 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
      return { error: "El archivo no tiene un encabezado PDF válido." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bucket = supabaseAdmin.storage.from(BUCKET);
    const path = `${crypto.randomUUID()}.pdf`;
    const created = await supabaseAdmin.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_PDF_BYTES,
      allowedMimeTypes: ["application/pdf"],
    });
    if (created.error && !/already exists|duplicate/i.test(created.error.message))
      return { error: "No se pudo preparar el almacenamiento de la Biblioteca." };
    const result = await bucket.upload(path, bytes, { contentType: "application/pdf", upsert: false });
    if (result.error) return { error: `No se pudo subir el PDF: ${result.error.message}` };
    const fileUrl = PREFIX + path;
    const { error: catalogError } = await supabaseAdmin.from("content").upsert({
      collection: "materiales",
      id: material.id,
      data: { ...material, fileUrl },
    });
    if (catalogError) {
      await bucket.remove([path]);
      return { error: "El PDF se subió, pero no se pudo registrar en la Biblioteca." };
    }
    return { fileUrl };
  });

/** Signed reader URL for a published material; never trusts the client's path or plan. */
export const libraryPdfReaderUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { materialId: string }) => {
    if (!data?.materialId || data.materialId.length > 120) throw new Error("Material inválido.");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: row, error: materialError }, { data: profile, error: profileError }] = await Promise.all([
      supabaseAdmin.from("content").select("data").eq("collection", "materiales").eq("id", data.materialId).maybeSingle(),
      supabaseAdmin.from("profiles").select("role,data").eq("id", context.userId).maybeSingle(),
    ]);
    if (materialError || profileError || !row || !profile) return { error: "No se pudo abrir el material." };
    const material = row.data as Record<string, unknown>;
    const user = (profile.data ?? {}) as Record<string, unknown>;
    const isAdmin = profile.role === "admin";
    const paid = user.plan === "paga" && ["activo", "extendido", "prueba"].includes(String(user.accessStatus ?? "activo"));
    if (material.status !== "publicada" || (!isAdmin && !paid && material.muestraGratis !== true))
      return { error: "Este material requiere acceso Pro." };
    const fileUrl = material.fileUrl;
    if (typeof fileUrl !== "string" || !fileUrl.startsWith(PREFIX)) return { error: "Archivo inválido." };
    const path = fileUrl.slice(PREFIX.length);
    if (!/^[a-f\d-]{36}\.pdf$/i.test(path)) return { error: "Archivo inválido." };
    const { data: signed, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 2 * 60 * 60);
    if (error || !signed?.signedUrl) return { error: "No se pudo abrir el PDF." };
    return { url: signed.signedUrl };
  });
