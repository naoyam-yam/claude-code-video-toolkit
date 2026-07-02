import { PUBLISHABLE_RIGHTS_STATUSES, type Question } from "../questions/schema";

export interface PublishDecision {
  canPublish: boolean;
  reasons: string[];
}

/**
 * The single rights gate. third_party_restricted and internal_reference_only
 * must never reach public UI, production seed, or the LP — this is the only
 * function allowed to make that call, so every caller (UI, seed scripts,
 * nightly run) goes through the same rule.
 */
export function canPublishQuestion(question: Question): PublishDecision {
  const reasons: string[] = [];

  if (!PUBLISHABLE_RIGHTS_STATUSES.includes(question.rightsStatus)) {
    reasons.push(
      `rightsStatus "${question.rightsStatus}" is not publishable (allowed: ${PUBLISHABLE_RIGHTS_STATUSES.join(", ")})`
    );
  }

  if (question.supervisionStatus !== "supervised") {
    reasons.push(
      `supervisionStatus is "${question.supervisionStatus}", must be "supervised"`
    );
  }

  if (!question.legalBasis || !question.legalReference) {
    reasons.push("missing legalBasis or legalReference");
  }

  if (!question.reviewedBy || !question.lastReviewedAt) {
    reasons.push("missing reviewedBy or lastReviewedAt");
  }

  return { canPublish: reasons.length === 0, reasons };
}

export function filterPublishable(questions: Question[]): Question[] {
  return questions.filter((q) => canPublishQuestion(q).canPublish);
}
