/** Public lesson content and bibliographic references. */
export interface CiaacCard {
  title: string;
  text: string;
  covers: number[];
  wide?: boolean;
}
export interface CiaacQuestion {
  prompt: string;
  options: string[];
  feedback: string;
  correct: number;
  order: number[];
  after?: number;
  chapter?: number;
  topic?: number;
}
export interface CiaacSubtopic {
  level: number;
  name: string;
  source_pdf_page: number | null;
  source_print_page: string;
  source_method: string;
}
export interface CiaacFigure {
  chapter: number;
  topic: number;
  anchor: number;
  pdf_page: number;
  number: string;
  file: string;
  observe: string;
  alt: string;
}
export type CiaacStage =
  | { kind: "intro"; nav: string }
  | { kind: "content"; nav: string; title: string; cards: CiaacCard[]; figures: CiaacFigure[] }
  | { kind: "quiz"; nav: string; questions: number[]; cards?: CiaacCard[] }
  | { kind: "exercise"; nav: string }
  | { kind: "finish"; nav: string };
export interface CiaacMatchExercise {
  kind: "match";
  title: string;
  instruction: string;
  pairs: [string, string][];
  order: number[];
}
export interface CiaacDocument {
  number: number;
  title: string;
  intro: string;
  cards: CiaacCard[];
  questions: CiaacQuestion[];
  tips: string[];
  chapter: number;
  chapter_name: string;
  name: string;
  subtopics: CiaacSubtopic[];
  source_pdf_page: number | null;
  source_print_page: string;
  figures: CiaacFigure[];
  exercise: CiaacMatchExercise | null;
  objectives: string[];
  minutes: number;
  stages: CiaacStage[];
}
export interface CiaacSource {
  title: string;
  url?: string;
  role: string;
  verified_locators?: string[];
  limit?: string;
}
export interface CiaacActivity {
  title: string;
  kind:
    | "true_false"
    | "fill_blank"
    | "multiple_choice"
    | "short_answer"
    | "match"
    | "classification"
    | "diagram_label"
    | "calculation"
    | "fill_table";
  instruction: string;
  items: string[];
  answer: string | string[];
  runtimeMapping: { questions?: number[]; exercise?: boolean };
}
export interface CiaacLessonContent {
  id: string;
  document: CiaacDocument;
  activities: CiaacActivity[];
  completionChecks: string[];
  sourceRefs: string[];
}
export interface CiaacModuleContent {
  formatVersion: "ciaac-module-content-1";
  language: "es-MX";
  course: "CIAAC";
  subject: "Aerodinámica";
  module: { number: number; name: string; id: string };
  sources: Record<string, CiaacSource>;
  lessons: CiaacLessonContent[];
}
