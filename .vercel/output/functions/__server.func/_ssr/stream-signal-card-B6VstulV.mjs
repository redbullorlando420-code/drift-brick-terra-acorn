//#region node_modules/.nitro/vite/services/ssr/assets/stream-signal-card-B6VstulV.js
function lines(ctx, text, width, maximum) {
	const result = [];
	let line = "";
	for (const char of [...text.replace(/\s+/g, " ")]) if (ctx.measureText(line + char).width > width && line) {
		result.push(line.trim());
		line = char;
	} else line += char;
	if (line) result.push(line.trim());
	if (result.length > maximum) {
		result.length = maximum;
		let last = result[maximum - 1];
		while (last && ctx.measureText(last + "…").width > width) last = [...last].slice(0, -1).join("");
		result[maximum - 1] = last + "…";
	}
	return result;
}
/** User initiated, local canvas export: no remote artwork, credentials or
* image server. The transparent sticker space is deliberate; pixels are not links. */
async function createSignalStoryCard(pack) {
	await document.fonts.ready;
	const canvas = document.createElement("canvas");
	canvas.width = 1080;
	canvas.height = 1920;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw Error("Your browser could not create the Story image.");
	const p = pack.profile;
	ctx.fillStyle = "#151721";
	ctx.fillRect(0, 0, 1080, 1920);
	ctx.fillStyle = "#c7bceb";
	ctx.fillRect(56, 56, 968, 1808);
	ctx.fillStyle = "#242235";
	ctx.font = "600 30px Figtree, sans-serif";
	ctx.fillText("STREAM SIGNAL / LIVE ANNOUNCEMENT", 112, 150);
	ctx.fillStyle = "#242235";
	ctx.font = "800 84px Figtree, sans-serif";
	lines(ctx, p.creator, 850, 2).forEach((line, i) => ctx.fillText(line, 112, 320 + i * 92));
	ctx.font = "600 36px Figtree, sans-serif";
	ctx.fillText("IS GOING LIVE", 112, 525);
	ctx.fillStyle = "#242235";
	ctx.fillRect(112, 590, 856, 570);
	ctx.fillStyle = "#d8efa0";
	ctx.font = "600 30px Figtree, sans-serif";
	ctx.fillText("ON THE GRID", 152, 660);
	ctx.fillStyle = "#f2eefb";
	ctx.font = "700 64px Figtree, sans-serif";
	lines(ctx, p.title, 770, 3).forEach((line, i) => ctx.fillText(line, 152, 755 + i * 76));
	ctx.fillStyle = "#c7bceb";
	ctx.font = "500 42px Figtree, sans-serif";
	lines(ctx, p.game, 770, 2).forEach((line, i) => ctx.fillText(line, 152, 1040 + i * 52));
	ctx.fillStyle = "#242235";
	ctx.font = "500 36px Figtree, sans-serif";
	lines(ctx, p.message, 850, 4).forEach((line, i) => ctx.fillText(line, 112, 1260 + i * 46));
	ctx.font = "600 29px Figtree, sans-serif";
	lines(ctx, `TWITCH  ${p.twitch.replace("https://", "")}`, 850, 2).forEach((line, i) => ctx.fillText(line, 112, 1530 + i * 36));
	lines(ctx, `YOUTUBE  ${p.youtube.replace("https://", "")}`, 850, 2).forEach((line, i) => ctx.fillText(line, 112, 1640 + i * 36));
	ctx.font = "500 26px Figtree, sans-serif";
	ctx.fillText("Join the community. Watch the next lap.", 112, 1780);
	return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(Error("Could not encode the PNG.")), "image/png"));
}
//#endregion
export { createSignalStoryCard };
