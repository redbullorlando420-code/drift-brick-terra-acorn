/**
 * Local UI identifiers must work on HTTP/LAN pages and older embedded
 * browsers, where Web Crypto can exist without randomUUID(). They identify
 * ephemeral browser state only; they are never credentials or security keys.
 */
export function createLocalId(prefix = ""): string {
  const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (typeof webCrypto?.randomUUID === "function") return `${prefix}${webCrypto.randomUUID()}`;

  const bytes = new Uint8Array(12);
  if (typeof webCrypto?.getRandomValues === "function") {
    webCrypto.getRandomValues(bytes);
    return `${prefix}${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  }

  // Last-resort compatibility for non-secure local pages. Callers use this
  // only for local catalog/session keys, never for an authorization boundary.
  const entropy = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `${prefix}${entropy.replace(/[^a-z0-9]/gi, "").slice(0, 24)}`;
}

export function createShortLocalId(prefix = "", length = 12): string {
  return `${prefix}${createLocalId().replaceAll("-", "").slice(0, length)}`;
}
