import type { LibraryVideo } from './videos/types';

export type YoutubeDownloadTarget = { videoId: string; title: string; live: boolean; estimatedBytes?:number };
let target: YoutubeDownloadTarget | null = null;
const listeners = new Set<() => void>();
export const subscribeYoutubeDownload = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getYoutubeDownload = () => target;
export const getServerYoutubeDownload = () => null;
export function youtubeDownloadTarget(video: LibraryVideo): YoutubeDownloadTarget | null {
  if (video.remote?.kind !== 'youtube') return null;
  let id = video.remote.videoId;
  if (!id && video.remote.watchUrl) {
    try {
      const url = new URL(video.remote.watchUrl);
      if (['www.youtube.com', 'youtube.com', 'm.youtube.com'].includes(url.hostname)) id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})$/)?.[1];
      else if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    } catch { /* Invalid provider metadata does not become a download URL. */ }
  }
  return id && /^[\w-]{11}$/.test(id) ? { videoId: id, title: video.name, live: Boolean(video.remote.live), ...(Number.isSafeInteger(video.size)&&video.size>0?{estimatedBytes:video.size}:{}) } : null;
}
export function openYoutubeDownload(video: LibraryVideo) {
  const next = youtubeDownloadTarget(video);
  if (!next) return;
  target = next; for (const listener of listeners) listener();
}
export function closeYoutubeDownload() { target = null; for (const listener of listeners) listener(); }

export type YoutubeDownloadJob = {
  id: string; key: string; title: string; status: 'queued' | 'running' | 'done' | 'error' | 'cancelled' | 'interrupted' | 'paused';
  detail: string; progress: number; path: string; file?: string; updatedAt: number; browser?: string; engine?: string; attempt?: number; source?: string; preflight?: DownloadPreflight;
};
export type DownloadPreflight={state:'ready'|'low-space'|'space-unknown'|'files-unverified';freeBytes?:number|null;estimateBytes?:number|null;unknownAllowanceBytes?:number;partialBytes?:number;marginBytes?:number;requiredBytes?:number;checkedAt:number};
export type YoutubeDownloadState = { ok: boolean; configured: boolean; engine: string; version: string | null; path: string | null; jobs: YoutubeDownloadJob[]; needs?: string[]; browserAuth?: boolean; localPlayback?: boolean; taskRecovery?: boolean; diskPreflight?:boolean; downloadBudget?:{marginBytes:number;unknownBytes:number}; recovery?: {persistent:boolean;error?:string;maxEntries:number;retained:number} };
