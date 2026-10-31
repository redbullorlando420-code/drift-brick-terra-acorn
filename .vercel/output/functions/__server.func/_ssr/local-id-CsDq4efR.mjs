//#region node_modules/.nitro/vite/services/ssr/assets/local-id-CsDq4efR.js
/**
* Local UI identifiers must work on HTTP/LAN pages and older embedded
* browsers, where Web Crypto can exist without randomUUID(). They identify
* ephemeral browser state only; they are never credentials or security keys.
*/
function createLocalId(prefix = "") {
	const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : void 0;
	if (typeof webCrypto?.randomUUID === "function") return `${prefix}${webCrypto.randomUUID()}`;
	const bytes = /* @__PURE__ */ new Uint8Array(12);
	if (typeof webCrypto?.getRandomValues === "function") {
		webCrypto.getRandomValues(bytes);
		return `${prefix}${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
	}
	return `${prefix}${`${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.replace(/[^a-z0-9]/gi, "").slice(0, 24)}`;
}
function createShortLocalId(prefix = "", length = 12) {
	return `${prefix}${createLocalId().replaceAll("-", "").slice(0, length)}`;
}
//#endregion
export { createShortLocalId as n, createLocalId as t };
