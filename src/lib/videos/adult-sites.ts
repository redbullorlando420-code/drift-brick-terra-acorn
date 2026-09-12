/** Outbound adult destinations. Non-embeddable sites belong in milestones. */

import { ADULT_EXTRA_MILESTONES } from "./adult-milestones-extra";
export {
  ADULT_CURATED_FETISH_TAGS,
  ADULT_DEEPEN_FETISH_QUERIES,
  ADULT_FEATURED_FETISH_TAGS,
  fetishSearchQuery,
} from "./adult-fetishes";

export type AdultSiteLink = {
  name: string;
  href: string;
  copy: string;
  /** True only when we integrate an official public embed/API path. */
  embeds?: boolean;
  /** Stable source id used for source-* tags and Adult UI filters. */
  sourceId?: string;
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
 * then return here for in-app Eporner / RedTube pulls.
 */
export const ADULT_CATEGORY_HUB: AdultSiteLink = {
  name: "ThePornDude",
  href: "https://theporndude.com/",
  copy: "Main adult category directory — browse tubes, cams, anime, games, and niche lists on ThePornDude.",
  group: "hub",
  sourceId: "theporndude",
};

/**
 * Sites with no official unauthenticated discovery/embed path used by Reelcase.
 * Shown in the Adult milestones section (link-out only). Source ids still appear
 * as labeled source-tag chips so users can jump out by site.
 */
export const ADULT_MILESTONE_LINKS: AdultSiteLink[] = [
  ADULT_CATEGORY_HUB,
  // Short-form / feed
  {
    name: "Pornhub Shorties",
    href: "https://www.pornhub.com/shorties/68f193dfebe67",
    copy: "Pornhub short-form shelf — open externally.",
    group: "short",
    sourceId: "pornhub-shorties",
  },
  {
    name: "Tik.Porn",
    href: "https://tik.porn/",
    copy: "Short-form adult feed — open externally.",
    group: "short",
    sourceId: "tikporn",
  },
  {
    name: "FikFap",
    href: "https://fikfap.com/",
    copy: "Short-form adult clips — open externally.",
    group: "short",
    sourceId: "fikfap",
  },
  {
    name: "FYPTT",
    href: "https://fyptt.to/",
    copy: "Short-form adult destination — open externally.",
    group: "short",
    sourceId: "fyptt",
  },
  {
    name: "Kwiky",
    href: "https://kwiky.com/",
    copy: "Short-form adult destination — open externally.",
    group: "short",
    sourceId: "kwiky",
  },
  // Helper-list tubes (milestones unless an official public API is wired)
  {
    name: "Pornhub",
    href: "https://www.pornhub.com/",
    copy: "Major tube site — no stable public search API; open externally.",
    group: "tube",
    sourceId: "pornhub",
  },
  {
    name: "XVideos",
    href: "https://www.xvideos.com/",
    copy: "Large tube catalog — link-out (no official public search API used).",
    group: "tube",
    sourceId: "xvideos",
  },
  {
    name: "xHamster",
    href: "https://xhamster.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "xhamster",
  },
  {
    name: "XNXX",
    href: "https://www.xnxx.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "xnxx",
  },
  {
    name: "HQporner",
    href: "https://hqporner.com/",
    copy: "HD tube destination — open externally (no public API).",
    group: "tube",
    sourceId: "hqporner",
  },
  {
    name: "Beeg",
    href: "https://beeg.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "beeg",
  },
  {
    name: "YourPorn",
    href: "https://sxyprn.com/",
    copy: "YourPorn / sxyprn destination — open externally.",
    group: "tube",
    sourceId: "yourporn",
  },
  {
    name: "SpankBang",
    href: "https://spankbang.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "spankbang",
  },
  {
    name: "XMoviesForYou",
    href: "https://xmoviesforyou.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "xmoviesforyou",
  },
  {
    name: "PornTrex",
    href: "https://www.porntrex.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "porntrex",
  },
  {
    name: "YouJizz",
    href: "https://www.youjizz.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "youjizz",
  },
  {
    name: "YouPorn",
    href: "https://www.youporn.com/",
    copy: "Tube destination — former HubTraffic API retired; open externally.",
    group: "tube",
    sourceId: "youporn",
  },
  {
    name: "PornOne",
    href: "https://pornone.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "pornone",
  },
  {
    name: "3Movs",
    href: "https://www.3movs.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "3movs",
  },
  {
    name: "Tube8",
    href: "https://www.tube8.com/",
    copy: "Tube destination — former HubTraffic API retired; open externally.",
    group: "tube",
    sourceId: "tube8",
  },
  {
    name: "PornDig",
    href: "https://www.porndig.com/",
    copy: "Tube / index destination — open externally.",
    group: "tube",
    sourceId: "porndig",
  },
  {
    name: "CumLouder",
    href: "https://www.cumlouder.com/",
    copy: "Studio / tube destination — open externally.",
    group: "tube",
    sourceId: "cumlouder",
  },
  {
    name: "TXXX",
    href: "https://txxx.com/",
    copy: "Tube destination — undocumented JSON only; no safe public embed path. Open externally.",
    group: "tube",
    sourceId: "txxx",
  },
  {
    name: "PornDoe",
    href: "https://porndoe.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "porndoe",
  },
  {
    name: "PornHat",
    href: "https://www.pornhat.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "pornhat",
  },
  {
    name: "OK.xxx",
    href: "https://ok.xxx/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "okxxx",
  },
  {
    name: "Porn00",
    href: "https://www.porn00.org/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "porn00",
  },
  {
    name: "PornHoarder",
    href: "https://pornhoarder.tv/",
    copy: "Index destination — open externally.",
    group: "tube",
    sourceId: "pornhoarder",
  },
  {
    name: "YesPornVip",
    href: "https://www.yesporn.vip/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "yespornvip",
  },
  {
    name: "JustPorn",
    href: "https://justporn.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "justporn",
  },
  {
    name: "PornGo",
    href: "https://www.porngo.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "porngo",
  },
  {
    name: "WhoresHub",
    href: "https://www.whoreshub.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "whoreshub",
  },
  {
    name: "PornHD3x",
    href: "https://www.pornhd3x.tv/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "pornhd3x",
  },
  {
    name: "XXXFiles",
    href: "https://www.xxxfiles.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "xxxfiles",
  },
  {
    name: "TNAflix",
    href: "https://www.tnaflix.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "tnaflix",
  },
  {
    name: "PussySpace",
    href: "https://www.pussyspace.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "pussyspace",
  },
  {
    name: "PornDish",
    href: "https://www.porndish.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "porndish",
  },
  {
    name: "FullPorner",
    href: "https://fullporner.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "fullporner",
  },
  {
    name: "Porn4Days",
    href: "https://porn4days.biz/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "porn4days",
  },
  {
    name: "KRX18",
    href: "https://krx18.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "krx18",
  },
  {
    name: "ParadiseHill",
    href: "https://en.paradisehill.cc/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "paradisehill",
  },
  {
    name: "TrendyPorn",
    href: "https://www.trendyporn.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "trendyporn",
  },
  {
    name: "PornHD8k",
    href: "https://www.pornhd8k.net/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "pornhd8k",
  },
  // Earlier milestones retained
  {
    name: "MilfNut",
    href: "https://milfnut.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "milfnut",
  },
  {
    name: "TabooTube",
    href: "https://www.tabootube.xxx/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "tabootube",
  },
  {
    name: "FamilyPornHD",
    href: "https://familypornhd.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "familypornhd",
  },
  {
    name: "FamilyPorner",
    href: "https://familyporner.com/",
    copy: "Tube destination — open externally.",
    group: "tube",
    sourceId: "familyporner",
  },
  {
    name: "Banned Sex Tapes",
    href: "https://www.bannedsextapes.com/tube_tour2/index.html?nats=NzAuNC4zLjguMC4wLjAuMC4w",
    copy: "Tube / tour destination — open externally.",
    group: "tube",
    sourceId: "bannedsextapes",
  },
  // JAV / Asian
  {
    name: "MissAV",
    href: "https://missav.ws/dm265/en",
    copy: "JAV index — open externally.",
    group: "tube",
    sourceId: "missav",
  },
  {
    name: "SupJAV",
    href: "https://supjav.com/",
    copy: "JAV destination — open externally.",
    group: "tube",
    sourceId: "supjav",
  },
  {
    name: "VJAV",
    href: "https://vjav.com/?promo=10718",
    copy: "JAV destination — open externally.",
    group: "tube",
    sourceId: "vjav",
  },
  {
    name: "Zenra",
    href: "https://www.zenra.net/",
    copy: "Japanese adult video index — open externally.",
    group: "anime",
    sourceId: "zenra",
  },
  // Imageboards / archives / comics
  {
    name: "Rule34.xxx",
    href: "https://rule34.xxx/",
    copy: "Imageboard — open externally.",
    group: "comic",
    sourceId: "rule34",
  },
  {
    name: "Rule34Video (via ThePornDude)",
    href: "https://theporndude.com/5289/rule34video",
    copy: "ThePornDude directory entry for Rule34Video.",
    group: "directory",
    sourceId: "rule34video",
  },
  {
    name: "Pawchive",
    href: "https://pawchive.pw/",
    copy: "Archive destination — open externally.",
    group: "comic",
    sourceId: "pawchive",
  },
  {
    name: "Kemono",
    href: "https://kemono.cr/",
    copy: "Creator archive — open externally.",
    group: "comic",
    sourceId: "kemono",
  },
  {
    name: "E-Hentai",
    href: "https://e-hentai.org/",
    copy: "Doujin / gallery index — open externally.",
    group: "comic",
    sourceId: "ehentai",
  },
  {
    name: "MultPorn",
    href: "https://multporn.net/",
    copy: "Comics / animation index — open externally.",
    group: "comic",
    sourceId: "multporn",
  },
  {
    name: "AllPornComic",
    href: "https://allporncomic.com/",
    copy: "Adult comics — open externally.",
    group: "comic",
    sourceId: "allporncomic",
  },
  {
    name: "8muses",
    href: "https://8muses.io/",
    copy: "Adult comics — open externally.",
    group: "comic",
    sourceId: "8muses",
  },
  // Anime / hentai
  {
    name: "Hanime",
    href: "https://hanime.tv/",
    copy: "Hentai streaming destination — open externally.",
    group: "anime",
    sourceId: "hanime",
  },
  {
    name: "HentaiHaven",
    href: "https://hentaihaven.xxx/",
    copy: "Anime / hentai destination — open on their site.",
    group: "anime",
    sourceId: "hentaihaven",
  },
  {
    name: "Xanimu",
    href: "https://xanimu.com/",
    copy: "Anime adult destination — open externally.",
    group: "anime",
    sourceId: "xanimu",
  },
  {
    name: "Fakku",
    href: "https://www.fakku.net/",
    copy: "Hentai / doujin storefront — accounts and paywalls stay on Fakku.",
    group: "anime",
    sourceId: "fakku",
  },
  // Games
  {
    name: "Nutaku",
    href: "https://www.nutaku.net/home/",
    copy: "Adult games platform — open externally.",
    group: "games",
    sourceId: "nutaku",
  },
  {
    name: "F95zone",
    href: "https://f95zone.to/",
    copy: "Adult games forum / index — open externally.",
    group: "games",
    sourceId: "f95zone",
  },
  {
    name: "PornGamesHub",
    href: "https://porngameshub.com/",
    copy: "Adult games hub — open externally.",
    group: "games",
    sourceId: "porngameshub",
  },
  {
    name: "GamCore",
    href: "https://gamcore.com/",
    copy: "Adult games — open externally.",
    group: "games",
    sourceId: "gamcore",
  },
  {
    name: "Fap-Nation",
    href: "https://fap-nation.com/",
    copy: "Adult games index — open externally.",
    group: "games",
    sourceId: "fapnation",
  },
  {
    name: "LewdZone",
    href: "https://lewdzone.com/",
    copy: "Adult games index — open externally.",
    group: "games",
    sourceId: "lewdzone",
  },
  {
    name: "itch.io NSFW free",
    href: "https://itch.io/games/free/nsfw",
    copy: "Free NSFW games on itch.io — open externally.",
    group: "games",
    sourceId: "itch-nsfw",
  },
  // VR
  {
    name: "VRPorn",
    href: "https://vrporn.com/",
    copy: "VR adult catalog — open externally.",
    group: "vr",
    sourceId: "vrporn",
  },
  {
    name: "VRBangers",
    href: "https://vrbangers.com/",
    copy: "VR studio site — open externally.",
    group: "vr",
    sourceId: "vrbangers",
  },
  // Cam / chat
  {
    name: "Emerald Chat",
    href: "https://emeraldchat.com/",
    copy: "Cam / chat — open Emerald Chat.",
    group: "cam",
    sourceId: "emeraldchat",
  },
  {
    name: "Stripchat",
    href: "https://stripchat.com/",
    copy: "Live rooms — official embed path is not playable in-app, so this stays a live deep-link.",
    group: "cam",
    sourceId: "stripchat",
  },
  {
    name: "BongaCams",
    href: "https://bongacams.com/",
    copy: "Live cam directory — no public room-list API we can play, open the live grid.",
    group: "cam",
    sourceId: "bongacams",
  },
  {
    name: "Cam4",
    href: "https://www.cam4.com/",
    copy: "Live cam directory — public HTML listing only, open the live grid.",
    group: "cam",
    sourceId: "cam4",
  },
  {
    name: "Flirt4Free",
    href: "https://www.flirt4free.com/",
    copy: "Live cam destination — no stable public JSON, open the live grid.",
    group: "cam",
    sourceId: "flirt4free",
  },
  {
    name: "Streamate",
    href: "https://www.streamate.com/",
    copy: "Live cam destination — no unauthenticated room API, open the live grid.",
    group: "cam",
    sourceId: "streamate",
  },
  {
    name: "LiveJasmin",
    href: "https://www.livejasmin.com/",
    copy: "Live cam destination — no public model list, open the live grid.",
    group: "cam",
    sourceId: "livejasmin",
  },
  // Community / niche directories via ThePornDude
  {
    name: "Adult DVD Talk",
    href: "https://forum.adultdvdtalk.com/",
    copy: "Community forum — open externally.",
    group: "community",
    sourceId: "adultdvdtalk",
  },
  {
    name: "WikiFeet (via ThePornDude)",
    href: "https://theporndude.com/4397/wikifeet",
    copy: "ThePornDude directory entry for WikiFeet.",
    group: "directory",
    sourceId: "wikifeet",
  },
  {
    name: "MrSkin (via ThePornDude)",
    href: "https://theporndude.com/578/mrskin",
    copy: "ThePornDude directory entry for MrSkin.",
    group: "directory",
    sourceId: "mrskin",
  },
  ...(ADULT_EXTRA_MILESTONES as unknown as AdultSiteLink[]),
];

/**
 * Destinations with an official public embed/API path Reelcase actually uses.
 * - Eporner API v2 + iframe embeds: https://www.eporner.com/api/v2/
 * - RedTube webmaster API + embed.redtube.com: https://api.redtube.com/
 * - Chaturbate public affiliate rooms JSON + /embed/{user}/
 * - CamSoda public /api/v1/browse/online + room pages (no X-Frame-Options)
 * - MyFreeCams public php/online_models.php + #username room deep-links
 * - Reddit public Atom RSS (.json is 403 unauthenticated) for curated 18+ subs
 */
export const ADULT_EMBED_LINKS: AdultSiteLink[] = [
  {
    name: "Eporner",
    href: "https://www.eporner.com/",
    copy: "Official public API + iframe embeds power in-app adult discovery at YouTube/Twitch scale.",
    embeds: true,
    group: "tube",
    sourceId: "eporner",
  },
  {
    name: "RedTube",
    href: "https://www.redtube.com/",
    copy: "Official webmaster API (search, tags, categories) + public embeds for in-app playback.",
    embeds: true,
    group: "tube",
    sourceId: "redtube",
  },
  {
    name: "Chaturbate",
    href: "https://chaturbate.com/",
    copy: "Public affiliate rooms API + official embed path — live backup when tube APIs fail.",
    embeds: true,
    group: "cam",
    sourceId: "chaturbate",
  },
  {
    name: "CamSoda",
    href: "https://www.camsoda.com/",
    copy: "Public online-rooms JSON + room pages that iframe without X-Frame-Options — live backup next to Chaturbate.",
    embeds: true,
    group: "cam",
    sourceId: "camsoda",
  },
  {
    name: "MyFreeCams",
    href: "https://www.myfreecams.com/#Homepage",
    copy: "Public online-model list + #username room links. No official iframe player, so cards open MFC live.",
    embeds: true,
    group: "cam",
    sourceId: "myfreecams",
  },
  {
    name: "Reddit (18+)",
    href: "https://www.reddit.com/r/nsfw/",
    copy: "Public Atom RSS previews from curated 18+ subs. Unauthenticated .json is blocked; posts open on Reddit.",
    embeds: true,
    group: "community",
    sourceId: "reddit",
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

/** Source-tag chips for Adult UI (pull sources first, then milestones). */
export const ADULT_SOURCE_OPTIONS: { id: string; label: string; href?: string; pull: boolean }[] =
  dedupeLinks([...ADULT_EMBED_LINKS, ...ADULT_MILESTONE_LINKS])
    .filter((link) => Boolean(link.sourceId))
    .map((link) => ({
      id: link.sourceId!,
      label: link.name,
      href: link.href,
      pull: Boolean(link.embeds),
    }));

export type AdultPullProvider = "eporner" | "redtube" | "chaturbate" | "camsoda" | "myfreecams" | "reddit";

export const ADULT_PULL_PROVIDERS: AdultPullProvider[] = ["eporner", "redtube", "chaturbate", "camsoda", "myfreecams", "reddit"];

/** Curated 18+ subs only. Public Atom RSS — no OAuth, no logged-in scrape. */
export const ADULT_REDDIT_SUBS = [
  "nsfw",
  "RealGirls",
  "NSFW_GIF",
  "Amateur",
  "gonewild",
  "nsfw_gifs",
  "adorableporn",
  "maturemilf",
] as const;

export const EPORNER_FOLDER_ID = "eporner:discover";
export const REDTUBE_FOLDER_ID = "redtube:discover";
export const CHATURBATE_FOLDER_ID = "chaturbate:discover";
export const CAMSODA_FOLDER_ID = "camsoda:discover";
export const MYFREECAMS_FOLDER_ID = "myfreecams:discover";
export const REDDIT_FOLDER_ID = "reddit:discover";

export const EPORNER_FOLDER = {
  id: EPORNER_FOLDER_ID,
  name: "Eporner",
  kind: "eporner" as const,
  videoCount: 0,
  adult: true,
};

export const REDTUBE_FOLDER = {
  id: REDTUBE_FOLDER_ID,
  name: "RedTube",
  kind: "redtube" as const,
  videoCount: 0,
  adult: true,
};

export const CHATURBATE_FOLDER = {
  id: CHATURBATE_FOLDER_ID,
  name: "Chaturbate",
  kind: "chaturbate" as const,
  videoCount: 0,
  adult: true,
};

export const CAMSODA_FOLDER = {
  id: CAMSODA_FOLDER_ID,
  name: "CamSoda",
  kind: "camsoda" as const,
  videoCount: 0,
  adult: true,
};

export const MYFREECAMS_FOLDER = {
  id: MYFREECAMS_FOLDER_ID,
  name: "MyFreeCams",
  kind: "myfreecams" as const,
  videoCount: 0,
  adult: true,
};

export const REDDIT_FOLDER = {
  id: REDDIT_FOLDER_ID,
  name: "Reddit (18+)",
  kind: "reddit" as const,
  videoCount: 0,
  adult: true,
};

export const ADULT_FOLDER_BY_PROVIDER = {
  eporner: EPORNER_FOLDER,
  redtube: REDTUBE_FOLDER,
  chaturbate: CHATURBATE_FOLDER,
  camsoda: CAMSODA_FOLDER,
  myfreecams: MYFREECAMS_FOLDER,
  reddit: REDDIT_FOLDER,
} as const;

export const ADULT_FOLDER_IDS = [
  EPORNER_FOLDER_ID,
  REDTUBE_FOLDER_ID,
  CHATURBATE_FOLDER_ID,
  CAMSODA_FOLDER_ID,
  MYFREECAMS_FOLDER_ID,
  REDDIT_FOLDER_ID,
] as const;

export function adultFolderId(provider: AdultPullProvider) {
  return ADULT_FOLDER_BY_PROVIDER[provider].id;
}

export function adultRemoteLabel(kind?: string) {
  switch (kind) {
    case "eporner":
      return "Eporner";
    case "redtube":
      return "RedTube";
    case "chaturbate":
      return "Chaturbate";
    case "camsoda":
      return "CamSoda";
    case "myfreecams":
      return "MyFreeCams";
    case "reddit":
      return "Reddit";
    case "youtube":
      return "YouTube";
    case "twitch":
      return "Twitch";
    default:
      return "Adult";
  }
}

export function isAdultPullKind(kind?: string) {
  return kind === "eporner" || kind === "redtube" || kind === "chaturbate" || kind === "camsoda" || kind === "myfreecams" || kind === "reddit";
}

export function adultSourceTag(provider: string) {
  return `source-${provider.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/** Split provider keyword / fetish strings into stable local tags for browse/filter. */
export function adultKeywordTags(keywords: string, limit = 24): string[] {
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

/** @deprecated Prefer adultKeywordTags — kept for existing imports. */
export function epornerKeywordTags(keywords: string, limit = 24): string[] {
  return adultKeywordTags(keywords, limit);
}

/** Normalize RedTube / Eporner fetish labels into fetish-* tags plus raw keywords. */
export function adultFetishTags(labels: string[], limit = 36): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of labels) {
    const base = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (base.length < 2 || base.length > 48) continue;
    const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(base);
    out.push(`fetish-${slug}`);
    if (out.length >= limit) break;
  }
  return out;
}

