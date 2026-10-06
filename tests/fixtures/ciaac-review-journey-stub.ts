/** Offline review persistence only. No real database, account, rewards, or cloud imports. */
import catalog from "../../src/lib/lp/ciaac-aircraft-approved/catalog.json";

export const REVIEW_USER_ID = "ciaac-approved-local-review-only";
export const REVIEW_STORAGE_PREFIX = "ciaac_review_am06_am10_v1:";
const allowedIds = new Set(catalog.lessons.slice(5, 10).map((lesson) => lesson.id));
const memory = new Map<string, string>();

function keyFor(userId: string, lpId: string): string {
  if (userId !== REVIEW_USER_ID || !allowedIds.has(lpId)) {
    throw new Error("Only the dummy AM06–10 review namespace is supported.");
  }
  return `${REVIEW_STORAGE_PREFIX}${encodeURIComponent(lpId)}`;
}

export function getLpJourney<T>(userId: string, lpId: string): T | null {
  const key = keyFor(userId, lpId);
  let value = memory.get(key);
  try {
    value = window.sessionStorage.getItem(key) ?? value;
  } catch {
    // Some file:// or private contexts disallow sessionStorage. In-tab memory still works.
  }
  try {
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function saveLpJourney<T>(userId: string, lpId: string, state: T): void {
  const key = keyFor(userId, lpId);
  const value = JSON.stringify(state);
  memory.set(key, value);
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Never switch to the application's persistent localStorage or network.
  }
}

export function resetLpJourney(userId: string, lpId: string): void {
  const key = keyFor(userId, lpId);
  memory.delete(key);
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Only this dummy entry is ever targeted. No storage.clear() calls.
  }
}
