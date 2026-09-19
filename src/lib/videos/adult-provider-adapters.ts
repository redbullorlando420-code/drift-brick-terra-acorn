/**
 * Extension point for Adult discovery providers. An adapter must use a
 * documented public API, Atom/RSS feed, or an explicitly permitted embed.
 * It deliberately has no generic page scraper: unsupported sites remain
 * link-out destinations until a stable, lawful integration is added here.
 */

export type AdultProviderAdapter = {
  id: string;
  label: string;
  transport: "public-api" | "atom-rss" | "public-embed";
  status: "active" | "planned";
  capabilities: readonly ("catalog" | "search" | "archive" | "poster" | "playback")[];
};

export const ADULT_PROVIDER_ADAPTERS: readonly AdultProviderAdapter[] = [
  { id: "eporner", label: "Eporner", transport: "public-api", status: "active", capabilities: ["catalog", "search", "archive", "poster", "playback"] },
  { id: "redtube", label: "RedTube", transport: "public-api", status: "active", capabilities: ["catalog", "search", "archive", "poster", "playback"] },
  { id: "chaturbate", label: "Chaturbate", transport: "public-api", status: "active", capabilities: ["catalog", "poster", "playback"] },
  { id: "myfreecams", label: "MyFreeCams", transport: "public-api", status: "active", capabilities: ["catalog", "poster"] },
  { id: "reddit", label: "Reddit", transport: "atom-rss", status: "active", capabilities: ["catalog", "search", "archive", "poster"] },
  { id: "booru", label: "Booru + Rule34 + Gelbooru + e621", transport: "public-api", status: "active", capabilities: ["catalog", "search", "poster"] },
  { id: "redgifs", label: "Redgifs", transport: "public-api", status: "active", capabilities: ["catalog", "search", "poster", "playback"] },
];
