import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recommendations-B-U85RA9.js
var askRecommendations_createServerFn_handler = createServerRpc({
	id: "3db7b453b5e2b488878187f97cc6eceef7379870b4d578ec6a567d8b62bd4f4b",
	name: "askRecommendations",
	filename: "src/lib/recommendations.ts"
}, (opts) => askRecommendations.__executeServer(opts));
var askRecommendations = createServerFn({ method: "POST" }).validator((data) => {
	const value = data;
	return {
		prompt: typeof value?.prompt === "string" ? value.prompt.slice(0, 600) : "",
		catalog: typeof value?.catalog === "string" ? value.catalog.slice(0, 2400) : ""
	};
}).handler(askRecommendations_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI recommendations are not enabled for this library yet."
	};
	const response = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 260,
			messages: [{
				role: "system",
				content: "You are Reelcase's concise media recommendation guide. Use only the supplied local catalog. Suggest 3 titles max, explain why, and never claim to have watched a video."
			}, {
				role: "user",
				content: `Catalog:\n${data.catalog}\n\nRequest: ${data.prompt}`
			}]
		})
	});
	if (!response.ok) return {
		ok: false,
		error: "Recommendation service is unavailable."
	};
	return {
		ok: true,
		text: (await response.json()).choices?.[0]?.message?.content ?? "No recommendation returned."
	};
});
//#endregion
export { askRecommendations_createServerFn_handler };
