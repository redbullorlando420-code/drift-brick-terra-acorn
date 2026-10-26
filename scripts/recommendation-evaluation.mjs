#!/usr/bin/env node
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  evaluateCorpus,
  compareEvaluation,
  evaluateSentinels,
} from "./lib/recommendation-evaluation.mjs";
import { productionRecommendationRanking } from "./lib/recommendation-rankers.mjs";
const root = fileURLToPath(new URL("../", import.meta.url)),
  defaultCorpus = resolve(root, "benchmarks/recommendations/corpus.v1.json"),
  defaultBaseline = resolve(root, "benchmarks/recommendations/baseline.v1.json");
export function parseEvaluationArgs(args) {
  const config = {
    corpus: defaultCorpus,
    baseline: defaultBaseline,
    output: resolve(root, "screenshots/recommendation-evaluation-current.json"),
    check: false,
    qualityGate: false,
    recordBaseline: false,
    replaceBaseline: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--check") config.check = true;
    else if (arg === "--quality-gate") config.qualityGate = true;
    else if (arg === "--record-baseline") config.recordBaseline = true;
    else if (arg === "--replace-baseline") config.replaceBaseline = true;
    else if (["--corpus", "--baseline", "--output"].includes(arg)) {
      const value = args[++i];
      if (!value || value.startsWith("--")) throw Error("Missing value for " + arg);
      config[arg.slice(2)] = resolve(value);
    } else if (arg === "--help") config.help = true;
    else throw Error("Unknown option " + arg);
  }
  if (config.recordBaseline && (config.check || config.qualityGate))
    throw Error("Baseline recording cannot be combined with regression/quality gates.");
  if (config.replaceBaseline && !config.recordBaseline)
    throw Error("--replace-baseline requires --record-baseline.");
  return config;
}
const rankerFiles = [
  "src/lib/videos/guide-picks.ts",
  "src/lib/remote/youtube-recommendations.ts",
  "src/lib/remote/creator-ranked-pages.ts",
  "src/lib/videos/twitch-recommendations.ts",
  "src/lib/videos/twitch-vod-ranking.ts",
  "src/lib/videos/ranking-core.ts",
];
export async function buildRecommendationEvaluation(corpus) {
  const report = await evaluateCorpus(corpus, productionRecommendationRanking);
  report.implementation = {
    files: await Promise.all(
      rankerFiles.map(async (file) => ({
        path: file,
        sha256: createHash("sha256")
          .update(await readFile(resolve(root, file)))
          .digest("hex"),
      })),
    ),
  };
  report.sentinels = evaluateSentinels(corpus);
  report.coverage = {
    rankers: [
      "YouTube personalized shelf",
      "Twitch VOD score plus VOD ordering",
      "Guide personal picks",
      "Guide explicit topic query",
    ],
    sources: ["local", "youtube", "twitch"],
    notEvaluated: [
      "Real user satisfaction",
      "Optional remote AI wording",
      "Live ordering and player behavior",
      "Photo/adult recommendation quality",
      "Provider retrieval throughput",
    ],
    excludedSourceProbe:
      "Synthetic adult/private input tests isolation only, not adult ranking quality.",
  };
  return report;
}
function artifactPath(path) {
  const allowed = ["screenshots", "benchmarks/recommendations"].map((dir) => resolve(root, dir));
  if (!path.endsWith(".json") || !allowed.some((dir) => path.startsWith(dir + sep)))
    throw Error("JSON artifacts must stay under screenshots or benchmarks/recommendations.");
  return path;
}
export async function runEvaluation(config) {
  artifactPath(config.output);
  const identity = (value) =>
    process.platform === "win32" ? resolve(value).toLowerCase() : resolve(value);
  if (
    identity(config.output) === identity(config.baseline) ||
    identity(config.output) === identity(config.corpus) ||
    (config.recordBaseline && identity(config.baseline) === identity(config.corpus))
  )
    throw Error("Current output and baseline cannot overwrite the corpus or each other.");
  if (config.recordBaseline) {
    artifactPath(config.baseline);
    let exists = true;
    try {
      await access(config.baseline);
    } catch {
      exists = false;
    }
    if (exists && !config.replaceBaseline)
      throw Error("Baseline already exists. Review changes before using --replace-baseline.");
  }
  const corpus = JSON.parse(await readFile(config.corpus, "utf8")),
    report = await buildRecommendationEvaluation(corpus);
  const result = {
    report,
    integrityGate: {
      ok: report.contractViolations === 0 && report.sentinels.every((row) => row.detected),
      contractViolations: report.contractViolations,
      undetectedSentinels: report.sentinels.filter((row) => !row.detected).map((row) => row.id),
    },
    regression: null,
    qualityGate: {
      ok: report.quality.fail === 0 && report.quality.unmeasured === 0,
      failed: report.quality.fail,
      unmeasured: report.quality.unmeasured,
    },
  };
  if (config.check) {
    let baseline;
    try {
      baseline = JSON.parse(await readFile(config.baseline, "utf8"));
    } catch (error) {
      result.regression = {
        ok: false,
        reasons: ["Baseline missing or unreadable: " + error.message],
      };
    }
    if (baseline) result.regression = compareEvaluation(report, baseline);
  }
  await mkdir(dirname(config.output), { recursive: true });
  await writeFile(config.output, JSON.stringify(result, null, 2) + "\n");
  if (config.recordBaseline) {
    if (!result.integrityGate.ok)
      throw Error(
        "Refusing a baseline with invalid output or broken adversarial detectors; inspect " +
          config.output,
      );
    await mkdir(dirname(config.baseline), { recursive: true });
    await writeFile(config.baseline, JSON.stringify(report, null, 2) + "\n");
  }
  return result;
}
async function main() {
  try {
    const config = parseEvaluationArgs(process.argv.slice(2));
    if (config.help) {
      console.log(
        "Recommendation evaluation: --check compares a reviewed baseline; --quality-gate requires all declared synthetic checks measured and passing. --record-baseline creates the initial baseline; replacement also requires --replace-baseline. Optional --corpus, --baseline, --output accept file paths. No production user data or network is used.",
      );
      return;
    }
    const result = await runEvaluation(config);
    console.log(
      JSON.stringify(
        {
          artifact: config.output,
          corpus: result.report.corpus,
          quality: result.report.quality,
          qualityGate: result.qualityGate,
          integrityGate: result.integrityGate,
          sources: result.report.sourceSummary,
          regression: result.regression,
          sentinels: result.report.sentinels,
          findings: result.report.cases
            .filter((row) =>
              row.checks.some((check) => check.status === "fail" || check.status === "unmeasured"),
            )
            .map((row) => ({
              id: row.id,
              findings: row.checks.filter(
                (check) => check.status === "fail" || check.status === "unmeasured",
              ),
            })),
          scope: result.report.scope,
        },
        null,
        2,
      ),
    );
    if (
      !result.integrityGate.ok ||
      (config.check && !result.regression?.ok) ||
      (config.qualityGate && !result.qualityGate.ok)
    )
      process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
