import type { RemoteRef } from './types';

/** Construct an official room address from an identifier, never an arbitrary
 * stored URL. Browsing metadata does not authorize a restream or iframe. */
export function myFreeCamsRoomUrl(remote?: RemoteRef): string | undefined {
  if (remote?.kind !== 'myfreecams') return;
  let candidates = [remote.videoId, remote.channelName];
  try {
    const url = new URL(remote.watchUrl ?? '');
    if (url.protocol === 'https:' && ['www.myfreecams.com', 'myfreecams.com', 'app.myfreecams.com'].includes(url.hostname)) candidates = [...candidates, decodeURIComponent(url.hash.slice(1)), decodeURIComponent(url.pathname.slice(1))];
  } catch { /* A valid provider identifier is enough. */ }
  const name = candidates.find(value => typeof value === 'string' && /^[a-z0-9_]{1,50}$/i.test(value) && value.toLowerCase() !== 'homepage');
  return name ? `https://app.myfreecams.com/${encodeURIComponent(name)}` : undefined;
}
