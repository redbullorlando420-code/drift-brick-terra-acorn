/** Documented YouTube IFrame API error codes, never inferred from iframe text.
 * https://developers.google.com/youtube/iframe_api_reference#onError */
export function roomYoutubeError(code: unknown): string | undefined {
  if (typeof code !== 'number' || !Number.isInteger(code)) return;
  if (code === 100) return 'YouTube reports that this video is unavailable or private. Open it on YouTube or choose another queued title.';
  if (code === 101 || code === 150) return 'This creator does not allow embedded playback. Open the video on YouTube or choose another queued title.';
  if (code === 153) return 'YouTube could not identify this embedded player. Try reloading this player, or open the video on YouTube.';
  if (code === 2) return 'YouTube rejected this video request. Check the link or choose another queued title.';
  return 'YouTube could not play this video on this device. Try reloading this player, or open it on YouTube.';
}

/** Commit keyboard intent before a confirmed host clock can rerender the
 * controlled range between its native input event and keyup. */
export function roomSeekKey(key: string, position: number, duration: number): number | undefined {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return;
  const value = key === 'Home' ? 0 : key === 'End' ? duration
    : ['ArrowRight', 'ArrowUp'].includes(key) ? position + 0.25
    : ['ArrowLeft', 'ArrowDown'].includes(key) ? position - 0.25
    : key === 'PageUp' ? position + Math.max(0.25, duration / 10)
    : key === 'PageDown' ? position - Math.max(0.25, duration / 10) : undefined;
  return value === undefined ? undefined : Math.min(duration, Math.max(0, value));
}
