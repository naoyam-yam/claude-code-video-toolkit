#!/usr/bin/env tsx
/**
 * Files a GitHub issue with the `decision` template body for a question a
 * human needs to answer, then labels it `needs-decision`. Designed to be
 * called from the nightly run when it hits a fork it can't resolve with a
 * documented default — see docs/operations/decision-queue.md.
 *
 * Requires GITHUB_TOKEN + GITHUB_REPOSITORY (both are already present in
 * GitHub Actions; set them in .env for local/manual use). If the token is
 * missing, prints the issue body to stdout instead of failing, so nightly
 * runs never block on this.
 *
 * Usage:
 *   tsx scripts/create-decision-issue.ts \
 *     --title "価格を決める" \
 *     --question "買い切りとサブスクどちらにするか" \
 *     --option-a "買い切り 5,000円" \
 *     --option-b "月額 500円" \
 *     --recommendation "サブスク" \
 *     --reason "継続復習という価値提供と月額課金の相性が良いため" \
 *     --unblocked "UI実装・DoD消化は価格未確定でも進められる" \
 *     --default "回答がない場合はサブスク 500円/月を仮価格として実装を進める"
 */
function arg(name: string, fallback = ""): string {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? (process.argv[idx + 1] ?? fallback) : fallback;
}

const title = arg("title", "判断が必要な項目");
const body = `## 判断したいこと
${arg("question", "(未記入)")}

## 選択肢A
${arg("option-a", "(未記入)")}

## 選択肢B
${arg("option-b", "(未記入)")}

## 推奨案
${arg("recommendation", "(未記入)")}

## 推奨理由
${arg("reason", "(未記入)")}

## 未回答でも進められる作業
${arg("unblocked", "(未記入)")}

## 回答がない場合のデフォルト
${arg("default", "(未記入)")}
`;

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;

  if (!token || !repo) {
    console.log("GITHUB_TOKEN or GITHUB_REPOSITORY not set — printing issue instead of creating it:\n");
    console.log(`# ${title}\n\n${body}`);
    return;
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title, body, labels: ["needs-decision"] }),
  });

  if (!res.ok) {
    console.error(`Failed to create issue: ${res.status} ${await res.text()}`);
    process.exitCode = 1;
    return;
  }

  const issue = (await res.json()) as { html_url: string };
  console.log(`Created decision issue: ${issue.html_url}`);
}

main();
