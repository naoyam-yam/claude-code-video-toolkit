# Definition of Done（DoD）詳細版

「クオリティが低いから出せない」という感覚的判断を、チェックリストの残数という測定可能な量に
変換したもの（v1.0 §4.3）。各項目はAIが1項目ずつ独立して消化できる粒度にしてある。
`scripts/collect-dod-status.ts` がこのファイルの `- [ ]` / `- [x]` をパースする —
**見出し(`##`)とチェックボックスの書式を崩さないこと。**

`needs-decision` を含む項目は夜間ランがスキップし、`docs/operations/decision-queue.md` /
GitHub Issue(`needs-decision`ラベル)側で回答を待つ。

## Product DoD

- [x] ホーム→復習の1タップ導線が全画面幅で機能する（`tests/e2e/home.spec.ts`で検証済み）
- [x] 演習→採点→復習→進捗保存が通しで動く（`tests/e2e/practice.spec.ts`・`review.spec.ts`で検証済み）
- [x] 設定でexamDate/pace/defaultIntervalDaysが保存・反映される（`tests/e2e/settings.spec.ts`で検証済み）
- [x] データリセットが学習ログ・復習状態・設定のすべてを消去する（`tests/e2e/settings.spec.ts`で検証済み）

## UI DoD

> この4項目は主観判定であり、v1.0の設計方針（「感覚的な『見た目の判断』を人間に求めるのは、
> PRに自動添付されるスクリーンショットを見る瞬間だけに限定する」）に従い、**AIは自己判定で
> チェックを付けない**。PRのスクリーンショットを見た人間がチェックする。AIは実装・改善は行うが、
> 完了判定はしない。

- [ ] ホーム画面の主要情報が3つ以内に収まっている（事前決定メモの主表示3項目=試験までの日数/今日の復習数/次にやるべき1件、苦手論点・継続日数は補助表示として視覚的に弱める実装済み）
- [ ] 各画面の主ボタンが1つに絞られている
- [ ] 色数が最小限（accent/muted/ink/paperの4色以内）に保たれている
- [ ] スマホ実機幅（375px〜430px）で表示崩れゼロ

## Learning Experience DoD

- [ ] 自信度入力が回答フローを妨げず自然に組み込まれている（主観判定・スクリーンショットで人間が確認）
- [x] 回答時間が20秒を超える「自信あり」回答が「自信なし」寄りに扱われる（`tests/unit/scheduler.test.ts`検証済み）
- [x] 連続失敗した問題が復習キューの上位に表示される（`tests/unit/scheduler.test.ts`の`sortReviewQueue`・`priorityScore`テストで検証済み）
- [x] 苦手論点（3回以上出題・正答率60%未満）が分析画面に表示される（`tests/e2e/analysis.spec.ts`で検証済み。実装漏れを本PRで修正 — `ProgressSummary`に`weakTopics`表示を追加）

## Question Quality DoD

- [ ] サンプル問題6問すべてに法令根拠（legalBasis/legalReference）が入っている（公開候補5問は充足。internal_reference_only 1問は意図的に"N/A" — 判定基準を次回精査）
- [ ] サンプル問題6問のうち最低1問が一級建築士本人により`supervised`へ遷移している (needs-decision: 監修者本人の作業)
- [ ] 監修済みフラグ100%（法令の誤りゼロ）— 公開対象問題すべてに適用

## Rights DoD

- [x] `canPublishQuestion()`のテストが全パターン(4rightsStatus × 3supervisionStatus)をカバーしている（`tests/unit/rights.test.ts`に12ケースのフルマトリクステストを追加、全green）
- [x] `data/internal/`配下のデータが`app/`・`components/`・`data/seed/`から一切importされていない（grep検証済み、importなし）
- [x] R07法規120問が`data/internal/`または外部保管のみに存在し、リポジトリ本体のpublic pathに含まれない（grep検証済み、リポジトリ内にR07関連データ自体が存在しない）
- [x] 本番seedスクリプト(`scripts/seed-supabase.ts`)が`filterPublishable()`を経由しないパスを持たない（コードレビュー済み、唯一のDB書き込みパスがfilterPublishable経由）

## Technical DoD

- [x] `npm run typecheck`がエラー0で通る
- [x] `npm run lint`がエラー0で通る
- [x] Supabase未設定でも`npm run dev`が正常に起動する（graceful degradation）（`curl`で`/`・`/practice`が200を返すことを確認済み）
- [x] `lib/`配下の関数がすべて純粋関数またはI/O境界が明確に分離されている（scheduler/progress/rightsは純粋関数、supabase/storageのみI/O）

## Test DoD

- [x] `npm run test`（vitest）が全て green（26/26 passed）
- [x] `npx playwright test`が主要フロー（home/practice/review/screenshots）で green（`--project=chromium`で11/11 passed。`mobile-iphone`プロジェクトはこのサンドボックス環境固有のChromiumバージョン不一致で失敗 — README.md参照。CI環境では発生しない想定）
- [x] rights gateの単体テストがCIで必須チェックになっている（`ci.yml`の`npm run test`ステップに含まれ、失敗時はCI全体がfailする）

## Accessibility DoD

- [x] 主要ボタンにaria-labelまたは十分なテキストラベルがある（grep監査済み: `components/`・`app/`内の全button/Linkが可視テキストラベルを持つ。アイコンのみのボタンなし）
- [x] 選択肢ボタンがキーボード操作(Tab/Enter)で選べる（`tests/e2e/accessibility.spec.ts`で検証済み）
- [x] コントラスト比がWCAG AA基準を満たす（ink #1a1a1a on paper #fafaf9で確認済み。相対輝度から算出したコントラスト比 ≈16.7:1、AA基準4.5:1・AAA基準7:1を両方上回る）

## Performance DoD

- [ ] Lighthouse Performanceスコア90以上（モバイル）
- [ ] 初回表示（LCP）が2.5秒以内
- [ ] JSバンドルサイズがpracticeページで200KB(gzip)以内

## Security DoD

- [x] `.env.example`に実際のキーが含まれていない（全項目プレースホルダのみ）
- [x] Supabase service role keyがクライアントバンドルに含まれない（`lib/supabase/server.ts`のみで使用。grep検証済み、`app/`・`components/`・`lib/state/`からの参照なし）
- [x] localStorageに保存するデータに個人識別情報を含めない（`AnswerLogEntry`・`ReviewState`・`AppSettings`のいずれもPIIフィールドを持たない設計）

## Operations DoD

- [ ] `nightly-ai-dev.yml`がsecrets未設定でもエラー終了せずneeds-human-authを記録する
- [ ] `collect-dod-status.ts`が正しくpendingRunnable/blockedOnDecisionを分類する
- [ ] PRテンプレートの全セクションが夜間ランで自動記入される

## Release DoD

- [ ] LP1枚（`app/page.tsx`とは別に公開前に用意 — 判断キュー: 本番公開日）
- [ ] 利用規約・プライバシーポリシーが実運用向けに更新されている
- [ ] OGP画像・メタデータが設定されている
- [ ] 独自ドメインが設定されている (needs-decision: 本番公開日)
