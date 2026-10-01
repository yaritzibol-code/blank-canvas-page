import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface OutlineEntry { title: string; page: number; depth: number; }
type ReadingMode = "vertical" | "horizontal";
type FitMode = "width" | "page";

interface Props {
  url: string;
  title: string;
  page: number;
  bookmarks: number[];
  visitedCount: number;
  initialMode: ReadingMode;
  initialZoom: number;
  initialFit: FitMode;
  onPreferences: (preferences: { mode: ReadingMode; zoom: number; fit: FitMode }) => void;
  onPage: (page: number, total: number) => void;
  onPageText: (text: string) => void;
  onReady: (total: number) => void;
  onBookmark: (page: number) => void;
  onUnavailable: () => void;
  canDownload: boolean;
  canPrint: boolean;
  onDownload: () => void;
  onPrint: () => void;
}

const control: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)", borderRadius: 6,
  background: "rgba(255,255,255,0.08)", color: "white",
  minHeight: 30, padding: "3px 9px", cursor: "pointer", fontSize: "0.76rem",
};

function RenderedPage({ pdf, number, scale, onSize }: { pdf: PDFDocumentProxy; number: number; scale: number; onSize: (number: number, width: number, height: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    let renderTask: ReturnType<Awaited<ReturnType<typeof pdf.getPage>>["render"]> | null = null;
    void (async () => {
      try {
        const pdfPage = await pdf.getPage(number);
        if (cancelled || !canvasRef.current) return;
        const base = pdfPage.getViewport({ scale: 1 });
        onSize(number, base.width, base.height);
        const viewport = pdfPage.getViewport({ scale });
        const canvas = canvasRef.current;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        renderTask = pdfPage.render({ canvas, canvasContext: context, viewport });
        await renderTask.promise;
      } catch { /* La página puede volver a renderizarse al entrar en vista. */ }
    })();
    return () => { cancelled = true; renderTask?.cancel(); };
  }, [pdf, number, scale, onSize]);
  return <canvas ref={canvasRef} aria-label={`Página ${number}`} style={{ display: "block", background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }} />;
}

/** PDF.js conserva el documento cargado y dibuja sólo las páginas cercanas al viewport. */
export function PdfStudyViewer({ url, title, page, bookmarks, visitedCount, initialMode, initialZoom, initialFit, onPreferences, onPage, onPageText, onReady, onBookmark, onUnavailable, canDownload, canPrint, onDownload, onPrint }: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [outline, setOutline] = useState<OutlineEntry[]>([]);
  const [indexOpen, setIndexOpen] = useState(false);
  const [mode, setMode] = useState<ReadingMode>(initialMode);
  const [zoom, setZoom] = useState(Math.min(2, Math.max(0.5, initialZoom)));
  const [fit, setFit] = useState<FitMode>(initialFit);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 800 });
  const [baseSize, setBaseSize] = useState({ width: 612, height: 792 });
  const [pageSizes, setPageSizes] = useState<Record<number, { width: number; height: number }>>({});
  const [pageInput, setPageInput] = useState(String(page));
  const [error, setError] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(page);
  const latest = useRef({ onReady, onUnavailable, onPageText, onPage, onPreferences });
  latest.current = { onReady, onUnavailable, onPageText, onPage, onPreferences };
  pageRef.current = page;

  useEffect(() => setPageInput(String(page)), [page]);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    let task: ReturnType<typeof import("pdfjs-dist").getDocument> | null = null;
    setPdf(null);
    setOutline([]);
    setPageSizes({});
    setError("");
    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        task = pdfjs.getDocument({ url: url.split("#")[0], withCredentials: false });
        loaded = await task.promise;
        if (cancelled) return;
        const first = (await loaded.getPage(1)).getViewport({ scale: 1 });
        if (cancelled) return;
        setBaseSize({ width: first.width, height: first.height });
        setPdf(loaded);
        latest.current.onReady(loaded.numPages);
        const rawOutline = await loaded.getOutline();
        if (!rawOutline || cancelled) return;
        type Item = (typeof rawOutline)[number];
        const entries: OutlineEntry[] = [];
        const walk = async (items: Item[], depth: number): Promise<void> => {
          for (const item of items) {
            const destination = typeof item.dest === "string" ? await loaded!.getDestination(item.dest) : item.dest;
            if (destination?.[0] && typeof destination[0] === "object") {
              try {
                const index = await loaded!.getPageIndex(destination[0]);
                entries.push({ title: item.title, page: index + 1, depth });
              } catch { /* El bookmark apunta a una página no disponible. */ }
            }
            if (item.items?.length) await walk(item.items, depth + 1);
          }
        };
        await walk(rawOutline, 0);
        if (!cancelled) setOutline(entries);
      } catch {
        if (!cancelled) {
          setError("Este archivo no se pudo cargar en el lector interactivo.");
          latest.current.onUnavailable();
        }
      }
    })();
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [url]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setViewportSize((current) =>
      current.width === stage.clientWidth && current.height === stage.clientHeight
        ? current : { width: stage.clientWidth, height: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || page < 1 || page > pdf.numPages) return;
    let cancelled = false;
    void pdf.getPage(page).then((pdfPage) => pdfPage.getTextContent()).then((content) => {
      if (!cancelled) latest.current.onPageText(content.items.map((item) => "str" in item ? item.str : "").join(" ").trim().slice(0, 4000));
    }).catch(() => { if (!cancelled) latest.current.onPageText(""); });
    return () => { cancelled = true; };
  }, [pdf, page]);

  const total = pdf?.numPages ?? 0;
  const scale = (fit === "width"
    ? Math.max(100, viewportSize.width - 44) / baseSize.width
    : Math.min(Math.max(100, viewportSize.width - 44) / baseSize.width, Math.max(100, viewportSize.height - 44) / baseSize.height)) * zoom;

  const scrollToPage = (number: number) => {
    const stage = stageRef.current;
    const target = stage?.querySelector<HTMLElement>(`[data-pdf-page="${number}"]`);
    if (stage && target) stage.scrollTo({
      top: mode === "vertical" ? target.offsetTop : 0,
      left: mode === "horizontal" ? target.offsetLeft : 0,
      behavior: "instant",
    });
  };

  // Restaurar la página al abrir y conservarla al cambiar modo, zoom o tamaño.
  useLayoutEffect(() => {
    if (!pdf) return;
    const frame = requestAnimationFrame(() => scrollToPage(pageRef.current));
    return () => cancelAnimationFrame(frame);
  }, [pdf, mode, zoom, fit, baseSize.width, baseSize.height, viewportSize.width, viewportSize.height]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !pdf) return;
    let frame = 0;
    const identifyVisiblePage = () => {
      frame = 0;
      const bounds = stage.getBoundingClientRect();
      let mostVisible = 0;
      let next = pageRef.current;
      stage.querySelectorAll<HTMLElement>("[data-pdf-page]").forEach((node) => {
        const rect = node.getBoundingClientRect();
        const visibleWidth = Math.max(0, Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left));
        const visibleHeight = Math.max(0, Math.min(rect.bottom, bounds.bottom) - Math.max(rect.top, bounds.top));
        const visible = visibleWidth * visibleHeight;
        if (visible > mostVisible) { mostVisible = visible; next = Number(node.dataset.pdfPage); }
      });
      if (mostVisible > 0 && next !== pageRef.current) {
        pageRef.current = next;
        latest.current.onPage(next, pdf.numPages);
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(identifyVisiblePage); };
    stage.addEventListener("scroll", onScroll, { passive: true });
    return () => { stage.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [pdf, mode]);

  const go = (value: number) => {
    if (!total || !Number.isFinite(value)) return;
    const next = Math.min(total, Math.max(1, Math.trunc(value)));
    pageRef.current = next;
    setPageInput(String(next));
    latest.current.onPage(next, total);
    scrollToPage(next);
  };
  const selectMode = (next: ReadingMode) => {
    setMode(next);
    latest.current.onPreferences({ mode: next, zoom, fit });
  };
  const selectZoom = (next: number, nextFit = fit) => {
    const bounded = Math.min(2, Math.max(0.5, +next.toFixed(1)));
    setFit(nextFit);
    setZoom(bounded);
    latest.current.onPreferences({ mode, zoom: bounded, fit: nextFit });
  };
  const onSize = useCallback((number: number, width: number, height: number) => {
    setPageSizes((current) => current[number]?.width === width && current[number]?.height === height
      ? current : { ...current, [number]: { width, height } });
  }, []);
  const percent = total ? Math.round((visitedCount / total) * 100) : 0;
  const renderRadius = zoom < 0.8 ? 4 : zoom > 1.3 ? 1 : 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, flex: 1, background: "#242a33", color: "white" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", padding: "6px 10px", background: "#172339", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <button style={control} onClick={() => setIndexOpen((value) => !value)} aria-label="Abrir o cerrar índice">☰ <span className="hidden sm:inline">Índice</span></button>
        <div role="group" aria-label="Modo de lectura" style={{ display: "flex", border: "1px solid rgba(212,175,104,0.45)", borderRadius: 6, overflow: "hidden" }}>
          {(["vertical", "horizontal"] as const).map((option) => <button key={option} type="button" onClick={() => selectMode(option)} aria-label={`Lectura ${option}`} aria-pressed={mode === option} style={{ ...control, border: 0, borderRadius: 0, background: mode === option ? "#9b7840" : "#0c1930", padding: "3px 8px" }}>{option === "vertical" ? "↕" : "↔"}<span className="hidden sm:inline"> {option === "vertical" ? "Vertical" : "Horizontal"}</span></button>)}
        </div>
        <button style={control} disabled={page <= 1 || !total} onClick={() => go(page - 1)} aria-label="Página anterior">←</button>
        <form onSubmit={(event) => { event.preventDefault(); go(Number(pageInput)); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
          <input aria-label="Ir a la página" inputMode="numeric" value={pageInput} onChange={(event) => setPageInput(event.target.value)} style={{ width: 43, padding: "4px 5px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.25)", background: "#0c1930", color: "white", textAlign: "center" }} />
          <span>/ {total || "…"}</span>
        </form>
        <button style={control} disabled={page >= total || !total} onClick={() => go(page + 1)} aria-label="Página siguiente">→</button>
        <span style={{ flex: 1 }} />
        <button style={control} onClick={() => onBookmark(page)} disabled={!total} title={bookmarks.includes(page) ? "Quitar marcador" : "Marcar página"} aria-label="Marcar página">{bookmarks.includes(page) ? "★" : "☆"}</button>
        <button style={control} onClick={() => selectZoom(zoom - 0.1)} aria-label="Reducir zoom">−</button>
        <span style={{ fontSize: "0.72rem", minWidth: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button style={control} onClick={() => selectZoom(zoom + 0.1)} aria-label="Aumentar zoom">+</button>
        <button style={control} onClick={() => selectZoom(1, "width")} title="Ajustar al ancho">Ancho</button>
        <button style={control} onClick={() => selectZoom(1, "page")} title="Ajustar página">Página</button>
        {canDownload && <button style={control} onClick={onDownload} title="Descargar">↓</button>}
        {canPrint && <button style={control} onClick={onPrint} title="Imprimir">▤</button>}
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.1)" }}><div style={{ height: "100%", width: `${percent}%`, background: "#d4af68" }} /></div>
      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {indexOpen && <>
          <button aria-label="Cerrar índice" onClick={() => setIndexOpen(false)} className="md:hidden" style={{ position: "absolute", inset: 0, zIndex: 4, border: 0, background: "rgba(0,0,0,0.45)" }} />
          <aside style={{ width: 220, maxWidth: "80vw", background: "#0e1b30", overflowY: "auto", padding: 10, zIndex: 5, flexShrink: 0 }} className="max-md:absolute max-md:inset-y-0 max-md:left-0">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: "0.8rem", fontWeight: 700 }}><span>Índice</span><button style={control} onClick={() => setIndexOpen(false)} aria-label="Cerrar índice">×</button></div>
            {outline.length > 0 && <div style={{ marginBottom: 14 }}>{outline.map((entry, index) => <button key={`${entry.page}-${index}`} onClick={() => { go(entry.page); setIndexOpen(false); }} style={{ display: "block", width: "100%", padding: `7px 4px 7px ${6 + entry.depth * 12}px`, border: 0, background: "transparent", color: "#dbe7f4", textAlign: "left", fontSize: "0.75rem", cursor: "pointer" }}>{entry.title}</button>)}</div>}
            <div style={{ fontSize: "0.68rem", color: "#a8bdd3", marginBottom: 6 }}>PÁGINAS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>{Array.from({ length: total }, (_, index) => <button key={index} onClick={() => { go(index + 1); setIndexOpen(false); }} style={{ ...control, padding: "3px 0", background: index + 1 === page ? "#9b7840" : control.background }}>{index + 1}{bookmarks.includes(index + 1) ? "★" : ""}</button>)}</div>
          </aside>
        </>}
        <div ref={stageRef} aria-label={`${title}, lectura ${mode}`} style={{ flex: 1, overflow: "auto", minWidth: 0, position: "relative", display: mode === "horizontal" ? "flex" : "block", alignItems: mode === "horizontal" ? "center" : undefined, scrollSnapType: mode === "horizontal" && zoom <= 1 ? "x proximity" : undefined, overscrollBehavior: "contain" }}>
          {error ? <div role="alert" style={{ padding: 18 }}>{error}</div> : !pdf ? <div role="status" style={{ padding: 18 }}>Abriendo documento…</div> : Array.from({ length: total }, (_, index) => {
            const number = index + 1;
            const dimensions = pageSizes[number] ?? baseSize;
            const width = dimensions.width * scale;
            const height = dimensions.height * scale;
            return <div key={number} data-pdf-page={number} style={{ boxSizing: "border-box", flex: mode === "horizontal" ? "0 0 auto" : undefined, width: Math.max(viewportSize.width, width + 36), minHeight: height + 36, padding: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: mode === "vertical" ? "0 auto 8px" : undefined, scrollSnapAlign: mode === "horizontal" ? "start" : undefined }}>
              {Math.abs(number - page) <= renderRadius ? <RenderedPage pdf={pdf} number={number} scale={scale} onSize={onSize} /> : <div aria-hidden="true" style={{ width, height, background: "rgba(255,255,255,0.12)" }} />}
            </div>;
          })}
        </div>
      </div>
      <div style={{ padding: "4px 12px", fontSize: "0.68rem", color: "#bdc9d8", background: "#172339" }}>Página {page} de {total || "…"} · {percent}% de páginas visitadas</div>
    </div>
  );
}
