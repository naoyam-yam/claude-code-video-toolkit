import { describe, expect, it } from "vitest";
import { canPublishQuestion, filterPublishable } from "../../lib/rights/canPublishQuestion";
import { originalSampleQuestions } from "../../data/seed/original-sample-questions";
import type { Question, RightsStatus, SupervisionStatus } from "../../lib/questions/schema";

const baseQuestion: Question = {
  questionId: "q1",
  qualification: "ikkyu-kenchikushi",
  subject: "建築基準法",
  topic: "容積率",
  difficulty: "medium",
  questionText: "test",
  choices: ["a", "b", "c", "d"],
  correctChoice: 0,
  explanation: "test",
  legalBasis: "建築基準法第52条",
  legalReference: "建築基準法第52条",
  sourceType: "ai_generated",
  rightsStatus: "original_ai_generated",
  supervisionStatus: "supervised",
  createdBy: "test",
  reviewedBy: "architect-1",
  lastReviewedAt: "2026-06-01T00:00:00.000Z",
};

describe("canPublishQuestion", () => {
  it("publishes a fully-supervised original_ai_generated question", () => {
    expect(canPublishQuestion(baseQuestion).canPublish).toBe(true);
  });

  it("publishes a fully-supervised user_supervised question", () => {
    expect(canPublishQuestion({ ...baseQuestion, rightsStatus: "user_supervised" }).canPublish).toBe(true);
  });

  it.each(["third_party_restricted", "internal_reference_only"] as const)(
    "rejects %s regardless of supervision status",
    (rightsStatus) => {
      const decision = canPublishQuestion({ ...baseQuestion, rightsStatus });
      expect(decision.canPublish).toBe(false);
      expect(decision.reasons.join(" ")).toContain("not publishable");
    }
  );

  it("rejects an unsupervised question even with allowed rightsStatus", () => {
    const decision = canPublishQuestion({ ...baseQuestion, supervisionStatus: "unsupervised", reviewedBy: null, lastReviewedAt: null });
    expect(decision.canPublish).toBe(false);
  });

  it("rejects a question missing legal basis", () => {
    const decision = canPublishQuestion({ ...baseQuestion, legalBasis: "", legalReference: "" });
    expect(decision.canPublish).toBe(false);
  });

  it("rejects a question missing review metadata", () => {
    const decision = canPublishQuestion({ ...baseQuestion, reviewedBy: null, lastReviewedAt: null });
    expect(decision.canPublish).toBe(false);
  });
});

const ALL_RIGHTS_STATUSES: RightsStatus[] = [
  "original_ai_generated",
  "user_supervised",
  "third_party_restricted",
  "internal_reference_only",
];
const ALL_SUPERVISION_STATUSES: SupervisionStatus[] = ["unsupervised", "in_review", "supervised"];

describe("canPublishQuestion — full rightsStatus x supervisionStatus matrix", () => {
  const matrix = ALL_RIGHTS_STATUSES.flatMap((rightsStatus) =>
    ALL_SUPERVISION_STATUSES.map((supervisionStatus) => ({ rightsStatus, supervisionStatus }))
  );

  it.each(matrix)(
    "rightsStatus=$rightsStatus, supervisionStatus=$supervisionStatus",
    ({ rightsStatus, supervisionStatus }) => {
      const question: Question = { ...baseQuestion, rightsStatus, supervisionStatus };
      const expected = rightsStatus !== "third_party_restricted" && rightsStatus !== "internal_reference_only" && supervisionStatus === "supervised";
      expect(canPublishQuestion(question).canPublish).toBe(expected);
    }
  );
});

describe("filterPublishable", () => {
  it("excludes internal_reference_only seed data from the publishable set", () => {
    const publishable = filterPublishable(originalSampleQuestions);
    expect(publishable.some((q) => q.rightsStatus === "internal_reference_only")).toBe(false);
    expect(publishable.some((q) => q.rightsStatus === "third_party_restricted")).toBe(false);
  });

  it("the unsupervised seed questions are not yet publishable (awaiting 一級建築士 review)", () => {
    // This documents current seed state: sample questions ship as drafts,
    // not as claims of completed supervision.
    const publishable = filterPublishable(originalSampleQuestions);
    expect(publishable.length).toBe(0);
  });
});
