# HOKIRU Web

一級建築士法規の学習を「忘却の可視化」と「復習自動化」で支えるWebアプリ。**AI資格学習
ファクトリーの第1号機**として設計されており、テンプレート化して次の資格（宅建・診断士・
マン管など）へ横展開することを前提にしている。詳細な戦略背景は
`docs/strategy/v1.1-proposal.md` を参照。

> **配置に関する注記**: このディレクトリは `claude-code-video-toolkit` リポジトリ内の
> サブフォルダとしてscaffoldされている（動画ツールキットとは無関係の別プロダクト）。
> `hokiru-web/.github/` 配下のワークフロー・Issue/PRテンプレートは**このリポジトリでは
> 実行されない**（GitHub Actionsはリポジトリ直下の`.github/`のみを読む）。独立リポジトリ
> （`hokiru-web` / `ai-qualification-factory` など）へ切り出す際に、この`.github/`を
> リポジトリ直下へそのままコピーすれば有効化できる。

## 技術スタック

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase（MVPでは未接続。匿名ローカル保存が既定）
- Vercel（デプロイ先。テンプレート内で前提としている）
- Playwright（E2E・スクリーンショット）
- Vitest（ユニットテスト）
- ESLint

## ローカル起動手順

```bash
cd hokiru-web
npm install
npm run dev
# http://localhost:3000
```

Supabase等の環境変数は未設定でも動作する（`.env.example`参照）。MVPは匿名の
`localStorage`保存のみで完結する。

## テスト手順

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test         # Vitest（ユニットテスト: rights / scheduler / progress）
npm run build        # Next.js本番ビルド
npm run test:e2e     # Playwright（要: npm run build 後 or BASE_URL指定）
```

> 一部サンドボックス環境では、事前インストール済みChromiumのバージョンと
> `@playwright/test`が期待するプロトコルの不一致により、`mobile-iphone`プロジェクト
> （タッチ/モバイルエミュレーション）のみ起動に失敗することがある（`chromium`プロジェクトは
> 影響を受けない）。`npx playwright test --project=chromium`で切り分け可能。GitHub Actions
> （`npx playwright install --with-deps`でバージョンが一致するブラウザを取得）では発生しない。

## スクリーンショット生成手順

```bash
npm run build && npm run start &   # 別ターミナルでローカルサーバ起動
npm run screenshots                # または: BASE_URL=https://xxx.vercel.app npm run screenshots
```

出力先: `screenshots/output/{home,practice,review,analysis,settings}.png`（gitignore対象）。
PRでは`.github/workflows/screenshot.yml`（有効化後）がartifactとして自動添付する。

## DoD確認手順

```bash
npm run dod:status        # 人間可読サマリ
npm run dod:status -- --json  # 夜間ラン用JSON
```

DoDの全項目は `docs/operations/dod.md`。12カテゴリ（Product / UI / Learning Experience /
Question Quality / Rights / Technical / Test / Accessibility / Performance / Security /
Operations / Release）に分解済み。

## 権利管理方針

問題データは `rightsStatus` で4段階に分類する：`original_ai_generated` /
`user_supervised` / `third_party_restricted` / `internal_reference_only`。公開できるのは
前者2つのみ、かつ `supervisionStatus === "supervised"` かつ法令根拠が入っている場合に限る。
唯一のゲートは `lib/rights/canPublishQuestion.ts`。既存のR07法規120問（過去問）は
`data/internal/` に隔離し、公開UI・本番seed・LPには一切使わない。詳細は
`docs/product/hokiru-web-spec.md` §公開可否判定。

## NotionとGitHubの役割分担

- **GitHub**: 実装・テスト・PR・判断キュー（`needs-decision`ラベルのIssue）の一次ソース。
- **Notion**: 「AI副業 統合戦略ドキュメント v1.0」が唯一の戦略ドキュメント。進捗ログ・
  判断待ち一覧のミラー先。直接更新できない環境では
  `docs/operations/notion-update-draft.md`（`npm run notion:draft`で生成）を人間が
  貼り付ける。詳細は `docs/operations/notion-update-spec.md`。

## 人間の操作は原則2つに限定する

1. **PRのマージ承認**（スクリーンショットを見て判断）
2. **判断キューへの回答**（`needs-decision`ラベルのIssue、期限なし・スマホ5分で回答可能な粒度）

それ以外の実装・テスト・スクリーンショット取得・進捗更新はAIとGitHub Actionsが無人で進める
設計になっている。Phase 0（初回セットアップ）だけは人間のみ可能な作業として
`docs/operations/release-process.md` に明記している。
