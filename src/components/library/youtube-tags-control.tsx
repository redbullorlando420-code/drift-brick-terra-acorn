import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/lib/videos/store';
import { fetchYoutubeVideoMetadata } from '@/lib/remote/youtube-publication-functions';
import { YoutubeTagSuggestions } from './youtube-tag-suggestions';
import { youtubeDownloadTarget } from '@/lib/youtube-download';
import { yieldCatalogTask } from '@/lib/catalog-work';
import type { LibraryVideo } from '@/lib/videos/types';

type Result = { id: string; title: string; detail: string; failed?: boolean };
export function YoutubeTagsControl({ video }: { video?: LibraryVideo }) {
  const [busy, setBusy] = useState(false), [note, setNote] = useState(''), [error, setError] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const generation = useRef(0), running = useRef(false);
  const retryIds = useRef(new Set<string>());
  useEffect(() => { generation.current++; running.current = false; retryIds.current.clear(); setBusy(false); setResults([]); setError(''); setNote('');
    return () => { generation.current++; running.current = false; }; }, [video?.id]);
  if (video && video.remote?.kind !== 'youtube') return null;
  const run = async () => {
    if (running.current) return;
    running.current = true; setBusy(true); setError(''); setResults([]);
    const revision = ++generation.current, current = () => generation.current === revision;
    const targets: LibraryVideo[] = [];
    // No full-library filtered array or network polling. Five sequential calls
    // let Stop/navigation prevent every remaining provider request.
    let visited = 0;
    for (const row of video ? [video] : useLibrary.getState().videos) {
      if (++visited % 512 === 0) { await yieldCatalogTask(); if (!current()) return; }
      if (row.remote?.kind !== 'youtube' || row.remote.live || row.remote.youtubeType === 'upcoming') continue;
      if (!video && row.remote.youtubeTagsCheckedAt && !retryIds.current.has(row.id)) continue;
      if (youtubeDownloadTarget(row)) targets.push(row);
      if (targets.length === 5) break;
    }
    const report: Result[] = [];
    try {
      if (!targets.length) { setNote('Every eligible saved video has been checked. Open a video to refresh its tags. Live and upcoming streams are skipped.'); return; }
      for (const [index, row] of targets.entries()) {
        if (!current()) break;
        setNote(`Pulling video ${index + 1} of ${targets.length}: ${row.name}`);
        try {
          const metadata = await fetchYoutubeVideoMetadata({ data: { id: youtubeDownloadTarget(row)!.videoId } });
          if (!current()) break;
          const saved = await useLibrary.getState().setYoutubeMetadata(row.id, metadata);
          retryIds.current.delete(row.id);
          report.push({ id: row.id, title: row.name, detail: `${metadata.keywords?.length ?? 0} creator tags · ${saved.tags} suggestions prepared${saved.locked ? ' · your tag lock kept; suggestions available in the preview' : ' · only high-confidence enrichment saved'}${metadata.description ? ' · full description checked' : ''}` });
        } catch (cause) {
          if (!current()) break;
          retryIds.current.add(row.id);
          const message = cause instanceof Error ? cause.message : 'YouTube metadata is unavailable.';
          report.push({ id: row.id, title: row.name, detail: message, failed: true });
          setError(`${message} Remaining videos were not requested. Try again when YouTube is available.`);
          break;
        }
        if (current()) setResults([...report]);
      }
      if (current()) { setResults(report); setNote(`${report.filter(row => !row.failed).length} video${report.filter(row => !row.failed).length === 1 ? '' : 's'} saved. Manual tags and locked fields stay protected.`); }
    } finally { if (current()) { running.current = false; setBusy(false); } }
  };
  const stream = Boolean(video?.remote?.live || video?.remote?.youtubeType === 'upcoming');
  return <div className="min-w-0 space-y-3">
    <div className="flex flex-wrap gap-2"><Button variant="secondary" className="min-h-11" disabled={busy || stream} onClick={() => void run()}>{busy ? 'Pulling YouTube tags…' : video ? 'Pull video tags & description' : 'Pull tags for next 5 videos'}</Button>
      {busy && <Button variant="ghost" className="min-h-11" onClick={() => { generation.current++; running.current = false; setBusy(false); setNote('Stopped. Completed saves were kept. A save already underway may finish; remaining videos will not be requested.'); }}>Stop tag pull</Button>}</div>
    {stream && <p className="text-xs text-muted">Pull tags after this stream ends.</p>}
    {note && <p role="status" className="break-words text-xs leading-5 text-muted">{note}</p>}
    {error && <p role="alert" className="break-words text-xs leading-5 text-danger">{error}</p>}
    {results.length > 0 && <ul aria-label="YouTube tag pull results" className="divide-y divide-border rounded-lg border border-border px-3">{results.map(row => <li className="py-3" key={row.id}><p className="break-words text-xs font-medium">{row.title}</p><p className={`mt-1 break-words text-xs leading-5 ${row.failed ? 'text-danger' : 'text-muted'}`}>{row.detail}</p></li>)}</ul>}
    {video?.remote?.youtubeTagsCheckedAt && <p className="text-xs text-muted">Video metadata checked {new Date(video.remote.youtubeTagsCheckedAt).toLocaleString()} · {video.remote.youtubeKeywords?.length ?? 0} creator tags</p>}
    {video && <YoutubeTagSuggestions video={video}/>}
  </div>;
}
