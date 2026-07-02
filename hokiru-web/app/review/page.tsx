"use client";

import { useEffect, useState } from "react";
import { ReviewQueue } from "../../components/ReviewQueue";
import { getDueReviewQueue, type DueReviewEntry } from "../../lib/state/appState";

export default function ReviewPage() {
  const [entries, setEntries] = useState<DueReviewEntry[]>([]);

  useEffect(() => {
    setEntries(getDueReviewQueue(new Date()));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-ink">復習キュー</h1>
      <ReviewQueue entries={entries} />
    </div>
  );
}
