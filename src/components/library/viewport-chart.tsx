import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cardVisibility, type CardVisibility } from '@/lib/card-visibility';
import { allowCardArtwork } from '@/lib/session-activity';
import { scheduleNavigationWork } from '@/lib/navigation-work';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';

/** Keep chart dimensions and surrounding controls stable, while releasing SVG,
 * tooltip and resize work outside the viewport or during playback. Use the
 * shared visibility observers rather than one pair per chart. */
export function ViewportChart({ height, children }: { height: `${number}%`; children: ReactElement }) {
  const element = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<CardVisibility>({ near: false, visible: false });
  const [mounted, setMounted] = useState(false);
  const phase = useSessionPhase();
  const viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  useEffect(() => {
    if (element.current) return cardVisibility.observe(element.current, setVisibility);
  }, []);
  // A person can read a chart without touching the page. Preserve visible
  // charts in idle sessions, just as cards preserve already-visible artwork.
  const allowed = allowCardArtwork(phase, visibility.near, visibility.visible) && !viewer;
  useEffect(() => {
    if (!allowed) { setMounted(false); return; }
    if (!mounted) return scheduleNavigationWork(() => setMounted(true));
  }, [allowed, mounted]);
  return <div ref={element} style={{ height, width: '100%', minWidth: 0 }} data-viewport-chart data-chart-mounted={mounted}>
    {mounted ? <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      : <div aria-hidden="true" className="h-full w-full rounded-md bg-bg/20" />}
  </div>;
}
