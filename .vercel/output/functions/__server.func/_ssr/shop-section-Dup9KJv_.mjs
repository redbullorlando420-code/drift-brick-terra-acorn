import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as ShoppingBag, O as Search, Pt as ExternalLink, W as PackageSearch } from "../_libs/lucide-react.mjs";
import { X as Input, Z as Button, vn as createLocalId } from "./library-app-VjV5eJfN.mjs";
import { s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-section-Dup9KJv_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopSection() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [packages, setPackages] = (0, import_react.useState)([]);
	const [packageTitle, setPackageTitle] = (0, import_react.useState)("");
	const [carrier, setCarrier] = (0, import_react.useState)("USPS");
	const [tracking, setTracking] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			setPackages(JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]"));
		} catch {
			setPackages([]);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(packages));
		} catch {}
	}, [packages]);
	const encoded = encodeURIComponent(query.trim());
	const stores = (0, import_react.useMemo)(() => [
		{
			name: "Amazon",
			href: `https://www.amazon.com/s?k=${encoded}`,
			detail: "Search Amazon"
		},
		{
			name: "Walmart",
			href: `https://www.walmart.com/search?q=${encoded}`,
			detail: "Search Walmart"
		},
		{
			name: "eBay",
			href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
			detail: "Search eBay"
		},
		{
			name: "Etsy",
			href: `https://www.etsy.com/search?q=${encoded}`,
			detail: "Search handmade & niche shops"
		},
		{
			name: "Diipoo",
			href: `https://diipoo.com/?s=${encoded}`,
			detail: "Search Diipoo deals"
		}
	], [encoded]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Shopping shortcuts",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
		title: "Find gear for your setup",
		copy: "Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search film gear, printer parts, controllers…",
						className: "pl-9"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: stores.map((store) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: store.href,
					target: "_blank",
					rel: "noreferrer",
					className: "group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-fg",
							children: store.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
							children: ["Open search ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
						})
					]
				}, store.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 font-display text-2xl text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5 text-accent" }), "Package tracking"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "A private local list for orders you are expecting. Tracking opens the carrier lookup in a new page; no retailer account is connected."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: packageTitle,
								onChange: (event) => setPackageTitle(event.target.value),
								placeholder: "Package or order name",
								"aria-label": "Package name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: carrier,
								onChange: (event) => setCarrier(event.target.value),
								placeholder: "Carrier",
								"aria-label": "Carrier"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: tracking,
								onChange: (event) => setTracking(event.target.value),
								placeholder: "Tracking number (optional)",
								"aria-label": "Tracking number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									if (!packageTitle.trim()) return;
									setPackages((items) => [{
										id: createLocalId("package-"),
										title: packageTitle.trim(),
										carrier: carrier.trim() || "Carrier",
										tracking: tracking.trim(),
										status: "Ordered"
									}, ...items]);
									setPackageTitle("");
									setTracking("");
								},
								children: "Add package"
							})
						]
					}),
					packages.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: packages.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-36 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [item.carrier, item.tracking ? ` · ${item.tracking}` : ""]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: item.status,
									onChange: (event) => setPackages((items) => items.map((entry) => entry.id === item.id ? {
										...entry,
										status: event.target.value
									} : entry)),
									className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Ordered" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Shipped" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Out for delivery" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Delivered" })
									]
								}),
								item.tracking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`,
									target: "_blank",
									rel: "noreferrer",
									className: "rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg",
									children: "Track"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setPackages((items) => items.filter((entry) => entry.id !== item.id)),
									children: "Remove"
								})
							]
						}, item.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "No packages yet. Add an order to keep its delivery status beside your shopping shortcuts."
					})
				]
			})
		]
	});
}
//#endregion
export { ShopSection };
