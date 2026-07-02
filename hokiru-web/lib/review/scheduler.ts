/**
 * Pure, deterministic review scheduler. Deliberately simple (no ML/AI
 * forecasting) per HOKIRU 事前決定メモ: "初期は精密な予測ではなく、復習最適化の推定として扱う".
 * Replace the interval math later without touching callers — the function
 * signature is the contract.
 */

export type Confidence = "confident" | "unsure";

export interface ReviewState {
  intervalDays: number;
  consecutiveFailures: number;
  lastAnsweredAt: string; // ISO 8601
}

export interface AnswerEvent {
  correct: boolean;
  confidence: Confidence;
  answerDurationMs: number;
}

export interface SchedulerConfig {
  /** Above this duration, treat a "confident" answer as "unsure". */
  longAnswerThresholdMs: number;
  minIntervalDays: number;
  maxIntervalDays: number;
  /** Multiplier applied on a correct + confident answer. */
  confidentGrowthFactor: number;
  /** Multiplier applied on a correct + unsure answer. */
  unsureGrowthFactor: number;
  /** Interval (days) an incorrect answer resets to. */
  failureIntervalDays: number;
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  longAnswerThresholdMs: 20_000,
  minIntervalDays: 1,
  maxIntervalDays: 90,
  confidentGrowthFactor: 2.5,
  unsureGrowthFactor: 1.3,
  failureIntervalDays: 1,
};

export interface ScheduleResult {
  intervalDays: number;
  consecutiveFailures: number;
  nextReviewAt: string; // ISO 8601
  /** Higher = more urgent. Used to sort the review queue. */
  priorityScore: number;
}

function effectiveConfidence(answer: AnswerEvent, config: SchedulerConfig): Confidence {
  if (answer.confidence === "confident" && answer.answerDurationMs > config.longAnswerThresholdMs) {
    return "unsure";
  }
  return answer.confidence;
}

export function scheduleNextReview(
  state: ReviewState,
  answer: AnswerEvent,
  now: Date,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): ScheduleResult {
  let intervalDays: number;
  let consecutiveFailures: number;

  if (!answer.correct) {
    intervalDays = config.failureIntervalDays;
    consecutiveFailures = state.consecutiveFailures + 1;
  } else {
    const confidence = effectiveConfidence(answer, config);
    const growth =
      confidence === "confident" ? config.confidentGrowthFactor : config.unsureGrowthFactor;
    intervalDays = state.intervalDays * growth;
    consecutiveFailures = 0;
  }

  intervalDays = Math.min(config.maxIntervalDays, Math.max(config.minIntervalDays, intervalDays));

  const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  // Repeated failures raise urgency independent of the interval, so a
  // frequently-missed topic still surfaces even before its interval elapses.
  const priorityScore = consecutiveFailures * 10 + 1 / intervalDays;

  return { intervalDays, consecutiveFailures, nextReviewAt, priorityScore };
}

export interface QueueItem {
  questionId: string;
  nextReviewAt: string;
  priorityScore: number;
}

/** Highest priority first; ties broken by earliest due date. */
export function sortReviewQueue<T extends QueueItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
  });
}

export function isDue(item: QueueItem, now: Date): boolean {
  return new Date(item.nextReviewAt).getTime() <= now.getTime();
}
