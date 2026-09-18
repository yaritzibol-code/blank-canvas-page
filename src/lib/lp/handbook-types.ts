export interface HandbookCard {
  title: string;
  text: string;
  covers: number[];
  wide?: boolean;
}

export interface HandbookQuestion {
  prompt: string;
  options: string[];
  feedback: string;
  correct: number;
  order: number[];
  after?: number;
  chapter?: number;
  topic?: number;
}

export interface HandbookFigure {
  chapter: number;
  topic: number;
  anchor: number;
  pdf_page: number;
  number: string;
  file: string;
  observe: string;
  alt: string;
}

export interface HandbookSubtopic {
  level: number;
  name: string;
  source_pdf_page: number;
  source_print_page: string;
  source_method: string;
}

export interface HandbookIntroStage {
  kind: "intro";
  nav: string;
}

export interface HandbookContentStage {
  kind: "content";
  nav: string;
  title: string;
  cards: HandbookCard[];
  figures: HandbookFigure[];
}

export interface HandbookQuizStage {
  kind: "quiz";
  nav: string;
  questions: number[];
  cards?: HandbookCard[];
}

export interface HandbookExerciseStage {
  kind: "exercise";
  nav: string;
}

export interface HandbookFinishStage {
  kind: "finish";
  nav: string;
}

export type HandbookStage =
  | HandbookIntroStage
  | HandbookContentStage
  | HandbookQuizStage
  | HandbookExerciseStage
  | HandbookFinishStage;

interface HandbookExerciseBase {
  title: string;
  instruction: string;
}

export interface HandbookMatchExercise extends HandbookExerciseBase {
  kind: "match";
  pairs: [string, string][];
  order: number[];
}

export interface HandbookSequenceExercise extends HandbookExerciseBase {
  kind: "sequence";
  items: string[];
  order: number[];
}

export interface HandbookLabExercise extends HandbookExerciseBase {
  kind:
    "axes" | "load" | "turn" | "radius" | "pitot" | "balance" | "metar" | "papi" | "wind" | "fuel";
}

export type HandbookExercise =
  HandbookMatchExercise | HandbookSequenceExercise | HandbookLabExercise;

export interface HandbookLearningPathDocument {
  number: number;
  title: string;
  intro: string;
  cards: HandbookCard[];
  questions: HandbookQuestion[];
  tips: string[];
  chapter: number;
  chapter_name: string;
  name: string;
  subtopics: HandbookSubtopic[];
  source_pdf_page: number;
  source_print_page: string;
  figures: HandbookFigure[];
  exercise: HandbookExercise | null;
  objectives: string[];
  minutes: number;
  stages: HandbookStage[];
}
