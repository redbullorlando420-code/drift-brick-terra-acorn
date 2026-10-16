import { useEffect, useState, type RefObject } from "react";

type CaptureVideo = HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };

export function useRoomLocalStream(ref: RefObject<HTMLVideoElement | null>, source: string, enabled: boolean, publish: (stream: MediaStream | null) => void) {
  const [captured, setCaptured] = useState<{source:string;id:string}|null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    setCaptured(null);
    setStatus("");
    const video = ref.current as CaptureVideo | null;
    if (!enabled || !source || !video) { publish(null); return; }
    const capture = video.captureStream ?? video.mozCaptureStream;
    if (!capture) { setStatus("This host browser cannot stream local playback. Guests can select a matching file instead."); return; }
    let stream: MediaStream;
    try { stream = capture.call(video); }
    catch { setStatus("Local streaming is unavailable for this file. Guests can select a matching file instead."); return; }
    const update = () => publish(stream);
    stream.addEventListener("addtrack", update);
    stream.addEventListener("removetrack", update);
    publish(stream);
    setCaptured({source,id:stream.id});
    setStatus("Local playback streams directly to connected guests. Keep the host player open.");
    return () => {
      stream.removeEventListener("addtrack", update);
      stream.removeEventListener("removetrack", update);
      publish(null);
      for (const track of stream.getTracks()) track.stop();
    };
  }, [enabled, publish, ref, source]);
  return { streamId:captured?.source===source?captured.id:"", status };
}
