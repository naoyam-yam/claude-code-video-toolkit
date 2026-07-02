#!/usr/bin/env tsx
/**
 * Generates docs/operations/notion-update-draft.md — a paste-ready Markdown
 * block for the "AI副業 統合戦略ドキュメント v1.0" page's progress log —
 * from the current DoD status and git log. Used when direct Notion API/MCP
 * access isn't available in the running environment (see
 * docs/operations/notion-update-spec.md for the direct-update path).
 *
 * Usage: tsx scripts/notion-update-draft.ts
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");

function recentCommits(): string {
  try {
    return execSync('git log -10 --pretty=format:"- %ad %s" --date=short', { cwd: ROOT }).toString();
  } catch {
    return "(git log unavailable in this environment)";
  }
}

function dodSummary(): string {
  try {
    const raw = execSync("npx tsx scripts/collect-dod-status.ts --json", { cwd: ROOT }).toString();
    const summary = JSON.parse(raw) as { total: number; done: number; blockedOnDecision: number };
    return `${summary.done}/${summary.total} 完了（判断待ち ${summary.blockedOnDecision} 件）`;
  } catch {
    return "(DoD集計はローカルでの実行が必要です: npm run dod:status)";
  }
}

const today = new Date().toISOString().slice(0, 10);

const draft = `# Notion 貼り付け用ドラフト（${today} 生成）

以下を「AI副業 統合戦略ドキュメント v1.0」の末尾（§8 進捗ログ・改訂履歴）に追記してください。

---

## 進捗ログ ${today}

- DoD進捗: ${dodSummary()}
- 直近のコミット:
${recentCommits()}
- 次にAIがやること: docs/operations/dod.md の pendingRunnable 先頭項目を参照
- 人間判断待ち: docs/operations/decision-queue.md および \`needs-decision\` ラベルのIssue一覧を参照

---
`;

const outputPath = join(ROOT, "docs", "operations", "notion-update-draft.md");
writeFileSync(outputPath, draft, "utf-8");
console.log(`Wrote ${outputPath}`);
