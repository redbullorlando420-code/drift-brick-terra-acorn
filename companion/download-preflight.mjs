import {
  statfsSync,
  statSync,
  lstatSync,
  existsSync,
  opendirSync,
  openSync,
  readSync,
  closeSync,
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
const MiB = 1024 * 1024,
  marker = ".realhub-download-owner.json";
const bounded = (value, fallback, min, max) =>
  Number.isSafeInteger(Number(value)) && Number(value) >= min && Number(value) <= max
    ? Number(value)
    : fallback;
export function downloadBudget(env = process.env) {
  return {
    marginBytes: bounded(env.REELCASE_DOWNLOAD_MARGIN_MIB, 512, 64, 16384) * MiB,
    unknownBytes: bounded(env.REELCASE_DOWNLOAD_ESTIMATE_MIB, 2048, 64, 65536) * MiB,
  };
}
export function downloadEstimate(value) {
  return Number.isSafeInteger(value) && value > 0 && value <= 1024 ** 4 ? value : null;
}
const identity = (s) => [s.dev, s.ino, s.birthtimeNs, s.size, s.mtimeNs].map(String).join(":");
function inventory(folder, authority) {
  if (!existsSync(folder)) return [];
  const directory=opendirSync(folder),names=[];try{let entry;while(names.length<=128&&(entry=directory.readSync()))names.push(entry.name);}finally{directory.closeSync();}
  if (names.length > 128)
    throw Error(
      "The job folder contains too many files to verify. Keep it and start a fresh copy.",
    );
  return names
    .filter((n) => n !== marker)
    .sort()
    .map((name) => {
      const file = join(folder, name);
      authority?.assertWrite(file);
      const stat = lstatSync(file, { bigint: true });
      if (!stat.isFile() || stat.isSymbolicLink())
        throw Error("The job folder contains an unrelated entry. Keep it and start a fresh copy.");
      const fd = openSync(file, "r");
      try {
        const size = Number(stat.size),
          hash = createHash("sha256"),
          sample = Buffer.alloc(Math.min(65536, size));
        for (const offset of [...new Set([0, Math.max(0, size - sample.length)])]) {
          const count = readSync(fd, sample, 0, sample.length, offset);
          hash.update(sample.subarray(0, count));
        }
        if (identity(lstatSync(file, { bigint: true })) !== identity(stat))
          throw Error("A partial file changed during verification. Wait for it to stop.");
        return { name, identity: identity(stat), bytes: size, sample: hash.digest("hex") };
      } finally {
        closeSync(fd);
      }
    });
}
export function createDownloadPreflight({
  root,
  authority,
  approveRoot,
  space = statfsSync,
  budget = downloadBudget(),
}) {
  const verify = (job) => {
    if (!approveRoot(root)) throw Error("An approved download folder is required.");
    const folder = join(root, job.folderName || (job.source === "youtube" ? job.key : job.id));
    authority?.assertWrite(folder);
    if (existsSync(folder) && !approveRoot(folder))
      throw Error("The download destination is no longer approved.");
    const files = inventory(folder, authority);
    if (files.length || existsSync(join(folder, marker))) {
      let saved;
      try {
        const file = join(folder, marker);
        authority?.assertWrite(file);
        if (lstatSync(file).isSymbolicLink() || statSync(file).size > 128 * 1024) throw Error();
        saved = JSON.parse(readFileSync(file, "utf8"));
      } catch {
        throw Error(
          "Existing files have no verified ownership receipt. Keep them and start a fresh copy.",
        );
      }
      if (
        saved.version !== 1 ||
        saved.id !== job.id ||
        saved.key !== job.key ||
        saved.source !== job.source ||
        saved.folderIdentity !==
          [
            statSync(folder, { bigint: true }).dev,
            statSync(folder, { bigint: true }).ino,
            statSync(folder, { bigint: true }).birthtimeNs,
          ]
            .map(String)
            .join(":") ||
        JSON.stringify(saved.files) !== JSON.stringify(files)
      )
        throw Error(
          "Existing files changed or belong to another download. Keep them and start a fresh copy.",
        );
    }
    return { folder, files };
  };
  const inspect = (job, { checkFiles = true } = {}) => {
    const checked = checkFiles ? verify(job) : { folder: job.path, files: [] };
    if (
      !approveRoot(root) ||
      !approveRoot(checkFiles && !existsSync(checked.folder) ? root : checked.folder)
    )
      throw Error("The download destination is no longer approved.");
    let freeBytes = null;
    try {
      const stat = space(existsSync(checked.folder) ? checked.folder : root, { bigint: true });
      const n = BigInt(stat.bavail) * BigInt(stat.bsize);
      freeBytes = Number(n > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : n);
    } catch {}
    const partialBytes = checked.files.reduce((n, f) => n + f.bytes, 0),
      estimateBytes = downloadEstimate(job.estimatedBytes),
      remainingBytes = Math.max(0, (estimateBytes ?? budget.unknownBytes) - partialBytes),
      requiredBytes = (checkFiles ? remainingBytes : 0) + budget.marginBytes;
    return {
      state:
        freeBytes === null ? "space-unknown" : freeBytes < requiredBytes ? "low-space" : "ready",
      freeBytes,
      estimateBytes,
      unknownAllowanceBytes: budget.unknownBytes,
      partialBytes,
      marginBytes: budget.marginBytes,
      requiredBytes,
      checkedAt: Date.now(),
    };
  };
  const checkpoint = (job) => {
    if (!approveRoot(root) || !approveRoot(job.path)) throw Error("Folder access changed.");
    const files = inventory(job.path, authority),
      target = join(job.path, marker),
      temporary = target + "." + randomUUID() + ".tmp";
    const text = JSON.stringify({
      version: 1,
      id: job.id,
      key: job.key,
      source: job.source,
      folderIdentity: [
        statSync(job.path, { bigint: true }).dev,
        statSync(job.path, { bigint: true }).ino,
        statSync(job.path, { bigint: true }).birthtimeNs,
      ]
        .map(String)
        .join(":"),
      files,
    });
    if (authority) authority.write(target, text);
    else
      try {
        writeFileSync(temporary, text, { flag: "wx" });
        renameSync(temporary, target);
      } finally {
        try {
          unlinkSync(temporary);
        } catch {}
      }
  };
  return { inspect, checkpoint, budget };
}

export function readDownloadPreflight(value) {
  if (
    !value ||
    typeof value !== "object" ||
    !["ready", "low-space", "space-unknown", "files-unverified"].includes(value.state)
  )
    return undefined;
  const result = { state: value.state };
  for (const key of [
    "freeBytes",
    "estimateBytes",
    "unknownAllowanceBytes",
    "partialBytes",
    "marginBytes",
    "requiredBytes",
    "checkedAt",
  ]) {
    if (value[key] === null) result[key] = null;
    else if (Number.isSafeInteger(value[key]) && value[key] >= 0) result[key] = value[key];
  }
  return result;
}
