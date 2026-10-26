import { useCallback, useEffect, useRef, useState } from "react";
import {
  recordYoutubeEmbedEvidence,
  type YoutubeEmbedEvidence,
  type YoutubeEmbedPhase,
} from "@/lib/multiplayer/room-youtube-diagnostics";
export function useYoutubeEmbedDiagnostics(room: string, videoId: string, reload: number) {
  const [rows, setRows] = useState<YoutubeEmbedEvidence[]>([]);
  const scope = room + ":" + videoId + ":" + reload,
    latest = useRef(scope);
  latest.current = scope;
  useEffect(() => {
    setRows([]);
  }, [room]);
  const record = useCallback(
    (phase: YoutubeEmbedPhase, code?: unknown) => {
      if (!room || !videoId || latest.current !== scope) return;
      setRows((previous) => recordYoutubeEmbedEvidence(previous, videoId, phase, code, Date.now()));
    },
    [scope, videoId],
  );
  useEffect(() => {
    record("loading");
  }, [record]);
  const clearEarlier = useCallback(
    () => setRows((previous) => previous.filter((row) => row.videoId === videoId)),
    [videoId],
  );
  return { rows, record, clearEarlier };
}
