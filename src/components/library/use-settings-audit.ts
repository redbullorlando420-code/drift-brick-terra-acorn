import { startTransition, useEffect, useMemo, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { emptySettingsAudit, prepareSettingsAudit, type SettingsAuditInput } from '@/lib/videos/settings-audit';
import type { FollowedChannel, LibraryVideo, VideoMetadataProvenance } from '@/lib/videos/types';

const EMPTY = emptySettingsAudit();
/** Settings paints first. Obsolete snapshots and covered/hidden desks stop
 * preparing diagnostics until the user returns to an active, visible desk. */
export function useSettingsAudit(videos: LibraryVideo[], tags: Record<string, string[]>,
  metadata: Record<string, VideoMetadataProvenance>, follows: FollowedChannel[], hidden: Record<string, boolean>) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const scope = useMemo(() => ({ videos, tags, metadata, follows, hidden }), [videos, tags, metadata, follows, hidden]);
  const [completed, setCompleted] = useState<{ scope: SettingsAuditInput; audit: ReturnType<typeof emptySettingsAudit> }>();
  useEffect(() => {
    if (phase !== 'active' || viewer || completed?.scope === scope) return;
    const controller = new AbortController();
    void prepareSettingsAudit(scope, catalogTurn(controller.signal)).then(audit => {
      if (!controller.signal.aborted) startTransition(() => setCompleted({ scope, audit }));
    }).catch(() => {});
    return () => controller.abort();
  }, [scope, phase, viewer]);
  return { ...(completed?.audit ?? EMPTY), ready: completed?.scope === scope };
}
