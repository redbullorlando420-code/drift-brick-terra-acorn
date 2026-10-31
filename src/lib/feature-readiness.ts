import { negotiateCompanion, type CompanionFeature } from "./companion-protocol.ts";
export type ReadinessProbe = { ok: true; value: Record<string, unknown> } | { ok: false };
export type ReadinessSnapshot = {
  health: unknown;
  probes: Partial<Record<"downloads" | "a1111" | "qwen" | "remote", ReadinessProbe>>;
  checkedAt: number;
};
export type FeatureReadiness = {
  id: string;
  title: string;
  configuration: string;
  state: "ready" | "unconfigured" | "unsupported" | "unchecked" | "unavailable";
  evidence: string;
  next: string;
  target: string;
};
/** Metadata/health observations never promote a native action to verified. */
export function featureReadiness(input: {
  hydrated: boolean;
  videos: number;
  snapshot: ReadinessSnapshot | null;
}): FeatureReadiness[] {
  const { snapshot } = input,
    negotiation = negotiateCompanion(snapshot?.health);
  const native = (
    id: "downloads" | "a1111" | "qwen" | "remote",
    title: string,
    cap: CompanionFeature,
    target: string,
  ): FeatureReadiness => {
    const base = {
      id,
      title,
      target,
      evidence: "Externally unverified",
      next: "Check capabilities, then use the feature’s own reviewed controls.",
    };
    if (!snapshot)
      return { ...base, state: "unchecked", configuration: "Not checked on this computer" };
    if (!negotiation.compatible)
      return {
        ...base,
        state: "unavailable",
        configuration: "Companion unavailable or incompatible",
        next: "Start Realhub and Companion from the desktop launcher, then check again.",
      };
    if (!negotiation.capabilities.includes(cap))
      return {
        ...base,
        state: "unsupported",
        configuration: "Required capability is unavailable",
        next: "Update Companion for this capability. Existing browser features remain usable.",
      };
    const probe = snapshot.probes[id];
    if (!probe?.ok)
      return {
        ...base,
        state: "unavailable",
        configuration: "Status check did not succeed",
        next: "Open this feature to review its connection, then retry the check.",
      };
    const value = probe.value;
    if (id === "downloads")
      return {
        ...base,
        state: value.configured === true ? "ready" : "unconfigured",
        configuration:
          value.configured === true
            ? "Downloader and approved output folder available"
            : "Downloader or approved output folder missing",
        evidence: "Authenticated download and playback unverified",
        next: "Review disk space and session access before starting a download.",
      };
    if (id === "remote")
      return {
        ...base,
        state: value.installed === true ? "ready" : "unconfigured",
        configuration:
          value.installed === true
            ? "RustDesk installed · launch controls available"
            : "RustDesk installation not detected",
        evidence: "Native authentication and session unverified",
        next: "Review the peer, approve one launch and authenticate in RustDesk. A launcher receipt does not prove connection.",
      };
    const ready = value.connected === true && value.ready === true;
    return {
      ...base,
      state: ready ? "ready" : "unconfigured",
      configuration: ready
        ? "Engine API and model metadata available"
        : value.connected === true
          ? "Engine responds · model setup incomplete"
          : "Engine API not connected",
      evidence: "Successful image generation unverified",
      next:
        id === "qwen"
          ? "Review the matching Qwen diffusion model, text encoder and VAE, then run model preflight."
          : "Review an AUTOMATIC1111-compatible checkpoint, then run model preflight.",
    };
  };
  return [
    {
      id: "library",
      title: "Local library",
      state: !input.hydrated ? "unchecked" : input.videos > 0 ? "ready" : "unconfigured",
      configuration: !input.hydrated
        ? "Saved catalog loading"
        : input.videos > 0
          ? "Saved catalog metadata available"
          : "No saved videos yet",
      evidence: "Individual file access and playback unverified",
      next: "Open a saved video or choose local files. A catalog entry alone cannot verify its file.",
      target: "landing",
    },
    native("downloads", "YouTube downloads", "youtube-downloads", "settings"),
    native("a1111", "Stable Diffusion", "studio-models", "stable-diffusion"),
    native("qwen", "Qwen image engine", "studio-models", "stable-diffusion"),
    native("remote", "Remote desktop", "remote-launch-safeguards", "remote-desktop"),
    {
      id: "signal",
      title: "Stream Signal",
      state: "ready",
      configuration: "Manual drafts, exports and sharing checklist available",
      evidence: "Social publishing and Twitch live detection unconnected",
      next: "Prepare a pack, review each draft and share it yourself. Copying or opening a composer is not publication.",
      target: "stream-signal",
    },
    {
      id: "chat",
      title: "Chat Plays Lab",
      state: "ready",
      configuration: "Local batching simulator available",
      evidence: "Live chat and installed game control unconnected",
      next: "Try simulated ballots. Real racing requires a separate local game adapter and authenticated connection.",
      target: "stream-signal",
    },
    {
      id: "watch",
      title: "Watch Together",
      state: "ready",
      configuration: "Room and queue controls available",
      evidence: "This room’s cross-device playback unverified",
      next: "Join the same room on another device and review its player status. Provider embedding restrictions still apply.",
      target: "watch-room",
    },
  ];
}
