# モバイルからの投げ込み導線(隔離コンポーネント)

Xアプリを見ている最中に、その場でtipsを投げ込んで `x-tips/` の自動更新まで
つなげるための追加コンポーネント。**`x-tips-curator` 本体とは独立(隔離)して
いる**——このドキュメントで完結し、他の自動化やトークンとは一切共有しない。
理由は次の「セキュリティ方針」を参照。

## 全体の流れ

```
Xアプリで投稿を見つける
  → 共有シートからShortcut実行(スマホ側、この репо外)
  → GitHub Issue が `x-tip` ラベル付きで自動作成される(.github/ISSUE_TEMPLATE/x-tip.yml)
  → Claude Code の Trigger が発火(claude.ai/code 側の設定、この repo 内には無い)
  → x-tips-curator スキルが Issue 本文を読んでキュレーション
  → x-tips/WIKI.md, QUEUE.md, SOURCES.md を更新してPRを作成
  → PRへのリンクをIssueにコメントしてIssueをclose
```

あなたがやるのは最初の「共有して1タップ」だけ。あとは自動。

## セキュリティ方針(なぜ隔離するか)

この導線はスマホに **GitHub の Personal Access Token(PAT)を保存**する。
トークンが漏れた場合の被害を最小化するため、必ず次を守ること。

- **専用トークンを新規発行する**。他のツール・他の自動化と共用しない。
- **権限は「この1リポジトリの Issues 読み書きのみ」**に絞る(Fine-grained PAT)。
  コード書き込み・他リポジトリ・Organization権限などは一切付与しない。
- **有効期限を設定する**(推奨90日)。切れたら再発行してShortcutを更新する。
- 端末を紛失・機種変更したら **即座にトークンをRevoke**する。
- トークンをメモアプリやチャットに平文で残さない。Shortcut内に保存したままにする。

## Step 1: 専用PATを発行する

1. ブラウザで https://github.com/settings/tokens?type=beta を開く
2. 「Generate new token」
3. Token name: `x-tips-mobile-capture`(用途がわかる名前にする)
4. Expiration: 90 days(推奨。切れたら更新)
5. Repository access → **Only select repositories** → `naoyam-yam/claude-code-video-toolkit` のみ選択
6. Permissions → Repository permissions → **Issues: Read and write** のみ `Access` に設定。それ以外は `No access` のまま
7. 「Generate token」→ 表示されたトークン(`github_pat_...`)を控える(このあと二度と表示されない)

## Step 2: iPhoneでショートカットを作る(iOS)

1. 「ショートカット」アプリ → 右上「+」→ 新規ショートカット
2. 名前を「Xtip送信」などにする
3. アクションを追加:
   1. **共有シートから受け取る** — 「共有シートに表示」をON、受け取る種類は `テキスト` と `URL` 両方にチェック
   2. **URLの内容を取得**
      - URL: `https://api.github.com/repos/naoyam-yam/claude-code-video-toolkit/issues`
      - メソッド: `POST`
      - ヘッダー:
        - `Authorization` : `Bearer <Step1で控えたトークン>`
        - `Accept` : `application/vnd.github+json`
      - 本文の種類: `JSON`
        - `title` : `[x-tip] クイック投稿`
        - `body` : (前のアクションで受け取った共有内容の変数を挿入)
        - `labels` : 配列で `["x-tip"]`
4. 保存

### 使い方

Xアプリでポストを開く → 共有ボタン → 下にスクロールして「Xtip送信」をタップ
→ 自動でGitHub Issueが作成される。あとは放置でOK(Triggerが拾って処理する)。

## Step 2': Androidの場合

標準の「ショートカット」アプリはiOS専用なので、代わりに **HTTP Shortcuts**
(無料アプリ、Google Playにあり)を使う。

1. HTTP Shortcuts を開き、新規ショートカットを作成
2. Method: `POST`
3. URL: `https://api.github.com/repos/naoyam-yam/claude-code-video-toolkit/issues`
4. Headers に `Authorization: Bearer <トークン>` と `Accept: application/vnd.github+json` を追加
5. Body(JSON)に `title`, `body`(共有されたテキストを変数として挿入), `labels: ["x-tip"]`
6. 「共有ターゲットとして表示」をONにして保存

Xアプリの共有メニューにこのショートカットが出るようになる。

## Step 3: Claude Code側のTriggerを設定する(claude.ai/code、手動設定)

このリポジトリの中には自動でTriggerを仕込む方法が無いため、
[claude.ai/code](https://claude.ai/code) のダッシュボードで手動設定する。

1. claude.ai/code → このリポジトリを開く → Triggers(または Automations)設定
2. 新規Trigger作成
   - Event: Issue opened
   - Filter: label = `x-tip`
   - 実行するプロンプト(例):
     ```
     このIssueの本文(source_url / tip_text / note)を入力として
     x-tips-curator スキルを実行してください。
     x-tips/WIKI.md, x-tips/QUEUE.md, x-tips/SOURCES.md を更新し、
     このリポジトリにPRを作成してください。
     完了したら、PRへのリンクをこのIssueにコメントし、Issueをcloseしてください。
     ```
3. 保存

これで「共有→Issue→自動キュレーション→PR」まで無人で完結する。

## 動作確認

1. Step1〜3を設定したら、テスト用に手動で `x-tip` ラベル付きIssueを1件作成
2. Triggerが起動し、数分以内にPRが作られるか確認
3. `x-tips/WIKI.md` / `QUEUE.md` / `SOURCES.md` に新しいエントリが追加されているか確認
4. 問題なければスマホのショートカットから実際に投げてみる

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| `"message": "Requires authentication"` (401) | `Authorization` ヘッダの値に `Bearer `(スキーム+半角スペース)が付いていない。素のトークンだけだとGitHubは認証情報自体を認識できない | 値を `Bearer <トークン>` の1行にする(`Bearer`の綴り・スペース1個に注意) |
| `"message": "Resource not accessible by personal access token"` (403) | トークンは認証できているが、Issuesの権限が `Read and write` になっていない(Read-only/No accessのまま) | Step1のトークン設定を見直すか、トークンをDeleteして作り直し、`Issues: Read and write` を確認してから再発行 |
| その他401/403 | PATの期限切れ・リポジトリ選択ミス | Step1をやり直し、Repository accessに `claude-code-video-toolkit` が選ばれているか確認 |
| Issueは作られるがTriggerが動かない | Trigger未設定 or label不一致 | Step3の設定、labelが `x-tip` 完全一致か確認 |
| PRは作られるがwikiが更新されていない | tip_textが空・曖昧すぎる | Issue本文にツイート本文をそのまま貼る(要約だけだと精度が落ちる) |
