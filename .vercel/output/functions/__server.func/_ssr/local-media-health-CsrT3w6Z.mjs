import { Fa as sameFileFingerprint, dn as fingerprintFile, mr as localIdentitySnapshot } from "./persist-BKzTZjAH.mjs";
import { _ as queryDirPermission, s as getDirHandle, x as resolveLocalFile } from "./scan-CiGpVPkS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/local-media-health-CsrT3w6Z.js
/** Selected files/granted roots only. No prompt, disk walk, player or thumbnail. */
async function inspectLocalMedia(video, signal) {
	signal.throwIfAborted();
	const root = getDirHandle(video.folderId);
	if (root) try {
		if (await queryDirPermission(root) !== "granted") return {
			status: "permission-needed",
			code: "permission"
		};
	} catch {
		return {
			status: "source-disconnected",
			code: "source-unreadable"
		};
	}
	try {
		const file = await resolveLocalFile(video);
		signal.throwIfAborted();
		if (file.size !== video.size) return {
			status: "content-mismatch",
			code: "size-changed"
		};
		const expected = video.localIdentity?.proof ?? localIdentitySnapshot().fingerprints[video.id]?.proof;
		if (expected) {
			const proof = await fingerprintFile(file, signal);
			signal.throwIfAborted();
			if (!sameFileFingerprint(proof, expected)) return {
				status: "content-mismatch",
				code: "fingerprint-changed"
			};
		}
		return {
			status: "available",
			code: expected ? "verified-contents" : "readable-granted-file"
		};
	} catch (e) {
		signal.throwIfAborted();
		const code = e.sourceCode;
		return {
			status: code === "NotFoundError" ? "missing-file" : code === "NotAllowedError" || code === "SecurityError" ? "permission-needed" : "source-disconnected",
			code: code === "NotFoundError" ? "missing-file" : code === "NotAllowedError" || code === "SecurityError" ? "permission" : "source-unreadable"
		};
	}
}
//#endregion
export { inspectLocalMedia };
