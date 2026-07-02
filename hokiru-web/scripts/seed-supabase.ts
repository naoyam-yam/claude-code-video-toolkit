#!/usr/bin/env tsx
/**
 * Pushes only rights-gate-cleared questions (canPublishQuestion === true)
 * into a Supabase `questions` table. Never writes unsupervised or
 * third_party_restricted/internal_reference_only rows — this is the
 * enforcement point for "公開可否判定" at the data layer, not just in the UI.
 *
 * No-ops (with a clear message) when Supabase env vars aren't set, so this
 * never blocks local dev or the nightly run.
 *
 * Usage: tsx scripts/seed-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { originalSampleQuestions } from "../data/seed/original-sample-questions";
import { filterPublishable } from "../lib/rights/canPublishQuestion";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const publishable = filterPublishable(originalSampleQuestions);
  console.log(`${publishable.length}/${originalSampleQuestions.length} seed questions pass the rights gate.`);

  if (!url || !serviceRoleKey) {
    console.log("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping remote seed (needs-human-auth).");
    console.log("See docs/operations/ai-nightly-run.md for required secrets.");
    return;
  }

  if (publishable.length === 0) {
    console.log("No publishable questions yet (all seed data awaits 一級建築士 supervision) — nothing to seed.");
    return;
  }

  const supabase = createClient(url, serviceRoleKey);
  const { error } = await supabase.from("questions").upsert(publishable, { onConflict: "questionId" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log(`Seeded ${publishable.length} questions to Supabase.`);
}

main();
