import documentsJson from "./documents.json";
import publicationReviewJson from "./publication-review.json";
import { APPROVED_TRANSIT_CATALOG, APPROVED_TRANSIT_ACTIVATION_IDS } from "./catalog";
import { usableDocument, type AircraftPublicationReview } from "../ciaac-aircraft-approved/content";
import type { HandbookLearningPathDocument } from "../handbook-types";

/** The shared structural gate is subject-neutral. Review remains ST-specific. */
export function collectReadyApprovedTransitDocuments(
  documents: Readonly<Record<string, HandbookLearningPathDocument>>,
  reviews: readonly AircraftPublicationReview[],
): Record<string, HandbookLearningPathDocument> {
  const ready: Record<string, HandbookLearningPathDocument> = {};
  for (const lesson of APPROVED_TRANSIT_CATALOG.lessons) {
    const document = documents?.[lesson.id];
    const matches = Array.isArray(reviews)
      ? reviews.filter((entry) => entry?.id === lesson.id)
      : [];
    const review = matches[0];
    if (
      matches.length !== 1 ||
      !document ||
      !review ||
      review.curriculumVersion !== APPROVED_TRANSIT_CATALOG.curriculumVersion ||
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

const reviewed = collectReadyApprovedTransitDocuments(
  documentsJson as Record<string, HandbookLearningPathDocument>,
  publicationReviewJson as AircraftPublicationReview[],
);

/** ST01 activates the complete seven-place outline; missing intermediate lessons
 * remain unavailable and retain the existing sequential progression locks. */
export const APPROVED_TRANSIT_ACTIVE = APPROVED_TRANSIT_ACTIVATION_IDS.every((id) => reviewed[id]);
export const APPROVED_TRANSIT_CONTENT = APPROVED_TRANSIT_ACTIVE ? reviewed : {};
export const APPROVED_TRANSIT_READY_IDS = Object.keys(APPROVED_TRANSIT_CONTENT);
