# YouTube niche & competitor research

`tools/youtube_niche_finder.py` uses the **YouTube Data API v3** to look for
demand-vs-supply gaps in a theme ("lots of views, few creators") and to scan a
competitor channel for weaknesses (upload cadence, staleness, view trend).

> **This is a plain API key, not the OAuth client `youtube_upload.py` uses.** No browser
> consent, no test users, no channel access — just "enable the API, create a key." Setup
> takes about 2 minutes.

---

## One-time setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and pick/create a
   project (you can reuse the same project as `youtube_upload.py`, or use a separate one).
2. **APIs & Services → Library → "YouTube Data API v3" → Enable.**
3. **APIs & Services → Credentials → Create Credentials → API key.**
4. (Recommended) Click the new key → **API restrictions → Restrict key → YouTube Data API v3**,
   so the key can't be used against unrelated Google APIs if it leaks.
5. Add it to `.env`:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

That's it — no `--auth` step, no cached token.

---

## `gap` mode — demand/supply signal for a theme

```bash
python3 tools/youtube_niche_finder.py gap \
    --keyword "AI 動画編集" --keyword "Remotion 使い方" \
    --lang ja --region JP --json-out
```

For each `--keyword`, this samples the top results (`search.list`, default
`--order viewCount`) and reports:

- `videoCount` / `uniqueChannelCount` — how many distinct channels are serving this theme
- `totalViews` / `viewsPerChannel` — demand concentrated across few channels is a supply-gap signal
- `avgVideoAgeDays` — stale top results (old videos still ranking) suggest nobody's actively serving the theme
- `topChannels` — the channels currently capturing the most views in the sample, with subscriber counts

```bash
# See the raw per-channel breakdown instead of just the summary line
python3 tools/youtube_niche_finder.py gap --keyword "ボイスクローン 使い方" --lang ja --verbose

# Order by recency instead of all-time views, to check if the theme is *currently* active
python3 tools/youtube_niche_finder.py gap --keyword "AI 音楽生成" --order date --json-out
```

### Reading the signal honestly

- `search.list` samples the top N results for the chosen `--order`; it is **not a census**
  of the whole theme. Treat the numbers as directional, not exact.
- `--order viewCount` surfaces all-time hits, which can be old viral videos with nothing to
  do with current demand. Cross-check `avgVideoAgeDays`, or re-run with `--order date` to see
  what's currently being published.
- The strongest signal is **all three together**: high `viewsPerChannel`, low
  `uniqueChannelCount`, and high `avgVideoAgeDays`. Any one metric alone is weak evidence.
- `relevanceLanguage` / `regionCode` bias results toward Japanese/Japan but don't strictly
  filter by language — spot-check a few titles before trusting a "gap."

---

## `channel` mode — competitor weakness scan

```bash
python3 tools/youtube_niche_finder.py channel --channel-id UC_x5XG1OV2P6uZZ5FSM9Ttw --json-out
python3 tools/youtube_niche_finder.py channel --handle @somechannel
python3 tools/youtube_niche_finder.py channel --channel-url https://www.youtube.com/@somechannel
```

Fetches the channel's recent uploads (via its uploads playlist — no `search.list` calls, so
this mode is nearly free on quota) and computes:

- **Upload cadence** — average/variance of days between uploads, and days since the last one
- **View trend** — recent uploads' average views vs older ones (`growing` / `flat` / `declining`)
- **View variance** — a few viral outliers vs a long tail of misses
- **View-to-subscriber ratio** — low ratio suggests an audience that's stopped engaging

`flags` in the output surface the concrete weaknesses found, e.g.:

- `stale_channel_recent_upload_far_overdue` — quiet well past its usual cadence
- `irregular_upload_cadence` — inconsistent schedule (variance exceeds the average gap)
- `declining_view_trend` — recent uploads underperforming older ones by 25%+
- `high_view_variance_hit_or_miss_content` — a few big hits, most videos underperform
- `low_view_to_subscriber_ratio` — subscriber base isn't showing up for new uploads

---

## Quota notes

Default quota is 10,000 units/day/project.

| Call | Cost | Used by |
|---|---|---|
| `search.list` | ~100 units | `gap` mode, once per `--keyword` |
| `videos.list` | ~1 unit (batched, up to 50 ids/call) | both modes |
| `channels.list` | ~1 unit (batched) | both modes |
| `playlistItems.list` | ~1 unit/page | `channel` mode |

`gap` mode is the expensive one — budget roughly 100 `--keyword` runs/day on the default
quota. `channel` mode avoids `search.list` entirely and costs only a handful of units per
channel scanned.
