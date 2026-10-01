export type SidebarGroup = "library" | "workspace" | "tools";
export const SIDEBAR_COLLAPSED_KEY = "reelcase.sidebar.collapsed.v1";
export const SIDEBAR_GROUPS_KEY = "reelcase.sidebar.groups.v1";
export const DEFAULT_SIDEBAR_GROUPS: Record<SidebarGroup, boolean> = { library: true, workspace: false, tools: false };

export function restoreSidebarGroups(raw: string | null): Record<SidebarGroup, boolean> {
  try {
    const saved = JSON.parse(raw ?? "null") as Partial<Record<SidebarGroup, unknown>> | null;
    return Object.fromEntries(Object.entries(DEFAULT_SIDEBAR_GROUPS).map(([key, fallback]) => [key, typeof saved?.[key as SidebarGroup] === "boolean" ? saved[key as SidebarGroup] : fallback])) as Record<SidebarGroup, boolean>;
  } catch { return { ...DEFAULT_SIDEBAR_GROUPS }; }
}

/** The shortcut must not intercept typing or editing rich text. */
export function sidebarShortcut(event: { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean; shiftKey: boolean }, editing: boolean) {
  return !editing && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "b";
}
