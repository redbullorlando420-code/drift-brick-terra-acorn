export const SETUP_KEY = "reelcase.setup-checklist.v1";
export const SETUP_STEPS = ["library", "sources", "permissions", "companion"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];
export type SetupChoices = { version: 1; dismissed: boolean; reviewed: SetupStep[] };
export const emptySetup = (): SetupChoices => ({ version: 1, dismissed: false, reviewed: [] });
export function parseSetup(text: string | null): SetupChoices {
  if (!text || text.length > 4096) return emptySetup();
  try {
    const value = JSON.parse(text);
    if (
      value.version !== 1 ||
      typeof value.dismissed !== "boolean" ||
      !Array.isArray(value.reviewed)
    )
      return emptySetup();
    return {
      version: 1,
      dismissed: value.dismissed,
      reviewed: SETUP_STEPS.filter((id) => value.reviewed.includes(id)),
    };
  } catch {
    return emptySetup();
  }
}
export function setupReadiness(input: {
  hydrated: boolean;
  videos: number;
  sources: number;
  permissionReviewed: boolean;
  companion: null | { compatible: boolean; roots: number };
}) {
  return [
    {
      id: "library",
      ready: input.hydrated && input.videos > 0,
      status: !input.hydrated
        ? "Library loading"
        : input.videos > 0
          ? "Saved titles available"
          : "No saved titles yet",
      action: input.videos > 0 ? "Open library" : "Choose local files",
      target: "landing",
    },
    {
      id: "sources",
      ready: input.hydrated && input.sources > 0,
      status: !input.hydrated
        ? "Sources loading"
        : input.sources > 0
          ? "Saved sources available"
          : "No saved sources yet",
      action: "Review sources",
      target: "settings",
    },
    {
      id: "permissions",
      ready: input.permissionReviewed,
      status: input.permissionReviewed
        ? "Permission choices reviewed"
        : "Optional access not reviewed",
      action: "Review optional permissions",
      target: "settings",
    },
    {
      id: "companion",
      ready: !!input.companion?.compatible && input.companion.roots > 0,
      status: !input.companion
        ? "Not checked on this device"
        : !input.companion.compatible
          ? "Unavailable or incompatible"
          : input.companion.roots > 0
            ? "Compatible Companion · approved folders available"
            : "Compatible Companion · no approved folders",
      action: "Open connection guide",
      target: "connection",
    },
  ] as const;
}
