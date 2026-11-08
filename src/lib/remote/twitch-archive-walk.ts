import { advanceTwitchArchiveCursor, decodeTwitchArchiveCursor, encodeTwitchArchiveCursor, type TwitchArchiveCursor } from '../videos/twitch-archive-cursor.ts';
import type { TwitchPullDiagnostics } from '../videos/types';

type Edge = { broadcastType?: TwitchArchiveCursor['stage']; observedAt?: number; cursor?: string | null; node?: { id?: string } };
type Page = { id?: string; videos?: { providerError?: string | boolean; pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }; edges?: Edge[] } };
const HEAD_RECHECK_MS = 15 * 60_000;

/** Keep only accepted pages. A later challenge must not discard earlier data or
 * publish a position beyond an unreadable, oversized or non-advancing page. */
export async function walkTwitchArchive<T extends Page>(options: {
  limit: number; maxPages: number; pageSize: number; savedCursor?: string;
  read: (cursor: TwitchArchiveCursor, first: number) => Promise<T | null>;
  gap: () => Promise<void>;
  signal?: AbortSignal;
  headCheckedAt?: number;
}) {
  let cursor: TwitchArchiveCursor | null = decodeTwitchArchiveCursor(options.savedCursor);
  let first: T | null = null;
  const edges: NonNullable<NonNullable<T['videos']>['edges']> = [];
  const seen = new Set<string>();
  const diagnostics: TwitchPullDiagnostics = { at: Date.now(), pages: 0, received: 0, accepted: 0, duplicates: 0, resumed: Boolean(options.savedCursor), stopReason: 'page-budget', stage: cursor.stage };
  const head = Math.min(24, Math.floor(options.limit / 4));
  const previousHead = Number.isSafeInteger(options.headCheckedAt) && options.headCheckedAt! > 0 && options.headCheckedAt! <= diagnostics.at ? options.headCheckedAt : undefined;
  diagnostics.headCheckedAt = previousHead;
  options.signal?.throwIfAborted();
  const recheck = head > 0 && cursor.stage === 'ARCHIVE' && !!cursor.after &&
    (!previousHead || diagnostics.at - previousHead >= HEAD_RECHECK_MS);
  const archiveLimit = options.limit - (recheck ? head : 0);
  for (let i = 0; i < options.maxPages && cursor && edges.length < archiveLimit; i++) {
    if (i) await options.gap();
    diagnostics.stage = cursor.stage;
    const requested = Math.max(1, Math.min(100, options.pageSize, archiveLimit - edges.length));
    let page: T | null;
    try {
      options.signal?.throwIfAborted();
      page = await options.read(cursor, requested);
      options.signal?.throwIfAborted();
      if (!page?.id) throw new Error('Twitch returned no readable archive page');
      if (page.videos?.providerError) throw new Error(typeof page.videos.providerError === 'string' ? page.videos.providerError : 'Twitch rejected the archive page');
      if (!page.videos || !Array.isArray(page.videos.edges) || typeof page.videos.pageInfo?.hasNextPage !== 'boolean') throw new Error('Twitch returned a malformed archive connection');
    } catch (error) {
      options.signal?.throwIfAborted();
      if (!first) throw error;
      diagnostics.error = (error instanceof Error ? error.message : String(error)).slice(0, 240);
      diagnostics.stopReason = /integrity|challenge/i.test(diagnostics.error) ? 'challenge' : 'provider-error';
      break;
    }
    first ??= page;
    diagnostics.pages++;
    const rows = page.videos!.edges!;
    const observedAt = Date.now();
    diagnostics.received += rows.length;
    let lastAccepted: string | undefined;
    let skipped = false;
    for (const edge of rows) {
      const id = edge.node?.id;
      if (!id) { skipped = true; continue; }
      if (seen.has(id)) { diagnostics.duplicates++; continue; }
      if (edges.length >= archiveLimit) { skipped = true; continue; }
      seen.add(id); edges.push({...edge,broadcastType:cursor.stage,observedAt}); lastAccepted = id;
    }
    diagnostics.accepted = edges.length;
    if (lastAccepted) diagnostics.lastVideoId = lastAccepted;
    if (skipped) { diagnostics.stopReason = 'incomplete-page'; diagnostics.error = 'Twitch returned a malformed or oversized archive page; the safe position was preserved.'; break; }
    const info = page.videos!.pageInfo!;
    const end = info.endCursor ?? rows.at(-1)?.cursor ?? null;
    if (info.hasNextPage && (!rows.length || !end || end.length > 4096 || end === cursor.after)) { diagnostics.stopReason = 'stalled'; diagnostics.error = 'Twitch public archive page stopped advancing; the safe position was preserved.'; break; }
    cursor = advanceTwitchArchiveCursor(cursor, info.hasNextPage === true, end);
    if (!cursor) diagnostics.stopReason = 'exhausted';
    else if (edges.length >= archiveLimit) diagnostics.stopReason = 'entry-budget';
  }
  // Check the newest window only after an advancing historical read. It is
  // optional and cannot consume or replace the historical continuation.
  if (first && recheck && !diagnostics.error) {
    await options.gap();
    options.signal?.throwIfAborted();
    diagnostics.headCheckedAt = diagnostics.at;
    try {
      const page = await options.read({ stage: 'ARCHIVE', after: null }, head);
      options.signal?.throwIfAborted();
      const rows = page?.videos?.edges;
      if (page?.id !== first.id || page?.videos?.providerError || !Array.isArray(rows) ||
          rows.length > head || typeof page?.videos?.pageInfo?.hasNextPage !== 'boolean' || rows.some(row => !row.node?.id))
        throw Error('Unreadable newest archive window');
      diagnostics.headObserved = rows.length;
      for (const edge of rows) {
        if (seen.has(edge.node!.id!)) continue;
        seen.add(edge.node!.id!);
        edges.push({ ...edge, broadcastType: 'ARCHIVE', observedAt: diagnostics.headCheckedAt } as typeof edges[number]);
      }
    } catch (error) {
      options.signal?.throwIfAborted();
      diagnostics.headUnavailable = true;
      if (/\b429\b|\b503\b|rate.?limit/i.test(String(error)))
        diagnostics.error = (error instanceof Error ? error.message : String(error)).slice(0, 240);
    }
  }
  return { first, edges, cursor: encodeTwitchArchiveCursor(cursor), exhaustedAt: cursor ? undefined : Date.now(), diagnostics };
}
