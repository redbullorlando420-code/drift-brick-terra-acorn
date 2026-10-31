import { negotiateCompanion, type CompanionFeature } from "./companion-protocol.ts";

export type UpdateSnapshot = {
  schema: 1;
  checkedAt: number;
  compatible: boolean;
  version: number;
  capabilities: CompanionFeature[];
  roots: number | null;
  configurationRef: string | null;
  tools: { ytDlp: string | null; youtubeDl: string | null };
  destinations: {
    downloads: boolean | null;
    artwork: boolean | null;
    prints: boolean | null;
    libraryPack: boolean | null;
  };
  jobs: {
    queued: number;
    running: number;
    interrupted: number;
    paused?:number;
    done: number;
    cancelled: number;
    error: number;
  } | null;
};
const record = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const count = (v: unknown, max = 10000) =>
  Number.isSafeInteger(v) && Number(v) >= 0 && Number(v) <= max ? Number(v) : null;
const toolVersion = (v: unknown) =>
  typeof v === "string" &&
  /^(?:\d{4}\.\d{2}\.\d{2}(?:\.[\w.-]{1,20})?|v?\d{1,3}\.\d{1,3}(?:\.\d{1,4})?(?:-[a-z0-9.-]{1,20})?)$/.test(
    v,
  )
    ? v
    : null;
/** Export only enumerated summaries. No paths, job titles/IDs, URLs, account details or arbitrary tool output. */
export function companionSnapshot(
  health: unknown,
  receiptData: unknown,
  checkedAt = Date.now(),
): UpdateSnapshot {
  const h = record(health),
    n = negotiateCompanion(health),
    inspection = record(h.inspection),
    details = inspection.schema === 1 ? inspection : {},
    versions = record(details.tools),
    folders = record(details.destinations),
    receipts = record(receiptData);
  let jobs: UpdateSnapshot["jobs"] = null;
  if (
    receipts.ok === true &&
    Array.isArray(receipts.jobs) &&
    receipts.jobs.length <= 40 &&
    receipts.jobs.every((j) =>
      Object.hasOwn(
        { queued: 1, running: 1, interrupted: 1, paused:1, done: 1, cancelled: 1, error: 1 },
        String(record(j).status),
      ),
    )
  ) {
    jobs = { queued: 0, running: 0, interrupted: 0, done: 0, cancelled: 0, error: 0 };
    for (const j of receipts.jobs){const status=record(j).status as keyof typeof jobs;jobs[status]=(jobs[status]??0)+1;}
  }
  const flag = (key: string) =>
    typeof folders[key] === "boolean" ? (folders[key] as boolean) : null;
  return {
    schema: 1,
    checkedAt,
    compatible: n.compatible,
    version: n.version,
    capabilities: n.capabilities,
    roots: count(h.roots),
    configurationRef:
      typeof details.configurationRef === "string" &&
      /^[a-f0-9]{64}$/.test(details.configurationRef)
        ? details.configurationRef
        : null,
    tools: { ytDlp: toolVersion(versions.ytDlp), youtubeDl: toolVersion(versions.youtubeDl) },
    destinations: {
      downloads: flag("downloads"),
      artwork: flag("artwork"),
      prints: flag("prints"),
      libraryPack: flag("libraryPack"),
    },
    jobs,
  };
}
/** Read saved summaries with the same allowlist; unknown/future data never becomes a rollback baseline. */
export function readUpdateSnapshot(value: unknown): UpdateSnapshot {
  const r = record(value);
  if (
    r.schema !== 1 ||
    count(r.checkedAt, Number.MAX_SAFE_INTEGER) === null ||
    typeof r.compatible !== "boolean" ||
    count(r.version) === null ||
    !Array.isArray(r.capabilities) ||
    r.capabilities.length > 128 ||
    (r.roots !== null && count(r.roots) === null)
  )
    throw Error(
      "Saved update baseline is unreadable or from another version. Export a current report before replacing it.",
    );
  const snapshot = companionSnapshot(
    {
      ok: true,
      service: "reelcase-companion",
      version: r.version,
      protocol: { major: 1, minor: 0 },
      capabilities: r.capabilities,
      roots: r.roots,
      inspection: {
        schema: 1,
        configurationRef: r.configurationRef,
        tools: r.tools,
        destinations: r.destinations,
      },
    },
    r.jobs === null
      ? null
      : {
          ok: true,
          jobs: Object.entries(record(r.jobs)).flatMap(([status, total]) => {
            const num = count(total, 40);
            if (num === null) throw Error("Invalid job counts in saved baseline.");
            return Array.from({ length: num }, () => ({ status }));
          }),
        },
    Number(r.checkedAt),
  );
  if (
    r.jobs !== null &&
    (!snapshot.jobs ||
      !["cancelled,done,error,interrupted,queued,running","cancelled,done,error,interrupted,paused,queued,running"].includes(Object.keys(record(r.jobs)).sort().join(",")))
  )
    throw Error("Invalid job counts in saved baseline.");
  return { ...snapshot, compatible: r.compatible };
}
export function compareCompanionUpdate(before: UpdateSnapshot, after: UpdateSnapshot) {
  const notes: string[] = [];
  if (!after.compatible)
    notes.push(
      "The updated service is unavailable or incompatible. Keep your previous service/configuration backup; browser library data is unchanged.",
    );
  const missing = before.capabilities.filter((cap) => !after.capabilities.includes(cap));
  if (missing.length) notes.push("Missing capabilities: " + missing.join(", ") + ".");
  if (before.roots !== null && after.roots !== null && before.roots !== after.roots)
    notes.push(
      `Approved-root count changed: ${before.roots} → ${after.roots}. Review approval in the local configuration.`,
    );
  if (
    before.configurationRef &&
    after.configurationRef &&
    before.configurationRef !== after.configurationRef
  )
    notes.push(
      "The local configuration reference changed. Review your saved private configuration backup before using native tools.",
    );
  for (const key of ["downloads", "artwork", "prints", "libraryPack"] as const)
    if (before.destinations[key] === true && after.destinations[key] !== true)
      notes.push(`${key} destination is no longer confirmed approved.`);
  for (const key of ["ytDlp", "youtubeDl"] as const)
    if (before.tools[key] && !after.tools[key])
      notes.push(`${key} version is no longer confirmed.`);
  if (after.jobs && (after.jobs.queued || after.jobs.running))
    notes.push(
      "Downloads are still active or queued. Finish or cancel them before manually updating Companion.",
    );
  if (after.jobs?.interrupted)
    notes.push(
      `${after.jobs.interrupted} interrupted download receipt(s) need deliberate review; no resume was requested.`,
    );
  if(after.jobs?.paused)notes.push(after.jobs.paused+" download receipt(s) are paused. Review disk space and partial files before resuming.");
  if (!after.jobs) notes.push("Download receipts were not verified by this check.");
  if (after.roots === null || !after.configurationRef)
    notes.push(
      "This service does not provide the full configuration summary. Update manually for a complete comparison.",
    );
  return notes.length
    ? notes
    : [
        "No capability, approval or tool regression detected in this summary. Native execution still requires its own verification.",
      ];
}
export function updateSnapshotKey(owner: string) {
  return "reelcase.companion-update.v1:" + encodeURIComponent(owner);
}
