import { createFileRoute } from "@tanstack/react-router";
import { YarisAvatar } from "@/components/shared/YarisAvatar";
import { useState, useEffect, useRef, useMemo, useDeferredValue } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  getMateriales,
  isPaid,
  logActivity,
  logYarisUse,
  materiaBySlug,
  useSessionUser,
  useStore,
} from "@/lib/store";
import { useYarisAsk, toHistory } from "@/lib/yaris-ask";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { ReportProblemModal } from "@/components/shared/ReportProblemModal";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { sanitizeHtml } from "@/lib/yaris-format";

export const Route = createFileRoute("/dashboard/biblioteca")({
  component: BibliotecaPage,
});

/* ─── Data ───────────────────────────────────────────────── */

interface Book {
  id: string;
  title: string;
  author: string;
  emoji: string;
  gradient: string;
  badge: string;
  badgeColor: string;
  tags: string[];
  materiaTag: string;
  pages: number;
  fileUrl: string;
  descargable: boolean;
  imprimible: boolean;
  muestraGratis: boolean;
}

/** Fuente del material (etiqueta de origen). */
const FILTER_TABS = [
  { key: "todos", label: "Todos" },
  { key: "oficial", label: "Oficiales CIAAC" },
  { key: "linea-aerea", label: "Línea Aérea" },
  { key: "oaci", label: "OACI" },
  { key: "faa", label: "FAA" },
  { key: "ley", label: "Leyes MX" },
  { key: "jeppesen", label: "Jeppesen" },
  { key: "libro", label: "Libros" },
];

/** Orden de lectura del catálogo. */
const SORTS = [
  { key: "az", label: "A–Z" },
  { key: "za", label: "Z–A" },
  { key: "materia", label: "Por materia" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

/** URL de descarga directa de Drive a partir de la URL del visor (/preview). */
function driveDownloadUrl(fileUrl: string): string {
  const m = fileUrl.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : fileUrl;
}

interface YarisMsg { role: "bot" | "user"; text: string; cite?: string; }

/* ─── Main component ─────────────────────────────────────── */

function BibliotecaPage() {
  const user = useSessionUser();
  const paid = isPaid(user);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [materiaFilter, setMateriaFilter] = useState("todas");
  const [sort, setSort] = useState<SortKey>("az");
  const [readerBook, setReaderBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [yarisOpen, setYarisOpen] = useState(true);
  const [yarisMsgs, setYarisMsgs] = useState<YarisMsg[]>([]);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisTyping, setYarisTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const askYaris = useYarisAsk();
  const [featHover, setFeatHover] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [viewerNotice, setViewerNotice] = useState<string | null>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const pdfIframeRef = useRef<HTMLIFrameElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Materiales reales desde el store (solo publicados)
  const books = useStore<Book[]>(() =>
    getMateriales()
      .filter((m) => m.status === "publicada")
      .map((m) => ({
        id: m.id,
        title: m.titulo,
        author: m.autor,
        emoji: m.emoji,
        gradient: m.gradient,
        badge: m.badge,
        badgeColor: m.badgeColor,
        tags: m.tags,
        materiaTag: materiaBySlug(m.materia)?.name ?? "",
        pages: m.pages,
        fileUrl: m.fileUrl,
        descargable: m.descargable,
        imprimible: m.imprimible,
        muestraGratis: m.muestraGratis,
      })),
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMsgs, yarisTyping]);

  function canOpen(book: Book): boolean {
    return paid || book.muestraGratis;
  }

  function openBook(book: Book) {
    if (!canOpen(book)) {
      setUpgradeOpen(true);
      return;
    }
    openReader(book);
  }

  function showNotice(msg: string) {
    setViewerNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setViewerNotice(null), 2600);
  }

  function openReader(book: Book) {
    if (user) {
      logActivity({ userId: user.id, kind: "biblioteca", label: "Biblioteca — " + book.title, durationMin: 0 });
      logYarisUse(user.id, "Biblioteca");
    }
    setReaderBook(book);
    setCurrentPage(1);
    setZoom(1);
    setYarisOpen(true);
    // Saludo local (no simula pensar); las respuestas vienen del modelo real.
    setYarisMsgs([
      {
        role: "bot",
        text: `¡Hola! Estoy aquí para ayudarte mientras lees <strong>${book.title}</strong>. Pregúntame sobre cualquier concepto que no te quede claro. Por ejemplo: "¿Qué es la capa límite?" o "Explícame Bernoulli con un ejemplo de la vida real".`,
      },
    ]);
  }

  async function sendYaris() {
    const text = yarisInput.trim();
    if (!text || !readerBook || yarisTyping) return;
    const next = [...yarisMsgs, { role: "user" as const, text }];
    setYarisMsgs(next);
    setYarisInput("");
    setYarisTyping(true);
    const answer = await askYaris({
      history: toHistory(next.map((m) => ({ text: m.text, fromUser: m.role === "user" }))),
      ctx: {
        resourceTitle: readerBook.title,
        ...(readerBook.materiaTag && { materiaName: readerBook.materiaTag }),
      },
    });
    setYarisTyping(false);
    setYarisMsgs((p) => [...p, { role: "bot", text: answer.text, cite: answer.cite ?? undefined }]);
  }

  function handleDownload() {
    if (!readerBook) return;
    if (readerBook.fileUrl) window.open(driveDownloadUrl(readerBook.fileUrl), "_blank");
    else showNotice("El archivo estará disponible próximamente");
  }

  function handlePrint() {
    if (!readerBook) return;
    if (!readerBook.fileUrl) {
      showNotice("El archivo estará disponible próximamente");
      return;
    }
    if (/drive\.google\.com|docs\.google\.com/.test(readerBook.fileUrl)) {
      // El visor de Drive es de otro origen: se descarga el PDF para imprimirlo.
      window.open(driveDownloadUrl(readerBook.fileUrl), "_blank");
      showNotice("Se abrió el PDF en otra pestaña — imprímelo desde tu navegador");
      return;
    }
    try {
      pdfIframeRef.current?.contentWindow?.print();
    } catch {
      showNotice("No se pudo imprimir automáticamente. Descarga el PDF para imprimirlo.");
    }
  }

  /* Filter books — el texto se difiere y el índice se memoiza para que el
     buscador no re-filtre toda la biblioteca (100+ manuales) en cada tecla. */
  const deferredSearch = useDeferredValue(search);
  const searchIndex = useMemo(
    () => books.map((b) => `${b.title} ${b.author} ${b.tags.join(" ")} ${b.materiaTag}`.toLowerCase()),
    [books],
  );

  /** Materias presentes en el catálogo, con cuántos manuales tiene cada una. */
  const materiaOptions = useMemo(() => {
    const counts = new Map<string, number>();
    books.forEach((b) => {
      const name = b.materiaTag || "General";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const out = books.filter((b, i) => {
      if (filter !== "todos" && !b.tags.includes(filter)) return false;
      if (materiaFilter !== "todas" && (b.materiaTag || "General") !== materiaFilter) return false;
      return !q || searchIndex[i].includes(q);
    });
    const byTitle = (a: Book, b: Book) => a.title.localeCompare(b.title, "es");
    if (sort === "za") return out.sort((a, b) => byTitle(b, a));
    if (sort === "materia")
      return out.sort(
        (a, b) =>
          (a.materiaTag || "General").localeCompare(b.materiaTag || "General", "es") || byTitle(a, b),
      );
    return out.sort(byTitle);
  }, [books, searchIndex, filter, materiaFilter, sort, deferredSearch]);

  // Paginación incremental: se pintan de 24 en 24 para que la primera carga no
  // monte todas las tarjetas de golpe.
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, materiaFilter, sort, deferredSearch]);
  const visibleBooks = filteredBooks.slice(0, visibleCount);

  const featured = books.find((b) => b.id === "aero-basica") ?? books[0];
  const canDownload = !!readerBook && readerBook.descargable && (paid || readerBook.muestraGratis);
  const canPrint = !!readerBook && readerBook.imprimible && (paid || readerBook.muestraGratis);
  const userInitials =
    (user?.nombre ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "TÚ";

  return (
    <>
      <style>{`@keyframes yb2{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}.yds2{width:5px;height:5px;background:#5A86CB;border-radius:50%;animation:yb2 .8s infinite}.yds2:nth-child(2){animation-delay:.15s}.yds2:nth-child(3){animation-delay:.3s}`}</style>

      {/* ── LIBRARY CONTENT ── */}
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>
        <ModuleHeader
          eyebrow="Recursos · Biblioteca"
          title="Todo el material,"
          accent="a mano"
          tail="."
          subtitle="Los manuales oficiales, la normativa y los libros del curso, con Yaris leyendo a tu lado."
        />

        {/* Search + filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", color: "#8DA1BE", display: "flex" }}><Icon n="search" size={18} /></span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar libro, autor o materia..."
              style={{ width: "100%", padding: "11px 16px 11px 42px", border: "2px solid #F2DCDB", borderRadius: 12, fontSize: "0.9rem", fontFamily: "'Manrope', sans-serif", outline: "none", background: "white", transition: "border-color 0.2s" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTER_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                style={{ padding: "8px 16px", border: `2px solid ${filter === t.key ? "#3D5D91" : "#F2DCDB"}`, borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", background: filter === t.key ? "#3D5D91" : "white", color: filter === t.key ? "white" : "#647DA0", transition: "all 0.2s", fontFamily: "'Manrope', sans-serif" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Segunda fila de filtros: materia, orden y resultado */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 700, color: "#647DA0" }}>
            <Icon n="book" size={15} /> Materia
            <select
              value={materiaFilter}
              onChange={(e) => setMateriaFilter(e.target.value)}
              style={{ border: "2px solid #F2DCDB", borderRadius: 10, padding: "7px 10px", fontSize: "0.8rem", fontFamily: "'Manrope', sans-serif", color: "#22375C", background: "white", outline: "none", cursor: "pointer", fontWeight: 600 }}
            >
              <option value="todas">Todas ({books.length})</option>
              {materiaOptions.map(([name, n]) => (
                <option key={name} value={name}>{name} ({n})</option>
              ))}
            </select>
          </label>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 700, color: "#647DA0" }}>
            <Icon n="chart" size={15} /> Orden
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{ border: "2px solid #F2DCDB", borderRadius: 10, padding: "7px 10px", fontSize: "0.8rem", fontFamily: "'Manrope', sans-serif", color: "#22375C", background: "white", outline: "none", cursor: "pointer", fontWeight: 600 }}
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>

          <span style={{ fontSize: "0.78rem", color: "#8DA1BE", fontWeight: 600 }}>
            {filteredBooks.length} {filteredBooks.length === 1 ? "material" : "materiales"}
          </span>

          {(filter !== "todos" || materiaFilter !== "todas" || search.trim() !== "") && (
            <button
              onClick={() => { setFilter("todos"); setMateriaFilter("todas"); setSearch(""); }}
              style={{ marginLeft: "auto", padding: "7px 14px", border: "2px solid #F2DCDB", background: "white", color: "#6C0820", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Icon n="close" size={13} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Featured card */}
        {featured && (
          <div style={{ marginBottom: 32 }}>
            <div
              onClick={() => openBook(featured)}
              onMouseEnter={() => setFeatHover(true)}
              onMouseLeave={() => setFeatHover(false)}
              style={{ background: "linear-gradient(135deg,#22375C,#2a2a4e)", borderRadius: 18, padding: 28, display: "flex", alignItems: "center", gap: 24, color: "white", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden", transform: featHover ? "translateY(-3px)" : "none", boxShadow: featHover ? "0 12px 40px rgba(26,26,46,0.4)" : "none", flexWrap: "wrap" }}
            >
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle,rgba(90,134,203,0.3) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
              <div style={{ fontSize: "5rem", flexShrink: 0, display: "flex" }}><Icon n="book" size={72} /></div>
              <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#F2AEBC", color: "#6C0820", padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, marginBottom: 8 }}><Icon n="star" size={14} /> Más consultado</div>
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", marginBottom: 6 }}>{featured.title}</h3>
                <p style={{ fontSize: "0.84rem", opacity: 0.75, lineHeight: 1.5, marginBottom: 14 }}>Un buen punto de partida de la biblioteca. Ábrelo en el visor y estudia con Yaris a tu lado para resolver tus dudas al instante.</p>
                <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", opacity: 0.65, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n="doc" size={14} /> {featured.author}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon n="plane" size={14} /> {featured.materiaTag || "Todas las materias"}</span>
                </div>
              </div>
              <button style={{ padding: "10px 20px", background: "#F2AEBC", color: "#6C0820", border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", flexShrink: 0 }}>
                Leer ahora →
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", color: "#22375C", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon n="doc" size={20} />{" "}
            {materiaFilter !== "todas"
              ? materiaFilter
              : filter === "todos"
                ? "Todo el catálogo"
                : (FILTER_TABS.find((t) => t.key === filter)?.label ?? "Todo el catálogo")}
          </h2>
        </div>

        {/* Books grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18, marginBottom: 32 }}>
          {visibleBooks.map((book) => (
            <BookCard key={book.id} book={book} locked={!canOpen(book)} onOpen={() => openBook(book)} />
          ))}
          {visibleCount < filteredBooks.length && (
            <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "center", padding: "8px 0" }}>
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                style={{ padding: "10px 22px", border: "2px solid #F2DCDB", background: "white", color: "#3D5D91", borderRadius: 22, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                Ver más manuales ({filteredBooks.length - visibleCount} restantes)
              </button>
            </div>
          )}
          {filteredBooks.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#647DA0", fontSize: "0.9rem" }}>
              No se encontraron libros con esa búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* ── READER MODAL ── */}
      {readerBook && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#22375C", display: "flex", flexDirection: "column", fontFamily: "'Manrope', sans-serif" }}>

          {/* Reader topbar */}
          <div style={{ height: 56, background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setReaderBook(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Cerrar</button>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "white" }} className="hidden sm:inline">{readerBook.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setReportOpen(true)}
                title="Reportar problema"
                style={{ padding: "6px 12px", background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.85)", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Icon n="alert" size={14} /> Reportar
              </button>
              {!yarisOpen && (
                <button onClick={() => setYarisOpen(true)} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <YarisAvatar size={20} /> Mostrar Yaris
                </button>
              )}
              <button onClick={() => setYarisOpen(true)} style={{ padding: "6px 14px", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", color: "white", border: "none", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                <YarisAvatar size={20} /> Explícamelo Yaris
              </button>
            </div>
          </div>

          {/* Reader body */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

            {/* PDF viewer */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#2a2a2a" }}>
              {/* PDF toolbar */}
              <div style={{ height: 44, background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
                {readerBook.fileUrl ? (
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>Documento oficial — usa los controles del visor para navegar</span>
                ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Anterior</button>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>Página {currentPage} de {readerBook.pages}</span>
                  <button onClick={() => setCurrentPage((p) => Math.min(readerBook.pages, p + 1))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Siguiente →</button>
                </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {!readerBook.fileUrl && (<>
                  <button onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>−</button>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(1))))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>+</button>
                  </>)}
                  <button
                    onClick={handleDownload}
                    disabled={!canDownload}
                    title="Descargar"
                    style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: canDownload ? "pointer" : "not-allowed", opacity: canDownload ? 1 : 0.4, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center" }}
                  >
                    <Icon n="download" size={14} />
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={!canPrint}
                    title="Imprimir"
                    style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: canPrint ? "pointer" : "not-allowed", opacity: canPrint ? 1 : 0.4, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center" }}
                  >
                    <Icon n="doc" size={14} />
                  </button>
                </div>
              </div>

              {/* PDF content */}
              {readerBook.fileUrl ? (
                <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
                  <iframe
                    ref={pdfIframeRef}
                    src={readerBook.fileUrl}
                    title={readerBook.title}
                    style={{ flex: 1, width: "100%", height: "100%", border: "none", background: "white" }}
                  />
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, background: "#F7F9FC" }}>
                  <div style={{ maxWidth: 380, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "#8DA1BE" }}>
                      <Icon n="book" size={40} />
                    </div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#22375C", marginBottom: 6 }}>
                      Este material aún no tiene archivo
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#647DA0", lineHeight: 1.55 }}>
                      En cuanto se cargue el PDF podrás leerlo aquí. Mientras tanto puedes
                      preguntarle a Yaris sobre el tema.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Yaris panel */}
            <div
              style={
                isMobile && yarisOpen
                  ? { position: "absolute", top: 0, right: 0, bottom: 0, zIndex: 50, width: "100%", background: "white", display: "flex", flexDirection: "column" }
                  : { width: yarisOpen ? 320 : 0, overflow: "hidden", flexShrink: 0, background: "white", borderLeft: yarisOpen ? "1px solid rgba(61,93,145,0.1)" : "none", display: "flex", flexDirection: "column", transition: "width 0.35s ease" }
              }
            >
              <div style={{ padding: "14px 16px", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}><YarisAvatar size={28} /></div>
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
                    <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)" }}>Leyendo contigo 24/7</div>
                  </div>
                </div>
                <button onClick={() => setYarisOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center" }}><Icon n="close" size={14} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {yarisMsgs.map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.role === "bot" ? "0.75rem" : "0.58rem", fontWeight: msg.role === "user" ? 700 : undefined, background: msg.role === "bot" ? "#F2DCDB" : "#3D5D91", color: msg.role === "user" ? "white" : "#6C0820", flexShrink: 0 }}>
                      {msg.role === "bot" ? <YarisAvatar size={22} /> : userInitials}
                    </div>
                    <div style={{ maxWidth: "84%", padding: "8px 11px", borderRadius: msg.role === "bot" ? "4px 12px 12px 12px" : "12px 4px 12px 12px", fontSize: "0.8rem", lineHeight: 1.5, background: msg.role === "bot" ? "#f0f4ff" : "#3D5D91", color: msg.role === "bot" ? "#22375C" : "white" }}>
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                      {msg.cite && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, padding: "3px 8px", background: "rgba(61,93,145,0.08)", borderLeft: "3px solid #3D5D91", borderRadius: 3, fontSize: "0.68rem", color: "#3D5D91", fontWeight: 600 }}><Icon n="book" size={12} /> {msg.cite}</div>}
                    </div>
                  </div>
                ))}
                {yarisTyping && (
                  <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0, color: "#6C0820" }}><YarisAvatar size={22} /></div>
                    <div style={{ padding: "8px 11px", background: "#f0f4ff", borderRadius: "4px 12px 12px 12px", display: "flex", alignItems: "center", gap: 3 }}>
                      <div className="yds2" /><div className="yds2" /><div className="yds2" />
                    </div>
                  </div>
                )}
                <div ref={msgsEndRef} />
              </div>

              <div style={{ padding: "10px 12px", borderTop: "1px solid #eee", display: "flex", gap: 6, flexShrink: 0 }}>
                <input
                  value={yarisInput}
                  onChange={(e) => setYarisInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendYaris(); }}
                  placeholder="Pregúntame sobre lo que lees..."
                  style={{ flex: 1, border: "2px solid #F2DCDB", borderRadius: 16, padding: "6px 11px", fontSize: "0.8rem", fontFamily: "'Manrope', sans-serif", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; }}
                />
                <button onClick={sendYaris} style={{ width: 30, height: 30, background: "#3D5D91", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}><Icon n="send" size={15} /></button>
              </div>
            </div>
          </div>

          {/* Aviso del visor */}
          {viewerNotice && (
            <div
              style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 60,
                background: "white",
                border: "1px solid #E8EEF6",
                borderRadius: 12,
                padding: "10px 16px",
                boxShadow: "0 12px 30px -10px rgba(15,26,51,0.35)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#33527F",
              }}
            >
              <Icon n="info" size={14} color="#3D5D91" /> {viewerNotice}
            </div>
          )}
        </div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Biblioteca completa"
        userId={user?.id}
      />
      <ReportProblemModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        user={user}
        seccion="Biblioteca"
        recurso={readerBook?.id ?? ""}
        tipoInicial="Problema con PDF o descarga"
      />
    </>
  );
}

/* ─── Book Card ──────────────────────────────────────────── */

function BookCard({ book, locked = false, onOpen }: { book: Book; locked?: boolean; onOpen: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: hover ? "0 8px 24px rgba(61,93,145,0.12)" : "0 2px 10px rgba(61,93,145,0.06)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateY(-3px)" : "none" }}
    >
      <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative", background: book.gradient, color: "white" }}>
        <span style={{ display: "flex" }}><Icon n={book.emoji as never} size={52} /></span>
        <span style={{ position: "absolute", top: 8, right: 8, padding: "2px 8px", borderRadius: 10, fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", background: book.badgeColor, color: "white" }}>
          {book.badge}
        </span>
        {locked && (
          <span style={{ position: "absolute", inset: 0, background: "rgba(34,55,92,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D5D91" }}>
              <Icon n="lock" size={16} />
            </span>
          </span>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#22375C", marginBottom: 4, lineHeight: 1.3 }}>{book.title}</div>
        <div style={{ fontSize: "0.74rem", color: "#647DA0", marginBottom: 8 }}>{book.author}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ padding: "2px 8px", background: "#F2DCDB", color: "#6C0820", borderRadius: 10, fontSize: "0.65rem", fontWeight: 600 }}>{book.materiaTag || "General"}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          style={{ width: "100%", padding: "7px 0", background: "#3D5D91", color: "white", border: "none", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "background 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2d4a7a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3D5D91"; }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{locked ? <Icon n="lock" size={14} /> : <Icon n="book" size={14} />} Leer</span>
        </button>
      </div>
    </div>
  );
}

