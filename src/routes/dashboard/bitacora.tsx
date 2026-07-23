import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/ui/fp-icon";
import {
  getBitacora,
  logYarisUse,
  materiaPerformance,
  saveBitacoraEntry,
  useSessionUser,
  useStore,
  yarisReply,
  type BitacoraEntry,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard/bitacora")({
  component: BitacoraPage,
});

type Screen = "hoy" | "historial" | "resultado";
type Emotion = "sun" | "checkCircle" | "minus" | "alert" | "moon" | "cloud" | null;

const EMOTIONS: { icon: Emotion & string; label: string }[] = [
  { icon: "sun", label: "¡Increíble!" },
  { icon: "checkCircle", label: "Bien" },
  { icon: "minus", label: "Más o menos" },
  { icon: "alert", label: "Frustrada" },
  { icon: "moon", label: "Cansada" },
  { icon: "cloud", label: "Ansiosa" },
];

const MATERIAS = [
  { icon: "check", label: "Todo estuvo bien", isNone: true },
  { icon: "plane", label: "Aerodinámica" },
  { icon: "settings", label: "Aeronaves" },
  { icon: "scale", label: "Legislación" },
  { icon: "stethoscope", label: "Medicina" },
  { icon: "cloud", label: "Meteorología" },
  { icon: "map", label: "Navegación" },
  { icon: "tower", label: "Tránsito Aéreo" },
  { icon: "radio", label: "Comunicaciones" },
  { icon: "doc", label: "Manuales de Información Aeronáutica" },
  { icon: "brain", label: "Factores Humanos" },
  { icon: "shield", label: "Seguridad Aérea" },
  { icon: "rocket", label: "Operaciones" },
];

const PATHY_MESSAGES: Record<string, { msg: string; bad: boolean }> = {
  "sun": {
    msg: "¡Wow, hoy fue un gran día! Esa energía y concentración que tuviste es exactamente lo que te va a llevar al CIAAC aprobado. Cada día así te acerca más a tu meta. ¡Sigue así, aviadora!",
    bad: false,
  },
  "checkCircle": {
    msg: "¡Muy bien! Un día sólido de estudio es exactamente lo que necesitas. La consistencia es más poderosa que la perfección — y tú lo estás haciendo.",
    bad: false,
  },
  "minus": {
    msg: "Los días \"más o menos\" también cuentan. El hecho de que hayas abierto FlightPath ya es una victoria. Mañana puede ser diferente — y si no, también está bien.",
    bad: false,
  },
  "alert": {
    msg: "Entiendo tu frustración, y quiero que sepas que es completamente válida. El CIAAC es difícil — si fuera fácil, todos lo aprobarían. El hecho de que te frustres significa que te importa, y eso es hermoso. ¿Quieres que hablemos de lo que te está costando? Yaris puede ayudarte.",
    bad: true,
  },
  "moon": {
    msg: "Estudiar cansada ya es un logro en sí mismo. Tu cerebro absorbe más de lo que crees, incluso cuando está cansado. Descansa bien esta noche — mañana tu mente va a estar más fresca y todo va a fluir mejor.",
    bad: false,
  },
  "cloud": {
    msg: "La ansiedad antes del CIAAC es más común de lo que crees — casi todos los estudiantes la sienten. Pero quiero que sepas que estás más preparada de lo que piensas. ¿Quieres hablar con Yaris sobre lo que te preocupa? A veces nombrar el miedo lo hace más pequeño.",
    bad: true,
  },
};

/* ── Mapas locales por emoción (mismo criterio de colores existente) ── */
const EMOTION_BORDER: Record<string, string> = {
  sun: "#2ecc71", checkCircle: "#5A86CB", minus: "#f39c12",
  alert: "#e74c3c", moon: "#888", cloud: "#647DA0",
};
const EMOTION_BAR: Record<string, string> = {
  sun: "#2ecc71", checkCircle: "#5A86CB", minus: "#f39c12",
  alert: "#e74c3c", moon: "#647DA0", cloud: "#e74c3c",
};
const EMOTION_VAL: Record<string, number> = {
  sun: 5, checkCircle: 4, minus: 3, moon: 2, alert: 1, cloud: 1,
};
const DAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];

function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Etiquetas de fecha legibles es-MX para el historial. */
function entryDateLabels(iso: string): { date: string; sub: string } {
  const d = new Date(iso);
  const today = localDayKey(new Date());
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const key = localDayKey(d);
  const longDate = d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  if (key === today) return { date: "Hoy", sub: longDate };
  if (key === localDayKey(yest)) return { date: "Ayer", sub: longDate };
  return { date: longDate, sub: capitalize(d.toLocaleDateString("es-MX", { weekday: "long" })) };
}

/** Gráfico semanal: entradas reales de los últimos 7 días (val 1-5 por emoción). */
function buildMoodData(entries: BitacoraEntry[]) {
  const byDay = new Map<string, BitacoraEntry>();
  entries.forEach((e) => {
    const k = localDayKey(new Date(e.date));
    if (!byDay.has(k)) byDay.set(k, e); // entries viene desc: la más reciente del día gana
  });
  const out: { day: string; emoji: string; val: number; color: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const e = byDay.get(localDayKey(d));
    const val = e ? (EMOTION_VAL[e.emotionIcon] ?? 3) : 0;
    out.push({
      day: DAY_LETTERS[d.getDay()],
      emoji: e?.emotionIcon ?? "",
      val: val * 20,
      color: e ? (EMOTION_BAR[e.emotionIcon] ?? "#5A86CB") : "#F2DCDB",
    });
  }
  return out;
}

/** Insight real de Pathy: emociones negativas (2 semanas), materia repetida y tendencia de confianza. */
function buildInsight(entries: BitacoraEntry[]): string {
  if (entries.length < 2) {
    return "Aún tengo pocas entradas para detectar patrones. Escribe tu bitácora unos días más y aquí te contaré qué veo en tu ánimo y en tu confianza rumbo al CIAAC.";
  }
  const twoWeeksAgo = Date.now() - 14 * 86400000;
  const recent = entries.filter((e) => new Date(e.date).getTime() >= twoWeeksAgo);
  const negCount = recent.filter((e) => e.emotionIcon === "alert" || e.emotionIcon === "cloud").length;
  const counts: Record<string, number> = {};
  recent.forEach((e) => e.materias.forEach((m) => { counts[m] = (counts[m] ?? 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const first = entries[entries.length - 1];
  const last = entries[0];

  const s1 = negCount > 0
    ? `En las últimas 2 semanas registraste ${negCount} ${negCount === 1 ? "día" : "días"} con frustración o ansiedad${top ? `, y ${top[0]} es la materia que más se repite en tus entradas (${top[1]} ${top[1] === 1 ? "vez" : "veces"})` : ""}.`
    : `En las últimas 2 semanas no registraste días de frustración ni ansiedad${top ? `, aunque ${top[0]} es la materia que más mencionas (${top[1]} ${top[1] === 1 ? "vez" : "veces"})` : ""} — ¡buen ánimo!`;
  const s2 = last.conf > first.conf
    ? `Tu confianza con el CIAAC subió de ${first.conf} a ${last.conf} — ¡vas mejorando!`
    : last.conf < first.conf
      ? `Tu confianza con el CIAAC bajó de ${first.conf} a ${last.conf} — un repaso de tus materias difíciles puede ayudarte a recuperarla.`
      : `Tu confianza con el CIAAC se mantiene en ${last.conf}/5 — la constancia la hará subir.`;
  return `${s1} ${s2}`;
}

function ScaleDots({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            border: `2px solid ${n <= value ? "#3D5D91" : "#F2DCDB"}`,
            background: n <= value ? "#3D5D91" : "white",
            color: n <= value ? "white" : "#8DA1BE",
            fontSize: ".72rem", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .15s",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function BitacoraPage() {
  const user = useSessionUser();
  const entries = useStore(() => (user ? getBitacora(user.id) : []));
  const firstName = user?.nombre.split(" ")[0] ?? "piloto";
  const initials = user
    ? user.nombre.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "TÚ";
  const [screen, setScreen] = useState<Screen>("hoy");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [scales, setScales] = useState({ s1: 0, s2: 0, s3: 0 });
  const [selectedMaterias, setSelectedMaterias] = useState<Set<string>>(new Set());
  const [noneSelected, setNoneSelected] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [result, setResult] = useState<{
    emoji: string; moodLabel: string; motiv: number; conc: number; conf: number;
    tema: string | null; text: string; analysis: string; bad: boolean;
  } | null>(null);
  const [yarisOpen, setYarisOpen] = useState(false);
  const [yarisMessages, setYarisMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [yarisInput, setYarisInput] = useState("");
  const [yarisRi, setYarisRi] = useState(0);

  const toggleMateria = (label: string, isNone: boolean) => {
    if (isNone) {
      setSelectedMaterias(new Set());
      setNoneSelected(true);
    } else {
      setNoneSelected(false);
      const next = new Set(selectedMaterias);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      setSelectedMaterias(next);
    }
  };

  const handleSave = () => {
    if (!selectedEmotion) {
      alert("Pathy dice: ¡No olvides decirme cómo te sentiste hoy!");
      return;
    }
    const pathy = PATHY_MESSAGES[selectedEmotion] || PATHY_MESSAGES["checkCircle"];
    const emotionObj = EMOTIONS.find((e) => e.icon === selectedEmotion)!;
    const tema = selectedMaterias.size > 0 ? [...selectedMaterias][0] : null;
    const materiasSel = noneSelected ? [] : [...selectedMaterias];

    let fullMsg = pathy.msg;
    if (tema && !pathy.bad) {
      fullMsg += ` Por cierto, veo que ${tema} te costó hoy — es normal, es una de las más densas. Mañana podemos atacarla juntas.`;
    }

    // Enriquecer con datos reales: ¿la materia con menor promedio coincide con una seleccionada?
    if (user && materiasSel.length > 0) {
      const norm = (s: string) => s.trim().toLowerCase();
      const matches = (label: string, name: string) => {
        const a = norm(label);
        const b = norm(name);
        return b.includes(a) || a.includes(b) || b.split(" ")[0] === a.split(" ")[0];
      };
      const withData = materiaPerformance(user.id, "todo")
        .filter((m) => m.avg !== null)
        .sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0));
      const lowest = withData[0];
      if (
        lowest &&
        (lowest.avg ?? 100) < 60 &&
        materiasSel.some((lbl) => matches(lbl, lowest.name))
      ) {
        fullMsg += ` He notado que ${lowest.name} también es tu materia con menor promedio (${lowest.avg}%). Un cuestionario corto mañana la mejorará.`;
      }
    }

    if (user) {
      saveBitacoraEntry({
        userId: user.id,
        emotionIcon: selectedEmotion,
        moodLabel: emotionObj.label,
        motiv: scales.s1,
        conc: scales.s2,
        conf: scales.s3,
        materias: materiasSel,
        text: journalText,
        pathyMsg: fullMsg,
      });
    }

    setResult({
      emoji: selectedEmotion,
      moodLabel: emotionObj.label,
      motiv: scales.s1,
      conc: scales.s2,
      conf: scales.s3,
      tema,
      text: journalText,
      analysis: fullMsg,
      bad: pathy.bad,
    });
    setScreen("resultado");
  };

  const openYarisChat = () => {
    setYarisOpen(true);
    if (user) logYarisUse(user.id, "Mi Bitácora");
    if (yarisMessages.length === 0) {
      setYarisMessages([{ text: "Hola, leí tu entrada de hoy y quiero que sepas que estoy aquí. ¿Quieres contarme más sobre cómo te sientes?", isUser: false }]);
    }
  };

  const sendYaris = () => {
    const t = yarisInput.trim();
    if (!t) return;
    const reply = yarisReply(yarisRi, {}, t);
    setYarisMessages((prev) => [...prev, { text: t, isUser: true }]);
    setYarisInput("");
    setYarisRi((r) => r + 1);
    setTimeout(() => {
      setYarisMessages((prev) => [...prev, { text: reply.t, isUser: false }]);
    }, 800);
  };

  /* ── Datos reales derivados del historial ── */
  const moodData = buildMoodData(entries);
  const insight = buildInsight(entries);
  const histEntries = entries.map((e) => {
    const labels = entryDateLabels(e.date);
    return {
      id: e.id,
      emotion: e.emotionIcon,
      mood: e.moodLabel,
      borderColor: EMOTION_BORDER[e.emotionIcon] ?? "#5A86CB",
      motiv: e.motiv,
      conc: e.conc,
      conf: e.conf,
      tags: e.materias,
      text: e.text,
      pathyMsg: e.pathyMsg,
      date: labels.date,
      sub: labels.sub,
    };
  });

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", minHeight: "100vh", background: "#f5f7fc" }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .emo-btn:hover{border-color:#3D5D91!important;transform:translateY(-2px);}
        .save-btn:hover{background:#8a0a28!important;transform:translateY(-2px);box-shadow:0 8px 20px rgba(108,8,32,.3)!important;}
        .ec-card:hover{transform:translateX(3px);box-shadow:0 4px 16px rgba(61,93,145,.1)!important;}
        .mchip-btn:hover{border-color:#3D5D91!important;}
      `}</style>

      {/* TAB BAR */}
      <div style={{ padding: "16px 32px 0", background: "white", borderBottom: "1px solid rgba(61,93,145,.08)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
          {[
            { id: "hoy" as Screen, label: "Escribir hoy", icon: "edit" },
            { id: "historial" as Screen, label: "Mi historial", icon: "calendar" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setScreen(t.id)}
              style={{
                padding: "8px 20px", border: `2px solid ${screen === t.id ? "#3D5D91" : "#F2DCDB"}`,
                borderRadius: 20, fontSize: ".82rem", fontWeight: 600, cursor: "pointer",
                background: screen === t.id ? "#3D5D91" : "white",
                color: screen === t.id ? "white" : "#647DA0",
                transition: "all .2s", fontFamily: "'Manrope', sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Icon n={t.icon as never} size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCREEN HOY ── */}
      {screen === "hoy" && (
        <div style={{ padding: "28px 0", maxWidth: 800 }}>

          {/* Pathy question */}
          <div style={{
            background: "linear-gradient(135deg, #22375C, #2a2a4e)", borderRadius: 18,
            padding: "24px 28px", display: "flex", alignItems: "center", gap: 18,
            marginBottom: 24, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(242,174,188,.12) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ flexShrink: 0, animation: "float 3s ease-in-out infinite", zIndex: 1, color: "white" }}><Icon n="cloud" size={48} /></div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ fontSize: ".7rem", color: "#F2AEBC", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Icon n="edit" size={13} /> Entrada de hoy</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", color: "white", marginBottom: 4 }}>¿Cómo estuvo tu sesión de estudio hoy, {firstName}?</div>
              <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)" }}>Cuéntame todo, esto es solo tuyo</div>
            </div>
          </div>

          {/* Emoción */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="checkCircle" size={15} /> ¿Cómo te sentiste estudiando hoy?</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
              {EMOTIONS.map((e) => (
                <button
                  key={e.icon}
                  className="emo-btn"
                  onClick={() => setSelectedEmotion(e.icon)}
                  style={{
                    display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 5,
                    padding: "12px 16px", border: `2px solid ${selectedEmotion === e.icon ? "#3D5D91" : "#F2DCDB"}`,
                    borderRadius: 14, cursor: "pointer", background: selectedEmotion === e.icon ? "rgba(61,93,145,.06)" : "white",
                    flex: 1, minWidth: 70, transition: "all .2s", fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  <span style={{ display: "flex", color: selectedEmotion === e.icon ? "#3D5D91" : "#647DA0" }}><Icon n={e.icon as never} size={26} /></span>
                  <span style={{ fontSize: ".72rem", fontWeight: 600, color: selectedEmotion === e.icon ? "#3D5D91" : "#647DA0", textAlign: "center" }}>{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Escalas */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="chart" size={15} /> Cuéntame un poco más</div>
            {[
              { label: "¿Qué tan motivada llegaste?", key: "s1" as const },
              { label: "¿Qué tan concentrada estuviste?", key: "s2" as const },
              { label: "¿Cómo te sientes con el CIAAC?", key: "s3" as const },
            ].map((row) => (
              <div key={row.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: ".82rem", color: "#22375C", fontWeight: 500, width: 200, flexShrink: 0 }}>{row.label}</span>
                <ScaleDots value={scales[row.key]} onChange={(v) => setScales((s) => ({ ...s, [row.key]: v }))} />
              </div>
            ))}
          </div>

          {/* Tema que costó */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="cloud" size={15} /> ¿Qué tema te costó más hoy?</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
              {MATERIAS.map((m) => {
                const isActive = m.isNone ? noneSelected : selectedMaterias.has(m.label);
                return (
                  <button
                    key={m.label}
                    className="mchip-btn"
                    onClick={() => toggleMateria(m.label, !!m.isNone)}
                    style={{
                      padding: "6px 14px", background: isActive ? (m.isNone ? "rgba(46,204,113,.08)" : "rgba(61,93,145,.08)") : "#f8f9ff",
                      border: `2px solid ${isActive ? (m.isNone ? "#2ecc71" : "#3D5D91") : "#F2DCDB"}`,
                      borderRadius: 20, fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                      color: isActive ? (m.isNone ? "#1a7a4a" : "#3D5D91") : "#22375C",
                      transition: "all .2s", fontFamily: "'Manrope', sans-serif",
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Icon n={m.icon as never} size={15} /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Texto libre */}
          <div style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 18 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="edit" size={15} /> Cuéntame más — esto es solo tuyo</div>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value.slice(0, 500))}
              placeholder="¿Qué pasó hoy? ¿Algo que te haya costado mucho? ¿Algo que te haya gustado? ¿Cómo llegaste a estudiar? Escribe lo que quieras..."
              style={{
                width: "100%", minHeight: 120, border: "2px solid #F2DCDB", borderRadius: 12,
                padding: "14px 16px", fontSize: ".88rem", fontFamily: "'Manrope', sans-serif",
                color: "#22375C", outline: "none", resize: "vertical" as const, lineHeight: 1.7,
                background: "#fafbff", transition: "border-color .2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3D5D91")}
              onBlur={(e) => (e.target.style.borderColor = "#F2DCDB")}
            />
            <div style={{ fontSize: ".72rem", color: "#bbb", textAlign: "right" as const, marginTop: 6 }}>{journalText.length} / 500</div>
          </div>

          {/* Guardar */}
          <button
            className="save-btn"
            onClick={handleSave}
            style={{
              width: "100%", padding: 14, background: "#6C0820", color: "white", border: "none",
              borderRadius: 12, fontSize: ".95rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "'Manrope', sans-serif", transition: "all .2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24,
            }}
          >
            <Icon n="cloud" size={18} /> Guardar entrada de hoy
          </button>

          {/* Disclaimer (PRD): no es herramienta clínica */}
          <p style={{ fontSize: ".72rem", color: "#8DA1BE", textAlign: "center" as const, marginTop: -10, marginBottom: 24 }}>
            Mi Bitácora es una herramienta de autoconocimiento académico, no una herramienta clínica ni terapéutica.
          </p>
        </div>
      )}

      {/* ── SCREEN RESULTADO ── */}
      {screen === "resultado" && result && (
        <div style={{ padding: "28px 0", maxWidth: 800 }}>

          {/* Pathy análisis */}
          <div style={{ textAlign: "center" as const, marginBottom: 28 }}>
            <div style={{ animation: "float 3s ease-in-out infinite", display: "inline-flex", marginBottom: 10, color: "#6C0820" }}>
              <Icon n={result.bad ? "heart" : "cloud"} size={64} />
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.5rem", color: "#22375C", marginBottom: 6 }}>
              {result.bad ? "Pathy te manda un abrazo" : "Pathy analizó tu entrada"}
            </h2>
          </div>

          {/* Mensaje Pathy */}
          <div style={{ background: "linear-gradient(135deg, #F2DCDB, #fce4ec)", borderRadius: 18, padding: "22px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(242,174,188,.3) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6C0820", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 8, position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 6 }}><Icon n="cloud" size={14} /> Pathy dice</div>
            <p style={{ fontSize: ".92rem", color: "#444", lineHeight: 1.7, position: "relative", zIndex: 1 }}>{result.analysis}</p>
          </div>

          {/* Resumen */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
            <div style={{ fontSize: ".74rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon n="doc" size={14} /> Resumen de tu entrada</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "flex", color: "#3D5D91" }}><Icon n={result.emoji as never} size={22} /></span>
                <div>
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#22375C" }}>{result.moodLabel}</div>
                  <div style={{ fontSize: ".74rem", color: "#647DA0" }}>Cómo te sentiste</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
                {[
                  { label: "Motivación", val: result.motiv },
                  { label: "Concentración", val: result.conc },
                  { label: "Confianza CIAAC", val: result.conf },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.2rem", fontWeight: 900, color: "#3D5D91" }}>{s.val > 0 ? `${s.val}/5` : "—"}</div>
                    <div style={{ fontSize: ".68rem", color: "#8DA1BE" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {result.tema && (
                <div>
                  <div style={{ fontSize: ".74rem", color: "#647DA0", marginBottom: 4 }}>Materia que te costó:</div>
                  <span style={{ padding: "3px 12px", background: "#F2DCDB", color: "#6C0820", borderRadius: 20, fontSize: ".76rem", fontWeight: 700 }}>{result.tema}</span>
                </div>
              )}
              {result.text && (
                <div>
                  <div style={{ fontSize: ".74rem", color: "#647DA0", marginBottom: 4 }}>Lo que escribiste:</div>
                  <div style={{ fontSize: ".83rem", color: "#555", fontStyle: "italic" as const, lineHeight: 1.5, padding: "10px 12px", background: "#f8f9ff", borderRadius: 8 }}>{result.text}</div>
                </div>
              )}
            </div>
          </div>

          {/* Yaris card (si mal ánimo) */}
          {result.bad && (
            <div style={{ background: "linear-gradient(135deg, #3D5D91, #5A86CB)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#3D5D91" }}><Icon n="spark" size={22} /></div>
                <div>
                  <div style={{ fontSize: ".88rem", fontWeight: 700, color: "white" }}>Yaris está aquí para ti</div>
                  <div style={{ fontSize: ".76rem", color: "rgba(255,255,255,.7)" }}>Puedes contarme más sobre cómo te sientes</div>
                </div>
              </div>
              <button
                onClick={openYarisChat}
                style={{ width: "100%", padding: 11, background: "white", color: "#3D5D91", border: "none", borderRadius: 9, fontSize: ".88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Icon n="spark" size={16} /> Hablar con Yaris
              </button>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, marginBottom: 20 }}>
            <button
              onClick={() => setScreen("historial")}
              style={{ flex: 1, padding: 12, background: "white", color: "#3D5D91", border: "2px solid #3D5D91", borderRadius: 11, fontSize: ".88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Icon n="calendar" size={16} /> Ver mi historial
            </button>
            <button
              onClick={() => setScreen("hoy")}
              style={{ flex: 1, padding: 12, background: "#6C0820", color: "white", border: "none", borderRadius: 11, fontSize: ".88rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Icon n="plane" size={16} /> Ir a estudiar
            </button>
          </div>

          {/* Yaris chat */}
          {yarisOpen && (
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(61,93,145,.1)" }}>
              <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #3D5D91, #5A86CB)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 30, height: 30, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D5D91" }}><Icon n="spark" size={17} /></div>
                  <div>
                    <div style={{ fontSize: ".86rem", fontWeight: 700, color: "white" }}>Yaris IA</div>
                    <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.8)" }}>Aquí para escucharte</div>
                  </div>
                </div>
                <button onClick={() => setYarisOpen(false)} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: ".76rem", fontWeight: 700, display: "flex", alignItems: "center" }}><Icon n="close" size={14} /></button>
              </div>
              <div style={{ height: 220, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {yarisMessages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: msg.isUser ? "row-reverse" : "row" as const }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: msg.isUser ? "#3D5D91" : "#F2DCDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 700, color: msg.isUser ? "white" : "#22375C", flexShrink: 0 }}>
                      {msg.isUser ? initials : <Icon n="spark" size={14} />}
                    </div>
                    <div style={{ maxWidth: "82%", padding: "8px 12px", borderRadius: msg.isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: msg.isUser ? "#3D5D91" : "#f0f4ff", color: msg.isUser ? "white" : "#22375C", fontSize: ".81rem", lineHeight: 1.55 }}>
                      {msg.isUser ? msg.text : <span dangerouslySetInnerHTML={{ __html: msg.text }} />}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid #F2DCDB", display: "flex", gap: 7 }}>
                <input
                  value={yarisInput}
                  onChange={(e) => setYarisInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendYaris()}
                  placeholder="Cuéntame cómo te sientes..."
                  style={{ flex: 1, border: "2px solid #F2DCDB", borderRadius: 18, padding: "7px 12px", fontSize: ".82rem", fontFamily: "'Manrope', sans-serif", outline: "none" }}
                />
                <button onClick={sendYaris} style={{ width: 32, height: 32, background: "#3D5D91", border: "none", borderRadius: "50%", color: "white", cursor: "pointer", fontSize: ".82rem", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="send" size={15} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SCREEN HISTORIAL ── */}
      {screen === "historial" && (
        <div style={{ padding: "28px 0", maxWidth: 800 }}>

          {/* Pathy insight */}
          <div style={{ background: "linear-gradient(135deg, #F2DCDB, #fce4ec)", borderRadius: 14, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flexShrink: 0, color: "#6C0820" }}><Icon n="cloud" size={28} /></div>
            <div>
              <h4 style={{ fontSize: ".88rem", fontWeight: 700, color: "#6C0820", marginBottom: 4 }}>Pathy analizó tu bitácora</h4>
              <p style={{ fontSize: ".83rem", color: "#666", lineHeight: 1.55 }}>
                {insight}
              </p>
            </div>
          </div>

          {/* Mood chart */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 10px rgba(61,93,145,.06)", marginBottom: 20 }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon n="checkCircle" size={15} /> Tu estado de ánimo esta semana</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {moodData.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 16, color: "#647DA0" }}>{m.val > 0 ? <Icon n={m.emoji as never} size={16} /> : null}</span>
                  <div style={{ width: "100%", borderRadius: "6px 6px 0 0", minHeight: 4, height: `${m.val}%`, background: m.color, transition: "height .4s" }} />
                  <span style={{ fontSize: ".62rem", color: "#8DA1BE" }}>{m.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entry list */}
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#647DA0", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Icon n="calendar" size={15} /> Entradas recientes</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {histEntries.length === 0 && (
              <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(61,93,145,.05)", fontSize: ".85rem", color: "#647DA0" }}>
                Aún no tienes entradas. Escribe tu primera hoy.
              </div>
            )}
            {histEntries.map((entry) => (
              <div
                key={entry.id}
                className="ec-card"
                title={entry.pathyMsg}
                style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(61,93,145,.05)", cursor: "pointer", transition: "all .2s", borderLeft: `4px solid ${entry.borderColor}` }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", color: "#3D5D91" }}><Icon n={entry.emotion as never} size={24} /></span>
                    <div>
                      <h4 style={{ fontSize: ".88rem", fontWeight: 700, color: "#22375C", marginBottom: 2 }}>{entry.mood}</h4>
                      <p style={{ fontSize: ".74rem", color: "#647DA0" }}>Motivación {entry.motiv}/5 · Concentración {entry.conc}/5 · Confianza CIAAC {entry.conf}/5</p>
                    </div>
                  </div>
                  <div style={{ fontSize: ".74rem", color: "#8DA1BE", textAlign: "right" as const }}>
                    {entry.date}<br /><span style={{ fontSize: ".65rem" }}>{entry.sub}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
                  {entry.tags.map((tag) => (
                    <span key={tag} style={{ padding: "3px 10px", borderRadius: 10, fontSize: ".68rem", fontWeight: 600, background: "#F2DCDB", color: "#6C0820" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ fontSize: ".83rem", color: "#666", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {entry.text}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(61,93,145,.05)" }}>
                  {[
                    { label: "Motivación", val: entry.motiv },
                    { label: "Concentración", val: entry.conc },
                    { label: "Confianza", val: entry.conf },
                  ].map((sc) => (
                    <div key={sc.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".74rem", color: "#647DA0" }}>
                      {sc.label}
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: n <= sc.val ? "#3D5D91" : "#F2DCDB" }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
