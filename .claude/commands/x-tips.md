---
description: Curate a viral X (Twitter) Claude Code tip into the wiki + post queue
---

# X Tips

Guided workflow for turning a Claude Code tip you saw going viral on X
into a wiki entry and a ready-to-post draft. Uses the `x-tips-curator`
skill. See `x-tips/README.md` for how the whole system fits together.

**This does not post to X.** There's no Twitter/X API access here — it
only prepares content in `x-tips/WIKI.md`, `x-tips/QUEUE.md`, and
`x-tips/SOURCES.md` for you to review and post yourself.

## Usage

```
/x-tips
```

## Step 1: Get the raw tip

Ask the user for one of:
- The tweet/post text (paste it in), plus the URL if they have it
- Just the URL (try to fetch it; if it can't be fetched, ask them to
  paste the text instead)
- A plain description of the trick if there's no source post at all

## Step 2: Curate

Invoke the `x-tips-curator` skill with that input. It will:
1. Extract the core claim
2. Verify it against actual Claude Code behavior (or mark it unverified)
3. Add an entry to `x-tips/WIKI.md`
4. Draft a post in `x-tips/QUEUE.md`
5. Log the source in `x-tips/SOURCES.md`

## Step 3: Review

Show the user what was added/changed in each of the three files. Let
them request wording edits before they copy the draft out and post it
manually.

## Notes

- If the claim turns out to be wrong or unverifiable and low-confidence,
  say so and don't add it — a wiki full of bad tips isn't the goal.
- If a very similar tip is already in `WIKI.md`, point to the existing
  entry instead of creating a near-duplicate.
