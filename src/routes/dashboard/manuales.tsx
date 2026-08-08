/**
 * Módulo "Manuales de Aeronave": bancos de preguntas por tipo de avión.
 *
 * Comparte la anatomía del módulo de Línea Aérea (tarjeta por manual, selector
 * de capítulos y el historial de `BancoScreen`), pero mantiene su propio
 * historial y sus sesiones a medias.
 */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon, type FPIconName } from "@/components/ui/fp-icon";
import { useRequireAuth } from "@/lib/store";
import {
  AERONAVE_QUIZZES,
  B737MAX_CHAPTERS,
  B737MAX_TOTAL,
  type AtpChapter,
} from "@/lib/store/linea-aerea-meta";
import { BancoScreen } from "@/components/banco/BancoScreen";
import { QuizCard, ChapterPicker } from "@/routes/dashboard/linea-aerea";

export const Route = createFileRoute("/dashboard/manuales")({
  component: ManualesPage,
});

const FONT = "'Manrope', sans-serif";
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const INK = "#22375C";

/** Bancos por capítulos de cada manual de aeronave. */
const CHAPTER_BANKS: Record<string, { chapters: AtpChapter[]; total: number }> = {
  B737MAX: { chapters: B737MAX_CHAPTERS, total: B737MAX_TOTAL },
};

function ManualesPage() {
  const { ready } = useRequireAuth();
  if (!ready) return <div style={{ minHeight: "60vh" }} />;

  return (
    <BancoScreen
      ac
      modes={false}
      extras={false}
      header={
        <>
          <ManualesHero />
          <ManualCards />
        </>
      }
    />
  );
}

function ManualesHero() {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #22375C, #2a2a4e)",
        borderRadius: 20,
        padding: "30px 28px",
        marginBottom: 32,
        maxWidth: 820,
        width: "100%",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(242,174,188,0.2)", color: "#F2AEBC",
          padding: "5px 12px", borderRadius: 20,
          fontSize: "0.72rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14,
        }}
      >
        <Icon n="plane" size={14} /> Nuevo módulo
      </div>
      <h1 style={{ fontFamily: DISPLAY, fontSize: "1.7rem", color: "white", marginBottom: 8, lineHeight: 1.2 }}>
        Manuales de Aeronave
      </h1>
      <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 620 }}>
        Estudia el manual de operación de cada avión por capítulos: limitaciones,
        procedimientos, rendimiento y sistemas. Feedback inmediato en cada pregunta
        y Yaris explicándote lo que se te complique.
      </p>
    </div>
  );
}

function ManualCards() {
  const [picker, setPicker] = useState<string | null>(null);
  const pickerQuiz = picker ? AERONAVE_QUIZZES.find((q) => q.code === picker) : null;
  const pickerBank = picker ? CHAPTER_BANKS[picker] : null;

  return (
    <div style={{ maxWidth: 820, width: "100%", fontFamily: FONT, color: INK, marginBottom: 8 }}>
      <h2 style={{ fontFamily: DISPLAY, fontSize: "1.15rem", color: INK, display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <Icon n="book" size={18} color="#6C0820" /> Cuestionarios por aeronave
      </h2>

      {picker && pickerBank && (
        <ChapterPicker
          code={picker}
          nombre={pickerQuiz?.titulo ?? picker}
          chapters={pickerBank.chapters}
          totalBanco={pickerBank.total}
          onClose={() => setPicker(null)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
        {AERONAVE_QUIZZES.map((q) => {
          const bank = CHAPTER_BANKS[q.code];
          return (
            <QuizCard
              key={q.code}
              badge="Manual de aeronave"
              icon={q.icon as FPIconName}
              titulo={q.titulo}
              descripcion={q.descripcion}
              features={[
                `${(bank?.total ?? q.total).toLocaleString("es-MX")} preguntas en ${bank?.chapters.length ?? 0} capítulos`,
                "Elige uno, varios o todos los capítulos",
                "Feedback inmediato por respuesta",
                'Botón "Explícamelo Yaris" siempre visible',
              ]}
              onStart={() => setPicker(q.code)}
              ctaLabel="Elegir capítulos →"
            />
          );
        })}
      </div>
    </div>
  );
}
