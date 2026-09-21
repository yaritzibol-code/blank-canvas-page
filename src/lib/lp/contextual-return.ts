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

export function leaveLearningPath(fallback: string): void {
  if (typeof window === "undefined") return;
  const origin = learningPathOrigin(window.location.pathname) ?? { href: fallback, scrollY: 0 };
  window.sessionStorage.setItem(returnKey, JSON.stringify(origin));
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
  const restore = () => {
    window.scrollTo(0, y);
    if (++tries < 75 && Math.abs(window.scrollY - y) > 2) window.setTimeout(restore, 80);
  };
  window.setTimeout(restore, 0);
}
