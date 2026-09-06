import type { LibraryVideo } from "./types";

/** Tokenize for indexed search: lowercase alphanumerics, keep path-ish separators as splits. */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  const lower = text.toLowerCase();
  let start = -1;
  for (let i = 0; i <= lower.length; i++) {
    const ch = lower.charCodeAt(i);
    const isWord =
      i < lower.length &&
      ((ch >= 48 && ch <= 57) || (ch >= 97 && ch <= 122) || ch === 95);
    if (isWord) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      if (i - start >= 1) out.push(lower.slice(start, i));
      start = -1;
    }
  }
  return out;
}

function haystackFor(
  video: LibraryVideo,
  tags: Record<string, string[]>,
  categories: Record<string, string>,
): string {
  const parts = [
    video.name,
    video.path,
    video.genre ?? "",
    video.tagline ?? "",
    video.collection ?? "",
    categories[video.id] ?? "",
    ...(tags[video.id] ?? []),
    video.remote?.channelName ?? "",
    video.remote?.kind ?? "",
  ];
  return parts.join(" ");
}

/**
 * Inverted token index over the durable catalog.
 * Search is AND-of-tokens with prefix expansion so typing stays cheap
 * without scanning every video field on the main thread each keystroke.
 */
export class VideoSearchIndex {
  private byToken = new Map<string, Set<string>>();
  private docTokens = new Map<string, string[]>();
  private videosRef: LibraryVideo[] | null = null;
  private tagsRef: Record<string, string[]> | null = null;
  private categoriesRef: Record<string, string> | null = null;

  clear() {
    this.byToken.clear();
    this.docTokens.clear();
    this.videosRef = null;
    this.tagsRef = null;
    this.categoriesRef = null;
  }

  private unlink(id: string) {
    const prev = this.docTokens.get(id);
    if (!prev) return;
    for (const token of prev) {
      const set = this.byToken.get(token);
      if (!set) continue;
      set.delete(id);
      if (!set.size) this.byToken.delete(token);
    }
    this.docTokens.delete(id);
  }

  private link(id: string, text: string) {
    const tokens = [...new Set(tokenize(text))];
    this.docTokens.set(id, tokens);
    for (const token of tokens) {
      let set = this.byToken.get(token);
      if (!set) {
        set = new Set();
        this.byToken.set(token, set);
      }
      set.add(id);
    }
  }

  upsert(
    video: LibraryVideo,
    tags: Record<string, string[]>,
    categories: Record<string, string>,
  ) {
    this.unlink(video.id);
    this.link(video.id, haystackFor(video, tags, categories));
  }

  /** Update one locally edited document without rebuilding a very large catalog. */
  updateMetadata(
    video: LibraryVideo,
    videos: LibraryVideo[],
    tags: Record<string, string[]>,
    categories: Record<string, string>,
  ) {
    // If the catalog has not been indexed yet, let sync perform the first full build.
    if (this.videosRef !== videos) return;
    this.upsert(video, tags, categories);
    this.tagsRef = tags;
    this.categoriesRef = categories;
  }

  remove(id: string) {
    this.unlink(id);
  }

  /**
   * Sync index to current store slices. Append-only growth (ingest batches)
   * only indexes the new suffix; tag/category or reorder changes rebuild.
   */
  sync(
    videos: LibraryVideo[],
    tags: Record<string, string[]>,
    categories: Record<string, string>,
  ) {
    if (
      videos === this.videosRef &&
      tags === this.tagsRef &&
      categories === this.categoriesRef
    ) {
      return;
    }

    const prevVideos = this.videosRef;
    const tagsChanged = tags !== this.tagsRef || categories !== this.categoriesRef;
    const canAppend =
      !tagsChanged &&
      prevVideos != null &&
      videos.length >= prevVideos.length &&
      prevVideos.every((v, i) => v === videos[i]);

    if (canAppend) {
      for (let i = prevVideos!.length; i < videos.length; i++) {
        this.upsert(videos[i], tags, categories);
      }
    } else {
      this.byToken.clear();
      this.docTokens.clear();
      for (const video of videos) {
        this.link(video.id, haystackFor(video, tags, categories));
      }
    }

    this.videosRef = videos;
    this.tagsRef = tags;
    this.categoriesRef = categories;
  }

  /** Matching video ids, or null when query is empty (caller keeps full list). */
  search(query: string): Set<string> | null {
    const tokens = tokenize(query);
    if (!tokens.length) return null;

    let acc: Set<string> | null = null;
    for (const token of tokens) {
      const hits = this.idsForPrefix(token);
      if (!hits.size) return new Set();
      if (!acc) {
        acc = hits;
        continue;
      }
      const next = new Set<string>();
      for (const id of acc) {
        if (hits.has(id)) next.add(id);
      }
      acc = next;
      if (!acc.size) return acc;
    }
    return acc ?? new Set();
  }

  private idsForPrefix(prefix: string): Set<string> {
    if (prefix.length >= 3 && this.byToken.has(prefix)) {
      return this.byToken.get(prefix)!;
    }
    const out = new Set<string>();
    for (const [token, ids] of this.byToken) {
      if (token.startsWith(prefix) || (prefix.length >= 4 && token.includes(prefix))) {
        for (const id of ids) out.add(id);
      }
    }
    return out;
  }
}

export const librarySearchIndex = new VideoSearchIndex();
