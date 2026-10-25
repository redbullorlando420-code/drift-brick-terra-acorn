import { lazy, Suspense, useSyncExternalStore } from 'react';
import { closeYoutubeDownload, getServerYoutubeDownload, getYoutubeDownload, subscribeYoutubeDownload } from '@/lib/youtube-download';
const DownloadDialog = lazy(() => import('./youtube-download-dialog'));
export function YoutubeDownloadHost() {
  const target = useSyncExternalStore(subscribeYoutubeDownload, getYoutubeDownload, getServerYoutubeDownload);
  if (!target) return null;
  return <Suspense fallback={<div role="status" className="fixed inset-x-3 bottom-3 z-60 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 text-fg">Opening downloads…<button onClick={closeYoutubeDownload} className="min-h-11 px-3">Cancel</button></div>}>
    <DownloadDialog key={target.videoId} target={target} />
  </Suspense>;
}
