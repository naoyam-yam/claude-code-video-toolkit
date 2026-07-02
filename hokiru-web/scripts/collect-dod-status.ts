#!/usr/bin/env tsx
/**
 * Parses docs/operations/dod.md checkbox items ("- [ ]" / "- [x]") into a
 * JSON summary so the nightly run can pick the next unchecked, non-blocked
 * item without a human re-reading the whole file every time.
 *
 * Usage: tsx scripts/collect-dod-status.ts [--json]
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface DodItem {
  category: string;
  text: string;
  done: boolean;
  needsDecision: boolean;
}

const DOD_PATH = join(__dirname, "..", "docs", "operations", "dod.md");

function parseDod(markdown: string): DodItem[] {
  const items: DodItem[] = [];
  let category = "uncategorized";

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      category = heading[1]!.trim();
      continue;
    }

    const checkbox = line.match(/^-\s+\[( |x|X)\]\s+(.*)$/);
    if (checkbox) {
      const text = checkbox[2]!.trim();
      items.push({
        category,
        text,
        done: checkbox[1]!.toLowerCase() === "x",
        needsDecision: /needs-decision|判断待ち|判断が必要/i.test(text),
      });
    }
  }

  return items;
}

function main() {
  const markdown = readFileSync(DOD_PATH, "utf-8");
  const items = parseDod(markdown);

  const pending = items.filter((i) => !i.done && !i.needsDecision);
  const blocked = items.filter((i) => !i.done && i.needsDecision);
  const done = items.filter((i) => i.done);

  const summary = {
    total: items.length,
    done: done.length,
    pendingRunnable: pending.length,
    blockedOnDecision: blocked.length,
    nextRunnable: pending[0] ?? null,
    byCategory: Object.fromEntries(
      [...new Set(items.map((i) => i.category))].map((category) => {
        const inCategory = items.filter((i) => i.category === category);
        return [category, { total: inCategory.length, done: inCategory.filter((i) => i.done).length }];
      })
    ),
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`DoD: ${summary.done}/${summary.total} done, ${summary.blockedOnDecision} blocked on decision`);
    if (summary.nextRunnable) {
      console.log(`Next runnable item: [${summary.nextRunnable.category}] ${summary.nextRunnable.text}`);
    } else {
      console.log("No runnable DoD item found — everything left is blocked on a decision, or DoD is complete.");
    }
  }
}

main();
