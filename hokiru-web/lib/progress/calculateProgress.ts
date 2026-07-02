/**
 * Pure aggregation of learning logs into the numbers the 分析 (analysis)
 * screen shows. No narrative/AI commentary is generated here by design
 * (事前決定メモ: "装飾的なインサイト文や過剰なAIコメントを出さない").
 */

export interface AnswerLogEntry {
  questionId: string;
  topic: string;
  correct: boolean;
  answeredAt: string; // ISO 8601
  isReview: boolean;
}

export interface TopicAccuracy {
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number;
}

export interface ProgressSummary {
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number;
  topicAccuracy: TopicAccuracy[];
  weakTopics: string[];
  reCorrectRate: number | null;
  streakDays: number;
}

const WEAK_TOPIC_ACCURACY_THRESHOLD = 0.6;
const WEAK_TOPIC_MIN_ATTEMPTS = 3;

export function calculateTopicAccuracy(logs: AnswerLogEntry[]): TopicAccuracy[] {
  const byTopic = new Map<string, { attempts: number; correct: number }>();
  for (const log of logs) {
    const bucket = byTopic.get(log.topic) ?? { attempts: 0, correct: 0 };
    bucket.attempts += 1;
    if (log.correct) bucket.correct += 1;
    byTopic.set(log.topic, bucket);
  }
  return [...byTopic.entries()].map(([topic, { attempts, correct }]) => ({
    topic,
    attempts,
    correct,
    accuracy: attempts === 0 ? 0 : correct / attempts,
  }));
}

export function calculateReCorrectRate(logs: AnswerLogEntry[]): number | null {
  const reviewLogs = logs.filter((l) => l.isReview);
  if (reviewLogs.length === 0) return null;
  const correct = reviewLogs.filter((l) => l.correct).length;
  return correct / reviewLogs.length;
}

export function calculateStreakDays(logs: AnswerLogEntry[], now: Date): number {
  if (logs.length === 0) return 0;
  const days = new Set(logs.map((l) => l.answeredAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculateProgress(logs: AnswerLogEntry[], now: Date = new Date()): ProgressSummary {
  const topicAccuracy = calculateTopicAccuracy(logs);
  const totalAttempts = logs.length;
  const totalCorrect = logs.filter((l) => l.correct).length;

  const weakTopics = topicAccuracy
    .filter((t) => t.attempts >= WEAK_TOPIC_MIN_ATTEMPTS && t.accuracy < WEAK_TOPIC_ACCURACY_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((t) => t.topic);

  return {
    totalAttempts,
    totalCorrect,
    overallAccuracy: totalAttempts === 0 ? 0 : totalCorrect / totalAttempts,
    topicAccuracy,
    weakTopics,
    reCorrectRate: calculateReCorrectRate(logs),
    streakDays: calculateStreakDays(logs, now),
  };
}
