import { useEffect } from "react";
import { useSessionUser } from "@/lib/store";

/**
 * Aplica preferencias de usuario (tema, tamaño de texto, animaciones)
 * al <html> root para que surtan efecto globalmente.
 */
export function useApplyPrefs() {
  const user = useSessionUser();
  const prefs = user?.prefs;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Tema: claro / oscuro / sistema
    const applyTheme = (mode: "claro" | "oscuro" | "sistema" | undefined) => {
      const resolved =
        mode === "oscuro"
          ? "oscuro"
          : mode === "sistema"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "oscuro"
              : "claro"
            : "claro";
      root.dataset.theme = resolved;
      root.classList.toggle("dark", resolved === "oscuro");
    };
    applyTheme(prefs?.theme);

    let mq: MediaQueryList | null = null;
    let onChange: (() => void) | null = null;
    if (prefs?.theme === "sistema" && window.matchMedia) {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      onChange = () => applyTheme("sistema");
      mq.addEventListener?.("change", onChange);
    }

    // Tamaño de texto
    const sizeMap: Record<string, string> = {
      Normal: "16px",
      Grande: "17.5px",
      "Muy grande": "19px",
    };
    root.style.fontSize = sizeMap[prefs?.textSize ?? "Normal"] ?? "16px";

    // Animaciones (Pathy / decorativas)
    root.dataset.motion = prefs?.toggles?.pathy === false ? "reduced" : "full";

    return () => {
      if (mq && onChange) mq.removeEventListener?.("change", onChange);
    };
  }, [prefs?.theme, prefs?.textSize, prefs?.toggles?.pathy]);
}
