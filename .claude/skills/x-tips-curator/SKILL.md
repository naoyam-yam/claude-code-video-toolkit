---
name: x-tips-curator
description: Curate viral "Claude Code tips" found on X (Twitter) into the x-tips/ wiki and a ready-to-post draft queue. Use when the user pastes a tweet, URL, or description of a Claude Code trick and wants it fact-checked, written up, and queued for posting. Triggers include X post, tweet, viral tip, バズってる, Claude Codeのtips, curate a tip, add to wiki, x-tips.
---

# X Tips Curator

Turns a raw "Claude Code, do this" tip (pasted tweet text, a URL, or a
plain description) into three things:

1. A fact-checked entry in `x-tips/WIKI.md`
2. A short, hook-first Japanese X post draft in `x-tips/QUEUE.md`
3. An attribution row in `x-tips/SOURCES.md`

Read `x-tips/README.md` first for the overall system this fits into.
**This skill never posts to X** — there is no X/Twitter API access in
this environment. It only prepares content for the user to review and
post manually.

## Input

The user will give you one of:
- Pasted tweet/post text (possibly with a URL)
- A URL to an X post (if you can't fetch it, ask the user to paste the text)
- A plain-language description of a trick they saw
- A GitHub Issue body created from the `x-tip` issue form (see
  `x-tips/MOBILE-CAPTURE.md`) — it has `source_url`, `tip_text`, and an
  optional `note` field; treat `tip_text` as the raw tip and `source_url`
  as the source for `SOURCES.md`. If invoked this way, open a PR with the
  changes and comment the PR link back on the originating issue instead
  of just showing a diff summary.

## Steps

1. **Extract the core claim.** Strip engagement bait ("this changed my
   life", thread emoji, etc.) down to the one actionable mechanism being
   described.

2. **Verify it, don't just transcribe it.** Check whether the claim
   matches actual Claude Code behavior:
   - Cross-check against this repo's own skills/commands if relevant
     (e.g. a tip about hooks — check `.claude/settings.json` patterns
     used elsewhere in this repo, or general Claude Code docs knowledge).
   - If you can confirm it's accurate, mark it ✅ verified.
   - If it's plausible but you can't independently confirm it (no way to
     test the exact scenario), mark it 🟡 unverified and say so in the
     entry — do not silently upgrade unverified claims to verified.
   - If it's flat wrong or outdated, say so plainly instead of adding it.
     Tell the user why, don't add a wiki entry for a bad tip.

3. **Write the wiki entry** — append to the right category section in
   `x-tips/WIKI.md` (Setup / Workflow / Customization / Productivity /
   Gotchas; add a new category heading only if none fit). Follow the
   existing format: `### Title <status emoji>` then 2-4 sentences: what
   it is, why it matters, any caveat.

4. **Draft the X post** — append a new numbered entry to `x-tips/QUEUE.md`
   using the existing format (hook line "Claude Codeはこれをやれ:", one
   mechanism, one payoff line, `#ClaudeCode` hashtag). Keep it short
   enough to read in one glance — this is a single tip, not a thread.
   Status starts as `draft`.

5. **Log the source** — append a row to `x-tips/SOURCES.md` with the
   wiki entry title, the source URL (or `—` if the user only described
   it verbally, with a note), and today's date.

6. Show the user a short diff summary of what was added to each file so
   they can review before posting.

## What NOT to do

- Don't invent a source URL if the user didn't give one — use `—` and a
  note.
- Don't mark something ✅ verified unless you actually checked it.
- Don't post anything anywhere — output only lives in these three files.
- Don't duplicate an existing wiki entry — if the same tip already
  exists, point the user to it instead of adding a near-duplicate.
