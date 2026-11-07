/** Disposable search keys only: canonical composition and case, never accent
 * stripping, transliteration or edits to stored titles, tags or creator names. */
export const SEARCH_TEXT_VERSION = 2;
export function searchText(value: string): string {
  return value.normalize("NFC").toLowerCase().normalize("NFC");
}
/** Keep the prior compound-tag tokens and their segments, now for all Unicode
 * letters/numbers/combining marks. Punctuation and emoji are separators. */
export function searchTokens(value: string): string[] {
  const tokens = searchText(value).match(/[\p{L}\p{M}\p{N}_-]+/gu) ?? [];
  const out: string[] = [];
  for (const token of tokens) {
    out.push(token);
    if (token.includes("-") || token.includes("_"))
      out.push(...token.split(/[-_]+/).filter(Boolean));
  }
  return out;
}
