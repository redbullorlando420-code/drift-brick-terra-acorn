/** Safe classifications only: raw downloader output is never returned here.
 * @param {unknown} value
 */
export function downloadFailure(value) {
  const text = String(value ?? "").slice(-16000);
  if (
    /decrypt|DPAPI|encrypt|cookie database|database.*locked|could not copy.*cookie|session could not be read/i.test(
      text,
    )
  )
    return {
      code: "session-unreadable",
      message: "The local browser session could not be read.",
      help: "Close the selected browser before retrying. If Chromium encryption prevents access, use a signed-in Firefox session you can already watch with.",
    };
  if (
    /cookies.*(?:expired|invalid)|session.*expired|login.*expired|sign in.*confirm.*bot|confirm.*not a bot|requires a fresh eligible session/i.test(
      text,
    )
  )
    return {
      code: "session-expired",
      message: "YouTube requires a fresh eligible session or verification.",
      help: "Open this video on YouTube in the selected browser and complete its normal sign-in or verification. Then explicitly authorize another attempt; success is not guaranteed.",
    };
  if (
    /age.?restrict|age verification|confirm your age|members.only|private video|not available.*country|geo.?restrict|not available.*region|restricts access/i.test(
      text,
    )
  )
    return {
      code: "access-restricted",
      message: "YouTube restricts access to this video.",
      help: "Check access directly on YouTube. A local session cannot grant access your account does not have; use the provider player if downloading is unsupported.",
    };
  if (
    /sign.?in|login required|authentication required|cookies.*required|requires account access/i.test(
      text,
    )
  )
    return {
      code: "sign-in-required",
      message: "YouTube requires account access.",
      help: "First confirm this video plays on YouTube in your browser. Enable browser sign-in for one explicit retry only if that account is eligible.",
    };
  if (/Video unavailable|not available|removed|deleted|unsupported URL|not supported/i.test(text))
    return {
      code: "unavailable",
      message: "Video unavailable or unsupported by the downloader.",
      help: "Open the video on YouTube to check its availability. Keep the receipt and retry only after resolving the provider restriction.",
    };
  if (/receipts could not be saved/i.test(text))
    return {
      code: "storage-failed",
      message: "Job receipts could not be saved.",
      help: "Check destination storage and restart Companion. Existing files and prior receipts are retained.",
    };
  if (/approved.*folder|outside.*approved/i.test(text))
    return {
      code: "permission-denied",
      message: "The approved download folder is unavailable.",
      help: "Review the approved destination in Companion before retrying. No broad disk search is performed.",
    };
  if (/ENOENT|not found|not recognized/i.test(text))
    return {
      code: "tool-missing",
      message: "The configured downloader could not be started (ENOENT or missing tool).",
      help: "Check the local downloader installation and restart Companion. This check does not install or update it.",
    };
  if (/No video file/i.test(text))
    return {
      code: "no-file",
      message: "No video file was saved.",
      help: "The receipt remains available. Check the video on YouTube and the approved destination before retrying.",
    };
  return {
    code: "download-failed",
    message: "The downloader could not complete this video.",
    help: "Check the provider video, local tool and approved destination, then retry explicitly. Detailed downloader output is omitted to keep session information private.",
  };
}
