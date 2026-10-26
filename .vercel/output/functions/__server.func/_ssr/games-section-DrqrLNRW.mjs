import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Ft as ExternalLink, Lt as Download, N as Rocket, _t as ImagePlus, wt as Gamepad2 } from "../_libs/lucide-react.mjs";
import { v as companionSteamEpicGames } from "./companion-C8xPNDAD.mjs";
import { $ as Button, Q as Input, Tn as useSourceAssets } from "./library-app-BtCPS7Tj.mjs";
import { f as downloadCsv, l as ServiceLink, m as writeHub, p as readHub, s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/games-section-DrqrLNRW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Local cache for desktop game icons (data URLs). Kept separate from hub metadata to avoid blowing reelcase.hub.v1. */
var KEY = "reelcase.game-icons.v1";
var MAX_ENTRIES = 100;
var MAX_DATA_URL = 4e5;
function loadGameIconCache() {
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
		return raw && typeof raw === "object" ? raw : {};
	} catch {
		return {};
	}
}
function saveGameIcon(path, iconData) {
	if (!path || !iconData || iconData.length > MAX_DATA_URL) return;
	try {
		const all = loadGameIconCache();
		all[path] = iconData;
		const keys = Object.keys(all);
		if (keys.length > MAX_ENTRIES) for (const drop of keys.slice(0, keys.length - MAX_ENTRIES)) delete all[drop];
		localStorage.setItem(KEY, JSON.stringify(all));
	} catch {
		try {
			const all = loadGameIconCache();
			const keys = Object.keys(all);
			for (const drop of keys.slice(0, Math.ceil(keys.length / 2))) delete all[drop];
			all[path] = iconData;
			localStorage.setItem(KEY, JSON.stringify(all));
		} catch {}
	}
}
function readFileAsDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("icon read failed"));
		reader.readAsDataURL(file);
	});
}
/** Match launcher files to sibling .ico/.png/.jpg in a folder FileList. */
async function iconsFromFolderFiles(files) {
	const out = /* @__PURE__ */ new Map();
	const byStem = /* @__PURE__ */ new Map();
	const byDirStem = /* @__PURE__ */ new Map();
	for (const file of files) {
		if (!/\.(png|ico|jpe?g|webp)$/i.test(file.name)) continue;
		const rel = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
		const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();
		const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
		byStem.set(stem, file);
		byDirStem.set(`${dir}::${stem}`, file);
		if (/^(icon|game|header|cover|logo)$/i.test(stem)) byDirStem.set(`${dir}::__folder__`, file);
	}
	for (const file of files) {
		if (!/\.(exe|lnk|url|appref-ms)$/i.test(file.name)) continue;
		const rel = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
		const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();
		const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
		const iconFile = byDirStem.get(`${dir}::${stem}`) || byStem.get(stem) || byDirStem.get(`${dir}::__folder__`);
		if (!iconFile || iconFile.size > 12e5) continue;
		try {
			const data = await readFileAsDataUrl(iconFile);
			if (data.startsWith("data:image")) out.set(rel || file.name, data);
		} catch {}
	}
	return out;
}
async function fetchCompanionIcons(paths) {
	const out = /* @__PURE__ */ new Map();
	const pending = paths.filter(Boolean).slice(0, 40);
	if (!pending.length) return out;
	try {
		const result = await (await fetch("http://127.0.0.1:43123/shortcut-icons", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ paths: pending })
		})).json();
		if (!result.ok || !result.icons) return out;
		for (const row of result.icons) if (row.iconData?.startsWith("data:image")) {
			out.set(row.path, row.iconData);
			saveGameIcon(row.path, row.iconData);
		}
	} catch {}
	return out;
}
function gameKind(item) {
	if (item.launchUrl) return "web-ready";
	if (/\.url$/i.test(item.name)) return "web-needs-target";
	if (/\.lnk$/i.test(item.name)) return "desktop-shortcut";
	if (/\.appref-ms$/i.test(item.name)) return "desktop-app";
	return "desktop-executable";
}
function isWebGame(item) {
	return gameKind(item).startsWith("web-");
}
function isGameHelper(item) {
	const value = `${item.name} ${item.path}`.toLowerCase();
	return /(?:uninstall|setup|installer|updater|crashpad|helper|redistributable|vcredist|python|node_modules|\\\\lib\\\\|\/lib\/)/.test(value);
}
function gameBadge(item) {
	if (item.launchUrl?.startsWith("steam:")) return "STEAM";
	if (item.launchUrl?.startsWith("epic:") || item.launchUrl?.startsWith("com.epicgames")) return "EPIC";
	if (gameKind(item) === "web-needs-target") return "LINK?";
	if (gameKind(item) === "web-ready") return "WEB";
	if (/\.appref-ms$/i.test(item.name)) return "APP";
	if (/\.lnk$/i.test(item.name)) return "LINK";
	return "GAME";
}
function GamesSection() {
	const [games, setGames] = (0, import_react.useState)([]);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [removeGame, setRemoveGame] = (0, import_react.useState)(null);
	const [launchNotice, setLaunchNotice] = (0, import_react.useState)("");
	const [shortcutView, setShortcutView] = (0, import_react.useState)("all");
	const [fileType, setFileType] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("name");
	const [companionLoading, setCompanionLoading] = (0, import_react.useState)(false);
	const sourceShortcuts = useSourceAssets((s) => s.shortcuts);
	const [iconPulling, setIconPulling] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const saved = readHub().games;
		const icons = loadGameIconCache();
		setGames(saved.map((game) => ({
			...game,
			iconData: game.iconData || icons[game.path]
		})));
	}, []);
	const saveGames = (next) => {
		const slim = next.map(({ iconData, ...rest }) => {
			if (iconData) saveGameIcon(rest.path, iconData);
			return rest;
		});
		setGames(next);
		const hub = readHub();
		writeHub({
			...hub,
			games: slim
		});
	};
	const mergeIcons = (current, iconMap) => current.map((game) => {
		const icon = iconMap.get(game.path);
		return icon ? {
			...game,
			iconData: icon
		} : game;
	});
	const pullMissingIcons = async (list) => {
		const missing = list.filter((game) => !game.iconData).map((game) => game.path);
		if (!missing.length) return list;
		setIconPulling(true);
		try {
			const iconMap = await fetchCompanionIcons(missing);
			if (!iconMap.size) return list;
			const next = mergeIcons(list, iconMap);
			saveGames(next);
			return next;
		} finally {
			setIconPulling(false);
		}
	};
	const add = async (files, allowWebShortcut = false) => {
		if (!files) return;
		const allFiles = Array.from(files);
		const source = allFiles.filter((file) => allowWebShortcut ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name) : /\.(exe|lnk|url|appref-ms)$/i.test(file.name));
		const folderIcons = await iconsFromFolderFiles(allFiles);
		const next = await Promise.all(source.map(async (file) => {
			let launchUrl;
			if (/\.url$/i.test(file.name)) launchUrl = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im)?.[1];
			const path = file.webkitRelativePath || file.name;
			const iconData = folderIcons.get(path.replace(/\\/g, "/")) || folderIcons.get(path);
			if (iconData) saveGameIcon(path, iconData);
			return {
				name: file.name,
				path,
				size: file.size,
				addedAt: Date.now(),
				launchUrl,
				iconData
			};
		}));
		let merged = [];
		setGames((current) => {
			merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
			const hub = readHub();
			writeHub({
				...hub,
				games: merged.map(({ iconData: _icon, ...rest }) => rest)
			});
			return merged;
		});
		pullMissingIcons(merged.length ? merged : next);
	};
	(0, import_react.useEffect)(() => {
		if (sourceShortcuts.length) add(sourceShortcuts, true);
	}, [sourceShortcuts]);
	const launchDesktop = async (game) => {
		try {
			const result = await (await fetch("http://127.0.0.1:43123/launch", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ path: game.path })
			})).json();
			setLaunchNotice(result.ok ? `Launching ${game.name} through the local companion.` : result.error ?? "The companion could not launch this item.");
		} catch {
			setLaunchNotice("Desktop launch needs the Realhub Companion running and this shortcut inside one of its approved Windows folders.");
		}
	};
	const loadApprovedShortcuts = async () => {
		setCompanionLoading(true);
		try {
			const result = await (await fetch("http://127.0.0.1:43123/shortcuts?limit=300")).json();
			if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
			const cachedIcons = loadGameIconCache();
			const next = (result.shortcuts ?? []).map((item) => ({
				...item,
				size: 0,
				addedAt: Date.now(),
				iconData: cachedIcons[item.path]
			}));
			let merged = [];
			setGames((current) => {
				const incoming = new Map(next.map((item) => [item.path, item]));
				merged = [...current.map((game) => {
					const refreshed = incoming.get(game.path);
					return refreshed ? {
						...game,
						...refreshed,
						iconData: game.iconData || refreshed.iconData
					} : game;
				}), ...next.filter((item) => !current.some((game) => game.path === item.path))];
				writeHub({
					...readHub(),
					games: merged.map(({ iconData: _icon, ...rest }) => rest)
				});
				return merged;
			});
			const got = (await pullMissingIcons(merged.length ? merged : next)).filter((game) => game.iconData).length;
			setLaunchNotice(next.length ? `Added ${next.length} approved desktop shortcuts · ${got} icons cached. Desktop launch still needs the companion.` : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.");
		} catch {
			setLaunchNotice("Companion connection unavailable. Start the local Realhub Companion, then try again.");
		} finally {
			setCompanionLoading(false);
		}
	};
	const gameTypes = [...new Set(games.map((game) => (game.name.match(/\.([^.]+)$/)?.[1] ?? "other").toLowerCase()))].sort();
	const visible = games.filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "ready" ? gameKind(game) === "web-ready" : shortcutView === "unknown" ? gameKind(game) === "web-needs-target" : !isWebGame(game))) && (fileType === "all" || game.name.toLowerCase().endsWith(`.${fileType}`))).filter((game) => shortcutView === "all" || !isGameHelper(game)).sort((a, b) => sort === "newest" ? b.addedAt - a.addedAt : sort === "type" ? a.name.split(".").pop().localeCompare(b.name.split(".").pop()) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Desktop game shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "size-4" }),
		title: "A clearer game drawer.",
		copy: "Choose a dedicated games folder (icons from sibling .ico/.png), load approved Desktop shortcuts through the companion (shell icons + folder art), or set a cover manually. Web shortcuts open directly; desktop launchers need the companion.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 sm:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						accept: ".url",
						onChange: (event) => void add(event.target.files, true)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
						children: "Add web game shortcut"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: companionLoading,
						onClick: () => void loadApprovedShortcuts(),
						children: companionLoading ? "Reading approved shortcuts…" : "Load approved desktop shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: companionLoading,
						onClick: () => void (async () => {
							setCompanionLoading(true);
							try {
								const listed = await companionSteamEpicGames(250);
								if (!listed.length) {
									setLaunchNotice("No Steam/Epic libraries under approved roots. Add the Steam or Epic Games folder to REELCASE_ALLOWED_ROOTS.");
									return;
								}
								const next = listed.map((game) => ({
									name: game.name,
									path: game.path,
									size: 0,
									addedAt: Date.now()
								}));
								setGames((current) => {
									const merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
									const hubState = readHub();
									writeHub({
										...hubState,
										games: merged.map(({ iconData: _icon, ...rest }) => rest)
									});
									return merged;
								});
								setLaunchNotice(`Loaded ${listed.length} Steam/Epic title${listed.length === 1 ? "" : "s"} from known install dirs under approved roots.`);
								pullMissingIcons(next);
							} finally {
								setCompanionLoading(false);
							}
						})(),
						children: "Load Steam / Epic from approved roots"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: iconPulling || companionLoading || !games.some((game) => !game.iconData),
						onClick: () => void (async () => {
							const filled = (await pullMissingIcons(games)).filter((game) => game.iconData).length - games.filter((game) => game.iconData).length;
							setLaunchNotice(filled > 0 ? `Pulled ${filled} desktop icon${filled === 1 ? "" : "s"} via companion / folder art.` : "No new icons found. Start the companion or add .ico/.png next to launchers.");
						})(),
						children: iconPulling ? "Pulling icons…" : "Pull missing icons"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						webkitdirectory: "",
						directory: "",
						onChange: (event) => void add(event.target.files)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-4 text-sm text-fg shadow-border",
						children: "Choose game folder"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: filter,
						onChange: (event) => setFilter(event.target.value),
						placeholder: "Filter your games",
						"aria-label": "Filter games"
					}),
					[
						"all",
						"ready",
						"desktop",
						"unknown"
					].map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: shortcutView === view ? "default" : "secondary",
						onClick: () => setShortcutView(view),
						children: view === "all" ? "All (helpers hidden)" : view === "ready" ? "Web ready" : view === "desktop" ? "Desktop" : "Unknown URL"
					}, view))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "File type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: fileType === "all" ? "default" : "secondary",
						onClick: () => setFileType("all"),
						children: "All types"
					}),
					gameTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: fileType === type ? "default" : "secondary",
						onClick: () => setFileType(type),
						children: [".", type]
					}, type)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs text-muted",
						children: "Sort"
					}),
					[
						"name",
						"newest",
						"type"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: sort === value ? "default" : "secondary",
						onClick: () => setSort(value),
						children: value === "name" ? "A–Z" : value === "newest" ? "Recently added" : "File type"
					}, value))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					visible.length,
					" shown · ",
					games.filter((game) => gameKind(game) === "web-needs-target").length,
					" web shortcuts need a readable target"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => downloadCsv([[
						"name",
						"path",
						"kind",
						"extension",
						"launch_ready",
						"helper",
						"added_at"
					], ...games.map((game) => [
						game.name,
						game.path,
						gameKind(game),
						game.name.split(".").pop() ?? "",
						Boolean(game.launchUrl),
						isGameHelper(game),
						new Date(game.addedAt).toISOString()
					])], `reelcase-games-debug-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), " Export game debug CSV"]
				})]
			}),
			visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: visible.map((game) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent/10 text-center text-[10px] font-bold tracking-[0.08em] text-accent",
						children: game.iconData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: game.iconData,
							alt: "",
							className: "size-full object-cover"
						}) : gameBadge(game)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-base font-medium text-fg",
								children: game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-xs text-muted",
								children: gameKind(game) === "web-ready" ? "Web launcher ready" : gameKind(game) === "web-needs-target" ? "Shortcut target is unknown here — open it through the Companion or refresh its target" : game.path
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => {
											if (game.launchUrl) {
												const link = document.createElement("a");
												link.href = game.launchUrl;
												link.target = game.launchUrl.startsWith("http") ? "_self" : "_blank";
												document.body.appendChild(link);
												link.click();
												link.remove();
												return;
											}
											if (gameKind(game) === "web-needs-target") {
												launchDesktop(game);
												return;
											}
											launchDesktop(game);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), gameKind(game) === "web-needs-target" ? "Open .url shortcut" : isWebGame(game) ? "Open web game" : "Launch desktop game"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "inline-flex cursor-pointer items-center text-xs text-muted hover:text-fg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "mr-1 size-3" }),
											" Set icon",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "sr-only",
												type: "file",
												accept: "image/*",
												onChange: (event) => {
													const file = event.target.files?.[0];
													if (!file) return;
													const reader = new FileReader();
													reader.onload = () => {
														const iconData = String(reader.result);
														saveGameIcon(game.path, iconData);
														saveGames(games.map((item) => item.path === game.path ? {
															...item,
															iconData
														} : item));
													};
													reader.readAsDataURL(file);
												}
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										target: "_blank",
										rel: "noreferrer",
										href: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name.replace(/\..*$/, ""))}`,
										className: "inline-flex text-xs text-muted hover:text-fg",
										children: ["Store page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-3" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-xs text-muted hover:text-danger",
										onClick: () => removeGame === game.path ? (saveGames(games.filter((item) => item.path !== game.path)), setRemoveGame(null)) : setRemoveGame(game.path),
										children: removeGame === game.path ? "Confirm remove" : "Remove"
									})
								]
							})
						]
					})]
				}, game.path))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "mx-auto size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Build your launch list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add `.url` shortcuts to launch their approved web destination, or catalog desktop launchers and choose a custom cover icon."
					})
				]
			}),
			launchNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-md bg-elevated px-3 py-2 text-xs leading-5 text-muted shadow-border",
				children: launchNotice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Nexus Mods",
					href: "https://www.nexusmods.com/",
					copy: "Browse mod pages and collections."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Vortex",
					href: "https://www.nexusmods.com/about/vortex/",
					copy: "Open the official mod manager page."
				})]
			})
		]
	});
}
//#endregion
export { GamesSection };
