import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeGuestOffset } from "@/lib/multiplayer/room-clock";

export function RoomGuestTiming({ offset, position, adjustsPlayback, onChange }: {
  offset: number; position: number; adjustsPlayback: boolean; onChange: (seconds: number) => void;
}) {
  const [draft, setDraft] = useState(String(offset));
  useEffect(() => setDraft(String(offset)), [offset]);
  const apply = () => {
    if (!draft.trim() || !Number.isFinite(Number(draft))) return;
    const value = normalizeGuestOffset(Number(draft));
    setDraft(String(value)); onChange(value);
  };
  const valid = draft.trim() !== "" && Number.isFinite(Number(draft));
  return <section aria-label="My playback timing" className="mt-4 rounded-md border border-border bg-bg/45 p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-medium text-fg">My playback timing</h3>
      <span className="text-xs text-accent" data-guest-offset={offset}>{offset > 0 ? "+" : ""}{offset.toFixed(2)}s · this device</span>
    </div>
    <p className="mt-2 text-xs leading-5 text-muted">Behind the host? Move ahead. Ahead of the host? Move behind. Saved on this device; other viewers keep their timing.</p>
    <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={event => {event.preventDefault(); apply();}}>
      <label className="min-w-0 flex-1 text-xs text-muted">Offset in seconds
        <Input type="number" min={-30} max={30} step={0.25} aria-label="My timing offset in seconds" className="mt-1 min-h-11" value={draft} onChange={event=>setDraft(event.target.value)}/>
      </label>
      <Button type="submit" variant="secondary" size="sm" className="min-h-11" disabled={!valid}>Apply timing</Button>
    </form>
    <div className="mt-2 flex flex-wrap gap-1">
      <Button variant="ghost" size="sm" className="min-h-11" disabled={offset <= -30} onClick={()=>onChange(offset-0.25)}>Behind 0.25s</Button>
      <Button variant="ghost" size="sm" className="min-h-11" disabled={offset >= 30} onClick={()=>onChange(offset+0.25)}>Ahead 0.25s</Button>
      <Button variant="ghost" size="sm" className="min-h-11" disabled={offset===0} onClick={()=>onChange(0)}>Reset timing</Button>
    </div>
    <p className="mt-2 text-xs text-fg" aria-label="My adjusted timer">Your timer {Math.floor(position/60)}:{String(Math.floor(position%60)).padStart(2,"0")}</p>
    <p className="mt-1 text-xs leading-5 text-muted">{adjustsPlayback ? "Adjusts your video and timer. Shared play, pause and seek still control the room." : "Timer correction only for host streams, live feeds and clips. Streamed frames cannot be seeked independently; a matching local copy supports video adjustment."}</p>
  </section>;
}
