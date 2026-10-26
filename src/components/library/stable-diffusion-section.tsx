import { StudioModelLibrary } from './studio-model-library';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Images, Download, ExternalLink, ImagePlus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { localTool } from '@/lib/local-tools';
import { DEFAULT_STUDIO_SETTINGS, studioSettings, studioSettingsError, type StudioSettings } from '@/lib/studio-settings';
import { HubShell } from './hub-shared';
import { useCurrentUserState } from '@/lib/auth/use-current-user';
import { createStudioSessions } from '@/lib/studio-session';
import { StudioRecipes } from './studio-recipes';
import { studioJobsDocument } from '@/lib/studio-documents';
import { readModelPreflight, type ModelPreflight } from '@/lib/studio-model-notes';
import { StudioModelRequirements } from './studio-model-requirements';
import { StudioJobHistory } from './studio-job-history';

type EngineStatus = { engine?: 'a1111' | 'comfy'; connected: boolean; ready: boolean; models: string[]; modelPreflight?:boolean; busy?: boolean; canStart?: boolean; ownedEngine?: boolean; note?: string; connectionIssue?: string };
const getSession = createStudioSessions((path, body) => localTool<{ image?: string; info?: string;engineJobId?:string }>(path, body),studioJobsDocument);

export function StableDiffusionSection() {
  const { user, isPending } = useCurrentUserState();
  if (!user) return <p className="p-6 text-muted">{isPending ? 'Loading your workspace…' : 'Sign in through this app to use the local studio.'}</p>;
  return <StudioWorkspace key={user.id} owner={user.id} />;
}

function StudioWorkspace({ owner }: { owner: string }) {
  const session = getSession(owner);
  const work = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(()=>{void session.hydrate();},[session]);
  const [candidate,setCandidate]=useState(''),[review,setReview]=useState<ModelPreflight|null>(null),[reviewing,setReviewing]=useState(false);
  const modelName=(value:string)=>value.replace(/ \[[a-f0-9]+\]$/i,'');
  const settingsKey = `reelcase.studio.settings.v1:${encodeURIComponent(owner)}`;
  const [settings, setSettings] = useState(() => {
    try { return studioSettings(JSON.parse(localStorage.getItem(settingsKey) ?? 'null'), localStorage.getItem(`reelcase.studio.prompt.v1:${encodeURIComponent(owner)}`) ?? ''); }
    catch { return { ...DEFAULT_STUDIO_SETTINGS }; }
  });
  const [engineStatus, setStatus] = useState<EngineStatus | null>(null);
  const status = engineStatus?.engine === (settings.engine ?? 'a1111') ? engineStatus : null;
  const [note, setNote] = useState(''), [error, setError] = useState(''), [saveError, setSaveError] = useState('');
  const { busy, interrupting } = work;
  const [checking, setChecking] = useState(false), [imageUrl, setImageUrl] = useState('');
  const image = work.image ? { ...work.image, url: imageUrl } : null;
  const mounted = useRef(true);
  const latestSettings = useRef(settings), saved = useRef(JSON.stringify(settings));
  latestSettings.current = settings;
  // One coalesced write after editing, with a final flush on navigation.
  const persist = (report: boolean) => {
    const value = JSON.stringify(latestSettings.current);
    if (value === saved.current) return;
    try { localStorage.setItem(settingsKey, value); saved.current = value; if (report) setSaveError(''); }
    catch { if (report) setSaveError('Settings could not be saved in this browser. You can still download your image.'); }
  };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!work.image) { setImageUrl(''); return; }
    const url = URL.createObjectURL(work.image.blob); setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [work.image]);
  useEffect(() => { const timer = setTimeout(() => persist(true), 500); return () => clearTimeout(timer); }, [settings, settingsKey]);
  useEffect(() => { const save = () => persist(false); window.addEventListener('pagehide', save); return () => { save(); window.removeEventListener('pagehide', save); }; }, [settingsKey]);
  const update = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => setSettings(previous => ({ ...previous, [key]: value }));
  const inspectModel=async(model:string,engine=settings.engine??'a1111')=>{
    setReviewing(true);setError('');
    try{const result=readModelPreflight(await localTool<unknown>('/studio/models/preflight',{engine,model}));if(result.version!==1||result.engine!==engine||result.name!==modelName(model)||!Array.isArray(result.checks)||!result.checks.length)throw Error('Companion returned an unsupported compatibility report.');if(mounted.current)setReview(result);}
    catch(cause){if(mounted.current){setReview(null);setError(cause instanceof Error?cause.message:'Model review failed. Your selected model was preserved.');}}
    finally{if(mounted.current)setReviewing(false);}
  };
  const check = async () => {
    setChecking(true); setError('');
    try { const next = await localTool<EngineStatus>(settings.engine === 'comfy' ? '/studio/qwen/status' : '/studio/status'); if (mounted.current) { setStatus({ ...next, engine: settings.engine ?? 'a1111' });const choice=settings.model&&next.models.includes(settings.model)?settings.model:next.models[0]??'';setCandidate(choice);setReview(null);if(choice&&next.modelPreflight)await inspectModel(choice);else if(next.ready)setError('Update Companion for model compatibility preflight before generating. Existing images and settings are preserved.'); } }
    catch (cause) { if (mounted.current) { setStatus(null); setError(cause instanceof Error ? cause.message : 'Could not check the local engine.'); } }
    finally { if (mounted.current) setChecking(false); }
  };
  const engineAction = async (action: 'start' | 'stop') => {
    setChecking(true); setError('');
    try {
      const result = await localTool<{ note: string }>(`/studio/${settings.engine === 'comfy' ? 'qwen/' : ''}${action}`, {});
      if (mounted.current) setNote(result.note);
      const next = await localTool<EngineStatus>(settings.engine === 'comfy' ? '/studio/qwen/status' : '/studio/status');
      if (mounted.current) setStatus({...next,engine:settings.engine??'a1111'});
    } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Engine action failed.'); }
    finally { if (mounted.current) setChecking(false); }
  };
  const generate = async () => {
    if (busy || !canGenerate || studioSettingsError(settings)) return;
    setError(''); setNote(''); await session.generate(settings,review??undefined);
  };
  const interrupt = () => session.interrupt();
  const validation = studioSettingsError(settings);
  const canGenerate=work.ready&&!!status?.ready&&!!settings.model&&review?.ready===true&&review.engine===(settings.engine??'a1111')&&review.name===modelName(settings.model);
  const engineLabel = busy ? interrupting ? 'Stopping generation' : 'Generating locally' : canGenerate ? 'Connected · reviewed model ready' : status?.connectionIssue === 'authentication' ? 'API authentication required' : status?.connectionIssue === 'engine' ? 'Engine needs attention' : status?.ownedEngine ? 'Engine starting' : status?.connected ? status.ready ? 'API connected · model review required' : 'API connected · no checkpoint loaded' : status ? 'Not connected' : 'Not checked';
  return <HubShell eyebrow="Local image studio" icon={<Images className="size-4" />} title="Stable Diffusion" copy="Generate with local Qwen-Image 2.1 or AUTOMATIC1111. Your latest result stays available as you move around the app. Download images before reloading or closing this browser tab.">
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Text to image</CardTitle><CardDescription>Describe an image, check the engine, then generate. One image at a time with your selected model.</CardDescription></CardHeader><CardContent>
        <label className="block space-y-2 text-sm">Image engine<select aria-label="Image engine" disabled={busy || checking || reviewing} value={settings.engine ?? 'a1111'} onChange={e => { setSettings(previous => ({ ...previous, engine: e.target.value as 'a1111' | 'comfy', model: undefined, steps: e.target.value === 'comfy' ? 8 : 20 })); setStatus(null); setReview(null); setCandidate('');setError(''); }} className="min-h-11 w-full rounded-md border border-border bg-bg px-3"><option value="a1111">Stable Diffusion · AUTOMATIC1111</option><option value="comfy">Qwen-Image 2.1 · ComfyUI</option></select></label>
        {Boolean(status?.models.length) && <section className="space-y-3 rounded-md border border-border bg-bg p-3" aria-label="Model compatibility review" data-model-preflight={review?.ready?'ready':review?'blocked':'unreviewed'}><label className="block space-y-2 text-sm">Model to inspect<select aria-label="Selected image model" disabled={busy||checking||reviewing} value={candidate} onChange={e=>{setCandidate(e.target.value);setReview(null);}} className="min-h-11 w-full rounded-md border border-border bg-bg px-3"><option value="">Choose an exact model</option>{status?.models.map(model=><option key={model} value={model}>{model}</option>)}</select></label><p className="break-words text-xs text-muted">Current selected model: {settings.model??'None reviewed yet'}. Inspecting a different file does not replace it.</p><div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={busy||reviewing||!candidate||!status?.modelPreflight} onClick={()=>void inspectModel(candidate)}>{reviewing?'Inspecting headers…':'Review selected model'}</Button><Button disabled={busy||reviewing||!review?.ready||review.name!==modelName(candidate)} onClick={()=>update('model',candidate)}>Use reviewed model</Button></div>{review&&<div className="space-y-3"><p className="text-sm font-medium">{review.ready?'Compatible model structure':'Model blocked'} · {review.family} · {review.role}</p><ul aria-label="Model compatibility checklist" className="space-y-2 text-xs leading-5 text-muted">{review.checks.map((item,i)=><li key={i}><strong className={item.state==='fail'?'text-danger':'text-fg'}>{item.label}: {item.state}</strong> · {item.detail}</li>)}</ul><p className="text-xs leading-5 text-muted">Weights: {review.hardware.weightsGiB} GiB. {review.hardware.note}</p><p className="text-xs text-muted">Header compatibility does not prove successful generation on this hardware.</p></div>}</section>}
        <label className="block space-y-2 text-sm">Prompt<textarea aria-label="Image prompt" maxLength={4000} value={settings.prompt} onChange={e => update('prompt', e.target.value)} placeholder="A quiet forest at sunrise, watercolor illustration…" className="min-h-32 w-full rounded-md border border-border bg-bg p-3 text-fg" /></label>
        <label className="block space-y-2 text-sm">Negative prompt<Input aria-label="Negative prompt" maxLength={4000} value={settings.negative} onChange={e => update('negative', e.target.value)} placeholder="Things to leave out (optional)" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-sm">Steps<Input aria-label="Generation steps" type="number" min={1} max={40} step={1} value={Number.isNaN(settings.steps) ? '' : settings.steps} onChange={e => update('steps', e.target.value === '' ? NaN : Number(e.target.value))} aria-invalid={!Number.isInteger(settings.steps) || settings.steps < 1 || settings.steps > 40} /></label><label className="space-y-2 text-sm">Seed<Input aria-label="Generation seed" type="number" min={-1} max={2147483647} step={1} value={Number.isNaN(settings.seed) ? '' : settings.seed} onChange={e => update('seed', e.target.value === '' ? NaN : Number(e.target.value))} aria-invalid={!Number.isInteger(settings.seed) || settings.seed < -1 || settings.seed > 2147483647} /></label></div>
        <p className="text-xs leading-5 text-muted">Use −1 for a random seed. More steps and larger images take longer. Keep the same checkpoint to reproduce a result.</p>
        <label className="block space-y-2 text-sm">Image size<select aria-label="Image size" value={settings.size} onChange={e => update('size', Number(e.target.value))} className="min-h-11 w-full rounded-md border border-border bg-bg px-3">{[256, 512, 768].map(n => <option key={n} value={n}>{n} × {n}</option>)}</select></label>
        {validation && settings.prompt.trim() && <p className="text-sm text-danger" role="alert">{validation}</p>}
      </CardContent><CardFooter><Button disabled={busy || checking || reviewing || !canGenerate || status?.busy || Boolean(validation)} onClick={() => void generate()}>{busy ? 'Generating…' : 'Generate image'}</Button>{busy ? <Button variant="danger" disabled={interrupting} onClick={() => void interrupt()}>{interrupting ? 'Stopping generation…' : 'Interrupt generation'}</Button> : <Button variant="ghost" onClick={() => setSettings(previous => ({ ...DEFAULT_STUDIO_SETTINGS, prompt: previous.prompt, engine: previous.engine, model: previous.model, steps: previous.engine === 'comfy' ? 8 : 20 }))}><RotateCcw className="size-4" />Reset settings</Button>}</CardFooter>
        {!status?.ready && !busy && <p className="px-5 text-xs leading-5 text-muted">Check the local engine to enable generation.</p>}{status?.busy && !busy && <p className="px-5 text-xs leading-5 text-muted">Companion has a generation in progress. Check again when it finishes.</p>}
      </Card>
      <div className="space-y-5"><Card><CardHeader><div><Badge variant={canGenerate ? 'solid' : 'default'}>{engineLabel}</Badge></div><CardTitle>Local engine</CardTitle><CardDescription>{status?.ownedEngine && !status.connected ? 'First start can take a few minutes. Check again when the engine has loaded.' : status?.note || 'Status checks run only when requested. Nothing is sent to a cloud image service.'}</CardDescription></CardHeader><CardContent>
        {status?.models?.length ? <p className="break-words text-xs leading-5 text-muted">Available models: {status.models.join(', ')}</p> : null}
        <details className="text-sm text-muted"><summary className="min-h-11 cursor-pointer py-3 text-fg">Setup and connection details</summary><div className="space-y-3 pb-3 text-xs leading-6"><p>Install-Qwen.cmd prepares the Qwen / ComfyUI runtime. Start and stop the selected engine here. Stop one image engine before starting the other. Start-Stable-Diffusion.cmd starts AUTOMATIC1111. Install-Stable-Diffusion.cmd prepares a fresh Windows/NVIDIA runtime, CUDA PyTorch and a verified SD 1.5 checkpoint. Setup downloads several gigabytes once.</p><p>AUTOMATIC1111 stays on 127.0.0.1:7860; Qwen / ComfyUI stays on 127.0.0.1:8189 with custom nodes and cloud API nodes disabled. API credentials are configured server-side with REELCASE_SD_API_AUTH. Public sharing and extra extensions stay disabled.</p><p>Moving to another app tab keeps your latest result and any running request in memory. Reloading or closing this browser tab clears them. Interrupt generation here if you want the GPU job to stop.</p></div></details>
      </CardContent><CardFooter><Button variant="secondary" disabled={checking || busy || reviewing} onClick={() => void check()}>{checking ? 'Checking…' : 'Check local engine'}</Button>{status?.canStart && !status.connected && !status.ownedEngine && !status.connectionIssue && <Button disabled={busy || checking} onClick={() => void engineAction('start')}>Start local engine</Button>}{status?.ownedEngine && <Button variant="danger" disabled={checking || busy} onClick={() => void engineAction('stop')}>Stop local engine</Button>}{settings.engine === 'comfy' && status?.connected && <Button variant="secondary" disabled={busy || checking} onClick={() => void (async () => { try { const result = await localTool<{note:string}>('/studio/qwen/free', {}); setNote(result.note); } catch(cause) { setError(cause instanceof Error ? cause.message : 'Memory release failed.'); } })()}>Release model memory</Button>}<a href={settings.engine === 'comfy' ? 'http://127.0.0.1:8189' : 'http://127.0.0.1:7860'} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-accent">Open full WebUI<ExternalLink className="size-4" /></a></CardFooter></Card>
      <Card><CardHeader><CardTitle>{image ? 'Generated image' : 'Your next image'}</CardTitle><CardDescription>{image ? 'These settings describe this image, even if you edit the form.' : 'Your result will appear here. Downloaded images stay on your computer.'}</CardDescription></CardHeader><CardContent>{image ? <><img src={image.url || undefined} alt={image.settings.prompt.slice(0, 150)} width={image.settings.size} height={image.settings.size} className="w-full rounded-lg" /><dl className="grid grid-cols-2 gap-3 text-xs"><div><dt className="text-muted">Size / steps</dt><dd className="mt-1">{image.settings.size} × {image.settings.size} · {image.settings.steps} steps</dd></div><div><dt className="text-muted">Seed / duration</dt><dd className="mt-1">{image.seed ?? 'Not supplied'} · {image.seconds}s</dd></div></dl><p className="break-words text-sm leading-6 text-muted">{image.settings.prompt}</p></> : <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-6 text-center text-muted"><ImagePlus className="size-8" /><p className="max-w-xs text-sm leading-6">Start with a subject, a style and a few details about the light or setting.</p></div>}</CardContent>{image && <CardFooter><a download="realhub-stable-diffusion.png" href={image.url} className="inline-flex min-h-11 items-center gap-2 text-sm text-accent"><Download className="size-4" />Download PNG</a><Button variant="secondary" disabled={busy} onClick={() => setSettings({ ...image.settings, seed: image.seed ?? image.settings.seed })}>Reuse image settings</Button><Button variant="ghost" disabled={busy} onClick={session.clearImage}>Clear image</Button></CardFooter>}</Card></div>
    </div>
    {work.note && <p role="status" className="mt-4 text-sm leading-6 text-muted">{work.note}</p>}{work.error && <p role="alert" className="mt-4 text-sm leading-6 text-danger">{work.error}</p>}{note && <p role="status" className="mt-4 text-sm leading-6 text-muted">{note}</p>}{error && <p role="alert" className="mt-4 text-sm leading-6 text-danger">{error}</p>}{saveError && <p role="alert" className="mt-4 text-sm leading-6 text-danger">{saveError}</p>}
    <StudioModelLibrary disabled={busy||checking||reviewing} onInstalled={() => void (async () => { if (settings.engine !== 'comfy' && status?.connected) await localTool('/studio/refresh', {}).catch(() => {}); await check(); })()} />
    <StudioModelRequirements owner={owner} review={review} />
    <StudioJobHistory jobs={work.jobs} busy={busy} onReuse={setSettings} />
    {(!work.ready||work.saveError)&&<div className="mt-4 rounded-md border border-border p-4"><p role="alert" className="text-sm text-danger">{work.saveError||'Job history is not ready. Recover it before generating.'}</p><Button variant="secondary" disabled={busy} onClick={()=>void(work.ready?session.retrySave():session.hydrate())}>Retry job history</Button></div>}
    <StudioRecipes owner={owner} disabled={busy} result={image ? { name: image.settings.prompt.trim().slice(0, 80), settings: { ...image.settings, seed: image.seed ?? image.settings.seed }, checkpoint: image.checkpoint, provenance:image.provenance } : undefined} engine={settings.engine??"a1111"} models={status?.models??[]} review={review??undefined} onReuse={setSettings} />
  </HubShell>;
}
