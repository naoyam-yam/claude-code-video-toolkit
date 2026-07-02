"use client";

import { useEffect, useState } from "react";
import { clearAllLocal } from "../../lib/storage/localStore";
import { getSettings, saveSettings, type AppSettings } from "../../lib/state/appState";

export default function SettingsPage() {
  const [examDate, setExamDate] = useState("");
  const [pace, setPace] = useState<AppSettings["pace"]>("standard");
  const [defaultIntervalDays, setDefaultIntervalDays] = useState(1);

  useEffect(() => {
    const settings = getSettings();
    setExamDate(settings.examDate ?? "");
    setPace(settings.pace);
    setDefaultIntervalDays(settings.defaultIntervalDays);
  }, []);

  function handleSave() {
    saveSettings({ examDate: examDate || null, pace, defaultIntervalDays });
  }

  function handleReset() {
    if (window.confirm("学習データをすべて削除します。よろしいですか？")) {
      clearAllLocal();
      window.location.reload();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-ink">設定</h1>

      <label className="flex flex-col gap-1 text-sm">
        試験日
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        学習ペース
        <select
          value={pace}
          onChange={(e) => setPace(e.target.value as AppSettings["pace"])}
          className="rounded-lg border border-gray-200 px-3 py-2"
        >
          <option value="slow">じっくり</option>
          <option value="standard">標準</option>
          <option value="fast">追い込み</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        復習間隔初期値（日）
        <input
          type="number"
          min={1}
          value={defaultIntervalDays}
          onChange={(e) => setDefaultIntervalDays(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
      </label>

      <button type="button" onClick={handleSave} className="rounded-xl bg-accent px-4 py-3 font-medium text-white">
        保存する
      </button>

      <button
        type="button"
        onClick={handleReset}
        className="rounded-xl border border-red-300 px-4 py-3 font-medium text-red-600"
      >
        データをリセットする
      </button>
    </div>
  );
}
