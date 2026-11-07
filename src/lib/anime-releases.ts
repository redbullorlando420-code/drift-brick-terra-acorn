import { reviewedPreferences } from "./reviewed-preferences.ts";
import type { AnimeReviewLedger } from "./videos/anime-review";
export type AnimeRelease = {
  id: string;
  seriesId: string;
  numbering: "season" | "absolute";
  season: number;
  episode: number;
  expected: string;
  zone: string;
  postponed: boolean;
  remind: boolean;
  acknowledged: boolean;
  source: string;
};
export type AnimeReleases = { version: 1; entries: AnimeRelease[] };
export function releaseInstant(text: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(text))
    throw Error(
      "Use an ISO date/time with an explicit UTC offset, for example 2026-11-04T20:00:00-05:00.",
    );
  const stamp = Date.parse(text);
  if (!Number.isFinite(stamp) || Number(text.slice(0, 4)) < 2000 || Number(text.slice(0, 4)) > 2200)
    throw Error("Choose a valid expected date from 2000 to 2200.");
  const day = Date.parse(text.slice(0, 10) + "T00:00:00Z");
  if (new Date(day).toISOString().slice(0, 10) !== text.slice(0, 10))
    throw Error("Expected release date is not a calendar date.");
  return stamp;
}
export function readAnimeReleases(raw: unknown): AnimeReleases {
  const r = raw as AnimeReleases;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["version", "entries"].includes(k)) ||
    !Array.isArray(r.entries) ||
    r.entries.length > 32
  )
    throw Error("Unsupported anime watchlist. Existing entries were kept.");
  const ids = new Set(),
    slots = new Set();
  const entries = r.entries.map((v) => {
    if (
      !v ||
      Object.keys(v).some(
        (k) =>
          ![
            "id",
            "seriesId",
            "numbering",
            "season",
            "episode",
            "expected",
            "zone",
            "postponed",
            "remind",
            "acknowledged",
            "source",
          ].includes(k),
      ) ||
      typeof v.id !== "string" ||
      !/^[\w-]{1,80}$/.test(v.id) ||
      ids.has(v.id) ||
      typeof v.seriesId !== "string" ||
      !/^anime:[a-z0-9-]{1,80}$/i.test(v.seriesId) ||
      !["season", "absolute"].includes(v.numbering) ||
      !Number.isInteger(v.season) ||
      v.season < (v.numbering === "absolute" ? 0 : 1) ||
      v.season > (v.numbering === "absolute" ? 0 : 100) ||
      !Number.isInteger(v.episode) ||
      v.episode < 1 ||
      v.episode > 10000 ||
      typeof v.expected !== "string" ||
      typeof v.zone !== "string" ||
      v.zone.length > 80 ||
      [v.postponed, v.remind, v.acknowledged].some((x) => typeof x !== "boolean") ||
      typeof v.source !== "string" ||
      v.source.length > 200
    )
      throw Error("Invalid anime release observation.");
    releaseInstant(v.expected);
    try {
      new Intl.DateTimeFormat("en", { timeZone: v.zone }).format();
    } catch {
      throw Error("Choose a supported IANA time zone.");
    }
    const slot = [v.seriesId, v.numbering, v.season, v.episode].join("|");
    if (slots.has(slot))
      throw Error("An observation already exists for this episode. Edit it instead.");
    slots.add(slot);
    ids.add(v.id);
    return { ...v };
  });
  return { version: 1, entries };
}
export function releaseObservation(
  row: AnimeRelease,
  reviews: AnimeReviewLedger,
  available: ReadonlySet<string>,
  now: number,
) {
  const matches:string[]=[];
  for(const id of available){const e=reviews.episodes[id];if(e&&e.seriesId===row.seriesId&&e.numbering===row.numbering&&e.season===row.season&&e.episode===row.episode&&e.kind==='episode'){matches.push(id);if(matches.length===8)break;}}
  return {
    available: matches.length > 0,
    ids: matches.slice(0, 8),
    due:
      row.remind &&
      !row.acknowledged &&
      !row.postponed &&
      !matches.length &&
      releaseInstant(row.expected) <= now,
  };
}
export const animeReleases = reviewedPreferences<AnimeReleases>(
  "reelcase.anime-releases.v1",
  () => ({ version: 1, entries: [] }),
  readAnimeReleases,
);
