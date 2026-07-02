import { describe, expect, it } from "vitest";
import { originalSampleQuestions } from "../../data/seed/original-sample-questions";
import { PUBLISHABLE_RIGHTS_STATUSES } from "../../lib/questions/schema";

/**
 * Question Quality DoD: "サンプル問題6問すべてに法令根拠が入っている" turns out to be
 * scoped to publish-candidate questions only — the one internal_reference_only row
 * is an intentional analysis-only placeholder ("N/A" legalBasis by design, see
 * data/internal/README.md's isolation rules), not a quality gap. This test makes
 * that scope explicit and machine-checked instead of relying on manual inspection.
 */
describe("seed data quality — legal basis completeness", () => {
  const publishCandidates = originalSampleQuestions.filter((q) =>
    PUBLISHABLE_RIGHTS_STATUSES.includes(q.rightsStatus)
  );

  it("has at least one publish-candidate question to check", () => {
    expect(publishCandidates.length).toBeGreaterThan(0);
  });

  it.each(publishCandidates.map((q) => [q.questionId, q] as const))(
    "%s has a non-empty legalBasis and legalReference",
    (_id, question) => {
      expect(question.legalBasis.trim().length).toBeGreaterThan(0);
      expect(question.legalReference.trim().length).toBeGreaterThan(0);
      expect(question.legalBasis).not.toBe("N/A");
      expect(question.legalReference).not.toBe("N/A");
    }
  );

  it("internal_reference_only rows are excluded from this check by design (not a quality gap)", () => {
    const internalOnly = originalSampleQuestions.filter(
      (q) => !PUBLISHABLE_RIGHTS_STATUSES.includes(q.rightsStatus)
    );
    expect(internalOnly.every((q) => q.rightsStatus === "third_party_restricted" || q.rightsStatus === "internal_reference_only")).toBe(true);
  });
});
