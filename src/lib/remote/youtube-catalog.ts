/** The active Videos grid is the only safe source of archive continuations.
 * Channel headers, descriptions and sort chips carry unrelated tokens. */
export function youtubeCatalogItems(root: unknown): unknown[] | null {
  if (!root || typeof root !== "object") return null;
  const page = root as {
    contents?: { twoColumnBrowseResultsRenderer?: { tabs?: Array<{ tabRenderer?: { selected?: boolean; title?: string; content?: { richGridRenderer?: { contents?: unknown[] } } } }> } };
    onResponseReceivedActions?: Array<{ appendContinuationItemsAction?: { continuationItems?: unknown[] }; reloadContinuationItemsCommand?: { continuationItems?: unknown[] } }>;
    onResponseReceivedEndpoints?: Array<{ appendContinuationItemsAction?: { continuationItems?: unknown[] }; reloadContinuationItemsCommand?: { continuationItems?: unknown[] } }>;
  };
  const tabs = page.contents?.twoColumnBrowseResultsRenderer?.tabs ?? [];
  const hasGrid = (tab: typeof tabs[number]) => Array.isArray(tab.tabRenderer?.content?.richGridRenderer?.contents);
  const selected = tabs.find((tab) => tab.tabRenderer?.selected && hasGrid(tab));
  if (selected) return selected.tabRenderer!.content!.richGridRenderer!.contents!;
  // YouTube sometimes omits `selected` on `/videos` responses. Prefer the
  // explicitly named Videos tab, then the only populated grid, rather than
  // walking the whole page and losing its continuation boundary.
  const videosTab = tabs.find((tab) => tab.tabRenderer?.title?.trim().toLowerCase() === "videos" && hasGrid(tab));
  if (videosTab) return videosTab.tabRenderer!.content!.richGridRenderer!.contents!;
  const populatedTabs = tabs.filter(hasGrid);
  if (populatedTabs.length === 1) return populatedTabs[0].tabRenderer!.content!.richGridRenderer!.contents!;
  for (const action of [...(page.onResponseReceivedActions ?? []), ...(page.onResponseReceivedEndpoints ?? [])]) {
    // WEB has used both appendContinuationItemsAction and
    // reloadContinuationItemsCommand for the same Videos-grid continuation.
    // The latter is common after a tab/filter refresh and must remain inside
    // the catalog boundary so its next token is not lost.
    const items = action.appendContinuationItemsAction?.continuationItems ?? action.reloadContinuationItemsCommand?.continuationItems;
    if (Array.isArray(items)) return items;
  }
  return null;
}

export function youtubeCatalogContinuation(root: unknown): string | null {
  const items = youtubeCatalogItems(root);
  if (!items) return null;
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const stack: unknown[] = [items[index]];
    while (stack.length) {
      const current = stack.pop();
      if (!current || typeof current !== "object") continue;
      if (Array.isArray(current)) {
        for (let item = current.length - 1; item >= 0; item -= 1) stack.push(current[item]);
        continue;
      }
      const record = current as Record<string, unknown>;
      const command = record.continuationCommand;
      if (command && typeof command === "object" && typeof (command as Record<string, unknown>).token === "string") return (command as Record<string, string>).token;
      for (const key of ["nextContinuationData", "reloadContinuationData", "continuationData"]) {
        const data = record[key];
        if (data && typeof data === "object" && typeof (data as Record<string, unknown>).continuation === "string") return (data as Record<string, string>).continuation;
      }
      for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
    }
  }
  return null;
}

/** Only call an archive exhausted when a recognized Videos grid is terminal. */
export function youtubeCatalogHasTerminalPage(root: unknown): boolean {
  return youtubeCatalogItems(root) !== null && youtubeCatalogContinuation(root) === null;
}
