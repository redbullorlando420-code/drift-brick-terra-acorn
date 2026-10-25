export type TwitchLiveUser = {
  id: string;
  displayName?: string;
  profileImageURL?: string;
  stream: null | {
    title?: string;
    viewersCount: number;
    previewImageURL?: string;
    game?: { name?: string };
  };
};
const record = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export function validateTwitchLiveUser(value: unknown): TwitchLiveUser {
  if (!record(value) || typeof value.id !== "string" || !value.id.trim() || value.id.length > 128)
    throw Error("Twitch returned a malformed live user identity; the prior observation was kept.");
  if (
    !Object.hasOwn(value, "stream") ||
    (value.stream !== null &&
      (!record(value.stream) ||
        !Number.isSafeInteger(value.stream.viewersCount) ||
        value.stream.viewersCount < 0))
  )
    throw Error(
      "Twitch returned a malformed stream/viewer observation; the prior observation was kept.",
    );
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const stream =
    value.stream === null
      ? null
      : {
          title: text(value.stream.title, 512),
          viewersCount: value.stream.viewersCount,
          previewImageURL: text(value.stream.previewImageURL, 2048),
          ...(record(value.stream.game) && typeof value.stream.game.name === "string"
            ? { game: { name: value.stream.game.name.slice(0, 256) } }
            : {}),
        };
  return {
    id: value.id,
    displayName: text(value.displayName, 256),
    profileImageURL: text(value.profileImageURL, 2048),
    stream,
  };
}
type Response = {
  data?: Record<string, unknown>;
  errors?: Array<{ message?: string; path?: Array<string | number> }>;
};
export async function readTwitchLiveBatch(
  logins: readonly string[],
  read: (query: string, variables: Record<string, unknown>) => Promise<Response>,
) {
  const found = new Map<string, { user?: TwitchLiveUser; error?: Error; warning?: string }>();
  const unique = [
    ...new Set(
      logins
        .filter((login) => /^[a-z0-9_]{1,25}$/i.test(login))
        .map((login) => login.toLowerCase()),
    ),
  ];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(2, Math.ceil(unique.length / 12)) }, async () => {
      while (cursor < unique.length) {
        const offset = cursor;
        cursor += 12;
        const batch = unique.slice(offset, offset + 12),
          variables = Object.fromEntries(batch.map((login, index) => ["l" + index, login]));
        const fields =
          "id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}}";
        const query =
          "query(" +
          batch.map((_, i) => "$l" + i + ":String!").join(",") +
          "){" +
          batch.map((_, i) => "c" + i + ":user(login:$l" + i + "){" + fields + "}").join(" ") +
          "}";
        try {
          const result = await read(query, variables);
          for (const [index, login] of batch.entries()) {
            const alias = "c" + index;
            try {
              if (!record(result) || (result.errors !== undefined && !Array.isArray(result.errors)))
                throw Error(
                  "Twitch returned a malformed live batch envelope; the prior observation was kept.",
                );
              const errors = result.errors ?? [],
                global = errors.find((e) => !e || !Array.isArray(e.path) || !e.path.length);
              if (global)
                throw Error(
                  "Twitch live request failed: " +
                    (typeof global.message === "string"
                      ? global.message.slice(0, 180)
                      : "provider error"),
                );
              const own = errors.filter((e) => e.path?.[0] === alias);
              if (!record(result.data) || !Object.hasOwn(result.data, alias))
                throw Error(
                  "Twitch returned an incomplete live response; the prior observation was kept.",
                );
              const value = result.data[alias],
                user = validateTwitchLiveUser(value);
              const critical = own.find((e) => {
                const p = e.path!;
                return (
                  p.length < 2 ||
                  p[1] === "id" ||
                  (p[1] === "stream" &&
                    (p.length < 3 || p[2] === "viewersCount" || user.stream === null))
                );
              });
              if (critical)
                throw Error(
                  "Twitch live check failed: " +
                    (typeof critical.message === "string"
                      ? critical.message.slice(0, 180)
                      : "provider field error"),
                );
              found.set(login, {
                user,
                ...(own.length
                  ? {
                      warning:
                        "Optional Twitch metadata was unavailable; stream state and viewer count were verified.",
                    }
                  : {}),
              });
            } catch (error) {
              found.set(login, {
                error:
                  error instanceof Error
                    ? error
                    : Error("Twitch returned a malformed creator observation."),
              });
            }
          }
        } catch (error) {
          for (const login of batch)
            found.set(login, {
              error:
                error instanceof Error
                  ? error
                  : Error("Twitch live transport failed; prior observations were kept."),
            });
        }
      }
    }),
  );
  return found;
}
