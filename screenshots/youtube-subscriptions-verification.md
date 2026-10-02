# YouTube subscriptions and Live repair — October 2, 2026

- The supplied comma-separated attachment parses as 1,571 unique names, including four quoted comma-containing names and 89 Unicode names. Legacy whitespace splitting produces 2,509 distinct tokens.
- The real importer preview displayed 1,571 entries and 881 already verified matches. All supplied names remain saved locally.
- Saved-library recovery holds 559 legacy fragments for review without deleting follows or videos. The final rendered YouTube page reports 1,549 verified sources and 777 awaiting exact identity matching.
- Names now use exact public channel search; explicit handles and links use the public resolve URL endpoint. Channel IDs preserve case. Ambiguous results remain pending.
- Explicit correction was exercised in the actual browser for Oxygene 80 using its previously verified channel URL. Its channel ID remained UC--mO_MwJryZfcxeaefzetg and its saved catalog increased from 15 to 191 videos. Reload retained that correction.
- Final actual browser catalog: 79,726 distinct YouTube video IDs, zero duplicate rows. Initial turn observation was 76,147 distinct IDs.
- Live checks follow channel Streams browse metadata. The provider diagnostic found 23 simultaneous Lofi Girl streams; the real Live page refreshed from five to six confirmed broadcasts. Archive/import failures no longer inflate Live failure warnings.
- Failed name lookups bypass full-library ingestion; automatic startup recovery checks at most four YouTube names and honors saved failure deadlines. Explicit imports retain every submitted entry before requesting metadata.
- 84 focused tests passed. Typecheck and production build passed.
- Desktop and mobile development and production smoke checks passed with no console/page errors or horizontal overflow, and production matched the development baseline. Screenshots were visually inspected.
- Actual subscription parsing, review filtering, creator correction, reload persistence and Live refresh were exercised in Chrome. Importer, correction and Live layouts were inspected at 1280×900 and 390×844; no horizontal overflow. Actual browser error log was empty.
- Production preview stopped after verification; development preview remains running. Generated build-output changes were cleaned separately from source changes.

Remaining identity limitation: display names alone cannot prove which creator is intended when YouTube returns multiple exact matches, a renamed channel, or no public match. Such names remain queued/pending; a correct channel URL or @handle can resolve them through the creator panel. No claim is made that every pending name is a real channel.
