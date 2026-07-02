import Link from "next/link";

export interface HomeTodayCardProps {
  daysUntilExam: number | null;
  todayReviewCount: number;
  nextTaskLabel: string;
  weakTopic: string | null;
  streakDays: number;
}

export function HomeTodayCard({
  daysUntilExam,
  todayReviewCount,
  nextTaskLabel,
  weakTopic,
  streakDays,
}: HomeTodayCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-muted">
        {daysUntilExam !== null ? `試験まで残り ${daysUntilExam} 日` : "試験日は設定から登録できます"}
      </div>

      <div className="mt-3 text-3xl font-semibold text-ink">今日の復習 {todayReviewCount} 件</div>

      <div className="mt-4 text-sm text-ink">次にやるべきこと: {nextTaskLabel}</div>

      <div className="mt-3 flex flex-col gap-0.5 border-t border-gray-100 pt-3 text-xs text-muted">
        {weakTopic && <div>苦手論点: {weakTopic}</div>}
        <div>今週の継続日数: {streakDays} 日</div>
      </div>

      <Link
        href="/review"
        className="mt-5 inline-block w-full rounded-xl bg-accent px-4 py-3 text-center font-medium text-white"
      >
        今日の復習を始める
      </Link>
    </section>
  );
}
