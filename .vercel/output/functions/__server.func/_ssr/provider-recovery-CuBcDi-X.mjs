import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { D as adultAdapter, N as adultQualityRates, O as adultEmbedUrl, an as redactedAdultQuality, c as ADULT_PROVIDER_ADAPTERS } from "./live-rooms-DInVyvi_.mjs";
import { Bt as forgetProviderView, Cr as providerLoginGuidance, ir as officialAdultUrl, ot as chooseProviderView } from "./persist-D_pR3DU-.mjs";
import { Ft as retryProviderViewingSave, It as subscribeProviderViewing, Mt as getProviderViewing, Nt as getServerProviderViewing, Pt as hydrateProviderViewing, Vt as Button, jt as changeProviderViewing } from "./library-app-BzjSyqkW.mjs";
import { t as DiagnosticExportPreview } from "./diagnostic-export-preview-4FHuJD2l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/provider-recovery-CuBcDi-X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** One deadline while hidden, no polling. Returning before the deadline keeps
* playback intact; a released third-party page requires explicit resumption. */
function watchHiddenPage(release, graceMs = 6e4, runtime = {
	page: document,
	surface: window
}) {
	let timer, released = false;
	const clear = () => {
		if (timer !== void 0) runtime.surface.clearTimeout(timer);
		timer = void 0;
	};
	const finish = () => {
		clear();
		if (!released) {
			released = true;
			release();
		}
	};
	const visibility = () => {
		clear();
		if (runtime.page.hidden && !released) timer = runtime.surface.setTimeout(finish, graceMs);
	};
	runtime.page.addEventListener("visibilitychange", visibility);
	runtime.surface.addEventListener("pagehide", finish);
	visibility();
	return () => {
		clear();
		runtime.page.removeEventListener("visibilitychange", visibility);
		runtime.surface.removeEventListener("pagehide", finish);
	};
}
function useProviderViewing() {
	const state = (0, import_react.useSyncExternalStore)(subscribeProviderViewing, getProviderViewing, getServerProviderViewing);
	(0, import_react.useEffect)(() => {
		hydrateProviderViewing();
	}, []);
	return state;
}
function useProviderView(provider, href) {
	const state = useProviderViewing();
	const mode = state.ledger.choices[provider]?.mode ?? "embedded";
	return {
		...state,
		mode,
		choose(next) {
			changeProviderViewing((l) => chooseProviderView(l, provider, next, href));
			if (provider === "myfreecams") try {
				localStorage.setItem("reelcase.mfc.view-mode.v1", next);
			} catch {}
		}
	};
}
function rememberOfficialViewing(video) {
	const href = officialAdultUrl(video.remote);
	if (href && adultAdapter(video.remote?.kind)) changeProviderViewing((l) => chooseProviderView(l, video.remote.kind, "website", href));
	return href;
}
function ProviderSaveNotice() {
	return useProviderViewing().status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "mt-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Browser storage could not save your provider viewing choice. It works for this session." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			className: "mt-2 min-h-11 max-w-full whitespace-normal",
			onClick: retryProviderViewingSave,
			children: "Retry saving provider viewing choice"
		})]
	}) : null;
}
function ProviderLoginHelp({ provider, href, onRecover, room = false }) {
	const [notice, setNotice] = (0, import_react.useState)(""), guidance = providerLoginGuidance(provider), label = adultAdapter(provider)?.label ?? provider;
	(0, import_react.useEffect)(() => setNotice(""), [href]);
	const copy = async () => {
		try {
			if (!navigator.clipboard?.writeText) throw Error("Unavailable");
			await navigator.clipboard.writeText(href);
			setNotice(room ? "Room link copied. Paste it into your usual browser to use its MFC session." : "Official link copied. Paste it into your usual browser profile.");
		} catch {
			setNotice("Copy is unavailable. Select the " + (room ? "room" : "official") + " link below and copy it manually.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-3 rounded-md border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			className: "min-h-11 cursor-pointer content-center text-sm font-medium",
			children: room ? "Login keeps looping?" : "Login or playback blocked?"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 space-y-3 text-xs leading-5 text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: guidance.summary }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: guidance.specific }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11 max-w-full whitespace-normal",
						variant: "secondary",
						onClick: onRecover,
						children: "Recover in direct website mode"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11 max-w-full whitespace-normal",
						variant: "secondary",
						onClick: () => void copy(),
						children: room ? "Copy room link" : "Copy official link"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [
						"Official ",
						room ? "room" : "provider",
						" link",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": room ? "Official MFC room link" : "Official " + label + " link",
							value: href,
							readOnly: true,
							onFocus: (e) => e.currentTarget.select(),
							className: "mt-1 block min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg"
						})
					]
				}),
				notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					children: notice
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: guidance.boundary }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Keep the official page in your normal browser profile if you want that browser to remember its session. Private windows, app browsers and other profiles may have separate sessions." }),
				room && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "https://wiki.myfreecams.com/wiki/Technical_Information",
					target: "_blank",
					rel: "noopener noreferrer",
					className: "inline-flex min-h-11 items-center text-accent underline",
					children: "MFC sign-in and browser help"
				})
			]
		})]
	});
}
/** Shared recovery surrounds only existing supported adult iframe paths.
* Switching to a direct site removes the iframe rather than hiding its player. */
function AdultProviderFrame({ video, src, preview = false }) {
	const provider = video.remote.kind, adapter = adultAdapter(provider), href = officialAdultUrl(video.remote) ?? adapter.home, state = useProviderView(provider, href), [suspended, setSuspended] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	const embed = adultEmbedUrl(provider, src), choose = (mode) => {
		try {
			state.choose(mode);
			setSuspended(false);
			setError("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not save viewing choice.");
		}
	};
	(0, import_react.useEffect)(() => {
		if (!state.ready || state.mode !== "embedded" || suspended) return;
		return watchHiddenPage(() => setSuspended(true));
	}, [
		state.ready,
		state.mode,
		suspended
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-provider-frame": provider,
		"data-provider-running": state.ready && state.mode === "embedded" && !!embed && !suspended,
		"aria-label": adapter.label + " playback and login recovery",
		className: (preview ? "" : "order-2 flex-1 ") + "flex min-h-0 min-w-0 flex-col bg-surface text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border p-3 sm:p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href,
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: () => choose("website"),
							className: "inline-flex min-h-11 max-w-full items-center rounded-md bg-accent px-3 text-sm font-medium text-accent-fg",
							children: ["Open official ", adapter.label]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11 max-w-full whitespace-normal",
							variant: state.mode === "website" ? "default" : "secondary",
							"aria-pressed": state.mode === "website",
							onClick: () => choose("website"),
							children: "Use direct website"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11 max-w-full whitespace-normal",
							variant: state.mode === "embedded" ? "default" : "secondary",
							"aria-pressed": state.mode === "embedded",
							disabled: !embed,
							onClick: () => choose("embedded"),
							children: "Use embedded player"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderLoginHelp, {
					provider,
					href,
					onRecover: () => choose("website")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderSaveNotice, {}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-2 text-sm",
					children: error
				})
			]
		}), !state.ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "p-5 text-sm text-muted",
			children: "Restoring provider viewing choice…"
		}) : state.mode === "embedded" && embed && !suspended ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			title: preview ? video.name + " preview" : video.name,
			src: embed,
			className: preview ? "aspect-video w-full border-0" : "min-h-72 w-full flex-1 border-0",
			allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
			allowFullScreen: true,
			referrerPolicy: "strict-origin-when-cross-origin"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm leading-6 text-muted",
				children: suspended ? "Embedded playback was unloaded after a minute in the background. Resume explicitly when you return." : !embed ? "This source has no supported embedded player URL. Use its official site." : "Direct website mode is remembered. No embedded provider page is running here; open the official link to continue."
			}), suspended && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "min-h-11 max-w-full whitespace-normal",
				onClick: () => setSuspended(false),
				children: "Resume provider embed"
			})]
		})]
	});
}
function ProviderCapabilityPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-provider-capabilities": true,
		className: "mt-3 rounded-md border border-border bg-bg/35 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center text-sm font-medium",
				children: "Provider capabilities and limits"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "This inventory describes the adapters already implemented in Realhub. Provider availability and playback permission can change. Unsupported destinations remain external links; changing this inventory does not change private-library visibility."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-2",
				children: ADULT_PROVIDER_ADAPTERS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					"data-provider-capability": row.id,
					className: "min-w-0 rounded-lg bg-elevated p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-medium text-fg",
							children: row.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs leading-5 text-muted",
							children: [
								row.media.join(" / "),
								" · ",
								row.query.replaceAll("-", " "),
								" · ",
								row.paging,
								" paging · ",
								row.tags ? "saved source tags" : "no provider tag search",
								" · ",
								row.player === "external" ? "official-site viewing" : row.player + " viewing"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: row.note
						})
					]
				}, row.id))
			})
		]
	});
}
function ProviderViewingDesk() {
	const state = useProviderViewing();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-provider-viewing-desk": true,
		className: "mt-3 rounded-md border border-border bg-bg/35 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center text-sm font-medium",
				children: "Remembered official viewing links"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "One latest official link and viewing mode per source, on this device. These choices contain no login state, credentials or cookies. They are included in your personal library backup."
			}),
			state.ready && !Object.keys(state.ledger.choices).length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "No official viewing choice saved yet. Use a provider preview to choose direct or embedded viewing."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-3",
				children: Object.entries(state.ledger.choices).map(([id, choice]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-provider-viewing": id,
					className: "rounded-md bg-elevated p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium text-fg",
							children: [
								adultAdapter(id)?.label,
								" · ",
								choice.mode === "website" ? "Direct website" : "Embedded view"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: choice.url,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "mt-1 inline-flex min-h-11 max-w-full break-all items-center text-xs text-accent underline",
							children: choice.url
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-2 min-h-11 max-w-full whitespace-normal",
							variant: "secondary",
							onClick: () => {
								changeProviderViewing((l) => forgetProviderView(l, id));
								if (id === "myfreecams") try {
									localStorage.removeItem("reelcase.mfc.view-mode.v1");
								} catch {}
							},
							children: [
								"Forget ",
								adultAdapter(id)?.label,
								" viewing choice"
							]
						})
					]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderSaveNotice, {})
		]
	});
}
function ProviderQualityDetails({ diagnostics }) {
	const rows = diagnostics.filter((r) => r.quality);
	if (!rows.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-provider-quality": true,
		className: "mt-3 rounded-md border border-border p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center text-sm font-medium",
				children: "Returned-page quality counters"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagnosticExportPreview, {
				kind: "provider-quality",
				data: redactedAdultQuality(diagnostics)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Counters cover the adapter pages in this bounded request, including page records outside its final admission window. Duplicate and missing-field counts describe returned records, not the whole provider. Live observations have no publication date. Invalid pages fail without advancing their cursor."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-2",
				children: rows.slice(-64).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					"data-provider-quality-row": r.provider,
					className: "break-words text-xs leading-5 text-muted",
					children: [
						r.provider,
						" · ",
						r.quality.pages,
						" pages · ",
						r.quality.received,
						" records · ",
						r.quality.duplicates,
						" duplicates · ",
						r.quality.missingDate,
						" unknown publication dates · ",
						r.quality.missingTitle,
						" missing titles · ",
						r.quality.missingArtwork,
						" missing previews · rates: ",
						Object.entries(adultQualityRates(r.quality)).map(([key, value]) => key + " " + (value === null ? "n/a" : Math.round(value * 100) + "%")).join(", ")
					]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-3 min-h-11 max-w-full whitespace-normal",
				onClick: () => {
					const blob = new Blob([JSON.stringify(redactedAdultQuality(diagnostics), null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
					a.href = url;
					a.download = "realhub-provider-quality.json";
					a.click();
					setTimeout(() => URL.revokeObjectURL(url), 1e3);
				},
				children: "Export redacted pull quality"
			})
		]
	});
}
//#endregion
export { ProviderSaveNotice as a, useProviderView as c, ProviderQualityDetails as i, watchHiddenPage as l, ProviderCapabilityPanel as n, ProviderViewingDesk as o, ProviderLoginHelp as r, rememberOfficialViewing as s, AdultProviderFrame as t };
