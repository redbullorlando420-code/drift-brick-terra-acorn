/** Bounded, versioned constraints shared by the editor, saved workspaces and search owner.
 * Plain words keep the existing AND/prefix matcher; field values are exact constraints. */
import { defaultSearchDates, validateSearchDates, type SearchDateFilter } from "./search-dates.ts";
export type SearchQuery = {
  version: 1;
  text: string;
  source: "all" | "youtube" | "twitch" | "local";
  tags: string[];
  category: string;
  minSeconds: number | null;
  maxSeconds: number | null;
  date?: SearchDateFilter;
};
export const emptySearchQuery = (): SearchQuery => ({
  version: 1,
  text: "",
  source: "all",
  tags: [],
  category: "",
  minSeconds: null,
  maxSeconds: null,
});
const label = (value: unknown, limit: number): value is string =>
  typeof value === "string" && value.length <= limit && !/[\u0000-\u001f]/.test(value);
const seconds = (value: unknown) =>
  value === null || (Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 604800);
export function validateSearchQuery(value: unknown): SearchQuery {
  if (!value || typeof value !== "object") throw Error("Search must contain a version 1 query.");
  const q = value as SearchQuery;
  if (
    q.version !== 1 ||
    Object.keys(q).some(
      (key) =>
        ![
          "version",
          "text",
          "source",
          "tags",
          "category",
          "minSeconds",
          "maxSeconds",
          "date",
        ].includes(key),
    ) ||
    !label(q.text, 300) ||
    !["all", "youtube", "twitch", "local"].includes(q.source) ||
    !Array.isArray(q.tags) ||
    q.tags.length > 8 ||
    q.tags.some((tag) => !label(tag, 80) || !tag.trim()) ||
    !label(q.category, 80) ||
    !seconds(q.minSeconds) ||
    !seconds(q.maxSeconds)
  )
    throw Error(
      "Unsupported search data. Use up to 300 text characters, eight tags and a duration of at most seven days.",
    );
  if (q.minSeconds !== null && q.maxSeconds !== null && q.minSeconds > q.maxSeconds)
    throw Error("Minimum duration must not exceed maximum duration.");
  return {
    version: 1,
    text: q.text.trim().replace(/\s+/g, " "),
    source: q.source,
    tags: [...new Set(q.tags.map((tag) => tag.trim().toLowerCase()))],
    category: q.category.trim(),
    minSeconds: q.minSeconds,
    maxSeconds: q.maxSeconds,
    ...(q.date === undefined ? {} : { date: validateSearchDates(q.date) }),
  };
}
export function encodeSearchQuery(value: SearchQuery): string {
  const q = validateSearchQuery(value);
  // Quoted operator-looking text stays text when round-tripped through the parser.
  const text = /(?:^|\s)[a-z][a-z-]*:|["\\]/i.test(q.text) ? JSON.stringify(q.text) : q.text;
  return [
    text,
    q.source !== "all" ? `source:${q.source}` : "",
    ...q.tags.map((tag) => `tag:${JSON.stringify(tag)}`),
    q.category ? `category:${JSON.stringify(q.category)}` : "",
    q.minSeconds !== null || q.maxSeconds !== null
      ? `duration:${q.minSeconds ?? ""}..${q.maxSeconds ?? ""}`
      : "",
    ...(q.date
      ? [
          `${q.date.field === "published" ? "published" : "added"}:${q.date.from}..${q.date.to}`,
          `unknown:${q.date.unknown}`,
          `partial:${q.date.partial}`,
        ]
      : []),
  ]
    .filter(Boolean)
    .join(" ");
}
export function parseSearchQuery(raw: string): {
  query: SearchQuery;
  error?: string;
  filtered: boolean;
} {
  const query = emptySearchQuery();
  try {
    if (raw.length > 4096 || /[\u0000-\u001f]/.test(raw))
      throw Error("Search is too long or contains unsupported control characters.");
    const words: string[] = [],
      seen = new Set<string>();
    const tokens = raw.match(/(?:[^\s"\\]|\\.|"(?:[^"\\]|\\.)*")+/g) ?? [];
    if (tokens.join(" ").replace(/\s/g, "") !== raw.replace(/\s/g, ""))
      throw Error("Close the quoted search value before searching.");
    for (const token of tokens) {
      const field = /^([a-z][a-z-]*):(.*)$/i.exec(token);
      if (!field || /^(?:https?|[a-z])$/i.test(field[1]!)) {
        words.push(token.startsWith('"') ? JSON.parse(token) : token);
        continue;
      }
      const key = field[1]!.toLowerCase(),
        rawValue = field[2]!;
      if (
        ![
          "source",
          "tag",
          "category",
          "duration",
          "published",
          "added",
          "unknown",
          "partial",
        ].includes(key)
      )
        throw Error(
          `Unsupported filter “${key}”. Use source, tag, category, duration, published, added, unknown or partial; quote literal text containing a colon.`,
        );
      if (seen.has(key) && key !== "tag") throw Error(`Use only one ${key} filter.`);
      seen.add(key);
      const value: string = rawValue.startsWith('"') ? JSON.parse(rawValue) : rawValue;
      if (!value) throw Error(`Enter a value for ${key}.`);
      if (key === "source") query.source = value.toLowerCase() as SearchQuery["source"];
      if (key === "tag") query.tags.push(value);
      if (key === "category") query.category = value;
      if (key === "published" || key === "added") {
        if (seen.has(key === "published" ? "added" : "published"))
          throw Error("Choose publication or added time, not both.");
        const range = /^(\d{4}-\d{2}-\d{2})?\.\.(\d{4}-\d{2}-\d{2})?$/.exec(value);
        if (!range) throw Error("Date ranges use YYYY-MM-DD..YYYY-MM-DD; either end may be open.");
        query.date = {
          ...(query.date ?? defaultSearchDates()),
          field: key === "published" ? "published" : "added",
          from: range[1] ?? "",
          to: range[2] ?? "",
        };
      }
      if (key === "unknown" || key === "partial")
        query.date = { ...(query.date ?? defaultSearchDates()), [key]: value } as SearchDateFilter;
      if (key === "duration") {
        const match = /^(\d{0,6})\.\.(\d{0,6})$/.exec(value);
        if (!match || (!match[1] && !match[2]))
          throw Error(
            "Duration uses seconds: duration:600..3600, duration:600.. or duration:..3600.",
          );
        query.minSeconds = match[1] ? Number(match[1]) : null;
        query.maxSeconds = match[2] ? Number(match[2]) : null;
      }
    }
    query.text = words.join(" ");
    const clean = validateSearchQuery(query);
    return {
      query: clean,
      filtered:
        clean.source !== "all" ||
        clean.tags.length > 0 ||
        Boolean(clean.category) ||
        clean.minSeconds !== null ||
        clean.maxSeconds !== null ||
        Boolean(clean.date),
    };
  } catch (error) {
    return {
      query: emptySearchQuery(),
      error: error instanceof Error ? error.message : "Invalid search.",
      filtered: false,
    };
  }
}
export function queryChips(q: SearchQuery) {
  return [
    ...(q.source === "all" ? [] : [{ key: "source", label: `Source: ${q.source}` }]),
    ...q.tags.map((tag, index) => ({ key: `tag-${index}`, label: `Tag: ${tag}` })),
    ...(q.category ? [{ key: "category", label: `Category: ${q.category}` }] : []),
    ...(q.minSeconds !== null || q.maxSeconds !== null
      ? [
          {
            key: "duration",
            label: `Duration: ${q.minSeconds ?? 0}–${q.maxSeconds ?? "any"} seconds`,
          },
        ]
      : []),
    ...(q.date
      ? [
          {
            key: "date",
            label: `${q.date.field === "published" ? "Published" : "Added locally"}: ${q.date.from || "any"}–${q.date.to || "any"} · unknown ${q.date.unknown} · partial ${q.date.partial}`,
          },
        ]
      : []),
  ];
}
export function removeQueryChip(q: SearchQuery, key: string): SearchQuery {
  const { date, ...base } = q;
  return {
    ...base,
    ...(date && key !== "date" ? { date } : {}),
    source: key === "source" ? "all" : q.source,
    tags: key.startsWith("tag-")
      ? q.tags.filter((_, index) => index !== Number(key.slice(4)))
      : q.tags,
    category: key === "category" ? "" : q.category,
    minSeconds: key === "duration" ? null : q.minSeconds,
    maxSeconds: key === "duration" ? null : q.maxSeconds,
  };
}
