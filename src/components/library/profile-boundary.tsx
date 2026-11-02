import { useEffect, useState, type ReactNode } from "react";
import { activeLocalProfile, chooseDefaultProfile } from "@/lib/local-profiles";
import { Button } from "@/components/ui/button";
import { currentProfileId } from "@/lib/local-profile-storage";
export function ProfileBoundary({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    void activeLocalProfile().then(
      () => {
        if (alive) setReady(true);
      },
      (e) => {
        if (alive) setError(e instanceof Error ? e.message : "Local profile could not open.");
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  if (ready) return children;
  return (
    <section data-workspace-loading="true" className="min-h-screen bg-bg p-5 text-fg">
      <div className="mx-auto mt-12 max-w-xl space-y-4 rounded-xl border border-border bg-surface p-6">
        <h1 className="font-display text-3xl">
          {error ? "Local profile needs attention" : "Opening your local profile"}
        </h1>
        <p className="text-sm leading-6 text-muted">
          {error || "Checking the selected workspace before loading its library."}
        </p>
        {error && (
          <p className="break-all text-xs text-muted">
            Selected local profile:{" "}
            {currentProfileId() === "default" ? "Default" : currentProfileId()}. This identifier
            stays the same when a profile is renamed.
          </p>
        )}
        {error && (
          <Button className="min-h-11" onClick={chooseDefaultProfile}>
            Return to Default profile
          </Button>
        )}
      </div>
    </section>
  );
}
