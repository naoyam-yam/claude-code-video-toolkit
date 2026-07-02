"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PracticeCard } from "../../components/PracticeCard";
import { getAllQuestions, getNextQuestionId, recordAnswer } from "../../lib/state/appState";
import type { Question } from "../../lib/questions/schema";
import type { Confidence } from "../../lib/review/scheduler";

function PracticeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const requestedId = searchParams.get("questionId");
    const questions = getAllQuestions();
    const id = requestedId ?? getNextQuestionId(new Date());
    setQuestion(questions.find((q) => q.questionId === id) ?? questions[0] ?? null);
    setFeedback(null);
  }, [searchParams]);

  const handleAnswered = useCallback(
    (result: { choiceIndex: number; confidence: Confidence; durationMs: number }) => {
      if (!question) return;
      const { correct } = recordAnswer(question, result.choiceIndex, result.confidence, result.durationMs);
      setFeedback(correct ? "正解しました" : "不正解でした。復習キューに追加されます。");
    },
    [question]
  );

  function handleNext() {
    router.replace("/practice");
    const questions = getAllQuestions();
    const id = getNextQuestionId(new Date());
    setQuestion(questions.find((q) => q.questionId === id) ?? null);
    setFeedback(null);
  }

  if (!question) {
    return <p className="text-sm text-muted">演習できる問題がありません。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <PracticeCard question={question} onAnswered={handleAnswered} />
      {feedback && (
        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-ink"
        >
          次の問題へ進む
        </button>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeInner />
    </Suspense>
  );
}
