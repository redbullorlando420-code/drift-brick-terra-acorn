# Reviewed movie imports and series progress

Milestones **next-151**, **next-154** and **next-155**, Mission revision **98**. Default completion totals: **329/406**, including **127/200 next-level** and **31/100 new-batch milestones**.

## Movies: metadata evidence

Open **Movies → Import movie metadata or collections**. Download a metadata template, choose an edited JSON file, then select **Preview movie import**. No import file causes a provider search or creates a film identity. Review the complete film in the existing film desk first if its identity is not already confirmed.

Example:

```json
{
  "format": "realhub-film-evidence",
  "version": 1,
  "name": "Reviewed film metadata",
  "source": "My reviewed catalog export",
  "rows": [
    {"id": "dune-1984", "title": "Dune", "year": 1984, "genre": "Science fiction", "identifier": "imdb:tt0087182"}
  ]
}
```

Exact title/year matches remain proposals. Separate owner-reviewed identities with the same title/year are ambiguous. Optional `filmId` targets an existing Realhub film identity; optional `videoId` targets an eligible source. A previously accepted IMDb/TMDB declaration can resolve through the last import receipt's reviewed crosswalk. Unknown declarations fall back to title/year matching; none are fetched or independently verified. Private, hidden, unavailable and other ineligible sources are absent from the current Movie catalog used for matching.

Choose each target explicitly and select its changed fields. Existing title/year/poster/genre locks and per-source category locks are retained. Imported text receives the same whitespace normalization as saved film fields. Posters require a successful explicit preview before their checkbox becomes available. Preview failures retain the saved artwork, and retry creates a new bounded image request. Preview contacts the declared image host only after the owner presses its button.

Confirm the selected matches and fields, then apply at most eight distinct films in one transaction. The existing film ledger stores the fields, declared source, identifiers and inverse patch. The import rechecks saved film reviews before writing and publishes only after an existing durable mirror acknowledges the write. A failed write retains the active prior fields. Concurrent local film edits are blocked while the import saves; a changed saved ledger requires reload/review. Identifier-only files can record an explicitly reviewed declaration while locked titles/years remain unchanged. Reimporting unchanged values or the same declaration is a no-op.

**Undo metadata import** restores all changed films and their previous import receipt while this is the latest film review action. The inverse survives reload. Ordinary film edits retain the original single-film undo contract. Batch inverse data is an optional separate field, so older readers do not encounter an oversized legacy undo record. As with other feature additions, old writers do not preserve unknown new optional evidence fields.

## Movies: collection membership

Use `format: "realhub-movie-collection"` with the same version, name, source and row structure. Collection rows need a title; year, film/source ID and declared external identifier are optional. Matching uses only titles already eligible for Movies. Trailers and lectures cannot be promoted by importing a collection list.

Choose the intended matches and either a new collection or an existing destination. Apply appends deduplicated membership and records included/rejected rows. A reviewed film membership includes its eligible editions; a source-only membership stays attached to that source. The **Movie collection** filter combines with existing movie search, runtime, genre, decade, source and watch filters. Eligibility totals remain global and classification, source records, tags and playback history are unchanged.

Collection import undo restores the previous membership after reload. Repeating an unchanged import into the same destination is a no-op. Selecting a new destination is an explicit separate collection choice. Unknown/missing members never make a title eligible for Movies.

## Anime: corrections and reset

Open a reviewed episode map, then **Series progress → Correct or reset series tracking**. The summary counts each reviewed episode slot once, even when multiple versions exist. It keeps the selected numbering convention separate from alternate numbering, unresolved sources and specials/OVAs. Missing slots have no completion decision. A known but disconnected source can retain real earlier completion evidence; it is also counted separately as unavailable.

Playback completion uses the series' existing completion threshold. An owner correction can mark an existing episode watched/not watched or return it to playback evidence. Correcting a slot covers its reviewed versions and does not change another numbering lane.

Reset requires a separate checkbox. It clears only this series' tracking decisions and ignores playback observations at or before the reset instant. Later real playback can contribute again. **Original video resume positions, ratings, tags and watch history remain intact.** This is a tracking reset, not an erasure or rewind of playback history. The next-episode suggestion follows the owner’s tracking decisions and explains that opening a title retains its original resume mark. No autoplay or missing-episode completion is added.

Undo restores the immediately previous series tracking state after reload and leaves other series untouched. Saved tracking is loaded before a watched count or next-episode action is shown. Quota/conflict/unsupported-schema errors leave the previous durable decisions active and provide a reload action.

## Storage, limits and responsiveness

- Import files: version 1, at most **128 KB / 100 rows**; malformed or duplicate rows reject the whole file. Metadata applies at most **8 films** at a time. Matches retain at most **8 candidates per row** and signal truncation rather than selecting one silently.
- Matching scans the existing eligible catalog in cancellable slices with bounded retained results. It does not copy the whole catalog into a second index. Preview waits for the current Movie catalog. Closing/cancelling releases pending preview work; stale catalog/review snapshots cannot apply.
- Collection documents: **8 collections / 512 memberships** total, bounded review receipt and one undo. Series tracking: **64 series / 200 decisions per series / 512 decisions** total and one undo. Both use the existing 64-KB explicit-document write ceiling and conflict-checked profile storage.
- `reelcase.movie-collections.v1` and `reelcase.series-progress.v1` use the existing local-profile namespace. These are local tool documents; the existing legacy library restore scope excludes tool documents. Movie evidence/receipts/inverses live in the existing film ledger and travel with its library-pack export/restore.
- No per-keystroke storage writes or new provider polling are introduced. Import rows and correction controls are paged. No new dependencies, authentication or external accounts are added.

## Verification

Final checks passed: build/typecheck, **189 focused automated tests**, desktop/mobile feature workflows in development/production, both 66-report navigation audits, current/legacy Mission plan migrations and a non-diverging Home baseline. Existing Movies/Anime regressions pass in development; the Anime backup regression also passes in production with its missing-randomUUID mobile fixture.

Evidence is in `screenshots/curation-*`. Build and type checks, focused unit/fixture checks, actual desktop/mobile development and production workflows, current/legacy Mission plan migration, Home baseline and complete navigation audits cover this batch. Browser journeys seed disposable profiles and exercise matching, explicit field selection, artwork success/failure/retry, lock preservation, durable import/undo, quota rollback, collection filtering/rejected receipts, profile isolation and series reset/undo. Existing movie/anime identity, edition, mapping and ZIP restore regressions cover the older workflows too.

The older regression fixtures now use the existing prepare/activate restore flow, fresh preflight reports, explicit field-conflict choices and durable ledger reads. Their phone case also exposed a real bug: restore generation IDs required `crypto.randomUUID()`. The repository now uses the app’s existing HTTP-compatible local ID helper. The Twitch continuation fixture in the mixed movie suite now supplies its saved verified creator ID, matching the current source-binding contract; no Twitch runtime behavior changed in this batch.

These are saved-catalog checks, not external movie database verification, actual provider playback, physical-phone certification or a long-duration memory soak. Source labels and external identifiers remain owner-reviewed declarations. Storage is local to this origin/profile. Missing film evidence and unresolved episode numbering remain unconfirmed.
