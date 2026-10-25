import { memo, useCallback, useEffect, useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import { Copy, QrCode } from "lucide-react";
import { shareableRoomInvite } from "@/lib/multiplayer/room-invite";
import { Button } from "@/components/ui/button";
import { RoomHttpsInvitation } from './room-https-invitation';
import { Input } from "@/components/ui/input";
export function useRoomInvitation(room: string) {
  const current = window.location.origin;
  const reachable = Boolean(shareableRoomInvite(current, window.location.pathname, room));
  const [origin, setOrigin] = useState(() =>
    reachable ? current : (localStorage.getItem("reelcase.watch-room.invite-origin.v1") ?? ""),
  );
  const [origins, setOrigins] = useState<string[]>([]);
  const [checking, setChecking] = useState(!reachable);
  useEffect(() => {
    if (reachable) return;
    const controller = new AbortController();
    void fetch("/api/lan-origin", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { origins: [] }))
      .then((data) => {
        if (controller.signal.aborted) return;
        const rows = (Array.isArray(data.origins) ? data.origins : [])
          .filter(
            (value: unknown): value is string =>
              typeof value === "string" && Boolean(shareableRoomInvite(value, "/", room)),
          )
          .slice(0, 4);
        setOrigins(rows);
        setOrigin((previous) => previous || rows[0] || "");
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, [reachable]);
  const url = shareableRoomInvite(origin.trim(), window.location.pathname, room);
  const chooseOrigin = useCallback((value: string) => {
    setOrigin(value);
    try {
      localStorage.setItem("reelcase.watch-room.invite-origin.v1", value);
    } catch {
      /* Session-only on full storage. */
    }
  }, []);
  return useMemo(() => ({ url, origin, origins, checking, chooseOrigin }), [url, origin, origins, checking, chooseOrigin]);
}
export const RoomInvitation = memo(function RoomInvitation({
  invitation,
  started,
  onNotice,
}: {
  invitation: ReturnType<typeof useRoomInvitation>;
  started: boolean;
  onNotice: (message: string) => void;
}) {
  const { url, origin, origins, checking, chooseOrigin } = invitation;
  const image = useMemo(() => {
    if (!url || url.length > 2000) return "";
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr.createSvgTag({ cellSize: 5, margin: 20, scalable: true }))}`;
  }, [url]);
  return (
    <section
      aria-label="Join room by QR"
      className="mt-4 rounded-lg border border-border bg-surface p-4"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-fg">
        <QrCode className="size-4 text-accent" />
        Join on your phone
      </p>
      {started && image && (
        <a
          href={url!}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block w-56 max-w-full"
          aria-label="Open guest invitation"
        >
          <img
            src={image}
            alt="Scan to join this Watch Room"
            className="aspect-square w-full rounded-sm"
          />
        </a>
      )}
      <p className="mt-3 text-xs leading-5 text-muted">
        {started
          ? "Scan with your camera to open this room’s guest view. Keep the host player open."
          : "Start the room to show its QR code."}{" "}
        Guests receive the current video and queue without importing your library.
      </p>
      {origins.length > 1 && (
        <select
          aria-label="Phone invitation address"
          value={origins.includes(origin) ? origin : ""}
          onChange={(event) => chooseOrigin(event.target.value)}
          className="mt-3 min-h-11 w-full rounded-sm bg-elevated px-3 text-xs text-fg"
        >
          <option value="" disabled>
            Choose a network address
          </option>
          {origins.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      )}
      {url?.startsWith('http:') && <p className="mt-3 text-xs leading-5 text-muted">This phone link uses HTTP. Twitch requires an HTTPS app address for embedded viewing; the room’s chat and queue can still work over this link.</p>}
      {window.location.protocol !== 'https:' && /^(?:localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) && window.location.port === '8080' && <RoomHttpsInvitation onOrigin={chooseOrigin}/>}
      <details className="mt-3 text-xs text-muted">
        <summary className="cursor-pointer">
          Phone address{checking ? " · checking home network…" : ""}
        </summary>
        <Input
          className="mt-2"
          aria-label="Room invitation base URL"
          value={origin}
          onChange={(event) => chooseOrigin(event.target.value)}
          placeholder="https://your-shared-app-address"
        />
        <p className="mt-2 leading-5">
          Use the app’s home-network or public address. On home Wi‑Fi, join the same household
          network.
        </p>
      </details>
      {url ? (
        <>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block break-all text-xs text-accent"
            data-room-invite-url
          >
            {url}
          </a>
          <Button
            variant="secondary"
            className="mt-3 min-h-11"
            onClick={() => {
              if (!navigator.clipboard) {
                onNotice("Copy the invitation address shown above.");
                return;
              }
              void navigator.clipboard.writeText(url).then(
                () => onNotice("Theater invitation link copied."),
                () => onNotice("Copy the invitation address shown above."),
              );
            }}
          >
            <Copy className="size-4" />
            Copy theater invitation link
          </Button>
        </>
      ) : (
        <p role="status" className="mt-3 text-xs text-muted">
          {checking
            ? "Finding a phone-reachable address…"
            : "Enter the app’s network address above to create a scannable invitation."}
        </p>
      )}
    </section>
  );
});
