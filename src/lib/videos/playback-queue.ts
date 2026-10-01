import type { LibraryVideo } from './types';
/** Keep ordered neighbors around the selected title, without copying a full
 * catalog into a playback queue. The caller keeps this window for the session. */
export function playbackWindow(rows: LibraryVideo[], selected: LibraryVideo, limit = 512): LibraryVideo[] {
  const position = rows.indexOf(selected);
  const index = position >= 0 ? position : rows.findIndex(row => row.id === selected.id);
  if (index < 0) return [selected];
  const start = Math.max(0, Math.min(index - Math.floor(limit / 2), rows.length - limit));
  return rows.slice(start, start + limit);
}
