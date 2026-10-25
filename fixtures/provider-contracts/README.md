# Provider response contracts

Run `node scripts/check-provider-contracts.mjs` for the supported YouTube shape matrix and `node --test scripts/provider-contract-milestones.test.mjs` for adapter integration checks. Fixtures are synthetic and contain no account data or credentials.

The feed boundary accepts complete RSS feeds, including genuine empty feeds and YouTube's prefixless channel header. Catalog and live boundaries accept known renderer containers, usable video identities, continuation tokens, and explicit empty states. Unknown renderer-only responses, truncated feeds, wrong owners, and service or sign-in messages fail conservatively. A failed read preserves the last successful observation and unconsumed archive cursor.

When supporting a newly observed response, add a minimal redacted fixture with its expected outcome before extending the validator. Keep mixed valid/unknown siblings covered. Diagnostics expose a bounded reason rather than the response payload.

Twitch fixtures exercise alias isolation, malformed stream/viewer data, transport failures, and optional metadata errors. Optional artwork/title/game errors may retain a valid live observation with a warning. Errors affecting identity, stream state, or viewer counts must fail that creator. A null stream accompanied by a nested stream error is ambiguous and cannot establish offline status.

Browser checks use isolated profiles and controlled upstream responses; they do not prove long-running provider availability. Public probes are read-only snapshots.

## Negative live evidence (next-024)

A recognized empty Home shelf is unknown. A Streams page with unread continuation markers is incomplete; readable shape alone does not establish absence. Positive observations remain usable without ending other missing broadcasts. Complete creator-owned Streams results may establish absence. The fallback HTML path uses the same evidence rules.

For an incomplete listing, at most two missing known broadcast IDs may receive exact watch-page checks in the existing live transport lane. Identity and creator must match; playable metadata must explicitly state not-live or contain a non-future end time. Consent, login, wrong-owner, malformed and transport failures cannot confirm an ending. No full catalog pagination is added. If more than two known broadcasts are missing, status remains provisional.

Only successful complete evidence enters the existing ten-minute hold. A failed/unknown observation cannot move a saved live card offline, and fresh positive evidence clears its hold immediately. Evidence source, observation time and bounded known IDs are persisted with the existing follow ledger. The interface explains provisional state and offers a single-creator recheck that honors retries and provider cooldowns.

Run `node --test scripts/youtube-negative-evidence.test.mjs`. The isolated browser acceptance runner is `node scripts/youtube-negative-evidence-browser-check.mjs <local-url> screenshots/<report>.json`; its accelerated clock is a fixture and does not prove physical-device timing or provider uptime.

Older saved live cards are reconciled into the follow-level identity ledger, including canonical channel aliases. A watch-only proof is rejected if it omitted another saved live identity. The ledger holds at most 64 IDs; overflow remains explicit and disables supplemental watch-based negatives until complete catalog evidence is available. This migration reuses the existing cooperative live-source index and follow checkpoints.
