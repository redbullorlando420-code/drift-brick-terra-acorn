export type StudioSettings = { prompt: string; negative: string; steps: number; seed: number; size: number; engine?: 'a1111' | 'comfy'; model?: string };
export const DEFAULT_STUDIO_SETTINGS: StudioSettings = { prompt: '', negative: '', steps: 20, seed: -1, size: 512 };
export function studioSettings(value: unknown, legacyPrompt = ''): StudioSettings {
  const row = value && typeof value === 'object' ? value as Partial<StudioSettings> : {};
  return {
    ...(row.engine === 'comfy' ? { engine: 'comfy' as const } : {}),
    ...(typeof row.model === 'string' && row.model.length <= 240 ? { model: row.model } : {}),
    prompt: typeof row.prompt === 'string' ? row.prompt.slice(0, 4000) : legacyPrompt.slice(0, 4000),
    negative: typeof row.negative === 'string' ? row.negative.slice(0, 4000) : '',
    steps: Number.isInteger(row.steps) && row.steps! >= 1 && row.steps! <= 40 ? row.steps! : 20,
    seed: Number.isInteger(row.seed) && row.seed! >= -1 && row.seed! <= 2147483647 ? row.seed! : -1,
    size: [256, 512, 768].includes(row.size!) ? row.size! : 512,
  };
}
export function studioSettingsError(settings: StudioSettings): string | undefined {
  if (!settings.prompt.trim()) return 'Enter a prompt to describe your image.';
  if (!Number.isInteger(settings.steps) || settings.steps < 1 || settings.steps > 40) return 'Steps must be a whole number from 1 to 40.';
  if (!Number.isInteger(settings.seed) || settings.seed < -1 || settings.seed > 2147483647) return 'Seed must be −1 for random, or a whole number from 0 to 2147483647.';
}
/** AUTOMATIC1111 supplies the actual seed in JSON info, including random runs. */
export function generatedSeed(info: unknown, fallback: number): number | undefined {
  try {
    const row = typeof info === 'string' ? JSON.parse(info) : info;
    const value = row?.seed ?? row?.all_seeds?.[0];
    if (Number.isInteger(value) && value >= 0 && value <= 2147483647) return value;
  } catch { /* A successful image can still have missing engine metadata. */ }
  return fallback >= 0 ? fallback : undefined;
}
