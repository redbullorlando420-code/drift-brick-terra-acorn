# Reelcase library pack templates

Fill these files offline, zip the folder as `reelcase-library-pack.zip`, then
import from **Settings → Import library pack**.

Import **merges** into durable local stores (follows, history, links, marks,
shelves, ratings/hearts, resume, Photos sources & likes). It does not wipe
unrelated data unless you confirm **Replace follows**.

See the README inside an exported pack zip for full column docs.

## Quick start

1. Edit `follows/follows.csv` (add youtube/twitch rows).
2. Optionally fill history/links/marks/photos.
3. Zip this folder (keep paths) or import individual JSON/CSV files.


## Photos

- `photos/sources.json` — local folder stubs (`directory` / `files`)
- `photos/likes.json` — favorite ids + per-photo rating/tag metadata
- Media bytes are not in the pack; reconnect the folder handles after import.
