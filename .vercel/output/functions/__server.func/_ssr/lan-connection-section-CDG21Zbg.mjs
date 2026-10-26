import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { P as RefreshCw, b as Smartphone, mt as Laptop, r as Wifi, zt as Copy } from "../_libs/lucide-react.mjs";
import { u as companionHealth } from "./companion-C8xPNDAD.mjs";
import { $ as Button, D as listNetworkDevices, M as registerPeriodicTask, Sn as useLibrary, b as getNetworkDeviceId } from "./library-app-BtCPS7Tj.mjs";
import { s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lan-connection-section-CDG21Zbg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LanConnectionSection() {
	const [origin, setOrigin] = (0, import_react.useState)("");
	const [localHost, setLocalHost] = (0, import_react.useState)(false);
	const [quickTunnel, setQuickTunnel] = (0, import_react.useState)({});
	const [tunnelBusy, setTunnelBusy] = (0, import_react.useState)(false);
	const [lanOrigins, setLanOrigins] = (0, import_react.useState)([]);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [companion, setCompanion] = (0, import_react.useState)("checking");
	const [devices, setDevices] = (0, import_react.useState)([]);
	const [mapStatus, setMapStatus] = (0, import_react.useState)("Checking devices…");
	const ownDeviceId = (0, import_react.useMemo)(() => getNetworkDeviceId(), []);
	const refreshDeviceMap = async (signal) => {
		try {
			const result = await listNetworkDevices();
			if (signal?.aborted) return;
			setDevices(result.devices);
			setMapStatus(result.devices.length ? `${result.devices.length} active device${result.devices.length === 1 ? "" : "s"}` : "Waiting for another device to open Realhub");
		} catch {
			if (!signal?.aborted) setMapStatus("Device map is temporarily unavailable");
		}
	};
	(0, import_react.useEffect)(() => {
		const current = window.location;
		const loopback = current.hostname === "localhost" || current.hostname === "127.0.0.1" || current.hostname === "::1";
		setLocalHost(loopback && current.port === "8080");
		let stopTunnel;
		if (loopback && current.port === "8080") stopTunnel = registerPeriodicTask({
			name: "Tunnel status",
			everyMs: 2500,
			firstMs: 0,
			work: async (signal) => {
				try {
					const data = await (await fetch("/api/quick-tunnel", { signal: AbortSignal.any([signal, AbortSignal.timeout(5e3)]) })).json();
					if (!signal.aborted) setQuickTunnel(data);
				} catch {
					if (!signal.aborted) setQuickTunnel({ error: "Tunnel status unavailable." });
				}
			}
		}).cancel;
		setOrigin(loopback ? "" : current.origin);
		if (loopback) fetch("/api/lan-origin").then((response) => response.ok ? response.json() : { origins: [] }).then((data) => setLanOrigins(Array.isArray(data.origins) ? data.origins : [])).catch(() => setLanOrigins([]));
		if (current.port === "8080" && loopback) companionHealth().then((health) => setCompanion(health?.ok ? "ready" : "offline")).catch(() => setCompanion("offline"));
		else setCompanion("offline");
		const task = registerPeriodicTask({
			name: "Device map",
			everyMs: 1e4,
			firstMs: 0,
			work: refreshDeviceMap
		});
		return () => {
			task.cancel();
			stopTunnel?.();
		};
	}, []);
	const changeTunnel = async (action) => {
		setTunnelBusy(true);
		try {
			const response = await fetch("/api/quick-tunnel", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ action })
			});
			setQuickTunnel(await response.json());
		} catch {
			setQuickTunnel({ error: "Could not reach the local tunnel controller." });
		} finally {
			setTunnelBusy(false);
		}
	};
	const copyAddress = async () => {
		if (!origin) return;
		try {
			await navigator.clipboard.writeText(origin);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};
	const visibleDevices = devices.slice(0, 12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Home network",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
		title: "Bring another screen into Realhub.",
		copy: "Share one address, watch the device map appear, then start a room when everyone is connected.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Share this address"
					}), origin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-all font-mono text-sm text-fg",
							children: origin
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => void copyAddress(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Address copied" : "Copy address"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => useLibrary.getState().setSource("watch-room"),
								children: "Open Watch Room"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-5 text-muted",
							children: "On another computer, phone, or TV browser: join the same normal home Wi‑Fi, open this exact address, and leave Realhub open. It will appear in the map below within about 25 seconds."
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg",
						children: "This localhost address works only on this computer."
					}), lanOrigins.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "Open Realhub through your home-network address, start a room there, then copy its invitation:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: lanOrigins.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "rounded-sm bg-elevated px-3 py-2 font-mono text-xs text-accent shadow-border",
							href: candidate,
							children: candidate
						}, candidate))
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "No home-network address was found. Connect this computer to your normal home network, then reopen this guide."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Local companion"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl text-fg",
							children: companion === "ready" ? "Ready on this computer" : companion === "checking" ? "Checking…" : "Not detected"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "The companion speeds up local folders on this computer. Other devices can join the Realhub page and Watch Rooms, but do not receive its local files."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Across networks · Cloudflare trial"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Temporary public address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
						children: "Start a Quick Tunnel on the host computer to give guests a temporary address for Realhub and Watch Room signaling. Share it only with people you invite. The address disappears when you stop the tunnel or close the host server."
					}),
					localHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: tunnelBusy || Boolean(quickTunnel.starting),
								onClick: () => void changeTunnel(quickTunnel.running ? "stop" : "start"),
								children: quickTunnel.running ? "Stop trial tunnel" : quickTunnel.starting ? "Starting…" : "Start trial tunnel"
							}), quickTunnel.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => void navigator.clipboard.writeText(quickTunnel.url),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy public address"]
							})]
						}),
						quickTunnel.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 break-all font-mono text-sm text-accent",
							children: quickTunnel.url
						}),
						quickTunnel.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted",
							children: [
								quickTunnel.error,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-accent underline",
									href: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/",
									target: "_blank",
									rel: "noopener noreferrer",
									children: "Cloudflare install instructions"
								})
							]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Open this tab on the host computer to control its trial tunnel."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: "Quick Tunnels are for testing. A tunnel carries the page and room signaling; peer media may still require a TURN relay when direct connectivity fails."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Available device map"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg",
							children: mapStatus
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Devices appear only after they open Realhub. The map stores a short-lived browser label, never network addresses or files."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => void refreshDeviceMap(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Refresh map"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-3 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border bg-bg/45 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Realhub host"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: origin || "Local preview"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-5 text-muted",
							children: "This computer shares the app address and coordinates the active-device map."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
						children: [visibleDevices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/45 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [device.kind === "mobile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laptop, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "min-w-0 truncate text-sm font-medium text-fg",
										children: device.id === ownDeviceId ? "This device" : device.label
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: device.id === ownDeviceId ? device.label : "Connected to Realhub"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-accent",
									children: "Active now"
								})
							]
						}, device.id)), !visibleDevices.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-md border border-dashed border-border p-3 text-sm text-muted sm:col-span-2 xl:col-span-3",
							children: "Waiting for a device to open the shared address."
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Four steps to connect"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-4 grid gap-4 md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "1. Use the Ethernet address."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Use the address shown above for normal home Wi‑Fi and Ethernet. The NordLynx address is for VPN peers."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "2. Keep guests off isolated Wi‑Fi."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Guest Wi‑Fi often blocks device-to-device traffic. Join the normal household network instead."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "3. Look for the device map."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"A guest that opens Realhub shows up here automatically. Refresh the map if it has just joined."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "4. Start or join a Watch Room."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"After the guest is visible, open Watch Room and use the same invitation or room code."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs leading-5 text-subtle",
						children: "If the shared page does not open, allow Realhub through the host computer’s private-network firewall and confirm the guest is on the same normal home network."
					})
				]
			})
		]
	});
}
//#endregion
export { LanConnectionSection };
