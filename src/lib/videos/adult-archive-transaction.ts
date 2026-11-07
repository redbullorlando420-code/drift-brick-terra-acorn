import {
  ARCHIVE_LEDGER_KEY,
  ARCHIVE_POSITION_LIMIT,
  archiveLaneKey,
  readArchiveLedger,
  type ArchiveCheckpoint,
} from "./adult-archive-model.ts";
import {nextArchiveYield} from './archive-yield.ts';
/** Called after this operation's row puts are queued. Every earlier accepted
 * row and the final slice are checked in the same transaction as the cursor. */
export function applyArchiveCheckpoint(
  tx: IDBTransaction,
  checkpoint: ArchiveCheckpoint,
  fail: (error: unknown) => void,
) {
  const activity = tx.objectStore("activity"),
    request = activity.get(ARCHIVE_LEDGER_KEY);
  request.onsuccess = () => {
    try {
      const ledger = readArchiveLedger(request.result),
        key = archiveLaneKey(checkpoint.provider, checkpoint.query, checkpoint.order),
        previous = ledger.positions[key];
      if (previous?.token === checkpoint.token || (previous?.token ?? null) !== checkpoint.before)
        return;
      if (!previous && Object.keys(ledger.positions).length >= ARCHIVE_POSITION_LIMIT)
        throw Error("Archive position limit reached. Existing positions were kept.");
      const commit = () =>
        activity.put(
          {
            version: 1,
            positions: {
              ...ledger.positions,
              [key]: {
                provider: checkpoint.provider,
                token: checkpoint.token,
                accepted: checkpoint.acceptedIds.length,
                cursor: {...checkpoint.cursor,yield:checkpoint.observeYield===false?previous?.cursor.yield:nextArchiveYield(previous?.cursor.yield,checkpoint.cursor,checkpoint.acceptedIds.length)},
              },
            },
          },
          ARCHIVE_LEDGER_KEY,
        );
      let pending = checkpoint.acceptedIds.length;
      if (!pending) {
        commit();
        return;
      }
      for (const id of checkpoint.acceptedIds) {
        const row = tx.objectStore("videos").get(id);
        row.onsuccess = () => {
          try {
            if (!row.result)
              throw Error(
                "Archive checkpoint requires every accepted catalog row. The previous position was retained.",
              );
            if (!--pending) commit();
          } catch (error) {
            fail(error);
          }
        };
      }
    } catch (error) {
      fail(error);
    }
  };
}
