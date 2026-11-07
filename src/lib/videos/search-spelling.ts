import { forEachCatalogSlice, forEachCatalogEntry, yieldCatalogTask } from "../catalog-work.ts";
import { adultFolderIds } from "./adult-providers.ts";
import { videoIsPrivate } from "./public-visibility.ts";
import { matchesSearchConstraints } from "./search-constraints.ts";
import { encodeSearchQuery, parseSearchQuery } from "./search-query.ts";
import { searchText, searchTokens } from "./search-text.ts";
import type { Folder, LibraryVideo, SourceId } from "./types";

export type SpellingInput = {
  videos: readonly LibraryVideo[];
  tags: Record<string, string[]>;
  categories: Record<string, string>;
  folders: readonly Folder[];
  hidden: Record<string, true>;
  unavailable: Record<string, true>;
  query: string;
  sourceId: SourceId;
  adultsUnlocked: boolean;
};
export type SpellingSuggestion = { word: string; original: string; query: string; titles: number };
export type SpellingReport = {
  suggestions: SpellingSuggestion[];
  capped: boolean;
  terms: number;
  visible: number;
};
const LIMIT = 8192;
/** At most one inserted/deleted/substituted code point or adjacent transposition.
 * No quadratic edit-distance matrix, phonetic guesses or remote service. */
export function oneSearchEdit(a: string, b: string): boolean {
  const left = Array.from(a),
    right = Array.from(b);
  if (a === b || Math.abs(left.length - right.length) > 1) return false;
  let i = 0;
  while (i < left.length && i < right.length && left[i] === right[i]) i++;
  if (left.length === right.length) {
    if (left.slice(i + 1).join("") === right.slice(i + 1).join("")) return true;
    return (
      i + 1 < left.length &&
      left[i] === right[i + 1] &&
      left[i + 1] === right[i] &&
      left.slice(i + 2).join("") === right.slice(i + 2).join("")
    );
  }
  return left.length > right.length
    ? left.slice(i + 1).join("") === right.slice(i).join("")
    : left.slice(i).join("") === right.slice(i + 1).join("");
}
/** Called only for settled zero-result searches. Retain at most 8192 short
 * words, count each title once, and publish only three grounded alternatives. */
export async function suggestSearchSpelling(
  input: SpellingInput,
  signal: AbortSignal,
  turn = yieldCatalogTask,
): Promise<SpellingReport> {
  const empty: SpellingReport = { suggestions: [], capped: false, terms: 0, visible: 0 };
  const parsed = parseSearchQuery(input.query),
    q = parsed.query;
  const words = [...q.text.matchAll(/[\p{L}\p{M}\p{N}]+/gu)];
  if (
    parsed.error ||
    !words.length ||
    words.length > 4 ||
    words.some((row) => Array.from(row[0]).length < 4 || row[0].length > 32)
  )
    return empty;
  const privateDesk = input.sourceId === "adults" || input.sourceId === "adult-fetishes";
  if (privateDesk && !input.adultsUnlocked) return empty;
  const privateFolders = adultFolderIds(input.folders),
    vocabulary = new Map<string, number[]>();
  const wanted = words.map((row) => searchText(row[0]));
  let capped = false,
    visible = 0;
  const checkpoint = async () => {
    signal.throwIfAborted();
    await turn();
    signal.throwIfAborted();
  };
  await forEachCatalogSlice(
    input.videos,
    (v) => {
      if (
        v.isSample ||
        input.hidden[v.id] ||
        input.unavailable[v.id] ||
        videoIsPrivate(privateFolders, v) !== privateDesk
      )
        return;
      if (
        q.source === "all" &&
        (input.sourceId === "youtube" || input.sourceId === "twitch") &&
        v.remote?.kind !== input.sourceId
      )
        return;
      if (!matchesSearchConstraints(v, input.tags, input.categories, q, !privateDesk)) return;
      visible++;
      // Never read private notes, descriptions, paths or unrelated activity.
      const text = [
        v.name.slice(0, 512),
        v.remote?.channelName?.slice(0, 128) ?? "",
        (input.categories[v.id] ?? v.genre ?? "").slice(0, 80),
        ...(input.tags[v.id] ?? []).slice(0, 24).map((tag) => tag.slice(0, 80)),
      ].join(" ");
      const tokens = new Set(searchTokens(text));
      const present = wanted.map((word) =>
        [...tokens].some(
          (token) =>
            token === word || token.startsWith(word) || (word.length >= 4 && token.includes(word)),
        ),
      );
      for (const token of tokens) {
        if (token.length < 4 || token.length > 32 || !/^\p{L}[\p{L}\p{M}]*$/u.test(token)) continue;
        let counts = vocabulary.get(token);
        if (!counts) {
          if (vocabulary.size >= LIMIT) {
            capped = true;
            continue;
          }
          counts = Array(wanted.length).fill(0);
          vocabulary.set(token, counts);
        }
        for (let index = 0; index < wanted.length; index++)
          if (present.every((matches, other) => other === index || matches)) counts[index]++;
      }
    },
    checkpoint,
    128,
  );
  const candidates: Array<SpellingSuggestion & { order: number }> = [];
  const known = new Set<string>();
  await forEachCatalogEntry(
    vocabulary,
    ([token]) => {
      for (const row of words) {
        const key = searchText(row[0]);
        if (token.startsWith(key) || (key.length >= 4 && token.includes(key))) known.add(key);
      }
    },
    checkpoint,
  );
  await forEachCatalogEntry(
    vocabulary,
    ([word, counts]) => {
      for (let order = 0; order < words.length; order++) {
        const titles = counts[order]!;
        if (titles < 2) continue;
        const row = words[order]!,
          original = searchText(row[0]);
        if (known.has(original) || !oneSearchEdit(original, word)) continue;
        const text = q.text.slice(0, row.index) + word + q.text.slice(row.index! + row[0].length);
        const candidate = {
          word,
          original: row[0],
          query: encodeSearchQuery({ ...q, text }),
          titles,
          order,
        };
        candidates.push(candidate);
        candidates.sort(
          (a, b) =>
            b.titles - a.titles ||
            a.order - b.order ||
            (a.word < b.word ? -1 : a.word > b.word ? 1 : 0),
        );
        if (candidates.length > 3) candidates.pop();
      }
    },
    checkpoint,
  );
  signal.throwIfAborted();
  return {
    suggestions: candidates.map(({ order: _, ...row }) => row),
    capped,
    terms: vocabulary.size,
    visible,
  };
}
