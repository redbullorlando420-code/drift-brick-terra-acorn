import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Rt as ExternalLink, Y as Music2 } from "../_libs/lucide-react.mjs";
import { Bt as Input, Vt as Button } from "./library-app-BzjSyqkW.mjs";
import { s as HubShell } from "./hub-shared-4nVqg49O.mjs";
import { i as spotifyShortcut, n as readSpotifyShortcuts, t as SPOTIFY_SHORTCUTS_KEY } from "./workspace-shortcuts-DH4uKJAQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spotify-section-VJT5-V7u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SpotifySection() {
	const [shortcuts, setShortcuts] = (0, import_react.useState)(() => {
		try {
			const parse = (key) => {
				try {
					return JSON.parse(localStorage.getItem(key) ?? "null");
				} catch {
					return null;
				}
			};
			return readSpotifyShortcuts(parse(SPOTIFY_SHORTCUTS_KEY), parse("reelcase.spotify.imports.v1"), localStorage.getItem("reelcase.spotify.playlist"));
		} catch {
			return {
				version: 2,
				selected: "",
				imports: []
			};
		}
	});
	const { selected: saved, imports } = shortcuts;
	const [playlistUrl, setPlaylistUrl] = (0, import_react.useState)(saved);
	const [error, setError] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)("");
	const importSpotifyLink = () => {
		const value = spotifyShortcut(playlistUrl);
		setNotice("");
		if (!value) {
			setError("Enter a valid Spotify playlist, album, or artist link from open.spotify.com.");
			return;
		}
		const next = {
			version: 2,
			selected: value,
			imports: [value, ...imports.filter((item) => item !== value)].slice(0, 50)
		};
		try {
			localStorage.setItem(SPOTIFY_SHORTCUTS_KEY, JSON.stringify(next));
			setShortcuts(next);
			setPlaylistUrl(value);
			setError("");
			setNotice("Spotify shortcut saved on this device.");
		} catch {
			setError("Could not save Spotify shortcuts. Your previous shortcuts are safe. Free browser storage and try Import link again.");
		}
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
							onChange: (event) => {
								setPlaylistUrl(event.target.value);
								setError("");
								setNotice("");
							},
							onKeyDown: (event) => {
								if (event.key === "Enter" && !event.nativeEvent.isComposing) importSpotifyLink();
							},
							placeholder: "https://open.spotify.com/playlist/...",
							"aria-label": "Spotify playlist link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !playlistUrl.trim(),
							onClick: importSpotifyLink,
							children: "Import link"
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-3 text-sm text-danger",
						children: error
					}),
					notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mt-3 text-sm text-accent",
						children: notice
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
