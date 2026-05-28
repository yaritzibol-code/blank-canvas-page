import type { ReactNode } from "react";
import type {
  TemaJSON,
  BlockSpec,
  PreflightCheckBlockData,
  ConceptExplanationBlockData,
  FormulaBlockData,
  HighlightNoteBlockData,
  ActiveRecallBlockData,
  ThinkLikePilotBlockData,
  DebriefBlockData,
  FlashcardsBlockData,
} from "./types";

import { HeaderBlock } from "./blocks/HeaderBlock";
import { PreflightCheckBlock } from "./blocks/PreflightCheckBlock";
import { ConceptExplanationBlock } from "./blocks/ConceptExplanationBlock";
import { FormulaBlock } from "./blocks/FormulaBlock";
import { HighlightNoteBlock } from "./blocks/HighlightNoteBlock";
import { ActiveRecallBlock } from "./blocks/ActiveRecallBlock";
import { ThinkLikePilotBlock } from "./blocks/ThinkLikePilotBlock";
import { DebriefBlock } from "./blocks/DebriefBlock";
import { FlashcardsBlock } from "./blocks/FlashcardsBlock";

export interface BlockRendererProps {
  tema: TemaJSON;
  /** 0–100 — progress percentage for this materia, injected by parent */
  progreso?: number;
  /** Called when student submits their difficulty rating in DebriefBlock */
  onComplete?: (dificultad: number) => void;
}

export function BlockRenderer({ tema, progreso = 0, onComplete }: BlockRendererProps) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <HeaderBlock
        title={tema.title}
        subtitle={tema.subtitle}
        materia={tema.materia}
        bloque={tema.bloque}
        tema={tema.tema}
        duracion_min={tema.duracion_min}
        progreso={progreso}
      />

      {tema.blocks.map((block, index) =>
        renderBlock(block, index, tema.id, onComplete)
      )}
    </div>
  );
}

function renderBlock(
  block: BlockSpec,
  index: number,
  temaId: string,
  onComplete?: (dificultad: number) => void
): ReactNode {
  const data = block.data;

  switch (block.type) {
    case "preflight_check":
      return (
        <PreflightCheckBlock
          key={index}
          {...(data as PreflightCheckBlockData)}
        />
      );

    case "concept_explanation":
      return (
        <ConceptExplanationBlock
          key={index}
          {...(data as ConceptExplanationBlockData)}
        />
      );

    case "formula_block":
      return (
        <FormulaBlock
          key={index}
          {...(data as FormulaBlockData)}
        />
      );

    case "highlight_note":
      return (
        <HighlightNoteBlock
          key={index}
          {...(data as HighlightNoteBlockData)}
        />
      );

    case "active_recall":
      return (
        <ActiveRecallBlock
          key={index}
          {...(data as ActiveRecallBlockData)}
        />
      );

    case "think_like_pilot":
      return (
        <ThinkLikePilotBlock
          key={index}
          {...(data as ThinkLikePilotBlockData)}
        />
      );

    case "debrief": {
      const d = data as Omit<DebriefBlockData, "tema_id" | "onComplete">;
      return (
        <DebriefBlock
          key={index}
          {...d}
          tema_id={temaId}
          onComplete={onComplete}
        />
      );
    }

    case "flashcards":
      return (
        <FlashcardsBlock
          key={index}
          {...(data as FlashcardsBlockData)}
        />
      );

    default:
      return (
        <div
          key={index}
          style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 20,
            fontSize: "0.85rem",
            color: "#856404",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ⚠️ Bloque desconocido:{" "}
          <code style={{ fontFamily: "monospace" }}>{block.type}</code> — verifica el JSON del
          tema.
        </div>
      );
  }
}
