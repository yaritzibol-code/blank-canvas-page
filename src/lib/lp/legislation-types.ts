export interface LegislationQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
  wrong?: string;
}

export interface LegislationStep {
  label: string;
  title: string;
  body: string;
  refs?: string[];
  guide?: string;
  hero?: boolean;
  final?: boolean;
  cards?: [string, string][];
  questions?: LegislationQuestion[];
  match?: [string, string][];
  order?: string[];
  memory?: { visual: string; text: string };
  recall?: [string, string][];
  recap?: [string, string][];
  timeline?: boolean;
  annex?: number[];
  challenge?: number;
}

export interface LegislationCourse {
  id: string;
  folder: string;
  name: string;
  subtitle: string;
  year: string;
  word: string;
  sources: string[];
  steps: LegislationStep[];
}

export interface LegislationAnnex {
  n: number;
  name: string;
  theme: string;
  about: string;
  visual: string;
  memory: string;
  scenario: string;
}
