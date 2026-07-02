# X Tips Account — Claude Code Tips Curation

A lightweight system for running an X (Twitter) account that curates
viral "Claude Code, do this" tips, and keeps a durable wiki of the same
content in this repo.

## Scope and limits

**This repo has no X/Twitter API credentials and no posting automation.**
Nothing here posts to X on its own. What it does do:

1. Take a tip you found going viral (paste the tweet text, a URL, or a
   screenshot description) into `/x-tips`.
2. Turn it into a fact-checked wiki entry (`WIKI.md`) and a ready-to-post
   Japanese draft (`QUEUE.md`), and log the source (`SOURCES.md`).
3. You copy the draft from `QUEUE.md` and post it to X yourself (or wire
   up your own posting automation later — see "Future automation" below).

## Files

| File | Purpose |
|------|---------|
| `WIKI.md` | The canonical, categorized list of Claude Code tips. This is the "wiki" — durable, fact-checked, one entry per tip. |
| `QUEUE.md` | Draft X posts derived from `WIKI.md` entries, ready to copy-paste. Mark each `posted` once it goes out. |
| `SOURCES.md` | Attribution log — which tip came from which tweet/post, so credit isn't lost. |
| `MOBILE-CAPTURE.md` | Optional, isolated add-on: share a post from the X app on your phone straight into this pipeline via a GitHub Issue + Trigger. Uses its own minimally-scoped token — see that file's security section before setting it up. |

## Workflow

```
/x-tips
```

Paste the raw tip (tweet text/URL, or just describe the trick). The
`x-tips-curator` skill will:

- Verify the claim against actual Claude Code behavior where possible
  (check docs/skills in this repo, or flag as "unverified" if it can't be
  confirmed)
- Add a categorized entry to `WIKI.md`
- Draft a short, hook-first X post in `QUEUE.md`
- Log the source in `SOURCES.md`

Review the diff, edit wording to taste, then post manually.

## Future automation

If you later want actual auto-posting, you'd need to:
1. Add X API v2 credentials (`X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`,
   `X_ACCESS_SECRET`) to `.env` — not present today.
2. Add a small posting script (e.g. `tools/x_post.py`) using `tweepy` or
   direct API calls, reading unposted entries from `QUEUE.md`.
3. Optionally wire a GitHub Actions cron job to post on a schedule.

This is intentionally not built yet — it requires credentials only you
can provide, and unattended posting to a public account is a
higher-stakes action than anything else in this toolkit.
