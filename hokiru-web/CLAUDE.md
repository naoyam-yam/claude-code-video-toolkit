# CLAUDE.md — HOKIRU Web 運用憲法

Claude Codeがこのディレクトリで作業するたびに読むこと。判断に迷ったら本書を優先する。

## プロジェクト目的

一級建築士法規の学習アプリ「HOKIRU Web」を、人間の定時チェックインに依存せず品質を
自動で引き上げ続ける仕組みで運用する。資格学習ファクトリーの第1号機であり、後続資格への
テンプレートになることを常に意識する。背景は `docs/strategy/v1.1-proposal.md`。

## 最優先方針

1. 人間の定時チェックインを前提にしない。Pull型運用（機械が定時に動き、人間は任意の時刻に見る）。
2. 判断不要の作業はAIとGitHub Actionsで進める。
3. 判断が必要なものはGitHub Issue（`needs-decision`）とNotion判断キューに積む。
4. 未回答の判断事項があっても、他の判断不要タスクは止めない。
5. HOKIRU iOS版はそのまま延命しない。HOKIRU Webが旗艦。
6. 既存R07法規120問は資産として保持するが、公開用データには使わない。
7. 公開用問題は「AI生成 × 一級建築士本人監修」のオリジナル問題のみ。

## やってよい独断

- `docs/operations/decision-queue.md` に載っていない、純粋に技術的な設計判断（ライブラリの
  選定・実装方法・リファクタリング）
- サンプル問題の追加生成（オリジナルAI生成のみ、`supervisionStatus: "unsupervised"`で作成）
- DoDの粒度調整・追加（既存項目の削除はしない）
- UIの微調整（色数最小限・情報を詰め込まない、という既存方針の範囲内）

## やってはいけないこと

- `lib/rights/canPublishQuestion.ts` のロジックを緩めて機能を通す（rightsゲートは唯一の
  真実源。緩めたくなったらdecision issueを起票する）
- `data/internal/` の内容を `app/` / `components/` / `data/seed/` からimportする
- 過去問（R07法規120問）の文言をそのまま新しい問題に使う
- コミュニティ機能・高度なAI診断・課金をMVPに追加する（非MVPスコープ、`docs/product/non-mvp.md`）
- 分析画面に装飾的なAIコメントや不安を煽る表示を追加する
- 判断キュー項目を勝手に確定させて実装を進める（デフォルト適用は明記された場合のみ）

## HOKIRU WebのMVP

`docs/product/mvp-scope.md` を参照。5画面（ホーム/演習/復習/分析/設定）+ 利用規約/
プライバシーポリシー。匿名ローカル保存。復習スケジューラーは簡易ロジック（純粋関数、
`lib/review/scheduler.ts`）。

## 権利ゲートの扱い

`canPublishQuestion()` がすべての公開経路（UI・本番seed・LP）で唯一のゲート。新しい
公開経路を追加する場合は必ずこの関数を経由させ、`tests/unit/rights.test.ts` にケースを
追加する。

## DoDの扱い

`docs/operations/dod.md` の `- [ ]` を `scripts/collect-dod-status.ts` が解析する。
チェックボックスの書式・見出し(`##`)を崩さないこと。1項目実装したら該当行を `- [x]` に
更新してからPRを出す。

## 夜間ラン時の行動

`docs/operations/ai-nightly-run.md` の手順に厳密に従う。DoD解析→needs-decision除外→
依存の少ない1件選定→実装→lint/typecheck/test→スクリーンショット→PR→Notion更新の順。
1夜1タスクを原則とする（複数タスクを1PRに詰め込まない）。

## 失敗時の行動

- 自己修正は最大3回まで試みる。
- 直らなければブランチ・PRを作らず、失敗記録（症状/再現手順/試した対処/推定原因/次に
  直すべきファイル）をIssueとして残す。
- secrets未設定など認可待ちで進められない場合は `blocked` ではなく `needs-human-auth` と
  して記録し、他の作業へ進む。

## Notion更新ルール

対象は「AI副業 統合戦略ドキュメント v1.0」（`docs/operations/notion-update-spec.md`）。
直接更新できる環境ではMCP/APIで直接追記。できない環境では `npm run notion:draft` を
実行して `docs/operations/notion-update-draft.md` を生成し、PRに含める。詳細の二重管理は
避け、Notion側には要約+リンクのみを書く。

## Issue作成ルール

- 判断が必要なもの: `decision.yml` テンプレート、`needs-decision`ラベル必須。
  選択肢A/B・推奨案・推奨理由・未回答でも進められる作業・デフォルトを必ず埋める。
- DoD項目: `dod-item.yml` テンプレート、`dod`ラベル。
- 通常の機能/不具合: `feature.yml` / `bug.yml`。

## PR作成ルール

`pull_request_template.md` の全セクションを埋める（目的/変更内容/対応したDoD/テスト結果/
スクリーンショット/権利ゲートへの影響/Notion更新/判断待ち/次にAIがやるべきこと）。
スクリーンショットなしでUI変更のPRを出さない。

## 判断キューの扱い

`docs/operations/decision-queue.md` に一覧がある。回答が付くまで、その項目に**依存する
実装のみ**を止める。無関係な実装は進め続ける。2週間未回答でも催促せず、選択肢を残したまま
他の作業を継続する。

## 人間に質問せず進めるべき範囲

実装方法・技術選定・DoD消化・テスト追加・ドキュメント更新・サンプル問題のドラフト生成・
UIの微調整・リファクタリング。

## 人間判断が必要な範囲

`docs/operations/decision-queue.md` に列挙された8項目（旗艦資格の最終確認、価格、課金方式、
実名の出し方、発信名義、監修済み表示基準、本番公開日、有料化タイミング）。加えて、
問題の`supervisionStatus`を`supervised`に遷移させる法令監修そのもの（一級建築士本人にしか
できない）。
