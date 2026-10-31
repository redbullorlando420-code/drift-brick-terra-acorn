const issues = [
  "none",
  "not-run",
  "request-limit",
  "rate-limited",
  "transport",
  "identity-missing",
  "provider-failure",
  "live-unverified",
  "media-contract",
];
const fail = (issue) => {
  throw Object.assign(new Error("Canary contract failed."), { canaryIssue: issue });
};
const scopes = ["live", "vods", "clips"],
  states = ["passed", "empty", "failed", "not-run", "request-limit", "rate-limited"];
const object = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
const integer = (n, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n >= 0 && n <= max;
const stopReasons = [
  "exhausted",
  "entry-budget",
  "page-budget",
  "stalled",
  "incomplete-page",
  "challenge",
  "provider-error",
  "budget",
  "error",
  "malformed",
  "quota",
  "provider-hold",
  "partial-error",
];
export function canaryCreators(input) {
  if (
    !Array.isArray(input) ||
    !input.length ||
    input.length > 3 ||
    input.some((s) => typeof s !== "string" || !/^[a-z0-9_]{1,25}$/i.test(s))
  )
    throw Error("Supply one to three public Twitch logins, without URLs or account data.");
  return [...new Set(input.map((s) => s.toLowerCase()))];
}
export function canaryResume(raw) {
  const r = object(raw);
  if (r.schema !== 1 || !Array.isArray(r.tasks) || r.tasks.length > 9 || !integer(r.retryAt))
    throw Error("Unsupported canary resume report.");
  const creators = canaryCreators(r.creators),
    expected = creators.flatMap((creator) => scopes.map((scope) => creator + ":" + scope));
  if (r.tasks.length !== expected.length) throw Error("Incomplete canary resume plan.");
  const tasks = r.tasks.map((value, index) => {
    const t = object(value);
    if (
      t.creator + ":" + t.scope !== expected[index] ||
      !states.includes(t.state) ||
      !integer(t.checkedAt) ||
      !integer(t.rows, 1000) ||
      !integer(t.pages, 100) ||
      !integer(t.duplicates, 100000) ||
      !Array.isArray(t.stops) ||
      t.stops.length > 8 ||
      t.stops.some((s) => !stopReasons.includes(s))
    )
      throw Error("Invalid canary task receipt.");
    return {
      creator: t.creator,
      scope: t.scope,
      state: t.state,
      checkedAt: t.checkedAt,
      rows: t.rows,
      pages: t.pages,
      duplicates: t.duplicates,
      stops: t.stops,
      issue: issues.includes(t.issue) ? t.issue : t.state === "not-run" ? "not-run" : "none",
    };
  });
  return { creators, tasks, retryAt: r.retryAt };
}
export function summarizeCanaryTask(scope, raw) {
  const r = object(raw),
    channel = object(r.channel ?? (Array.isArray(r.channels) ? r.channels[0] : null));
  if (
    !Array.isArray(r.videos) ||
    r.videos.length > 1000 ||
    channel.kind !== "twitch" ||
    !channel.channelId
  )
    fail("identity-missing");
  if (
    channel.lastProviderFailure ||
    (scope === "live" && channel.lastLiveFailure) ||
    (scope === "clips" && channel.lastClipFailure)
  )
    fail("provider-failure");
  if (scope === "live" && (!channel.liveCheckedAt || typeof channel.live !== "boolean"))
    fail("live-unverified");
  const videos = r.videos.filter((v) =>
    scope === "live"
      ? v?.remote?.live
      : scope === "clips"
        ? v?.extension === "clip"
        : v?.extension === "vod",
  );
  for (const v of videos) {
    const remote = object(v.remote);
    if (
      remote.kind !== "twitch" ||
      (scope === "live"
        ? !Number.isSafeInteger(remote.viewers) || remote.viewers < 0
        : typeof remote.videoId !== "string" ||
          !["past-broadcast", "highlight", "upload", "clip"].includes(remote.twitchContent?.kind))
    )
      fail("media-contract");
  }
  const diagnostic = object(
      scope === "vods"
        ? channel.twitchArchiveDiagnostics
        : scope === "clips"
          ? channel.twitchClipDiagnostics
          : null,
    ),
    windows = Array.isArray(diagnostic.windows) ? diagnostic.windows : [];
  const stops = [diagnostic.stopReason, ...windows.map((w) => w.stop)]
    .filter((s) => stopReasons.includes(s))
    .slice(0, 8);
  return {
    issue: "none",
    state: videos.length ? "passed" : "empty",
    rows: videos.length,
    pages: integer(diagnostic.pages, 100) ? diagnostic.pages : 0,
    duplicates: integer(diagnostic.duplicates, 100000) ? diagnostic.duplicates : 0,
    stops,
  };
}
/** Explicit, sequential, bounded runner. The injected adapter uses production pull paths.
 * The request guard is still enforced when a production parser catches failures. */
export async function runTwitchCanary({
  creators,
  maxRequests = 12,
  resume,
  fetcher = globalThis.fetch,
  runTask,
  now = Date.now,
  gapMs = 200,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
}) {
  if (!Number.isInteger(maxRequests) || maxRequests < 1 || maxRequests > 18)
    throw Error("Request ceiling must be between 1 and 18.");
  const prior = resume ? canaryResume(resume) : null,
    logins = prior?.creators ?? canaryCreators(creators);
  if (prior && creators && JSON.stringify(canaryCreators(creators)) !== JSON.stringify(logins))
    throw Error("Resume targets must match the saved public creator list.");
  let retryAt = prior?.retryAt ?? 0,
    activeTask = null,
    limitReached = false,
    networkFailed = false;
  const requests = [],
    tasks =
      prior?.tasks ??
      logins.flatMap((creator) =>
        scopes.map((scope) => ({
          creator,
          scope,
          state: "not-run",
          checkedAt: 0,
          rows: 0,
          pages: 0,
          duplicates: 0,
          stops: [],
          issue: "not-run",
        })),
      );
  const guardedFetch = async (url, init) => {
    const u = new URL(String(url)),
      headers = new Headers(init?.headers);
    if (
      u.href !== "https://gql.twitch.tv/gql" ||
      init?.method !== "POST" ||
      headers.has("cookie") ||
      headers.has("authorization")
    )
      throw Error("Canary permits public Twitch metadata requests only.");
    if (retryAt > now()) throw Error("Provider cooldown is active.");
    if (requests.length >= maxRequests) {
      limitReached = true;
      throw Error("Canary request ceiling reached.");
    }
    if (requests.length) await sleep(gapMs);
    if(retryAt>now())throw Error("Provider cooldown is active.");
    if(requests.length>=maxRequests){limitReached=true;throw Error("Canary request ceiling reached.");}
    const row = {
      scope: activeTask.scope,
      creator: activeTask.creator,
      status: null,
      elapsedMs: 0,
    };
    requests.push(row);
    const start = now();
    try {
      const response = await fetcher(url, {
        ...init,
        credentials: "omit",
        redirect: "error",
        signal: AbortSignal.any([
          init?.signal ?? AbortSignal.timeout(12000),
          AbortSignal.timeout(12000),
        ]),
      });
      row.status = response.status;
      if (
        response.status === 429 ||
        (response.status === 503 && response.headers.has("retry-after"))
      ) {
        const h = response.headers.get("retry-after"),
          seconds = Number(h),
          date = Date.parse(h ?? "");
        retryAt = Math.max(
          retryAt,
          now() +
            Math.min(
              86400000,
              Math.max(
                60000,
                h && Number.isFinite(seconds)
                  ? seconds * 1000
                  : Number.isFinite(date)
                    ? date - now()
                    : 60000,
              ),
            ),
        );
      }
      return response;
    } catch {
      networkFailed = true;
      throw Error("Public Twitch request failed.");
    } finally {
      row.elapsedMs = Math.max(0, Math.round(now() - start));
    }
  };
  for (const task of tasks) {
    if (["passed", "empty"].includes(task.state)) continue;
    if (retryAt > now() || requests.length >= maxRequests) break;
    activeTask = task;
    limitReached = false;
    networkFailed = false;
    const before = requests.length;
    try {
      const result = await runTask(task, guardedFetch);
      Object.assign(task, summarizeCanaryTask(task.scope, result));
      if (requests.length === before) task.state = "not-run";
    } catch (error) {
      task.state = "failed";
      task.issue = issues.includes(error?.canaryIssue) ? error.canaryIssue : "provider-failure";
    }
    task.checkedAt = now();
    if (limitReached) {
      task.state = "request-limit";
      task.issue = "request-limit";
    } else if (retryAt > now()) {
      task.state = "rate-limited";
      task.issue = "rate-limited";
    } else if (networkFailed) {
      task.state = "failed";
      task.issue = "transport";
    }
    if (limitReached || retryAt > now()) break;
  }
  return {
    schema: 1,
    kind: "realhub-twitch-canary",
    checkedAt: now(),
    creators: logins,
    maxRequests,
    requests,
    retryAt,
    tasks,
    ok: tasks.every((t) => ["passed", "empty"].includes(t.state)),
    limit:
      "Public metadata contract check only. No cookies, playback, subscriptions or private account data. Empty means a readable empty result, not a playable-video verification.",
  };
}
