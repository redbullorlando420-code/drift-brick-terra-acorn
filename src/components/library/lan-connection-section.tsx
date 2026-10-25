import { useEffect, useMemo, useState } from "react";
import { Copy, RefreshCw, Smartphone, Laptop, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import { companionHealth } from "@/lib/companion";
import { registerPeriodicTask } from '@/lib/periodic-work';
import { getNetworkDeviceId, listNetworkDevices, type NetworkDevice } from "@/lib/network-presence";
import { HubShell } from './hub-shared';

export function LanConnectionSection() {
  const [origin, setOrigin] = useState("");
  const [localHost, setLocalHost] = useState(false);
  const [quickTunnel, setQuickTunnel] = useState<{ running?: boolean; starting?: boolean; url?: string | null; error?: string | null }>({});
  const [tunnelBusy, setTunnelBusy] = useState(false);
  const [lanOrigins, setLanOrigins] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [companion, setCompanion] = useState<"checking" | "ready" | "offline">("checking");
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [mapStatus, setMapStatus] = useState("Checking devices…");
  const ownDeviceId = useMemo(() => getNetworkDeviceId(), []);
  const refreshDeviceMap = async (signal?: AbortSignal) => {
    try {
      const result = await listNetworkDevices();
      if (signal?.aborted) return;
      setDevices(result.devices);
      setMapStatus(result.devices.length ? `${result.devices.length} active device${result.devices.length === 1 ? "" : "s"}` : "Waiting for another device to open Realhub");
    } catch { if (!signal?.aborted) setMapStatus("Device map is temporarily unavailable"); }
  };
  useEffect(() => {
    const current = window.location;
    const loopback = current.hostname === "localhost" || current.hostname === "127.0.0.1" || current.hostname === "::1";
    setLocalHost(loopback && current.port === "8080");
    let stopTunnel: (() => void) | undefined;
    if (loopback && current.port === "8080") {
      stopTunnel = registerPeriodicTask({ name: 'Tunnel status', everyMs: 2_500, firstMs: 0,
        work: async signal => {
          try { const response = await fetch('/api/quick-tunnel', { signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]) }); const data = await response.json(); if (!signal.aborted) setQuickTunnel(data); }
          catch { if (!signal.aborted) setQuickTunnel({ error: 'Tunnel status unavailable.' }); }
        } }).cancel;
    }
    setOrigin(loopback ? "" : current.origin);
    if (loopback) void fetch("/api/lan-origin").then((response) => response.ok ? response.json() : { origins: [] }).then((data: { origins?: string[] }) => setLanOrigins(Array.isArray(data.origins) ? data.origins : [])).catch(() => setLanOrigins([]));
    if (current.port === "8080" && loopback)
      void companionHealth().then((health) => setCompanion(health?.ok ? "ready" : "offline")).catch(() => setCompanion("offline"));
    else setCompanion("offline");
    const task = registerPeriodicTask({ name: 'Device map', everyMs: 10_000, firstMs: 0, work: refreshDeviceMap });
    return () => { task.cancel(); stopTunnel?.(); };
  }, []);
  const changeTunnel = async (action: "start" | "stop") => {
    setTunnelBusy(true);
    try {
      const response = await fetch("/api/quick-tunnel", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      setQuickTunnel(await response.json());
    } catch { setQuickTunnel({ error: "Could not reach the local tunnel controller." }); }
    finally { setTunnelBusy(false); }
  };
  const copyAddress = async () => {
    if (!origin) return;
    try { await navigator.clipboard.writeText(origin); setCopied(true); } catch { setCopied(false); }
  };
  const visibleDevices = devices.slice(0, 12);
  return <HubShell eyebrow="Home network" icon={<Wifi className="size-4"/>} title="Bring another screen into Realhub." copy="Share one address, watch the device map appear, then start a room when everyone is connected.">
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Share this address</p>
        {origin ? <><p className="mt-2 break-all font-mono text-sm text-fg">{origin}</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => void copyAddress()}><Copy className="size-4"/>{copied ? "Address copied" : "Copy address"}</Button><Button variant="secondary" onClick={() => useLibrary.getState().setSource("watch-room")}>Open Watch Room</Button></div><p className="mt-4 text-xs leading-5 text-muted">On another computer, phone, or TV browser: join the same normal home Wi‑Fi, open this exact address, and leave Realhub open. It will appear in the map below within about 25 seconds.</p></> : <><p className="mt-2 text-sm text-fg">This localhost address works only on this computer.</p>{lanOrigins.length > 0 ? <><p className="mt-2 text-sm leading-6 text-muted">Open Realhub through your home-network address, start a room there, then copy its invitation:</p><div className="mt-3 flex flex-wrap gap-2">{lanOrigins.map((candidate) => <a key={candidate} className="rounded-sm bg-elevated px-3 py-2 font-mono text-xs text-accent shadow-border" href={candidate}>{candidate}</a>)}</div></> : <p className="mt-2 text-sm leading-6 text-muted">No home-network address was found. Connect this computer to your normal home network, then reopen this guide.</p>}</>}
      </div>
      <div className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local companion</p><p className="mt-2 font-display text-2xl text-fg">{companion === "ready" ? "Ready on this computer" : companion === "checking" ? "Checking…" : "Not detected"}</p><p className="mt-2 text-sm text-muted">The companion speeds up local folders on this computer. Other devices can join the Realhub page and Watch Rooms, but do not receive its local files.</p></div>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border">
      <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Across networks · Cloudflare trial</p>
      <h2 className="mt-2 font-display text-2xl text-fg">Temporary public address</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Start a Quick Tunnel on the host computer to give guests a temporary address for Realhub and Watch Room signaling. Share it only with people you invite. The address disappears when you stop the tunnel or close the host server.</p>
      {localHost ? <>
        <div className="mt-4 flex flex-wrap items-center gap-2"><Button disabled={tunnelBusy || Boolean(quickTunnel.starting)} onClick={() => void changeTunnel(quickTunnel.running ? "stop" : "start")}>{quickTunnel.running ? "Stop trial tunnel" : quickTunnel.starting ? "Starting…" : "Start trial tunnel"}</Button>{quickTunnel.url && <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(quickTunnel.url!)}><Copy className="size-4"/>Copy public address</Button>}</div>
        {quickTunnel.url && <p className="mt-3 break-all font-mono text-sm text-accent">{quickTunnel.url}</p>}
        {quickTunnel.error && <p className="mt-3 text-sm text-muted">{quickTunnel.error} <a className="text-accent underline" href="https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/" target="_blank" rel="noopener noreferrer">Cloudflare install instructions</a></p>}
      </> : <p className="mt-3 text-sm text-muted">Open this tab on the host computer to control its trial tunnel.</p>}
      <p className="mt-3 text-xs leading-5 text-subtle">Quick Tunnels are for testing. A tunnel carries the page and room signaling; peer media may still require a TURN relay when direct connectivity fails.</p>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Available device map</p><h2 className="mt-2 font-display text-2xl text-fg">{mapStatus}</h2><p className="mt-1 text-sm text-muted">Devices appear only after they open Realhub. The map stores a short-lived browser label, never network addresses or files.</p></div><Button size="sm" variant="secondary" onClick={() => void refreshDeviceMap()}><RefreshCw className="size-4"/>Refresh map</Button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]"><div className="rounded-md border border-border bg-bg/45 p-4"><div className="flex items-center gap-3"><Wifi className="size-5 text-accent"/><div><p className="text-sm font-medium text-fg">Realhub host</p><p className="text-xs text-muted">{origin || "Local preview"}</p></div></div><p className="mt-4 text-xs leading-5 text-muted">This computer shares the app address and coordinates the active-device map.</p></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{visibleDevices.map((device) => <div key={device.id} className="rounded-md bg-bg/45 p-3"><div className="flex items-center gap-2">{device.kind === "mobile" ? <Smartphone className="size-4 text-accent"/> : <Laptop className="size-4 text-accent"/>}<p className="min-w-0 truncate text-sm font-medium text-fg">{device.id === ownDeviceId ? "This device" : device.label}</p></div><p className="mt-2 text-xs text-muted">{device.id === ownDeviceId ? device.label : "Connected to Realhub"}</p><p className="mt-1 text-[11px] text-accent">Active now</p></div>)}{!visibleDevices.length && <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted sm:col-span-2 xl:col-span-3">Waiting for a device to open the shared address.</div>}</div></div>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Four steps to connect</p><ol className="mt-4 grid gap-4 md:grid-cols-2"><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">1. Use the Ethernet address.</span><br/>Use the address shown above for normal home Wi‑Fi and Ethernet. The NordLynx address is for VPN peers.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">2. Keep guests off isolated Wi‑Fi.</span><br/>Guest Wi‑Fi often blocks device-to-device traffic. Join the normal household network instead.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">3. Look for the device map.</span><br/>A guest that opens Realhub shows up here automatically. Refresh the map if it has just joined.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">4. Start or join a Watch Room.</span><br/>After the guest is visible, open Watch Room and use the same invitation or room code.</li></ol><p className="mt-4 text-xs leading-5 text-subtle">If the shared page does not open, allow Realhub through the host computer’s private-network firewall and confirm the guest is on the same normal home network.</p></section>
  </HubShell>;
}
