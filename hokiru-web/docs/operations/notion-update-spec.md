# Notion更新仕様

対象ページ: 「AI副業 統合戦略ドキュメント v1.0 — 棚卸し・自動運用設計・将来展望」
(Notion page id: `390234f0-511a-816a-83e6-cb4fc3adf507`)

## 更新すべき内容

- 進捗ログ（§8 進捗ログ・改訂履歴への追記）
- DoD残数（`scripts/collect-dod-status.ts --json`の`done`/`total`/`blockedOnDecision`）
- 完了したPR（直近のマージ済みPRタイトル+リンク）
- 失敗した夜間ラン（あれば、症状と次のアクション）
- 次にAIがやること（`pendingRunnable`の先頭）
- 人間判断待ち（`needs-decision`ラベルのIssue一覧）
- X/note発信用下書き（毎朝ループのタスク。本仕様の対象外 — Loop Projects側で管理）
- 週次レビュー（KPI表への追記。日曜21:00の定時タスク）

## 直接更新できる場合

Notion MCP（`notion-update-page` 等）または Notion APIが使える環境では、上記ページの
§8 進捗ログ・改訂履歴の末尾に追記する形で直接更新する。既存の見出し構成
（§1〜§8）は変更せず、末尾に新しい進捗ログ行を追加するのみとする。

追記見出し案（v1.1移行後、本文に統合されていない場合のみ新規セクションとして追加）:

```
# v1.1改善提案
# HOKIRU Web実装方針
# 自動運用設計
# DoD詳細版
# 判断キュー
# 進捗ログ
```

このリポジトリでは実体を `docs/strategy/v1.1-proposal.md` ほか `docs/` 配下に既に用意して
いるため、Notion側には要約+リンクのみを追記し、詳細の二重管理は避ける。

## 直接更新できない場合

`npm run notion:draft`（`scripts/notion-update-draft.ts`）を実行し、
`docs/operations/notion-update-draft.md` を生成する。人間がこのファイルの内容をNotionへ
コピー&ペーストする。夜間ランはこのファイルをPRに含めることで、更新内容をレビュー可能にする。

## 更新頻度

- 夜間ラン後: 毎回（PR作成時にセットで）
- 週次レビュー: 日曜21:00の定時タスクから、KPI集計を追記
- 毎朝ループ: 進捗要約+判断待ち一覧+X下書き2本を出力（Notion Loop Projects側、本仕様の対象外）
