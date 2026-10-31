import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listWorkspaceDocuments, signalRevisions } from "@/lib/videos/persist";
import { createLocalId } from "@/lib/local-id";
import {
  SignalConflictError,
  rebaseSignalEdit,
  type SignalProfileRevision,
} from "@/lib/stream-signal-revisions";
import {
  DEFAULT_SIGNAL_PROFILE,
  generateSignalPack,
  normalizeSignalProfile,
  readSignalPack,
  signalOwnerPrefix,
  type SignalPack,
  type SignalProfile,
  type SignalEditHistory,
} from "@/lib/stream-signal";
type Pending = {
  key: string;
  value: SignalPack | SignalProfile;
  expected: number;
  base?: SignalPack | SignalProfile;
  nonce: string;
};
type Conflict = {
  key: string;
  current: SignalPack | SignalProfileRevision;
  fullSnapshot?: boolean;
};
/** Small revision-checked documents; recovery replay uses the normal conflict checks. */
export function useStreamSignal(owner: string) {
  const prefix = signalOwnerPrefix(owner),
    repository = useMemo(() => signalRevisions(owner), [owner]);
  const recoveryKey = useMemo(() => prefix + "pending:" + createLocalId("editor:"), [prefix]);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [profile, setProfile] = useState<SignalProfile>(DEFAULT_SIGNAL_PROFILE);
  const [pack, setPack] = useState<SignalPack | null>(null),
    [archive, setArchive] = useState<SignalPack[]>([]),
    [older, setOlder] = useState(false),
    [cursors, setCursors] = useState<string[]>([]),
    [paging, setPaging] = useState(false);
  const [dirty, setDirty] = useState(false),
    [saving, setSaving] = useState(false),
    [conflict, setConflict] = useState<Conflict | null>(null),
    [remoteChanged, setRemoteChanged] = useState(false);
  const pending = useRef(new Map<string, Pending>()),
    writing = useRef<Promise<void> | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    alive = useRef(true),
    ticket = useRef(0);
  const packRef = useRef(pack),
    profileBase = useRef<SignalProfileRevision>({
      version: 2,
      revision: 0,
      profile: DEFAULT_SIGNAL_PROFILE,
    });
  packRef.current = pack;
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const previousMirrors = useRef<Array<{ key: string; text: string }>>([]);
  const mirror = useCallback(() => {
    try {
      if (!pending.current.size) {
        localStorage.removeItem(recoveryKey);
        return;
      }
      const text = JSON.stringify({ version: 2, rows: [...pending.current.values()] });
      if (text.length > 1_000_000)
        throw Error(
          "Recovery mirror is full. Keep this tab open and save or export the current pack.",
        );
      localStorage.setItem(recoveryKey, text);
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error
            ? e.message
            : "Draft recovery mirror unavailable. Keep this tab open until Save succeeds.",
        );
    }
  }, [recoveryKey]);
  const publishSaved = useCallback(
    (row: Pending, saved: SignalPack | SignalProfileRevision) => {
      const newer = pending.current.get(row.key);
      if (newer === row) pending.current.delete(row.key);
      else if (newer)
        pending.current.set(row.key, {
          ...newer,
          expected: saved.revision ?? 0,
          base: "version" in saved ? saved.profile : saved,
        });
      if (!alive.current) return;
      if (row.key === prefix + "profile") {
        profileBase.current = saved as SignalProfileRevision;
        if (!pending.current.has(row.key)) setProfile((saved as SignalProfileRevision).profile);
      } else {
        const next = saved as SignalPack,
          apply = (old: SignalPack) =>
            pending.current.has(row.key)
              ? {
                  ...old,
                  revision: next.revision,
                  draftRevisions: next.draftRevisions,
                  history: next.history,
                }
              : next;
        setPack((old) => (old?.id === next.id ? apply(old) : old));
        setArchive((rows) => rows.map((old) => (old.id === next.id ? apply(old) : old)));
      }
    },
    [prefix],
  );
  const acknowledgeMirrors = useCallback(() => {
    for (const previous of previousMirrors.current) {
      try {
        if (localStorage.getItem(previous.key) === previous.text)
          localStorage.removeItem(previous.key);
      } catch {
        /* Optional acknowledged mirror cleanup. */
      }
    }
    previousMirrors.current = [];
  }, []);
  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (writing.current) return writing.current;
    if (!pending.current.size) {
      mirror();
      acknowledgeMirrors();
      return;
    }
    if (alive.current) setSaving(true);
    const job = (async () => {
      while (pending.current.size) {
        for (const row of [...pending.current.values()]) {
          if (pending.current.get(row.key) !== row) continue;
          const saved = await repository.save(row.key, row.value, row.expected);
          publishSaved(row, saved);
        }
      }
      mirror();
      acknowledgeMirrors();
      if (alive.current) {
        setDirty(false);
        setError("");
        setConflict(null);
        setRemoteChanged(false);
      }
    })();
    writing.current = job;
    try {
      await job;
    } catch (e) {
      mirror();
      if (alive.current) {
        if (e instanceof SignalConflictError)
          setConflict({
            key: e.key,
            current: e.current,
            fullSnapshot: !pending.current.get(e.key)?.base,
          });
        setError(
          "Could not save Stream Signal. " +
            (e instanceof Error ? e.message : "Keep this tab open or export your pack."),
        );
      }
      throw e;
    } finally {
      writing.current = null;
      if (alive.current) {
        setSaving(false);
        setDirty(pending.current.size > 0);
      }
    }
  }, [repository, publishSaved, mirror, acknowledgeMirrors]);
  const queue = useCallback(
    (key: string, value: Pending["value"], base: Pending["base"], expected: number) => {
      if (!pending.current.has(key) && pending.current.size >= 8) {
        setError("Save pending packs before editing another pack.");
        return false;
      }
      const prior = pending.current.get(key);
      pending.current.set(key, {
        key,
        value,
        base: prior?.base ?? base,
        expected: prior?.expected ?? expected,
        nonce: createLocalId("edit:"),
      });
      setDirty(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void flush().catch(() => {});
      }, 450);
      return true;
    },
    [flush],
  );
  const loadPage = useCallback(
    async (nextCursors: string[], flushFirst = true) => {
      const request = ++ticket.current;
      setPaging(true);
      try {
        if (flushFirst) await flush();
        const rows = await listWorkspaceDocuments(prefix + "pack:", nextCursors.at(-1)),
          values = rows.slice(0, 8).map((row) => readSignalPack(row.value));
        if (!alive.current || request !== ticket.current) return;
        setArchive(values);
        setOlder(rows.length > 8);
        setCursors(nextCursors);
        return values;
      } catch (e) {
        if (alive.current) setError(e instanceof Error ? e.message : "Could not read saved packs.");
      } finally {
        if (alive.current && request === ticket.current) setPaging(false);
      }
    },
    [prefix, flush],
  );
  const refresh = useCallback(async () => {
    if (pending.current.size) {
      setRemoteChanged(true);
      return;
    }
    const savedProfile = await repository.profile(),
      current = packRef.current,
      selected = current ? await repository.read(prefix + current.id) : undefined,
      values = await loadPage([], false);
    if (!alive.current || pending.current.size) return;
    profileBase.current = savedProfile;
    setProfile(savedProfile.profile);
    setPack(selected ? readSignalPack(selected) : (values?.[0] ?? null));
    setRemoteChanged(false);
  }, [repository, prefix, loadPage]);
  useEffect(() => {
    alive.current = true;
    void (async () => {
      try {
        const sources = new Set([prefix + "pending"]);
        try {
          const previous = sessionStorage.getItem(prefix + "recovery-pointer");
          if (previous?.startsWith(prefix + "pending:")) sources.add(previous);
          sessionStorage.setItem(prefix + "recovery-pointer", recoveryKey);
        } catch {
          /* IDB remains usable. */
        }
        for (const key of sources) {
          let text: string | null = null;
          try {
            text = localStorage.getItem(key);
          } catch {
            /* Optional mirror. */
          }
          if (!text) continue;
          try {
            if (text.length > 1_000_000) throw Error("Recovery document exceeds its budget.");
            const raw = JSON.parse(text),
              rows = Array.isArray(raw) ? raw : raw?.version === 2 ? raw.rows : undefined;
            if (!Array.isArray(rows) || rows.length > 8)
              throw Error("Unsupported draft recovery record.");
            for (const row of rows) {
              if (
                !row ||
                typeof row.key !== "string" ||
                !Number.isSafeInteger(row.expected ?? 0) ||
                (row.expected ?? 0) < 0
              )
                throw Error("Invalid recovery revision.");
              let value: Pending["value"], base: Pending["base"];
              if (row.key === prefix + "profile") {
                value = normalizeSignalProfile(row.value);
                base = row.base ? normalizeSignalProfile(row.base) : undefined;
              } else {
                value = readSignalPack(row.value);
                if (row.key !== prefix + value.id) throw Error("Recovery namespace mismatch.");
                base = row.base ? readSignalPack(row.base) : undefined;
              }
              pending.current.set(row.key, {
                key: row.key,
                value,
                base,
                expected: row.expected ?? 0,
                nonce: createLocalId("replay:"),
              });
            }
            previousMirrors.current.push({ key, text });
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Recovery draft could not be read. Original record retained.",
            );
          }
        }
        if (pending.current.size) {
          setDirty(true);
          await flush().catch(() => {});
        }
        const saved = await repository.profile(),
          values = await loadPage([], false);
        if (!alive.current) return;
        profileBase.current = saved;
        const pendingProfile = pending.current.get(prefix + "profile");
        setProfile(pendingProfile ? (pendingProfile.value as SignalProfile) : saved.profile);
        const draft = [...pending.current.values()].find((row) =>
          row.key.startsWith(prefix + "pack:"),
        );
        setPack(draft ? (draft.value as SignalPack) : (values?.[0] ?? null));
        setReady(true);
      } catch (e) {
        if (alive.current)
          setError(e instanceof Error ? e.message : "Could not load Stream Signal.");
      }
    })();
    const stop = repository.writer.onCommit(() => {
      void refresh().catch((e) => {
        if (alive.current)
          setError(e instanceof Error ? e.message : "New revisions are available.");
      });
    });
    const hide = () => {
      mirror();
      void flush().catch(() => {});
    };
    window.addEventListener("pagehide", hide);
    return () => {
      alive.current = false;
      ticket.current++;
      clearTimeout(timer.current);
      mirror();
      void flush()
        .catch(() => {})
        .finally(() => {
          if (!alive.current || repositoryRef.current !== repository) repository.writer.close();
        });
      stop();
      window.removeEventListener("pagehide", hide);
    };
  }, [prefix, recoveryKey, repository, flush, mirror, loadPage, refresh]);
  const updatePack = (next: SignalPack) => {
    const base = packRef.current?.id === next.id ? packRef.current : next;
    if (!queue(prefix + next.id, next, base ?? undefined, base?.revision ?? 0)) return;
    packRef.current = next;
    setPack(next);
    setArchive((rows) => rows.map((row) => (row.id === next.id ? next : row)));
  };
  const resolve = async (keepMine: boolean) => {
    if (!conflict) return;
    const row = pending.current.get(conflict.key);
    if (!row) return;
    if (keepMine) {
      if (row.key === prefix + "profile") {
        const current = conflict.current as SignalProfileRevision,
          mine = row.value as SignalProfile,
          base = row.base as SignalProfile | undefined,
          value = { ...current.profile };
        for (const field of Object.keys(value) as Array<keyof SignalProfile>)
          if (!base || mine[field] !== base[field]) value[field] = mine[field];
        pending.current.set(row.key, {
          ...row,
          value,
          base: current.profile,
          expected: current.revision,
        });
        setProfile(value);
      } else {
        const current = conflict.current as SignalPack,
          value = rebaseSignalEdit(
            current,
            row.value as SignalPack,
            row.base as SignalPack | undefined,
          );
        pending.current.set(row.key, {
          ...row,
          value,
          base: current,
          expected: current.revision ?? 0,
        });
        packRef.current = value;
        setPack(value);
      }
    } else {
      pending.current.delete(row.key);
      if (row.key === prefix + "profile") {
        profileBase.current = conflict.current as SignalProfileRevision;
        setProfile(profileBase.current.profile);
      } else {
        const value = conflict.current as SignalPack;
        packRef.current = value;
        setPack(value);
        setArchive((rows) => rows.map((old) => (old.id === value.id ? value : old)));
      }
    }
    setConflict(null);
    setError("");
    mirror();
    await flush();
    if (!pending.current.size) setDirty(false);
  };
  return {
    ready,
    error,
    profile,
    pack,
    archive,
    older,
    cursors,
    paging,
    dirty,
    saving,
    conflict,
    remoteChanged,
    flush,
    refresh,
    changeProfile(next: SignalProfile) {
      if (
        queue(prefix + "profile", next, profileBase.current.profile, profileBase.current.revision)
      )
        setProfile(next);
    },
    updatePack,
    async generate() {
      await flush();
      const next = generateSignalPack(profile, "pack:" + Date.now() + ":" + createLocalId());
      packRef.current = next;
      setPack(next);
      setArchive((rows) => [next, ...rows].slice(0, 8));
      queue(
        prefix + "profile",
        { ...profile },
        profileBase.current.profile,
        profileBase.current.revision,
      );
      queue(prefix + next.id, next, undefined, 0);
      await flush();
      await loadPage([]);
    },
    async select(next: SignalPack) {
      try {
        await flush();
        packRef.current = next;
        setPack(next);
        const raw = await repository.read(prefix + next.id);
        if (raw && !pending.current.has(prefix + next.id) && packRef.current?.id === next.id) {
          const selected = readSignalPack(raw);
          packRef.current = selected;
          setPack(selected);
        }
      } catch {
        /* Keep current editable draft. */
      }
    },
    resolveConflict: resolve,
    restorePrior(row: SignalEditHistory) {
      const current = packRef.current;
      if (!current) return;
      const shared = { ...current.shared };
      if (row.shared === undefined) delete shared[row.platform];
      else shared[row.platform] = row.shared;
      updatePack({ ...current, drafts: { ...current.drafts, [row.platform]: row.text }, shared });
    },
    olderPage() {
      if (archive.length) void loadPage([...cursors, prefix + archive[archive.length - 1]!.id]);
    },
    newerPage() {
      void loadPage(cursors.slice(0, -1));
    },
  };
}
