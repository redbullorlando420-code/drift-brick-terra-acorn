import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import type { FollowedChannel } from "@/lib/videos/types";
import {
  DEFAULT_TWITCH_PULL_POLICY,
  twitchPullPolicy,
  twitchPullPolicySummary,
} from "@/lib/videos/twitch-pull-policy";
export function TwitchPolicySummary({ follows }: { follows: FollowedChannel[] }) {
  const summary = twitchPullPolicySummary(follows);
  if (!summary.creators) return null;
  return (
    <p className="mt-3 text-xs leading-5 text-muted" aria-label="Twitch automatic policy coverage">
      Automatic policy skips: {summary.clipsSkipped} clip sources · {summary.vodsSkipped} VOD
      sources · {summary.contentSkipped} creators skip all content. These are deliberate exclusions,
      separate from failed or not-yet-checked creators. Live checks remain enabled.
    </p>
  );
}
export function TwitchPullPolicyControls({ channel }: { channel: FollowedChannel }) {
  const save = useLibrary((s) => s.setTwitchPullPolicy),
    policy = twitchPullPolicy(channel);
  const update = (patch: Partial<typeof policy>) => save(channel.id, { ...policy, ...patch });
  const defaults = policy.clips && policy.vods && policy.priority === "normal";
  return (
    <fieldset
      className="space-y-3 rounded-md border border-border bg-bg/40 p-3"
      aria-label="Automatic Twitch pull policy"
    >
      <legend className="px-1 text-sm font-medium text-fg">Automatic content pulls</legend>
      <label className="flex min-h-11 items-center gap-3 text-sm text-fg">
        <input
          type="checkbox"
          className="size-5 accent-accent"
          checked={policy.vods}
          onChange={(e) => update({ vods: e.target.checked })}
        />
        Include VODs
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm text-fg">
        <input
          type="checkbox"
          className="size-5 accent-accent"
          checked={policy.clips}
          onChange={(e) => update({ clips: e.target.checked })}
        />
        Include clips
      </label>
      <label className="block text-xs text-muted">
        Automatic priority
        <select
          aria-label="Automatic Twitch priority"
          className="mt-2 min-h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg"
          value={policy.priority}
          onChange={(e) => update({ priority: e.target.value as typeof policy.priority })}
        >
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </label>
      <p className="text-xs leading-5 text-muted">
        Saved automatically. Applies to future automatic content pulls; live checks stay
        independent. Manual creator, archive and clip actions still request their selected content.
        Existing saved videos stay in your library.
      </p>
      <p className="text-xs leading-5 text-muted">
        When all tiers have eligible creators, seven automatic turns give High four slots, Normal
        two and Low one. Each tier rotates oldest first; empty tiers share their slots. Default:
        VODs and clips on, Normal priority.
      </p>
      {!policy.vods && !policy.clips && (
        <p role="status" className="text-xs leading-5 text-accent">
          Skipped by policy for automatic content. Live checks and manual pulls remain available.
        </p>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="min-h-11"
        disabled={defaults}
        onClick={() => save(channel.id, { ...DEFAULT_TWITCH_PULL_POLICY })}
      >
        Restore default pull policy
      </Button>
    </fieldset>
  );
}
