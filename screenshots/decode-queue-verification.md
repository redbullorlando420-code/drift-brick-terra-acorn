# Thumbnail capture scheduling — 2026-10-01

Local frame extraction now uses one bounded queue instead of per-request
availability polling. Viewer/hidden/idle pauses stop new work and abort active
captures, releasing each decoder's source and timeout. Jobs with live consumers
remain available for resume; pauses do not consume failure attempts.

Video cards subscribe only while near the viewport. Leaving that window or
unmounting cancels their work when no other card needs the same video. Duplicate
cards share a job. Visible jobs precede nearby jobs. Short input bursts delay
new captures; existing captures continue during short input to avoid repeatedly
restarting decoders. The existing adaptive worker setting remains bounded at
one to four concurrent jobs.

The queue holds at most 96 jobs and one input availability timer. Viewer/hidden
pauses have no availability polling timer. Environment listeners detach when
the queue becomes empty. Returning from a viewer resumes subscribed jobs without
requiring a catalog change or card rerender.

## Verification

- Type check and production build passed.
- Complete TypeScript test phase: 213 passed.
- Media performance script: six passed. Its capture test exercises the actual
  thumbnail store/capture code with simulated browser media elements, including
  source release on pause, successful resume, duration capture, canvas cleanup,
  duplicate consumers, and cancellation without false failures.
- Queue tests cover a 1,000-request bounded fixture, one shared input timer,
  zero suspended polling timers, priority, duplicate ownership, rapid
  pause/resume, and a fresh request replacing a cancelled video ID.
- Dev and production smoke checks passed on desktop 1280 × 800 and mobile
  390 × 844 with visible content, no overflow, and clean consoles. Both dev
  screenshots were visually inspected; production matched the baseline.
- Real saved library (~60,000 YouTube videos): desktop preview opened, Watch
  now entered playback, mobile playback rendered with one iframe and no
  overflow, Back to library restored browsing, and visible artwork loaded after
  subsequent scrolling. Captured browser errors: none.
- Pulls stayed paused. Test tab closed, viewport reset, Home restored.

This pass did not run a long-duration memory soak or compare native local-media
decode/frame times. The complete npm test chain has prior unrelated Windows
harness/migration failures; the relevant phases above passed.
