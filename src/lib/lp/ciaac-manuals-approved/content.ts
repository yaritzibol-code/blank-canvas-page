import documentsJson from "./documents.json";
import publicationReviewJson from "./publication-review.json";
import { APPROVED_MANUALS_CATALOG, APPROVED_MANUALS_ACTIVATION_IDS } from "./catalog";
import { usableDocument, type AircraftPublicationReview } from "../ciaac-aircraft-approved/content";
import type { HandbookLearningPathDocument } from "../handbook-types";

/** The shared structural gate is subject-neutral. Review remains MI-specific. */
export function collectReadyApprovedManualsDocuments(
  documents: Readonly<Record<string, HandbookLearningPathDocument>>,
  reviews: readonly AircraftPublicationReview[],
): Record<string, HandbookLearningPathDocument> {
  const ready: Record<string, HandbookLearningPathDocument> = {};
  for (const lesson of APPROVED_MANUALS_CATALOG.lessons) {
    const document = documents?.[lesson.id];
    const matches = Array.isArray(reviews)
      ? reviews.filter((entry) => entry?.id === lesson.id)
      : [];
    const review = matches[0];
    if (
      matches.length !== 1 ||
      !document ||
      !review ||
      review.curriculumVersion !== APPROVED_MANUALS_CATALOG.curriculumVersion ||
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

const reviewed = collectReadyApprovedManualsDocuments(
  documentsJson as Record<string, HandbookLearningPathDocument>,
  publicationReviewJson as AircraftPublicationReview[],
);

/** MI01 activates the ten-lesson outline. Each lesson remains independently
 * gated by its reviewed document and the existing sequential progression locks. */
export const APPROVED_MANUALS_ACTIVE = APPROVED_MANUALS_ACTIVATION_IDS.every((id) => reviewed[id]);
export const APPROVED_MANUALS_CONTENT = APPROVED_MANUALS_ACTIVE ? reviewed : {};
export const APPROVED_MANUALS_READY_IDS = Object.keys(APPROVED_MANUALS_CONTENT);
