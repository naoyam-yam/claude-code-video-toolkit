# Claude Code Tips Wiki

Curated, fact-checked tips for using Claude Code well. New entries are
added via `/x-tips` (see `README.md`). Each entry: what it is, why it
matters, and a caveat if there is one.

Status legend: ✅ verified against current Claude Code behavior · 🟡 unverified (reported by a source, not independently confirmed) · 🧭 seed (bootstrapped from general knowledge, no external source tweet)

---

## セットアップ / Setup

### CLAUDE.md はプロジェクトの「常駐システムプロンプト」 🧭
リポジトリ直下に `CLAUDE.md` を置くと、Claude Code がセッション開始時に自動で読み込む。コーディング規約、ディレクトリ構成、よく使うコマンドなど「毎回説明するのが面倒なこと」を書いておくと、以後のセッション全てに効く。`~/.claude/CLAUDE.md` を使えばユーザー全体のグローバル設定にもなる。

### 権限モードを使い分ける 🧭
Claude Code には `default`(都度確認)/ `acceptEdits`(編集は自動承認)/ `plan`(読み取り専用で計画のみ)/ `bypassPermissions`(全自動、リスク大)の4モードがある。破壊的操作が絡む作業は `default` か `plan` から始め、慣れた定型作業だけ `acceptEdits` に上げるのが安全。`bypassPermissions` は隔離環境以外では避ける。

### Hooks でチームのルールを強制する 🧭
`settings.json` の `hooks` で、特定のツール呼び出し前後にシェルコマンドを挟める(例: `PreToolUse` でlintを強制、`Stop` で通知を飛ばす)。「毎回言うのが面倒な指示」はプロンプトではなくhookにすると徹底される。

---

## ワークフロー / Workflow

### Plan Mode で「先に設計だけ」させる 🧭
大きな変更や複数ファイルにまたがる実装の前に Plan Mode に入ると、Claude はコードを書かずに調査と設計案の提示だけを行う。承認してから実装に進むので、方向性のズレを実装前に潰せる。CLIでは `/plan` や shift+tabでの切り替えに相当。

### サブエージェントで調査とコンテキストを分離する 🧭
広いコードベース探索や独立した調査は、メインの会話コンテキストではなくサブエージェント(Task/Agent)に投げると、結果の要約だけがメイン文脈に返る。複数の独立した調査は並列に投げられるため、逐次調査より速く、かつメインの文脈を汚さない。

### `/clear` と自動要約は別物 🧭
コンテキストが長くなると自動的に要約(compaction)されるが、話題が完全に変わるときは `/clear` で明示的にリセットした方が、無関係な過去の文脈に引きずられにくい。長時間セッションでは定期的な `/clear` が有効という報告が多い。

---

## カスタマイズ / Customization

### カスタムスラッシュコマンドで定型作業をテンプレ化する 🧭
`.claude/commands/*.md` に Markdown で手順を書くと `/コマンド名` で呼び出せる。「毎回同じ手順を口頭で説明している」作業はコマンド化すると再現性が上がり、チームで共有もできる。

### Skills でドメイン知識を外部化する 🧭
`.claude/skills/` にツールの使い方やプロンプトパターンをまとめておくと、必要な時だけ読み込まれる(常時コンテキストを消費しない)。特定ツールの癖や社内ルールなど「毎回説明が長くなりがちな知識」を skill 化すると、メインの会話が軽くなる。

### MCP でエディタ外のツールをつなぐ 🧭
Model Context Protocol (MCP) サーバーを設定すると、GitHub・Slack・DB・独自APIなど外部システムをツールとしてClaude Codeから直接操作できる。「ブラウザでタブを行き来する」作業の多くがチャット内で完結するようになる。

---

## 生産性 / Productivity

### 独立したツール呼び出しは並列で投げる 🧭
依存関係のない複数の調査・読み込みは、1つのレスポンス内で複数ツールを同時に呼び出すと速い。逐次実行はツール同士に依存がある時だけでよい。

### GitHub上のPRレビュー対応を自動化する 🧭
Claude Code on the web はPRのレビューコメントやCI失敗のイベントを購読し、指摘を取り込んで自動修正・再pushできる。「PRを出したら通知を待つだけ」の運用に寄せられる。

---

## 落とし穴 / Gotchas

### `--dangerously-skip-permissions` は常用しない 🧭
確認プロンプトを全スキップするフラグは、隔離されたサンドボックスやCI以外では避ける。誤った破壊的操作(force push、ファイル削除など)を止める最後の砦がなくなる。

### 大きすぎるタスクは丸投げしない 🧭
「アプリを作って」のような曖昧で巨大な依頼は、途中で方向性がズレても気づきにくい。スコープを区切り、要所でPlan Modeやレビューを挟んだ方が手戻りが少ない。

---

## 追記のしかた

新しいtipsは `/x-tips` で追加する。手動で追記する場合も、この形式(カテゴリ → 見出し → ステータス絵文字 → 本文)を踏襲し、`SOURCES.md` に出典を残すこと。
