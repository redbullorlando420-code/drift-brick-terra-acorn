/** Stable provider-neutral categories for Adult browse, stats, and recommendations. */
type Rule = { genre: string; meta: string; aliases: readonly string[] };
const RULES: readonly Rule[] = [
  { genre: "genre-amateur", meta: "meta-production-amateur", aliases: ["amateur", "verified amateurs", "reality", "casting"] },
  { genre: "genre-performer", meta: "meta-performer", aliases: ["pornstar", "celebrity", "celeb", "verified models"] },
  { genre: "genre-fantasy", meta: "meta-roleplay", aliases: ["role play", "roleplay", "cosplay", "parody", "step fantasy", "taboo"] },
  { genre: "genre-fetish", meta: "meta-fetish", aliases: ["fetish", "feet", "bondage", "bdsm", "femdom", "toys", "vr", "virtual reality"] },
  { genre: "genre-group", meta: "meta-group", aliases: ["threesome", "group", "party", "orgy", "gangbang", "thruple"] },
  { genre: "genre-couples", meta: "meta-couples", aliases: ["couples", "verified couples", "romantic", "cuckold"] },
  { genre: "genre-solo", meta: "meta-solo", aliases: ["solo female", "solo male", "masturbation", "striptease"] },
  { genre: "genre-live", meta: "meta-live", aliases: ["webcam", "live", "interactive"] },
  { genre: "genre-animation", meta: "meta-animation", aliases: ["hentai", "cartoon", "manhwa", "jav"] },
  { genre: "genre-pov", meta: "meta-camera-style", aliases: ["pov", "compilation", "behind the scenes"] },
  { genre: "genre-vintage", meta: "meta-era", aliases: ["vintage", "classic", "retro"] },
  { genre: "genre-regional", meta: "meta-region", aliases: ["latina", "asian", "ebony", "arab", "brazilian", "euro", "japanese", "korean", "indian", "czech", "russian"] },
];
function clean(value: string) { return value.trim().toLowerCase().replace(/^fetish-/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " "); }
export function adultTaxonomyTags(value: string): string[] {
  const key = clean(value);
  if (!key || /https?|\bwww\b|redgifs|eporner|redtube/.test(key)) return [];
  return [...new Set(RULES.filter((rule) => rule.aliases.some((alias) => key === alias || key.includes(alias))).flatMap((rule) => [rule.genre, rule.meta]))];
}
export function isAdultGenreTag(tag: string) { return tag.startsWith("genre-"); }
export function isAdultMetaTaxonomyTag(tag: string) { return tag.startsWith("meta-"); }
export function adultTaxonomyLabel(tag: string) { return tag.replace(/^(?:genre|meta)-/, "").replace(/-/g, " "); }
