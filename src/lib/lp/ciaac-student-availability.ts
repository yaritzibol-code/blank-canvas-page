import { hasVerifiedCiaacAdminAccess } from "./ciaac-admin-verification";
import type { User } from "@/lib/store/types";

/** Temporary owner-requested pause. Set false only when the owner reopens CIAAC.
 * No expiry and no changes to editorial readiness, plans, roles or saved progress.
 */
export const CIAAC_STUDENT_ACCESS_PAUSED = true;

/** Unknown/pending profiles fail closed; server-verified admins retain their usual gates. */
export function isCiaacStudentAccessPaused(user: User | null, id: string): boolean {
  return (
    CIAAC_STUDENT_ACCESS_PAUSED &&
    (id === "ciaac" || id.startsWith("ciaac/")) &&
    (!user || !hasVerifiedCiaacAdminAccess(user.id))
  );
}
