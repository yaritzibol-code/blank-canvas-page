export interface JeppesenFigure {
  number: number;
  file: string;
  alt: string;
}

export interface JeppesenChoiceSection {
  title: string;
  text: string;
  pages: number[];
  question: string;
  options: string[];
  answer: number;
  feedback: string;
  figure: number | null;
  kind: "choice";
  terms: string[];
  figure_note?: string;
}

export interface JeppesenMatchSection {
  title: string;
  text: string;
  pages: number[];
  question: string;
  options: [string, string][];
  answer: null;
  feedback: string;
  figure: number | null;
  kind: "match";
  terms: string[];
  figure_note?: string;
}

export interface JeppesenOrderSection {
  title: string;
  text: string;
  pages: number[];
  question: string;
  options: string[];
  answer: null;
  feedback: string;
  figure: number | null;
  kind: "order";
  terms: string[];
  figure_note?: string;
}

export type JeppesenSection = JeppesenChoiceSection | JeppesenMatchSection | JeppesenOrderSection;

export interface JeppesenLearningPathDocument {
  block: number;
  blockTitle: string;
  topic: number;
  title: string;
  subtitle: string;
  objective: string;
  sections: JeppesenSection[];
  checks: string[];
  minutes: number;
  sourceFiles: string[];
  figures: JeppesenFigure[];
}
