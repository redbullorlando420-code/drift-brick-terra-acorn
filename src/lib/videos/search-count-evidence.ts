export type SearchCountEvidence = {
  version: 1;
  kind: "snapshot" | "page" | "estimate" | "pending" | "unavailable";
  value?: number;
  scope: "saved catalog" | "host library" | "YouTube";
  complete?: boolean;
  hasMore?: boolean;
};
const count = (value: unknown) =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
/** Evidence changes labels only; never a grid key, query identity or paging cursor. */
export function describeSearchCount(raw: SearchCountEvidence): { label: string; detail: string } {
  if (
    !raw ||
    typeof raw !== "object" ||
    raw.version !== 1 ||
    !["snapshot", "page", "estimate", "pending", "unavailable"].includes(raw.kind) ||
    !["saved catalog", "host library", "YouTube"].includes(raw.scope) ||
    (raw.value !== undefined && !count(raw.value)) ||
    (raw.complete !== undefined && typeof raw.complete !== "boolean") ||
    (raw.hasMore !== undefined && typeof raw.hasMore !== "boolean")
  )
    return { label: "Count unavailable", detail: "No compatible count evidence is available." };
  const number = raw.value?.toLocaleString();
  if (raw.kind === "pending")
    return {
      label: "Search count pending",
      detail: "No complete result count is available while matching or ranking is still running.",
    };
  if (raw.kind === "snapshot" && raw.complete && number !== undefined)
    return {
      label: `${number} matches in the loaded catalog`,
      detail:
        "Exact for this completed saved-catalog search. This is not the provider’s entire catalog or the number of mounted cards.",
    };
  if (raw.kind === "estimate" && number !== undefined)
    return {
      label: `About ${number} matches`,
      detail: `${raw.scope} estimate; not a verified complete total.`,
    };
  if (raw.kind === "snapshot" && number !== undefined)
    return {
      label: `${number} provisional matches`,
      detail: "Search coverage is incomplete. This is not a verified complete total.",
    };
  if (raw.kind === "page" && number !== undefined)
    return {
      label: `${number} results loaded on this page`,
      detail: raw.hasMore
        ? "More results are available. The complete total is unknown."
        : "No complete provider total was supplied. This count describes only the loaded results.",
    };
  return { label: "Count unavailable", detail: "No verified count has been supplied." };
}
