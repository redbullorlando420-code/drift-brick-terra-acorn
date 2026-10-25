import { useState } from "react";
import { Clapperboard, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HubShell, ServiceLink } from './hub-shared';

export function StreamingSection() {
  const [ratingQuery, setRatingQuery] = useState("");
  const services = [
    { name: "Netflix", href: "https://www.netflix.com/", copy: "Movies & series" },
    { name: "Hulu", href: "https://www.hulu.com/", copy: "TV & films" },
    { name: "Crunchyroll", href: "https://www.crunchyroll.com/", copy: "Anime streaming" },
    { name: "Kick", href: "https://kick.com/", copy: "Live streaming" },
    { name: "Vimeo", href: "https://vimeo.com/", copy: "Creator video" },
    { name: "Nebula", href: "https://nebula.tv/", copy: "Independent creators" },
    { name: "Plex", href: "https://www.plex.tv/", copy: "Personal media & streaming" },
    {
      name: "Internet Archive",
      href: "https://archive.org/details/feature_films",
      copy: "Open & public-domain films",
    },
    {
      name: "Old Time Movies",
      href: "https://archive.org/details/moviesandfilms",
      copy: "Classic and public-domain cinema",
    },
    {
      name: "Library of Congress",
      href: "https://www.loc.gov/film-and-videos/",
      copy: "Historic films and moving images",
    },
    {
      name: "Open Culture",
      href: "https://www.openculture.com/freemoviesonline",
      copy: "Free film collections and courses",
    },
    { name: "AniList", href: "https://anilist.co/", copy: "Anime discovery & ratings" },
    { name: "AniDB", href: "https://anidb.net/", copy: "Anime database" },
    { name: "Rotten Tomatoes", href: "https://www.rottentomatoes.com/", copy: "Critic & audience ratings" },
  ];
  return (
    <HubShell
      eyebrow="Movie streaming"
      icon={<Clapperboard className="size-4" />}
      title="Streaming destinations"
      copy="Keep watch sources separate from shopping. These official services and public collections open in their own sites."
    >
      <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">External rating search</p><p className="mt-1 text-sm text-muted">Look up a title on the source you trust. Searches open on the official site; Realhub does not copy ratings into your local catalog.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={ratingQuery} onChange={(event) => setRatingQuery(event.target.value)} placeholder="Search an anime, movie, or series" aria-label="External rating search"/><div className="flex flex-wrap gap-2">{[{ label: "AniList", url: "https://anilist.co/search/anime?search=" }, { label: "AniDB", url: "https://anidb.net/anime/?adb.search=" }, { label: "Rotten Tomatoes", url: "https://www.rottentomatoes.com/search?search=" }].map((source) => <a key={source.label} href={`${source.url}${encodeURIComponent(ratingQuery.trim())}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-3 text-sm text-fg shadow-border">{source.label}<ExternalLink className="ml-2 size-3.5"/></a>)}</div></div></section>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceLink key={service.name} {...service} />
        ))}
      </div>
    </HubShell>
  );
}
