import { reviewedPreferences } from "./reviewed-preferences.ts";
export type LayoutDesk = "youtube" | "twitch" | "movies";
export type DeskLayout = { view: "grid" | "list"; explore: boolean; catalog: boolean };
export type DeskLayouts = {
  version: 1;
  desks: Partial<Record<LayoutDesk, DeskLayout>>;
  undo?: { desk: LayoutDesk; previous?: DeskLayout };
};
export const DEFAULT_DESK_LAYOUT: DeskLayout = { view: "grid", explore: false, catalog: false };
const isDesk = (v: unknown): v is LayoutDesk =>
  ["youtube", "twitch", "movies"].includes(v as string);
function layout(raw: unknown): DeskLayout {
  const r = raw as DeskLayout;
  if (
    !r ||
    Object.keys(r).some((k) => !["view", "explore", "catalog"].includes(k)) ||
    !["grid", "list"].includes(r.view) ||
    typeof r.explore !== "boolean" ||
    typeof r.catalog !== "boolean"
  )
    throw Error("Unsupported desk layout; existing choices were kept.");
  return { view: r.view, explore: r.explore, catalog: r.catalog };
}
export function readDeskLayouts(raw: unknown): DeskLayouts {
  const r = raw as DeskLayouts;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["version", "desks", "undo"].includes(k)) ||
    !r.desks ||
    typeof r.desks !== "object" ||
    Array.isArray(r.desks) ||
    Object.keys(r.desks).some((k) => !isDesk(k))
  )
    throw Error("Unsupported saved layouts; reload or update the app before saving.");
  const desks = Object.fromEntries(Object.entries(r.desks).map(([k, v]) => [k, layout(v)]));
  if (
    r.undo &&
    (!isDesk(r.undo.desk) || Object.keys(r.undo).some((k) => !["desk", "previous"].includes(k)))
  )
    throw Error("Unsupported layout recovery.");
  return {
    version: 1,
    desks,
    ...(r.undo
      ? {
          undo: {
            desk: r.undo.desk,
            ...(r.undo.previous ? { previous: layout(r.undo.previous) } : {}),
          },
        }
      : {}),
  };
}
export function changeDeskLayout(
  state: DeskLayouts,
  desk: LayoutDesk,
  next?: DeskLayout,
): DeskLayouts {
  const desks = { ...state.desks };
  if (next) desks[desk] = layout(next);
  else delete desks[desk];
  return readDeskLayouts({ version: 1, desks, undo: { desk, previous: state.desks[desk] } });
}
export const deskLayouts = reviewedPreferences<DeskLayouts>(
  "reelcase.desk-layouts.v1",
  () => ({ version: 1, desks: {} }),
  readDeskLayouts,
);
