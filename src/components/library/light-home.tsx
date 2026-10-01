import { ArrowRight, Heart, LayoutDashboard, Play, Settings2, Youtube } from "lucide-react";
import { useLibrary } from "@/lib/videos/store";

const destinations = [
  { id: "landing", title: "Landing page", detail: "The full discovery experience, recommendations, and shelves.", icon: LayoutDashboard },
  { id: "youtube", title: "YouTube", detail: "Creators and your saved video catalog.", icon: Youtube },
  { id: "favorites", title: "Favorites", detail: "All your hearts and likes in one place.", icon: Heart },
  { id: "continue", title: "Continue watching", detail: "Pick up where you left off.", icon: Play },
  { id: "settings", title: "Settings", detail: "Control pulling, storage, and playback.", icon: Settings2 },
] as const;

/** Startup and recovery surface: no catalog scans, artwork, media, or recommendations. */
export function LightHome() {
  const setSource = useLibrary(s => s.setSource);
  return <section aria-label="Quick Home" className="mx-auto max-w-5xl py-6 sm:py-12">
    <p className="text-xs font-medium uppercase tracking-wide text-accent">Realhub</p>
    <h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">Home</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-muted">A quiet place to start. Open a workspace, or visit Landing page for the full experience.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {destinations.map(({ id, title, detail, icon: Icon }) => <button key={id} type="button" onClick={() => setSource(id)} className="flex min-h-32 items-start gap-4 rounded-xl border border-border bg-surface p-5 text-left hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent">
        <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-accent" />
        <span className="min-w-0 flex-1"><span className="block font-display text-xl text-fg">{title}</span><span className="mt-2 block text-sm leading-5 text-muted">{detail}</span></span>
        <ArrowRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted" />
      </button>)}
    </div>
  </section>;
}
