"use client";

import { useEffect, useState } from "react";
import { HomeTodayCard, type HomeTodayCardProps } from "../components/HomeTodayCard";
import { calculateProgress } from "../lib/progress/calculateProgress";
import {
  getAllQuestions,
  getAnswerLog,
  getDueReviewQueue,
  getNextQuestionId,
  getSettings,
} from "../lib/state/appState";

export default function HomePage() {
  const [data, setData] = useState<HomeTodayCardProps | null>(null);

  useEffect(() => {
    const now = new Date();
    const settings = getSettings();
    const log = getAnswerLog();
    const due = getDueReviewQueue(now);
    const progress = calculateProgress(log, now);
    const questions = getAllQuestions();
    const nextId = getNextQuestionId(now);
    const nextQuestion = questions.find((q) => q.questionId === nextId);

    const daysUntilExam = settings.examDate
      ? Math.max(0, Math.ceil((new Date(settings.examDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      : null;

    const nextTaskLabel =
      due.length > 0
        ? `復習: ${due[0]!.topic}`
        : nextQuestion
          ? `新規演習: ${nextQuestion.topic}`
          : "演習できる問題がありません";

    setData({
      daysUntilExam,
      todayReviewCount: due.length,
      nextTaskLabel,
      weakTopic: progress.weakTopics[0] ?? null,
      streakDays: progress.streakDays,
    });
  }, []);

  if (!data) return null;

  return <HomeTodayCard {...data} />;
}
