#!/usr/bin/env tsx
/**
 * Wrapper around `playwright test tests/e2e/screenshots.spec.ts` so both
 * humans and the nightly run have one command. Requires `npm run build &&
 * npm run start` (or BASE_URL pointing at a running instance / Vercel
 * preview) — playwright.config.ts's webServer handles this locally.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  ["playwright", "test", "tests/e2e/screenshots.spec.ts", "--reporter=list"],
  { stdio: "inherit", shell: process.platform === "win32" }
);

process.exit(result.status ?? 1);
