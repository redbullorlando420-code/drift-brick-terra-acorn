import { useEffect, useState } from "react";
import { Play, Shuffle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import { TitleRail } from "./browse";
import { getRatingStreakSnapshot, RATING_GOALS, setRatingWeeklyGoal, type RatingStreakSnapshot } from "@/lib/rating-streaks";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";

export function DiscoveryDesk({ videos }: { videos: LibraryVideo[] }) {
  const [seed, setSeed] = useState(1);
  const [picks, setPicks] = useState<LibraryVideo[]>([]);
  const open = useLibrary((s) => s.openVideo);
  useEffect(() => {
    const rotate = () => setSeed((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    rotate();
    const timer = window.setInterval(rotate, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const compute = () => {
      if (cancelled) return;
      // Time-based rotation ensures a fresh mix even when the catalog itself is
      // unchanged. Demonstration media is excluded before scoring.
      let state = seed >>> 0;
      const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
      // Cap the walk on huge catalogs: stride-sample so Home stays snappy.
      const pool = videos.filter((video) => !video.remote?.live && !video.isSample);
      const stride = pool.length > 2_400 ? Math.ceil(pool.length / 2_400) : 1;
      const chosen: Array<{ video: LibraryVideo; score: number }> = [];
      for (let i = 0; i < pool.length; i += stride) {
        const video = pool[i]!;
        const classicFallback = video.collection === "classics" || /classic|noir/i.test(`${video.name} ${video.remote?.channelName ?? ""}`);
        const freshness = Math.max(1, Math.min(8, (video.addedAt - Date.now() + 31_536_000_000) / 3_942_000_000));
        const weight = (video.remote ? 7 : 2) + freshness + (classicFallback ? -6 : 0);
        const entry = { video, score: random() * Math.max(0.25, weight) };
        if (chosen.length < 12) { chosen.push(entry); continue; }
        let weakest = 0;
        for (let index = 1; index < chosen.length; index += 1) if (chosen[index]!.score < chosen[weakest]!.score) weakest = index;
        if (entry.score > chosen[weakest]!.score) chosen[weakest] = entry;
      }
      setPicks(chosen.map((entry) => entry.video));
    };
    const cancelSchedule = scheduleBackgroundWork(compute, { timeoutMs: 400 });
    return () => { cancelled = true; cancelSchedule(); };
  }, [videos, seed]);
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
