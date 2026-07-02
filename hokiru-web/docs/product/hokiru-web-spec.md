# HOKIRU Web 仕様書

対象資格: 一級建築士法規（横展開可能な設計。qualification フィールドで資格を切り替える）。
コア価値: **忘却の可視化** と **復習自動化**。詳細な意思決定の根拠は
`docs/strategy/v1.1-proposal.md` および Notion「HOKIRU 事前決定メモ」を参照。

## 画面仕様

### ホーム (`app/page.tsx`)

- 役割: 今日やることを1秒で把握する。
- 表示: 試験までの日数、今日の復習数、次にやるべき1件、苦手論点、今週の継続日数。
- 主要アクション: 「今日の復習を始める」ボタン1つ（`/review` へ遷移）。
- 禁止: 情報の詰め込み、AIっぽい演出、過剰なグラフ、ランキング、コミュニティ要素。

### 演習 (`app/practice/page.tsx`)

- 役割: 1問に集中させる。
- フロー: 問題文 → 4択選択 → 自信度選択（自信あり/自信なし）→ 回答 → 正誤表示 → 解説 →
  法令根拠 → 次の問題へ。
- 記録する学習ログ: 選択した選択肢、正誤、自信度、回答時間（`Date.now()`差分）。
- 実装: `components/PracticeCard.tsx` + `lib/state/appState.ts#recordAnswer`。

### 復習 (`app/review/page.tsx`)

- 役割: 忘れそうなものを優先的に回す。
- 表示: 優先度順の復習キュー（`lib/review/scheduler.ts#sortReviewQueue`）、最終回答日、
  次回復習推奨日、連続失敗回数、苦手論点。
- 実装: `components/ReviewQueue.tsx` + `lib/state/appState.ts#getDueReviewQueue`。

### 分析 (`app/analysis/page.tsx`)

- 役割: 学習の傾向を静かに確認する。
- 表示: 論点別正答率、再正解率、忘却傾向（簡易表示）。
- 禁止: 装飾的なAIコメント、根拠のない診断、不安を煽る表示。
- 実装: `components/ProgressSummary.tsx` + `lib/progress/calculateProgress.ts`。

### 設定 (`app/settings/page.tsx`)

- 表示: 試験日、学習ペース、復習間隔初期値、データリセット。
- 通知設定はMVPでは保留。

### 利用規約 / プライバシーポリシー (`app/legal/terms`, `app/legal/privacy`)

- MVPは匿名ローカル保存であることを明記。Supabase移行時に更新する。

## データ構造

### 問題データ (`lib/questions/schema.ts`)

```ts
interface Question {
  questionId: string;
  qualification: string;   // 例: "ikkyu-kenchikushi"
  subject: string;         // 例: "建築基準法"
  topic: string;           // 例: "用途地域と容積率"
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  choices: [string, string, string, string];
  correctChoice: 0 | 1 | 2 | 3;
  explanation: string;
  legalBasis: string;
  legalReference: string;
  sourceType: "ai_generated" | "human_authored" | "hybrid";
  rightsStatus: "original_ai_generated" | "user_supervised" | "third_party_restricted" | "internal_reference_only";
  supervisionStatus: "unsupervised" | "in_review" | "supervised";
  createdBy: string;
  reviewedBy: string | null;
  lastReviewedAt: string | null;
}
```

### 学習ログ (`lib/progress/calculateProgress.ts`)

```ts
interface AnswerLogEntry {
  questionId: string;
  topic: string;
  correct: boolean;
  answeredAt: string; // ISO 8601
  isReview: boolean;
}
```

保存先はMVPでは `localStorage`（`lib/storage/localStore.ts`）。将来Supabaseの
`answer_logs` テーブルに移行しても `AnswerLogEntry` の形は変えない。

## 復習スケジューラー

`lib/review/scheduler.ts` の `scheduleNextReview()` が唯一の実装。ロジック:

- 正解 + 自信あり → 間隔を大きく広げる（デフォルト2.5倍）
- 正解 + 自信なし → 間隔を少しだけ広げる（デフォルト1.3倍）
- 不正解 → 短期間隔（デフォルト1日）にリセットし、連続失敗カウントを+1
- 連続失敗が多いほど優先度スコアが上がり、復習キューの上位に来る
- 回答時間が長い「自信あり」は「自信なし」として扱う（`longAnswerThresholdMs`）

精密なAI予測ではなく、事前決定メモの方針どおり「復習最適化の推定」として設計している。

## 忘却の可視化

分析画面の「論点別正答率」「再正解率」「苦手論点」が忘却の可視化にあたる。実装は
`calculateProgress()` が返す `weakTopics`（3回以上出題かつ正答率60%未満）と
`reCorrectRate`（復習後の再正解率）。忘却曲線の精密なモデル化はMVPでは行わない。

## 法令根拠表示・監修ステータス

`components/LegalBasisBlock.tsx` が `legalBasis` / `legalReference` / `supervisionStatus` を
常に表示する。監修ステータスは3段階（未監修ドラフト / 監修中 / 監修済み）をUI上に明示し、
ユーザーに「これはまだAIドラフトである」ことを隠さない。

## 公開可否判定

`lib/rights/canPublishQuestion.ts` が唯一のゲート。以下の**すべて**を満たさない限り
`canPublish: false`:

1. `rightsStatus` が `original_ai_generated` または `user_supervised`
2. `supervisionStatus` が `supervised`
3. `legalBasis` と `legalReference` が両方とも空でない
4. `reviewedBy` と `lastReviewedAt` が両方とも設定されている

`third_party_restricted` と `internal_reference_only` は他の条件を満たしていても常に
`false` になる。`tests/unit/rights.test.ts` でこの挙動を固定している。
