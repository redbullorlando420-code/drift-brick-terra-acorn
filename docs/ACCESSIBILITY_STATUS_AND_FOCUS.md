# Accessibility status and focus audit

## Coverage and limits

This protocol covers Watch Together and provider batch status. Automated evidence uses desktop Chrome and a 390×844 touch-phone emulation, real WebRTC connections between isolated contexts, controlled provider metadata, keyboard input, DOM live-region mutation counts and Playwright accessibility-tree snapshots. Forced-colors and reduced-motion media are exercised on both viewports.

**Screen-reader speech output remains unverified.** NVDA was not found through the executable search on this Windows machine. No Narrator, JAWS, VoiceOver or TalkBack speech session was operated. A DOM accessibility-tree snapshot verifies semantics, not what a screen reader speaks. Physical iOS/Android keyboards, real provider iframe accessibility, cross-network TURN and real ads remain external checks. Do not infer any of these from a passing browser report.

## Named regions and ownership

| Surface | Navigation/announcement policy | Focus owner |
| --- | --- | --- |
| Room query and queue | Named section, Shared upcoming titles list; atomic polite summary contains count, current and next title, without clocks | Queue row action; after consumption/removal, same action in the next row or previous last row, then queue heading if empty |
| Guest video suggestions | Named section with explicit host decisions and retained outcomes | Approval/dismissal moves to equivalent action in the next suggestion, then heading if empty |
| Room messages | Named polite log; existing bounded chat and scroll ownership retained | Chat input and unsent text are never displaced by remote queue changes |
| Room connection timeline | Named disclosure with separate signaling/ICE/transport/handshake/player stages | A successful retry returns focus to its stage when the retry button disappears; healthy channels and queue stay in place |
| Role change preview | Inline named region, not a modal | Apply/cancel returns to the preset selector |
| Move position editor | Inline form, not a modal | Apply/cancel returns to that row's Move control |
| Keyboard shortcuts modal | Existing Radix modal and Escape behavior | Search owns initial focus; dismissal restores the opener |
| Player recovery | Device-local reload, no shared selection change | Reload button remains focused while the iframe is recreated |
| Mission action outcome | Mounted atomic polite region for explicit copy/export actions | Existing action control; selectable clipboard fallback remains available |

Removal recovery acts only when the focused control is detached and the document has lost focus to its body. Pointer/focus activity outside the owner clears the record. It never uses a timeout or globally focuses the first button. The record holds one element/action/index and is released when its panel unmounts. Normal reordering keeps the original connected control focused. A recovered control scrolls into the nearest visible position; heading scroll margins keep it below the sticky room toolbar.

## Announcement priorities

- Visible counters and native progress bars retain full detail for deliberate inspection. They are not nested in a live region.
- Provider batches announce one start and one final outcome. Running creator names/counter ticks do not change the semantic announcement key. A provider wait or explicit stop has its own single phase boundary; resumption may announce a new start.
- The last batch outcome remains readable until another semantic boundary. No history, polling, timers, provider calls or storage writes are added by announcement handling.
- Background/partial failures are summarized politely with a reachable retry/check control and detailed results. Existing user-action failures use alert priority; ordinary progress is never assertive.
- Queue summaries contain semantic changes only. Timing heartbeats cannot update their text. Chat and explicit action notices are separate from playback timing.
- Reduced motion disables the live-check spinner and mission progress transition. Forced colors retain a system Highlight outline on keyboard focus and a visible progress boundary.

## Automated runbook

1. Run `node --test scripts/status-announcement.test.mjs` for semantic deduplication, 100 counter ticks, wait/resume/new-run boundaries and bounded text.
2. Run `node scripts/watch-room-roles-timeline-check.mjs <app-url> <report.json>`. Check keyboard approve/dismiss, consumed/removed rows, cancel move, role preview, reconnect retry, unsent chat focus, modal Escape and player reload. The script also audits the existing role/transport boundary.
3. Run `node scripts/status-announcement-browser-check.mjs <app-url> <report.json>`. A 100-creator clip fixture includes one failure; a 100-creator live check verifies exactly two semantic announcements per batch. Retry controls and detailed results must remain available. Forced-colors focus uses keyboard modality.
4. Run build/type checks, then repeat both browser commands against the final production output. Run Home desktop/mobile smoke with the dev report as baseline and inspect screenshots.
5. Record exact browser/tool coverage and failures. Do not change a speech-output result from unverified until an actual screen-reader session is performed.

## Manual speech checks still required

With NVDA/Chrome or Narrator/Edge on Windows, verify one useful start/completion announcement for a 100-creator batch, a single partial-failure summary, discoverable retry controls, sensible named-region navigation, and absence of clock-heartbeat speech. Repeat queue consumption, suggestion dismissal, reconnect, modal dismissal and player reload while monitoring spoken focus context. Repeat critical paths with VoiceOver/Safari and TalkBack/Chrome on physical phones. Record application/browser/reader versions and exact observed speech; mark unsupported provider-frame behavior separately.
