import { useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pullsPaused, setPullsPaused, subscribePullControl } from "@/lib/pull-control";
export function PullPauseButton() {
  const paused = useSyncExternalStore(subscribePullControl, pullsPaused, () => false);
  return <Button size="sm" variant="secondary" aria-pressed={paused} onClick={() => setPullsPaused(!paused)} title={paused ? "Resume queued pulls and automatic checks" : "Pause new pull requests and catalog updates. A request already sent finishes before waiting."}>
    {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
    {paused ? "Resume pulls" : "Pause pulls"}
  </Button>;
}
