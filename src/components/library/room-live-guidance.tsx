import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { roomLiveMode } from "@/lib/multiplayer/room-provider-clock";
import type { PlayerReadinessStatus } from "@/lib/multiplayer/room-player-readiness";
export const RoomLiveGuidance = memo(function RoomLiveGuidance({
  live,
  playing,
  hostRunning,
  status,
  onReload,
}: {
  live: boolean;
  playing: boolean;
  hostRunning: boolean;
  status: PlayerReadinessStatus;
  onReload: () => void;
}) {
  const [reloaded, setReloaded] = useState(false);
  if (roomLiveMode(live) !== "independent-live") return null;
  const localWait = ["buffering", "loading", "blocked", "error", "paused"].includes(status);
  return (
    <section
      aria-label="Live playback on this device"
      data-room-live-mode="independent-live"
      className="mt-3 space-y-2 rounded-md border border-border bg-bg/45 p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-fg">Live playback</h3>
        <span className="text-xs text-accent">Independent live clock</span>
      </div>
      <p className="text-xs leading-5 text-fg">
        {!playing
          ? "The room is paused. Reloading this player will not resume everyone."
          : localWait
            ? "The room is playing. This device is starting, buffering or waiting for a tap; an ad may also delay playback. This does not pause the room."
            : !hostRunning
              ? "The room is playing while the host’s player is waiting. Each live player keeps running independently; buffering does not mean the room was paused."
              : "The room is playing. Provider buffering and ads can give viewers different live delays. Use room controls to pause everyone."}
      </p>
      <p className="text-xs leading-5 text-muted">
        Live delay and a verified DVR range are unavailable to Realhub. Elapsed stream time cannot
        measure your delay. Room seeks and automatic catch-up seeks are disabled for live streams.
      </p>
      <p className="text-xs leading-5 text-muted">
        To catch up, use Live in the video player if offered. If the provider offers DVR, its
        timeline controls affect this device only. Otherwise reload this player to request a fresh
        live feed; the provider decides the starting point.
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="min-h-11"
        onClick={() => {
          setReloaded(true);
          onReload();
        }}
      >
        Reload live player on this device
      </Button>
      {reloaded && (
        <p role="status" className="text-xs leading-5 text-accent">
          Requested a fresh player on this device. No live seek or shared pause was sent. A Play tap
          may be needed after loading.
        </p>
      )}
    </section>
  );
});
