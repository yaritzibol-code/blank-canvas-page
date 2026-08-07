/**
 * Ambiente de cobros que consulta el panel admin.
 *
 * No se deriva del token publicable (en preview siempre es de prueba), sino de
 * una preferencia explícita del administrador. Por defecto: dinero real.
 */
export type AdminEnv = "live" | "sandbox";

const KEY = "fp_admin_env";

export function getAdminEnv(): AdminEnv {
  if (typeof window === "undefined") return "live";
  const saved = window.localStorage.getItem(KEY);
  return saved === "sandbox" || saved === "live" ? saved : "live";
}

export function setAdminEnv(v: AdminEnv): void {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, v);
}
