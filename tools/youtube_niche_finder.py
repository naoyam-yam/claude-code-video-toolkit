#!/usr/bin/env python3
"""
Research YouTube niches and competitor channels using the YouTube Data API v3.

Read-only lookups (search/videos/channels/playlistItems) only need a plain API key —
NOT the OAuth client used by tools/youtube_upload.py. One-time setup: enable "YouTube
Data API v3" on a Google Cloud project, create an API key, put it in .env. No browser
consent, no test users, no channel access. See docs/youtube-niche-finder.md.

Two modes:
  gap      Demand-vs-supply signal for one or more keywords/themes: total views, unique
           channel count, views-per-channel, and staleness of the current top results.
           Useful for "genres with lots of views but few creators" style research.
  channel  Competitor weakness scan for a single channel: upload cadence, staleness,
           view trend (recent vs older uploads), and view-count variance.

Examples:
  # Demand/supply signal for a couple of Japanese-language themes
  python3 tools/youtube_niche_finder.py gap --keyword "AI 動画編集" --keyword "Remotion 使い方" \\
      --lang ja --region JP --json-out

  # Same, but see the raw per-video/channel detail
  python3 tools/youtube_niche_finder.py gap --keyword "ボイスクローン 使い方" --lang ja --verbose

  # Competitor weakness scan by channel ID, handle, or full URL
  python3 tools/youtube_niche_finder.py channel --channel-id UC_x5XG1OV2P6uZZ5FSM9Ttw --json-out
  python3 tools/youtube_niche_finder.py channel --handle @somechannel
  python3 tools/youtube_niche_finder.py channel --channel-url https://www.youtube.com/@somechannel

# -----------------------------------------------------------------------------
# QUOTA REALITIES (YouTube Data API v3, default 10,000 units/day/project)
#   search.list        ~100 units/call  -> `gap` costs ~100 units PER KEYWORD.
#   videos.list          ~1 unit/call   (batched, up to 50 ids per call)
#   channels.list         ~1 unit/call  (batched, up to 50 ids per call)
#   playlistItems.list     ~1 unit/call (used by `channel` mode instead of search.list)
#   `channel` mode avoids search.list entirely, so it costs a handful of units total.
#   `gap` mode is the expensive one — budget ~100 keywords/day on the default quota.
# -----------------------------------------------------------------------------
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

try:
    import requests
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install requests python-dotenv")
    sys.exit(1)

load_dotenv()

sys.path.insert(0, str(Path(__file__).parent))

API_BASE = "https://www.googleapis.com/youtube/v3"
VALID_ORDER = ("viewCount", "relevance", "date", "rating")


def log(msg: str, level: str = "info"):
    """Print a formatted log message to stderr (stdout is reserved for --json-out)."""
    colors = {"info": "\033[94m", "success": "\033[92m", "error": "\033[91m", "warn": "\033[93m", "dim": "\033[90m"}
    reset = "\033[0m"
    prefix = {"info": "->", "success": "OK", "error": "!!", "warn": "??", "dim": "  "}
    color = colors.get(level, "")
    print(f"{color}{prefix.get(level, '->')} {msg}{reset}", file=sys.stderr)


class ApiError(Exception):
    """A YouTube Data API request failed. Carries the machine-readable reason if present."""

    def __init__(self, message: str, reason: Optional[str] = None, status: Optional[int] = None):
        super().__init__(message)
        self.reason = reason
        self.status = status


def yt_get(endpoint: str, params: dict, api_key: str) -> dict:
    """GET against the YouTube Data API v3 REST surface. Raises ApiError on failure."""
    resp = requests.get(f"{API_BASE}/{endpoint}", params={**params, "key": api_key}, timeout=30)
    if resp.status_code != 200:
        reason = None
        try:
            errors = resp.json().get("error", {}).get("errors", [])
            reason = errors[0].get("reason") if errors else None
        except (ValueError, KeyError, IndexError):
            pass
        raise ApiError(f"HTTP {resp.status_code} on {endpoint}: {resp.text[:300]}", reason, resp.status_code)
    return resp.json()


def paged_items(endpoint: str, params: dict, api_key: str, max_items: int) -> list[dict]:
    """Follow nextPageToken until max_items collected or the API runs out of pages."""
    items: list[dict] = []
    page_params = dict(params)
    while len(items) < max_items:
        data = yt_get(endpoint, page_params, api_key)
        items.extend(data.get("items", []))
        token = data.get("nextPageToken")
        if not token:
            break
        page_params["pageToken"] = token
    return items[:max_items]


def batched(seq: list, size: int = 50):
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


# ---------------------------------------------------------------------------
# gap mode
# ---------------------------------------------------------------------------
def days_since(iso_ts: str) -> float:
    published = datetime.fromisoformat(iso_ts.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - published).total_seconds() / 86400


def analyze_keyword(keyword: str, api_key: str, *, lang: str, region: str, order: str, max_results: int) -> dict:
    search_params = {
        "part": "id",
        "q": keyword,
        "type": "video",
        "order": order,
        "maxResults": min(max_results, 50),
    }
    if lang:
        search_params["relevanceLanguage"] = lang
    if region:
        search_params["regionCode"] = region

    search_data = yt_get("search", search_params, api_key)
    video_ids = [item["id"]["videoId"] for item in search_data.get("items", []) if item.get("id", {}).get("videoId")]

    if not video_ids:
        return {
            "keyword": keyword, "videoCount": 0, "uniqueChannelCount": 0,
            "totalViews": 0, "viewsPerChannel": 0, "note": "No results — try a broader keyword or different region/language.",
        }

    videos: list[dict] = []
    for chunk in batched(video_ids, 50):
        data = yt_get("videos", {"part": "snippet,statistics", "id": ",".join(chunk)}, api_key)
        videos.extend(data.get("items", []))

    channel_ids = sorted({v["snippet"]["channelId"] for v in videos})
    channels: dict[str, dict] = {}
    for chunk in batched(channel_ids, 50):
        data = yt_get("channels", {"part": "snippet,statistics", "id": ",".join(chunk)}, api_key)
        for c in data.get("items", []):
            channels[c["id"]] = c

    views_by_channel: dict[str, int] = {}
    total_views = 0
    ages_days: list[float] = []
    for v in videos:
        view_count = int(v.get("statistics", {}).get("viewCount", 0))
        total_views += view_count
        cid = v["snippet"]["channelId"]
        views_by_channel[cid] = views_by_channel.get(cid, 0) + view_count
        published_at = v["snippet"].get("publishedAt")
        if published_at:
            ages_days.append(days_since(published_at))

    top_channels = sorted(views_by_channel.items(), key=lambda kv: kv[1], reverse=True)[:5]
    top_channel_share = (top_channels[0][1] / total_views) if top_channels and total_views else 0.0

    top_channel_details = []
    for cid, sample_views in top_channels:
        c = channels.get(cid, {})
        stats = c.get("statistics", {})
        top_channel_details.append({
            "channelId": cid,
            "title": c.get("snippet", {}).get("title", "unknown"),
            "subscriberCount": int(stats.get("subscriberCount", 0)) if not stats.get("hiddenSubscriberCount") else None,
            "channelVideoCount": int(stats.get("videoCount", 0)) if stats.get("videoCount") is not None else None,
            "viewsInSample": sample_views,
        })

    unique_channel_count = len(channel_ids)
    return {
        "keyword": keyword,
        "videoCount": len(videos),
        "uniqueChannelCount": unique_channel_count,
        "totalViews": total_views,
        "viewsPerChannel": round(total_views / unique_channel_count, 1) if unique_channel_count else 0,
        "avgVideoAgeDays": round(statistics.mean(ages_days), 1) if ages_days else None,
        "oldestVideoAgeDays": round(max(ages_days), 1) if ages_days else None,
        "newestVideoAgeDays": round(min(ages_days), 1) if ages_days else None,
        "topChannelViewShare": round(top_channel_share, 3),
        "topChannels": top_channel_details,
    }


GAP_CAVEATS = [
    "search.list only samples the top N results for the given order (default: viewCount), "
    "not the full corpus — treat counts as directional signal, not a census.",
    "order=viewCount surfaces all-time hits, which can be old viral videos unrelated to "
    "current demand; cross-check avgVideoAgeDays and consider also running with --order date.",
    "relevanceLanguage/regionCode bias results but don't strictly filter by language — "
    "spot-check a few titles.",
    "High viewsPerChannel + few uniqueChannelCount + stale avgVideoAgeDays together are a "
    "reasonable 'demand outpacing supply' signal; any single metric alone is weak evidence.",
]


def run_gap(args, api_key: str) -> dict:
    results = []
    for keyword in args.keyword:
        log(f"Searching '{keyword}' (order={args.order}, lang={args.lang or '-'}, region={args.region or '-'})...")
        try:
            results.append(analyze_keyword(
                keyword, api_key, lang=args.lang, region=args.region, order=args.order, max_results=args.max_results,
            ))
        except ApiError as e:
            log(f"'{keyword}' failed: {e}", "error")
            results.append({"keyword": keyword, "error": str(e), "errorReason": e.reason})

    if not args.json_out:
        for r in results:
            if "error" in r:
                continue
            log(
                f"[{r['keyword']}] {r['videoCount']} videos / {r['uniqueChannelCount']} channels, "
                f"total views {r['totalViews']:,}, views/channel {r['viewsPerChannel']:,.0f}, "
                f"avg age {r['avgVideoAgeDays']}d, top channel holds {r['topChannelViewShare']*100:.0f}% of sampled views",
                "success",
            )
            if args.verbose:
                for tc in r["topChannels"]:
                    log(f"    - {tc['title']} (subs={tc['subscriberCount']}, sample views={tc['viewsInSample']:,})", "dim")

    return {"success": True, "mode": "gap", "language": args.lang, "region": args.region, "order": args.order, "results": results, "caveats": GAP_CAVEATS}


# ---------------------------------------------------------------------------
# channel mode
# ---------------------------------------------------------------------------
def parse_channel_ref(args) -> dict:
    """Return kwargs for the channels.list identity params (id / forHandle / forUsername)."""
    if args.channel_id:
        return {"id": args.channel_id}
    if args.handle:
        return {"forHandle": args.handle if args.handle.startswith("@") else f"@{args.handle}"}
    if args.channel_url:
        url = args.channel_url
        m = re.search(r"youtube\.com/channel/([\w-]+)", url)
        if m:
            return {"id": m.group(1)}
        m = re.search(r"youtube\.com/@([\w.-]+)", url)
        if m:
            return {"forHandle": f"@{m.group(1)}"}
        m = re.search(r"youtube\.com/(?:c|user)/([\w.-]+)", url)
        if m:
            return {"forUsername": m.group(1)}
        raise ValueError(
            f"Couldn't parse a channel ID or handle out of: {url}. "
            "Pass --channel-id or --handle directly instead."
        )
    raise ValueError("Provide one of --channel-id, --handle, or --channel-url.")


def resolve_channel(args, api_key: str) -> dict:
    ref = parse_channel_ref(args)
    data = yt_get("channels", {"part": "snippet,statistics,contentDetails", **ref}, api_key)
    items = data.get("items", [])
    if not items:
        raise ApiError(f"No channel found for {ref}")
    return items[0]


def analyze_channel(args, api_key: str) -> dict:
    channel = resolve_channel(args, api_key)
    stats = channel.get("statistics", {})
    uploads_playlist = channel["contentDetails"]["relatedPlaylists"]["uploads"]

    log(f"Channel: {channel['snippet']['title']} ({channel['id']}) — fetching recent uploads...")
    playlist_items = paged_items(
        "playlistItems",
        {"part": "contentDetails", "playlistId": uploads_playlist, "maxResults": 50},
        api_key,
        max_items=args.max_videos,
    )
    video_ids = [pi["contentDetails"]["videoId"] for pi in playlist_items]

    videos: list[dict] = []
    for chunk in batched(video_ids, 50):
        data = yt_get("videos", {"part": "snippet,statistics", "id": ",".join(chunk)}, api_key)
        videos.extend(data.get("items", []))
    # playlistItems.list already returns newest-first; keep that order.
    videos.sort(key=lambda v: v["snippet"]["publishedAt"], reverse=True)

    view_counts = [int(v.get("statistics", {}).get("viewCount", 0)) for v in videos]
    published_dates = [datetime.fromisoformat(v["snippet"]["publishedAt"].replace("Z", "+00:00")) for v in videos]

    flags = []
    cadence = None
    if len(published_dates) >= 2:
        gaps_days = [
            (published_dates[i] - published_dates[i + 1]).total_seconds() / 86400
            for i in range(len(published_dates) - 1)
        ]
        avg_gap = statistics.mean(gaps_days)
        stdev_gap = statistics.pstdev(gaps_days) if len(gaps_days) > 1 else 0.0
        days_since_last = (datetime.now(timezone.utc) - published_dates[0]).total_seconds() / 86400
        cadence = {
            "avgDaysBetweenUploads": round(avg_gap, 1),
            "stdevDaysBetweenUploads": round(stdev_gap, 1),
            "daysSinceLastUpload": round(days_since_last, 1),
        }
        if days_since_last > max(60.0, avg_gap * 3):
            flags.append("stale_channel_recent_upload_far_overdue")
        if avg_gap and stdev_gap > avg_gap:
            flags.append("irregular_upload_cadence")

    trend = None
    if len(view_counts) >= 4:
        half = len(view_counts) // 2
        recent_avg = statistics.mean(view_counts[:half])
        older_avg = statistics.mean(view_counts[half:])
        direction = "flat"
        if older_avg > 0:
            delta = (recent_avg - older_avg) / older_avg
            if delta <= -0.25:
                direction = "declining"
                flags.append("declining_view_trend")
            elif delta >= 0.25:
                direction = "growing"
        trend = {"recentAvgViews": round(recent_avg, 1), "olderAvgViews": round(older_avg, 1), "direction": direction}

    view_stats = None
    if view_counts:
        view_stats = {
            "avg": round(statistics.mean(view_counts), 1),
            "median": statistics.median(view_counts),
            "max": max(view_counts),
            "min": min(view_counts),
        }
        if view_stats["median"] and view_stats["max"] / max(view_stats["median"], 1) > 5:
            flags.append("high_view_variance_hit_or_miss_content")

    subscriber_count = int(stats.get("subscriberCount", 0)) if not stats.get("hiddenSubscriberCount") else None
    if subscriber_count and view_stats and subscriber_count > 0:
        engagement_ratio = view_stats["avg"] / subscriber_count
        if engagement_ratio < 0.05:
            flags.append("low_view_to_subscriber_ratio")
    else:
        engagement_ratio = None

    return {
        "success": True,
        "mode": "channel",
        "channel": {
            "id": channel["id"],
            "title": channel["snippet"]["title"],
            "subscriberCount": subscriber_count,
            "totalVideoCount": int(stats.get("videoCount", 0)),
            "totalViewCount": int(stats.get("viewCount", 0)),
        },
        "sampleSize": len(videos),
        "uploadCadence": cadence,
        "views": view_stats,
        "viewToSubscriberRatio": round(engagement_ratio, 3) if engagement_ratio is not None else None,
        "trend": trend,
        "flags": flags,
        "recentVideos": [
            {
                "id": v["id"],
                "title": v["snippet"]["title"],
                "publishedAt": v["snippet"]["publishedAt"],
                "viewCount": int(v.get("statistics", {}).get("viewCount", 0)),
            }
            for v in videos
        ],
    }


def run_channel(args, api_key: str) -> dict:
    try:
        result = analyze_channel(args, api_key)
    except (ApiError, ValueError) as e:
        log(str(e), "error")
        return {"success": False, "mode": "channel", "error": str(e)}

    if not args.json_out:
        c = result["channel"]
        log(f"{c['title']}: {c['subscriberCount']} subs, {c['totalVideoCount']} videos, sampled {result['sampleSize']} recent uploads", "success")
        if result["uploadCadence"]:
            log(f"  Cadence: avg {result['uploadCadence']['avgDaysBetweenUploads']}d between uploads, "
                f"last upload {result['uploadCadence']['daysSinceLastUpload']}d ago", "dim")
        if result["trend"]:
            log(f"  View trend: {result['trend']['direction']} (recent avg {result['trend']['recentAvgViews']:,.0f} "
                f"vs older avg {result['trend']['olderAvgViews']:,.0f})", "dim")
        if result["flags"]:
            log(f"  Flags: {', '.join(result['flags'])}", "warn")
        else:
            log("  No weakness flags triggered on the sampled uploads.", "dim")

    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Research YouTube niches (demand/supply gaps) and competitor channels via the Data API v3.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s gap --keyword "AI 動画編集" --keyword "Remotion 使い方" --lang ja --region JP --json-out
  %(prog)s channel --handle @somechannel --json-out

Setup (read-only API key, NOT the OAuth client used by youtube_upload.py):
  docs/youtube-niche-finder.md
        """,
    )
    sub = parser.add_subparsers(dest="mode", required=True)

    # Shared so --json-out can be passed after the subcommand (as documented above),
    # not just before it on the root parser.
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--json-out", action="store_true", help="Emit a single machine-readable JSON line to stdout")

    gap = sub.add_parser("gap", parents=[common], help="Demand/supply signal for one or more keywords")
    gap.add_argument("--keyword", action="append", required=True, help="Keyword/theme to research (repeatable)")
    gap.add_argument("--lang", default="ja", help="ISO 639-1 relevanceLanguage hint (default: ja)")
    gap.add_argument("--region", default="JP", help="ISO 3166-1 alpha-2 regionCode (default: JP)")
    gap.add_argument("--order", choices=VALID_ORDER, default="viewCount", help="search.list order (default: viewCount)")
    gap.add_argument("--max-results", type=int, default=25, help="Videos to sample per keyword, max 50 (default: 25)")
    gap.add_argument("--verbose", action="store_true", help="Also print the top channels per keyword")

    channel = sub.add_parser("channel", parents=[common], help="Competitor weakness scan for a single channel")
    ref_group = channel.add_mutually_exclusive_group(required=True)
    ref_group.add_argument("--channel-id", help="Channel ID, e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw")
    ref_group.add_argument("--handle", help="Channel handle, with or without leading @")
    ref_group.add_argument("--channel-url", help="Any youtube.com/channel|@|c|user URL")
    channel.add_argument("--max-videos", type=int, default=25, help="Recent uploads to sample (default: 25)")

    return parser


def main():
    args = build_parser().parse_args()
    from config import get_youtube_api_key

    api_key = get_youtube_api_key()
    if not api_key:
        msg = (
            "YOUTUBE_API_KEY not set. This is a plain read-only API key (not the OAuth client "
            "used by youtube_upload.py) — see docs/youtube-niche-finder.md for the ~2-minute "
            "Google Cloud Console setup."
        )
        log(msg, "error")
        if args.json_out:
            print(json.dumps({"success": False, "error": msg, "errorType": "config"}))
        sys.exit(1)

    if args.mode == "gap":
        result = run_gap(args, api_key)
    else:
        result = run_channel(args, api_key)

    if args.json_out:
        print(json.dumps(result, ensure_ascii=False))

    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
