export interface AtpLessonMeta {
  chapter_number: number;
  chapter_name: string;
  topic_number: number;
  topic_name: string;
  html_file: string;
  folder: string;
  source_start: number;
  source_end: number;
  relative_path: string;
}

export interface AtpQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface AtpCard {
  title: string;
  body: string;
  dark?: boolean;
}

export interface AtpExploreCard {
  title: string;
  body: string;
  dark?: boolean;
}

export interface AtpTable {
  headers: string[];
  rows: (string | number)[][];
}

export interface AtpFigure {
  file: string;
  alt: string;
  caption: string;
}

export interface AtpLessonStep {
  name: string;
  title: string;
  lead?: string;
  cards: AtpCard[];
  questions: AtpQuestion[];
  table?: AtpTable;
  figure?: AtpFigure;
  explore?: AtpExploreCard[];
  note?: string;
}

export interface AtpLearningPathContent {
  subtitle: string;
  intro: string;
  introExplore?: AtpExploreCard[];
  steps: AtpLessonStep[];
  takeaways: string[];
  source: string;
  excluded: string;
  depth: string;
}

export interface AtpLearningPathDocument {
  meta: AtpLessonMeta;
  content: AtpLearningPathContent;
  figures: Record<string, string>;
}
