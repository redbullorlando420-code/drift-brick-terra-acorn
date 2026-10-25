import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LibraryVideo } from '@/lib/videos/types';
import { openYoutubeDownload, youtubeDownloadTarget } from '@/lib/youtube-download';

/** Cards never probe Companion or subscribe to job progress. */
export function YoutubeDownloadButton({ video, compact = false }: { video: LibraryVideo; compact?: boolean }) {
  if (!youtubeDownloadTarget(video)) return null;
  return <Button data-video-card-download type="button" variant="secondary" size="sm" className={compact ? 'mt-2 min-h-11 gap-2' : 'min-h-11 gap-2'}
    aria-label={`Download YouTube video: ${video.name}`} title="Save with the local YouTube downloader on this computer"
    onClick={event => { event.stopPropagation(); openYoutubeDownload(video); }}>
    <Download className="size-4" />{compact ? 'Download' : 'Download video'}
  </Button>;
}
