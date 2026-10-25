import { resolvePlayUrl } from './sources';
import type { LibraryVideo } from './types';

/** One metadata-only media element, released after success, failure or cancel. */
export async function readLocalRuntime(video: LibraryVideo, signal: AbortSignal): Promise<number> {
  signal.throwIfAborted();
  if (video.remote) throw new Error('Choose a local video file.');
  const url = await resolvePlayUrl(video);
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const element = document.createElement('video');
    const finish = (duration?: number, error?: Error) => {
      clearTimeout(timer); signal.removeEventListener('abort', cancel);
      element.onloadedmetadata = element.onerror = null;
      element.removeAttribute('src'); element.load();
      if (error) reject(error); else resolve(duration!);
    };
    const cancel = () => finish(undefined, new Error('Runtime check cancelled.'));
    const timer = setTimeout(() => finish(undefined, new Error('File metadata timed out. The file may need reconnecting or use an unsupported codec.')), 8_000);
    signal.addEventListener('abort', cancel, { once: true });
    element.preload = 'metadata'; element.muted = true;
    element.onloadedmetadata = () => Number.isFinite(element.duration) && element.duration > 0
      ? finish(element.duration) : finish(undefined, new Error('The file did not provide a finite runtime.'));
    element.onerror = () => finish(undefined, new Error('Cannot read this file runtime. Reconnect its folder or check codec support.'));
    element.src = url;
  });
}
