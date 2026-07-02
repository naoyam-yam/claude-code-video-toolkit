import type { TopicAccuracy } from "../lib/progress/calculateProgress";
import { TopicBadge } from "./TopicBadge";

export function ProgressSummary({
  topicAccuracy,
  reCorrectRate,
  weakTopics,
}: {
  topicAccuracy: TopicAccuracy[];
  reCorrectRate: number | null;
  weakTopics: string[];
}) {
  if (topicAccuracy.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-muted">
        まだ分析できる学習記録がありません。演習を進めると論点別の傾向が表示されます。
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-medium text-ink">論点別正答率</div>
      <ul className="mt-3 flex flex-col gap-2">
        {topicAccuracy.map((t) => (
          <li key={t.topic}>
            <div className="flex items-center justify-between text-sm">
              <span>{t.topic}</span>
              <span className="text-muted">
                {Math.round(t.accuracy * 100)}%（{t.correct}/{t.attempts}）
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-accent"
                style={{ width: `${Math.round(t.accuracy * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {reCorrectRate !== null && (
        <div className="mt-4 text-sm text-muted">
          復習後の再正解率: {Math.round(reCorrectRate * 100)}%
        </div>
      )}

      {weakTopics.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-ink">苦手論点</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {weakTopics.map((topic) => (
              <TopicBadge key={topic} topic={topic} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
