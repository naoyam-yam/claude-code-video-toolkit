import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCHEDULER_CONFIG,
  isDue,
  scheduleNextReview,
  sortReviewQueue,
  type ReviewState,
} from "../../lib/review/scheduler";

const now = new Date("2026-07-02T00:00:00.000Z");

const freshState: ReviewState = {
  intervalDays: 4,
  consecutiveFailures: 0,
  lastAnsweredAt: "2026-06-28T00:00:00.000Z",
};

describe("scheduleNextReview", () => {
  it("widens the interval on a correct + confident answer", () => {
    const result = scheduleNextReview(
      freshState,
      { correct: true, confidence: "confident", answerDurationMs: 3000 },
      now
    );
    expect(result.intervalDays).toBeCloseTo(4 * DEFAULT_SCHEDULER_CONFIG.confidentGrowthFactor);
    expect(result.consecutiveFailures).toBe(0);
  });

  it("widens the interval less on a correct + unsure answer", () => {
    const result = scheduleNextReview(
      freshState,
      { correct: true, confidence: "unsure", answerDurationMs: 3000 },
      now
    );
    expect(result.intervalDays).toBeCloseTo(4 * DEFAULT_SCHEDULER_CONFIG.unsureGrowthFactor);
  });

  it("resets to a short interval on an incorrect answer and bumps consecutiveFailures", () => {
    const result = scheduleNextReview(
      freshState,
      { correct: false, confidence: "confident", answerDurationMs: 3000 },
      now
    );
    expect(result.intervalDays).toBe(DEFAULT_SCHEDULER_CONFIG.failureIntervalDays);
    expect(result.consecutiveFailures).toBe(1);
  });

  it("compounds consecutiveFailures across repeated misses", () => {
    const afterOne = scheduleNextReview(
      freshState,
      { correct: false, confidence: "confident", answerDurationMs: 3000 },
      now
    );
    const afterTwo = scheduleNextReview(
      { ...freshState, consecutiveFailures: afterOne.consecutiveFailures },
      { correct: false, confidence: "confident", answerDurationMs: 3000 },
      now
    );
    expect(afterTwo.consecutiveFailures).toBe(2);
    expect(afterTwo.priorityScore).toBeGreaterThan(afterOne.priorityScore);
  });

  it("treats a slow 'confident' answer as unsure (long duration downgrades confidence)", () => {
    const slowConfident = scheduleNextReview(
      freshState,
      { correct: true, confidence: "confident", answerDurationMs: 25_000 },
      now
    );
    const unsure = scheduleNextReview(
      freshState,
      { correct: true, confidence: "unsure", answerDurationMs: 25_000 },
      now
    );
    expect(slowConfident.intervalDays).toBeCloseTo(unsure.intervalDays);
  });

  it("clamps interval to maxIntervalDays", () => {
    const result = scheduleNextReview(
      { intervalDays: 80, consecutiveFailures: 0, lastAnsweredAt: freshState.lastAnsweredAt },
      { correct: true, confidence: "confident", answerDurationMs: 1000 },
      now
    );
    expect(result.intervalDays).toBe(DEFAULT_SCHEDULER_CONFIG.maxIntervalDays);
  });

  it("clamps interval to minIntervalDays", () => {
    const result = scheduleNextReview(
      { intervalDays: 0.1, consecutiveFailures: 0, lastAnsweredAt: freshState.lastAnsweredAt },
      { correct: true, confidence: "unsure", answerDurationMs: 1000 },
      now
    );
    expect(result.intervalDays).toBeGreaterThanOrEqual(DEFAULT_SCHEDULER_CONFIG.minIntervalDays);
  });
});

describe("sortReviewQueue", () => {
  it("orders by priorityScore descending, then by earliest due date", () => {
    const items = [
      { questionId: "a", nextReviewAt: "2026-07-05T00:00:00.000Z", priorityScore: 5 },
      { questionId: "b", nextReviewAt: "2026-07-01T00:00:00.000Z", priorityScore: 10 },
      { questionId: "c", nextReviewAt: "2026-07-02T00:00:00.000Z", priorityScore: 10 },
    ];
    const sorted = sortReviewQueue(items);
    expect(sorted.map((i) => i.questionId)).toEqual(["b", "c", "a"]);
  });
});

describe("isDue", () => {
  it("is true when nextReviewAt is in the past", () => {
    expect(isDue({ questionId: "a", nextReviewAt: "2026-07-01T00:00:00.000Z", priorityScore: 0 }, now)).toBe(true);
  });

  it("is false when nextReviewAt is in the future", () => {
    expect(isDue({ questionId: "a", nextReviewAt: "2026-08-01T00:00:00.000Z", priorityScore: 0 }, now)).toBe(false);
  });
});
