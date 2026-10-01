import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface OutlineEntry { title: string; page: number; depth: number; }

interface Props {
  url: string;
  title: string;
  page: number;
  bookmarks: number[];
  visitedCount: number;
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

/** Visor controlado: sólo renderiza la página activa; conserva el PDF en memoria. */
export function PdfStudyViewer({ url, title, page, bookmarks, visitedCount, onPage, onPageText, onReady, onBookmark, onUnavailable, canDownload, canPrint, onDownload, onPrint }: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [outline, setOutline] = useState<OutlineEntry[]>([]);
  const [indexOpen, setIndexOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState<"width" | "page">("width");
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 800 });
  const [pageInput, setPageInput] = useState(String(page));
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ onReady, onUnavailable, onPageText });
  latest.current = { onReady, onUnavailable, onPageText };

  useEffect(() => setPageInput(String(page)), [page]);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    let task: ReturnType<typeof import("pdfjs-dist").getDocument> | null = null;
    setPdf(null);
    setOutline([]);
    setError("");
    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        task = pdfjs.getDocument({ url: url.split("#")[0], withCredentials: false });
        loaded = await task.promise;
        if (cancelled) return;
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
    const measure = () => setViewportSize({ width: stage.clientWidth, height: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !canvasRef.current || page < 1 || page > pdf.numPages) return;
    let cancelled = false;
    let renderTask: ReturnType<Awaited<ReturnType<typeof pdf.getPage>>["render"]> | null = null;
    void (async () => {
      try {
        const pdfPage = await pdf.getPage(page);
        if (cancelled || !canvasRef.current) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const availableWidth = Math.max(100, viewportSize.width - 36);
        const availableHeight = Math.max(100, viewportSize.height - 36);
        const scale = (fit === "width" ? availableWidth / base.width : Math.min(availableWidth / base.width, availableHeight / base.height)) * zoom;
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
        if (cancelled) return;
        const content = await pdfPage.getTextContent();
        if (!cancelled) latest.current.onPageText(content.items.map((item) => "str" in item ? item.str : "").join(" ").trim().slice(0, 4000));
      } catch (cause) {
        if (!cancelled && !(cause instanceof Error && cause.name === "RenderingCancelledException")) setError("No se pudo mostrar esta página.");
      }
    })();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, page, zoom, fit, viewportSize.width, viewportSize.height]);

  const total = pdf?.numPages ?? 0;
  const go = (value: number) => {
    if (!total) return;
    onPage(Math.min(total, Math.max(1, Math.trunc(value))), total);
  };
  const percent = total ? Math.round((visitedCount / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, flex: 1, background: "#242a33", color: "white" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", padding: "6px 10px", background: "#172339", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <button style={control} onClick={() => setIndexOpen((value) => !value)} aria-label="Abrir o cerrar índice">☰ <span className="hidden sm:inline">Índice</span></button>
        <button style={control} disabled={page <= 1 || !total} onClick={() => go(page - 1)} aria-label="Página anterior">←</button>
        <form onSubmit={(event) => { event.preventDefault(); go(Number(pageInput)); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
          <input aria-label="Ir a la página" inputMode="numeric" value={pageInput} onChange={(event) => setPageInput(event.target.value)} style={{ width: 43, padding: "4px 5px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.25)", background: "#0c1930", color: "white", textAlign: "center" }} />
          <span>/ {total || "…"}</span>
        </form>
        <button style={control} disabled={page >= total || !total} onClick={() => go(page + 1)} aria-label="Página siguiente">→</button>
        <span style={{ flex: 1 }} />
        <button style={control} onClick={() => onBookmark(page)} disabled={!total} title={bookmarks.includes(page) ? "Quitar marcador" : "Marcar página"} aria-label="Marcar página">{bookmarks.includes(page) ? "★" : "☆"}</button>
        <button style={control} onClick={() => setZoom((value) => Math.max(0.5, +(value - 0.1).toFixed(1)))} aria-label="Reducir zoom">−</button>
        <span style={{ fontSize: "0.72rem", minWidth: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button style={control} onClick={() => setZoom((value) => Math.min(2, +(value + 0.1).toFixed(1)))} aria-label="Aumentar zoom">+</button>
        <button style={control} onClick={() => { setFit("width"); setZoom(1); }} title="Ajustar al ancho">Ancho</button>
        <button style={control} onClick={() => { setFit("page"); setZoom(1); }} title="Ajustar página">Página</button>
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
        <div ref={stageRef} style={{ flex: 1, overflow: "auto", textAlign: "center", minWidth: 0, padding: 18 }}>
          {error ? <div role="alert">{error}</div> : !pdf ? <div role="status">Abriendo documento…</div> : <canvas ref={canvasRef} aria-label={`${title}, página ${page} de ${total}`} style={{ display: "block", margin: "0 auto", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", background: "white" }} />}
        </div>
      </div>
      <div style={{ padding: "4px 12px", fontSize: "0.68rem", color: "#bdc9d8", background: "#172339" }}>Página {page} de {total || "…"} · {percent}% de páginas visitadas</div>
    </div>
  );
}
