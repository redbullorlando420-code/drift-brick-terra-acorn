import { memo, useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { useSessionPhase } from '@/lib/use-session-phase';
import { registerPeriodicTask } from '@/lib/periodic-work';
import { useLibrary } from '@/lib/videos/store';

/** Only the clock paints on a minute boundary. No header/search rerender,
 * and no clock timer while hidden, idle, or below its visible breakpoint. */
export const HeaderClock = memo(function HeaderClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [wide, setWide] = useState(false);
  const phase = useSessionPhase();
  const viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const update = () => setWide(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!wide || viewerOpen || phase !== 'active') return;
    setNow(new Date());
    return registerPeriodicTask({ name: 'Header minute', everyMs: 60_000,
      firstMs: 60_000 - Date.now() % 60_000 + 10, work: () => setNow(new Date()) }).cancel;
  }, [wide, viewerOpen, phase]);
  return <span className="hidden items-center gap-1.5 px-2 text-xs tabular-nums text-muted xl:flex"><Clock3 className="size-3.5" />{now ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--'}</span>;
});
