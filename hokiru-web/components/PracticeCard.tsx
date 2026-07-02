"use client";

import { useState } from "react";
import type { Question } from "../lib/questions/schema";
import type { Confidence } from "../lib/review/scheduler";
import { LegalBasisBlock } from "./LegalBasisBlock";
import { TopicBadge } from "./TopicBadge";

export interface PracticeCardProps {
  question: Question;
  onAnswered: (result: { choiceIndex: number; confidence: Confidence; durationMs: number }) => void;
}

export function PracticeCard({ question, onAnswered }: PracticeCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selected === question.correctChoice;

  function handleChoice(index: number) {
    if (revealed) return;
    setSelected(index);
  }

  function handleConfirm() {
    if (selected === null || confidence === null) return;
    setRevealed(true);
    onAnswered({ choiceIndex: selected, confidence, durationMs: Date.now() - startedAt });
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <TopicBadge topic={question.topic} />

      <p className="mt-3 text-base leading-relaxed text-ink">{question.questionText}</p>

      <div className="mt-4 flex flex-col gap-2">
        {question.choices.map((choice, index) => {
          const isChosen = selected === index;
          const showResult = revealed && (index === question.correctChoice || isChosen);
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleChoice(index)}
              disabled={revealed}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                showResult
                  ? index === question.correctChoice
                    ? "border-green-500 bg-green-50"
                    : "border-red-400 bg-red-50"
                  : isChosen
                    ? "border-accent bg-blue-50"
                    : "border-gray-200"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {!revealed && selected !== null && (
        <div className="mt-4">
          <div className="text-sm text-muted">自信度</div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfidence("confident")}
              className={`rounded-lg border px-3 py-1.5 text-sm ${confidence === "confident" ? "border-accent bg-blue-50" : "border-gray-200"}`}
            >
              自信あり
            </button>
            <button
              type="button"
              onClick={() => setConfidence("unsure")}
              className={`rounded-lg border px-3 py-1.5 text-sm ${confidence === "unsure" ? "border-accent bg-blue-50" : "border-gray-200"}`}
            >
              自信なし
            </button>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confidence === null}
            className="mt-4 w-full rounded-xl bg-accent px-4 py-3 font-medium text-white disabled:opacity-40"
          >
            回答する
          </button>
        </div>
      )}

      {revealed && (
        <div className="mt-4">
          <div className={`text-sm font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? "正解" : "不正解"}
          </div>
          <p className="mt-2 text-sm text-ink">{question.explanation}</p>
          <LegalBasisBlock
            legalBasis={question.legalBasis}
            legalReference={question.legalReference}
            supervisionStatus={question.supervisionStatus}
          />
        </div>
      )}
    </section>
  );
}
