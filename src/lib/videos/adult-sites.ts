/** Outbound adult destinations. Non-embeddable sites belong in milestones. */

export type AdultSiteLink = {
  name: string;
  href: string;
  copy: string;
  /** True only when we integrate an official public embed/API path. */
  embeds?: boolean;
  group?:
    | "hub"
    | "tube"
    | "short"
    | "cam"
    | "anime"
    | "vr"
    | "games"
    | "comic"
    | "community"
    | "directory";
};

/**
 * Primary adult category / directory hub. Open ThePornDude for browsing categories,
 * then return here for in-app Eporner pulls.
 */
export const ADULT_CATEGORY_HUB: AdultSiteLink = {
  name: "ThePornDude",
  href: "https://theporndude.com/",
  copy: "Main adult category directory — browse tubes, cams, anime, games, and niche lists on ThePornDude.",
  group: "hub",
};

/**
 * Sites with no official unauthenticated discovery/embed path used by Reelcase.
 * Shown in the Adult milestones section (link-out only).
 */
export const ADULT_MILESTONE_LINKS: AdultSiteLink[] = [
  ADULT_CATEGORY_HUB,
  // Short-form / feed
  {
    name: "Pornhub Shorties",
    href: "https://www.pornhub.com/shorties/68f193dfebe67",
    copy: "Pornhub short-form shelf — open externally.",
    group: "short",
  },
  {
    name: "Tik.Porn",
    href: "https://tik.porn/",
    copy: "Short-form adult feed — open externally.",
    group: "short",
  },
  {
    name: "FikFap",
    href: "https://fikfap.com/",
    copy: "Short-form adult clips — open externally.",
    group: "short",
  },
  {
    name: "FYPTT",
    href: "https://fyptt.to/",
    copy: "Short-form adult destination — open externally.",
    group: "short",
  },
  {
    name: "Kwiky",
    href: "https://kwiky.com/",
    copy: "Short-form adult destination — open externally.",
    group: "short",
  },
  // Major tubes (also earlier list)
  {
    name: "Pornhub",
    href: "https://www.pornhub.com/",
    copy: "Major tube site — embeds often blocked; open externally.",
    group: "tube",
  },
  {
    name: "XVideos",
    href: "https://www.xvideos.com/",
    copy: "Large tube catalog — link-out (no official public search API used).",
    group: "tube",
  },
  {
    name: "xHamster",
    href: "https://xhamster.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "XNXX",
    href: "https://www.xnxx.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "RedTube",
    href: "https://www.redtube.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "SpankBang",
    href: "https://spankbang.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "TNAflix",
    href: "https://www.tnaflix.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "MilfNut",
    href: "https://milfnut.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "TabooTube",
    href: "https://www.tabootube.xxx/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "FamilyPornHD",
    href: "https://familypornhd.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "FamilyPorner",
    href: "https://familyporner.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
  },
  {
    name: "Banned Sex Tapes",
    href: "https://www.bannedsextapes.com/tube_tour2/index.html?nats=NzAuNC4zLjguMC4wLjAuMC4w",
    copy: "Tube / tour destination — open externally.",
    group: "tube",
  },
  // JAV / Asian
  {
    name: "MissAV",
    href: "https://missav.ws/dm265/en",
    copy: "JAV index — open externally.",
    group: "tube",
  },
  {
    name: "SupJAV",
    href: "https://supjav.com/",
    copy: "JAV destination — open externally.",
    group: "tube",
  },
  {
    name: "VJAV",
    href: "https://vjav.com/?promo=10718",
    copy: "JAV destination — open externally.",
    group: "tube",
  },
  {
    name: "Zenra",
    href: "https://www.zenra.net/",
    copy: "Japanese adult video index — open externally.",
    group: "anime",
  },
  // Imageboards / archives / comics
  {
    name: "Rule34.xxx",
    href: "https://rule34.xxx/",
    copy: "Imageboard — open externally.",
    group: "comic",
  },
  {
    name: "Rule34Video (via ThePornDude)",
    href: "https://theporndude.com/5289/rule34video",
    copy: "ThePornDude directory entry for Rule34Video.",
    group: "directory",
  },
  {
    name: "Pawchive",
    href: "https://pawchive.pw/",
    copy: "Archive destination — open externally.",
    group: "comic",
  },
  {
    name: "Kemono",
    href: "https://kemono.cr/",
    copy: "Creator archive — open externally.",
    group: "comic",
  },
  {
    name: "E-Hentai",
    href: "https://e-hentai.org/",
    copy: "Doujin / gallery index — open externally.",
    group: "comic",
  },
  {
    name: "MultPorn",
    href: "https://multporn.net/",
    copy: "Comics / animation index — open externally.",
    group: "comic",
  },
  {
    name: "AllPornComic",
    href: "https://allporncomic.com/",
    copy: "Adult comics — open externally.",
    group: "comic",
  },
  {
    name: "8muses",
    href: "https://8muses.io/",
    copy: "Adult comics — open externally.",
    group: "comic",
  },
  // Anime / hentai
  {
    name: "Hanime",
    href: "https://hanime.tv/",
    copy: "Hentai streaming destination — open externally.",
    group: "anime",
  },
  {
    name: "HentaiHaven",
    href: "https://hentaihaven.xxx/",
    copy: "Anime / hentai destination — open on their site.",
    group: "anime",
  },
  {
    name: "Xanimu",
    href: "https://xanimu.com/",
    copy: "Anime adult destination — open externally.",
    group: "anime",
  },
  {
    name: "Fakku",
    href: "https://www.fakku.net/",
    copy: "Hentai / doujin storefront — accounts and paywalls stay on Fakku.",
    group: "anime",
  },
  // Games
  {
    name: "Nutaku",
    href: "https://www.nutaku.net/home/",
    copy: "Adult games platform — open externally.",
    group: "games",
  },
  {
    name: "F95zone",
    href: "https://f95zone.to/",
    copy: "Adult games forum / index — open externally.",
    group: "games",
  },
  {
    name: "PornGamesHub",
    href: "https://porngameshub.com/",
    copy: "Adult games hub — open externally.",
    group: "games",
  },
  {
    name: "GamCore",
    href: "https://gamcore.com/",
    copy: "Adult games — open externally.",
    group: "games",
  },
  {
    name: "Fap-Nation",
    href: "https://fap-nation.com/",
    copy: "Adult games index — open externally.",
    group: "games",
  },
  {
    name: "LewdZone",
    href: "https://lewdzone.com/",
    copy: "Adult games index — open externally.",
    group: "games",
  },
  {
    name: "itch.io NSFW free",
    href: "https://itch.io/games/free/nsfw",
    copy: "Free NSFW games on itch.io — open externally.",
    group: "games",
  },
  // VR
  {
    name: "VRPorn",
    href: "https://vrporn.com/",
    copy: "VR adult catalog — open externally.",
    group: "vr",
  },
  {
    name: "VRBangers",
    href: "https://vrbangers.com/",
    copy: "VR studio site — open externally.",
    group: "vr",
  },
  // Cam / chat
  {
    name: "MyFreeCams",
    href: "https://www.myfreecams.com/#Homepage",
    copy: "Live cam homepage — open on MyFreeCams.",
    group: "cam",
  },
  {
    name: "Emerald Chat",
    href: "https://emeraldchat.com/",
    copy: "Cam / chat — open Emerald Chat.",
    group: "cam",
  },
  // Community / niche directories via ThePornDude
  {
    name: "Adult DVD Talk",
    href: "https://forum.adultdvdtalk.com/",
    copy: "Community forum — open externally.",
    group: "community",
  },
  {
    name: "WikiFeet (via ThePornDude)",
    href: "https://theporndude.com/4397/wikifeet",
    copy: "ThePornDude directory entry for WikiFeet.",
    group: "directory",
  },
  {
    name: "MrSkin (via ThePornDude)",
    href: "https://theporndude.com/578/mrskin",
    copy: "ThePornDude directory entry for MrSkin.",
    group: "directory",
  },
];

/**
 * Destinations with an official public embed/API path Reelcase actually uses.
 * Eporner API v2 + iframe embeds: https://www.eporner.com/api/v2/
 */
export const ADULT_EMBED_LINKS: AdultSiteLink[] = [
  {
    name: "Eporner",
    href: "https://www.eporner.com/",
    copy: "Official public API + iframe embeds power in-app adult discovery at YouTube/Twitch scale.",
    embeds: true,
    group: "tube",
  },
];

/** Deduplicate by href while preserving first-seen order. */
function dedupeLinks(links: AdultSiteLink[]): AdultSiteLink[] {
  const seen = new Set<string>();
  const out: AdultSiteLink[] = [];
  for (const link of links) {
    const key = link.href.replace(/\/+$/, "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(link);
  }
  return out;
}

/** All visible adult outbound links (embed sources + milestones). */
export const ADULT_SITE_LINKS: AdultSiteLink[] = dedupeLinks([
  ...ADULT_EMBED_LINKS,
  ...ADULT_MILESTONE_LINKS,
]);

export const EPORNER_FOLDER_ID = "eporner:discover";

export const EPORNER_FOLDER = {
  id: EPORNER_FOLDER_ID,
  name: "Eporner",
  kind: "eporner" as const,
  videoCount: 0,
  adult: true,
};

/** Split Eporner keyword strings into stable local tags for browse/filter. */
export function epornerKeywordTags(keywords: string, limit = 24): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of keywords.split(/[,|;/]+/)) {
    const tag = part.trim().toLowerCase().replace(/\s+/g, " ");
    if (tag.length < 2 || tag.length > 48) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= limit) break;
  }
  return out;
}
