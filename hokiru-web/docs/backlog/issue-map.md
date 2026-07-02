# Issue マップ

`docs/backlog/backlog.md`の各Packageと、それを分解したGitHub Issueの対応表。夜間ランや
人間がIssueを起票する際はこの表を更新する。

| Package | 状態 | 関連Issue | ラベル |
|---------|------|-----------|--------|
| A: 基盤整備 | 完了（このPRで実装） | — | `ai-runnable`, `dod` |
| B: 権利ゲートと問題データ | 実装済み・監修待ち | 監修着手用issueを別途起票（担当: 一級建築士本人） | `rights`, `question-quality`, `needs-decision` |
| C: 学習フロー | 完了 | — | `ai-runnable`, `ui` |
| D: 復習自動化 | 完了 | — | `ai-runnable`, `test` |
| E: 分析 | 完了 | — | `ai-runnable` |
| F: UI公開品質 | 継続中 | Lighthouse計測・アクセシビリティ監査を夜間ランで継続起票 | `ui`, `dod` |
| G: 自動運用 | テンプレート実装済み・有効化待ち | `.github/`をリポジトリ直下へ移動するIssueを起票 | `automation`, `blocked` |
| H: LP・法務・公開準備 | 未着手 | 価格・公開日の判断待ちIssueを起票 | `needs-decision`, `blocked` |

## Issue起票ルール

- 実装可能なタスクは`ai-runnable`ラベルを付け、夜間ランが直接着手する。
- 判断が必要なタスクは`needs-decision`ラベルを付け、`decision.yml`テンプレートで起票する。
- DoD項目に対応するIssueは`dod`ラベルを付け、`docs/operations/dod.md`の該当行を引用する。
- 権利に関わるIssueは`rights`ラベルを必ず付ける。
