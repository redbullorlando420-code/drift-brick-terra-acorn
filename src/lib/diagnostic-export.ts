/** Shareable diagnostics use closed schemas, never recursive key-name scrubbing.
 * Unknown keys, free text, identifiers and object accessors are not traversed.
 * Intentional private backups and selected-content exports use separate paths. */
type Rule =
  | "number"
  | "boolean"
  | { enum: readonly string[] }
  | { items: Rule; max: number }
  | { [key: string]: Rule };
const N: Rule = "number",
  B: Rule = "boolean",
  E = (...values: string[]): Rule => ({ enum: values }),
  A = (items: Rule, max = 32): Rule => ({ items, max }),
  nums = (keys: string): Record<string, Rule> =>
    Object.fromEntries(keys.split(" ").map((k) => [k, N]));
export const DIAGNOSTIC_EXCLUDED = [
  "Credentials, cookies and authorization headers",
  "Invitation tokens, peer addresses and room IDs",
  "Local paths, source URLs and media/creator IDs",
  "Private titles, tags, notes, prompts and chat",
  "Raw provider responses, errors and unknown fields",
] as const;
const metrics = nums("hits misses errors lastAccessAt lastEntryBytes oldestObservedEntryAt");
const writer = { ...nums("pending pendingWeight"), writing: B };
const stage = E("signaling", "ice", "transport", "handshake", "player"),
  state = E("waiting", "working", "ready", "attention", "idle");
const tool = { ytDlp: B, youtubeDl: B },
  destinations = { downloads: B, artwork: B, prints: B, libraryPack: B };
const statuses = nums("queued running interrupted paused done cancelled error");
const companion = {
  ...nums("schema checkedAt version roots"),
  compatible: B,
  capabilities: A(
    E(
      "file-health",
      "launch",
      "shortcut-catalog",
      "shortcut-icons",
      "batch-verify",
      "watch-status",
      "cache-status",
      "cache-warmup",
      "media-inspection",
      "roku-ssdp-discovery",
      "offline-save",
      "youtube-downloads",
      "steam-epic-catalog",
      "library-pack-disk",
      "thumb-disk-cache",
      "thumb-cache-url",
      "artwork-audit",
      "prints-bridge",
      "tray-autostart",
      "job-badge",
      "studio-models",
      "task-receipts",
      "root-access",
    ),
    64,
  ),
  destinations,
  jobs: statuses,
};
const health = E("healthy", "watch", "attention", "unmeasured"),
  phase = E(
    "idle",
    "loading",
    "ready",
    "playing",
    "paused",
    "ended",
    "error",
    "unsupported",
    "blocked",
    "timeout",
  );
const schemas: Record<string, Rule> = {
  performance: {
    ...nums("version capturedAt catalogEntries sourceCount"),
    lowMemory: B,
    pullsPaused: B,
    frames: {
      ...nums(
        "sampledFrames sampledAt recentLongFrames recentWorstFrameMs lastActiveCards mountedCards totalLongFrames averageFrameMs activeCards longFrames lastFrameMs worstFrameMs startedAt totalSampledFrames",
      ),
      enabled: B,
      monitoring: B,
    },
    interactions: Object.fromEntries(
      ["navigation", "search", "rating", "playback", "queue"].map((k) => [
        k,
        nums("count lastMs worstMs at"),
      ]),
    ),
    ranking: {
      ...nums("active deferred coalesced"),
      budget: nums("settleMs sliceMs sliceRows samples"),
      samples: A({
        kind: E("youtube", "twitch", "preview"),
        outcome: E("complete", "cancelled", "failed"),
        ...nums("rows slices maxSliceMs cpuMs elapsedMs"),
      }),
    },
    search: {
      status: E("idle", "building", "ready", "failed", "unavailable"),
      ...nums("generation pending packed workers"),
    },
    startup: {
      ...nums(
        "startedAt moduleReadyMs homeReadyMs catalogReadyMs firstShelfAt elapsedMs cards routeElapsedMs artworkWaitMs",
      ),
      artwork: E("pending", "loaded", "deferred"),
      phases: Object.fromEntries(
        ["preferences", "remoteRead", "remotePrepare", "localRead", "localPrepare"].map((k) => [
          k,
          { ...nums("startedAt elapsedMs rows"), failed: B },
        ]),
      ),
    },
    artwork: {
      ...nums(
        "active queued inflight recalling entries bytes byteLimit entryLimit failures hits misses evictions",
      ),
      decodes: nums("active queued peak started completed failed cancelled closedLate limit"),
      admission: {
        ...nums(
          "active queued queuedHigh queuedLow started completed cancelled peak maxActive maxQueued max",
        ),
        lowMemory: B,
      },
    },
    viewer: nums(
      "entries estimatedBytes maxEntries maxBytes pending activeTranscripts subscribers",
    ),
    counters: { "catalog-selectors": metrics, "thumbnail-disk": metrics },
    providers: A({
      kind: E("youtube", "twitch"),
      ...nums("samples hits misses uncached sizedSamples estimatedBytes entries oldestAgeMs"),
    }),
    providerBudgets: {
      ...nums(
        "responseBytes responseDepth responseNodes warmCacheRows warmCacheBytes warmCacheEntries queuedRequests requestConcurrency requestTimeoutMs metadataRows normalizedRows pageRows transientRows errorPrefixBytes bodyTimeoutMs youtubeTransfers youtubeFeedTransfers youtubeLiveTransfers youtubeLiveWorkers youtubeLiveRequestGapMs twitchTransfers adultTransfers refreshWorkers liveWorkers archiveWorkers importWorkers importAttempts warmCacheEntryBytes youtubeCacheBytes twitchCacheBytes adultCacheBytes",
      ),
      json: nums("tokens containers depth stringUnits scratchBytes"),
    },
    writes: { activity: writer, artwork: writer, artworkMirror: writer },
    recurring: {
      ...nums(
        "tasks active pending running completed wakeups timerCount scheduled paused callbacks",
      ),
      enabled: B,
    },
    sources: nums("objectUrls fileHandles files"),
    feedback: nums("lastRatingQueueMs lastPersistMs pendingWrites"),
    companion: { posters: writer, rememberedPosters: N },
    scorecard: {
      health,
      checks: A({ id: E("startup", "input", "frames", "memory", "cards", "storage"), health }, 8),
    },
  },
  room: {
    ...nums("version capturedAt peers"),
    role: E("guest", "host"),
    signaling: E("connecting", "online", "retrying"),
    stages: A({ stage, state }, 5),
    events: A({ stage, state, at: N }, 24),
    queue: nums("count revision"),
  },
  "companion-update": { schema: N, baseline: companion, current: companion },
  "root-access": {
    ...nums("generation active pending"),
    persistent: B,
    roots: A(
      {
        enabled: B,
        state: E("approved", "revoked", "identity-changed", "policy-unreadable"),
        revision: N,
      },
      64,
    ),
  },
  "youtube-player": {
    version: N,
    capturedAt: N,
    titles: A({ phase, changedAt: N, loads: N, events: A({ phase, at: N, code: N }, 6) }, 12),
  },
  "provider-quality": {
    version: N,
    providers: A(
      {
        provider: E("eporner", "redtube", "chaturbate", "myfreecams", "reddit", "booru", "redgifs"),
        status: E("loaded", "empty", "failed"),
        quality: nums(
          "pages received duplicates missingDate missingTitle missingArtwork accepted rejected publicationRecords invalidRows",
        ),
        rates: nums("duplicates missingDate missingTitle missingArtwork"),
      },
      64,
    ),
  },
};
export type DiagnosticKind =
  | "performance"
  | "room"
  | "companion-update"
  | "root-access"
  | "youtube-player"
  | "provider-quality";
function own(value: unknown, key: string): unknown {
  try {
    if (value === null || typeof value !== "object") return;
    const d = Object.getOwnPropertyDescriptor(value, key);
    return d && "value" in d ? d.value : undefined;
  } catch {
    return;
  }
}
function allowed(input: unknown, rule: Rule): unknown {
  if (rule === "number")
    return typeof input === "number" &&
      Number.isFinite(input) &&
      input >= 0 &&
      input <= Number.MAX_SAFE_INTEGER
      ? input
      : undefined;
  if (rule === "boolean") return typeof input === "boolean" ? input : undefined;
  if ("enum" in rule && Array.isArray(rule.enum))
    return typeof input === "string" && rule.enum.includes(input) ? input : undefined;
  if ("items" in rule && typeof rule.max === "number") {
    if (!Array.isArray(input)) return;
    const rows = [];
    for (let i = 0; i < Math.min(input.length, rule.max); i++) {
      const row = allowed(own(input, String(i)), rule.items as Rule);
      if (row !== undefined) rows.push(row);
    }
    return rows;
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) return;
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(rule)) {
    const value = allowed(own(input, key), child);
    if (value !== undefined) output[key] = value;
  }
  return output;
}
export function diagnosticExport(kind: DiagnosticKind, input: unknown): Record<string, any> {
  if (!Object.hasOwn(schemas, kind)) throw Error("Unsupported diagnostic type.");
  const data = allowed(input, schemas[kind]) as Record<string, unknown> | undefined;
  return {
    ...data,
    diagnostic: { schema: 1, kind, excluded: [...DIAGNOSTIC_EXCLUDED], unknownFields: "omitted" },
  };
}
export function diagnosticText(kind: DiagnosticKind, input: unknown) {
  const text = JSON.stringify(diagnosticExport(kind, input), null, 2);
  if (text.length > 65536) throw Error("Diagnostic exceeded the 64 KiB export budget.");
  return text;
}
export function downloadDiagnostic(kind: DiagnosticKind, input: unknown, filename: string) {
  const text = diagnosticText(kind, input),
    url = URL.createObjectURL(new Blob([text], { type: "application/json" })),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
