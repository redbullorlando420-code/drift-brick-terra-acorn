import { memo, useState, type ReactNode } from 'react';
import { Radio, Copy, Download, ExternalLink, Check, Undo2, Save, ArrowRight, Link2, FlaskConical, Settings2, Route, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUserState } from '@/lib/auth/use-current-user';
import { SIGNAL_PLATFORMS, SIGNAL_SITES, SIGNAL_LIMITS, validateSignalProfile, exportSignalPack, composeOnX,
  type SignalProfile, type SignalPack } from '@/lib/stream-signal';
import { HubShell } from './hub-shared';
import { useStreamSignal } from './use-stream-signal';
import { StreamSignalLab } from './stream-signal-lab';

const SECTIONS = [ ['announcements', 'Announcements', Megaphone], ['lab', 'Chat Plays Lab', FlaskConical],
  ['setup', 'Channel Setup', Settings2], ['blueprint', 'AI Blueprint', Route] ] as const;
type Section = typeof SECTIONS[number][0];
const area = 'w-full rounded-md border border-border bg-bg px-3 py-3 text-sm leading-6 text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring';
const instructions = {
  x: 'Compose on X fills a draft. Review it and post on X yourself.',
  facebook: 'Personal account: copy the post, open Facebook, paste into a new post, choose your audience, and share yourself.',
  instagram: 'Personal account: download the Story card, upload it in Instagram, then open Stickers → Link and paste a stream URL. A PNG has no clickable links. For a feed caption, add a stream link to your profile and point viewers there.',
  tiktok: 'Copy this caption into your own clip or photo post. Add a stream URL through Edit profile → Links if your account offers it; link availability varies. Text in a caption is not a substitute for a clickable profile link.',
};
function SiteLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">{children}<ExternalLink className="size-3.5" /></a>;
}
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
function StoryPreview({ pack }: { pack: SignalPack | null }) {
  if (!pack) return <div className="signal-story flex items-center justify-center p-6 text-center"><div><Radio className="mx-auto size-10" /><p className="mt-4 text-xl font-semibold">Your next live announcement</p><p className="mt-3 text-sm">Generate a pack to preview its Story card.</p></div></div>;
  return <div className="signal-story flex flex-col justify-between gap-5 p-6" aria-label="Announcement Story preview"><div><p className="text-xs font-semibold tracking-widest">STREAM SIGNAL</p><p className="mt-6 break-words text-3xl font-semibold">{pack.profile.creator}</p><p className="mt-2 text-xs font-semibold tracking-widest">IS GOING LIVE</p></div><div className="rounded-md bg-signal-ink p-4 text-signal-paper"><p className="text-xs text-signal-action">ON THE GRID</p><p className="mt-3 break-words text-xl font-semibold">{pack.profile.title}</p><p className="mt-3 break-words text-sm">{pack.profile.game}</p></div><p className="line-clamp-3 text-sm">{pack.profile.message}</p><div className="space-y-2 text-xs"><p className="break-all">{pack.profile.twitch.replace('https://', '')}</p><p className="break-all">{pack.profile.youtube.replace('https://', '')}</p></div></div>;
}

// Media pulls can update the parent library while this small tool is open.
// Its own form/auth state remains reactive without repainting for catalog rows.
export const StreamSignalSection = memo(function StreamSignalSection() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <p role="status" className="p-6 text-muted">Loading your Stream Signal workspace…</p>;
  if (!user) return <section className="signal-panel"><h1 className="text-2xl font-semibold text-fg">Stream Signal</h1><p className="mt-3 text-muted">Sign in through this app to access your saved announcement workspace.</p></section>;
  return <SignalWorkspace key={user.id} owner={user.id} localOnly={user.isDevFallback} />;
});
function SignalWorkspace({ owner, localOnly }: { owner: string; localOnly: boolean }) {
  const workspace = useStreamSignal(owner);
  const { profile, pack } = workspace;
  const [section, setSection] = useState<Section>('announcements');
  const [errors, setErrors] = useState<Partial<Record<keyof SignalProfile, string>>>({});
  const [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const run = async (work: () => Promise<void>) => { setNotice(''); setBusy(true); try { await work(); } catch (e) { setNotice(e instanceof Error ? e.message : 'This action could not be completed.'); } finally { setBusy(false); } };
  const validated = () => { const next = validateSignalProfile(profile); setErrors(next); if (Object.keys(next).length) { setNotice('Review the highlighted fields in Announcements and Channel Setup.'); return false; } return true; };
  const field = (name: keyof SignalProfile, label: string, multiline = false) => <label className="block min-w-0" key={name}>
    <span className="signal-label">{label}</span>
    {multiline ? <textarea aria-label={label} value={profile[name]} maxLength={SIGNAL_LIMITS[name]} rows={3} className={area} onChange={e => workspace.changeProfile({ ...profile, [name]: e.target.value })} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `signal-${name}-error` : undefined} />
      : <Input aria-label={label} value={profile[name]} maxLength={SIGNAL_LIMITS[name]} onChange={e => workspace.changeProfile({ ...profile, [name]: e.target.value })} type={name === 'twitch' || name === 'youtube' ? 'url' : 'text'} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `signal-${name}-error` : undefined} />}
    {errors[name] && <span id={`signal-${name}-error`} className="mt-1 block text-xs text-danger">{errors[name]}</span>}
  </label>;
  const save = () => void run(async () => { if (!validated()) return; await workspace.flush(); setNotice('Channel and stream details saved.'); });
  const generate = () => void run(async () => { if (validated()) { await workspace.generate(); setNotice('New pack generated. All four posts are drafts.'); } });
  const png = () => void run(async () => {
    if (!pack) return;
    const { createSignalStoryCard } = await import('@/lib/stream-signal-card');
    download(await createSignalStoryCard(pack), `stream-signal-story-${pack.createdAt}.png`);
    setNotice('1080 × 1920 Story PNG downloaded. Add the clickable Link sticker inside Instagram.');
  });
  return <HubShell eyebrow="Creator toolkit" icon={<Radio className="size-4" />} title="Stream Signal" copy="Your go-live launchpad. One pack, four platforms, your voice.">
    <div className="mt-5 flex flex-wrap items-center gap-2"><span className="signal-badge">Manual sharing</span><span className="signal-badge">Live detection · Unconfigured</span><span className="ml-auto text-xs text-muted" role="status" data-signal-save-status>{workspace.saving ? 'Saving…' : workspace.dirty ? 'Unsaved changes' : workspace.ready ? 'Saved in this browser' : 'Loading workspace…'}</span></div>
    <div role="tablist" aria-label="Stream Signal sections" className="my-6 grid grid-cols-2 gap-2 rounded-lg border border-border bg-bg/45 p-2 lg:grid-cols-4" onKeyDown={e => {
      const index = SECTIONS.findIndex(row => row[0] === section);
      const next = e.key === 'ArrowRight' ? (index + 1) % 4 : e.key === 'ArrowLeft' ? (index + 3) % 4 : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : -1;
      if (next >= 0) { e.preventDefault(); setSection(SECTIONS[next]![0]); (e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next])?.focus(); }
    }}>{SECTIONS.map(([key, label, Icon]) => <Button key={key} role="tab" id={`signal-tab-${key}`} aria-selected={section === key} aria-controls={`signal-panel-${key}`} tabIndex={section === key ? 0 : -1} variant={section === key ? 'secondary' : 'ghost'} className="w-full px-2 text-xs sm:text-sm" onClick={() => { setSection(key); setNotice(''); }}><Icon className="size-4" />{label}</Button>)}</div>
    {workspace.error && <div role="alert" className="mb-5 rounded-md border border-danger/40 bg-danger/10 p-4 text-sm text-fg">{workspace.error}<Button className="ml-2" variant="secondary" disabled={workspace.saving} onClick={() => void run(async () => { if (!workspace.ready) { window.location.reload(); return; } await workspace.flush(); })}>Retry {workspace.ready ? 'Save' : 'load'}</Button></div>}
    {notice && <p role="status" className="mb-5 rounded-md bg-elevated p-4 text-sm text-fg">{notice}</p>}
    {!workspace.ready ? <p role="status" className="py-12 text-muted">Opening your saved workspace…</p> : <div role="tabpanel" id={`signal-panel-${section}`} aria-labelledby={`signal-tab-${section}`} tabIndex={0} className="min-w-0 outline-none">
      {section === 'announcements' && <div className="space-y-6">
        <div className="grid items-start gap-5 lg:grid-cols-3"><section className="signal-panel space-y-4 lg:col-span-2"><div className="flex items-center gap-3"><span className="signal-badge">01 / Prepare</span><h2 className="text-xl font-semibold text-fg">Set the scene.</h2></div><p className="text-sm text-muted">Ready for your next stream, {profile.creator || 'creator'}. Changes here apply to the next pack; previous packs keep their own details and edits.</p>
          {field('title', 'Stream title')}{field('game', 'Game or category')}{field('message', 'Community message', true)}
          <div className="rounded-md bg-bg/65 p-3 text-sm text-muted"><p className="flex items-center gap-2 font-medium text-fg"><Link2 className="size-4" />Your stream destinations</p><p className="mt-2 break-all">Twitch · {profile.twitch}</p><p className="mt-1 break-all">YouTube · {profile.youtube}</p><Button variant="ghost" className="mt-1 px-0" onClick={() => setSection('setup')}>Edit channel setup<ArrowRight className="size-4" /></Button></div>
          <div className="flex flex-wrap gap-2"><Button className="signal-primary" disabled={busy || workspace.saving} onClick={generate}><Megaphone className="size-4" />Generate announcement pack</Button><Button variant="secondary" disabled={busy || workspace.saving} onClick={save}><Save className="size-4" />Save details</Button></div>
          <p className="text-xs leading-5 text-muted">Generation happens locally from your saved details. No AI service, social account, or auto-posting is connected. Copying and opening a site never changes the sharing checklist.</p>
        </section><aside className="signal-panel"><div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-fg">Story card</h2><span className="text-xs text-muted">1080 × 1920</span></div><StoryPreview pack={pack} /><Button variant="secondary" className="mt-4 w-full" disabled={!pack || busy} onClick={png}><Download className="size-4" />Download Story PNG</Button><p className="mt-3 text-xs leading-5 text-muted">Preview uses this pack’s saved stream details. Upload the PNG yourself, then add a Link sticker for a tappable stream URL.</p></aside></div>
        <section className="signal-panel"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-muted">02 / Your pack archive</p><h2 className="mt-1 text-lg font-semibold text-fg">Pick up where you left off.</h2></div><div className="flex gap-2"><Button variant="ghost" disabled={!workspace.cursors.length || workspace.paging} onClick={workspace.newerPage}>Newer packs</Button><Button variant="ghost" disabled={!workspace.older || workspace.paging} onClick={workspace.olderPage}>Older packs</Button></div></div>
          {!workspace.archive.length ? <p className="mt-4 text-sm text-muted">Your first generated pack will appear here. Old packs are kept until you remove this app’s browser data.</p> : <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Saved announcement packs">{workspace.archive.map(row => <button key={row.id} className={`min-h-16 min-w-0 rounded-md border p-3 text-left ${row.id === pack?.id ? 'border-accent bg-elevated text-fg' : 'border-border text-muted hover:bg-elevated'}`} aria-pressed={row.id === pack?.id} onClick={() => void workspace.select(row)}><span className="block truncate text-sm font-medium">{row.profile.title}</span><span className="mt-1 block text-xs">{new Date(row.createdAt).toLocaleString()} · {Object.keys(row.shared).length}/4 marked</span></button>)}</div>}
        </section>
        {pack && <section aria-label="Editable announcement pack" className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-muted">03 / Edit, copy, share</p><h2 className="mt-1 break-words text-2xl font-semibold text-fg">{pack.profile.title}</h2></div><Button variant="secondary" onClick={() => { download(new Blob([exportSignalPack(pack)], { type: 'text/plain;charset=utf-8' }), `stream-signal-${pack.createdAt}.txt`); setNotice('Plain text pack downloaded, including all posts and all six destination links.'); }}><Download className="size-4" />Export plain text</Button></div>
          <p className="text-xs text-muted">Edits save after a short pause. “Mark shared” is your manual note that you posted; this app cannot confirm publication.</p>
          <div className="grid items-start gap-4 xl:grid-cols-2">{SIGNAL_PLATFORMS.map(key => {
            const marked = pack.shared[key], draft = pack.drafts[key], missing = !draft.includes(pack.profile.twitch) || !draft.includes(pack.profile.youtube);
            return <article key={`${pack.id}:${key}`} className="signal-panel space-y-3" data-signal-draft={key}><div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold text-fg">{SIGNAL_SITES[key].name}</h3><span className="signal-badge">{marked ? 'Marked shared · manual' : 'Draft · not marked shared'}</span></div>
              <textarea aria-label={`${SIGNAL_SITES[key].name} announcement draft`} rows={8} maxLength={6000} className={area} value={draft} onChange={e => workspace.updatePack({ ...pack, updatedAt: Date.now(), drafts: { ...pack.drafts, [key]: e.target.value } })} />
              <p className="text-xs text-muted">{[...draft].length.toLocaleString()} characters{key === 'x' ? ' · keep it short; review the final limit in X' : ''}</p>
              {key === 'x' && [...draft].length > 280 && <p className="text-xs text-danger">Long X draft: shorten this before posting. Your edit has been preserved.</p>}
              {missing && <p className="text-xs text-danger">This draft is missing a stream link. Both links remain in the text export.<Button variant="ghost" className="h-11 px-1 text-xs" onClick={() => {
                const links = [!draft.includes(pack.profile.twitch) ? `Twitch: ${pack.profile.twitch}` : '', !draft.includes(pack.profile.youtube) ? `YouTube: ${pack.profile.youtube}` : ''].filter(Boolean);
                const next = `${draft}\n${links.join('\n')}`;
                if (next.length > 6000) { setNotice('Shorten this draft to make room for both stream links. Your current text has been preserved.'); return; }
                workspace.updatePack({ ...pack, updatedAt: Date.now(), drafts: { ...pack.drafts, [key]: next } });
              }}>Restore stream links</Button></p>}
              <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => void run(async () => { try { await navigator.clipboard.writeText(draft); setNotice(`${SIGNAL_SITES[key].name} draft copied. Sharing status is unchanged.`); } catch { throw Error('Clipboard access is unavailable. Select the draft text and copy it manually. Sharing status is unchanged.'); } })}><Copy className="size-4" />Copy {SIGNAL_SITES[key].name}</Button><Button variant="secondary" disabled={workspace.saving} onClick={() => void run(async () => { await workspace.flush(); setNotice(`${SIGNAL_SITES[key].name} draft saved.`); })}><Save className="size-4" />Save {SIGNAL_SITES[key].name}</Button><SiteLink href={SIGNAL_SITES[key].url}>Open {SIGNAL_SITES[key].name}</SiteLink></div>
              {key === 'x' && <Button asChild className="signal-primary"><a href={composeOnX(draft)} target="_blank" rel="noopener noreferrer">Compose on X<ExternalLink className="size-4" /></a></Button>}
              <p className="text-xs leading-5 text-muted">{instructions[key]}</p>
              <div className="border-t border-border pt-3">{marked ? <div><p className="mb-2 text-xs text-muted">Manually marked {new Date(marked).toLocaleString()}. This is not a publication receipt.</p><Button variant="ghost" onClick={() => { const shared = { ...pack.shared }; delete shared[key]; workspace.updatePack({ ...pack, updatedAt: Date.now(), shared }); }}><Undo2 className="size-4" />Undo {SIGNAL_SITES[key].name} shared mark</Button></div> : <Button variant="secondary" onClick={() => workspace.updatePack({ ...pack, updatedAt: Date.now(), shared: { ...pack.shared, [key]: Date.now() } })}><Check className="size-4" />Mark {SIGNAL_SITES[key].name} shared</Button>}</div>
            </article>;
          })}</div>
        </section>}
      </div>}
      {section === 'lab' && <StreamSignalLab />}
      {section === 'setup' && <div className="grid items-start gap-5 lg:grid-cols-2"><section className="signal-panel space-y-4"><h2 className="text-2xl font-semibold text-fg">Make it yours.</h2><p className="text-sm text-muted">These defaults are ready for notyoda. Settings apply to new packs; existing drafts keep their original links.</p>{field('creator', 'Creator name')}{field('twitch', 'Twitch channel URL')}{field('youtube', 'YouTube channel URL')}<Button className="signal-primary" disabled={busy || workspace.saving} onClick={save}><Save className="size-4" />Save channel setup</Button><p className="text-xs leading-5 text-muted">{localOnly ? 'This app has sign-in disabled. Your workspace is local to this browser profile; it does not sync across devices.' : 'Drafts are stored in this browser under your current app user. Switching users opens a separate workspace; there is no cloud sync.'} No passwords or social access tokens are requested.</p></section>
        <section className="signal-panel space-y-4"><h2 className="text-xl font-semibold text-fg">Connection status</h2>{[['Twitch live detection', 'Unconfigured'], ['X / Facebook / Instagram / TikTok', 'Manual sharing only'], ['Twitch / YouTube chat', 'Not connected'], ['Local game adapter', 'Not connected']].map(([label, status]) => <div key={label} className="rounded-md bg-bg/60 p-3"><p className="text-sm font-medium text-fg">{label}</p><p className="mt-1 text-xs text-muted">{status}</p></div>)}<p className="text-sm leading-6 text-muted">Facebook and Instagram are personal accounts. Copy and share from their own apps. The website does not have permission to publish to them. Optional live detection needs an authenticated backend with server-held Twitch credentials, per-stream IDs, and a durable duplicate ledger. No polling is running.</p><p className="text-xs text-muted">Instagram <SiteLink href="https://www.instagram.com/">open app/site</SiteLink> · TikTok <SiteLink href="https://support.tiktok.com/en/getting-started/setting-up-your-profile/linking-another-social-media-account">profile link help</SiteLink></p></section></div>}
      {section === 'blueprint' && <Blueprint />}
    </div>}
  </HubShell>;
}
function Blueprint() {
  return <div className="space-y-5"><section className="signal-panel"><span className="signal-badge">Future direction · not connected</span><h2 className="mt-4 text-3xl font-semibold text-fg">Chat sets the strategy.<br />A local controller drives.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">The goal is real-time chat-controlled iRacing Arcade. This website alone cannot observe or control the installed game. The battle simulator demonstrates vote batching, not a functioning racing AI.</p></section>
    <div className="grid gap-4 lg:grid-cols-3">{[
      ['01 · Chat strategy', 'Collect authenticated Twitch / YouTube chat in short voting windows. One latest valid vote per viewer selects a whole strategy, with deterministic ties and moderation.', 'Push · Drive conservatively · Hold the racing line · Overtake when clear'],
      ['02 · Authenticated bridge', 'A separate local game adapter would receive bounded, expiring strategy commands over an authenticated connection. Require explicit pairing, origin checks, sequence IDs and acknowledgements.', 'No browser-to-game connection exists here. Never place game or social credentials in the browser.'],
      ['03 · Fast local controller', 'Read fresh game observations, then handle steering, braking, collision avoidance and reactions continuously. Chat decisions adjust goals; they do not become raw keyboard spam.', 'Pause on stale telemetry, a disconnect, unsafe conditions, or emergency stop.'],
    ].map(([title, copy, detail]) => <section key={title} className="signal-panel"><h3 className="text-lg font-semibold text-fg">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{copy}</p><p className="mt-4 border-t border-border pt-4 text-sm text-accent">{detail}</p></section>)}</div>
    <section className="signal-panel"><h3 className="text-xl font-semibold text-fg">A sequence needs a contract.</h3><p className="mt-3 text-sm leading-6 text-muted">“Overtake when clear, then hold the line” needs a fresh clearance observation before the pass, a time limit, an acknowledgement of each stage, and an interruption path if another car closes the gap. Recheck conditions before every action; a previous vote is never proof that the track is still clear.</p><ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2"><li>Conditions: sufficient grip, track clearance, controller ready.</li><li>Freshness: timestamp observations and reject stale commands.</li><li>Timeouts: expire strategies and stop waiting for missing acknowledgements.</li><li>Interruption: stop and clear pending actions on danger or disconnection.</li></ul><p className="mt-4 rounded-md bg-bg/60 p-3 text-sm text-fg">Next milestone: a read-only local telemetry adapter, then a paired connection and a supervised controller test. No racing control is implemented in this website.</p></section>
  </div>;
}
