import type { GuideReason } from "./guide-evidence.ts";
import type { VideoMetadataProvenance } from "./types";
export type ReasonProvenance = {
  subject: "Matched field" | "Preference origin";
  kind: "owner" | "provider" | "imported" | "derived" | "unknown" | "conflict";
  label: string;
  detail: string;
};
/** Read only the exact matched tag, never enumerate notes, reviews or descriptions. */
export function matchedTagProvenance(
  metadata: VideoMetadataProvenance | undefined,
  tag: string,
  subject: ReasonProvenance["subject"] = "Matched field",
): ReasonProvenance {
  const raw = metadata?.tags?.[tag] ?? metadata?.tags?.[tag.trim().toLowerCase()],
    source = typeof raw === "string" ? raw : undefined;
  if (
    Array.isArray(metadata?.lockedFields) &&
    metadata.lockedFields.includes("tags") &&
    source?.startsWith("provider:")
  )
    return {
      subject,
      kind: "conflict",
      label: "Attribution conflict",
      detail:
        "The tag is locked but its saved attribution names a provider. Authorship is uncertain; locking alone does not prove an owner edit.",
    };
  if (source === "manual" || source === "youtube-review")
    return {
      subject,
      kind: "owner",
      label: source === "manual" ? "Your edit" : "Your tag review",
      detail: "The matched tag carries explicit owner attribution in saved metadata.",
    };
  const provider = source?.startsWith("provider:") ? source.slice(9) : undefined;
  if (
    provider &&
    [
      "youtube",
      "twitch",
      "eporner",
      "redtube",
      "chaturbate",
      "myfreecams",
      "reddit",
      "booru",
      "redgifs",
    ].includes(provider)
  )
    return {
      subject,
      kind: "provider",
      label: "Provider tag",
      detail: "Saved tag attribution: " + provider + ". This is not a fresh provider check.",
    };
  if (source === "legacy")
    return {
      subject,
      kind: "imported",
      label: "Saved / imported",
      detail: "Legacy saved-library attribution does not identify the original author or provider.",
    };
  if (source === "local-name" || source === "companion-inspection" || source === "local-vision")
    return {
      subject,
      kind: "derived",
      label: "Locally derived",
      detail:
        source === "local-name"
          ? "Derived from a local filename."
          : source === "local-vision"
            ? "Derived by local vision."
            : "Recorded by Companion inspection.",
    };
  return {
    subject,
    kind: "unknown",
    label: "Attribution unavailable",
    detail:
      "No supported attribution is saved for this exact matched tag. Its presence does not prove provider or owner authorship.",
  };
}
export function reasonProvenance(
  reason: GuideReason,
  videoId: string,
  metadata?: Record<string, VideoMetadataProvenance>,
): ReasonProvenance[] {
  if (reason.kind === "favorite" || reason.kind === "like")
    return [
      {
        subject: "Matched field",
        kind: "owner",
        label: "Your saved choice",
        detail:
          "This reason comes from your explicit favorite or like, not a provider description.",
      },
    ];
  if (reason.kind === "shared-tag")
    return [
      matchedTagProvenance(metadata?.[videoId], reason.quote ?? ""),
      matchedTagProvenance(
        metadata?.[reason.origin?.id ?? ""],
        reason.origin?.tag ?? "",
        "Preference origin",
      ),
    ];
  if (reason.kind === "saved-tag" || (reason.kind === "topic" && reason.field === "saved tag"))
    return [matchedTagProvenance(metadata?.[videoId], reason.quote ?? "")];
  if (reason.kind === "live")
    return [
      {
        subject: "Matched field",
        kind: "provider",
        label: "Provider observation",
        detail:
          "The saved live observation used by this snapshot; opening this explanation does not refresh it.",
      },
    ];
  return [
    {
      subject: "Matched field",
      kind: "unknown",
      label: "Attribution unavailable",
      detail:
        "This saved field has no field-level authorship record. A remote video or adjacent tag cannot establish its source.",
    },
  ];
}
