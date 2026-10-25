import type { LibraryVideo, VideoMetadataProvenance } from './types.ts';
import { animeTitleInfo } from './anime-title.ts';
import { ADULT_PULL_PROVIDERS } from './adult-providers.ts';
const adultProviders=new Set<string>(ADULT_PULL_PROVIDERS);
const isAdultPullKind=(kind:string|undefined)=>adultProviders.has(kind??'');

const nonFilm = /\b(trailer|teaser|review|reaction|recap|explained|analysis|gameplay|playthrough|walkthrough|speedrun|highlights?|compilation|podcast|interview|tutorial|behind the scenes|making of|deleted scenes?|movie clips?|film clips?|music video|amv|vlog|webinar|screen recording|livestream|dashcam)\b/i;
const episodes = /\b(?:s\d{1,2}[ ._-]*e\d{1,3}|season\s*\d+|episode\s*\d+|ep\.?\s*\d+)\b/i;
const animeShows = /\b(naruto|boruto|one piece|bleach|dragon ball|attack on titan|shingeki no kyojin|demon slayer|kimetsu no yaiba|jujutsu kaisen|frieren|sousou no frieren|fullmetal alchemist|death note|hunter x hunter|my hero academia|boku no hero|cowboy bebop|neon genesis evangelion|sailor moon|sword art online|spy x family|chainsaw man|vinland saga|mob psycho|one punch man|haikyuu|gintama|inuyasha|yuyu hakusho|yū yū hakusho|solo leveling|dandadan|dan da dan)\b/i;
const cleanTags = (tags: readonly string[]) => tags.map(tag => tag.toLowerCase().replace(/^#|^(?:keyword|genre|topic)-/g,'').replace(/[-_]+/g,' '));

/** Membership is evidence, not a promise of film-database identification. */
export function movieIdentityEvidence(video: LibraryVideo, tags: readonly string[] = [], folderName = '', provenance?: VideoMetadataProvenance): string | undefined {
  if (video.isSample || video.remote?.live || isAdultPullKind(video.remote?.kind) || video.remote?.kind === 'twitch'
    || video.remote?.youtubeType === 'upcoming' || video.remote?.youtubeType === 'short') return;
  const title = video.name.slice(0,600).replace(/[._]+/g,' '), saved=cleanTags(tags);
  if (nonFilm.test(title) || episodes.test(title) || ['episode','special'].includes(animeTitleInfo(video.name).format)) return;
  if (/\b(?:anime|manga)\b/i.test(video.genre ?? '') && !/\b(?:movie|film|theatrical)\b/i.test(title) && !saved.some(tag => /^(?:anime movie|anime film|movie|film)$/.test(tag))) return;
  const movieTag = (tag:string) => /^(?:movies?|films?|full movie|feature film|anime movie|anime film)$/.test(cleanTags([tag])[0]??'');
  const trustedTags = !provenance || provenance.lockedFields?.includes('tags') || Object.entries(provenance.tags??{}).some(([tag,source])=>movieTag(tag)&&(source==='manual'||source==='legacy'));
  if (trustedTags && saved.some(movieTag)) return 'Saved movie tag';
  if (/\b(full (?:length )?(?:movie|film|documentary)|complete (?:movie|film)|feature film|theatrical (?:movie|film))\b/i.test(title)) return 'Full-film title';
  if (video.collection === 'classics') return 'Curated classic';
  if (/^(?:movies?|films?|cinema)$/i.test(video.genre ?? '')) return 'Movie category';
  if (!video.remote && (/(?:^|[\\/])(?:movies?|films?|cinema)(?:[\\/]|$)/i.test(video.path) || /^(?:movies?|films?|cinema)$/i.test(folderName.trim()))) return 'Local movie folder';
  if (!video.remote && (video.year || /\b(?:19\d{2}|20\d{2})\b/.test(title)) && (!video.duration || video.duration >= 40*60)) return 'Local feature title with release year';
  if (!video.remote && video.duration! >= 40*60 && /^(?:action|comedy|drama|horror|thriller|romance|science fiction|documentary)$/i.test(video.genre??'')) return 'Feature-length movie category';
}
export function movieEvidence(video: LibraryVideo, tags: readonly string[] = [], folderName = '', provenance?: VideoMetadataProvenance): string | undefined {
  if (!Number.isFinite(video.duration) || video.duration! <= 600) return;
  const evidence = movieIdentityEvidence(video, tags, folderName, provenance);
  return evidence ? `${evidence} · over 10 minutes` : undefined;
}

/** Anime is narrower than a topic mention. Manga, games, commentary and
 * promotional extras remain in the general library and Topic Explorer. */
export function animeEvidence(video: LibraryVideo, tags: readonly string[] = [], provenance?:VideoMetadataProvenance): string | undefined {
  if (video.remote?.live || video.remote?.youtubeType === 'upcoming' || video.remote?.youtubeType === 'short' || isAdultPullKind(video.remote?.kind) || video.remote?.kind === 'twitch') return;
  const title=video.name.slice(0,600).replace(/[._]+/g,' '), saved=cleanTags(tags);
  const format = animeTitleInfo(video.name).format;
  if (nonFilm.test(title) || /\b(manga (?:review|chapter|discussion)|anime (?:discussion|news|ranking)|cosplay|tier list|opening theme|ending theme|soundtrack|ost|anime edits?|anime recommendations?|top \d+ anime|best anime|anime news|anime merch|anime figures?|unboxing|lofi|ambien(?:t|ce)|anime music|anime scenes?|ultimate ninja|shinobi striker|sparking zero|genshin impact|honkai|wuthering waves)\b/i.test(title)) return;
  const trusted=provenance?.lockedFields?.includes('tags')||!provenance||Object.entries(provenance.tags??{}).some(([tag,source])=>/^(?:#?anime|anime[- ](?:episode|movie))$/i.test(tag)&&source==='manual');
  if (trusted&&saved.some(tag=>tag==='anime' || tag==='anime episode' || tag==='anime movie')) return 'Saved anime tag';
  if (/\banime\b/i.test(`${title} ${video.genre??''}`) && (format !== 'title' || /\banime series\b/i.test(title) || (video.duration ?? 0) >= 600)) return 'Anime episode/feature evidence';
  if (animeShows.test(title) && (format !== 'title' || !video.remote && (video.duration??0)>=600)) return 'Anime series with episode/film evidence';
  if (/\bmanga\b/i.test(title) && /\b(ova|ona)\b/i.test(title)) return 'Animated special';
}
