import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Lock,
  Circle,
  PlayCircle,
  X,
  RotateCcw,
  Lightbulb,
  BookOpen,
  Shuffle,
  Send,
  ArrowRight,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/materias/$subjectId")({
  component: SubjectDetail,
});

/* ─── Types ─────────────────────────────────────────────── */
type TopicStatus = "done" | "active" | "available" | "locked";
type ActivityStage = "explanation" | "activity" | "flashcard" | "complete";

interface FillBlanksActivity {
  type: "fill-blanks";
  sentence: string; // uses __BLANK__ as placeholder
  words: string[];
  answers: string[];
}
interface MatchActivity {
  type: "match";
  pairs: { left: string; right: string }[];
}
interface OrderActivity {
  type: "order";
  prompt: string;
  steps: string[]; // correct order
}

type Activity = FillBlanksActivity | MatchActivity | OrderActivity;

interface Topic {
  id: number;
  title: string;
  status: TopicStatus;
  explanation: string;
  visual?: string; // emoji + text visual
  activity: Activity;
  mnemonic: string;
  flashcard: { front: string; back: string };
}
interface Block {
  id: number;
  title: string;
  topics: Topic[];
}

/* ─── Subject data ───────────────────────────────────────── */
const SUBJECT_DATA: Record<string, { icon: string; name: string; color: string; blocks: Block[] }> = {
  aerodinamica: {
    icon: "✈️",
    name: "Aerodinámica",
    color: "#3D5D91",
    blocks: [
      {
        id: 1,
        title: "Bloque 1: Fundamentos",
        topics: [
          {
            id: 1,
            title: "Definiciones — aeronave en vuelo, fluido, capa límite",
            status: "done",
            explanation:
              "Una **aeronave en vuelo** es cualquier máquina que se sustenta en la atmósfera por la reacción del aire sobre sus superficies. Un **fluido** es cualquier sustancia que fluye y toma la forma del recipiente que lo contiene — el aire es un fluido. La **capa límite** es la delgada capa de aire que está en contacto directo con la superficie del ala, donde la velocidad del fluido va de cero (en la superficie) hasta la velocidad del flujo libre.",
            visual: "🌊 Aire = fluido · ✈️ Ala = superficie · 〰️ Capa límite = zona de transición",
            activity: {
              type: "fill-blanks",
              sentence:
                "El aire es un __BLANK__ que fluye alrededor del ala. La zona donde el fluido pasa de velocidad cero a velocidad libre se llama __BLANK__.",
              words: ["fluido", "capa límite", "presión", "densidad"],
              answers: ["fluido", "capa límite"],
            },
            mnemonic:
              '🧠 Recuerda: "FCA" — Fluido, Capa límite, Aeronave. Como una persona nadando: el agua es el fluido, el traje de baño es la capa límite y el nadador es la aeronave.',
            flashcard: {
              front: "¿Qué es la capa límite en aerodinámica?",
              back: "La capa límite es la delgada zona de aire en contacto directo con la superficie del ala, donde la velocidad del fluido varía de cero (en la superficie) hasta la velocidad del flujo libre.",
            },
          },
          {
            id: 2,
            title: "Clasificación de aeronaves por tipo de diseño",
            status: "done",
            explanation:
              "Las aeronaves se clasifican por su modo de sustentación:\n\n• **Aerostatos**: se sustentan por la diferencia de densidad (globos, dirigibles)\n• **Aerodinos más ligeros que el aire**: helicópteros de gas\n• **Aerodinos más pesados que el aire**: aviones, helicópteros, planeadores — se sustentan por las fuerzas aerodinámicas de sus superficies en movimiento.",
            visual: "🎈 Aerostato | ✈️ Avión | 🚁 Helicóptero | 🪂 Planeador",
            activity: {
              type: "match",
              pairs: [
                { left: "Aerostato", right: "Se sustenta por diferencia de densidad con el aire" },
                { left: "Avión", right: "Ala fija, sustentación por movimiento del ala" },
                { left: "Helicóptero", right: "Ala rotatoria, despegue vertical" },
                { left: "Planeador", right: "Sin motor, aprovecha corrientes de aire" },
              ],
            },
            mnemonic:
              '🧠 "AAHP" — Aerostato flota, Avión vuela, Helicóptero sube, Planeador planea. Como los 4 niveles de un edificio: sótano (flotando), planta baja (volando), primer piso (girando), terraza (planeando).',
            flashcard: {
              front: "¿Cuál es la diferencia entre un aerostato y un aerodino?",
              back: "Los aerostatos (globos, dirigibles) se sustentan por la diferencia de densidad entre el gas interior y el aire. Los aerodinos (aviones, helicópteros) se sustentan por fuerzas aerodinámicas generadas por sus superficies en movimiento.",
            },
          },
        ],
      },
      {
        id: 2,
        title: "Bloque 2: Leyes y Fuerzas",
        topics: [
          {
            id: 3,
            title: "Leyes de Newton y Principio de Bernoulli",
            status: "active",
            explanation:
              "Las **3 Leyes de Newton** son la base del vuelo:\n\n• **1ª Ley (Inercia)**: Un objeto en reposo permanece en reposo, y uno en movimiento sigue en movimiento, a menos que actúe una fuerza neta.\n• **2ª Ley (F = ma)**: La fuerza neta sobre un objeto es igual a su masa por su aceleración.\n• **3ª Ley (Acción-Reacción)**: Por cada acción hay una reacción igual y opuesta.\n\nEl **Principio de Bernoulli** establece que en un fluido en movimiento, cuando la velocidad aumenta, la presión disminuye. Esto explica la sustentación del ala: el aire fluye más rápido por la cara superior (cóncava) → menor presión → el ala sube.",
            visual:
              "⬆️ Cara superior: aire más rápido → P↓\n⬇️ Cara inferior: aire más lento → P↑\n🔼 Resultado: Sustentación",
            activity: {
              type: "match",
              pairs: [
                {
                  left: "1ª Ley de Newton",
                  right: "Un avión en vuelo nivelado mantiene su velocidad sin cambio de fuerzas",
                },
                { left: "2ª Ley de Newton", right: "Para acelerar el avión, aumenta el empuje" },
                {
                  left: "3ª Ley de Newton",
                  right: "El motor expulsa gases → el avión avanza",
                },
                {
                  left: "Bernoulli",
                  right: "El ala curva acelera el aire arriba → menor presión → sustentación",
                },
              ],
            },
            mnemonic:
              '🧠 Newton = semáforo 🚦: Rojo (Inercia = parado), Amarillo (F=ma = calculando), Verde (Acción-Reacción = moviéndose). Bernoulli = ducha: cuanto más abre la llave, más rápido el chorro pero menos presión sientes.',
            flashcard: {
              front: "¿Por qué vuela el ala según Bernoulli?",
              back: "El perfil del ala obliga al aire a recorrer una mayor distancia por la cara superior, aumentando su velocidad. Por el principio de Bernoulli, mayor velocidad = menor presión. La diferencia de presión entre la cara inferior (mayor) y superior (menor) genera la fuerza de sustentación.",
            },
          },
          {
            id: 4,
            title: "Las 4 fuerzas que actúan en vuelo",
            status: "available",
            explanation:
              "En vuelo existen 4 fuerzas fundamentales:\n\n• **Sustentación (L)**: Fuerza aerodinámica perpendicular al movimiento. Actúa hacia arriba en vuelo normal.\n• **Peso (W)**: Fuerza gravitacional hacia abajo. Actúa en el centro de gravedad.\n• **Empuje (T)**: Fuerza propulsiva del motor. Actúa hacia adelante.\n• **Resistencia (D)**: Fuerza aerodinámica opuesta al movimiento.\n\nEn vuelo recto y nivelado: **L = W** y **T = D**.",
            visual: "⬆️ Sustentación = ⬇️ Peso\n➡️ Empuje = ⬅️ Resistencia",
            activity: {
              type: "order",
              prompt: "Ordena las 4 fuerzas del vuelo: ¿cuál par se opone verticalmente?",
              steps: [
                "Sustentación ↑ — fuerza aerodinámica hacia arriba",
                "Peso ↓ — gravedad hacia el centro de la Tierra",
                "Empuje → — propulsión del motor",
                "Resistencia ← — fricción opuesta al movimiento",
              ],
            },
            mnemonic:
              '🧠 "SPER" — Sustentación, Peso, Empuje, Resistencia. Como una pelea de 4 luchadores: Sustentación vs Peso (vertical), Empuje vs Resistencia (horizontal). En vuelo nivelado: ¡empate perfecto!',
            flashcard: {
              front: "¿Qué condición deben cumplir las 4 fuerzas en vuelo recto y nivelado?",
              back: "Las fuerzas deben estar equilibradas: Sustentación = Peso (eje vertical) y Empuje = Resistencia (eje horizontal). Cualquier desequilibrio genera aceleración en esa dirección.",
            },
          },
        ],
      },
      {
        id: 3,
        title: "Bloque 3: Perfiles y Mandos",
        topics: [
          {
            id: 5,
            title: "Perfiles aerodinámicos — diseño y características",
            status: "locked",
            explanation: "",
            activity: { type: "fill-blanks", sentence: "", words: [], answers: [] },
            mnemonic: "",
            flashcard: { front: "", back: "" },
          },
          {
            id: 6,
            title: "Mandos de la aeronave — flaps, slats y anti-sustentadores",
            status: "locked",
            explanation: "",
            activity: { type: "fill-blanks", sentence: "", words: [], answers: [] },
            mnemonic: "",
            flashcard: { front: "", back: "" },
          },
        ],
      },
      {
        id: 4,
        title: "Bloque 4: Estabilidad y Maniobras",
        topics: [
          {
            id: 7,
            title: "Estabilidad y control — tipos de estabilidad",
            status: "locked",
            explanation: "",
            activity: { type: "fill-blanks", sentence: "", words: [], answers: [] },
            mnemonic: "",
            flashcard: { front: "", back: "" },
          },
          {
            id: 8,
            title: "Maniobras y factor de carga — despegue, viraje, desplome",
            status: "locked",
            explanation: "",
            activity: { type: "fill-blanks", sentence: "", words: [], answers: [] },
            mnemonic: "",
            flashcard: { front: "", back: "" },
          },
        ],
      },
    ],
  },
};

const DEFAULT_SUBJECT = {
  icon: "📚",
  name: "Materia",
  color: "#3D5D91",
  blocks: [] as Block[],
};

/* ─── Activity components ────────────────────────────────── */

function FillBlanksActivity({
  activity,
  onComplete,
  onFail,
}: {
  activity: FillBlanksActivity;
  onComplete: () => void;
  onFail: () => void;
}) {
  const [selectedWords, setSelectedWords] = useState<(string | null)[]>(
    Array(activity.answers.length).fill(null)
  );
  const [availableWords, setAvailableWords] = useState<string[]>([...activity.words]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const parts = activity.sentence.split("__BLANK__");
  const blankCount = parts.length - 1;

  function selectWord(word: string) {
    const firstEmpty = selectedWords.findIndex((w) => w === null);
    if (firstEmpty === -1) return;
    const next = [...selectedWords];
    next[firstEmpty] = word;
    setSelectedWords(next);
    setAvailableWords((prev) => prev.filter((w, i) => !(w === word && i === prev.indexOf(word))));
  }

  function removeWord(index: number) {
    const word = selectedWords[index];
    if (!word || checked) return;
    const next = [...selectedWords];
    next[index] = null;
    setSelectedWords(next);
    setAvailableWords((prev) => [...prev, word]);
  }

  function checkAnswer() {
    const correct = activity.answers.every((ans, i) => selectedWords[i]?.toLowerCase() === ans.toLowerCase());
    setChecked(true);
    setIsCorrect(correct);
    if (!correct) setTimeout(onFail, 1200);
    else setTimeout(onComplete, 800);
  }

  function reset() {
    setSelectedWords(Array(blankCount).fill(null));
    setAvailableWords([...activity.words]);
    setChecked(false);
    setIsCorrect(false);
  }

  return (
    <div className="space-y-5">
      <p className="text-slate-500 text-sm font-medium">Completa los espacios en blanco:</p>
      <div className="bg-[#F2DCDB]/30 rounded-2xl p-5 text-slate-700 text-base leading-loose">
        {parts.map((part, i) => (
          <span key={i}>
            <span dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            {i < parts.length - 1 && (
              <button
                onClick={() => removeWord(i)}
                className={`inline-flex items-center mx-1 px-3 py-0.5 rounded-lg border-2 min-w-[100px] justify-center font-semibold transition-all text-sm ${
                  checked
                    ? isCorrect
                      ? "bg-green-50 border-green-400 text-green-700"
                      : "bg-red-50 border-red-300 text-red-600"
                    : selectedWords[i]
                    ? "bg-[#3D5D91] border-[#3D5D91] text-white"
                    : "bg-white border-dashed border-[#F2AEBC] text-slate-300"
                }`}
              >
                {selectedWords[i] ?? "___"}
              </button>
            )}
          </span>
        ))}
      </div>

      <div>
        <p className="text-xs text-slate-400 font-medium mb-2">Banco de palabras:</p>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word, i) => (
            <button
              key={`${word}-${i}`}
              onClick={() => selectWord(word)}
              disabled={checked}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#F2DCDB] text-[#3D5D91] text-sm font-medium hover:bg-[#F2DCDB] transition-colors disabled:opacity-50"
            >
              {word}
            </button>
          ))}
          {availableWords.length === 0 && !checked && (
            <p className="text-slate-300 text-sm italic">Todos los espacios están llenos</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={checkAnswer}
          disabled={selectedWords.some((w) => w === null) || checked}
          className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-semibold"
        >
          Verificar respuesta
        </Button>
        {!checked && (
          <Button variant="outline" onClick={reset} className="border-[#F2DCDB] text-slate-500">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reiniciar
          </Button>
        )}
      </div>

      {checked && (
        <div
          className={`rounded-xl p-3 flex items-center gap-2 text-sm font-medium ${
            isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {isCorrect ? "¡Correcto! Muy bien 🎉" : "No es correcto. ¡Inténtalo de nuevo!"}
        </div>
      )}
    </div>
  );
}

function MatchActivity({
  activity,
  onComplete,
  onFail,
}: {
  activity: MatchActivity;
  onComplete: () => void;
  onFail: () => void;
}) {
  const shuffled = useCallback(
    () => [...activity.pairs].sort(() => Math.random() - 0.5),
    [activity]
  );
  const [rightItems] = useState(() => shuffled().map((p) => p.right));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});

  function selectLeft(index: number) {
    if (checked) return;
    setSelectedLeft(index === selectedLeft ? null : index);
  }

  function selectRight(rightIndex: number) {
    if (checked || selectedLeft === null) return;
    const alreadyMatched = Object.values(matches).includes(rightIndex);
    if (alreadyMatched) return;
    setMatches((prev) => ({ ...prev, [selectedLeft]: rightIndex }));
    setSelectedLeft(null);
  }

  function checkAnswers() {
    const res: Record<number, boolean> = {};
    activity.pairs.forEach((pair, leftIdx) => {
      const rightIdx = matches[leftIdx];
      if (rightIdx === undefined) { res[leftIdx] = false; return; }
      res[leftIdx] = rightItems[rightIdx] === pair.right;
    });
    setResults(res);
    setChecked(true);
    const allCorrect = Object.values(res).every(Boolean);
    if (allCorrect) setTimeout(onComplete, 800);
    else setTimeout(onFail, 1200);
  }

  function reset() {
    setMatches({});
    setSelectedLeft(null);
    setChecked(false);
    setResults({});
  }

  const allMatched = Object.keys(matches).length === activity.pairs.length;

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm font-medium">
        Une cada concepto con su descripción correcta:
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Concepto</p>
          {activity.pairs.map((pair, i) => (
            <button
              key={i}
              onClick={() => selectLeft(i)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                checked
                  ? results[i]
                    ? "bg-green-50 border-green-400 text-green-700"
                    : "bg-red-50 border-red-300 text-red-600"
                  : selectedLeft === i
                  ? "bg-[#3D5D91] border-[#3D5D91] text-white"
                  : matches[i] !== undefined
                  ? "bg-[#F2DCDB] border-[#F2AEBC] text-[#3D5D91]"
                  : "bg-white border-[#F2DCDB] text-slate-700 hover:border-[#3D5D91]"
              }`}
            >
              {pair.left}
              {matches[i] !== undefined && (
                <span className="ml-1 text-xs opacity-60">→ conectado</span>
              )}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Descripción</p>
          {rightItems.map((item, i) => {
            const isUsed = Object.values(matches).includes(i);
            return (
              <button
                key={i}
                onClick={() => selectRight(i)}
                disabled={isUsed || checked}
                className={`w-full text-left p-3 rounded-xl border-2 text-xs transition-all ${
                  isUsed
                    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                    : selectedLeft !== null
                    ? "bg-white border-[#F2AEBC] text-slate-700 hover:bg-[#F2DCDB] hover:border-[#3D5D91] cursor-pointer"
                    : "bg-white border-[#F2DCDB] text-slate-600"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={checkAnswers}
          disabled={!allMatched || checked}
          className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-semibold"
        >
          Verificar respuestas
        </Button>
        {!checked && (
          <Button variant="outline" onClick={reset} className="border-[#F2DCDB] text-slate-500">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reiniciar
          </Button>
        )}
      </div>

      {checked && (
        <div
          className={`rounded-xl p-3 flex items-center gap-2 text-sm font-medium ${
            Object.values(results).every(Boolean)
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {Object.values(results).every(Boolean) ? (
            <><CheckCircle2 className="w-4 h-4" /> ¡Perfecto! Todas correctas 🎉</>
          ) : (
            <><X className="w-4 h-4" /> Algunas incorrectas. ¡Inténtalo de nuevo!</>
          )}
        </div>
      )}
    </div>
  );
}

function OrderActivity({
  activity,
  onComplete,
  onFail,
}: {
  activity: OrderActivity;
  onComplete: () => void;
  onFail: () => void;
}) {
  const [order, setOrder] = useState<string[]>(() => [...activity.steps].sort(() => Math.random() - 0.5));
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function moveUp(index: number) {
    if (index === 0 || checked) return;
    const next = [...order];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrder(next);
  }

  function moveDown(index: number) {
    if (index === order.length - 1 || checked) return;
    const next = [...order];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrder(next);
  }

  function checkAnswer() {
    const correct = order.every((step, i) => step === activity.steps[i]);
    setChecked(true);
    setIsCorrect(correct);
    if (!correct) setTimeout(onFail, 1200);
    else setTimeout(onComplete, 800);
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm font-medium">{activity.prompt}</p>
      <p className="text-xs text-slate-400">Usa las flechas para ordenar correctamente:</p>

      <div className="space-y-2">
        {order.map((step, i) => (
          <div
            key={step}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              checked
                ? step === activity.steps[i]
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-200"
                : "bg-white border-[#F2DCDB]"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                checked && step === activity.steps[i]
                  ? "bg-green-200 text-green-800"
                  : "bg-[#F2DCDB] text-[#3D5D91]"
              }`}
            >
              {i + 1}
            </span>
            <p className="flex-1 text-sm text-slate-700">{step}</p>
            {!checked && (
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-[#3D5D91] disabled:opacity-20"
                >
                  <ChevronLeft className="w-3 h-3 rotate-90" />
                </button>
                <button
                  onClick={() => moveDown(i)}
                  disabled={i === order.length - 1}
                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-[#3D5D91] disabled:opacity-20"
                >
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={checkAnswer}
          disabled={checked}
          className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-semibold"
        >
          Verificar orden
        </Button>
        {!checked && (
          <Button
            variant="outline"
            onClick={() => setOrder([...activity.steps].sort(() => Math.random() - 0.5))}
            className="border-[#F2DCDB] text-slate-500"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1" />
            Mezclar
          </Button>
        )}
      </div>

      {checked && (
        <div
          className={`rounded-xl p-3 flex items-center gap-2 text-sm font-medium ${
            isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {isCorrect ? (
            <><CheckCircle2 className="w-4 h-4" /> ¡Orden correcto! 🎉</>
          ) : (
            <><X className="w-4 h-4" /> Orden incorrecto. ¡Inténtalo de nuevo!</>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Flashcard ──────────────────────────────────────────── */
function Flashcard({ card, onDone }: { card: { front: string; back: string }; onDone: () => void }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Flashcard de cierre — toca para voltear
      </p>

      <div
        className="relative h-44 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="w-full h-full transition-transform duration-500 relative"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#3D5D91] to-[#5A86CB] rounded-2xl p-6 flex items-center justify-center shadow-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center">
              <p className="text-[#F2AEBC] text-xs font-semibold mb-3 uppercase tracking-wide">
                Pregunta ✈️
              </p>
              <p className="text-white font-semibold text-sm leading-relaxed">{card.front}</p>
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#F2AEBC] to-[#F2DCDB] rounded-2xl p-6 flex items-center justify-center shadow-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-center">
              <p className="text-[#6C0820] text-xs font-semibold mb-3 uppercase tracking-wide">
                Respuesta 💡
              </p>
              <p className="text-[#3D5D91] font-medium text-sm leading-relaxed">{card.back}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        {flipped ? "¡Bien! ¿La sabías?" : "Toca la tarjeta para ver la respuesta"}
      </p>

      {flipped && (
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            className="border-slate-200 text-slate-500 hover:bg-slate-50"
            onClick={() => { setFlipped(false); }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Repetir
          </Button>
          <Button
            className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-semibold"
            onClick={onDone}
          >
            Ya la sé ✅
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Topic content panel ────────────────────────────────── */
function TopicContent({
  topic,
  yarisOpen,
  onTopicComplete,
  onRetry,
}: {
  topic: Topic;
  yarisOpen: boolean;
  onTopicComplete: (topicId: number) => void;
  onRetry: () => void;
}) {
  const [stage, setStage] = useState<ActivityStage>("explanation");

  function handleActivityComplete() { setStage("flashcard"); }
  function handleActivityFail() { onRetry(); }
  function handleFlashcardDone() {
    setStage("complete");
    onTopicComplete(topic.id);
  }

  const STAGE_LABELS: Record<ActivityStage, string> = {
    explanation: "Explicación",
    activity: "Actividad",
    flashcard: "Flashcard",
    complete: "¡Completado!",
  };
  const stages: ActivityStage[] = ["explanation", "activity", "flashcard", "complete"];
  const stageIndex = stages.indexOf(stage);

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className={`mx-auto py-6 px-4 sm:px-6 ${yarisOpen ? "max-w-full" : "max-w-3xl"}`}>
        {/* Topic header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-[#F2DCDB] text-[#3D5D91] border-0 text-xs">
              Tema {topic.id}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              {stages.map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${i < stageIndex ? "bg-green-400" : i === stageIndex ? "bg-[#3D5D91]" : "bg-slate-200"}`}
                  />
                  {i < stages.length - 1 && <span className="text-slate-200">—</span>}
                </span>
              ))}
              <span className="ml-1 font-medium text-[#3D5D91]">{STAGE_LABELS[stage]}</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-[#3D5D91] leading-tight">{topic.title}</h2>
        </div>

        {/* Explanation stage */}
        {stage === "explanation" && (
          <div className="space-y-5">
            <div className="bg-white border border-[#F2DCDB] rounded-2xl p-5">
              <div
                className="text-slate-700 text-sm leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{
                  __html: topic.explanation
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#3D5D91]'>$1</strong>")
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>

            {topic.visual && (
              <div className="bg-[#F2DCDB]/30 border border-[#F2AEBC] rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#6C0820] mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Visualízalo así:
                </p>
                <p className="text-slate-600 text-sm font-mono whitespace-pre-line">{topic.visual}</p>
              </div>
            )}

            {/* Yaris mnemonic */}
            <div className="bg-gradient-to-r from-[#3D5D91]/5 to-[#5A86CB]/5 border border-[#3D5D91]/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#3D5D91] mb-1 flex items-center gap-1">
                🤖 Nemotecnia de Yaris
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">{topic.mnemonic}</p>
            </div>

            <Button
              onClick={() => setStage("activity")}
              className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-semibold"
            >
              Ir a la actividad
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Activity stage */}
        {stage === "activity" && (
          <div className="space-y-5">
            <div className="bg-white border border-[#F2DCDB] rounded-2xl p-5">
              {topic.activity.type === "fill-blanks" && (
                <FillBlanksActivity
                  activity={topic.activity}
                  onComplete={handleActivityComplete}
                  onFail={handleActivityFail}
                />
              )}
              {topic.activity.type === "match" && (
                <MatchActivity
                  activity={topic.activity}
                  onComplete={handleActivityComplete}
                  onFail={handleActivityFail}
                />
              )}
              {topic.activity.type === "order" && (
                <OrderActivity
                  activity={topic.activity}
                  onComplete={handleActivityComplete}
                  onFail={handleActivityFail}
                />
              )}
            </div>
            <button
              onClick={() => setStage("explanation")}
              className="text-xs text-slate-400 hover:text-[#3D5D91] flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              Volver a la explicación
            </button>
          </div>
        )}

        {/* Flashcard stage */}
        {stage === "flashcard" && (
          <div className="bg-white border border-[#F2DCDB] rounded-2xl p-5">
            <Flashcard card={topic.flashcard} onDone={handleFlashcardDone} />
          </div>
        )}

        {/* Complete stage */}
        {stage === "complete" && (
          <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-extrabold text-green-700 mb-2">¡Tema completado!</h3>
            <p className="text-slate-500 text-sm mb-5">
              Completaste el tema <strong>{topic.title}</strong>. ¡Sigue así, Pathy está orgullosa!
            </p>
            <Badge className="bg-green-50 text-green-700 border border-green-200 text-sm px-4 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              +10 puntos de experiencia
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Yaris chat ─────────────────────────────────────────── */
const YARIS_RESPONSES: Record<string, string> = {
  default:
    "¡Claro! Estoy aquí para ayudarte. ¿Tienes alguna duda sobre este tema? Puedo explicarte con ejemplos de la vida cotidiana, películas o crear una nemotecnia personalizada para ti. 🤖",
  bernoulli:
    "Bernoulli es como una ducha con manguera: cuando aprietas el extremo (aumentas velocidad), el chorro sale fuerte pero el agua tiene menos 'empuje lateral' (presión). En el ala, la curva superior hace que el aire acelere → presión baja → ¡el ala sube! 🌊",
  newton:
    'Las 3 leyes en el avión: 1ª = si nadie empuja al avión, no se mueve (inercia). 2ª = para acelerar un Boeing 747 (600 ton) necesitas MÁS empuje que para una Cessna (F=ma). 3ª = el jet lanza gases atrás → el avión va adelante. Como cuando empujas una pared: la pared "te empuja" a ti también. 💪',
  sustentacion:
    "La sustentación viene de 2 cosas: Bernoulli (diferencia de presión) + Newton 3ª (el ala desvía aire hacia abajo → el aire empuja el ala hacia arriba). Es como un remo en el agua: cuando lo inclinas, el agua te impulsa. 🏊",
};

function YarisChat({ topicTitle }: { topicTitle: string }) {
  const [messages, setMessages] = useState([
    {
      role: "yaris" as const,
      text: `¡Hola! Soy Yaris, tu tutora IA. Estás en el tema **${topicTitle}**. ¿Qué parte no quedó clara? Puedo explicarte con ejemplos, crear una nemotecnia o simplemente conversar sobre el tema. 🛫`,
    },
  ]);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    const lower = userMsg.toLowerCase();
    let response = YARIS_RESPONSES.default;
    if (lower.includes("bernoulli") || lower.includes("presión")) response = YARIS_RESPONSES.bernoulli;
    else if (lower.includes("newton") || lower.includes("ley")) response = YARIS_RESPONSES.newton;
    else if (lower.includes("sustentación") || lower.includes("vuela") || lower.includes("vuelo"))
      response = YARIS_RESPONSES.sustentacion;

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "yaris", text: response }]);
    }, 600);
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#F2DCDB]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#F2DCDB] bg-[#3D5D91]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F2AEBC] rounded-full flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <p className="text-white font-bold text-sm">Yaris</p>
            <p className="text-[#F2DCDB] text-xs">Tutora IA · siempre disponible</p>
          </div>
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "yaris" && (
              <div className="w-6 h-6 bg-[#F2AEBC] rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                🤖
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#3D5D91] text-white rounded-tr-sm"
                  : "bg-[#F2DCDB]/50 text-slate-700 rounded-tl-sm border border-[#F2DCDB]"
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </div>
        ))}
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-t border-[#F2DCDB]">
        <div className="flex gap-1.5 flex-wrap mb-2">
          {["Explícamelo simple", "Ponme a prueba", "Dame una nemotecnia"].map((prompt) => (
            <button
              key={prompt}
              onClick={() => { setInput(prompt); }}
              className="text-xs bg-[#F2DCDB] text-[#3D5D91] rounded-full px-2.5 py-1 font-medium hover:bg-[#F2AEBC] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe tu pregunta..."
            className="h-9 text-sm border-[#F2DCDB] focus:border-[#3D5D91]"
          />
          <Button
            size="sm"
            onClick={sendMessage}
            className="bg-[#3D5D91] hover:bg-[#5A86CB] text-white px-3 h-9"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
function SubjectDetail() {
  const { subjectId } = Route.useParams();
  const subject = SUBJECT_DATA[subjectId] ?? DEFAULT_SUBJECT;

  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([1, 2]));
  const [activeTopic, setActiveTopic] = useState<Topic | null>(() => {
    for (const block of subject.blocks) {
      const active = block.topics.find((t) => t.status === "active");
      if (active) return active;
    }
    return null;
  });
  const [yarisOpen, setYarisOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [topicStatuses, setTopicStatuses] = useState<Record<number, TopicStatus>>(() => {
    const init: Record<number, TopicStatus> = {};
    subject.blocks.forEach((b) => b.topics.forEach((t) => (init[t.id] = t.status)));
    return init;
  });

  function toggleBlock(blockId: number) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }

  function handleSelectTopic(topic: Topic) {
    const status = topicStatuses[topic.id];
    if (status === "locked") return;
    setActiveTopic(topic);
    setRetryCount(0);
  }

  function handleTopicComplete(topicId: number) {
    setTopicStatuses((prev) => {
      const next = { ...prev, [topicId]: "done" as TopicStatus };
      const allTopics = subject.blocks.flatMap((b) => b.topics);
      const idx = allTopics.findIndex((t) => t.id === topicId);
      if (idx + 1 < allTopics.length) {
        const nextTopic = allTopics[idx + 1];
        if (next[nextTopic.id] === "locked") next[nextTopic.id] = "available";
      }
      return next;
    });
  }

  function handleRetry() {
    setRetryCount((c) => c + 1);
  }

  const allTopics = subject.blocks.flatMap((b) => b.topics);
  const doneCount = allTopics.filter((t) => topicStatuses[t.id] === "done").length;
  const progress = allTopics.length > 0 ? Math.round((doneCount / allTopics.length) * 100) : 0;

  const STATUS_ICONS: Record<TopicStatus, React.ReactNode> = {
    done: <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />,
    active: <PlayCircle className="w-4 h-4 text-[#3D5D91] flex-shrink-0" />,
    available: <Circle className="w-4 h-4 text-[#5A86CB] flex-shrink-0" />,
    locked: <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-4 sm:-m-6">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-[#F2DCDB] px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link to="/dashboard/materias" className="text-slate-400 hover:text-[#3D5D91] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="text-2xl">{subject.icon}</span>
        <div className="flex-1 min-w-0">
          <h1 className="font-extrabold text-[#3D5D91] text-base sm:text-lg leading-tight">
            {subject.name}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <Progress value={progress} className="h-1.5 w-24 bg-slate-100" />
            <span className="text-xs text-slate-400">
              {doneCount}/{allTopics.length} temas · {progress}%
            </span>
          </div>
        </div>
        <Button
          variant={yarisOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setYarisOpen(!yarisOpen)}
          className={
            yarisOpen
              ? "bg-[#3D5D91] text-white border-[#3D5D91]"
              : "border-[#F2AEBC] text-[#3D5D91] hover:bg-[#F2DCDB]"
          }
        >
          <Bot className="w-4 h-4 mr-1.5" />
          {yarisOpen ? "Cerrar Yaris" : "Explícamelo Yaris"}
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Topic list sidebar */}
        <aside className="w-64 xl:w-72 flex-shrink-0 border-r border-[#F2DCDB] bg-white overflow-y-auto hidden sm:block">
          <div className="p-3 space-y-1">
            {subject.blocks.map((block) => {
              const blockDone = block.topics.filter((t) => topicStatuses[t.id] === "done").length;
              const isExpanded = expandedBlocks.has(block.id);
              return (
                <div key={block.id}>
                  <button
                    onClick={() => toggleBlock(block.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-[#F2DCDB]/30 transition-colors group"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                    />
                    <span className="flex-1 text-left text-sm font-bold text-[#3D5D91] leading-tight">
                      {block.title}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {blockDone}/{block.topics.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="ml-3 space-y-0.5 mb-1">
                      {block.topics.map((topic) => {
                        const status = topicStatuses[topic.id] ?? topic.status;
                        const isActive = activeTopic?.id === topic.id;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => handleSelectTopic({ ...topic, status })}
                            disabled={status === "locked"}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                              isActive
                                ? "bg-[#3D5D91] text-white"
                                : status === "locked"
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-[#F2DCDB]/50 text-slate-600"
                            }`}
                          >
                            <span className={isActive ? "text-white" : ""}>
                              {STATUS_ICONS[status]}
                            </span>
                            <span className="text-xs leading-tight line-clamp-2">{topic.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Content area */}
        {activeTopic ? (
          <div className={`flex flex-1 overflow-hidden ${yarisOpen ? "divide-x divide-[#F2DCDB]" : ""}`}>
            <div
              key={`${activeTopic.id}-${retryCount}`}
              className={`overflow-y-auto ${yarisOpen ? "flex-1" : "flex-1"}`}
            >
              <TopicContent
                topic={{ ...activeTopic, status: topicStatuses[activeTopic.id] ?? activeTopic.status }}
                yarisOpen={yarisOpen}
                onTopicComplete={handleTopicComplete}
                onRetry={handleRetry}
              />
            </div>
            {yarisOpen && (
              <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col">
                <YarisChat topicTitle={activeTopic.title} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <p className="text-4xl mb-3">{subject.icon}</p>
              <h2 className="font-extrabold text-[#3D5D91] text-xl mb-2">
                Elige un tema para empezar
              </h2>
              <p className="text-slate-400 text-sm">
                Selecciona un tema del panel izquierdo. Los temas se desbloquean en orden conforme
                avanzas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Yaris floating button when panel is closed */}
      {!yarisOpen && (
        <button
          onClick={() => setYarisOpen(true)}
          className="sm:hidden fixed bottom-6 right-6 z-40 bg-[#3D5D91] text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2 font-semibold text-sm"
        >
          🤖 Explícamelo Yaris
        </button>
      )}
    </div>
  );
}
