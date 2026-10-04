import { useEffect, useState } from "react";
import { Play, Shuffle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import { TitleRail } from "./browse";
import { getRatingStreakSnapshot, RATING_GOALS, setRatingWeeklyGoal, type RatingStreakSnapshot } from "@/lib/rating-streaks";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
import { registerPeriodicTask } from '@/lib/periodic-work';
import { useSessionPhase } from '@/lib/use-session-phase';
import { discoveryPicks } from '@/lib/videos/discovery-picks';

export function DiscoveryDesk({ videos }: { videos: LibraryVideo[] }) {
  const [seed, setSeed] = useState(() => (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
  const [picks, setPicks] = useState<LibraryVideo[]>([]);
  const open = useLibrary((s) => s.openVideo);
  const viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  const phase = useSessionPhase();
  useEffect(() => {
    const rotate = () => setSeed((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    if (!videos.length || viewerOpen || phase !== 'active') return;
    return registerPeriodicTask({ name: 'Landing discoveries', everyMs: 60_000, work: rotate }).cancel;
  }, [videos.length, viewerOpen, phase]);
  useEffect(() => {
    if (viewerOpen || phase !== 'active') return;
    let cancelled = false;
    const compute = () => {
      if (cancelled) return;
      setPicks(discoveryPicks(videos, seed));
    };
    const cancelSchedule = scheduleBackgroundWork(compute, { timeoutMs: 400 });
    return () => { cancelled = true; cancelSchedule(); };
  }, [videos, seed, viewerOpen, phase]);
  return <section className="mb-8 rounded-xl border border-border bg-surface p-5 sm:p-7">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Your daily detour</p><h1 className="discovery-heading font-display">Something worth finding.</h1><p className="mt-3 text-sm text-muted">A fresh mix from your library. Follow your curiosity.</p></div><div className="flex flex-wrap gap-2"><Button disabled={!picks.length} onClick={() => open(picks[0].id)}><Play className="size-4"/>Surprise me</Button><Button variant="secondary" onClick={() => setSeed(Math.floor(Math.random() * 0xffffffff) || 1)}><Shuffle className="size-4"/>Shuffle picks</Button></div></div>
    {picks.length ? <TitleRail title="Random discoveries" videos={picks} variant="rail"/> : <p className="py-6 text-sm text-muted">Add videos or follow a channel to start discovering.</p>}
  </section>;
}

export function RatingStreakCard() {
  const [snapshot, setSnapshot] = useState<RatingStreakSnapshot>(() => getRatingStreakSnapshot());
  useEffect(() => {
    const refresh = () => setSnapshot(getRatingStreakSnapshot());
    // The first snapshot can be rendered on the server, where browser-backed
    // feedback is unavailable. Re-read after hydration so saved ratings do not
    // remain displayed as zero until someone rates another title.
    refresh();
    window.addEventListener("reelcase:rating-streak-change", refresh);
    window.addEventListener("reelcase:rating-change", refresh);
    return () => {
      window.removeEventListener("reelcase:rating-streak-change", refresh);
      window.removeEventListener("reelcase:rating-change", refresh);
    };
  }, []);
  const remaining = Math.max(0, snapshot.weeklyGoal - snapshot.thisWeek);
  return <section className="mb-8 rounded-xl border border-border bg-surface p-5 shadow-border sm:p-6" aria-label="Rating streak">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase"><Star className="size-4"/>Rating rhythm</p><h2 className="mt-2 font-display text-2xl text-fg">Small ratings, clearer shelves.</h2><p className="mt-1 text-sm text-muted">{remaining ? `${remaining} more distinct rating${remaining === 1 ? "" : "s"} unlocks this week’s local reward.` : "This week’s local reward is unlocked."}</p></div><div className="rounded-lg bg-elevated px-4 py-3 text-right"><p className="text-xs text-muted">Weekly streak</p><p className="mt-1 font-display text-2xl text-fg">{snapshot.weeklyStreak} week{snapshot.weeklyStreak === 1 ? "" : "s"}</p></div></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-bg/70"><div className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out" style={{ width: `${Math.min(100, snapshot.thisWeek / snapshot.weeklyGoal * 100)}%` }}/></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted"><span>{snapshot.thisWeek} of {snapshot.weeklyGoal} rated this week</span><span>{snapshot.nextReward}</span></div>
    <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted">Weekly goal</span>{RATING_GOALS.map((goal) => <Button key={goal} size="sm" variant={snapshot.weeklyGoal === goal ? "default" : "secondary"} onClick={() => { setRatingWeeklyGoal(goal); setSnapshot(getRatingStreakSnapshot()); }}>{goal} ratings</Button>)}</div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">{snapshot.rewards.map((reward) => <div key={reward.label} className="rounded-md bg-elevated px-3 py-2"><p className="text-sm font-medium text-fg">{reward.earned ? "Earned · " : "Next · "}{reward.label}</p><p className="mt-1 text-xs leading-5 text-muted">{reward.detail}</p></div>)}</div>
  </section>;
}

export { LiveDesk } from "./live-desk";
