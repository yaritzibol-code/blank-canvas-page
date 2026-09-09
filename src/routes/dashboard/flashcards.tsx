import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
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
import { LP_CATEGORIES, type LpCategory, type LpSubject } from "@/lib/lp/taxonomy";
import { UpgradeModal } from "@/components/shared/UpgradeModal";

import { adminOnly } from "@/components/shared/UnderConstruction";
import { PathyMark } from "@/components/shared/PathyMark";
import { ModuleHeader } from "@/components/shared/ModuleHeader";

export const Route = createFileRoute("/dashboard/flashcards")({
  component: adminOnly(FlashcardsPage, "Flashcards"),
});

/* ─── Árbol de contenidos (reutiliza la taxonomía existente) ─── */

/** Slug de la materia en el banco de flashcards para cada materia del árbol. */
const CARD_SLUG_ALIAS: Record<string, string> = {
  "aeronaves-y-motores": "aeronaves-motores",
  "legislacion-aeronautica": "legislacion",
  "manuales-de-informacion-aeronautica": "manuales-ais",
  "navegacion-aerea": "navegacion",
  "operaciones-aeronauticas": "operaciones",
  "servicios-de-transito-aereo": "servicios-transito",
  "medicina-de-aviacion": "medicina",
};

function subjectSlug(subject: LpSubject): string {
  const slug = subject.id.split("/")[1] ?? subject.id;
  return CARD_SLUG_ALIAS[slug] ?? slug;
}

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

interface SectionEntry {
  id: string;
  titulo: string;
  /** Temas del árbol que agrupan las tarjetas de esta sección (uso interno). */
  temas: number;
  items: FlashCardItem[];
  done: boolean;
}
interface SubjectEntry {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  containerLabel: string;
  total: number;
  mastered: number;
  progress: number;
  sections: SectionEntry[];
}

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

type Screen = "programa" | "materias" | "secciones" | "flashcard" | "result";
type SwipeDir = "left" | "right" | null;

/* ─── Main component ─────────────────────────────────────── */

function FlashcardsPage() {
  const user = useSessionUser();
  const paid = isPaid(user);

  const [screen, setScreen] = useState<Screen>("programa");
  const [catIdx, setCatIdx] = useState(0);
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);
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

  /** Programas → materias → secciones, tomados del árbol existente. */
  const programas = useStore<{ categoria: LpCategory; subjects: SubjectEntry[] }[]>(() => {
    const published = getFlashcards().filter((c) => c.status === "publicada");
    const stateOf = new Map((user ? getFlashStates(user.id) : []).map((s) => [s.cardId, s.state]));
    const byMateria = new Map<string, FlashCardItem[]>();
    for (const c of published) {
      if (!byMateria.has(c.materia)) byMateria.set(c.materia, []);
      byMateria.get(c.materia)!.push(c);
    }

    return LP_CATEGORIES.map((categoria) => ({
      categoria,
      subjects: categoria.subjects.map((subject, i): SubjectEntry => {
        const slug = subjectSlug(subject);
        const cards = byMateria.get(slug) ?? [];
        const used = new Set<string>();
        const sections: SectionEntry[] = subject.containers.map((container) => {
          const titles = new Set(container.learningPaths.map((lp) => norm(lp.titulo)));
          const items = cards.filter((c) => {
            if (used.has(c.id)) return false;
            if (!titles.has(norm(c.tema))) return false;
            used.add(c.id);
            return true;
          });
          return {
            id: container.id,
            titulo: container.titulo,
            temas: container.learningPaths.length,
            items,
            done: items.length > 0 && items.every((c) => stateOf.get(c.id) === "dominada"),
          };
        });
        // Tarjetas ya cargadas que aún no coinciden con ninguna sección del árbol.
        const restantes = cards.filter((c) => !used.has(c.id));
        if (restantes.length > 0) {
          sections.push({
            id: `${subject.id}/otros`,
            titulo: "Otras tarjetas de la materia",
            temas: 0,
            items: restantes,
            done: restantes.every((c) => stateOf.get(c.id) === "dominada"),
          });
        }
        const mastered = cards.filter((c) => stateOf.get(c.id) === "dominada").length;
        const def = MATERIAS_DEF.find((m) => m.slug === slug);
        return {
          id: subject.id,
          name: subject.titulo,
          icon: def?.icon ?? "book",
          iconBg: ICON_BGS[i % ICON_BGS.length],
          containerLabel: subject.containerLabel,
          total: cards.length,
          mastered,
          progress: cards.length > 0 ? Math.round((mastered / cards.length) * 100) : 0,
          sections,
        };
      }),
    }));
  });

  const programa = programas[catIdx];
  const subject = programa?.subjects[subjectIdx];
  const section = subject?.sections[sectionIdx];
  const totalPorPrograma = useMemo(
    () => programas.map((p) => p.subjects.reduce((n, s) => n + s.total, 0)),
    [programas],
  );

  const currentCard =
    sessionCards.length > 0 ? sessionCards[cardIdx % sessionCards.length] : undefined;
  const progressPct = sessionCards.length > 0 ? (cardIdx / sessionCards.length) * 100 : 0;

  function startSession(si: number) {
    const items = subject?.sections[si]?.items ?? [];
    if (items.length === 0) return;
    setSectionIdx(si);
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
    if (!flipped) {
      flipCard();
      return;
    }
    const dir: SwipeDir = didKnow ? "right" : "left";
    setSwipe(dir);
    if (didKnow) setKnew((k) => k + 1);
    else setToReview((r) => r + 1);

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
          msg = "<strong>Pathy dice:</strong> ¡Increíble! Dominaste el 100% de las tarjetas de esta sección. Pasa a la siguiente cuando quieras.";
        } else if (pct >= 70) {
          title = "¡Muy bien!";
          msg = `<strong>Pathy dice:</strong> Dominaste el ${pct}% de las tarjetas. Las que marcaste "a repasar" son las que más necesitas reforzar. ¡Otro repaso y las tendrás todas!`;
        } else {
          title = "Sigue practicando";
          msg = `<strong>Pathy dice:</strong> Vas bien, pero aún necesitas repasar la mayoría. No te desanimes — la repetición es la clave del aprendizaje. ¡Inténtalo de nuevo!`;
        }
        if (user && subject && section) {
          saveFlashSession({
            userId: user.id,
            materia: subject.id,
            tema: section.titulo,
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
      if (!flipped) {
        flipCard();
        return;
      }
      answerCard(dx > 0);
    }
  }

  /* ── SCREEN: PROGRAMA ── */
  if (screen === "programa" || !programa) {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>
        <ModuleHeader
          eyebrow="Recursos · Flashcards"
          title="Repaso"
          accent="rápido"
          tail="."
          subtitle="Elige un programa para repasar sus conceptos clave."
          planes={6}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {programas.map((p, i) => (
            <ProgramaCard
              key={p.categoria.id}
              titulo={p.categoria.titulo}
              subtitulo={`${p.subjects.length} ${p.categoria.subjectLabel.toLowerCase()} · ${totalPorPrograma[i]} flashcards`}
              onClick={() => {
                setCatIdx(i);
                setSubjectIdx(0);
                setSectionIdx(0);
                setScreen("materias");
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── SCREEN: MATERIAS ── */
  if (screen === "materias" || !subject) {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>
        <Breadcrumb
          backLabel="← Programas"
          onBack={() => setScreen("programa")}
          title={programa.categoria.titulo}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {programa.subjects.map((s, i) => (
            <MateriaCard
              key={s.id}
              subject={s}
              onClick={() => {
                setSubjectIdx(i);
                setSectionIdx(0);
                setScreen("secciones");
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── SCREEN: SECCIONES (módulo / chapter / bloque / documento) ── */
  if (screen === "secciones") {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }}>
        <Breadcrumb
          backLabel={`← ${programa.categoria.subjectLabel}`}
          onBack={() => setScreen("materias")}
          title={subject.name}
          icon={subject.icon}
        />
        <p style={{ fontSize: "0.8rem", color: "#647DA0", marginBottom: 14 }}>
          {subject.containerLabel} de {programa.categoria.titulo}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subject.sections.map((s, i) => {
            const empty = s.items.length === 0;
            const locked = !empty && !paid && i > 0;
            return (
              <SeccionCard
                key={s.id}
                section={s}
                num={i + 1}
                locked={locked}
                onStudy={() => {
                  if (empty) return;
                  if (locked) setUpgradeOpen(true);
                  else startSession(i);
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
  if (screen === "flashcard" && currentCard && section) {
    const swipeStyle: React.CSSProperties =
      swipe === "right"
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

        <div style={{ minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
          <div style={{ width: "100%", maxWidth: 500, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <button
              onClick={() => setScreen("secciones")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "6px 12px", fontSize: "0.8rem", fontWeight: 700, color: "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
            >
              ← {subject.containerLabel}
            </button>
            <span style={{ fontSize: "0.8rem", color: "#3D5D91", fontWeight: 700 }}>{section.titulo}</span>
            <span style={{ fontSize: "0.85rem", color: "#647DA0", fontWeight: 600 }}>{Math.min(cardIdx + 1, sessionCards.length)} / {sessionCards.length}</span>
          </div>

          <div style={{ width: "100%", maxWidth: 500, marginBottom: 20 }}>
            <div style={{ height: 5, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#3D5D91,#5A86CB)", borderRadius: 10, width: `${progressPct}%`, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
              <span style={{ color: "#2ecc71", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="check" size={14} /> {knew} dominadas</span>
              <span style={{ color: "#e74c3c", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon n="refresh" size={14} /> {toReview} a repasar</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.72rem", color: "#e74c3c", display: "flex", alignItems: "center", gap: 4 }}>← No la sé <Icon n="refresh" size={13} /></span>
            <span style={{ fontSize: "0.72rem", color: "#2ecc71", display: "flex", alignItems: "center", gap: 4 }}>La sé <Icon n="check" size={13} /> →</span>
          </div>

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
      <div style={{ marginBottom: 12 }}><PathyMark size={92} float /></div>
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
        <PathyMark size={26} />
        <div dangerouslySetInnerHTML={{ __html: resultMsg }} />
      </div>

      <div style={{ display: "flex", gap: 10, maxWidth: 440, width: "100%" }}>
        <button
          onClick={() => startSession(sectionIdx)}
          style={{ flex: 1, padding: 12, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 11, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Icon n="refresh" size={16} /> Repetir sección
        </button>
        <button
          onClick={() => setScreen("secciones")}
          style={{ flex: 1, padding: 12, background: "#6C0820", color: "white", border: "none", borderRadius: 11, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
        >
          ← Otras secciones
        </button>
      </div>
    </div>
  );
}

/* ─── Breadcrumb ─────────────────────────────────────────── */

function Breadcrumb({ backLabel, onBack, title, icon }: { backLabel: string; onBack: () => void; title: string; icon?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "2px solid #F2DCDB", borderRadius: 8, padding: "7px 14px", fontSize: "0.82rem", fontWeight: 700, color: "#647DA0", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3D5D91"; e.currentTarget.style.color = "#3D5D91"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#F2DCDB"; e.currentTarget.style.color = "#647DA0"; }}
      >
        {backLabel}
      </button>
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
        {icon && <Icon n={icon as never} size={20} />} {title}
      </span>
    </div>
  );
}

/* ─── Programa Card ──────────────────────────────────────── */

function ProgramaCard({ titulo, subtitulo, onClick }: { titulo: string; subtitulo: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 16, padding: 22, cursor: "pointer", transition: "all 0.25s", boxShadow: hover ? "0 8px 24px rgba(61,93,145,0.12)" : "0 2px 10px rgba(61,93,145,0.06)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateY(-3px)" : "none", display: "flex", alignItems: "center", gap: 14 }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(90,134,203,.12)", color: "#22375C" }}>
        <Icon n="cards" size={22} />
      </div>
      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{titulo}</h3>
        <p style={{ fontSize: "0.76rem", color: "#647DA0" }}>{subtitulo}</p>
      </div>
    </div>
  );
}

/* ─── Materia Card ───────────────────────────────────────── */

function MateriaCard({ subject, onClick }: { subject: SubjectEntry; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.25s", boxShadow: hover ? "0 8px 24px rgba(61,93,145,0.12)" : "0 2px 10px rgba(61,93,145,0.06)", border: hover ? "2px solid #5A86CB" : "2px solid transparent", transform: hover ? "translateY(-3px)" : "none", display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: subject.iconBg, color: "#22375C" }}>
          <Icon n={subject.icon as never} size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{subject.name}</h3>
          <p style={{ fontSize: "0.75rem", color: "#647DA0" }}>
            {subject.sections.length} {subject.containerLabel.toLowerCase()} ·{" "}
            {subject.total > 0 ? `${subject.total} flashcards` : "próximamente"}
          </p>
        </div>
      </div>
      <div>
        <div style={{ height: 5, background: "#F2DCDB", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
          <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#3D5D91,#5A86CB)", width: `${subject.progress}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#8DA1BE" }}>
          <span style={{ color: "#3D5D91", fontWeight: 700 }}>{subject.mastered} dominadas</span>
          <span>{subject.total - subject.mastered} por repasar</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Sección Card ───────────────────────────────────────── */

function SeccionCard({ section, num, locked = false, onStudy }: { section: SectionEntry; num: number; locked?: boolean; onStudy: () => void }) {
  const [hover, setHover] = useState(false);
  const empty = section.items.length === 0;
  return (
    <div
      onClick={onStudy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "white", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: empty ? "default" : "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(61,93,145,0.05)", border: hover && !empty ? "2px solid #5A86CB" : "2px solid transparent", transform: hover && !empty ? "translateX(4px)" : "none", gap: 12, opacity: locked || empty ? 0.6 : 1 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, color: "#3D5D91", flexShrink: 0 }}>
          {num}
        </div>
        <div>
          <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{section.titulo}</h4>
          <p style={{ fontSize: "0.74rem", color: "#647DA0" }}>
            {empty ? "Flashcards próximamente" : `${section.items.length} flashcards`}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {!empty && (
          <span style={{ background: "#F2DCDB", color: "#6C0820", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon n="cards" size={14} /> {section.items.length}
          </span>
        )}
        {locked && <span style={{ display: "inline-flex", color: "#8CA0BF" }}><Icon n="lock" size={16} /></span>}
        {!locked && !empty && section.done && <span style={{ display: "inline-flex", color: "#2ecc71" }}><Icon n="check" size={16} /></span>}
        {empty ? (
          <span style={{ padding: "8px 16px", background: "#F5F7FA", color: "#8CA0BF", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap" }}>
            Próximamente
          </span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onStudy(); }}
            style={{ padding: "8px 18px", background: "#3D5D91", color: "white", border: "none", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2d4a7a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3D5D91"; }}
          >
            Estudiar →
          </button>
        )}
      </div>
    </div>
  );
}
