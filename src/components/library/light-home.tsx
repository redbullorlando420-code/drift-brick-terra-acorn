import {SetupChecklist} from './setup-checklist';
import { ArrowRight, Box, ChevronDown, Clapperboard, Heart, LayoutDashboard, Lock, MonitorPlay, Radio, Settings2, Sparkles, Users } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/lib/videos/store';
import { markHomeReady } from '@/lib/first-shelf-trace';
import type { SourceId } from '@/lib/videos/types';

const GROUPS = [
  { id: 'watch', title: 'Watch & discover', detail: 'Channels, films, and something new.', icon: Clapperboard, open: false, links: [
    ['youtube', 'YouTube', 'Creators & saved uploads'], ['twitch', 'Twitch', 'VODs, clips & follows'], ['live', 'Live', 'Check who is streaming'], ['movies', 'Movies', 'Full-length films'], ['anime', 'Anime', 'Your anime collection'], ['genres', 'Topics', 'Explore by interest'], ['landing', 'Landing page', 'Recommendations & shelves'],
  ] },
  { id: 'saved', title: 'Your library', detail: 'Return to the things you saved.', icon: Heart, open: false, links: [
    ['continue', 'Continue watching', 'Resume a video'], ['favorites', 'Favorites', 'Hearts & likes'], ['history', 'History', 'Recently watched'], ['photos', 'Photos', 'Sources & albums'],
  ] },
  { id: 'create', title: 'Create & play', detail: 'Images, games, and projects.', icon: Sparkles, links: [
    ['stable-diffusion', 'Stable Diffusion', 'Local image studio'], ['prints', '3D prints', 'Models & viewer'], ['games', 'Games', 'Your installed collection'], ['shop', 'Shop', 'Saved finds'],
  ] },
  { id: 'together', title: 'Share & listen', detail: 'Watch rooms and creator tools.', icon: Users, links: [
    ['watch-room', 'Watch room', 'Watch together & queue'], ['stream-signal', 'Stream Signal', 'Prepare going-live posts'], ['streaming', 'Streaming', 'Channel shortcuts'], ['spotify', 'Spotify', 'Music & playlists'], ['social', 'X accounts', 'Your social workspace'],
  ] },
  { id: 'tools', title: 'Manage & connect', detail: 'Devices, guidance, and app controls.', icon: Settings2, links: [
    ['settings', 'Settings', 'Pulling, storage & playback'], ['stats', 'Stats', 'Library & viewing insights'], ['assistant', 'AI guide', 'Find a title by interest'], ['mission-plan', 'Mission plan', 'Progress & repository credits'], ['connection', 'Connection guide', 'Connect your devices'], ['remote-desktop', 'Remote desktop', 'Your remote access tools'], ['find-phone', 'Find my phone', 'Device connection help'],
  ] },
  { id: 'private', title: 'Private areas', detail: 'Open your private workspace.', icon: Lock, links: [
    ['adults', 'Adults', 'Private library'], ['adult-fetishes', 'Fetish Explorer', 'Private topic explorer'],
  ] },
] as const;
const KEY = 'reelcase.home.groups.v1';
const QUICK = [['continue', 'Continue watching', MonitorPlay], ['live', 'Live now', Radio], ['watch-room', 'Watch together', Users], ['landing', 'Landing page', LayoutDashboard]] as const;

/** Navigation only: startup never scans the catalog or mounts media shelves. */
export function LightHome({onAddFolder}:{onAddFolder?:()=>void}) {
  const setSource = useLibrary(s => s.setSource);
  const [ready, setReady] = useState(false);
  const [groups, setGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(GROUPS.map(group => [group.id, 'open' in group && group.open])));
  useLayoutEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      if (saved && typeof saved === 'object') setGroups(current => Object.fromEntries(GROUPS.map(group => [group.id, typeof saved[group.id] === 'boolean' ? saved[group.id] : current[group.id]])));
    } catch { /* Default navigation works without storage. */ }
    markHomeReady(); setReady(true);
  }, []);
  const go = (id: string) => { setSource(id as SourceId); window.scrollTo({ top: 0, behavior: 'instant' }); };
  return <section aria-label="Quick Home" data-home-ready={ready} className="mx-auto max-w-6xl py-6 sm:py-10">
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent"><Box className="size-4" aria-hidden="true" /> Realhub · Your workspace</div>
      <h1 className="mt-4 font-display text-4xl text-fg sm:text-5xl">Make yourself at Home.</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Pick up a video, find a live stream, or open a workspace. Everything has a place below.</p>
      <div aria-label="Home shortcuts" className="mt-6 flex flex-wrap gap-2">
        {QUICK.map(([id, title, Icon], index) => <Button key={id} variant={index === 0 ? 'default' : 'secondary'} className="min-h-11" onClick={() => go(id)}><Icon className="size-4" aria-hidden="true" />{title}</Button>)}
      </div>
    </div>
    <SetupChecklist onAddFolder={onAddFolder}/>
    <div className="mb-4 mt-8 flex items-baseline justify-between gap-3"><h2 className="font-display text-2xl text-fg">Explore your spaces</h2><span className="text-xs text-muted">Expand a section</span></div>
    <nav aria-label="Home workspaces" className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      {GROUPS.map(({ id, title, detail, icon: Icon, links }) => <details key={id} open={groups[id]} onToggle={event => {
        const open = event.currentTarget.open;
        setGroups(current => {
          if (current[id] === open) return current;
          const next = { ...current, [id]: open };
          try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep the choice for this visit. */ }
          return next;
        });
      }} className="group min-w-0 rounded-xl border border-border bg-surface text-fg">
        <summary className="flex min-h-24 cursor-pointer list-none items-center gap-3 rounded-xl p-4 hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
          <span className="rounded-lg bg-elevated p-3 text-accent"><Icon className="size-5" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block font-display text-lg">{title}</span><span className="mt-1 block text-xs leading-5 text-muted">{detail}</span></span>
          <ChevronDown className="size-4 shrink-0 text-muted group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mx-4 mb-3 border-t border-border pt-2">
          {links.map(([source, label, description]) => <button key={source} type="button" onClick={() => go(source)} className="flex min-h-14 w-full items-center gap-3 rounded-md px-2 py-3 text-left hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent"><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-xs text-muted">{description}</span></span><ArrowRight className="size-4 shrink-0 text-muted" aria-hidden="true" /></button>)}
        </div>
      </details>)}
    </nav>
  </section>;
}
