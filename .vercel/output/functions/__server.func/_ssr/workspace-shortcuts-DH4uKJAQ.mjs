//#region node_modules/.nitro/vite/services/ssr/assets/workspace-shortcuts-DH4uKJAQ.js
function spotifyShortcut(value) {
	if (typeof value !== "string") return;
	try {
		const url = new URL(value.trim());
		if (url.protocol !== "https:" || url.hostname !== "open.spotify.com" || url.port || url.username || url.password) return;
		const path = url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(playlist|album|artist)\/([a-zA-Z0-9]{22})\/?$/);
		if (path) return `https://open.spotify.com/${path[1]}/${path[2]}`;
	} catch {}
}
var SPOTIFY_SHORTCUTS_KEY = "reelcase.spotify.shortcuts.v2";
function readSpotifyShortcuts(value, legacyImports, legacySelected) {
	const current = value && typeof value === "object" && !Array.isArray(value) && value.version === 2 ? value : void 0;
	const selected = spotifyShortcut(current ? current.selected : legacySelected) ?? "";
	const rows = current ? current.imports : legacyImports;
	return {
		version: 2,
		selected,
		imports: [...new Set([selected, ...Array.isArray(rows) ? rows.map(spotifyShortcut) : []].filter((row) => !!row))].slice(0, 50)
	};
}
function readTrackedPackages(value) {
	if (!Array.isArray(value)) return [];
	const ids = /* @__PURE__ */ new Set();
	return value.filter((row) => {
		if (!row || typeof row !== "object" || Array.isArray(row) || ![
			"id",
			"title",
			"carrier",
			"tracking"
		].every((key) => typeof row[key] === "string") || !row.id || !row.title.trim() || ids.has(row.id) || ![
			"Ordered",
			"Shipped",
			"Out for delivery",
			"Delivered"
		].includes(row.status)) return false;
		ids.add(row.id);
		return true;
	});
}
//#endregion
export { spotifyShortcut as i, readSpotifyShortcuts as n, readTrackedPackages as r, SPOTIFY_SHORTCUTS_KEY as t };
