/** A loopback URL opens only on the device that created it. */
export function shareableRoomInvite(origin: string, pathname: string, room: string): string | null {
  try {
    const url = new URL(pathname, origin);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      /^(?:localhost|.*\.localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?)$/i.test(
        url.hostname,
      ) ||
      !/^RC[A-Z0-9]{4,12}$/.test(room)
    )
      return null;
    url.search = "";
    url.hash = "";
    url.searchParams.set("room", room);
    url.searchParams.set("theater", "1");
    return url.toString();
  } catch {
    return null;
  }
}
