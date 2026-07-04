# X Post Queue

Draft posts derived from `WIKI.md`. Copy the text, tweak if needed, post
manually, then flip the status to `posted` (and note the date/URL).

Status: `draft` → `posted` | `skipped`

---

### 1. CLAUDE.md
**Status:** draft

```
Claude Codeはこれをやれ:

プロジェクト直下に CLAUDE.md を置け。

コーディング規約、ディレクトリ構成、よく使うコマンドを書いておくと、
Claude Codeがセッション開始時に自動で読み込む。
毎回同じ説明をする時間がゼロになる。

#ClaudeCode
```

---

### 2. Plan Mode
**Status:** draft

```
Claude Codeはこれをやれ:

大きな変更の前に Plan Mode を使え。

コードを書かせる前に、調査と設計案の提示だけさせて承認する。
方向性のズレは実装前に潰した方が圧倒的に手戻りが少ない。

#ClaudeCode
```

---

### 3. サブエージェント
**Status:** draft

```
Claude Codeはこれをやれ:

広い調査はサブエージェント(Task/Agent)に投げろ。

調査の過程はサブエージェント側に閉じ、要約だけがメインの会話に戻る。
独立した調査は並列に投げると速いし、本筋の文脈も汚れない。

#ClaudeCode
```

---

### 4. カスタムスラッシュコマンド
**Status:** draft

```
Claude Codeはこれをやれ:

.claude/commands/ に定型作業をMarkdownでテンプレ化しろ。

毎回口頭で説明してる手順を /コマンド名 で一発起動に。
チームで共有すれば全員が同じ手順で動く。

#ClaudeCode
```

---

### 5. Hooks
**Status:** draft

```
Claude Codeはこれをやれ:

「毎回言うのが面倒なルール」はプロンプトじゃなくhooksに書け。

settings.json の hooks でツール実行の前後にコマンドを挟める。
lintの強制も通知も、言い忘れが起きない仕組みにできる。

#ClaudeCode
```

---

### 6. 権限モード
**Status:** draft

```
Claude Codeはこれをやれ:

--dangerously-skip-permissions は常用するな。

破壊的操作を止める最後の砦が消える。
定型作業だけ acceptEdits に上げて、危険な操作は default か plan で。

#ClaudeCode
```

---

## 追加のしかた

`/x-tips` で新しいtipsを取り込むと、ここに新しい draft が追記される。
手動で足す場合はこのフォーマット(番号・見出し・Status・コードブロック)を踏襲すること。
