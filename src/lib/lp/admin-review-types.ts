import type { HandbookLearningPathDocument } from "./handbook-types";

export type ReviewRenderer =
  | "handbook"
  | "aircraft"
  | "module-one"
  | "aerodynamics"
  | "approved-aircraft"
  | "aircraft-engines";
export interface ReviewItem {
  id: string;
  title: string;
  category: string;
  subject: string;
  chapter: string;
  renderer: ReviewRenderer;
}
export interface ReviewPayload {
  items: ReviewItem[];
  selected: { item: ReviewItem; document: HandbookLearningPathDocument } | null;
}
