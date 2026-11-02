import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPerformanceMode } from "@/lib/performance-profile";
import { useLibrary } from "@/lib/videos/store";
import {
  createConfiguredLocalProfile,
  localProfileSource,
  type LocalProfile,
} from "@/lib/local-profiles";
import {
  PROFILE_SETTING_FIELDS,
  PROFILE_SETTINGS_LIMIT,
  captureProfileSettings,
  makeProfileSettingsPack,
  parseProfileSettingsPack,
  selectProfileSettings,
  type ProfileSettingKey,
  type ProfileSettingsPack,
} from "@/lib/profile-settings-pack";
import { settleLocalProfiles } from "./use-local-profiles";

export function ProfileSettingsPackPanel({
  onCreated,
}: {
  onCreated: (profile: LocalProfile) => void;
}) {
  const input = useRef<HTMLInputElement>(null),
    latch = useRef(false),
    generation = useRef(0);
  const [pack, setPack] = useState<ProfileSettingsPack>(),
    [mode, setMode] = useState<"export" | "import">("export");
  const [selected, setSelected] = useState<ProfileSettingKey[]>([]),
    [name, setName] = useState(""),
    [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [note, setNote] = useState("");
  const stage = (value: ProfileSettingsPack, nextMode: "export" | "import") => {
    setPack(value);
    setMode(nextMode);
    setSelected(Object.keys(value.settings) as ProfileSettingKey[]);
    setReviewed(false);
    setError("");
    setNote("Review only. No profile settings have changed.");
  };
  const load = async (file: File) => {
    const ticket = ++generation.current;
    setPack(undefined);
    setError("");
    setNote("");
    try {
      if (file.size > PROFILE_SETTINGS_LIMIT)
        throw Error("Profile settings packs are limited to 32 KiB.");
      const value = parseProfileSettingsPack(await file.text());
      if (ticket === generation.current) stage(value, "import");
    } catch (e) {
      if (ticket === generation.current)
        setError(e instanceof Error ? e.message : "The settings pack could not be read.");
    }
  };
  const exportCurrent = async () => {
    const ticket = ++generation.current;
    setPack(undefined);
    setReviewed(false);
    setError("");
    try {
      const state = useLibrary.getState();
      if (!state.hydrated)
        throw Error("Wait for saved preferences to finish loading, then try again.");
      const settings = captureProfileSettings({ ...state, performanceMode: getPerformanceMode() }),
        source = await localProfileSource();
      if (ticket === generation.current) stage(makeProfileSettingsPack(source, settings), "export");
    } catch (e) {
      if (ticket === generation.current)
        setError(e instanceof Error ? e.message : "Settings could not be prepared.");
    }
  };
  const create = async () => {
    if (
      latch.current ||
      !pack ||
      mode !== "import" ||
      !reviewed ||
      !selected.length ||
      !name.trim()
    )
      return;
    latch.current = true;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const profile = await createConfiguredLocalProfile(
        name,
        selectProfileSettings(pack.settings, selected),
      );
      setPack(undefined);
      setName("");
      setReviewed(false);
      // The registry commit already notifies this shared observer. Wait for that
      // exact read rather than announcing a switch target before it is visible.
      await settleLocalProfiles();
      onCreated(profile);
      setNote(
        "Created " +
          profile.name +
          " with the reviewed settings. Use the profile switch below when ready; this tab stayed in its current profile.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The new profile could not be prepared. Existing profiles were kept.",
      );
    } finally {
      latch.current = false;
      setBusy(false);
    }
  };
  return (
    <section
      aria-label="Portable profile settings"
      className="space-y-3 rounded-md border border-border bg-bg p-4"
    >
      <h3 className="text-sm font-medium text-fg">Portable profile settings</h3>
      <p className="text-xs leading-5 text-muted">
        Copy selected library layout, sort, performance preset and hardware playback preferences to
        a new empty profile. Accounts, follows, history, tags, ratings, private settings, file
        permissions, endpoints and native services are excluded. Existing profiles are never
        overwritten.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="h-auto min-h-11 max-w-full whitespace-normal py-2"
          disabled={busy}
          onClick={() => void exportCurrent()}
        >
          Review settings to export
        </Button>
        <Button
          variant="secondary"
          className="h-auto min-h-11 max-w-full whitespace-normal py-2"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          Inspect settings pack
        </Button>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          aria-label="Profile settings pack file"
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void load(file);
            event.target.value = "";
          }}
        />
      </div>
      {pack && (
        <div
          role="region"
          aria-label="Settings pack review"
          className="space-y-3 rounded-md bg-elevated p-4"
        >
          <p className="break-words text-sm">
            Source profile: <strong>{pack.sourceProfile.name}</strong> ·{" "}
            {new Date(pack.exportedAt).toLocaleDateString()}
          </p>
          <p className="text-xs leading-5 text-muted">
            {mode === "export"
              ? "Download only the checked settings. This does not change this profile."
              : "Only checked settings will seed a new empty profile. The source label cannot select a destination or copy personal activity. Unchecked fields use normal defaults."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(pack.settings) as ProfileSettingKey[]).map((key) => (
              <label key={key} className="flex min-h-11 min-w-0 items-center gap-3 text-sm text-fg">
                <input
                  type="checkbox"
                  checked={selected.includes(key)}
                  disabled={busy}
                  onChange={(event) => {
                    setSelected((previous) =>
                      event.target.checked
                        ? [...previous, key]
                        : previous.filter((value) => value !== key),
                    );
                    setReviewed(false);
                  }}
                />
                <span className="min-w-0 break-words">
                  {PROFILE_SETTING_FIELDS[key].label}: <strong>{String(pack.settings[key])}</strong>
                </span>
              </label>
            ))}
          </div>
          {mode === "export" ? (
            <Button
              className="h-auto min-h-11 max-w-full whitespace-normal py-2"
              disabled={busy || !selected.length}
              onClick={() => {
                try {
                  const value = makeProfileSettingsPack(
                      pack.sourceProfile,
                      selectProfileSettings(pack.settings, selected),
                    ),
                    url = URL.createObjectURL(
                      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
                    ),
                    link = document.createElement("a");
                  link.href = url;
                  link.download = "realhub-profile-settings.json";
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  setNote("Selected settings downloaded. No personal library data was included.");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Export failed.");
                }
              }}
            >
              Download selected settings
            </Button>
          ) : (
            <>
              <label className="block text-xs text-muted">
                Destination name
                <Input
                  aria-label="New settings profile name"
                  maxLength={48}
                  value={name}
                  disabled={busy}
                  className="mt-1 min-h-11"
                  placeholder="Name for a new empty profile"
                  onChange={(event) => {
                    setName(event.target.value);
                    setReviewed(false);
                  }}
                />
              </label>
              <p className="break-words text-sm">
                Destination: <strong>{name.trim() || "Choose a new profile name"}</strong> · a new
                local profile
              </p>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={reviewed}
                  disabled={busy}
                  onChange={(event) => setReviewed(event.target.checked)}
                />
                I reviewed the selected settings and new destination
              </label>
              <Button
                className="h-auto min-h-11 max-w-full whitespace-normal py-2"
                disabled={busy || !reviewed || !selected.length || !name.trim()}
                onClick={() => void create()}
              >
                {busy ? "Creating configured profile…" : "Create profile with selected settings"}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            className="h-auto min-h-11 max-w-full whitespace-normal py-2"
            disabled={busy}
            onClick={() => {
              generation.current++;
              setPack(undefined);
              setReviewed(false);
              setNote("Settings review discarded. No profile settings changed.");
            }}
          >
            Discard settings review
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {note && (
        <p role="status" className="text-sm leading-6 text-muted">
          {note}
        </p>
      )}
    </section>
  );
}
