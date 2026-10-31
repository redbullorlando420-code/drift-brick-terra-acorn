import { readFileSync, writeFileSync, renameSync, statSync } from "node:fs";
export const NATIVE_CONSENTS = ["model-transfers", "provider-session"];
/** Small private host policy, independent of user content and root approval. */
export function createCapabilityConsent({
  file,
  save = (value) => {
    const temp = file + ".tmp";
    writeFileSync(temp, JSON.stringify(value), { mode: 0o600 });
    renameSync(temp, file);
  },
} = {}) {
  let revision = 0,
    error = "",
    scopes = Object.fromEntries(
      NATIVE_CONSENTS.map((id) => [id, { allowed: false, generation: 0 }]),
    ),
    leases = new Set(),
    pendingRevocations = new Set();
  try {
    if (file && statSync(file).size > 16384) throw Error("Permission policy is too large.");
    if (file) {
      const value = JSON.parse(readFileSync(file, "utf8"));
      if (value.version !== 1 || !Number.isSafeInteger(value.revision) || value.revision < 0)
        throw Error("Unsupported permission policy.");
      for (const id of NATIVE_CONSENTS) {
        const row = value.scopes?.[id];
        if (
          !row ||
          typeof row.allowed !== "boolean" ||
          !Number.isSafeInteger(row.generation) ||
          row.generation < 0
        )
          throw Error("Invalid permission policy.");
        scopes[id] = { allowed: row.allowed, generation: row.generation };
      }
      revision = value.revision;
    }
  } catch (cause) {
    if (cause.code !== "ENOENT")
      error =
        "Permission policy could not be read. Optional access is blocked; preserve the file and repair it before granting access.";
  }
  const snapshot = () => ({
    version: 1,
    revision,
    scopes: Object.fromEntries(
      NATIVE_CONSENTS.map((id) => [id, { ...scopes[id], allowed: !error && scopes[id].allowed }]),
    ),
    ...(error ? { error } : {}),
    pendingRevocations: [...pendingRevocations],
  });
  function acquire(scope) {
    if (!NATIVE_CONSENTS.includes(scope) || error || !scopes[scope].allowed)
      throw Error("Permission required: " + scope + ". Review optional permissions in Settings.");
    if (leases.size >= 128) throw Error("Too many pending optional actions.");
    const generation = scopes[scope].generation,
      controller = new AbortController();
    const lease = {
      scope,
      signal: controller.signal,
      assert: () => {
        if (
          controller.signal.aborted ||
          error ||
          !scopes[scope].allowed ||
          scopes[scope].generation !== generation
        )
          throw Error("Permission changed. The pending action was stopped.");
      },
      release: () => leases.delete(lease),
      abort: () => controller.abort(),
    };
    leases.add(lease);
    return lease;
  }
  function change(scope, expected, allowed) {
    if (!NATIVE_CONSENTS.includes(scope) || typeof allowed !== "boolean")
      throw Error("Unknown optional permission.");
    if (expected !== revision)
      throw Error("Permission choices changed. Refresh before trying again.");
    if (error) throw Error(error);
    if (allowed && pendingRevocations.has(scope))
      throw Error("Retry saving the pending revocation before granting this permission again.");
    const next = {
      version: 1,
      revision: revision + 1,
      scopes: { ...scopes, [scope]: { allowed, generation: scopes[scope].generation + 1 } },
    };
    try {
      save(next);
    } catch {
      if (!allowed) {
        pendingRevocations.add(scope);
        scopes[scope] = { allowed: false, generation: scopes[scope].generation + 1 };
        for (const lease of [...leases])
          if (lease.scope === scope) {
            lease.abort();
            lease.release();
          }
      }
      throw Error(
        "Permission could not be saved. Access was not granted; retry revocation before closing Companion.",
      );
    }
    revision = next.revision;
    scopes = next.scopes;
    pendingRevocations.delete(scope);
    for (const lease of [...leases])
      if (lease.scope === scope) {
        lease.abort();
        lease.release();
      }
    return snapshot();
  }
  return {
    snapshot,
    acquire,
    change,
    assertRevision: (value) => {
      if (value !== revision)
        throw Error(
          "Permission choices changed while receiving this action. Review and retry explicitly.",
        );
    },
    close: () => {
      for (const lease of [...leases]) {
        lease.abort();
        lease.release();
      }
    },
  };
}
