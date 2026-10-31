# Watch Together: live playback and device captions

## Live clocks

YouTube and Twitch live embeds use an independent live clock. Room play/pause remains shared, but host buffering or a stopped provider clock cannot pause another live viewer. Implicit live play/pause events are observations only: ads, buffering or native player interaction do not request a shared pause. Explicit authorized room controls still send shared intent. Recorded videos retain their existing alignment and correction rules.

The current provider bridges expose no verified DVR seekable range or comparable live-edge latency. A positive YouTube duration is elapsed broadcast age, not proof of DVR. Realhub disables room seeks and automatic correction for live streams, including after reload. The Live playback panel distinguishes room pause from local buffering and offers an explicit device-only reload. Provider-native Live/DVR controls may be used when offered. Reload requests a fresh feed but cannot guarantee a live-edge position or bypass ads/autoplay.

## Caption boundary

The Captions panel owns no transport or shared playback callbacks. Preferences are bounded to one boolean and a validated language code under `reelcase.watch-room.captions.v1`, following existing browser-local room preference storage. Writes occur only on Save and only when changed. No caption content, language or preference is sent over WebRTC. Preferences are browser-local, not cross-device account synchronization.

Native local videos enumerate at most 32 subtitle/caption TextTracks, excluding metadata. Saved preference selects an exact or base-language match, then an active/first available track; turning it off disables native captions. Event listeners on the active media/track list update inventory; changing title/stream/player detaches them. No polling, caption downloads or full-library scan is added.

YouTube uses documented `cc_load_policy=1` and optional `cc_lang_pref` **only when a player is loaded**. Save never reloads an iframe or changes room timing. An explicit Reload with saved captions action reloads this device only. Turning the preference off leaves YouTube's native default; it is not a force-off parameter. Immediate caption toggling and available languages remain in the provider's CC/Settings menus. Track availability and YouTube account preferences can override the request. Realhub does not claim to enumerate remote caption tracks.

Twitch and clip embeds expose no caption-selection setter through this integration. Their native CC menu is the fallback when broadcaster captions exist. Received RTC media does not carry separate TextTrack inventory; its panel explains the matching-local-copy fallback and burned-in captions. No subtitles are scraped, proxied, downloaded or generated.

## Official references

- [YouTube player parameters](https://developers.google.com/youtube/player_parameters): caption load/language preferences and provider selection caveats.
- [Twitch video and clips embed API](https://dev.twitch.tv/docs/embed/video-and-clips): supported player controls and events.

## Reproducible checks

`node --test scripts/room-device-captions.test.mjs scripts/room-provider-clock.test.mjs`

`node scripts/watch-room-device-playback-check.mjs http://127.0.0.1:8080/ screenshots/room-device-dev.json`

The browser script uses isolated desktop/mobile-emulated contexts and real WebRTC transport with controlled provider bridges. It checks live buffering, device player events, explicit shared pause, device reload, live-to-VOD switching, caption validation, save/reload persistence, user isolation, native browser TextTrack selection, missing-track guidance and page overflow/console errors. Real provider ad timing, physical phone autoplay, caption availability and cross-network TURN require external validation; fixtures do not verify those services.
