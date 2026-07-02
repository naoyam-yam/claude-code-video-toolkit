import { describe, expect, it } from "vitest";
import {
  calculateProgress,
  calculateReCorrectRate,
  calculateStreakDays,
  calculateTopicAccuracy,
  type AnswerLogEntry,
} from "../../lib/progress/calculateProgress";

const logs: AnswerLogEntry[] = [
  { questionId: "1", topic: "容積率", correct: true, answeredAt: "2026-06-30T09:00:00.000Z", isReview: false },
  { questionId: "2", topic: "容積率", correct: false, answeredAt: "2026-06-30T09:05:00.000Z", isReview: false },
  { questionId: "3", topic: "容積率", correct: false, answeredAt: "2026-07-01T09:00:00.000Z", isReview: false },
  { questionId: "1", topic: "容積率", correct: true, answeredAt: "2026-07-01T09:10:00.000Z", isReview: true },
  { questionId: "4", topic: "避難規定", correct: true, answeredAt: "2026-07-02T09:00:00.000Z", isReview: false },
];

describe("calculateTopicAccuracy", () => {
  it("aggregates attempts and accuracy per topic", () => {
    const result = calculateTopicAccuracy(logs);
    const capacity = result.find((t) => t.topic === "容積率");
    expect(capacity?.attempts).toBe(4);
    expect(capacity?.correct).toBe(2);
    expect(capacity?.accuracy).toBeCloseTo(0.5);
  });
});

describe("calculateReCorrectRate", () => {
  it("computes accuracy across review-only attempts", () => {
    expect(calculateReCorrectRate(logs)).toBe(1);
  });

  it("returns null when there are no review attempts", () => {
    expect(calculateReCorrectRate(logs.filter((l) => !l.isReview))).toBeNull();
  });
});

describe("calculateStreakDays", () => {
  it("counts consecutive days up to and including `now`", () => {
    const now = new Date("2026-07-02T12:00:00.000Z");
    expect(calculateStreakDays(logs, now)).toBe(3);
  });

  it("returns 0 when there is no activity today", () => {
    const now = new Date("2026-07-05T12:00:00.000Z");
    expect(calculateStreakDays(logs, now)).toBe(0);
  });
});

describe("calculateProgress", () => {
  it("flags topics below the weak-topic accuracy threshold with enough attempts", () => {
    const now = new Date("2026-07-02T12:00:00.000Z");
    const summary = calculateProgress(logs, now);
    expect(summary.weakTopics).toContain("容積率");
    expect(summary.totalAttempts).toBe(5);
    expect(summary.overallAccuracy).toBeCloseTo(3 / 5);
  });

  it("does not flag a topic with too few attempts even at low accuracy", () => {
    const now = new Date("2026-07-02T12:00:00.000Z");
    const summary = calculateProgress(
      logs.filter((l) => l.topic === "避難規定"),
      now
    );
    expect(summary.weakTopics).not.toContain("避難規定");
  });
});
