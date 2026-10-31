import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  browserConsent,
  refreshBrowserConsent,
  serverPermissionSnapshot,
  type BrowserScope,
} from "@/lib/capability-consent";
import { companionFetch } from "@/lib/companion";
export function useBrowserPermission(scope: BrowserScope) {
  const value = useSyncExternalStore(
    browserConsent.subscribe,
    browserConsent.snapshot,
    () => serverPermissionSnapshot,
  );
  useEffect(refreshBrowserConsent, []);
  return value.scopes[scope].allowed && !value.error;
}
const labels = {
  "draft-composer": "Draft composers",
  "local-vision": "Local image analysis",
} as const;
const descriptions = {
  "draft-composer":
    "Allows opening a prepared Stream Signal draft in an external composer. Copy/export and manual sharing receipts are separate. This never publishes a post.",
  "local-vision":
    "Allows optional browser model downloads and selected-image inference on this device. Photo bytes stay local. Revocation discards pending results. An in-flight model download or inference may finish; already cached model files are retained.",
};
export function BrowserPermissionControl({ scope }: { scope: BrowserScope }) {
  const allowed = useBrowserPermission(scope),
    value = useSyncExternalStore(
      browserConsent.subscribe,
      browserConsent.snapshot,
      () => serverPermissionSnapshot,
    ),
    [error, setError] = useState("");
  return (
    <div className="rounded-lg border border-border p-4" data-browser-permission={scope}>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div className="min-w-0 w-full flex-1">
          <h3 className="text-sm font-medium text-fg">{labels[scope]}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">{descriptions[scope]}</p>
          <p className="mt-2 text-xs text-accent">
            {allowed ? "Allowed in this browser" : "Not allowed in this browser"}
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11 max-w-full shrink-0 whitespace-normal"
          onClick={() => {
            try {
              browserConsent.change(scope, !allowed);
              setError("");
            } catch (cause) {
              setError((cause as Error).message);
            }
          }}
        >
          {allowed ? "Revoke" : "Allow"} {labels[scope].toLowerCase()}
        </Button>
      </div>
      {(error || value.error) && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error || value.error}
        </p>
      )}
    </div>
  );
}
type NativeScope = "model-transfers" | "provider-session";
type NativeState = {
  pendingRevocations?: NativeScope[];
  ok: boolean;
  version: 1;
  revision: number;
  error?: string;
  scopes: Record<NativeScope, { allowed: boolean; generation: number }>;
};
export async function readNativePermissions() {
  const response = await companionFetch("/permissions"),
    value = await response.json();
  if (!response.ok || !value.ok) throw Error(value.error || "Permission status unavailable.");
  if (
    value.version !== 1 ||
    !Number.isSafeInteger(value.revision) ||
    ["model-transfers", "provider-session"].some(
      (id) =>
        typeof value.scopes?.[id]?.allowed !== "boolean" ||
        !Number.isSafeInteger(value.scopes[id].generation),
    )
  )
    throw Error("Permission status is unreadable; optional access remains unverified.");
  return value as NativeState;
}
const nativeLabels = {
  "model-transfers": "Model transfers",
  "provider-session": "Browser-session access",
};
const nativeDescriptions = {
  "model-transfers":
    "Allows explicitly requested model weight downloads/imports on this computer. Revocation cancels pending transfers and prevents publication. Installed models, prompts and recipes remain. Engine setup is a separate explicit operation.",
  "provider-session":
    "Allows the local downloader to read the selected browser session only when you also select Use my signed-in browser for an individual download. Revocation stops affected queued/running jobs; partial files and ordinary downloads remain.",
};
export function NativePermissionControl({
  scope,
  autoload = false,
}: {
  scope: NativeScope;
  autoload?: boolean;
}) {
  const [state, setState] = useState<NativeState | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const check = async () => {
    setBusy(true);
    setError("");
    try {
      setState(await readNativePermissions());
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (autoload) void check();
  }, [autoload]);
  const allowed = !!state?.scopes?.[scope]?.allowed,
    pending = state?.pendingRevocations?.includes(scope);
  return (
    <div className="rounded-lg border border-border p-4" data-native-permission={scope}>
      <h3 className="text-sm font-medium text-fg">{nativeLabels[scope]}</h3>
      <p className="mt-1 text-xs leading-5 text-muted">{nativeDescriptions[scope]}</p>
      <p className="mt-2 text-xs text-accent">
        {state
          ? allowed
            ? "Allowed on this Companion"
            : "Not allowed on this Companion"
          : "Not checked · Companion v18 required"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={busy}
          onClick={() => void check()}
        >
          {busy ? "Checking…" : "Check " + nativeLabels[scope].toLowerCase()}
        </Button>
        {state && (
          <Button
            className="min-h-11"
            variant={allowed ? "secondary" : "default"}
            disabled={busy || (!!state.error && !allowed)}
            onClick={() => {
              setBusy(true);
              setError("");
              void (async () => {
                try {
                  const response = await companionFetch("/permissions/change", {
                      method: "POST",
                      body: JSON.stringify({
                        scope,
                        revision: state.revision,
                        allowed: pending ? false : !allowed,
                      }),
                    }),
                    next = await response.json();
                  if (!response.ok || !next.ok)
                    throw Error(next.error || "Permission change failed.");
                  setState(next);
                } catch (cause) {
                  setError((cause as Error).message);
                  try {
                    setState(await readNativePermissions());
                  } catch {
                    setState(null);
                  }
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            {pending ? "Retry revocation of" : allowed ? "Revoke" : "Allow"}{" "}
            {nativeLabels[scope].toLowerCase()}
          </Button>
        )}
      </div>
      {(error || state?.error) && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error || state?.error}
        </p>
      )}
    </div>
  );
}
export function CapabilityPermissions() {
  return (
    <section
      aria-label="Optional integration permissions"
      className="my-5 space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2 className="font-display text-xl text-fg">Optional permissions</h2>
      <p className="text-sm leading-6 text-muted">
        A permission allows a specific action; it does not connect an account, install a tool or
        prove readiness. Browser choices apply to this browser profile. Companion choices apply to
        this computer and all its approved app origins. Folder grants remain in Companion folder
        access below.
      </p>
      <NativePermissionControl scope="model-transfers" />
      <NativePermissionControl scope="provider-session" />
      <BrowserPermissionControl scope="local-vision" />
      <BrowserPermissionControl scope="draft-composer" />
      <p className="text-xs leading-5 text-muted">
        Remote AI assistance and automatic publishing are unconfigured and have no grant. AI guide
        uses existing title/tag matches locally. RustDesk pairing stays in its native client.
        Revocation cannot retract bytes already downloaded or posted, close an external composer, or
        erase cached models. No credentials or content are stored in this ledger.
      </p>
    </section>
  );
}
