import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { youtubeBrowseGroups, type YoutubeArchiveFormat } from '@/lib/videos/youtube-browse';
import { prepareYoutubeCreatorIndex } from '@/lib/remote/youtube-mix';
import { yieldNavigationTask } from '@/lib/navigation-work';
import { useLibrary } from '@/lib/videos/store';
import type { LibraryVideo } from '@/lib/videos/types';
const empty: LibraryVideo[] = [];
const labels: Record<YoutubeArchiveFormat, string> = { all: 'All saved videos', upload: 'Uploads', short: 'Shorts', replay: 'Completed streams' };
export function useYoutubeFormats(videos: LibraryVideo[], enabled: boolean) {
  const groups = useMemo(() => youtubeBrowseGroups(videos), [videos]);
  const [format, setFormat] = useState<YoutubeArchiveFormat>('all');
  const [ready, setReady] = useState<{ groups: typeof groups; format: YoutubeArchiveFormat }>();
  const covered = useLibrary(state => Boolean(state.previewId || state.activeId));
  useEffect(() => {
    if (!enabled) { setReady(undefined); return; }
    if (covered || format === 'all') return;
    const controller = new AbortController();
    void prepareYoutubeCreatorIndex(groups[format], controller.signal, () => yieldNavigationTask(controller.signal))
      .then(() => { if (!controller.signal.aborted) setReady({ groups, format }); })
      .catch(() => { /* Superseded/covered work never publishes partial results. */ });
    return () => controller.abort();
  }, [groups, format, enabled, covered]);
  const preparing = enabled && format !== 'all' && (ready?.groups !== groups || ready.format !== format);
  return { groups, format, setFormat, preparing, videos: !enabled || format === 'all' ? groups.all : preparing ? empty : groups[format] };
}
export function YoutubeFormatControls({ selection }: { selection: ReturnType<typeof useYoutubeFormats> }) {
  return <section className="mb-6" aria-label="YouTube video formats" aria-busy={selection.preparing}>
    <div className="flex flex-wrap gap-2">{(Object.keys(labels) as YoutubeArchiveFormat[]).map(format => <Button key={format} variant={selection.format === format ? 'default' : 'secondary'}
      className="min-h-11" aria-pressed={selection.format === format} onClick={() => selection.setFormat(format)}>{labels[format]} · {selection.groups[format].length.toLocaleString()}</Button>)}</div>
    <p className="mt-2 text-xs leading-5 text-muted" role="status">{selection.preparing ? 'Preparing this saved format…' : 'Format filters apply to saved shelves and recommendations. Live streams and upcoming events stay in their own rows. Dates follow RSS when available; unknown publication dates stay last.'}</p>
  </section>;
}
