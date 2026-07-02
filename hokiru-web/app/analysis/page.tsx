"use client";

import { useEffect, useState } from "react";
import { ProgressSummary } from "../../components/ProgressSummary";
import { calculateProgress, type ProgressSummary as ProgressSummaryType } from "../../lib/progress/calculateProgress";
import { getAnswerLog } from "../../lib/state/appState";

export default function AnalysisPage() {
  const [summary, setSummary] = useState<ProgressSummaryType | null>(null);

  useEffect(() => {
    setSummary(calculateProgress(getAnswerLog(), new Date()));
  }, []);

  if (!summary) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-ink">分析</h1>
      <ProgressSummary
        topicAccuracy={summary.topicAccuracy}
        reCorrectRate={summary.reCorrectRate}
        weakTopics={summary.weakTopics}
      />
    </div>
  );
}
