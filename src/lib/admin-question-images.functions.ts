import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Binary upload: authenticated administrator only, no arbitrary bucket/path or overwrite. */
export const uploadQuestionImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Solicitud de imagen inválida.");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ name: string } | { error: string }> => {
    const { data: admin, error: roleError } = await context.supabase.rpc("is_admin");
    if (roleError || admin !== true)
      return { error: "No se pudo validar el acceso de administrador." };
    const { storeQuestionImage } = await import("./admin-question-images.server");
    return storeQuestionImage(data);
  });
