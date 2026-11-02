import { useEffect, useState } from "react";
import { ProfileSettingsPackPanel } from './profile-settings-pack-panel';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConsequenceAction } from "./consequence-action";
import { currentProfileId } from "@/lib/local-profile-storage";
import {
  createLocalProfile,
  renameLocalProfile,
  inspectLocalProfile,
  DEFAULT_PROFILE,
  type LocalProfile,
  type ProfilePreview,
} from "@/lib/local-profiles";
import {
  useLocalProfiles,
  refreshLocalProfiles,
  settleLocalProfiles,
  listenProfileControls,
} from "./use-local-profiles";
export function LocalProfilesPanel({ onSwitch }: { onSwitch: (target: string) => Promise<void> }) {
  const registry = useLocalProfiles();
  const profiles: readonly LocalProfile[] =
    registry.status === "ready" ? registry.profiles : [DEFAULT_PROFILE];
  const [name, setName] = useState(""),
    [target, setTarget] = useState(""),
    [preview, setPreview] = useState<ProfilePreview>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [note, setNote] = useState("");
  const active = currentProfileId();
  const [renameTarget, setRenameTarget] = useState(active === "default" ? "" : active),
    [renameName, setRenameName] = useState("");
  useEffect(listenProfileControls, []);
  const review = async () => {
    setBusy(true);
    setError("");
    try {
      setPreview(await inspectLocalProfile());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profile preview could not load.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-label="Local profiles"
      className="mt-5 space-y-4 rounded-lg border border-border bg-elevated p-5"
    >
      <h2
        id="local-profile-heading"
        tabIndex={-1}
        className="scroll-mt-4 font-display text-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Local profiles
      </h2>
      <p className="text-sm leading-6 text-muted">
        Current:{" "}
        <strong className="text-fg">
          {profiles.find((p) => p.id === active)?.name ?? "Selected profile"}
        </strong>
        . Your existing library stays in Default. New profiles start empty, with separate history,
        follows, private tags, drafts, settings and print files. Profiles are local organization,
        not passwords or separate sign-ins.
      </p>
      <p className="text-xs leading-5 text-muted">
        Switching flushes this profile, closes its views, stops pending catalog admission and
        reloads this tab. Other tabs keep their selected profile. Installed native tools, approved
        Companion roots and explicit Watch Room connections remain device services.
      </p>
      {(error || registry.error) && (
        <p role="alert" className="text-sm text-danger">
          {error || registry.error}
        </p>
      )}
      {(registry.status === "error" || error.includes("Retry profile names")) && (
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => {
            setError("");
            refreshLocalProfiles();
          }}
        >
          Retry profile names
        </Button>
      )}
      {note && (
        <p role="status" className="text-sm text-accent">
          {note}
        </p>
      )}
      <Button
        className="min-h-11"
        variant="secondary"
        disabled={busy}
        onClick={() => void review()}
      >
        Review existing profile setup
      </Button>
      {preview && (
        <div
          role="region"
          aria-label="Profile setup preview"
          className="space-y-2 rounded-md bg-bg p-4 text-sm text-muted"
        >
          <p>
            Read-only preview · {preview.preferences} app preference keys ·{" "}
            {preview.databases.length} existing profile databases.
          </p>
          <p>
            Default keeps its original storage in place. Creating or switching profiles does not
            move or delete it.
          </p>
          {preview.databases.map((db) => (
            <p key={db.name}>
              {Object.entries(db.stores)
                .map(([store, count]) => store + ": " + count.toLocaleString())
                .join(" · ")}
            </p>
          ))}
          {preview.measurement && <p>{preview.measurement}</p>}
        </div>
      )}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          setNote("");
          void createLocalProfile(name)
            .then(async (created) => {
              const rows = await settleLocalProfiles();
              if (!rows.some((row) => row.id === created.id))
                throw Error(
                  "The profile was created, but its name is not available yet. Retry profile names.",
                );
              setTarget(created.id);
              setName("");
              setNote("Empty profile created. Review switching below to open it.");
            })
            .catch((e) => setError(e instanceof Error ? e.message : "Profile creation failed."))
            .finally(() => setBusy(false));
        }}
      >
        <Input
          className="min-h-11 min-w-0 basis-full sm:basis-0 sm:flex-1"
          aria-label="New local profile name"
          maxLength={48}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New profile name"
        />
        <Button
          className="min-h-11 w-full sm:w-auto"
          disabled={busy || registry.status !== "ready" || !name.trim()}
          type="submit"
        >
          Create empty profile
        </Button>
      </form>
      <form
        aria-label="Rename local profile"
        className="space-y-3 rounded-md border border-border bg-bg p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (busy || !renameTarget || registry.status !== "ready") return;
          setBusy(true);
          setError("");
          setNote("");
          void renameLocalProfile(renameTarget, renameName)
            .then((renamed) => {
              setRenameName("");
              setNote(
                "Profile renamed to " +
                  renamed.name +
                  ". Its library, history, drafts and selected tabs stay in place.",
              );
            })
            .catch((e) =>
              setError(
                e instanceof Error
                  ? e.message
                  : "The profile name could not be saved. Its previous name was kept.",
              ),
            )
            .finally(() => setBusy(false));
        }}
      >
        <div>
          <h3 className="text-sm font-medium text-fg">Rename a profile</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            Only the label changes. Default keeps its reserved name. Other open tabs update without
            switching libraries.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-xs text-muted">
            Profile
            <select
              aria-label="Profile to rename"
              className="mt-1 min-h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 text-sm text-fg"
              value={renameTarget}
              disabled={busy || registry.status !== "ready"}
              onChange={(event) => {
                setRenameTarget(event.target.value);
                setRenameName("");
                setError("");
              }}
            >
              <option value="">Choose a named profile</option>
              {profiles
                .filter((p) => p.id !== "default")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.id === active ? " (current)" : ""}
                  </option>
                ))}
            </select>
          </label>
          <label className="min-w-0 text-xs text-muted">
            New label
            <Input
              aria-label="New profile label"
              className="mt-1 min-h-11"
              maxLength={48}
              value={renameName}
              disabled={busy || !renameTarget || registry.status !== "ready"}
              placeholder={profiles.find((p) => p.id === renameTarget)?.name ?? "1–48 characters"}
              onChange={(event) => setRenameName(event.target.value)}
            />
          </label>
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="min-h-11 w-full sm:w-auto"
          disabled={busy || registry.status !== "ready" || !renameTarget || !renameName.trim()}
        >
          Save profile label
        </Button>
      </form>
      <ProfileSettingsPackPanel onCreated={created=>{setTarget(created.id);setError('');}}/>
      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Local profile to open"
          className="min-h-11 min-w-0 rounded-md border border-border bg-bg px-3 text-sm"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setPreview(undefined);
          }}
        >
          <option value="">Choose a profile</option>
          {profiles
            .filter((p) => p.id !== active)
            .map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
        </select>
        <ConsequenceAction
          label="Review profile switch"
          title="Switch local profile?"
          confirm="Save and switch profile"
          disabled={!target || busy}
          onConfirm={async () => {
            await review();
            await onSwitch(target);
          }}
        >
          <p>
            This tab will open{" "}
            {profiles.find((p) => p.id === target)?.name ?? "the selected profile"}. Its personal
            data and exports stay separate. This profile’s saved library remains available when you
            switch back.
          </p>
          <p>
            Active pulls and source scans must finish first. A pending catalog read is cancelled;
            accepted disk records remain intact. This action does not copy accounts, native media or
            browser directory grants between profiles.
          </p>
        </ConsequenceAction>
      </div>
    </section>
  );
}
