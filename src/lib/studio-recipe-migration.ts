import { modelIdentity, type RecipeContent, type StudioRecipe } from "./studio-recipes.ts";
import { studioSettings } from "./studio-settings.ts";
export type StudioParameterContract = {
  version: 1;
  adapterId: string;
  engine: "a1111" | "comfy";
  source: "companion-adapter";
  sizes: number[];
  steps: { min: number; max: number; default: number };
  seed: { min: number; max: number };
  sampler: string;
  scheduler: string;
  guidance: number;
  turboGuidance: number;
  denoise: number;
};
export type RecipeParameterSchema = { version: 1; adapterId: string; engine: "a1111" | "comfy" };
export type RecipeConversion = {
  version: 1;
  sourceId: string;
  sourceName: string;
  sourceSavedAt: number;
  convertedAt: number;
  changes: string[];
};
export function readStudioParameterContract(raw: unknown): StudioParameterContract {
  const r = raw as StudioParameterContract;
  if (
    !r ||
    r.version !== 1 ||
    !["a1111", "comfy"].includes(r.engine) ||
    r.adapterId !== r.engine + "-form-v1" ||
    r.source !== "companion-adapter" ||
    !Array.isArray(r.sizes) ||
    !r.sizes.length ||
    r.sizes.length > 3 ||
    new Set(r.sizes).size !== r.sizes.length ||
    r.sizes.some((n) => ![256, 512, 768].includes(n)) ||
    !Number.isInteger(r.steps?.min) ||
    !Number.isInteger(r.steps?.max) ||
    r.steps.min < 1 ||
    r.steps.max > 40 ||
    r.steps.min > r.steps.max ||
    !Number.isInteger(r.steps.default) ||
    r.steps.default < r.steps.min ||
    r.steps.default > r.steps.max ||
    r.seed?.min !== -1 ||
    r.seed.max !== 2147483647 ||
    typeof r.sampler !== "string" ||
    !r.sampler ||
    r.sampler.length > 80 ||
    typeof r.scheduler !== "string" ||
    !r.scheduler ||
    r.scheduler.length > 80 ||
    ![r.guidance, r.turboGuidance, r.denoise].every(Number.isFinite) ||
    r.guidance < 0 ||
    r.guidance > 100 ||
    r.turboGuidance < 0 ||
    r.turboGuidance > 100 ||
    r.denoise < 0 ||
    r.denoise > 1
  )
    throw Error(
      "No supported parameter contract was advertised. Check the current Companion/engine before converting recipes.",
    );
  return {
    version: 1,
    adapterId: r.adapterId,
    engine: r.engine,
    source: "companion-adapter",
    sizes: [...r.sizes],
    steps: { ...r.steps },
    seed: { ...r.seed },
    sampler: r.sampler,
    scheduler: r.scheduler,
    guidance: r.guidance,
    turboGuidance: r.turboGuidance,
    denoise: r.denoise,
  };
}
export function readRecipeParameterSchema(raw: unknown): RecipeParameterSchema {
  const r = raw as RecipeParameterSchema;
  if (
    !r ||
    r.version !== 1 ||
    !["a1111", "comfy"].includes(r.engine) ||
    r.adapterId !== r.engine + "-form-v1"
  )
    throw Error("Unsupported saved recipe parameter schema. The original recipe was kept.");
  return { version: 1, adapterId: r.adapterId, engine: r.engine };
}
export function readRecipeConversion(raw: unknown): RecipeConversion {
  const r = raw as RecipeConversion;
  if (
    !r ||
    r.version !== 1 ||
    typeof r.sourceId !== "string" ||
    !r.sourceId ||
    r.sourceId.length > 100 ||
    typeof r.sourceName !== "string" ||
    r.sourceName.length > 80 ||
    !Number.isSafeInteger(r.sourceSavedAt) ||
    r.sourceSavedAt < 0 ||
    !Number.isSafeInteger(r.convertedAt) ||
    r.convertedAt < 0 ||
    !Array.isArray(r.changes) ||
    r.changes.length > 16 ||
    r.changes.some((s) => typeof s !== "string" || s.length > 300)
  )
    throw Error("Invalid recipe conversion history.");
  return {
    version: 1,
    sourceId: r.sourceId,
    sourceName: r.sourceName,
    sourceSavedAt: r.sourceSavedAt,
    convertedAt: r.convertedAt,
    changes: [...r.changes],
  };
}
export function previewRecipeConversion(
  recipe: StudioRecipe,
  raw: unknown,
  model: string,
  now = Date.now(),
) {
  const c = readStudioParameterContract(raw);
  if (!model || model.length > 240 || /[\\/:\x00-\x1f]/.test(model))
    throw Error("Choose an advertised installed model before converting.");
  const old = recipe.provenance,
    changes: string[] = [],
    settings = { ...studioSettings(recipe.settings), engine: c.engine, model };
  const change = (field: string, before: unknown, after: unknown) => {
    if (before !== after)
      changes.push(field + ": " + String(before ?? "unrecorded") + " → " + String(after));
  };
  change("Parameter schema", recipe.parameterSchema?.adapterId, c.adapterId);
  change("Engine", recipe.settings.engine ?? "a1111", c.engine);
  change("Model", recipe.settings.model ?? recipe.checkpoint, model);
  if (!c.sizes.includes(settings.size)) {
    const next = c.sizes.includes(512) ? 512 : c.sizes[0]!;
    change("Square size", settings.size, next);
    settings.size = next;
  }
  const steps = Math.max(c.steps.min, Math.min(c.steps.max, settings.steps));
  change("Steps", settings.steps, steps);
  settings.steps = steps;
  const guidance = model.toLowerCase().includes("turbo") ? c.turboGuidance : c.guidance;
  for (const [field, before, after] of [
    ["Sampler", old?.sampler, c.sampler],
    ["Scheduler", old?.scheduler, c.scheduler],
    ["Guidance", old?.guidance, guidance],
    ["Denoise", old?.denoise, c.denoise],
  ] as const)
    change(field, before, after);
  const sameModel =
    modelIdentity(old?.modelName ?? recipe.settings.model ?? recipe.checkpoint ?? "") ===
      modelIdentity(model) && (recipe.settings.engine ?? "a1111") === c.engine;
  if (!sameModel && (old?.sha256 || old?.engineHash || old?.source))
    changes.push(
      "Model hash/source declarations dropped because the selected model or engine changed.",
    );
  const provenance = {
    ...(sameModel ? old : undefined),
    engine: c.engine,
    width: settings.size,
    height: settings.size,
    modelName: model,
    sampler: c.sampler,
    scheduler: c.scheduler,
    guidance,
    denoise: c.denoise,
  };
  const converted: RecipeContent = {
    name: (recipe.name + " · converted").slice(0, 80),
    settings,
    checkpoint: model,
    provenance,
    parameterSchema: { version: 1, adapterId: c.adapterId, engine: c.engine },
    conversion: {
      version: 1,
      sourceId: recipe.id,
      sourceName: recipe.name,
      sourceSavedAt: recipe.savedAt,
      convertedAt: now,
      changes,
    },
  };
  return {
    contract: c,
    converted,
    changes,
    unchanged: ["Prompt", "Negative prompt", "Seed"],
    original: recipe,
  };
}
