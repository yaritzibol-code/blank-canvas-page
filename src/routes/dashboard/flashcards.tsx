import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  MATERIAS_DEF,
  getFlashcards,
  getFlashStates,
  isPaid,
  saveFlashSession,
  setFlashState,
  useSessionUser,
  useStore,
  type FlashCardItem,
} from "@/lib/store";
import { UpgradeModal } from "@/components/shared/UpgradeModal";

import { adminOnly } from "@/components/shared/UnderConstruction";

export const Route = createFileRoute("/dashboard/flashcards")({
  component: adminOnly(FlashcardsPage, "Flashcards"),
});

/* ─── Data ───────────────────────────────────────────────── */

interface TemaEntry { name: string; cards: number; done: boolean; items: FlashCardItem[]; }
interface MateriaEntry {
  slug: string;
  name: string; icon: string; iconBg: string;
  total: number; mastered: number; progress: number;
  temas: TemaEntry[];
}

/** Fondos de icono por materia (visual, valores del diseño; cíclicos para el resto). */
const ICON_BGS = [
  "rgba(102,126,234,.12)",
  "rgba(240,147,251,.12)",
  "rgba(79,172,254,.12)",
  "rgba(250,112,154,.12)",
  "rgba(67,233,123,.12)",
  "rgba(161,140,209,.12)",
  "rgba(255,236,210,.5)",
  "rgba(42,245,152,.12)",
];
const ICON_BG_BY_SLUG: Record<string, string> = {
  aerodinamica: ICON_BGS[0],
  "aeronaves-motores": ICON_BGS[1],
  legislacion: ICON_BGS[2],
  medicina: ICON_BGS[3],
  meteorologia: ICON_BGS[4],
  navegacion: ICON_BGS[5],
  "servicios-transito": ICON_BGS[6],
  comunicaciones: ICON_BGS[7],
};

type Screen = "materias" | "temas" | "flashcard" | "result";
type SwipeDir = "left" | "right" | null;

/* ─── Main component ─────────────────────────────────────── */

function FlashcardsPage() {
  const user = useSessionUser();
  const paid = isPaid(user);

  const [screen, setScreen] = useState<Screen>("materias");
  const [materiaIdx, setMateriaIdx] = useState(0);
  const [temaIdx, setTemaIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [knew, setKnew] = useState(0);
  const [toReview, setToReview] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [swipe, setSwipe] = useState<SwipeDir>(null);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [sessionCards, setSessionCards] = useState<FlashCardItem[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Materias y temas reales desde el store (solo cards publicadas)
  const materias = useStore<MateriaEntry[]>(() => {
    const published = getFlashcards().filter((c) => c.status === "publicada");
    const stateOf = new Map(
      (user ? getFlashStates(user.id) : []).map((s) => [s.cardId, s.state]),
    );
    return MATERIAS_DEF.map((def, i) => {
      const cards = published.filter((c) => c.materia === def.slug);
      if (cards.length === 0) return null;
      const temaNames: string[] = [];
      const byTema = new Map<string, FlashCardItem[]>();
      for (const c of cards) {
        if (!byTema.has(c.tema)) {
          byTema.set(c.tema, []);
          temaNames.push(c.tema);
        }
        byTema.get(c.tema)!.push(c);
      }
      const temas: TemaEntry[] = temaNames.map((name) => {
        const items = byTema.get(name)!;
        return {
          name,
          cards: items.length,
          done: items.length > 0 && items.every((c) => stateOf.get(c.id) === "dominada"),
          items,
        };
      });
      const mastered = cards.filter((c) => stateOf.get(c.id) === "dominada").length;
      return {
        slug: def.slug,
        name: def.name,
        icon: def.icon,
        iconBg: ICON_BG_BY_SLUG[def.slug] ?? ICON_BGS[i % ICON_BGS.length],
        total: cards.length,
        mastered,
        progress: cards.length > 0 ? Math.round((mastered / cards.length) * 100) : 0,
        temas,
      };
    }).filter((m): m is MateriaEntry => m !== null);
  });

  const materia = materias[materiaIdx];
  const tema = materia?.temas[temaIdx];
  const currentCard = sessionCards.length > 0 ? sessionCards[cardIdx % sessionCards.length] : undefined;
  const progressPct = sessionCards.length > 0 ? (cardIdx / sessionCards.length) * 100 : 0;

  function startSession(mi: number, ti: number) {
    const items = materias[mi]?.temas[ti]?.items ?? [];
    if (items.length === 0) return;
    setMateriaIdx(mi);
    setTemaIdx(ti);
    setSessionCards(items);
    setCardIdx(0);
    setKnew(0);
    setToReview(0);
    setFlipped(false);
    setSwipe(null);
    setScreen("flashcard");
  }

  function flipCard() {
    setFlipped((f) => !f);
  }

  function answerCard(didKnow: boolean) {
    if (!flipped) { flipCard(); return; }
    const dir: SwipeDir = didKnow ? "right" : "left";
    setSwipe(dir);
    if (didKnow) setKnew((k) => k + 1);
    else setToReview((r) => r + 1);

    // Persiste el estado real de la tarjeta
    const card = sessionCards[cardIdx % sessionCards.length];
    if (user && card) setFlashState(user.id, card.id, didKnow ? "dominada" : "repasar");

    setTimeout(() => {
      setSwipe(null);
      setFlipped(false);
      const next = cardIdx + 1;
      if (next >= sessionCards.length) {
        const total = knew + toReview + 1;
        const knewFinal = knew + (didKnow ? 1 : 0);
        const pct = Math.round((knewFinal / total) * 100);
        let title: string, msg: string;
        if (pct === 100) {
          title = "¡Las dominas todas!";
          msg = "<strong>Pathy dice:</strong> ¡Increíble! Dominaste el 100% de las tarjetas de este tema. Pasa al siguiente tema cuando quieras.";
        } else if (pct >= 70) {
          title = "¡Muy bien!";
          msg = `<strong>Pathy dice:</strong> Dominaste el ${pct}% de las tarjetas. Las que marcaste "a repasar" son las que más necesitas reforzar. ¡Otro repaso y las tendrás todas!`;
        } else {
          title = "Sigue practicando";
          msg = `<strong>Pathy dice:</strong> Vas bien, pero aún necesitas repasar la mayoría. No te desanimes — la repetición es la clave del aprendizaje. ¡Inténtalo de nuevo!`;
        }
        // Guarda la sesión completa
        if (user && materia && tema) {
          saveFlashSession({
            userId: user.id,
            materia: materia.slug,
            tema: tema.name,
            total,
            knew: knewFinal,
            review: total - knewFinal,
          });
        }
        setResultTitle(title);
        setResultMsg(msg);
        setScreen("result");
      } else {
        setCardIdx(next);
      }
    }, 380);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (!flipped) { flipCard(); return; }
      answerCard(dx > 0);
    }
  }

  /* ── SCREEN: MATERIAS ── */
  if (screen === "materias" || !materia || !tema) {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.6rem", color: "#22375C", marginBottom: 6 }}>
            Estudia con <span style={{ color: "#6C0820" }}>Flashcards</span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#647DA0" }}>Elige una materia para repasar sus conceptos clave.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {materias.map((m, i) => (
            <MateriaCard key={m.slug} materia={m} onClick={() => { setMateriaIdx(i); setTemaIdx(0); setScreen("temas"); }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── SCREEN: TEMAS ── */
  if (screen === "temas") {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => setScreen("materias")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "7px 14px", fontSize: "0.82rem", fontWeight: 700, color: "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.color = "#647DA0"; }}
          >
            ← Materias
          </button>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon n={materia.icon as never} size={20} /> {materia.name}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {materia.temas.map((t, i) => {
            const locked = !paid && i > 0;
            return (
              <TemaCard
                key={i}
                tema={t}
                num={i + 1}
                locked={locked}
                onStudy={() => {
                  if (locked) setUpgradeOpen(true);
                  else startSession(materiaIdx, i);
                }}
              />
            );
          })}
        </div>
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          feature="Flashcards completas"
          userId={user?.id}
        />
      </div>
    );
  }

  /* ── SCREEN: FLASHCARD ── */
  if (screen === "flashcard" && currentCard) {
    const swipeStyle: React.CSSProperties = swipe === "right"
      ? { animation: "swipeRight 0.4s ease forwards" }
      : swipe === "left"
      ? { animation: "swipeLeft 0.4s ease forwards" }
      : {};

    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>
        <style>{`
          @keyframes swipeRight { to { transform: translateX(120%) rotate(15deg); opacity: 0; } }
          @keyframes swipeLeft  { to { transform: translateX(-120%) rotate(-15deg); opacity: 0; } }
          @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>

        {/* Centering wrapper */}
        <div style={{ minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>

          {/* FC Topbar */}
          <div style={{ width: "100%", maxWidth: 500, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <button
              onClick={() => setScreen("temas")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "6px 12px", fontSize: "0.8rem", fontWeight: 700, color: "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
            >
              ← Temas
            </button>
            <span style={{ fontSize: "0.8rem", color: "#3D5D91", fontWeight: 700 }}>{tema.name}</span>
            <span style={{ fontSize: "0.85rem", color: "#647DA0", fontWeight: 600 }}>{Math.min(cardIdx + 1, sessionCards.length)} / {sessionCards.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ width: "100%", maxWidth: 500, marginBottom: 20 }}>
            <div style={{ height: 5, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#3D5D91,#5A86CB)", borderRadius: 10, width: `${progressPct}%`, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
              <span style={{ color: "#2ecc71", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="check" size={14} /> {knew} dominadas</span>
              <span style={{ color: "#e74c3c", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="refresh" size={14} /> {toReview} a repasar</span>
            </div>
          </div>

          {/* Swipe indicators */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.72rem", color: "#e74c3c", display: "flex", alignItems: "center", gap: 4 }}>← No la sé <Icon n="refresh" size={13} /></span>
            <span style={{ fontSize: "0.72rem", color: "#2ecc71", display: "flex", alignItems: "center", gap: 4 }}>La sé <Icon n="check" size={13} /> →</span>
          </div>

          {/* The card */}
          <div
            onClick={flipCard}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ width: "100%", maxWidth: 500, perspective: 1200, marginBottom: 24, cursor: "pointer", ...swipeStyle }}
          >
            <div
              style={{
                position: "relative", width: "100%", height: 280,
                transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "none",
              }}
            >
              {/* Front */}
              <div
                style={{
                  position: "absolute", inset: 0, borderRadius: 20,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: 28, textAlign: "center",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(145deg,#22375C,#2a2a4e)",
                  boxShadow: "0 12px 40px rgba(26,26,46,0.3)",
                }}
              >
                <span style={{ fontSize: "0.68rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12, color: "white" }}>Pregunta</span>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.15rem", color: "white", lineHeight: 1.5 }}>{currentCard.q}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Toca para ver la respuesta</span>
              </div>

              {/* Back */}
              <div
                style={{
                  position: "absolute", inset: 0, borderRadius: 20,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: 28, textAlign: "center",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(145deg,#6C0820,#a01030)",
                  boxShadow: "0 12px 40px rgba(108,8,32,0.3)",
                  transform: "rotateY(180deg)",
                }}
              >
                <span style={{ fontSize: "0.68rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12, color: "white" }}>Respuesta</span>
                <p style={{ fontSize: "0.92rem", color: "white", lineHeight: 1.6, opacity: 0.95 }}>{currentCard.a}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 14, width: "100%", maxWidth: 500 }}>
            <button
              onClick={() => answerCard(false)}
              style={{ flex: 1, padding: 14, background: "white", color: "#e74c3c", border: "2px solid #e74c3c", borderRadius: 14, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(231,76,60,0.06)"; e.currentTarget.style.transform = "translateX(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "none"; }}
            >
              <Icon n="refresh" size={17} /> A repasar
            </button>
            <button
              onClick={() => answerCard(true)}
              style={{ flex: 1, padding: 14, background: "#2ecc71", color: "white", border: "2px solid #2ecc71", borderRadius: 14, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#27ae60"; e.currentTarget.style.borderColor = "#27ae60"; e.currentTarget.style.transform = "translateX(3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#2ecc71"; e.currentTarget.style.borderColor = "#2ecc71"; e.currentTarget.style.transform = "none"; }}
            >
              <Icon n="check" size={17} /> Ya la sé
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── SCREEN: RESULT ── */
  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <style>{`@keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
      <div style={{ animation: "float3 3s ease-in-out infinite", marginBottom: 12, color: "#22375C" }}><Icon n="cloud" size={72} /></div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.8rem", textAlign: "center", marginBottom: 6 }}>{resultTitle}</h1>
      <p style={{ fontSize: "0.9rem", color: "#647DA0", marginBottom: 28, textAlign: "center" }}>Así te fue en esta sesión</p>

      <div style={{ background: "white", borderRadius: 20, padding: 24, maxWidth: 440, width: "100%", boxShadow: "0 4px 20px rgba(61,93,145,0.1)", marginBottom: 20 }}>
        <div style={{ display: "flex", marginBottom: 20, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ flex: 1, padding: 16, textAlign: "center", background: "rgba(46,204,113,0.08)" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "2rem", fontWeight: 900, color: "#2ecc71" }}>{knew}</div>
            <div style={{ fontSize: "0.76rem", color: "#647DA0", marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4 }}>Ya las sé <Icon n="check" size={13} /></div>
          </div>
          <div style={{ flex: 1, padding: 16, textAlign: "center", background: "rgba(231,76,60,0.06)" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "2rem", fontWeight: 900, color: "#e74c3c" }}>{toReview}</div>
            <div style={{ fontSize: "0.76rem", color: "#647DA0", marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4 }}>A repasar <Icon n="refresh" size={13} /></div>
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#F2DCDB,#fce4ec)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.85rem", color: "#555", lineHeight: 1.5, marginBottom: 16, maxWidth: 440, width: "100%" }}>
        <span style={{ flexShrink: 0, color: "#6C0820", display: "inline-flex" }}><Icon n="cloud" size={20} /></span>
        <div dangerouslySetInnerHTML={{ __html: resultMsg }} />
      </div>

      <div style={{ display: "flex", gap: 10, maxWidth: 440, width: "100%" }}>
        <button
          onClick={() => startSession(materiaIdx, temaIdx)}
          style={{ flex: 1, padding: 12, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 11, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Icon n="refresh" size={16} /> Repetir tema
        </button>
        <button
          onClick={() => setScreen("temas")}
          style={{ flex: 1, padding: 12, background: "#6C0820", color: "white", border: "none", borderRadius: 11, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
        >
          ← Otros temas
        </button>
      </div>
    </div>
  );
}

/* ─── Materia Card ───────────────────────────────────────── */

function MateriaCard({ materia, onClick }: { materia: MateriaEntry; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.25s", boxShadow: hover ? "0 8px 24px rgba(61,93,145,0.12)" : "0 2px 10px rgba(61,93,145,0.06)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: materia.iconBg, color: "#22375C" }}>
          <Icon n={materia.icon as never} size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{materia.name}</h3>
          <p style={{ fontSize: "0.75rem", color: "#647DA0" }}>{materia.temas.length} temas · {materia.total} flashcards</p>
        </div>
      </div>
      <div>
        <div style={{ height: 5, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
          <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#3D5D91,#5A86CB)", width: `${materia.progress}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#8DA1BE" }}>
          <span style={{ color: "#3D5D91", fontWeight: 700 }}>{materia.mastered} dominadas</span>
          <span>{materia.total - materia.mastered} por repasar</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Tema Card ──────────────────────────────────────────── */

function TemaCard({ tema, num, locked = false, onStudy }: { tema: TemaEntry; num: number; locked?: boolean; onStudy: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onStudy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(61,93,145,0.05)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateX(4px)" : "none", gap: 12, opacity: locked ? 0.55 : 1 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, color: "#3D5D91", flexShrink: 0 }}>
          {num}
        </div>
        <div>
          <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{tema.name}</h4>
          <p style={{ fontSize: "0.74rem", color: "#647DA0" }}>{tema.cards} flashcards</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ background: "#F2DCDB", color: "#6C0820", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="cards" size={14} /> {tema.cards}</span>
        {locked && <span style={{ display: "inline-flex", color: "#8CA0BF" }}><Icon n="lock" size={16} /></span>}
        {!locked && tema.done && <span style={{ display: "inline-flex", color: "#2ecc71" }}><Icon n="check" size={16} /></span>}
        <button
          onClick={(e) => { e.stopPropagation(); onStudy(); }}
          style={{ padding: "8px 18px", background: "#3D5D91", color: "white", border: "none", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2d4a7a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3D5D91"; }}
        >
          Estudiar →
        </button>
      </div>
    </div>
  );
}
