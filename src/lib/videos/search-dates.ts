import type { LibraryVideo } from "./types";
export type SearchDateFilter = {
  field: "published" | "added";
  from: string;
  to: string;
  unknown: "exclude" | "include" | "only";
  partial: "overlap" | "exclude";
};
export const defaultSearchDates = (): SearchDateFilter => ({
  field: "published",
  from: "",
  to: "",
  unknown: "exclude",
  partial: "overlap",
});
const day = 86400000;
const validEpoch=(value:number)=>Number.isFinite(value)&&value>0&&value<=253402300799999;
function publicationInstant(value:string):number|undefined {
 if(value.length>64||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)||calendarDay(value.slice(0,10))===undefined)return;
 const [hour,minute,second]=value.slice(11,19).split(':').map(Number);
 if(hour!>23||minute!>59||second!>59)return;
 const stamp=Date.parse(value);return validEpoch(stamp)?stamp:undefined;
}
export function calendarDay(value: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const stamp = Date.parse(value + "T00:00:00Z");
  if (
    !Number.isFinite(stamp) ||
    new Date(stamp).toISOString().slice(0, 10) !== value ||
    Number(value.slice(0, 4)) < 1900
  )
    return;
  return stamp;
}
export function validateSearchDates(value: unknown): SearchDateFilter {
  const q = value as SearchDateFilter;
  if (
    !q ||
    typeof q !== "object" ||
    Object.keys(q).some((key) => !["field", "from", "to", "unknown", "partial"].includes(key)) ||
    !["published", "added"].includes(q.field) ||
    typeof q.from !== "string" ||
    typeof q.to !== "string" ||
    (q.from !== "" && calendarDay(q.from) === undefined) ||
    (q.to !== "" && calendarDay(q.to) === undefined) ||
    !["exclude", "include", "only"].includes(q.unknown) ||
    !["overlap", "exclude"].includes(q.partial)
  )
    throw Error(
      "Use valid calendar dates, an explicit date field and supported unknown/partial-date choices.",
    );
  if (q.from && q.to && q.from > q.to) throw Error("Start date must not follow end date.");
  return { field: q.field, from: q.from, to: q.to, unknown: q.unknown, partial: q.partial };
}
type DateEvidence = {
  start: number;
  end: number;
  precision: "instant" | "day" | "month" | "year";
  source: string;
};
/** Publication never falls back to a scan/download clock. UTC calendar periods
 * describe uncertainty, not invented instants written into saved metadata. */
export function searchDateEvidence(
  video: LibraryVideo,
  field: SearchDateFilter["field"],
): DateEvidence | undefined {
  if (field === "added")
    return !video.remote && validEpoch(video.addedAt)
      ? {
          start: video.addedAt,
          end: video.addedAt + 1,
          precision: "instant",
          source: "local library added time",
        }
      : undefined;
  const r = video.remote;
  if (
    !r ||
    !["rss", "provider", "watch"].includes(r.publishedSource ?? "") ||
    r.live ||
    r.youtubeType === "upcoming" ||
    r.publishedPrecision === "relative" ||
    r.publishedPrecision === "unknown"
  )
    return;
  const value = r.publishedDate;
  if (r.publishedPrecision === "year" || r.publishedPrecision === "month") {
    const year = r.publishedPrecision === "year";
    if (typeof value !== "string" || !(year ? /^\d{4}$/ : /^\d{4}-\d{2}$/).test(value)) return;
    const start = calendarDay(value + (year ? "-01-01" : "-01"));
    if (start === undefined) return;
    const date = new Date(start);
    const end = year
      ? Date.UTC(date.getUTCFullYear() + 1, 0, 1)
      : Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    return { start, end, precision: year ? "year" : "month", source: r.publishedSource! };
  }
  if (r.publishedPrecision === "day" || (!r.publishedPrecision && value?.length === 10)) {
    const start = typeof value === "string" ? calendarDay(value) : undefined;
    return start === undefined
      ? undefined
      : { start, end: start + day, precision: "day", source: r.publishedSource! };
  }
  if (
    r.publishedPrecision === "instant" ||
    !r.publishedPrecision
  ) {
    // Older provider/watch records can have a full ISO date but no precision
    // flag. Prefer that explicit value to an unrelated cache timestamp.
    const epoch=r.publishedPrecision==='instant'||!value||r.publishedSource==='rss';
    const start = epoch?video.addedAt:value&&value.length>10?publicationInstant(value):undefined;
    if (start!==undefined&&validEpoch(start))
      return { start, end: start + 1, precision: "instant", source: r.publishedSource! };
  }
  return;
}
export function matchesSearchDates(video: LibraryVideo, q: SearchDateFilter): boolean {
  const evidence = searchDateEvidence(video, q.field);
  if (!evidence) return q.unknown !== "exclude";
  if (q.unknown === "only") return false;
  if (q.partial === "exclude" && (evidence.precision === "year" || evidence.precision === "month"))
    return false;
  const start = q.from ? calendarDay(q.from)! : -Infinity,
    end = q.to ? calendarDay(q.to)! + day : Infinity;
  return evidence.start < end && evidence.end > start;
}
export function publicationPeriodLabel(video: LibraryVideo): string | undefined {
  if(video.remote?.publishedPrecision!=='year'&&video.remote?.publishedPrecision!=='month')return;
  const evidence = searchDateEvidence(video, "published");
  return evidence && (evidence.precision === "year" || evidence.precision === "month")
    ? `Published ${video.remote!.publishedDate} · ${evidence.precision} only`
    : undefined;
}
