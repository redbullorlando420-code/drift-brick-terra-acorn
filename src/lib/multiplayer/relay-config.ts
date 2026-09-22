export type RoomRelayConfig = { iceServers: RTCIceServer[]; iceTransportPolicy: RTCIceTransportPolicy };

/** Visit-only credentials: never persist this object or include it in diagnostics. */
export function roomRelayConfig(urls: string, username: string, credential: string, relayOnly: boolean): RoomRelayConfig {
  const entries = [...new Set(urls.split(/[\s,]+/).filter(Boolean))];
  if (!entries.length || entries.length > 4) throw new Error("Enter one to four TURN server URLs.");
  for (const entry of entries) {
    const match = /^(turns?):(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::(\d{1,5}))?(?:\?transport=(udp|tcp))?$/i.exec(entry);
    if (!match || entry.length > 512 || (match[2] && (+match[2] < 1 || +match[2] > 65535))) throw new Error("Use a valid turn: or turns: URL, with an optional port and transport=udp or tcp.");
  }
  if (!username.trim() || !credential.trim() || username.length > 1024 || credential.length > 4096) throw new Error("Enter the temporary relay username and credential.");
  return { iceServers: [{ urls: entries, username: username.trim(), credential }], iceTransportPolicy: relayOnly ? "relay" : "all" };
}
