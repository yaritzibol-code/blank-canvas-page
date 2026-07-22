import { useEffect } from "react";
import { useSessionUser } from "@/lib/store";
import type { UserPrefs } from "@/lib/store";

const PREFS_KEY = "fp_display_prefs";

type StoredPrefs = {
  theme?: UserPrefs["theme"];
  textSize?: UserPrefs["textSize"];
  motion?: "full" | "reduced";
};

export function readStoredPrefs(): StoredPrefs {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") as StoredPrefs;
  } catch {
    return {};
  }
}

function writeStoredPrefs(p: StoredPrefs) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* ignore quota */
  }
}

const SIZE_MAP: Record<string, string> = {
  Normal: "16px",
  Grande: "17.5px",
  "Muy grande": "19px",
};

export function applyPrefsToDom(p: StoredPrefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved =
    p.theme === "oscuro"
      ? "oscuro"
      : p.theme === "sistema"
        ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
          ? "oscuro"
          : "claro"
        : "claro";
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "oscuro");
  root.style.fontSize = SIZE_MAP[p.textSize ?? "Normal"] ?? "16px";
  root.dataset.motion = p.motion === "reduced" ? "reduced" : "full";
}

/**
 * Aplica preferencias de usuario (tema, tamaño de texto, animaciones) al <html>
 * y las persiste en localStorage para que se conserven entre recargas y se
 * apliquen antes de que la sesión termine de cargar (sin flash).
 */
export function useApplyPrefs() {
  const user = useSessionUser();
  const prefs = user?.prefs;

  useEffect(() => {
    // Al montar: si aún no hay sesión, honra lo guardado localmente.
    if (!prefs) {
      applyPrefsToDom(readStoredPrefs());
      return;
    }
    const stored: StoredPrefs = {
      theme: prefs.theme,
      textSize: prefs.textSize,
      motion: prefs.toggles?.pathy === false ? "reduced" : "full",
    };
    writeStoredPrefs(stored);
    applyPrefsToDom(stored);

    let mq: MediaQueryList | null = null;
    let onChange: (() => void) | null = null;
    if (prefs.theme === "sistema" && window.matchMedia) {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      onChange = () => applyPrefsToDom({ ...stored });
      mq.addEventListener?.("change", onChange);
    }
    return () => {
      if (mq && onChange) mq.removeEventListener?.("change", onChange);
    };
  }, [prefs?.theme, prefs?.textSize, prefs?.toggles?.pathy, prefs]);
}
