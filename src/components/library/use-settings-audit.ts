import { useEffect, useState } from 'react';
import { scheduleBackgroundWork } from '@/lib/interaction-budget';
import { resolveCreatorCoverage } from '@/lib/videos/creator-coverage';
import type { FollowedChannel, LibraryVideo, VideoMetadataProvenance } from '@/lib/videos/types';

function emptyAudit() {
  return { smartTagStatus: { local: 0, tagged: 0, waiting: 0 },
    metadataTailCoverage: [] as Array<{ source: string; total: number; tagged: number; waiting: number; locked: number }>,
    creatorCoverage: { total: 0, present: 0, repairable: 0, unresolved: 0, ambiguous: [] as Array<{ id: string; name: string; candidates: string[] }> },
    companionInspectionCandidates: [] as LibraryVideo[],
    vision: { processed: 0, waiting: 0, eligible: false }, hiddenTitles: [] as Array<{ id: string; name: string }> };
}
type Audit = ReturnType<typeof emptyAudit>;
const EMPTY = emptyAudit();
/** Settings controls paint before diagnostics. One disposable pass replaces
 * repeated catalog filters on mount and every preference/button update. */
export function useSettingsAudit(videos: LibraryVideo[], tags: Record<string, string[]>,
  metadata: Record<string, VideoMetadataProvenance>, follows: FollowedChannel[], hidden: Record<string, boolean>) {
  const [completed, setCompleted] = useState<{ videos: LibraryVideo[]; tags: typeof tags; metadata: typeof metadata; follows: FollowedChannel[]; hidden: typeof hidden; audit: Audit }>();
  useEffect(() => {
    let stopped = false, offset = 0, cancel = () => {};
    const audit = emptyAudit();
    const coverage = new Map<string, Audit['metadataTailCoverage'][number]>();
    const hiddenNames = new Map<string, string>();
    const run = () => {
      if (stopped) return;
      const started = performance.now(), end = Math.min(videos.length, offset + 512);
      while (offset < end && performance.now() - started < 4) {
        const video = videos[offset++], rowTags = tags[video.id] ?? [];
        if (hidden[video.id]) hiddenNames.set(video.id, video.name);
        const locked = metadata[video.id]?.lockedFields?.includes('tags');
        const source = video.remote?.kind ?? 'local';
        const row = coverage.get(source) ?? { source, total: 0, tagged: 0, waiting: 0, locked: 0 };
        row.total++; if (rowTags.length) row.tagged++; else if (locked) row.locked++; else row.waiting++;
        coverage.set(source, row);
        if (!video.remote) {
          audit.smartTagStatus.local++;
          if (rowTags.some(tag => /^(?:year-|month-|type-|source-)/.test(tag))) audit.smartTagStatus.tagged++;
          if (rowTags.some(tag => tag.startsWith('vision-'))) audit.vision.processed++; else audit.vision.waiting++;
          if (!locked) audit.vision.eligible = true;
          if (audit.companionInspectionCandidates.length < 12 && /^(?:[a-z]:[\\/]|\\\\[^\\]+\\[^\\]+[\\/]|\/)/i.test(video.path)) audit.companionInspectionCandidates.push(video);
        } else if (video.remote.kind === 'youtube' || video.remote.kind === 'twitch') {
          audit.creatorCoverage.total++;
          const resolution = resolveCreatorCoverage(video, follows);
          if (resolution.status === 'present') audit.creatorCoverage.present++;
          else if (resolution.status === 'resolved') audit.creatorCoverage.repairable++;
          else if (resolution.status === 'unresolved') audit.creatorCoverage.unresolved++;
          else if (resolution.status === 'ambiguous' && audit.creatorCoverage.ambiguous.length < 48) audit.creatorCoverage.ambiguous.push({ id: video.id, name: video.name, candidates: resolution.candidates });
        }
      }
      if (offset < videos.length) { cancel = scheduleBackgroundWork(run); return; }
      audit.smartTagStatus.waiting = audit.smartTagStatus.local - audit.smartTagStatus.tagged;
      audit.metadataTailCoverage = [...coverage.values()].sort((a, b) => b.waiting - a.waiting || b.total - a.total || a.source.localeCompare(b.source));
      audit.hiddenTitles = Object.keys(hidden).map(id => ({ id, name: hiddenNames.get(id) ?? id }));
      setCompleted({ videos, tags, metadata, follows, hidden, audit });
    };
    cancel = scheduleBackgroundWork(run);
    return () => { stopped = true; cancel(); };
  }, [videos, tags, metadata, follows, hidden]);
  const ready = completed?.videos === videos && completed.tags === tags && completed.metadata === metadata && completed.follows === follows && completed.hidden === hidden;
  return { ...(completed?.audit ?? EMPTY), ready };
}
