/** Expansive 18+ fetish / category chips for Adult pulls. Featured labels stay first. */

export const ADULT_FEATURED_FETISH_TAGS = [
  "milf",
  "double penetration",
  "dp",
  "roleplay",
  "feet",
  "cosplay",
] as const;

const ADULT_CATALOG_FETISH_TAGS = [
  "amateur",
  "anal",
  "asian",
  "bbc",
  "bbw",
  "bdsm",
  "big ass",
  "big tits",
  "blonde",
  "blowjob",
  "bondage",
  "brunette",
  "bukkake",
  "cam",
  "casting",
  "cheating",
  "compilation",
  "cosplay",
  "cowgirl",
  "creampie",
  "cuckold",
  "cumshot",
  "curvy",
  "deepthroat",
  "doggystyle",
  "ebony",
  "exhibitionist",
  "facesitting",
  "facial",
  "feet",
  "femdom",
  "fisting",
  "footjob",
  "gangbang",
  "goth",
  "group",
  "hairy",
  "handjob",
  "hentai",
  "homemade",
  "hotwife",
  "humiliation",
  "indian",
  "interracial",
  "japanese",
  "jav",
  "joi",
  "kissing",
  "latex",
  "latina",
  "lesbian",
  "lingerie",
  "massage",
  "masturbation",
  "mature",
  "mfm",
  "mmf",
  "nurse",
  "office",
  "oil",
  "orgy",
  "outdoor",
  "pantyhose",
  "pawg",
  "pegging",
  "petite",
  "pornstar",
  "pov",
  "public",
  "redhead",
  "rimming",
  "romantic",
  "rough",
  "secretary",
  "shower",
  "solo",
  "spanking",
  "squirt",
  "stepmom",
  "stockings",
  "strap-on",
  "swinging",
  "tattoo",
  "threesome",
  "thruple",
  "toys",
  "trans",
  "uniform",
  "vintage",
  "voyeur",
  "vr",
  "webcam",
  "wife",
  "yoga",
  "celebrity",
  "celeb",
  "manhwa",
  "taboo",
] as const;

function uniqueLower(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const tag = raw.trim().toLowerCase();
    if (tag.length < 2 || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

/** Featured first, then the rest of the catalog (stable, de-duped). */
export const ADULT_CURATED_FETISH_TAGS: string[] = uniqueLower([
  ...ADULT_FEATURED_FETISH_TAGS,
  ...ADULT_CATALOG_FETISH_TAGS,
]);

/** Keyword pages used when browsing "all" so shelves get richer fetish coverage. */
export const ADULT_DEEPEN_FETISH_QUERIES: string[] = uniqueLower([
  "milf",
  "double penetration",
  "roleplay",
  "feet",
  "cosplay",
  "anal",
  "lesbian",
  "gangbang",
  "cuckold",
  "creampie",
  "amateur",
  "voyeur",
  "bondage",
  "latina",
  "asian",
  "ebony",
  "threesome",
  "thruple",
  "pov",
  "public",
  "mature",
  "celebrity",
  "manhwa",
  "hentai",
]);

export function fetishSearchQuery(tag: string): string {
  const clean = tag.trim().toLowerCase();
  if (clean === "dp") return "double penetration";
  if (clean === "thruple") return "threesome";
  if (clean === "celeb") return "celebrity";
  return clean;
}
