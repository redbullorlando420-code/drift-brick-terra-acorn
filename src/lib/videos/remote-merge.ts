import type { LibraryVideo } from "./types";

function sameList(left?: readonly string[], right?: readonly string[]) {
  return left === right || (left?.length === right?.length && left?.every((value, index) => value === right?.[index]));
}

/** Avoid allocating two JSON strings for every card in a large refresh. */
function sameRemote(left: LibraryVideo["remote"], right: LibraryVideo["remote"]) {
  if (left === right) return true;
  if (!left || !right) return left === right;
  return left.kind === right.kind
    && left.videoId === right.videoId
    && left.channelId === right.channelId
    && left.channelName === right.channelName
    && left.live === right.live
    && left.viewers === right.viewers
    && left.observedAt === right.observedAt
    && left.views === right.views
    && left.embedUrl === right.embedUrl
    && left.watchUrl === right.watchUrl
    && left.previewUrl === right.previewUrl
    && sameList(left.sourceKinds, right.sourceKinds)
    && sameList(left.thumbFallbacks, right.thumbFallbacks)
    // Provider comments are intentionally not part of routine YouTube/Twitch
    // refresh payloads. If supplied, retain the fresh object safely.
    && left.comments === right.comments;
}

function sameVideo(left: LibraryVideo, right: LibraryVideo) {
  return left === right || (
    left.id === right.id
    && left.folderId === right.folderId
    && left.name === right.name
    && left.path === right.path
    && left.extension === right.extension
    && left.mime === right.mime
    && left.size === right.size
    && left.duration === right.duration
    && left.addedAt === right.addedAt
    && left.isSample === right.isSample
    && left.src === right.src
    && left.year === right.year
    && left.genre === right.genre
    && left.tagline === right.tagline
    && left.description === right.description
    && left.collection === right.collection
    && left.poster === right.poster
    && sameRemote(left.remote, right.remote)
  );
}

/**
 * Routine catalog responses are intentionally shallow and omit on-demand
 * details. Carry forward only durable card fields that they cannot author so
 * a metadata repair or fetched comments do not disappear on the next live
 * check. A newer non-empty provider name still wins (channel renames remain
 * possible), and no object is allocated when there is nothing to preserve.
 */
function retainDurableRemoteFields(previous: LibraryVideo | undefined, incoming: LibraryVideo) {
  if (!previous?.remote || !incoming.remote) return incoming;
  const channelName = incoming.remote.channelName?.trim() || previous.remote.channelName?.trim();
  const comments = incoming.remote.comments?.length ? incoming.remote.comments : previous.remote.comments;
  const keepsName = Boolean(channelName && channelName !== incoming.remote.channelName);
  const keepsComments = Boolean(comments?.length && comments !== incoming.remote.comments);
  if (!keepsName && !keepsComments) return incoming;
  return {
    ...incoming,
    remote: {
      ...incoming.remote,
      ...(keepsName ? { channelName } : {}),
      ...(keepsComments ? { comments } : {}),
    },
  };
}

function sameOrder(left: LibraryVideo[], right: LibraryVideo[]) {
  return left.length === right.length && left.every((video, index) => video === right[index]);
}

/**
 * Merge a provider refresh without letting a shallow public response erase a
 * known Twitch archive. Twitch's public archive endpoint can legitimately
 * return a partial window (or no rows while it is rate-limited), so archive
 * rows are additive per channel. Fresh rows still win by id, and stale live
 * cards are turned offline when their channel has checked successfully.
 *
 * The original catalog order is retained for every existing card. This is
 * more than cosmetic: Zustand shallow selectors can now skip a shelf render
 * when a response repeats its prior rows, while a single changed card keeps
 * its neighbours' artwork and focus identity intact.
 */
export function mergeRemoteRefresh(
  existing: LibraryVideo[], incoming: LibraryVideo[], refreshedIds: string[], savedIds: Set<string>,
): LibraryVideo[] {
  const refreshed = new Set(refreshedIds);
  const existingById = new Map(existing.map((video) => [video.id, video]));
  const fresh = new Map<string, LibraryVideo>();
  for (const incomingVideo of incoming) {
    const previous = existingById.get(incomingVideo.id);
    let next = retainDurableRemoteFields(previous, incomingVideo);
    const incomingObservation = next.remote?.observedAt ?? 0;
    const previousObservation = previous?.remote?.observedAt ?? 0;
    // Network responses can resolve out of order. A delayed live response must
    // never flash an older stream title, category, poster, or viewer count.
    if (previous?.remote?.live && next.remote?.live && incomingObservation < previousObservation) next = previous;
    // Preserve object identity for an unchanged provider card. This prevents
    // healthy artwork and scroll-position-sensitive rails from re-rendering
    // just because a routine refresh repeated the same provider row.
    else if (previous && sameVideo(previous, next)) next = previous;
    fresh.set(next.id, next);
  }

  const merged: LibraryVideo[] = [];
  for (const video of existing) {
    const next = fresh.get(video.id);
    if (next) {
      // Replace a changed card at its existing index; never move an unchanged
      // channel window to the end of a rail just because it was refreshed.
      merged.push(next);
      fresh.delete(video.id);
      continue;
    }
    if (!video.remote || !refreshed.has(video.folderId)) {
      merged.push(video);
      continue;
    }
    if (video.remote.live) {
      // The channel was successfully checked without this live card. Retain a
      // single offline transition for saved/live surfaces, then reuse it on
      // future refreshes rather than allocating another card object.
      merged.push({ ...video, tagline: "Offline · saved channel", remote: { ...video.remote, live: false } });
      continue;
    }
    if (savedIds.has(video.id)) {
      merged.push(video);
      continue;
    }
    // A Twitch VOD is a historical item, not a statement about current live
    // state. Retain it until an explicit cache cleanup removes it.
    if (video.remote.kind === "twitch" && !video.remote.live) {
      merged.push(video);
      continue;
    }
    // A missing non-live YouTube entry is intentionally removed: a successful
    // provider page is the source of truth for that shallow current window.
  }
  // Truly new cards append after stable catalog rows. Duplicate provider rows
  // were collapsed by the map above, so an import cannot create two cards.
  merged.push(...fresh.values());
  return sameOrder(existing, merged) ? existing : merged;
}
