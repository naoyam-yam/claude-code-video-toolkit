/**
 * Public question data structure (see docs/product/hokiru-web-spec.md).
 * rightsStatus is the gate: only original_ai_generated and user_supervised
 * may ever reach public UI, production seed data, or the LP.
 */
export type RightsStatus =
  | "original_ai_generated"
  | "user_supervised"
  | "third_party_restricted"
  | "internal_reference_only";

export type SupervisionStatus = "unsupervised" | "in_review" | "supervised";

export interface Question {
  questionId: string;
  qualification: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  choices: [string, string, string, string];
  correctChoice: 0 | 1 | 2 | 3;
  explanation: string;
  legalBasis: string;
  legalReference: string;
  sourceType: "ai_generated" | "human_authored" | "hybrid";
  rightsStatus: RightsStatus;
  supervisionStatus: SupervisionStatus;
  createdBy: string;
  reviewedBy: string | null;
  lastReviewedAt: string | null;
}

export const PUBLISHABLE_RIGHTS_STATUSES: readonly RightsStatus[] = [
  "original_ai_generated",
  "user_supervised",
];
