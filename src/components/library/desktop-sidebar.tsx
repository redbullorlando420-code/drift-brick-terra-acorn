import { memo, useEffect, useRef, useSyncExternalStore } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSidebarController, SIDEBAR_PINNED_KEY } from '@/lib/sidebar-controller';
import { SidebarNav } from './sidebar';

export const desktopSidebar = createSidebarController((work, delay) => {
  const timer = setTimeout(work, delay); return () => clearTimeout(timer);
});
const SERVER_STATE = { open: true, pinned: true };
const useSidebar = () => useSyncExternalStore(desktopSidebar.subscribe, desktopSidebar.getSnapshot, () => SERVER_STATE);

export const SidebarToggle = memo(function SidebarToggle() {
  const { open } = useSidebar();
  return <Button data-sidebar-toggle variant="ghost" size="icon" className="hidden size-11 shrink-0 lg:flex" onClick={desktopSidebar.toggle}
    aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'} aria-expanded={open} aria-controls="desktop-sidebar-navigation" title="Toggle sidebar (Ctrl+B)">
    {open ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
  </Button>;
});

export const DesktopSidebar = memo(function DesktopSidebar({ onAddFolder }: { onAddFolder: (adult?: boolean) => void }) {
  const { open, pinned } = useSidebar();
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    try { desktopSidebar.pin(localStorage.getItem(SIDEBAR_PINNED_KEY) !== 'false'); } catch { /* session preference */ }
    let previous = desktopSidebar.getSnapshot().pinned;
    const unsubscribe = desktopSidebar.subscribe(() => {
      const next = desktopSidebar.getSnapshot().pinned;
      if (next === previous) return;
      previous = next;
      try { localStorage.setItem(SIDEBAR_PINNED_KEY, String(next)); } catch { /* session preference */ }
    });
    return () => { unsubscribe(); desktopSidebar.dispose(); };
  }, []);
  useEffect(() => {
    if (!open || pinned) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Element && !root.current?.contains(event.target) && !event.target.closest('[data-sidebar-toggle]')) desktopSidebar.dismiss();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, pinned]);
  return <aside ref={root} aria-label="Desktop sidebar" data-sidebar-mode={pinned ? 'pinned' : 'auto'} data-sidebar-open={open}
    className={`sticky top-0 hidden h-dvh shrink-0 lg:block ${pinned ? 'w-64' : 'w-20'}`}
    onPointerEnter={() => desktopSidebar.pointer(true)} onPointerLeave={() => desktopSidebar.pointer(false)}
    onPointerDown={() => desktopSidebar.focus(false)}
    onFocusCapture={event => desktopSidebar.focus(event.target.matches(':focus-visible'))}
    onKeyDown={event => { if (event.key === 'Escape' && open && !pinned) { event.preventDefault(); desktopSidebar.dismiss(); document.querySelector<HTMLElement>('header [data-sidebar-toggle]')?.focus(); } }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) desktopSidebar.focus(false); }}>
    <div className={`absolute inset-y-0 left-0 z-30 border-r border-border bg-surface py-3 ${open ? 'w-64 px-3' : 'w-20 px-2'} ${open && !pinned ? 'shadow-lift' : ''}`}>
      <SidebarNav compact={!open} onToggleCompact={desktopSidebar.toggle} pinned={pinned}
        onTogglePinned={() => desktopSidebar.pin(!pinned)} onNavigate={desktopSidebar.dismiss} onAddFolder={onAddFolder} />
    </div>
  </aside>;
});
