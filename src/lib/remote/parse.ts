export type ImportItem = {
  query: string;
  kind: "youtube" | "twitch";
  title?: string;
};

function stripBom(text: string) {
  return text.replace(/^\uFEFF/, "").trim();
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.trim());
      if (row.some((c) => c)) rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell.trim());
  if (row.some((c) => c)) rows.push(row);
  return rows;
}

function headerIndex(headers: string[], ...names: string[]) {
  const lower = headers.map((h) => h.toLowerCase().replace(/[_-]/g, " ").trim());
  for (const name of names) {
    const i = lower.indexOf(name);
    if (i >= 0) return i;
  }
  return -1;
}

function youtubeQueryFrom(id?: string, url?: string, title?: string): string | null {
  const cid = id?.trim();
  if (cid && /^UC[\w-]{20,}$/.test(cid)) return cid;
  const u = url?.trim();
  if (u) return u;
  const t = title?.trim();
  if (t?.startsWith("@") || t?.includes("youtube")) return t;
  if (t) return `https://www.youtube.com/@${t.replace(/\s+/g, "")}`;
  return cid || null;
}

function fromCsv(text: string, kind: "youtube" | "twitch"): ImportItem[] {
  const rows = parseCsvRows(stripBom(text));
  if (rows.length < 2) return [];
  const headers = rows[0] ?? [];
  const idI = headerIndex(headers, "channel id", "channelid", "id", "channel_id");
  const urlI = headerIndex(headers, "channel url", "channelurl", "url", "channel url");
  const titleI = headerIndex(
    headers,
    "channel title",
    "channeltitle",
    "title",
    "name",
    "channel name",
  );
  const loginI = headerIndex(headers, "login", "username", "user", "channel");
  const out: ImportItem[] = [];
  for (const row of rows.slice(1)) {
    if (kind === "twitch") {
      const login = (loginI >= 0 ? row[loginI] : row[0])?.trim();
      if (login) out.push({ query: login, kind: "twitch", title: login });
      continue;
    }
    const query = youtubeQueryFrom(
      idI >= 0 ? row[idI] : undefined,
      urlI >= 0 ? row[urlI] : undefined,
      titleI >= 0 ? row[titleI] : undefined,
    );
    if (query) {
      out.push({
        query,
        kind: "youtube",
        title: titleI >= 0 ? row[titleI] : undefined,
      });
    }
  }
  return out;
}

function fromOpml(text: string): ImportItem[] {
  const out: ImportItem[] = [];
  const re =
    /<outline\b([^>]*)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const attrs = m[1] ?? "";
    const xmlUrl = attrs.match(/\b(?:xmlUrl|xmlurl)="([^"]+)"/i)?.[1] ?? "";
    const htmlUrl = attrs.match(/\b(?:htmlUrl|htmlurl)="([^"]+)"/i)?.[1] ?? "";
    const title =
      attrs.match(/\btitle="([^"]+)"/i)?.[1] ??
      attrs.match(/\btext="([^"]+)"/i)?.[1];
    const url = decodeXmlAttr(xmlUrl || htmlUrl);
    if (!url && !title) continue;
    const twitch = /twitch\.tv/i.test(url);
    out.push({
      query: url || title || "",
      kind: twitch ? "twitch" : "youtube",
      title: title ? decodeXmlAttr(title) : undefined,
    });
  }
  return out.filter((i) => i.query);
}

function decodeXmlAttr(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'");
}

function fromJson(text: string, kind: "youtube" | "twitch"): ImportItem[] | null {
  try {
    const data = JSON.parse(text) as unknown;
    const list = Array.isArray(data)
      ? data
      : data && typeof data === "object"
        ? ((data as { subscriptions?: unknown; items?: unknown; follows?: unknown })
            .subscriptions ??
          (data as { items?: unknown }).items ??
          (data as { follows?: unknown }).follows ??
          [])
        : [];
    if (!Array.isArray(list) || list.length === 0) return null;
    const out: ImportItem[] = [];
    for (const raw of list) {
      if (typeof raw === "string") {
        out.push({ query: raw, kind });
        continue;
      }
      if (!raw || typeof raw !== "object") continue;
      const rec = raw as Record<string, unknown>;
      const snippet = (rec.snippet ?? rec) as Record<string, unknown>;
      const resource = (snippet.resourceId ?? rec.resourceId ?? {}) as Record<
        string,
        unknown
      >;
      const id = String(
        rec.channelId ??
          rec.channel_id ??
          resource.channelId ??
          rec.id ??
          "",
      );
      const url = String(rec.url ?? rec.channelUrl ?? rec.channel_url ?? "");
      const title = String(
        rec.title ?? rec.channelTitle ?? snippet.title ?? rec.name ?? rec.login ?? "",
      );
      const login = String(rec.login ?? rec.username ?? rec.displayName ?? "");
      if (kind === "twitch") {
        const q = login || title || url;
        if (q) out.push({ query: q, kind: "twitch", title: title || login });
        continue;
      }
      const query = youtubeQueryFrom(id, url, title);
      if (query) out.push({ query, kind: "youtube", title: title || undefined });
    }
    return out;
  } catch {
    return null;
  }
}

function fromLines(text: string, kind: "youtube" | "twitch"): ImportItem[] {
  return stripBom(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.toLowerCase().startsWith("channel "))
    .map((line) => ({ query: line.replace(/^[-*]\s+/, ""), kind }));
}

export function parseImportText(text: string, kind: "youtube" | "twitch"): ImportItem[] {
  const raw = stripBom(text);
  if (!raw) return [];
  if (raw.includes("<opml") || raw.includes("<outline")) return fromOpml(raw);
  if (raw.startsWith("{") || raw.startsWith("[")) {
    const json = fromJson(raw, kind);
    if (json && json.length) return json;
  }
  const first = raw.split(/\r?\n/, 1)[0] ?? "";
  if (first.includes(",") && /channel|url|title|login|id/i.test(first)) {
    const csv = fromCsv(raw, kind);
    if (csv.length) return csv;
  }
  return fromLines(raw, kind);
}

export function uniqueItems(items: ImportItem[]): ImportItem[] {
  const seen = new Set<string>();
  const out: ImportItem[] = [];
  for (const item of items) {
    const key = `${item.kind}:${item.query.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
