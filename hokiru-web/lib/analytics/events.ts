/**
 * Minimal typed event log. No third-party analytics wired up at MVP stage —
 * this just gives callers a stable shape to write to (local storage today,
 * Supabase table later) without an abstraction they don't need yet.
 */

export type AnalyticsEvent =
  | { type: "question_answered"; questionId: string; correct: boolean; durationMs: number }
  | { type: "review_started"; queueSize: number }
  | { type: "review_completed"; reviewedCount: number };

export function logEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  console.debug("[analytics]", event);
}
