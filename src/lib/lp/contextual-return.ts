interface LearningPathOrigin { href: string; scrollY: number }

const originKey = (path: string) => `flightpath:lp-origin:${path}`;
const returnKey = "flightpath:lp-return-scroll";
const lpPath = /^(?:\/dashboard\/rutas\/[^/]+\/[^/]+\/[^/]+\/[^/]+|\/ruta\/[^/]+)\/?$/;

function allowedOrigin(href: string): boolean {
  return (href === "/dashboard" || href.startsWith("/dashboard/") || href === "/ruta" || href.startsWith("/ruta?"))
    && !href.startsWith("//") && !lpPath.test(href.split(/[?#]/)[0]);
}

/** Called before Link navigation so scroll and filters belong to the source page. */
export function rememberLearningPathOrigin(target: string, source?: LearningPathOrigin): void {
  if (typeof window === "undefined") return;
  const targetPath = new URL(target, window.location.origin).pathname;
  const origin = source ?? {
    href: window.location.pathname + window.location.search + window.location.hash,
    scrollY: window.scrollY,
  };
  if (!lpPath.test(targetPath) || !allowedOrigin(origin.href)) return;
  window.sessionStorage.setItem(originKey(targetPath), JSON.stringify(origin));
}

export function learningPathOrigin(path: string): LearningPathOrigin | null {
  if (typeof window === "undefined") return null;
  try {
    const origin = JSON.parse(window.sessionStorage.getItem(originKey(path)) ?? "null") as LearningPathOrigin | null;
    return origin && allowedOrigin(origin.href) && Number.isFinite(origin.scrollY) ? origin : null;
  } catch { return null; }
}

/**
 * Sale de la ruta de aprendizaje. Con `go` (navegación del router) el regreso
 * es instantáneo; sin él se recarga el documento como último recurso, lo que
 * dejaba la app en blanco mientras volvía a arrancar.
 */
export function leaveLearningPath(fallback: string, go?: (href: string) => void): void {
  if (typeof window === "undefined") return;
  const origin = learningPathOrigin(window.location.pathname) ?? { href: fallback, scrollY: 0 };
  window.sessionStorage.setItem(returnKey, JSON.stringify(origin));
  if (go) {
    go(origin.href);
    // El destino ya está montado en la misma sesión: restaura sin esperar reboot.
    window.setTimeout(() => restoreLearningPathScroll(), 0);
    return;
  }
  window.location.assign(origin.href);
}

/** Restores after the destination is mounted, including after a full refresh. */
export function restoreLearningPathScroll(): void {
  if (typeof window === "undefined") return;
  let pending: LearningPathOrigin | null;
  try { pending = JSON.parse(window.sessionStorage.getItem(returnKey) ?? "null"); }
  catch { pending = null; }
  if (!pending || !allowedOrigin(pending.href)) return;
  const target = new URL(pending.href, window.location.origin);
  if (target.pathname !== window.location.pathname) return;
  window.sessionStorage.removeItem(returnKey);
  const y = Math.max(0, pending.scrollY);
  let tries = 0;
  let cancelled = false;
  // Si la persona empieza a desplazarse, dejamos de forzar su posición.
  const stop = () => {
    cancelled = true;
    for (const evt of ["wheel", "touchstart", "keydown"]) window.removeEventListener(evt, stop);
  };
  for (const evt of ["wheel", "touchstart", "keydown"]) {
    window.addEventListener(evt, stop, { passive: true, once: true });
  }
  const restore = () => {
    if (cancelled) return;
    window.scrollTo(0, y);
    if (++tries < 20 && Math.abs(window.scrollY - y) > 2) window.setTimeout(restore, 80);
    else stop();
  };
  window.setTimeout(restore, 0);
}
