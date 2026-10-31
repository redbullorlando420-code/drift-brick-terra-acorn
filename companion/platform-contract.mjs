import { posix, win32 } from "node:path";
export {
  platformContract,
  supportedCapabilities,
  platformActionIssue,
} from "./platform-capabilities.mjs";
export function configuredRootPaths(value, platform = process.platform) {
  if (typeof value !== "string" || value.length > 65536) return [];
  const paths = platform === "win32" ? win32 : posix;
  const separator = platform === "win32" || value.includes(";") ? ";" : ":";
  return [
    ...new Set(
      value
        .split(separator)
        .map((p) => p.trim())
        .filter((p) => p && paths.isAbsolute(p)),
    ),
  ].slice(0, 64);
}
