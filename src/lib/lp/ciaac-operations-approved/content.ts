import documentsJson from "./documents.json";
import publicationReviewJson from "./publication-review.json";
import { APPROVED_OPERATIONS_CATALOG, APPROVED_OPERATIONS_ACTIVATION_IDS } from "./catalog";
import { usableDocument, type AircraftPublicationReview } from "../ciaac-aircraft-approved/content";
import type { HandbookLearningPathDocument } from "../handbook-types";

/** The shared structural gate is subject-neutral. Review remains OP-specific. */
export function collectReadyApprovedOperationsDocuments(
  documents: Readonly<Record<string, HandbookLearningPathDocument>>,
  reviews: readonly AircraftPublicationReview[],
): Record<string, HandbookLearningPathDocument> {
  const ready: Record<string, HandbookLearningPathDocument> = {};
  for (const lesson of APPROVED_OPERATIONS_CATALOG.lessons) {
    const document = documents?.[lesson.id];
    const matches = Array.isArray(reviews)
      ? reviews.filter((entry) => entry?.id === lesson.id)
      : [];
    const review = matches[0];
    if (
      matches.length !== 1 ||
      !document ||
      !review ||
      review.curriculumVersion !== APPROVED_OPERATIONS_CATALOG.curriculumVersion ||
      !/^[a-f0-9]{64}$/.test(review.notebooklmExplanationSha256) ||
      review.scopeReviewed !== true ||
      review.visualsReviewed !== true ||
      review.assessmentReviewed !== true ||
      !usableDocument(document, lesson.title)
    )
      continue;
    ready[lesson.id] = document;
  }
  return ready;
}

const reviewed = collectReadyApprovedOperationsDocuments(
  documentsJson as Record<string, HandbookLearningPathDocument>,
  publicationReviewJson as AircraftPublicationReview[],
);

/** OP01 activates the mapped outline only. Missing lessons remain unavailable. Each lesson remains independently
 * gated by its reviewed document and the existing sequential progression locks. */
export const APPROVED_OPERATIONS_ACTIVE = APPROVED_OPERATIONS_ACTIVATION_IDS.every(
  (id) => reviewed[id],
);
export const APPROVED_OPERATIONS_CONTENT = APPROVED_OPERATIONS_ACTIVE ? reviewed : {};
export const APPROVED_OPERATIONS_READY_IDS = Object.keys(APPROVED_OPERATIONS_CONTENT);
