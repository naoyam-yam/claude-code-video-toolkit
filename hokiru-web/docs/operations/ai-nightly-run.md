# 夜間自動開発ラン仕様

対応ワークフロー: `.github/workflows/nightly-ai-dev.yml`（テンプレート。実行するには
リポジトリ直下の`.github/`へ移動する必要がある — 詳細は同ファイル冒頭コメント参照）。

## 実行順序

1. `docs/operations/dod.md` を `scripts/collect-dod-status.ts --json` で解析する
2. `needs-decision`（または`decision-queue.md`に記載の未回答項目）を除外する
3. 依存関係の少ない作業を1件選ぶ（`pendingRunnable`の先頭、または`docs/backlog/backlog.md`の
   Package内で先行未完了タスクがないもの）
4. 作業ブランチを切る（例: `ai-nightly/2026-07-03-review-queue-priority`）
5. 実装する
6. `npm run lint && npm run typecheck && npm run test` を実行する
7. `npm run build && npm run start` の後 `npm run screenshots` でPlaywrightスクリーンショットを取る
8. 失敗したら原因を特定して修正を試みる（最大3回の自己修正ループ）
9. 3回で直らなければ、修正せずに失敗記録（症状・試した対処・推定原因・次にAIが試すべきこと）を
   Issueとして残し、当該ブランチ/PRは作成しない
10. 成功したらPRを作成する（`pull_request_template.md`に沿う）
11. PR本文に変更内容・テスト結果・スクリーンショット・未解決事項を記載する
12. Notion更新を試みる。直接更新できなければ`scripts/notion-update-draft.ts`を実行し、
    生成された`docs/operations/notion-update-draft.md`をPRにコミットする
13. 作業中に判断が必要な分岐に当たった場合は`scripts/create-decision-issue.ts`でIssue化する

## 失敗時の行動

- 同一DoD項目で2回連続失敗した場合、3回目は試みず`needs-decision`としてIssue化する
  （「AIには判断できない設計上の分岐がある」可能性が高いため）
- 失敗記録には必ず次を含める: 症状 / 再現手順 / 試した対処 / 推定原因 / 次に直すべきファイル
- 失敗記録はブランチを残さない（中途半端な状態のブランチが積み上がるのを防ぐ）

## 縮退運用

Claude利用量が週次上限に近い場合は`docs/operations/token-budget.md`に従い、夜間ランの
実行日を間引く（平日のみ→隔日、など）。DoD残数がゼロに近づいた場合も、実行頻度を落として
対話利用を優先してよい。

## 必要なsecrets

`.env.example`と同一。GitHub Actions側の設定は人間のPhase 0タスク（未設定でもワークフローは
`needs-human-auth`を記録して正常終了する設計にする）。

- `ANTHROPIC_API_KEY`
- `NOTION_API_KEY` / `NOTION_STRATEGY_PAGE_ID`
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`
- `GITHUB_TOKEN`（Actions既定のトークンで代用可）

## Claude Code Actionが使えない場合の代替手順

1. `nightly-ai-dev.yml`のcronは維持し、`ANTHROPIC_API_KEY`が無い場合は
   「DoD状況をIssueにコメントするだけ」の縮退モードで走らせる（`collect-dod-status.ts --json`の
   出力をIssueに投稿）。
2. 人間がclaude.ai/codeのセッションから手動でこのdocs一式を読み込み、`pendingRunnable`の
   先頭を1件処理してPRを作る運用に一時的に切り替える。
3. Claude Code Actionが利用可能になり次第、workflowのAI起動ステップを差し替える
   （インターフェース: DoD1件の要求 → 実装 → PR、は変えない）。
