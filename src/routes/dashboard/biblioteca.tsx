import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

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
}

const BOOKS: Book[] = [
  { id: "aero-basica", title: "Aerodinámica Básica", author: "Muñiz, A. — CIAAC", emoji: "✈️", gradient: "linear-gradient(135deg,#667eea,#764ba2)", badge: "Oficial", badgeColor: "#3D5D91", tags: ["oficial", "aerodinamica"], materiaTag: "✈️ Aerodinámica", pages: 95 },
  { id: "aero-avanzada", title: "Aerodinámica Avanzada", author: "CIAAC", emoji: "🛫", gradient: "linear-gradient(135deg,#f093fb,#f5576c)", badge: "Oficial", badgeColor: "#3D5D91", tags: ["oficial", "aerodinamica"], materiaTag: "✈️ Aerodinámica", pages: 191 },
  { id: "sta", title: "Servicios de Tránsito Aéreo", author: "SCT-DGAC-CIAAC", emoji: "🗼", gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", badge: "Oficial", badgeColor: "#3D5D91", tags: ["oficial", "transito"], materiaTag: "🗼 Tránsito Aéreo", pages: 120 },
  { id: "aeronaves", title: "Aeronaves y Motores: Generalidades", author: "SCT-DGAC-CIAAC", emoji: "⚙️", gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", badge: "Oficial", badgeColor: "#3D5D91", tags: ["oficial", "aeronaves"], materiaTag: "⚙️ Aeronaves", pages: 145 },
  { id: "medicina", title: "Medicina Aeronáutica", author: "Amezcua, L. A. — CIAAC", emoji: "🏥", gradient: "linear-gradient(135deg,#fa709a,#fee140)", badge: "Oficial", badgeColor: "#3D5D91", tags: ["oficial", "medicina"], materiaTag: "🏥 Medicina", pages: 88 },
  { id: "ifh", title: "Instrument Flying Handbook", author: "Federal Aviation Administration", emoji: "🗺️", gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", badge: "FAA", badgeColor: "#5A86CB", tags: ["faa", "navegacion"], materiaTag: "🗺️ Navegación", pages: 322 },
  { id: "jeppesen-charts", title: "Introduction to Jeppesen Navigation Charts", author: "Jeppesen Inc. — 2012", emoji: "📊", gradient: "linear-gradient(135deg,#ffecd2,#fcb69f)", badge: "Jeppesen", badgeColor: "#6C0820", tags: ["jeppesen", "navegacion"], materiaTag: "📋 Manuales AIP", pages: 156 },
  { id: "oaci-fh", title: "Manual de Instrucción de Factores Humanos", author: "OACI — Doc. 9683", emoji: "🧠", gradient: "linear-gradient(135deg,#2af598,#009efd)", badge: "OACI", badgeColor: "#3D5D91", tags: ["oaci", "factores"], materiaTag: "🧠 Factores Humanos", pages: 210 },
];

const FILTER_TABS = [
  { key: "todos", label: "Todos" },
  { key: "oficial", label: "Oficiales CIAAC" },
  { key: "faa", label: "FAA" },
  { key: "jeppesen", label: "Jeppesen" },
  { key: "oaci", label: "OACI" },
];

const YARIS_REPLIES = [
  { t: "¡Claro! La aerodinámica estudia cómo el aire interactúa con los cuerpos en movimiento. Para ti como piloto, lo más importante es entender cómo el ala genera sustentación. 🌊", c: "Aerodinámica Básica CIAAC, Cap. 1, p. 3" },
  { t: "Piénsalo así: el ala tiene forma de lágrima. El aire de arriba recorre más distancia → va más rápido → menor presión. El de abajo va más lento → mayor presión. ¡Esa diferencia 'jala' el avión hacia arriba! 🎯", c: "Aerodinámica Básica CIAAC, Cap. 4, p. 18" },
  { t: "¿Recuerdas a Buzz Lightyear 'cayendo con estilo'? Eso no es vuelo porque no hay sustentación real. Un avión sí la genera gracias a la forma de sus alas y Bernoulli. 🚀", c: null },
  { t: "La presión estática es como el peso del aire sobre ti en reposo. La presión dinámica es la 'fuerza extra' que sientes cuando metes la mano por la ventanilla del carro a 100 km/h. ¡Juntas forman la presión total! 💨", c: "Aerodinámica Básica CIAAC, Cap. 1, p. 8" },
];

interface YarisMsg { role: "bot" | "user"; text: string; cite?: string; }

/* ─── Main component ─────────────────────────────────────── */

function BibliotecaPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [readerBook, setReaderBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [yarisOpen, setYarisOpen] = useState(true);
  const [yarisMsgs, setYarisMsgs] = useState<YarisMsg[]>([]);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisTyping, setYarisTyping] = useState(false);
  const [yarisReplyIdx, setYarisReplyIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [featHover, setFeatHover] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [yarisMsgs, yarisTyping]);

  function openReader(book: Book) {
    setReaderBook(book);
    setCurrentPage(1);
    setZoom(1);
    setYarisOpen(true);
    setYarisMsgs([]);
    setYarisTyping(true);
    setTimeout(() => {
      setYarisTyping(false);
      setYarisMsgs([{ role: "bot", text: `¡Hola! Estoy aquí para ayudarte mientras lees <strong>${book.title}</strong>. 📖 Pregúntame sobre cualquier concepto que no te quede claro y te lo explico con ejemplos y nemotecnias.` }]);
      setTimeout(() => {
        setYarisTyping(true);
        setTimeout(() => {
          setYarisTyping(false);
          setYarisMsgs((p) => [...p, { role: "bot", text: 'Por ejemplo: "¿Qué es la capa límite?" o "Explícame Bernoulli con un ejemplo de la vida real". 🚀' }]);
        }, 900);
      }, 300);
    }, 800);
  }

  function sendYaris() {
    const text = yarisInput.trim();
    if (!text) return;
    setYarisMsgs((p) => [...p, { role: "user", text }]);
    setYarisInput("");
    setYarisTyping(true);
    const ri = yarisReplyIdx % YARIS_REPLIES.length;
    setYarisReplyIdx((r) => r + 1);
    setTimeout(() => {
      setYarisTyping(false);
      const r = YARIS_REPLIES[ri];
      setYarisMsgs((p) => [...p, { role: "bot", text: r.t, cite: r.c ?? undefined }]);
    }, 900);
  }

  /* Filter books */
  const filteredBooks = BOOKS.filter((b) => {
    const matchFilter = filter === "todos" || b.tags.includes(filter);
    const q = search.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.tags.some((t) => t.includes(q));
    return matchFilter && matchSearch;
  });

  return (
    <>
      <style>{`@keyframes yb2{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}.yds2{width:5px;height:5px;background:#5A86CB;border-radius:50%;animation:yb2 .8s infinite}.yds2:nth-child(2){animation-delay:.15s}.yds2:nth-child(3){animation-delay:.3s}`}</style>

      {/* ── LIBRARY CONTENT ── */}
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", color: "#aaa" }}>🔍</span>
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
                style={{ padding: "8px 16px", border: `2px solid ${filter === t.key ? "#3D5D91" : "#F2DCDB"}`, borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", background: filter === t.key ? "#3D5D91" : "white", color: filter === t.key ? "white" : "#888", transition: "all 0.2s", fontFamily: "'Manrope', sans-serif" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured card */}
        <div style={{ marginBottom: 32 }}>
          <div
            onClick={() => openReader(BOOKS.find((b) => b.id === "faa-pilot") ?? { id: "faa-pilot", title: "Manual del Piloto — FAA", author: "FAA", emoji: "📘", gradient: "", badge: "FAA", badgeColor: "#5A86CB", tags: ["faa"], materiaTag: "✈️ Aerodinámica · Meteorología", pages: 480 })}
            onMouseEnter={() => setFeatHover(true)}
            onMouseLeave={() => setFeatHover(false)}
            style={{ background: "linear-gradient(135deg,#1a1a2e,#2a2a4e)", borderRadius: 18, padding: 28, display: "flex", alignItems: "center", gap: 24, color: "white", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden", transform: featHover ? "translateY(-3px)" : "none", boxShadow: featHover ? "0 12px 40px rgba(26,26,46,0.4)" : "none", flexWrap: "wrap" }}
          >
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle,rgba(90,134,203,0.3) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ fontSize: "5rem", flexShrink: 0 }}>📘</div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ display: "inline-block", background: "#F2AEBC", color: "#6C0820", padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, marginBottom: 8 }}>⭐ Más consultado</div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.3rem", marginBottom: 6 }}>Manual del Piloto de Conocimientos Aeronáuticos</h3>
              <p style={{ fontSize: "0.84rem", opacity: 0.75, lineHeight: 1.5, marginBottom: 14 }}>La guía completa de la FAA para pilotos. Cubre todos los principios fundamentales del vuelo, meteorología, navegación y operaciones.</p>
              <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", opacity: 0.65, flexWrap: "wrap" }}>
                <span>📄 FAA — 2008</span>
                <span>✈️ Aerodinámica · Meteorología · Navegación</span>
              </div>
            </div>
            <button style={{ padding: "10px 20px", background: "#F2AEBC", color: "#6C0820", border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", flexShrink: 0 }}>
              Leer ahora →
            </button>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", color: "#1a1a2e" }}>📋 Manuales Oficiales CIAAC</h2>
        </div>

        {/* Books grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18, marginBottom: 32 }}>
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onOpen={() => openReader(book)} />
          ))}
          {filteredBooks.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#888", fontSize: "0.9rem" }}>
              No se encontraron libros con esa búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* ── READER MODAL ── */}
      {readerBook && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#1a1a2e", display: "flex", flexDirection: "column", fontFamily: "'Manrope', sans-serif" }}>

          {/* Reader topbar */}
          <div style={{ height: 56, background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setReaderBook(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Cerrar</button>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "white" }} className="hidden sm:inline">{readerBook.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {!yarisOpen && (
                <button onClick={() => setYarisOpen(true)} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  🤖 Mostrar Yaris
                </button>
              )}
              <button onClick={() => setYarisOpen(true)} style={{ padding: "6px 14px", background: "linear-gradient(135deg,#3D5D91,#5A86CB)", color: "white", border: "none", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                🤖 Explícamelo Yaris
              </button>
            </div>
          </div>

          {/* Reader body */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

            {/* PDF viewer */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#2a2a2a" }}>
              {/* PDF toolbar */}
              <div style={{ height: 44, background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>← Anterior</button>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>Página {currentPage} de {readerBook.pages}</span>
                  <button onClick={() => setCurrentPage((p) => Math.min(readerBook.pages, p + 1))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>Siguiente →</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>−</button>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(1))))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)", padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>+</button>
                </div>
              </div>

              {/* PDF content */}
              <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 600, transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s" }}>
                  <ScannedPage book={readerBook} page={currentPage} />
                </div>
              </div>
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
                  <div style={{ width: 30, height: 30, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🤖</div>
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
                    <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)" }}>Leyendo contigo 24/7</div>
                  </div>
                </div>
                <button onClick={() => setYarisOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>✕</button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {yarisMsgs.map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: msg.role === "bot" ? "0.75rem" : "0.58rem", fontWeight: msg.role === "user" ? 700 : undefined, background: msg.role === "bot" ? "#F2DCDB" : "#3D5D91", color: msg.role === "user" ? "white" : undefined, flexShrink: 0 }}>
                      {msg.role === "bot" ? "🤖" : "MG"}
                    </div>
                    <div style={{ maxWidth: "84%", padding: "8px 11px", borderRadius: msg.role === "bot" ? "4px 12px 12px 12px" : "12px 4px 12px 12px", fontSize: "0.8rem", lineHeight: 1.5, background: msg.role === "bot" ? "#f0f4ff" : "#3D5D91", color: msg.role === "bot" ? "#1a1a2e" : "white" }}>
                      <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                      {msg.cite && <div style={{ display: "block", marginTop: 5, padding: "3px 8px", background: "rgba(61,93,145,0.08)", borderLeft: "3px solid #3D5D91", borderRadius: 3, fontSize: "0.68rem", color: "#3D5D91", fontWeight: 600 }}>📖 {msg.cite}</div>}
                    </div>
                  </div>
                ))}
                {yarisTyping && (
                  <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 }}>🤖</div>
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
                <button onClick={sendYaris} style={{ width: 30, height: 30, background: "#3D5D91", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>➤</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Book Card ──────────────────────────────────────────── */

function BookCard({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: hover ? "0 8px 24px rgba(61,93,145,0.12)" : "0 2px 10px rgba(61,93,145,0.06)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateY(-3px)" : "none" }}
    >
      <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative", background: book.gradient }}>
        <span>{book.emoji}</span>
        <span style={{ position: "absolute", top: 8, right: 8, padding: "2px 8px", borderRadius: 10, fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px", background: book.badgeColor, color: "white" }}>
          {book.badge}
        </span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 4, lineHeight: 1.3 }}>{book.title}</div>
        <div style={{ fontSize: "0.74rem", color: "#888", marginBottom: 8 }}>{book.author}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ padding: "2px 8px", background: "#F2DCDB", color: "#6C0820", borderRadius: 10, fontSize: "0.65rem", fontWeight: 600 }}>{book.materiaTag}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          style={{ width: "100%", padding: "7px 0", background: "#3D5D91", color: "white", border: "none", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "background 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2d4a7a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3D5D91"; }}
        >
          📖 Leer
        </button>
      </div>
    </div>
  );
}

/* ─── Scanned page component ─────────────────────────────── */

function ScannedPage({ book, page }: { book: Book; page: number }) {
  const chapters: Record<string, { chapter: string; title: string; sections: { heading: string; body: string }[] }> = {
    "aero-basica": {
      chapter: "CAPÍTULO 1: INTRODUCCIÓN A LA AERODINÁMICA",
      title: "L.2 AERODINÁMICA BÁSICA",
      sections: [
        { heading: "1.1 DEFINICIÓN DE FLUIDO", body: "Un fluido es cualquier sustancia que puede fluir y tomar la forma del recipiente que lo contiene. Tanto los líquidos como los gases son fluidos. El aire, siendo un gas, es el fluido con el que trabaja la aerodinámica aplicada a la aviación." },
        { heading: "1.2 CAPA LÍMITE", body: "La capa límite es la delgada capa de aire que rodea la superficie de un ala y donde los efectos de viscosidad son importantes. Es en esta zona donde se desarrollan los fenómenos más críticos del flujo aerodinámico." },
        { heading: "1.3 PRESIÓN ESTÁTICA Y DINÁMICA", body: "La presión estática es la presión que ejerce el aire en reposo sobre las superficies. La presión dinámica es la presión adicional que resulta del movimiento del aire y está relacionada con la velocidad del flujo." },
      ],
    },
    "default": {
      chapter: "CAPÍTULO 1: INTRODUCCIÓN",
      title: book.title.toUpperCase(),
      sections: [
        { heading: "1.1 CONCEPTOS FUNDAMENTALES", body: "Este manual cubre los conceptos esenciales para el examen de egreso del Piloto Aviador Comercial. El estudiante debe estudiar cada capítulo con atención y relacionar los conceptos con la práctica real de vuelo." },
        { heading: "1.2 OBJETIVOS DE APRENDIZAJE", body: "Al finalizar este capítulo, el estudiante será capaz de identificar los principios básicos, aplicar los conceptos en situaciones reales de vuelo, y responder correctamente las preguntas del examen CIAAC relacionadas con esta materia." },
        { heading: "1.3 REFERENCIAS NORMATIVAS", body: "Este material ha sido elaborado conforme a los estándares de la DGAC-México y los requisitos establecidos por la OACI en el Anexo 1 para la licencia de Piloto Comercial de Avión." },
      ],
    },
  };

  const content = chapters[book.id] ?? chapters["default"];

  return (
    <div style={{ background: "#f9f6f0", borderRadius: 4, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.1)", fontFamily: "'JetBrains Mono', monospace", color: "#2a2a2a", position: "relative" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: "0.7rem", letterSpacing: 2, color: "#333", fontWeight: 700, marginBottom: 4 }}>SECRETARIA DE COMUNICACIONES Y TRANSPORTES</div>
        <div style={{ fontSize: "0.65rem", color: "#555", marginBottom: 2 }}>DIRECCIÓN GENERAL DE AERONÁUTICA CIVIL</div>
        <div style={{ fontSize: "0.65rem", color: "#555", marginBottom: 12 }}>CENTRO INTERNACIONAL DE ADIESTRAMIENTO DE AVIACIÓN CIVIL</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🌐</div>
        </div>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: 1, color: "#333" }}>{content.title}</div>
        <div style={{ fontSize: "0.75rem", color: "#555", marginTop: 2 }}>PILOTO AVIADOR COMERCIAL</div>
      </div>

      <div style={{ height: 2, background: "#333", margin: "14px 0" }} />

      <div>
        <h3 style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.5px", margin: "14px 0 8px", textTransform: "uppercase" }}>
          {content.chapter}
        </h3>
        <p style={{ fontSize: "0.78rem", lineHeight: 1.7, marginBottom: 8, textAlign: "justify" }}>
          La aerodinámica es la rama de la mecánica de fluidos que estudia el movimiento del aire y las fuerzas que actúan sobre los cuerpos que se desplazan a través de él.
        </p>
        <p style={{ fontSize: "0.78rem", lineHeight: 1.7, marginBottom: 8, textAlign: "justify" }}>
          Para el piloto aviador comercial, comprender estos principios es fundamental para entender cómo y por qué vuela un avión, y cómo las condiciones atmosféricas afectan el comportamiento de la aeronave.
        </p>
        {content.sections.map((s, i) => (
          <div key={i}>
            <h4 style={{ fontSize: "0.78rem", fontWeight: 700, margin: "12px 0 6px", textDecoration: "underline" }}>{s.heading}</h4>
            <p style={{ fontSize: "0.78rem", lineHeight: 1.7, marginBottom: 8, textAlign: "justify" }}>{s.body}</p>
          </div>
        ))}
        {book.id === "aero-basica" && (
          <>
            <div style={{ margin: "12px 0" }}>
              <div style={{ width: "100%", height: 120, background: "#f0f0f0", border: "1px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#888" }}>[ FIGURA No. 1 — Diagrama de capa límite ]</div>
              <div style={{ textAlign: "center", fontSize: "0.72rem", color: "#555", marginTop: 4 }}>FIGURA No. 1</div>
            </div>
            <div style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 10, margin: "10px 0", textAlign: "center", fontSize: "0.85rem" }}>
              P_total = P_estática + ½ρV²
            </div>
            <p style={{ fontSize: "0.78rem", lineHeight: 1.7, marginBottom: 8, textAlign: "justify" }}>Donde ρ es la densidad del aire y V es la velocidad del flujo.</p>
          </>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#888", borderTop: "1px solid #ddd", paddingTop: 6, marginTop: 12 }}>
          {content.title} &nbsp;&nbsp;&nbsp; {page}
        </div>
      </div>
    </div>
  );
}
