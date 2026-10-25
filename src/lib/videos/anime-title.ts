export type AnimeTitleInfo = { series: string; key: string; season: number; episode?: number; format: 'episode' | 'film' | 'special' | 'title' };
/** Read scene/fansub episode notation without treating years, resolution or
 * codecs as episode numbers. This groups titles for browsing, never identity. */
export function animeTitleInfo(name: string): AnimeTitleInfo {
  const clean = name.replace(/\.(?:mkv|mp4|webm|avi|mov|m4v|ts)$/i,'').replace(/\[[^\]]{0,120}\]/g,' ').replace(/[._]+/g,' ').replace(/\s+/g,' ').trim();
  const film = /\b(?:movie|film|theatrical)\b/i.test(clean), special = !film && /\b(?:ova|ona|special)\b/i.test(clean);
  const episode = /\bS(\d{1,2})\s*E(\d{1,3})(?:v\d)?\b/i.exec(clean)
    ?? /\b(\d{1,2})x(\d{1,3})\b/i.exec(clean);
  const numbered = /\b(?:episode|ep\.?|e)\s*(\d{1,3})(?:v\d)?\b/i.exec(clean)
    ?? /(?:\s[-–]\s|\s-)(\d{1,3})(?:v\d)?(?=\s|$|\()/i.exec(clean)
    ?? /第\s*(\d{1,3})\s*話/.exec(clean);
  const marker = episode ?? numbered;
  const series = (marker ? clean.slice(0,marker.index) : clean).replace(/\b(?:season\s*\d+)\b.*$/i,'').replace(/[\s\-–:]+$/,'').trim() || clean;
  return { series, key: series.normalize('NFKC').toLocaleLowerCase(), season: episode ? Number(episode[1]) : Number(/\bseason\s*(\d+)\b/i.exec(clean)?.[1] ?? 1),
    ...(marker ? { episode: Number(episode ? episode[2] : numbered![1]) } : {}), format: film ? 'film' : special ? 'special' : marker ? 'episode' : 'title' };
}
