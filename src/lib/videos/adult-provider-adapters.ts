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
  { id: "reddit", label: "Reddit", transport: "atom-rss", status: "active", capabilities: ["catalog", "search", "archive", "poster"] },
  { id: "redgifs", label: "Redgifs", transport: "public-api", status: "active", capabilities: ["catalog", "poster", "playback"] },
  { id: "new-provider", label: "New documented provider", transport: "public-api", status: "planned", capabilities: ["catalog", "search", "poster"] },
];
