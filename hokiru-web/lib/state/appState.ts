/**
 * Thin glue between the pure lib/ functions (scheduler, progress) and
 * anonymous local storage. Colocated here because every page (home,
 * practice, review, analysis) needs the same read/record operations —
 * duplicating this per-page would be the actual complexity increase.
 */
import { getSeedQuestions } from "../questions/seed";
import { readLocal, writeLocal } from "../storage/localStore";
import {
  scheduleNextReview,
  isDue,
  sortReviewQueue,
  type Confidence,
  type ReviewState,
} from "../review/scheduler";
import type { AnswerLogEntry } from "../progress/calculateProgress";
import type { Question } from "../questions/schema";

export interface AppSettings {
  examDate: string | null;
  pace: "slow" | "standard" | "fast";
  defaultIntervalDays: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  examDate: null,
  pace: "standard",
  defaultIntervalDays: 1,
};

const KEYS = {
  answerLog: "answer-log",
  reviewState: "review-state",
  settings: "settings",
} as const;

export function getAllQuestions(): Question[] {
  return getSeedQuestions();
}

export function getSettings(): AppSettings {
  return readLocal(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  writeLocal(KEYS.settings, settings);
}

export function getAnswerLog(): AnswerLogEntry[] {
  return readLocal(KEYS.answerLog, []);
}

export function getReviewStates(): Record<string, ReviewState> {
  return readLocal(KEYS.reviewState, {});
}

export function recordAnswer(
  question: Question,
  choiceIndex: number,
  confidence: Confidence,
  durationMs: number,
  now: Date = new Date()
): { correct: boolean } {
  const correct = choiceIndex === question.correctChoice;

  const log = getAnswerLog();
  const reviewStates = getReviewStates();
  const isReview = !!reviewStates[question.questionId];

  const priorState: ReviewState = reviewStates[question.questionId] ?? {
    intervalDays: getSettings().defaultIntervalDays,
    consecutiveFailures: 0,
    lastAnsweredAt: now.toISOString(),
  };

  const result = scheduleNextReview(priorState, { correct, confidence, answerDurationMs: durationMs }, now);

  writeLocal(KEYS.answerLog, [
    ...log,
    { questionId: question.questionId, topic: question.topic, correct, answeredAt: now.toISOString(), isReview },
  ]);

  writeLocal(KEYS.reviewState, {
    ...reviewStates,
    [question.questionId]: {
      intervalDays: result.intervalDays,
      consecutiveFailures: result.consecutiveFailures,
      lastAnsweredAt: now.toISOString(),
    },
  });

  return { correct };
}

export interface DueReviewEntry {
  questionId: string;
  topic: string;
  nextReviewAt: string;
  lastAnsweredAt: string | null;
  consecutiveFailures: number;
  priorityScore: number;
}

function deriveNextReviewAt(state: ReviewState): string {
  return new Date(
    new Date(state.lastAnsweredAt).getTime() + state.intervalDays * 24 * 60 * 60 * 1000
  ).toISOString();
}

export function getDueReviewQueue(now: Date = new Date()): DueReviewEntry[] {
  const reviewStates = getReviewStates();
  const questions = getAllQuestions();

  const items: DueReviewEntry[] = Object.entries(reviewStates).map(([questionId, state]) => {
    const question = questions.find((q) => q.questionId === questionId);
    const nextReviewAt = deriveNextReviewAt(state);
    return {
      questionId,
      topic: question?.topic ?? "不明",
      nextReviewAt,
      lastAnsweredAt: state.lastAnsweredAt,
      consecutiveFailures: state.consecutiveFailures,
      priorityScore: state.consecutiveFailures * 10 + 1 / state.intervalDays,
    };
  });

  const due = items.filter((item) =>
    isDue({ questionId: item.questionId, nextReviewAt: item.nextReviewAt, priorityScore: item.priorityScore }, now)
  );

  return sortReviewQueue(due);
}

/** Due review first, then the first never-answered question, else the least-recently answered one. */
export function getNextQuestionId(now: Date = new Date()): string | null {
  const due = getDueReviewQueue(now);
  if (due.length > 0) return due[0]!.questionId;

  const reviewStates = getReviewStates();
  const questions = getAllQuestions();

  const unanswered = questions.find((q) => !reviewStates[q.questionId]);
  if (unanswered) return unanswered.questionId;

  const entries = Object.entries(reviewStates);
  if (entries.length === 0) return questions[0]?.questionId ?? null;

  entries.sort((a, b) => new Date(a[1].lastAnsweredAt).getTime() - new Date(b[1].lastAnsweredAt).getTime());
  return entries[0]?.[0] ?? null;
}
