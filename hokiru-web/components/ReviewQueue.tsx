import Link from "next/link";
import { TopicBadge } from "./TopicBadge";

export interface ReviewQueueEntry {
  questionId: string;
  topic: string;
  nextReviewAt: string;
  lastAnsweredAt: string | null;
  consecutiveFailures: number;
  priorityScore: number;
}

export function ReviewQueue({ entries }: { entries: ReviewQueueEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-muted">
        今日復習すべき問題はありません。演習を進めて復習キューを育てましょう。
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.questionId} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <TopicBadge topic={entry.topic} />
            {entry.consecutiveFailures > 0 && (
              <span className="text-xs text-red-600">連続失敗 {entry.consecutiveFailures} 回</span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted">
            最終回答日: {entry.lastAnsweredAt ? entry.lastAnsweredAt.slice(0, 10) : "未回答"}
          </div>
          <div className="text-xs text-muted">
            次回復習推奨日: {entry.nextReviewAt.slice(0, 10)}
          </div>
          <Link
            href={`/practice?questionId=${entry.questionId}`}
            className="mt-2 inline-block text-sm font-medium text-accent"
          >
            この問題を復習する →
          </Link>
        </li>
      ))}
    </ul>
  );
}
