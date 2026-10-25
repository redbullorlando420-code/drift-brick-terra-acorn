//#region node_modules/.nitro/vite/services/ssr/assets/local-vision-DyOHjYy5.js
var VISION_MODELS = {
	semantic: {
		name: "CLIP open-vocabulary",
		purpose: "Accurate review tags",
		model: "Xenova/clip-vit-base-patch32",
		revision: "d15189d7028b43f1d3e65039190477f6af591c2a"
	},
	semanticPlus: {
		name: "SigLIP semantic+",
		purpose: "Stronger semantic photo review",
		model: "Xenova/siglip-base-patch16-224",
		revision: "4649052"
	},
	semanticPro: {
		name: "SigLIP large+",
		purpose: "Highest-detail browser semantic review",
		model: "Xenova/siglip-large-patch16-256",
		revision: "main"
	}
};
var SEMANTIC_TOPICS = [
	"a person",
	"a portrait",
	"a selfie",
	"a group of people",
	"a baby",
	"a child",
	"a pet",
	"a dog",
	"a cat",
	"a bird",
	"a horse",
	"wildlife",
	"food",
	"a meal",
	"dessert",
	"a drink",
	"a restaurant",
	"a kitchen",
	"a recipe",
	"travel",
	"a vacation",
	"a hotel",
	"an airport",
	"a beach",
	"an ocean",
	"a lake",
	"a mountain",
	"a forest",
	"a sunset",
	"a sunrise",
	"a landscape",
	"nature",
	"a garden",
	"a flower",
	"a tree",
	"a vehicle",
	"a car",
	"a truck",
	"a motorcycle",
	"a bicycle",
	"a boat",
	"an airplane",
	"a train",
	"a building",
	"a house",
	"an apartment",
	"a city",
	"a street",
	"architecture",
	"a landmark",
	"a bridge",
	"a pool",
	"a party",
	"a wedding",
	"a birthday",
	"a concert",
	"a festival",
	"a sport",
	"a game",
	"fitness",
	"a team",
	"a trophy",
	"a stage",
	"a crowd",
	"a document",
	"a receipt",
	"an invoice",
	"a form",
	"a book",
	"a screen",
	"a screenshot",
	"a computer",
	"a phone",
	"a television",
	"a video game",
	"a chart",
	"a map",
	"a product",
	"clothing",
	"shoes",
	"jewelry",
	"furniture",
	"a toy",
	"art",
	"a drawing",
	"a painting",
	"a meme",
	"an indoor scene",
	"an outdoor scene",
	"night",
	"low light",
	"snow",
	"rain",
	"autumn",
	"spring",
	"summer",
	"winter",
	"black and white photo",
	"close-up photo"
];
var classifiers = /* @__PURE__ */ new Map();
var activeClassifiers = /* @__PURE__ */ new Map();
function cleanLabel(label) {
	return label.toLowerCase().split(",")[0].replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function device() {
	return typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm";
}
async function classifierFor(model, onStatus) {
	let classifier = classifiers.get(model);
	if (!classifier) {
		classifier = (async () => {
			const { pipeline } = await import("../_libs/@huggingface/transformers+[...].mjs").then((n) => n.t);
			const definition = VISION_MODELS[model];
			const task = "zero-shot-image-classification";
			const options = {
				progress_callback: onStatus,
				..."revision" in definition ? { revision: definition.revision } : {}
			};
			try {
				return await pipeline(task, definition.model, {
					device: device(),
					...options
				});
			} catch (error) {
				if (device() !== "webgpu") throw error;
				onStatus?.({ status: "WebGPU unavailable; retrying locally with WASM" });
				return pipeline(task, definition.model, {
					device: "wasm",
					...options
				});
			}
		})();
		classifiers.set(model, classifier);
	}
	try {
		return await classifier;
	} catch (error) {
		classifiers.delete(model);
		throw error;
	}
}
/**
* Optional, user-initiated image classification. The model executes in the
* browser (WebGPU when available, otherwise WASM); photo bytes stay local.
* The model download is cached by the browser for later passes.
*/
async function classifyImagesLocally(urls, onProgress, model = "semanticPlus", onModelStatus) {
	if (!urls.length) return [];
	const classifier = await classifierFor(model, onModelStatus);
	activeClassifiers.set(model, (activeClassifiers.get(model) ?? 0) + 1);
	const results = Array.from({ length: urls.length }, () => []);
	let cursor = 0;
	let completed = 0;
	const workerCount = device() === "webgpu" ? 2 : 1;
	const workers = Array.from({ length: Math.min(workerCount, urls.length) }, async () => {
		while (true) {
			const index = cursor++;
			if (index >= urls.length) return;
			const labels = await classifier(urls[index], SEMANTIC_TOPICS);
			const seen = /* @__PURE__ */ new Set();
			results[index] = labels.map((item) => ({
				label: cleanLabel(item.label),
				score: item.score
			})).filter((item) => item.score >= .018 && item.label.length >= 3 && !seen.has(item.label) && Boolean(seen.add(item.label))).slice(0, 5);
			completed += 1;
			onProgress?.(completed, urls.length);
		}
	});
	try {
		await Promise.all(workers);
		return results;
	} finally {
		await Promise.allSettled(workers);
		const remaining = (activeClassifiers.get(model) ?? 1) - 1;
		if (remaining) activeClassifiers.set(model, remaining);
		else {
			activeClassifiers.delete(model);
			classifiers.delete(model);
			await classifier.dispose().catch(() => void 0);
		}
	}
}
/** Measures preparation and inference on the same local sample; it never changes defaults. */
async function benchmarkVisionModelsLocally(urls, onProgress, onModelStatus) {
	const run = async (model) => {
		const started = performance.now();
		onModelStatus?.(model, { status: `Preparing ${VISION_MODELS[model].name}` });
		return {
			model,
			labels: await classifyImagesLocally(urls, (done, total) => onProgress?.(model, done, total), model, (status) => onModelStatus?.(model, status)),
			elapsedMs: performance.now() - started
		};
	};
	return {
		sampleSize: urls.length,
		semantic: await run("semantic"),
		semanticPlus: await run("semanticPlus"),
		semanticPro: await run("semanticPro")
	};
}
//#endregion
export { benchmarkVisionModelsLocally as n, classifyImagesLocally as r, VISION_MODELS as t };
