import { studioSettings, studioSettingsError, type StudioSettings } from './studio-settings.ts';

export const MAX_STUDIO_RECIPES = 8;
export const MAX_RECIPE_BYTES = 64_000;
export type StudioRecipe = { id: string; name: string; savedAt: number; settings: StudioSettings; checkpoint?: string };
export type RecipeContent = Pick<StudioRecipe, 'name' | 'settings' | 'checkpoint'>;

export function recipeDocument(recipe: RecipeContent) {
  return { format: 'realhub-studio-recipe', version: 1, name: recipe.name, settings: { ...recipe.settings }, ...(recipe.checkpoint ? { checkpoint: recipe.checkpoint } : {}) };
}

/** Imports are an allow-list of form values, never native engine instructions. */
export function parseRecipe(text: string): RecipeContent {
  if (text.length > MAX_RECIPE_BYTES) throw new Error('Choose a recipe JSON file smaller than 64 KB.');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('This file is not valid JSON. Choose an exported Realhub image recipe.'); }
  if (data?.format !== 'realhub-studio-recipe' || data.version !== 1 || !data.settings || typeof data.settings !== 'object') throw new Error('This is not a supported Realhub image recipe.');
  const row = data.settings;
  if (typeof row.prompt !== 'string' || row.prompt.length > 4000 || typeof row.negative !== 'string' || row.negative.length > 4000 || ![256, 512, 768].includes(row.size)) throw new Error('The recipe contains invalid prompts or image dimensions.');
  const failure = studioSettingsError(row);
  if (failure) throw new Error(failure);
  return {
    name: typeof data.name === 'string' && data.name.trim() ? data.name.trim().slice(0, 80) : row.prompt.trim().slice(0, 80),
    settings: studioSettings(row),
    ...(typeof data.checkpoint === 'string' && data.checkpoint.trim() ? { checkpoint: data.checkpoint.trim().slice(0, 200) } : {}),
  };
}

export function restoreRecipes(text: string | null): StudioRecipe[] {
  if (!text || text.length > MAX_RECIPE_BYTES * MAX_STUDIO_RECIPES) return [];
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return [];
    const rows: StudioRecipe[] = [];
    for (const row of data.slice(0, MAX_STUDIO_RECIPES)) {
      if (typeof row?.id !== 'string' || row.id.length > 100 || !Number.isFinite(row.savedAt) || row.savedAt <= 0 || rows.some(item => item.id === row.id)) continue;
      try { rows.push({ ...parseRecipe(JSON.stringify({ ...row, format: 'realhub-studio-recipe', version: 1 })), id: row.id, savedAt: row.savedAt }); } catch { /* Retain other valid recipes if one entry is damaged. */ }
    }
    return rows;
  } catch { return []; }
}

export function generatedCheckpoint(info: unknown): string | undefined {
  try {
    const data = typeof info === 'string' ? JSON.parse(info) : info;
    const value = data?.sd_model_name;
    return typeof value === 'string' && value.trim() ? value.trim().slice(0, 200) : undefined;
  } catch { return; }
}
