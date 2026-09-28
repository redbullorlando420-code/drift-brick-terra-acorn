/** A loopback URL opens only on the device that created it. */
export function shareableRoomInvite(origin: string, pathname: string, room: string): string | null {
  try {
    const url = new URL(pathname, origin);
    if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname.toLowerCase())) return null;
    url.search = "";
    url.hash = "";
    url.searchParams.set("room", room);
    url.searchParams.set("theater", "1");
    return url.toString();
  } catch {
    return null;
  }
}
