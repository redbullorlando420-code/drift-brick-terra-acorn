import { generatedSeed, studioSettingsError, type StudioSettings } from './studio-settings.ts';
import { generatedCheckpoint } from './studio-recipes.ts';

export type StudioImage = { blob: Blob; settings: StudioSettings; seed?: number; seconds: number; checkpoint?: string };
type StudioSnapshot = { busy: boolean; interrupting: boolean; image: StudioImage | null; note: string; error: string };
export type StudioRequest = (path: string, body: object) => Promise<{ image?: string; info?: string }>;
const EMPTY: StudioSnapshot = { busy: false, interrupting: false, image: null, note: '', error: '' };

/** One in-memory result and one user-started request. Navigation needs no polling. */
export class StudioSession {
  private state: StudioSnapshot = EMPTY;
  private listeners = new Set<() => void>();
  private readonly request: StudioRequest;
  private run = 0;
  private engine: string = 'a1111';
  constructor(request: StudioRequest) { this.request = request; }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private patch(change: Partial<StudioSnapshot>) { this.state = { ...this.state, ...change }; for (const listener of this.listeners) listener(); }
  clearImage = () => { if (!this.state.busy) this.patch({ image: null, error: '', note: 'Image cleared from this app session. Downloaded files and saved recipes are unchanged.' }); };

  async generate(settings: StudioSettings) {
    if (this.state.busy) return;
    const validation = studioSettingsError(settings);
    if (validation) { this.patch({ error: validation }); return; }
    const submitted = { ...settings }, started = performance.now();
    this.run++; this.engine = submitted.engine ?? 'a1111';
    this.patch({ busy: true, interrupting: false, error: '', note: 'Generating locally. You can visit another app tab and return to the result.' });
    try {
      const result = await this.request(submitted.engine === 'comfy' ? '/studio/qwen/generate' : '/studio/generate', { prompt: submitted.prompt, negativePrompt: submitted.negative, steps: submitted.steps, width: submitted.size, height: submitted.size, seed: submitted.seed, ...(submitted.model ? {model:submitted.model} : {}) });
      if (typeof result.image !== 'string' || result.image.length > 14_000_000) throw new Error('The image response is missing or exceeds the preview budget.');
      const bytes = Uint8Array.from(atob(result.image), character => character.charCodeAt(0));
      const interrupted = this.state.interrupting;
      this.patch({ image: { blob: new Blob([bytes], { type: 'image/png' }), settings: submitted, seed: generatedSeed(result.info, submitted.seed), checkpoint: generatedCheckpoint(result.info), seconds: Math.max(0.1, Math.round((performance.now() - started) / 100) / 10) },
        note: interrupted ? 'Generation stopped. The engine returned a partial image; you can download or discard it.' : 'Image ready. It stays available while you move around the app. Download it before reloading or closing this browser tab.' });
    } catch (cause) { this.patch({ note: '', error: cause instanceof Error ? cause.message : 'Generation failed. Your previous image remains available.' }); }
    finally { this.patch({ busy: false, interrupting: false }); }
  }

  async interrupt() {
    if (!this.state.busy || this.state.interrupting) return;
    this.patch({ interrupting: true, error: '' });
    const run = this.run;
    try { await this.request(this.engine === 'comfy' ? '/studio/qwen/interrupt' : '/studio/interrupt', {}); if (this.state.busy && this.run === run) this.patch({ note: 'Interrupt requested. Waiting for the engine to finish stopping.' }); }
    catch (cause) { if (this.state.busy && this.run === run) this.patch({ interrupting: false, error: cause instanceof Error ? cause.message : 'Interrupt could not be sent.' }); }
  }
}

export function createStudioSessions(request: StudioRequest) {
  const sessions = new Map<string, StudioSession>();
  return (owner: string) => {
    let session = sessions.get(owner);
    if (!session) {
      // Account switches never expose another account's result. Retain at most
      // two account sessions; eviction releases the cached image reference.
      if (sessions.size >= 2) sessions.delete(sessions.keys().next().value!);
      session = new StudioSession(request);
    }
    sessions.delete(owner); sessions.set(owner, session);
    return session;
  };
}
