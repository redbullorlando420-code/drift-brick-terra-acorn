import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
//#region node_modules/zustand/esm/vanilla/shallow.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var isIterable = (obj) => Symbol.iterator in obj;
var hasIterableEntries = (value) => "entries" in value;
var compareEntries = (valueA, valueB) => {
	const mapA = valueA instanceof Map ? valueA : new Map(valueA.entries());
	const mapB = valueB instanceof Map ? valueB : new Map(valueB.entries());
	if (mapA.size !== mapB.size) return false;
	for (const [key, value] of mapA) if (!mapB.has(key) || !Object.is(value, mapB.get(key))) return false;
	return true;
};
var compareIterables = (valueA, valueB) => {
	const iteratorA = valueA[Symbol.iterator]();
	const iteratorB = valueB[Symbol.iterator]();
	let nextA = iteratorA.next();
	let nextB = iteratorB.next();
	while (!nextA.done && !nextB.done) {
		if (!Object.is(nextA.value, nextB.value)) return false;
		nextA = iteratorA.next();
		nextB = iteratorB.next();
	}
	return !!nextA.done && !!nextB.done;
};
function shallow(valueA, valueB) {
	if (Object.is(valueA, valueB)) return true;
	if (typeof valueA !== "object" || valueA === null || typeof valueB !== "object" || valueB === null) return false;
	if (Object.getPrototypeOf(valueA) !== Object.getPrototypeOf(valueB)) return false;
	if (isIterable(valueA) && isIterable(valueB)) {
		if (hasIterableEntries(valueA) && hasIterableEntries(valueB)) return compareEntries(valueA, valueB);
		return compareIterables(valueA, valueB);
	}
	return compareEntries({ entries: () => Object.entries(valueA) }, { entries: () => Object.entries(valueB) });
}
//#endregion
//#region node_modules/zustand/esm/react/shallow.mjs
function useShallow(selector) {
	const prev = import_react.useRef(void 0);
	return (state) => {
		const next = selector(state);
		return shallow(prev.current, next) ? prev.current : prev.current = next;
	};
}
//#endregion
//#region node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
	let state;
	const listeners = /* @__PURE__ */ new Set();
	const setState = (partial, replace) => {
		const nextState = typeof partial === "function" ? partial(state) : partial;
		if (!Object.is(nextState, state)) {
			const previousState = state;
			state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
			listeners.forEach((listener) => listener(state, previousState));
		}
	};
	const getState = () => state;
	const getInitialState = () => initialState;
	const subscribe = (listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};
	const api = {
		setState,
		getState,
		getInitialState,
		subscribe
	};
	const initialState = state = createState(setState, getState, api);
	return api;
};
var createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);
//#endregion
//#region node_modules/zustand/esm/react.mjs
var identity = (arg) => arg;
function useStore(api, selector = identity) {
	const slice = import_react.useSyncExternalStore(api.subscribe, import_react.useCallback(() => selector(api.getState()), [api, selector]), import_react.useCallback(() => selector(api.getInitialState()), [api, selector]));
	import_react.useDebugValue(slice);
	return slice;
}
var createImpl = (createState) => {
	const api = createStore(createState);
	const useBoundStore = (selector) => useStore(api, selector);
	Object.assign(useBoundStore, api);
	return useBoundStore;
};
var create = ((createState) => createState ? createImpl(createState) : createImpl);
//#endregion
export { useShallow as n, create as t };
