import { useEffect } from "react";
import { supa } from "@/lib/store/cloud";
import { touch } from "@/lib/store/db";

// A short-lived, memory-only observation of the EXISTING server admin check.
// Never persist it or derive it from the editable browser profile/plan.
const RECHECK_MS = 5 * 60_000;
const REQUEST_TIMEOUT_MS = 10_000;
type Status = "unverified" | "checking" | "verified" | "denied" | "error";
let generation = 0;
let controller: AbortController | null = null;
let state: { userId: string | null; token: string | null; until: number; status: Status } = {
  userId: null,
  token: null,
  until: 0,
  status: "unverified",
};

export function clearCiaacAdminVerification(): void {
  generation++;
  controller?.abort();
  controller = null;
  state = { userId: null, token: null, until: 0, status: "unverified" };
  touch();
}

export function hasVerifiedCiaacAdminAccess(userId: string): boolean {
  return (
    state.userId === userId &&
    state.status === "verified" &&
    !!state.token &&
    Date.now() < state.until
  );
}

export function ciaacAdminVerificationFailed(userId: string): boolean {
  return state.userId === userId && state.status === "error";
}

/** No positive local setter: only a successful authenticated server response grants access. */
export async function verifyCiaacAdminAccess(userId: string): Promise<boolean> {
  clearCiaacAdminVerification();
  const attempt = generation;
  state = { userId, token: null, until: 0, status: "checking" };
  const request = new AbortController();
  controller = request;
  const timeout = setTimeout(() => request.abort(), REQUEST_TIMEOUT_MS);
  touch();
  try {
    const client = supa();
    if (!client) throw new Error("Session unavailable");
    const { data, error } = await client.auth.getSession();
    const session = data.session;
    if (attempt !== generation) return false;
    if (error || !session?.access_token || session.user.id !== userId) {
      state = { userId, token: null, until: 0, status: "denied" };
      return false;
    }
    const token = session.access_token;
    const response = await fetch("/api/admin/learning-path-review", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: request.signal,
    });
    if (attempt !== generation) return false;
    if (response.status !== 200) {
      state = {
        userId,
        token: null,
        until: 0,
        status: response.status === 401 || response.status === 403 ? "denied" : "error",
      };
      return false;
    }
    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== "object" ||
      !("items" in payload) ||
      !Array.isArray(payload.items) ||
      !("selected" in payload) ||
      payload.selected !== null
    )
      throw new Error("Invalid admin review response");
    if (attempt !== generation) return false;
    // The session may have changed while the request was in flight, even before
    // its auth event reached React. A stale success must never grant a new user access.
    const current = await client.auth.getSession();
    if (attempt !== generation) return false;
    if (
      current.error ||
      current.data.session?.user.id !== userId ||
      current.data.session?.access_token !== token
    ) {
      state = { userId, token: null, until: 0, status: "denied" };
      return false;
    }
    const until = Math.min(
      Date.now() + RECHECK_MS,
      (current.data.session.expires_at ?? Infinity) * 1000,
    );
    if (until <= Date.now() || request.signal.aborted) throw new Error("Session expired");
    state = { userId, token, until, status: "verified" };
    return true;
  } catch {
    if (attempt === generation) state = { userId, token: null, until: 0, status: "error" };
    return false;
  } finally {
    clearTimeout(timeout);
    if (attempt === generation) {
      controller = null;
      touch();
    }
  }
}

/** Mounted once by the LP layout, including its category entry screen. */
export function useCiaacAdminVerification(userId: string | null, authReady: boolean): void {
  useEffect(() => {
    if (!userId || !authReady) {
      clearCiaacAdminVerification();
      return;
    }
    let active = true;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let authTimer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      clearTimeout(refreshTimer);
      const verified = await verifyCiaacAdminAccess(userId);
      // Errors stay closed without a retry loop. Focus/auth change or reload retries.
      if (active && verified)
        refreshTimer = setTimeout(() => void load(), Math.max(0, state.until - Date.now()));
    };
    const refresh = () => {
      void load();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const client = supa();
    const listener = client?.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") return;
      clearTimeout(refreshTimer);
      clearTimeout(authTimer);
      clearCiaacAdminVerification();
      // Supabase calls must run outside its auth callback's internal lock.
      if (event !== "SIGNED_OUT") authTimer = setTimeout(refresh, 0);
    });
    void load();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      clearTimeout(refreshTimer);
      clearTimeout(authTimer);
      listener?.data.subscription.unsubscribe();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      clearCiaacAdminVerification();
    };
  }, [userId, authReady]);
}
