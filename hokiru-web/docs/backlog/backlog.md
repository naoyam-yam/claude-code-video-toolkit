# バックログ（作業パッケージ）

1タスクずつではなく、実態に即した作業パッケージとして構成する。夜間ランはパッケージ内の
未完了タスクのうち依存の少ないものから着手する。

## Package A: 基盤整備

- **目的**: プロジェクトが動く土台を作る。
- **成果物**: Next.js初期化、TS/Tailwind設定、ESLint/Vitest/Playwright設定、AppShell、
  基本5ページ、CI。
- **完了条件**: `npm run lint && npm run typecheck && npm run test && npm run build` が
  すべてgreen。
- **依存関係**: なし（最初に着手）。
- **AIが独断で進めてよいこと**: 設定ファイルの微調整、依存パッケージのバージョン固定。
- **人間判断が必要なこと**: なし。
- **失敗時の処理**: `docs/operations/ai-nightly-run.md`の失敗時フローに従う。
- **状態**: 実装済み（このPRで作成）。

## Package B: 権利ゲートと問題データ

- **目的**: 権利問題を技術的に恒久解決する。
- **成果物**: `lib/questions/schema.ts`、`rightsStatus`/`supervisionStatus`、
  `canPublishQuestion`、seed data、unit test、`data/internal/`の隔離。
- **完了条件**: `tests/unit/rights.test.ts` green、`data/internal/`が公開経路から
  importされていない。
- **依存関係**: Package A。
- **AIが独断で進めてよいこと**: サンプル問題の追加生成（オリジナルAI生成のみ、過去問の複製禁止）。
- **人間判断が必要なこと**: 生成された問題の法令監修（`supervisionStatus`を`supervised`に
  遷移させる作業は一級建築士本人のみ可能）。
- **失敗時の処理**: rightsゲートを緩めて解決しない。ゲートを通らない場合は機能要件側を見直す
  decision issueを起票する。
- **状態**: 実装済み（サンプル6問。監修は未着手 — 判断キュー参照）。

## Package C: 学習フロー

- **目的**: 演習の中核体験を作る。
- **成果物**: practice page、回答送信、正誤判定、自信度、回答時間記録、進捗更新、法令根拠表示。
- **完了条件**: `tests/e2e/practice.spec.ts` green。
- **依存関係**: Package A, B。
- **AIが独断で進めてよいこと**: UIの微調整、コンポーネント分割。
- **人間判断が必要なこと**: なし。
- **失敗時の処理**: e2eが落ちたら該当コミットをrevertし、失敗記録を残す。
- **状態**: 実装済み。

## Package D: 復習自動化

- **目的**: 忘却対策の自動化。
- **成果物**: scheduler、review queue、priority score、連続失敗処理、次回復習日、tests。
- **完了条件**: `tests/unit/scheduler.test.ts` green、`tests/e2e/review.spec.ts` green。
- **依存関係**: Package A, B, C。
- **AIが独断で進めてよいこと**: 間隔の係数調整（`DEFAULT_SCHEDULER_CONFIG`のチューニング）。
- **人間判断が必要なこと**: 精密なAIベース忘却予測への切替（現状は簡易ロジックで意図的に据え置き）。
- **失敗時の処理**: 純粋関数のためユニットテストで検出。回帰があれば直前コミットを特定して修正。
- **状態**: 実装済み。

## Package E: 分析

- **目的**: 学習傾向を静かに見せる。
- **成果物**: topic accuracy、re-correct rate、weak topics、忘却傾向、progress summary。
- **完了条件**: `tests/unit/progress.test.ts` green、`tests/e2e/screenshots.spec.ts`で
  analysis画面が崩れていない。
- **依存関係**: Package C, D。
- **AIが独断で進めてよいこと**: 集計ロジックの追加（禁止された演出を除く）。
- **人間判断が必要なこと**: なし。
- **失敗時の処理**: 装飾的なAIコメントが混入していないかレビューし、あれば削除する。
- **状態**: 実装済み。

## Package F: UI公開品質

- **目的**: 公開に足るUI品質に到達する。
- **成果物**: モバイル幅対応、スクリーンショット、アクセシビリティ、レイアウト一貫性、
  低ノイズUI。
- **完了条件**: `docs/operations/dod.md` の UI DoD / Accessibility DoD がすべて`[x]`。
- **依存関係**: Package A〜E。
- **AIが独断で進めてよいこと**: 余白・配色・タイポグラフィの微調整。
- **人間判断が必要なこと**: PRに添付されたスクリーンショットの最終目視判定。
- **失敗時の処理**: スクリーンショット比較で崩れがあれば修正PRを追加で出す。
- **状態**: 初版実装済み。継続的な微調整が必要。

## Package G: 自動運用

- **目的**: 人間の定時チェックインなしで改善が進む仕組みを作る。
- **成果物**: GitHub Actions（ci/screenshot/nightly-ai-dev/notion-sync）、Notion更新、
  decision issue、PRテンプレート、DoD collector。
- **完了条件**: `docs/operations/dod.md` の Operations DoD がすべて`[x]`。
- **依存関係**: Package A。
- **AIが独断で進めてよいこと**: ワークフローYAMLの調整、スクリプトのバグ修正。
- **人間判断が必要なこと**: secrets登録、GitHub Actions初回認可（Phase 0）。
- **失敗時の処理**: secrets未設定時はneeds-human-authとして記録し、処理を止めない。
- **状態**: テンプレートとして実装済み（`hokiru-web/.github/`配下 — 有効化にはリポジトリ直下への
  移動が必要）。

## Package H: LP・法務・公開準備

- **目的**: 外部公開の最終準備。
- **成果物**: LP、利用規約、プライバシーポリシー、OGP、メタデータ、リリースチェックリスト。
- **完了条件**: `docs/operations/dod.md` の Release DoD がすべて`[x]`。
- **依存関係**: Package B〜G、Rights DoD完了。
- **AIが独断で進めてよいこと**: 規約・ポリシーの下書き作成。
- **人間判断が必要なこと**: 価格、公開日、実名/肩書きの出し方（判断キュー参照）。
- **失敗時の処理**: 判断待ちのままPackage内の他タスクを進める。
- **状態**: 未着手（利用規約・プライバシーポリシーの最小版のみ実装済み）。
