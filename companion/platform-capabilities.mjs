const windowsOnly = new Set([
  "launch",
  "launch-receipts",
  "shortcut-catalog",
  "shortcut-icons",
  "steam-epic-catalog",
  "tray-autostart",
  "tray-notifications",
]);
/** @param {string} platform */
export function platformContract(platform) {
  return {
    schema: 1,
    os: ["win32", "linux", "darwin"].includes(platform) ? platform : "other",
    pathStyle: platform === "win32" ? "windows" : "posix",
    rootSeparator: platform === "win32" ? ";" : ":",
    windowsDesktop: platform === "win32",
    nativeInstallers: platform === "win32" ? "windows-only" : "external-setup",
    testedFileSystems: ["win32"],
    nativeDesktopVerified: false,
    note:
      platform === "win32"
        ? "The Windows filesystem bridge was tested. Desktop program starts remain unverified; other operating systems have contract fixtures only."
        : "Portable file and browser features remain available. Windows desktop launch, shortcut discovery, tray and startup are unsupported; native behavior on this OS is unverified.",
  };
}
/** @template {string} T @param {T[]} values @param {string} platform @returns {T[]} */
export function supportedCapabilities(values, platform) {
  return values.filter((value) => platform === "win32" || !windowsOnly.has(value));
}
/** @param {string} path @param {string} platform */
export function platformActionIssue(path, platform) {
  if (platform === "win32") return null;
  const name = path.split("?")[0];
  return name === "/launch" ||
    name === "/launch-history" ||
    name === "/launch-receipts" ||
    name === "/shortcuts" ||
    name === "/validate-shortcuts" ||
    name.startsWith("/shortcut-icon") ||
    name.startsWith("/games/") ||
    name === "/tray/autostart" ||
    name === "/tray/notify" ||
    name === "/studio/start" ||
    name === "/studio/qwen/start"
    ? "This desktop operation is supported on Windows only. Browser and approved-file features remain available."
    : null;
}
