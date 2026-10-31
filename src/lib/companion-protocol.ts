import {supportedCapabilities} from '../../companion/platform-capabilities.mjs';
export const COMPANION_PROTOCOL = { major: 1, minor: 0 } as const;
export const COMPANION_FEATURES = {
  "model-transfer-recovery":{label:"Resumable model transfers",version:19},
  "remote-launch-safeguards":{label:"Scoped remote launch approvals",version:19},
  "capability-consent":{label:"Optional integration permissions",version:18},
  "print-save-transaction":{label:"Reviewed print saves",version:17},
  "platform-contract":{label:"Platform support contract",version:17},
  "tray-notifications":{label:"Windows tray notifications",version:17},
  "download-preflight": {label:"Download disk preflight",version:16},
  "launch-receipts": {label:"Game launch receipts",version:16},
  "root-access": {label:"Folder access control",version:15},
  "file-health": { label: "Approved file checks", version: 10 },
  launch: { label: "Desktop launches", version: 10 },
  "shortcut-catalog": { label: "Desktop shortcuts", version: 10 },
  "shortcut-icons": { label: "Shortcut icons", version: 10 },
  "batch-verify": { label: "Batch file verification", version: 10 },
  "watch-status": { label: "Folder watch status", version: 10 },
  "cache-status": { label: "Local cache status", version: 10 },
  "cache-warmup": { label: "Local cache scan", version: 10 },
  "media-inspection": { label: "Media metadata inspection", version: 10 },
  "roku-ssdp-discovery": { label: "Roku discovery", version: 10 },
  "offline-save": { label: "Offline saves", version: 10 },
  "youtube-downloads": { label: "YouTube downloads", version: 11 },
  "steam-epic-catalog": { label: "Steam/Epic catalog", version: 10 },
  "library-pack-disk": { label: "Library pack folder", version: 10 },
  "thumb-disk-cache": { label: "Artwork disk cache", version: 10 },
  "thumb-cache-url": { label: "Artwork URL caching", version: 10 },
  "artwork-audit": { label: "Artwork cache audit", version: 13 },
  "prints-bridge": { label: "Print model files", version: 10 },
  "tray-autostart": { label: "Companion startup preference", version: 10 },
  "job-badge": { label: "Job notifications", version: 10 },
  "studio-models": { label: "Local creative tools", version: 12 },
  "task-receipts": { label: "Persistent job recovery", version: 13 },
} as const;
export type CompanionFeature = keyof typeof COMPANION_FEATURES;
export type CompanionNegotiation = {
  compatible: boolean;
  legacy: boolean;
  version: number;
  capabilities: CompanionFeature[];
  reason?: string;
};
/** Explicit capability lists are authoritative. Legacy fallback is limited to documented v10+ operations. */
export function negotiateCompanion(value: unknown): CompanionNegotiation {
  const fail = (reason: string): CompanionNegotiation => ({
    compatible: false,
    legacy: false,
    version: 0,
    capabilities: [],
    reason,
  });
  if (!value || typeof value !== "object")
    return fail("Companion is unavailable on this computer.");
  const row = value as Record<string, unknown>;
  if (row.ok !== true || row.service !== "reelcase-companion")
    return fail("This service is not a compatible Realhub Companion.");
  const version =
    Number.isSafeInteger(row.version) && Number(row.version) > 0 ? Number(row.version) : 0;
  if (row.protocol !== undefined) {
    const protocol = row.protocol as { major?: unknown; minor?: unknown } | null;
    if (
      !protocol ||
      protocol.major !== COMPANION_PROTOCOL.major ||
      !Number.isSafeInteger(protocol.minor) ||
      Number(protocol.minor) < 0
    )
      return fail(
        "Companion protocol is incompatible. Use a Companion release with protocol 1; existing library data is unchanged.",
      );
  } else if (version < 10 || version > 12)
    return fail(
      "This Companion has no supported protocol declaration. Update Companion; your browser library remains available.",
    );
  const capabilities = Array.isArray(row.capabilities)
    ? [
        ...new Set(
          row.capabilities
            .slice(0, 128)
            .filter(
              (entry): entry is CompanionFeature =>
                typeof entry === "string" && Object.hasOwn(COMPANION_FEATURES, entry),
            ),
        ),
      ]
    : Object.entries(COMPANION_FEATURES)
        .filter(([, feature]) => feature.version <= version && feature.version <= 12)
        .map(([name]) => name as CompanionFeature);
  const platform=row.platform as {schema?:unknown;os?:unknown}|undefined;
  const filtered=platform?.schema===1&&['win32','linux','darwin','other'].includes(String(platform.os))?supportedCapabilities(capabilities,String(platform.os)):capabilities;
  return { compatible: true, legacy: row.protocol === undefined, version, capabilities:filtered };
}
export function companionFeatureIssue(
  negotiation: CompanionNegotiation,
  feature: CompanionFeature,
): string | undefined {
  if (!negotiation.compatible) return negotiation.reason;
  if (!negotiation.capabilities.includes(feature))
    return `${COMPANION_FEATURES[feature].label} is unavailable. Use Companion v${COMPANION_FEATURES[feature].version}+ with this capability enabled. Other supported features remain available.`;
}
export function companionPathFeature(path: string): CompanionFeature | undefined {
  const name = path.split("?")[0];
  if(name.startsWith("/permissions"))return "capability-consent";
  if(name.startsWith("/roots/"))return "root-access";
  if (name==="/launch-receipts")return "launch-receipts";
  if (name.startsWith("/youtube/downloads")) return "youtube-downloads";
  if (name.startsWith("/tasks")) return "task-receipts";
  if(name.startsWith("/studio/models/transfers/")||name==="/studio/models/pause")return "model-transfer-recovery";
  if (name.startsWith("/studio/") || name.startsWith("/remote/")) return "studio-models";
  if(name.startsWith("/prints/transactions")||name==="/prints/save-folders")return "print-save-transaction";
  if(name==="/tray/notify")return "tray-notifications";
  if (name.startsWith("/prints/")) return "prints-bridge";
  if (name.startsWith("/library-pack/")) return "library-pack-disk";
  if (name === "/thumbs/audit") return "artwork-audit";
  if (name === "/thumbs/cache-url") return "thumb-cache-url";
  if (name.startsWith("/thumbs/")) return "thumb-disk-cache";
  if (name.startsWith("/games/")) return "steam-epic-catalog";
  if (name === "/shortcut-icons" || name === "/shortcut-icon") return "shortcut-icons";
  if (name === "/shortcuts" || name === "/validate-shortcuts") return "shortcut-catalog";
  if (name === "/launch" || name === "/launch-history") return "launch";
  if (name === "/source-health") return "file-health";
  if (name === "/verify") return "batch-verify";
  if (name === "/inspect-media") return "media-inspection";
  if (name === "/watch-status") return "watch-status";
  if (name === "/cache-status") return "cache-status";
  if (name === "/cache-warmup") return "cache-warmup";
  if (name === "/roku/discover") return "roku-ssdp-discovery";
  if (name === "/offline/save") return "offline-save";
  if (name === "/tray/autostart") return "tray-autostart";
  if (name === "/jobs" || name === "/jobs/ack" || name === "/tray/notify") return "job-badge";
}
