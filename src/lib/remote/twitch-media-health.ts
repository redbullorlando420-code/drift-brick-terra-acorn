import { twitchUrlIdentity, type TwitchIdentity } from "../videos/twitch-identity.ts";
export type TwitchMediaCheck = {
  version: 1;
  identity: TwitchIdentity;
  checkedAt: number;
  state: "available" | "publicly-unavailable" | "unknown";
  code: "public-record" | "public-null" | "transport-or-schema";
};
export function mediaCheckIdentity(raw: unknown): TwitchIdentity {
  const id = typeof raw === "string" ? twitchUrlIdentity(raw) : undefined;
  if (!id || id.kind === "live")
    throw Error("Choose a Twitch VOD or clip official URL. Live channels use Live checks.");
  return id;
}
export function parseTwitchMediaCheck(
  identity: TwitchIdentity,
  raw: unknown,
  now = Date.now(),
): TwitchMediaCheck {
  const unknown = (): TwitchMediaCheck => ({
    version: 1,
    identity,
    checkedAt: now,
    state: "unknown",
    code: "transport-or-schema",
  });
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return unknown();
  const r = raw as { errors?: unknown; data?: Record<string, unknown> };
  if (
    (r.errors !== undefined && (!Array.isArray(r.errors) || r.errors.length)) ||
    !r.data ||
    typeof r.data !== "object" ||
    Array.isArray(r.data)
  )
    return unknown();
  const field = identity.kind === "vod" ? "video" : "clip";
  if (!Object.hasOwn(r.data, field)) return unknown();
  const value = r.data[field];
  if (value === null)
    return {
      version: 1,
      identity,
      checkedAt: now,
      state: "publicly-unavailable",
      code: "public-null",
    };
  if (!value || typeof value !== "object" || Array.isArray(value)) return unknown();
  const node = value as { id?: unknown; slug?: unknown };
  if (
    identity.kind === "vod"
      ? node.id !== identity.value
      : node.slug !== identity.value || typeof node.id !== "string" || !node.id
  )
    return unknown();
  return { version: 1, identity, checkedAt: now, state: "available", code: "public-record" };
}
export function createTwitchMediaChecker(
  read: (query: string, variables: Record<string, unknown>) => Promise<unknown>,
) {
  return async (raw: unknown): Promise<TwitchMediaCheck> => {
    const identity = mediaCheckIdentity(raw);
    try {
      return parseTwitchMediaCheck(
        identity,
        await read(
          identity.kind === "vod"
            ? "query($id:ID!){video(id:$id){id}}"
            : "query($slug:ID!){clip(slug:$slug){id slug}}",
          identity.kind === "vod" ? { id: identity.value } : { slug: identity.value },
        ),
      );
    } catch {
      return {
        version: 1,
        identity,
        checkedAt: Date.now(),
        state: "unknown",
        code: "transport-or-schema",
      };
    }
  };
}
