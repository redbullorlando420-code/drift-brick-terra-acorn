# Twitch VOD chapters and explicit pull canaries

## Chapter workflow

Open a recorded Twitch VOD in Preview or the full player and select **Show VOD chapters**. Live streams and clips have no chapter control. Only this explicit action requests metadata; routine archives, live checks, clips and first paint make no chapter requests.

The panel reads provider-authored game/chapter markers. It never substitutes the current game or title for missing markers. Readable empty metadata gets an empty state; unreadable metadata gets a manual retry with the normal player and official link still available. Invalid, duplicate/overlapping or out-of-range markers are rejected, and partial rejection is disclosed.

Select a marker to reload this device's official embedded VOD at its start time. Re-selecting the same marker also reloads it. The existing embedding parent is retained. This does not write resume progress or send a Watch Together command. **Open on Twitch** provides the same timestamp as a top-level fallback when an embed, mobile autoplay, account access or provider restrictions prevent playback. Actual provider playback is not guaranteed by metadata availability.

The list mounts twelve rows per page. At most 200 markers with 240-character labels are accepted. Selected detail is cached for ten minutes: eight public VOD reports on the server, four in the current browser context, with eight coalesced server requests at most. Full descriptions/catalog graphs are not retained. Unmount/collapse aborts the browser request and ignores late UI delivery; an already-dispatched bounded upstream read may still complete its cache entry. Refresh failure retains previously readable markers. No recurring polling or per-progress persistence was added.

Source validation on 2026-10-28:

- Twitch's official channel VOD `2908640776` returned HTTP 200 and zero markers; no chapter was invented (screenshots/twitch-chapter-source-probe.json).
- Public creator LIRIK's VOD `2913136839` returned HTTP 200 and four real markers (screenshots/twitch-chapter-lirik-probe.json).
- A Shroud lookup returned a public service error and was recorded unavailable, not an empty/exhausted archive (screenshots/twitch-chapter-shroud-probe.json).

The marker query uses the existing anonymous public Twitch GQL metadata path. This is an undocumented provider schema and may change; failure remains explicit, without generating credentials or bypassing access restrictions. Schema cross-check credit: [yt-dlp's Twitch extractor](https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/twitch.py). The adapter is independently implemented; no downloader or media extraction is run for chapters. Timestamp navigation follows [Twitch's documented VOD embed start-time parameter](https://dev.twitch.tv/docs/embed/video-and-clips/).

## Manual canary command

This is an opt-in diagnostic, excluded from ordinary startup and CI. It never loads your followed-account list. Supply one to three public creator logins:

```text
node scripts/twitch-canary.mjs --creators twitch,lirik --max-requests 12 --out screenshots/twitch-canary-public.json
node scripts/twitch-canary.mjs --resume screenshots/twitch-canary-public.json --max-requests 3 --out screenshots/twitch-canary-resumed.json
```

The runner uses the production live refresh, archive and clip pull paths. VODs are limited to 100 accepted entries and clips to two entries per creator. A guard ceilings actual upstream requests at 1–18 per invocation, including any requests attempted after production code catches an error. Calls are sequential with a small gap, normal upstream byte limits and timeouts. Only the public Twitch GQL endpoint is allowed; redirects, cookies and Authorization headers are refused.

Reports contain caller-selected public logins, task outcomes, response status codes, fetch-to-response-header timing, row/page/duplicate counts, and allowlisted paging stop/failure reasons. They omit query bodies, raw provider errors/payloads, titles, source URLs, cursors, headers, browser sessions and private account data. A readable empty shelf or confirmed offline channel is **empty**, not proof of playable media. Missing identity/type/viewer evidence fails a contract; unrun or zero-network checks never become passes.

HTTP 429 or an advertised service cooldown stops the remaining run. Resume honors that deadline, skips already confirmed tasks and retries only unfinished scopes. No waiting poller, automatic retry, cache clearing or provider cooldown override is introduced. Resume files are bounded to 64 KB and parsed through an allowlist. A task is resumed from its small scoped check, not from an exported provider cursor. Exit code 0 means all selected metadata contracts were observed; 2 means incomplete/failed/rate-limited, and invalid commands fail before requesting metadata.

## Recorded real-network outcome

The initial two-creator run used eight of its twelve permitted requests and confirmed 100 VODs plus two clips for each creator. Twitch's live observation initially timed out and later confirmed offline in a scoped resume. The final LIRIK live attempt timed out and remains **failed / transport** in screenshots/twitch-canary-final.json. The overall real canary is therefore **not fully passing**; no offline or viewer observation is inferred from that failure. Early diagnostic-development snapshots included an over-strict live identity assertion; the final checker correctly validates the channel identity and viewer count independently of VOD IDs.

Artifacts: screenshots/twitch-canary-public.json, twitch-canary-resumed.json, twitch-canary-confirmed.json and twitch-canary-final.json. The resume runs demonstrate that confirmed VOD/clip checks were not repeated. These are point-in-time anonymous metadata observations, not a provider soak, playback check, authenticated-account verification or guarantee of future availability.

## Repeatable checks

- `node --test scripts/twitch-chapters.test.mjs scripts/twitch-chapters-api.test.mjs scripts/twitch-canary.test.mjs`
- `node --test --test-concurrency=2 scripts/twitch-*.test.mjs`
- `node scripts/twitch-chapters-browser-check.mjs <url> screenshots/<report>.json`

The automated browser checks use isolated desktop/touch-phone profiles and controlled iframe/provider documents with the actual chapter parser/cache. They verify demand-only reads, collapse/late completion, bounded pages, canonical links, repeated navigation, preview/full-player reuse and malformed/empty/clip behavior. Real marker-source/canary observations above are separate evidence; physical-phone provider playback remains unverified.
