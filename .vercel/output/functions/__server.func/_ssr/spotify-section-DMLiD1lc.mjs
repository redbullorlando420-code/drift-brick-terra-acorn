import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { J as Music2, Lt as ExternalLink } from "../_libs/lucide-react.mjs";
import { Dt as Input, Ot as Button } from "./library-app-CrsCDQmv.mjs";
import { s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spotify-section-DMLiD1lc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SpotifySection() {
	const [saved, setSaved] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return "";
		try {
			return localStorage.getItem("reelcase.spotify.playlist") ?? "";
		} catch {
			return "";
		}
	});
	const [playlistUrl, setPlaylistUrl] = (0, import_react.useState)(saved);
	const [imports, setImports] = (0, import_react.useState)(() => {
		try {
			const savedImports = JSON.parse(localStorage.getItem("reelcase.spotify.imports.v1") ?? "[]");
			return Array.isArray(savedImports) ? savedImports.filter((item) => typeof item === "string") : [];
		} catch {
			return [];
		}
	});
	const importSpotifyLink = () => {
		const value = playlistUrl.trim();
		if (!/^https:\/\/open\.spotify\.com\/(playlist|album|artist)\//i.test(value)) return;
		const next = [value, ...imports.filter((item) => item !== value)].slice(0, 50);
		setImports(next);
		setSaved(value);
		localStorage.setItem("reelcase.spotify.imports.v1", JSON.stringify(next));
		localStorage.setItem("reelcase.spotify.playlist", value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Music companion",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4" }),
		title: "Spotify, beside your library.",
		copy: "Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Open Spotify"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Account sign-in and playback remain on Spotify’s official site or app. Realhub does not collect your Spotify password or tokens."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://open.spotify.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: ["Open Spotify ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Save a playlist shortcut"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: playlistUrl,
							onChange: (event) => setPlaylistUrl(event.target.value),
							placeholder: "https://open.spotify.com/playlist/...",
							"aria-label": "Spotify playlist link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !playlistUrl.includes("spotify.com"),
							onClick: importSpotifyLink,
							children: "Import link"
						})]
					}),
					saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "mt-3 inline-flex text-sm text-accent hover:text-fg",
						href: saved,
						target: "_blank",
						rel: "noreferrer",
						children: ["Open saved playlist ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-4" })]
					})
				]
			}),
			imports.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Imported Spotify shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Playlist, album, and artist links are stored locally for quick return. Spotify account data remains in Spotify."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: imports.slice(0, 12).map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noreferrer",
							className: "max-w-full truncate rounded-sm bg-bg/45 px-3 py-2 text-xs text-fg shadow-border",
							children: url.replace("https://open.spotify.com/", "Spotify · ")
						}, url))
					})
				]
			})
		]
	});
}
//#endregion
export { SpotifySection };
