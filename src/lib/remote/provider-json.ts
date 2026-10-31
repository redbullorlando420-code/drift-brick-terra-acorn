import { PROVIDER_BUDGETS, ProviderBudgetError } from "../provider-budgets.ts";
export type ProviderJsonSample = {
  provider: "youtube" | "twitch" | "other";
  outcome: "accepted" | "rejected";
  rawBytes: number;
  textUnits: number;
  tokens: number;
  containers: number;
  depth: number;
  estimatedScratchBytes: number;
  parseMs: number;
};
const samples: ProviderJsonSample[] = [];
export const providerJsonSamples = () => samples.map((row) => ({ ...row }));

/** Scan before JSON.parse allocates an object graph. This is a structural and
 * conservative payload estimate, not a claim to measure engine heap bytes. */
export function parseProviderJson(
  text: string,
  provider: ProviderJsonSample["provider"] = "other",
): any {
  const limits = PROVIDER_BUDGETS.json,
    started = performance.now();
  let rawBytes = 0,
    tokens = 0,
    containers = 0,
    depth = 0,
    peakDepth = 0,
    quoted = false,
    escaped = false,
    atom = false,
    stringUnits = 0;
  const scratch = () => rawBytes + text.length * 2 + tokens * 24 + containers * 64;
  const fail = () => {
    throw new ProviderBudgetError(
      "graph",
      "Provider metadata exceeded its parsed JSON graph budget; the page and its cursor were not accepted.",
    );
  };
  try {
    if (text.length > PROVIDER_BUDGETS.responseBytes) fail();
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i),
        c = text[i];
      rawBytes +=
        code < 128
          ? 1
          : code < 2048
            ? 2
            : code >= 0xd800 &&
                code <= 0xdbff &&
                text.charCodeAt(i + 1) >= 0xdc00 &&
                text.charCodeAt(i + 1) <= 0xdfff
              ? 1
              : 3;
      if (quoted) {
        if (c === '"' && !escaped) quoted = false;
        else {
          if (++stringUnits > limits.stringUnits) fail();
          if (escaped) escaped = false;
          else if (c === "\\") escaped = true;
        }
      } else if (c === '"') {
        quoted = true;
        stringUnits = 0;
        atom = false;
        tokens++;
      } else if (c === "{" || c === "[") {
        depth++;
        peakDepth = Math.max(peakDepth, depth);
        containers++;
        tokens++;
        atom = false;
      } else if (c === "}" || c === "]") {
        depth--;
        atom = false;
      } else if (c === "," || c === ":" || code === 32 || code === 9 || code === 10 || code === 13)
        atom = false;
      else if (!atom) {
        tokens++;
        atom = true;
      }
      if (
        rawBytes > PROVIDER_BUDGETS.responseBytes ||
        tokens > limits.tokens ||
        containers > limits.containers ||
        peakDepth > limits.depth ||
        scratch() > limits.scratchBytes
      )
        fail();
    }
    const parsed = JSON.parse(text);
    samples.push({
      provider,
      outcome: "accepted",
      rawBytes,
      textUnits: text.length,
      tokens,
      containers,
      depth: peakDepth,
      estimatedScratchBytes: scratch(),
      parseMs: performance.now() - started,
    });
    return parsed;
  } catch (error) {
    samples.push({
      provider,
      outcome: "rejected",
      rawBytes,
      textUnits: text.length,
      tokens,
      containers,
      depth: peakDepth,
      estimatedScratchBytes: scratch(),
      parseMs: performance.now() - started,
    });
    throw error;
  } finally {
    if (samples.length > 16) samples.shift();
  }
}
export const readProviderJson = async (
  response: Response,
  provider: ProviderJsonSample["provider"] = "other",
) => parseProviderJson(await response.text(), provider);
