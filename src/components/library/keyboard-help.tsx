import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUserState } from '@/lib/auth/use-current-user';
import { useLibrary } from '@/lib/videos/store';
import { commandAvailability, filterCommands, readShortcutPreferences, setShortcutPreferences, shortcutBlocked, type ShortcutPreferences } from '@/lib/keyboard-commands';

export function KeyboardHelpButton() {
  return <Button variant="ghost" size="icon-sm" className="min-h-11 min-w-11" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)" onClick={() => window.dispatchEvent(new CustomEvent('reelcase:keyboard-help'))}><Keyboard className="size-4" /></Button>;
}
export function KeyboardHelp() {
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [error, setError] = useState('');
  const [prefs, setPrefs] = useState<ShortcutPreferences>({ search: true, sidebar: true });
  const origin = useRef<HTMLElement | null>(null), input = useRef<HTMLInputElement>(null);
  const [context, setContext] = useState({ viewer: false, preview: false, provider: false });
  const key = user ? `reelcase.keyboard.v1:${encodeURIComponent(user.id)}` : null;
  useEffect(() => {
    const sync = () => { try { const next = readShortcutPreferences(key ? localStorage.getItem(key) : null); setPrefs(next); setShortcutPreferences(next); } catch { setError('Shortcut preferences could not be read. Defaults are active.'); setPrefs({search:true,sidebar:true}); setShortcutPreferences({search:true,sidebar:true}); } };
    const update = (event: StorageEvent) => { if (event.key === key || event.key === null) sync(); };
    sync(); window.addEventListener('storage', update);
    return () => { window.removeEventListener('storage', update); setShortcutPreferences({ search: true, sidebar: true }); };
  }, [key]);
  useEffect(() => {
    const show = () => {
      // Do not replace an existing modal's focus owner.
      if (document.querySelector('[role="dialog"]:not([data-media-viewer]),[role="alertdialog"]')) return;
      origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const state = useLibrary.getState();
      setContext({ viewer: Boolean(state.activeId), preview: Boolean(state.previewId), provider: document.querySelector('[data-player-keyboard="provider"]') !== null });
      setQuery(''); setOpen(true);
    };
    const press = (event: KeyboardEvent) => { if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey && !shortcutBlocked(event,{allowViewer:true})) { event.preventDefault(); show(); } };
    window.addEventListener('reelcase:keyboard-help', show); window.addEventListener('keydown', press);
    return () => { window.removeEventListener('reelcase:keyboard-help', show); window.removeEventListener('keydown', press); };
  }, []);
  const change = (id: keyof ShortcutPreferences, value: boolean) => {
    const next = { ...prefs, [id]: value };
    try { if (!key) throw Error('Sign in to save shortcut preferences.'); localStorage.setItem(key, JSON.stringify(next)); setPrefs(next); setShortcutPreferences(next); setError(''); }
    catch { setError('Shortcut preferences could not be saved. Your previous choices remain active.'); }
  };
  return <><KeyboardHelpButton /><Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[80] bg-bg/80" /><Dialog.Content className="fixed top-1/2 left-1/2 z-[81] flex max-h-[90dvh] w-[min(42rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-lift outline-none" onOpenAutoFocus={event => { event.preventDefault(); input.current?.focus(); }} onCloseAutoFocus={event => { event.preventDefault(); const target = origin.current?.isConnected ? origin.current : document.querySelector<HTMLElement>('header button[aria-label="Keyboard shortcuts"]'); target?.focus({preventScroll:true}); }}>
    <div className="shrink-0 pr-10"><Dialog.Title className="font-display text-xl">Keyboard shortcuts</Dialog.Title><Dialog.Description className="mt-2 text-sm leading-6 text-muted">{context.viewer ? context.provider ? 'Provider player open. Keys inside its iframe belong to the provider.' : 'Local player open.' : context.preview ? 'Preview open. Close it to use library shortcuts.' : 'Library active.'} Typing and focused controls keep their usual keys. This help does not run commands.</Dialog.Description></div>
    <Dialog.Close asChild><Button variant="ghost" size="icon" className="absolute top-2 right-2 min-h-11 min-w-11" aria-label="Close keyboard help"><X className="size-4" /></Button></Dialog.Close>
    <Input ref={input} className="min-h-11 shrink-0" aria-label="Search keyboard shortcuts" maxLength={120} placeholder="Search commands, keys or context…" value={query} onChange={event => setQuery(event.target.value)} />
    <div className="min-h-0 overflow-y-auto"><ul aria-label="Keyboard command map" className="divide-y divide-border">{filterCommands(query).map(command => <li key={command.id} className="space-y-1 py-3"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm">{command.label}</strong><kbd className="rounded border border-border bg-bg px-2 text-xs leading-6">{command.keys}</kbd></div><p className="text-xs text-accent">{command.id === 'search' && !prefs.search || command.id === 'sidebar' && !prefs.sidebar ? 'Disabled in your preferences' : commandAvailability(command.when, context)}</p><p className="text-xs leading-5 text-muted">{command.scope} · {command.detail}</p></li>)}</ul>
    {!filterCommands(query).length && <p role="status" className="text-sm text-muted">No matching commands.</p>}
    <fieldset className="space-y-2 rounded-lg border border-border p-3"><legend className="px-1 text-sm font-medium">Resolve shortcut conflicts</legend><p className="text-xs leading-5 text-muted">Disable either library binding if another tool needs it. Player and native provider bindings are fixed; they cannot be remapped here.</p>{(['search','sidebar'] as const).map(id => <label key={id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={prefs[id]} onChange={event => change(id,event.target.checked)} />Enable {id === 'search' ? 'library search shortcuts' : 'navigation shortcut'}</label>)}</fieldset></div>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
  </Dialog.Content></Dialog.Portal></Dialog.Root></>;
}
