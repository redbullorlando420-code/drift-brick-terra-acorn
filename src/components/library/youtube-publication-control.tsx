import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/lib/videos/store';
import { youtubeDownloadTarget } from '@/lib/youtube-download';
import { fetchYoutubePublication } from '@/lib/remote/youtube-publication-functions';
import type { LibraryVideo } from '@/lib/videos/types';
type DateCheck = { key: string; title: string; youtubeId: string; detail: string; state: 'waiting' | 'verified' | 'unavailable' | 'error' };
export function YoutubePublicationControl({ video }: { video?: LibraryVideo }) {
  const [busy, setBusy] = useState(false), [note, setNote] = useState('');
  const [error, setError] = useState(''), [unavailable, setUnavailable] = useState(0);
  const [report, setReport] = useState<DateCheck[]>([]);
  const checked = useRef(new Set<string>()), mounted = useRef(true), operation = useRef(false);
  const revision = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; revision.current++; }; }, []);
  useEffect(() => { revision.current++; operation.current = false; checked.current.clear(); setBusy(false); setNote(''); setError(''); setUnavailable(0); setReport([]); }, [video?.id]);
  if (video && video.remote?.kind !== 'youtube') return null;
  const run = async () => {
    if (operation.current) return;
    operation.current = true; setBusy(true); setNote(''); setError('');
    const request = ++revision.current;
    const current = () => mounted.current && revision.current === request;
    let repaired = 0;
    let rows: DateCheck[] = [];
    try {
      // Stop after five eligible rows instead of allocating a full-library filter.
      const targets: { row: LibraryVideo; id: string }[] = [];
      for (const row of video ? [video] : useLibrary.getState().videos) {
        const remote = row.remote;
        if (remote?.kind !== 'youtube' || remote.live || remote.youtubeType === 'upcoming' || (!video && (remote.publishedSource === 'watch' || checked.current.has(row.id)))) continue;
        const target = youtubeDownloadTarget(row);
        if (target) targets.push({ row, id: target.videoId });
        if (targets.length === 5) break;
      }
      if (!targets.length) { if (current()) { setReport([]); setNote('No remaining eligible videos need a date check. Live and upcoming streams are skipped.'); } return; }
      rows = targets.map(({ row, id }) => ({ key: row.id, title: row.name, youtubeId: id, state: 'waiting', detail: 'Waiting for YouTube' }));
      setReport(rows);
      const result = await fetchYoutubePublication({ data: { ids: [...new Set(targets.map(row => row.id))] } });
      let missing = 0;
      for (const item of result) {
        const matches = targets.filter(row => row.id === item.id);
        if (item.error) { rows = rows.map(row => row.youtubeId === item.id ? { ...row, state: 'error', detail: item.error! } : row); continue; }
        for (const { row } of matches) {
          const date = item.date?.slice(0, 10);
          if (item.date) { await useLibrary.getState().setYoutubePublication(row.id, item.date); repaired++; }
          else missing++;
          rows = rows.map(entry => entry.key === row.id ? { ...entry, state: date ? 'verified' : 'unavailable', detail: date ? `Verified ${date}${row.remote?.publishedDate && row.remote.publishedDate !== date ? ` · previously ${row.remote.publishedDate}` : ''}` : `Exact date unavailable${row.remote?.publishedDate ? ` · kept ${row.remote.publishedDate}` : ' · no date guessed'}` } : entry);
          if (current()) checked.current.add(row.id);
        }
      }
      if (!current()) return;
      setReport(rows.map(row => row.state === 'waiting' ? { ...row, detail: 'Not checked · batch paused after a provider error' } : row));
      setUnavailable(previous => previous + missing);
      setNote(`${repaired} publication date${repaired === 1 ? '' : 's'} verified from YouTube.${missing ? ` ${missing} video${missing === 1 ? '' : 's'} did not expose an exact date; existing dates were kept.` : ''}${result.length < new Set(targets.map(row => row.id)).size ? ' Remaining checks paused after a provider error.' : ''}`);
      const failure = result.find(row => row.error)?.error;
      if (failure) setError(failure);
    } catch (cause) { if (current()) { setReport(rows.map(row => row.state === 'waiting' ? { ...row, state: 'error', detail: 'Check stopped · saved date unchanged' } : row)); setNote(repaired ? `${repaired} date${repaired === 1 ? '' : 's'} saved before the check stopped.` : ''); setError(cause instanceof Error ? cause.message : 'Could not fetch publication dates.'); } }
    finally { if (current()) { operation.current = false; setBusy(false); } }
  };
  const stream = video?.remote?.live || video?.remote?.youtubeType === 'upcoming';
  return <div className="flex min-w-0 flex-col gap-2"><div className="flex flex-wrap gap-2"><Button variant="secondary" className="min-h-11" disabled={busy || stream} onClick={() => void run()}>{busy ? 'Checking YouTube dates…' : video ? 'Verify publication date' : 'Repair next 5 YouTube dates'}</Button>{!video && unavailable > 0 && <Button variant="ghost" disabled={busy} onClick={() => { checked.current.clear(); setUnavailable(0); void run(); }}>Retry unavailable dates</Button>}</div>{stream && <p className="text-xs text-muted">Publication checks are available after this stream has ended.</p>}{video?.remote?.publishedDate && <p className="text-xs text-muted">Published {video.remote.publishedDate} · {video.remote.publishedSource === 'watch' ? 'verified on YouTube' : 'from provider metadata'}</p>}{note && <p role="status" className="max-w-xl text-xs leading-5 text-muted">{note}</p>}{error && <p role="alert" className="max-w-xl text-xs leading-5 text-danger">{error}</p>}{report.length > 0 && <details open className="max-w-xl rounded-lg border border-border bg-bg px-3"><summary className="min-h-11 cursor-pointer py-3 text-xs font-medium">Last date check · {report.length} video{report.length === 1 ? '' : 's'}</summary><ul className="divide-y divide-border pb-2" aria-label="Publication date results">{report.map(row => <li key={row.key} className="py-2"><a href={`https://www.youtube.com/watch?v=${row.youtubeId}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center break-words text-xs text-accent underline underline-offset-4">{row.title}</a><p className={`break-words text-xs leading-5 ${row.state === 'error' ? 'text-danger' : 'text-muted'}`}>{row.detail}</p></li>)}</ul></details>}</div>;
}
