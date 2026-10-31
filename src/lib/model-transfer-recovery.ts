export type ModelTransferReceipt = {
  id: string;
  name: string;
  role: string;
  repo: string;
  revision: string;
  state: string;
  received: number;
  bytes: number;
  note: string;
};
export type ModelTransferRecovery = {
  version: 1;
  maxEntries: number;
  error?: string;
  entries: ModelTransferReceipt[];
};
export function modelTransferRecovery(value: unknown): ModelTransferRecovery | undefined {
  const row = value as ModelTransferRecovery | undefined;
  if (
    !row ||
    row.version !== 1 ||
    row.maxEntries !== 8 ||
    !Array.isArray(row.entries) ||
    row.entries.length > 8 ||
    (row.error !== undefined && typeof row.error !== "string")
  )
    return;
  const states = [
    "prepared",
    "downloading",
    "paused",
    "interrupted",
    "restart-required",
    "verifying",
    "publishing",
    "done",
    "cancelled",
    "error",
  ];
  if (
    row.entries.some(
      (entry) =>
        !entry ||
        typeof entry.id !== "string" ||
        !/^[a-f0-9-]{36}$/.test(entry.id) ||
        typeof entry.name !== "string" ||
        entry.name.length > 192 ||
        typeof entry.repo !== "string" ||
        entry.repo.length > 256 ||
        typeof entry.revision !== "string" ||
        !/^[a-f0-9]{40}$/.test(entry.revision) ||
        !states.includes(entry.state) ||
        !["checkpoints", "diffusion_models", "text_encoders", "vae"].includes(entry.role) ||
        typeof entry.note !== "string" ||
        entry.note.length > 600 ||
        !Number.isSafeInteger(entry.received) ||
        !Number.isSafeInteger(entry.bytes) ||
        entry.received < 0 ||
        entry.bytes < 10 ||
        entry.bytes > 30e9 ||
        entry.received > entry.bytes,
    )
  )
    return;
  return row;
}
