# Twitch identities and image retention

## Twitch imports and Watch Together

Official clips.twitch.tv/SLUG, clips.twitch.tv/embed?clip=SLUG and twitch.tv/CHANNEL/clip/SLUG forms share a case-sensitive typed clip identity. Mobile channel links are supported. Twitch VOD /videos/NUMBER and player.twitch.tv/?video=vNUMBER share a typed VOD identity. Live channel identities are separate and case-insensitive. Tracking and playback offsets never establish identity; similar titles and display names never merge records. Invalid hosts, credentials and conflicting official routes do not establish an alias.

A clip response with both its slug and numeric provider ID records a versioned pair. A numeric legacy ID is linked only through this pair, never guessed from its title. API clips without a public slug are skipped instead of manufacturing an unplayable link. Imports, entry-cap admission, archive sweeps, catalog restore and room descriptors use the shared parser. A match retains the existing saved card ID and primary source, unions source memberships and preserves the dictionaries containing manual tags, locks, category, rating, favorite, history and progress. No broad creator rename or personal-feedback migration is performed. Old raw records are not destructively rewritten merely for normalization.

## Image storage

- One latest temporary completed result, maximum 10 MiB. Generating again replaces it; failures preserve the previous completed preview. Eight small job receipts contain parameters/outcome only. Temporary bytes are not put in localStorage or in job history.
- Save image in app explicitly stores a PNG and its settings/provenance together in one IndexedDB transaction, namespaced to the signed-in app user. There are 32 saved slots and 128 MiB of declared PNG payload capacity per user. Concurrent saves check the budget within the same transaction. No automatic eviction of saved work occurs. Quota abort rolls back the receipt and PNG together.
- Only metadata is read when the list opens. Opening a saved item holds one additional PNG, maximum 10 MiB. Closing it or navigating releases its object URL and viewer buffer. Images are not loaded into an automatic gallery.
- Preview temporary cleanup shows the current image and byte estimate, supports cancellation, expires after five minutes and cannot clear a later image. It never changes saved PNGs, recipes, jobs, downloaded files or other library records.
- Optional clear-on-navigation also drops results completed after leaving the studio. The default preserves the established latest-preview behavior between app tabs; reload clears unsaved previews. Retention preference writes occur only on user changes.
- Saved images/recipes survive preview cleanup and reload. A missing or unreadable PNG retains its identifiable receipt and reusable parameters. Browser-held bytes are separate from downloaded files: this feature never scans or makes claims about the continued existence of external downloads.
- Explicit removal has a per-image confirmation, deletes only the chosen saved PNG and receipt, and keeps separate recipes and downloaded copies. Refresh saved images is an explicit metadata read. Unsupported/corrupt indices fail closed and are retained.

Saved images are browser-local, not synced between computers or included in the existing media library pack. Download important work. The browser can evict storage. These controls do not start or install any engine, model or external account connection.

## Validation

scripts/identity-output-batch.test.mjs covers typed routes, conflicting URLs, verified ID pairs, source membership, each merge variant, cap admission, room identity, 100 generation fixtures and cleanup/navigation policy.

scripts/pull-entry-limits.test.mjs contains an actual store-action regression for tags, locks, ratings, favorites, likes, category, progress, history and durable canonical writes.

scripts/identity-output-batch-browser-check.mjs exercises the rendered desktop/mobile workflow with isolated synthetic images and a mocked Companion. Its separate fixture database verifies atomic quota rollback, account isolation, count/byte budgets, missing bytes and future schemas. The byte ceiling test uses synthetic metadata receipts; it is not a physical 128 MiB disk-capacity measurement. No real Twitch provider, GPU generation or physical phone is claimed by these fixtures.
