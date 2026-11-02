//#region node_modules/.nitro/vite/services/ssr/assets/pull-dispatch-trace-C71-V1QT.js
/** Session-only, bounded state transitions. No URLs, creator IDs, payloads or timers. */
function createDispatchTrace(now = () => Date.now()) {
	let serial = 0, events = [];
	const listeners = /* @__PURE__ */ new Set();
	return {
		begin(lane, operation) {
			const id = ++serial, queuedAt = now();
			return (phase) => {
				const at = now();
				events = [...events.slice(-63), {
					id,
					lane,
					operation,
					phase,
					at,
					waitedMs: Math.max(0, at - queuedAt)
				}];
				for (const listener of listeners) listener();
			};
		},
		snapshot: () => events,
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
	};
}
var pullDispatchTrace = createDispatchTrace();
//#endregion
export { pullDispatchTrace as n, createDispatchTrace as t };
