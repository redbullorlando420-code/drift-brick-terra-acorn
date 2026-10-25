import { useCallback, useEffect, useRef, useState } from 'react';
import { listWorkspaceDocuments, readWorkspaceDocument, saveWorkspaceDocuments } from '@/lib/videos/persist';
import { createLocalId } from '@/lib/local-id';
import { DEFAULT_SIGNAL_PROFILE, generateSignalPack, normalizeSignalProfile, readSignalPack, signalOwnerPrefix,
  type SignalPack, type SignalProfile } from '@/lib/stream-signal';

/** Only changed, small documents are written. Page-hide recovery mirrors the
 * pending edits, never the full pack archive or the media library. */
export function useStreamSignal(owner: string) {
  const prefix = signalOwnerPrefix(owner), recoveryKey = prefix + 'pending';
  const [ready, setReady] = useState(false), [error, setError] = useState('');
  const [profile, setProfile] = useState<SignalProfile>(DEFAULT_SIGNAL_PROFILE);
  const [pack, setPack] = useState<SignalPack | null>(null);
  const [archive, setArchive] = useState<SignalPack[]>([]), [older, setOlder] = useState(false);
  const [cursors, setCursors] = useState<string[]>([]), [paging, setPaging] = useState(false);
  const [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false);
  const pending = useRef(new Map<string, unknown>()), writing = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), alive = useRef(true);
  const pageTicket = useRef(0);
  const mirror = useCallback(() => {
    if (!pending.current.size) return;
    try { localStorage.setItem(recoveryKey, JSON.stringify([...pending.current].map(([key, value]) => ({ key, value })))); }
    catch { /* IndexedDB remains the primary save path; its failure is reported. */ }
  }, [recoveryKey]);
  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (writing.current) return writing.current;
    if (!pending.current.size) return;
    if (alive.current) setSaving(true);
    const job = (async () => {
      while (pending.current.size) {
        const rows = [...pending.current].map(([key, value]) => ({ key, value }));
        await saveWorkspaceDocuments(rows);
        for (const row of rows) if (pending.current.get(row.key) === row.value) pending.current.delete(row.key);
      }
      try { localStorage.removeItem(recoveryKey); } catch { /* optional mirror */ }
      if (alive.current) { setDirty(false); setError(''); }
    })();
    writing.current = job;
    try { await job; } catch (e) {
      mirror();
      if (alive.current) setError(`Could not save Stream Signal. Keep this tab open, export your pack, or retry Save. ${e instanceof Error ? e.message : ''}`);
      throw e;
    } finally { writing.current = null; if (alive.current) setSaving(false); }
  }, [recoveryKey, mirror]);
  const queue = useCallback((key: string, value: unknown) => {
    pending.current.set(key, value); setDirty(true); clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flush().catch(() => {}); }, 450);
  }, [flush]);
  const readPage = useCallback(async (nextCursors: string[]) => {
    const ticket = ++pageTicket.current; setPaging(true);
    try {
      await flush();
      const rows = await listWorkspaceDocuments(prefix + 'pack:', nextCursors.at(-1));
      const values = rows.slice(0, 8).map(row => readSignalPack(row.value));
      if (!alive.current || ticket !== pageTicket.current) return;
      setArchive(values); setOlder(rows.length > 8); setCursors(nextCursors);
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : 'Could not load saved packs.'); }
    finally { if (alive.current && ticket === pageTicket.current) setPaging(false); }
  }, [prefix, flush]);
  useEffect(() => {
    alive.current = true;
    void (async () => {
      try {
        // Replay only valid recovery documents from this exact user namespace.
        let recovery: string | null = null;
        try { recovery = localStorage.getItem(recoveryKey); } catch { /* Browser may allow IndexedDB without localStorage. */ }
        if (recovery) {
          try {
            const rows: unknown = JSON.parse(recovery);
            if (Array.isArray(rows)) for (const row of rows) {
              if (row?.key === prefix + 'profile') pending.current.set(row.key, normalizeSignalProfile(row.value));
              else if (typeof row?.key === 'string' && row.key.startsWith(prefix + 'pack:')) {
                const saved = readSignalPack(row.value);
                if (row.key === prefix + saved.id) pending.current.set(row.key, saved);
              }
            }
          } catch { if (alive.current) setError('A recovery draft could not be read. Existing saved packs are available; the recovery record has been kept.'); }
          await flush();
        }
        const savedProfile = await readWorkspaceDocument(prefix + 'profile');
        const rows = await listWorkspaceDocuments(prefix + 'pack:');
        const values = rows.slice(0, 8).map(row => readSignalPack(row.value));
        if (!alive.current) return;
        setProfile(normalizeSignalProfile(savedProfile)); setArchive(values); setOlder(rows.length > 8); setPack(values[0] ?? null); setReady(true);
      } catch (e) { if (alive.current) setError(`Could not load Stream Signal. ${e instanceof Error ? e.message : ''}`); }
    })();
    const hide = () => { mirror(); void flush().catch(() => {}); };
    window.addEventListener('pagehide', hide);
    return () => { alive.current = false; pageTicket.current++; clearTimeout(timer.current); mirror(); void flush().catch(() => {}); window.removeEventListener('pagehide', hide); };
  }, [prefix, recoveryKey, flush, mirror]);
  const updatePack = (next: SignalPack) => {
    setPack(next); setArchive(current => current.map(row => row.id === next.id ? next : row)); queue(prefix + next.id, next);
  };
  return { ready, profile, pack, archive, older, cursors, paging, dirty, saving, error, flush,
    changeProfile(next: SignalProfile) { setProfile(next); queue(prefix + 'profile', next); },
    updatePack,
    async generate() {
      const next = generateSignalPack(profile, `pack:${Date.now()}:${createLocalId()}`);
      setPack(next); setArchive(current => [next, ...current].slice(0, 8));
      queue(prefix + 'profile', { ...profile }); queue(prefix + next.id, next);
      await flush(); await readPage([]);
    },
    async select(next: SignalPack) { try { await flush(); setPack(next); } catch { /* keep editable current pack */ } },
    olderPage() { if (archive.length) void readPage([...cursors, prefix + archive[archive.length - 1]!.id]); },
    newerPage() { void readPage(cursors.slice(0, -1)); },
  };
}
