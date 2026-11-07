import { Button } from "@/components/ui/button";
import { guestArrival, type GuestArrivalInput } from "@/lib/multiplayer/guest-arrival";
export function RoomGuestArrival({
  input,
  onStart,
  onReload,
  watchUrl,
}: {
  input: GuestArrivalInput;
  onStart: () => void;
  onReload: () => void;
  watchUrl?: string;
}) {
  const next = guestArrival(input);
  return (
    <section
      data-guest-arrival={next.stage}
      aria-label="Guest arrival readiness"
      className="my-4 scroll-mt-36 rounded-lg border border-border bg-surface p-4"
    >
      <h3 className="font-medium text-fg">{next.title}</h3>
      <ol className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-3">
        <li>1. Host transport: {input.connected ? "connected" : "waiting"}</li>
        <li>2. Current host state: {input.handshake ? "received" : "waiting"}</li>
        <li>3. Player observation: {input.player.status}</li>
      </ol>
      <p role="status" className="mt-3 text-sm leading-6 text-muted">
        {next.detail}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {next.action === "start" && (
          <Button className="min-h-11" onClick={onStart}>
            Start on this device
          </Button>
        )}
        {next.action === "reload" && (
          <Button variant="secondary" className="min-h-11" onClick={onReload}>
            Reload this device player
          </Button>
        )}
        {(next.action === "external" || next.action === "reload") &&
          watchUrl &&
          /^https:\/\//.test(watchUrl) && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm"
            >
              Open provider fallback
            </a>
          )}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        Observed player state is independent of the manual Ready checklist. No simulated clock
        establishes real device synchronization.
      </p>
    </section>
  );
}
