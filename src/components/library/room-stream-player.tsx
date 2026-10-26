import type { PlayerReadinessStatus } from '@/lib/multiplayer/room-player-readiness';
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw } from "lucide-react";
import { roomSeekKey } from '@/lib/multiplayer/room-player-recovery';

/** Incoming RTC media stays in the browser's bounded decoder, never a file Blob. */
export function RoomStreamPlayer({ stream, title, playing, position, duration, onPlayback, onSeek, onResync, onReadiness }: {
  stream: MediaStream; title: string; playing: boolean; position: number; duration?: number;
  onPlayback: (playing:boolean)=>void; onSeek:(position:number)=>void; onResync:()=>void;onReadiness?:(status:PlayerReadinessStatus)=>void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLElement>(null);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<number|null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    setWaiting(false);setNotice("");setNeedsPlay(false);setDraft(null);
    return () => { video.pause(); video.srcObject = null; };
  }, [stream, reload]);
  useEffect(()=>{
    const video=ref.current;if(!video)return;
    let active=true;
    if(playing) void video.play().catch((error:unknown)=>{if(!active||error instanceof DOMException&&error.name==="AbortError")return;const blocked=error instanceof DOMException&&error.name==="NotAllowedError";setNeedsPlay(blocked);onReadiness?.(blocked?"blocked":"error");if(!blocked)setNotice("This device could not start the host stream. Reload this player to try again.");});
    else {video.pause();setNeedsPlay(false);}
    return()=>{active=false;};
  },[stream,playing,reload]);
  const clock=(seconds:number)=>{const time=Math.floor(Math.max(0,Number.isFinite(seconds)?seconds:0));return `${Math.floor(time/60)}:${String(time%60).padStart(2,"0")}`;};
  const seconds=typeof duration==="number"&&Number.isFinite(duration)&&duration>0?duration:undefined;
  const seek=(value:number)=>{setDraft(null);onSeek(Math.max(0,Math.min(seconds??12*60*60,value)));};
  return <section ref={stage} aria-label="Shared local playback" className="flex w-full flex-col bg-bg">
    <div className="relative">
      <video ref={ref} aria-label={`Shared local video: ${title}`} data-room-stream playsInline className="aspect-video w-full bg-bg" onPlaying={() => {setNeedsPlay(false);setWaiting(false);onReadiness?.("playing");}} onCanPlay={()=>onReadiness?.("ready")} onPause={()=>onReadiness?.("paused")} onEnded={()=>onReadiness?.("ended")} onWaiting={()=>{setWaiting(true);onReadiness?.("buffering");}} onStalled={()=>{setWaiting(true);onReadiness?.("buffering");}} onError={()=>{onReadiness?.("error");setNotice("This device could not play the host stream. Request resync to try again.");}} onVolumeChange={()=>setMuted(Boolean(ref.current?.muted))}/>
      {needsPlay && playing && <Button className="absolute bottom-4 left-4 min-h-11" onClick={() => { void ref.current?.play().catch(() => setNeedsPlay(true)); }}><Play className="size-4" />Play on this device</Button>}
    </div>
    <div className="space-y-2 border-t border-border bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" className="min-h-11" onClick={()=>onPlayback(!playing)}>
          {playing?<Pause className="size-4"/>:<Play className="size-4"/>}{playing?"Pause together":"Resume together"}
        </Button>
        <span className="text-xs text-muted" aria-label="Shared playback time">{clock(position)}{seconds?` / ${clock(seconds)}`:""}</span>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={muted?"Unmute this device":"Mute this device"} onClick={()=>{const video=ref.current;if(video)video.muted=!muted;}}>{muted?<VolumeX className="size-4"/>:<Volume2 className="size-4"/>}</Button>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Fullscreen shared video" onClick={()=>{if(stage.current?.requestFullscreen)void stage.current.requestFullscreen().catch(()=>setNotice("Fullscreen is unavailable on this device."));else setNotice("Fullscreen is unavailable on this device.");}}><Maximize className="size-4"/></Button>
        <Button variant="ghost" size="sm" className="min-h-11" onClick={onResync}><RefreshCw className="size-3"/>Resync video</Button>
        <Button variant="ghost" size="sm" className="min-h-11" onClick={() => {onReadiness?.("loading");setReload(value => value + 1);}}><RefreshCw className="size-3" />Reload this player</Button>
      </div>
      {seconds&&<input type="range" min={0} max={seconds} step={0.25} value={Math.min(seconds,draft??position)} aria-label="Seek shared video" aria-valuetext={clock(draft??position)} className="min-h-11 w-full accent-accent" onChange={event=>setDraft(event.currentTarget.valueAsNumber)} onPointerUp={event=>seek(event.currentTarget.valueAsNumber)} onPointerCancel={()=>setDraft(null)} onKeyDown={event=>{const next=roomSeekKey(event.key,event.currentTarget.valueAsNumber,seconds);if(next!==undefined){event.preventDefault();seek(next);}}} onBlur={event=>{if(draft!==null)seek(event.currentTarget.valueAsNumber);}}/>}
      <p className="text-xs leading-5 text-muted">Play, pause and seek affect the room. Sound and fullscreen affect only this device.</p>
      {(notice||waiting&&playing)&&<p role="status" className="text-xs text-accent">{notice||"Waiting for the host’s video frames…"}</p>}
    </div>
  </section>;
}
