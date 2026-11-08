import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Settings2, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentProfileId } from "@/lib/local-profile-storage";
import { switchProfileSafely } from "@/lib/profile-switch";
import { createLocalProfile, renameLocalProfile } from "@/lib/local-profiles";
import {
  getPerformanceMode,
  setPerformanceMode,
  subscribePerformanceProfile,
  type PerformanceMode,
} from "@/lib/performance-profile";
import { useLibrary } from "@/lib/videos/store";
import type { SortKey } from "@/lib/videos/types";
import {
  useLocalProfiles,
  refreshLocalProfiles,
  settleLocalProfiles,
  listenProfileControls,
} from "./use-local-profiles";
import { ConsequenceAction } from "./consequence-action";
import { DeskDisclosure } from "./desk-disclosure";
import { ProfileSettingsPackPanel } from "./profile-settings-pack-panel";
import { ProfileStoragePanel } from "./profile-storage-panel";
import { ProfilePermissionsPanel } from "./profile-permissions-panel";
import { ProfileSwitchInventory } from "./profile-switch-inventory";

const serverMode = () => "adaptive" as const;
const control =
  "min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg";
const action = "h-auto min-h-11 max-w-full whitespace-normal py-2";

export function AccountsSection() {
  const registry = useLocalProfiles(),
    active = currentProfileId();
  const current = registry.profiles.find((profile) => profile.id === active);
  const [name, setName] = useState(""),
    [rename, setRename] = useState<string>();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [note, setNote] = useState("");
  const latch = useRef(false);
  const view = useLibrary((state) => state.view),
    sort = useLibrary((state) => state.sort);
  const hardware = useLibrary((state) => state.hardwareAccel),
    ready = useLibrary((state) => state.hydrated);
  const mode = useSyncExternalStore(subscribePerformanceProfile, getPerformanceMode, serverMode);
  useEffect(listenProfileControls, []);
  const mutate = async (kind: "create" | "rename") => {
    if (latch.current || registry.status !== "ready") return;
    if (kind === "rename" && (!rename?.trim() || rename.trim() === current?.name)) return;
    latch.current = true;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const result =
        kind === "create"
          ? await createLocalProfile(name)
          : await renameLocalProfile(active, rename ?? "");
      // Clear committed inputs before refreshing to prevent duplicate creation on a failed reread.
      if (kind === "create") setName("");
      else setRename(undefined);
      await settleLocalProfiles();
      setNote(
        kind === "create"
          ? result.name + " is ready. Choose Use account to open its empty library."
          : "Account name updated.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Account settings could not be saved.");
    } finally {
      latch.current = false;
      setBusy(false);
    }
  };
  return (
    <section aria-label="Accounts" className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-xl border border-border bg-surface p-5 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Your Realhub</p>
        <h1
          id="local-profile-heading"
          tabIndex={-1}
          className="mt-2 scroll-mt-4 font-display text-4xl text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Accounts
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Choose who is using Realhub and make their setup feel right. These are saved profiles on
          this computer, with separate libraries, follows, history, drafts and preferences.
        </p>
        <p className="mt-2 text-xs leading-5 text-muted">
          Local profiles do not have passwords or separate website sign-ins. Browser permissions and
          installed Companion services stay on this device.
        </p>
      </header>
      {(error || registry.error) && (
        <div
          role="alert"
          className="rounded-lg border border-border bg-surface p-4 text-sm text-danger"
        >
          {error || registry.error}
          <Button
            variant="secondary"
            className={action + " ml-2"}
            onClick={() => {
              setError("");
              refreshLocalProfiles();
            }}
          >
            Retry account list
          </Button>
        </div>
      )}
      {note && (
        <p role="status" className="rounded-lg bg-elevated p-4 text-sm text-accent">
          {note}
        </p>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-5">
          <section aria-label="Choose an account" className="space-y-3">
            <h2 className="font-display text-xl text-fg">Choose an account</h2>
            {registry.status === "loading" && (
              <p role="status" className="text-sm text-muted">
                Loading saved accounts…
              </p>
            )}
            {registry.profiles.map((profile) => (
              <article
                key={profile.id}
                aria-label={"Account " + profile.name}
                data-current-account={profile.id === active || undefined}
                className={
                  "min-w-0 rounded-xl border p-4 " +
                  (profile.id === active ? "border-accent bg-elevated" : "border-border bg-surface")
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-bg text-base font-medium text-accent"
                  >
                    {profile.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-medium text-fg">{profile.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {profile.id === "default" ? "Original library" : "Local profile"}
                    </p>
                  </div>
                  {profile.id === active && (
                    <Check aria-label="Current account" className="size-4 shrink-0 text-accent" />
                  )}
                </div>
                {profile.id === active ? (
                  <p className="mt-3 text-xs font-medium text-accent">Using this account</p>
                ) : (
                  <div className="mt-2">
                    <ConsequenceAction
                      label="Use account"
                      title={"Switch to " + profile.name + "?"}
                      confirm="Save and switch account"
                      disabled={busy || registry.status !== "ready"}
                      onConfirm={() => switchProfileSafely(profile.id)}
                    >
                      <p>
                        This tab will save its current work and open {profile.name}. Other tabs keep
                        their account. Nothing is copied between libraries.
                      </p>
                      <p>
                        Active pulls or source scans must finish before switching. Native files,
                        directory grants and connected device services are not transferred.
                      </p>
                      <ProfileSwitchInventory/>
                    </ConsequenceAction>
                  </div>
                )}
              </article>
            ))}
          </section>
          <form
            aria-label="Create an account"
            className="space-y-3 rounded-xl border border-border bg-surface p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void mutate("create");
            }}
          >
            <h2 className="flex items-center gap-2 text-sm font-medium text-fg">
              <UserPlus aria-hidden="true" className="size-4" />
              Add an account
            </h2>
            <label className="block text-xs text-muted">
              Account name
              <Input
                value={name}
                maxLength={48}
                aria-label="New account name"
                className="mt-2 min-h-11"
                placeholder="e.g. notyoda"
                disabled={busy || registry.status !== "ready"}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <p className="text-xs leading-5 text-muted">
              Starts empty. Your existing collection stays in Default.
            </p>
            <Button
              type="submit"
              className={action}
              disabled={busy || !name.trim() || registry.status !== "ready"}
            >
              {busy ? "Saving…" : "Create account"}
            </Button>
          </form>
        </div>
        <div className="min-w-0 space-y-5 xl:col-span-2">
          <section
            aria-label="Current account settings"
            className="space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <UserRound aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="text-xs text-muted">Current account</p>
                <h2 className="mt-1 break-words font-display text-2xl text-fg">
                  {current?.name ?? "Selected profile"}
                </h2>
              </div>
            </div>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void mutate("rename");
              }}
            >
              <label className="block text-sm text-fg">
                Display name
                <Input
                  aria-label="Account display name"
                  className="mt-2 min-h-11"
                  value={rename ?? current?.name ?? ""}
                  maxLength={48}
                  placeholder={current?.name}
                  disabled={active === "default" || busy || registry.status !== "ready"}
                  onChange={(event) => setRename(event.target.value)}
                />
              </label>
              {active === "default" ? (
                <p className="text-xs leading-5 text-muted">
                  Default keeps its name and original library. Add a named account for your own
                  setup.
                </p>
              ) : (
                <>
                  <p className="text-xs leading-5 text-muted">
                    Renaming keeps your library and settings in the same account.
                  </p>
                  <Button
                    type="submit"
                    className={action}
                    disabled={
                      busy ||
                      !rename?.trim() ||
                      rename.trim() === current?.name ||
                      registry.status !== "ready"
                    }
                  >
                    Save account name
                  </Button>
                </>
              )}
            </form>
            <div className="border-t border-border pt-5">
              <h3 className="flex items-center gap-2 text-sm font-medium text-fg">
                <Settings2 aria-hidden="true" className="size-4" />
                Preferences for this account
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                Changes apply to this profile. Other accounts keep their own choices.
              </p>
              <fieldset disabled={!ready} className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                <label className="min-w-0 space-y-2 text-xs text-muted">
                  <span>Library layout</span>
                  <select
                    aria-label="Account library layout"
                    className={control}
                    value={view}
                    onChange={(event) =>
                      useLibrary.getState().setView(event.target.value as "grid" | "list")
                    }
                  >
                    <option value="grid">Poster grid</option>
                    <option value="list">List</option>
                  </select>
                </label>
                <label className="min-w-0 space-y-2 text-xs text-muted">
                  <span>Library sort</span>
                  <select
                    aria-label="Account library sort"
                    className={control}
                    value={sort}
                    onChange={(event) =>
                      useLibrary.getState().setSort(event.target.value as SortKey)
                    }
                  >
                    {[
                      ["added", "Date added"],
                      ["name", "Name"],
                      ["recent", "Recently watched"],
                      ["duration", "Duration"],
                      ["size", "File size"],
                      ["type", "File type"],
                      ["folder", "Folder"],
                      ["path", "Path"],
                    ].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0 space-y-2 text-xs text-muted">
                  <span>Performance</span>
                  <select
                    aria-label="Account performance preset"
                    className={control}
                    value={mode}
                    onChange={(event) => setPerformanceMode(event.target.value as PerformanceMode)}
                  >
                    <option value="adaptive">Adaptive</option>
                    <option value="low-memory">Low memory</option>
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-3 text-sm text-fg">
                  <input
                    type="checkbox"
                    checked={hardware}
                    onChange={(event) =>
                      useLibrary.getState().setHardwareAccel(event.target.checked)
                    }
                  />
                  Prefer hardware playback
                </label>
              </fieldset>
              {!ready && (
                <p role="status" className="mt-3 text-xs text-muted">
                  Loading saved preferences…
                </p>
              )}
            </div>
          </section>
          <DeskDisclosure title="Storage by profile" description="Compare protected data, print files and disposable artwork.">
            <ProfileStoragePanel profiles={registry.profiles} active={active}/>
          </DeskDisclosure>
          <DeskDisclosure title="Profile permissions" description="Review saved browser folder access and optional app permissions.">
            <ProfilePermissionsPanel/>
          </DeskDisclosure>
          <DeskDisclosure
            title="Portable settings"
            description="Copy selected preferences into a new empty account."
          >
            <ProfileSettingsPackPanel
              onCreated={(profile) =>
                setNote(
                  profile.name + " is ready in the account list. Your current account stayed open.",
                )
              }
            />
          </DeskDisclosure>
          <section
            aria-label="More account settings"
            className="rounded-xl border border-border bg-surface p-5"
          >
            <h2 className="text-sm font-medium text-fg">Library and device settings</h2>
            <p className="mt-2 text-xs leading-5 text-muted">
              Backups, storage recovery, source permissions and provider connections remain in
              Settings. Saved creator follows belong to the account currently open.
            </p>
            <Button
              variant="secondary"
              className={action + " mt-4"}
              onClick={() => {
                const state = useLibrary.getState();
                state.setQuery("");
                state.setSource("settings");
              }}
            >
              Open library and device settings
            </Button>
          </section>
        </div>
      </div>
    </section>
  );
}
