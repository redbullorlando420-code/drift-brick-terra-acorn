import { useEffect, useState } from 'react';
import { buildContinueInsights } from '@/lib/videos/continue-insights';
import { resumeForVideo } from '@/lib/videos/store';
import type { LibraryVideo, ResumeMark } from '@/lib/videos/types';
import { yieldNavigationTask } from '@/lib/navigation-work';

export function useContinueInsights(enabled: boolean, videos: LibraryVideo[], progress: Record<string, ResumeMark>, resumeProgress: Record<string, ResumeMark>) {
  const [result, setResult] = useState<{ videos: LibraryVideo[]; progress: typeof progress; resumeProgress: typeof resumeProgress; counts: { valid: number; stale: number; linked: number } }>();
  useEffect(() => {
    if (!enabled) { setResult(undefined); return; }
    const controller = new AbortController();
    void buildContinueInsights(videos, progress, video => resumeForVideo({ progress, resumeProgress }, video), Date.now(), () => yieldNavigationTask(controller.signal))
      .then(counts => { if (!controller.signal.aborted) setResult({ videos, progress, resumeProgress, counts }); }).catch(() => {});
    return () => controller.abort();
  }, [enabled, videos, progress, resumeProgress]);
  return enabled && result?.videos === videos && result.progress === progress && result.resumeProgress === resumeProgress ? result.counts : { valid: '…', stale: '…', linked: '…' };
}
