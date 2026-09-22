import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roomRelayConfig, type RoomRelayConfig } from "@/lib/multiplayer/relay-config";

export function RoomRelaySettings({ config, onChange }: { config?: RoomRelayConfig; onChange: (config: RoomRelayConfig | undefined) => void }) {
  const [urls, setUrls] = useState("");
  const [username, setUsername] = useState("");
  const [credential, setCredential] = useState("");
  const [relayOnly, setRelayOnly] = useState(false);
  const [notice, setNotice] = useState("");
  return <details className="mt-3 rounded-sm border border-border p-3 text-sm">
    <summary className="cursor-pointer text-fg">Connection recovery · {config ? config.iceTransportPolicy === "relay" ? "relay test mode" : "relay available" : "direct connections"}</summary>
    <p className="my-3 text-xs text-muted">For networks that block direct connections, enter temporary credentials from your TURN service on each device. They stay in memory for this visit and are excluded from diagnostics. Applying reconnects the room.</p>
    <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); try { onChange(roomRelayConfig(urls, username, credential, relayOnly)); setCredential(""); setNotice("Configuration applied. A connected peer showing a relay path confirms the service works."); } catch (error) { setNotice(error instanceof Error ? error.message : "Invalid relay settings."); } }}>
      <Input aria-label="TURN server URLs" placeholder="turns:relay.example.com:5349?transport=tcp" value={urls} onChange={(event) => setUrls(event.target.value)} />
      <Input aria-label="TURN username" placeholder="Temporary username" autoComplete="off" value={username} onChange={(event) => setUsername(event.target.value)} />
      <Input aria-label="TURN credential" placeholder="Temporary credential" type="password" autoComplete="off" value={credential} onChange={(event) => setCredential(event.target.value)} />
      <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" checked={relayOnly} onChange={(event) => setRelayOnly(event.target.checked)} />Test relay only (disables same-browser fallback)</label>
      <div className="flex flex-wrap gap-2"><Button size="sm" type="submit">Apply relay</Button><Button size="sm" variant="ghost" type="button" onClick={() => { onChange(undefined); setCredential(""); setNotice("Relay credentials removed. Direct connections restored."); }}>Clear relay</Button></div>
      {notice && <p role="status" className="text-xs text-muted">{notice}</p>}
    </form>
  </details>;
}
