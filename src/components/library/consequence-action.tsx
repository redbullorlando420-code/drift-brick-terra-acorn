import * as Dialog from "@radix-ui/react-dialog";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
/** Preview opens read-only. Only the named confirmation runs the mutation. */
export function ConsequenceAction({
  label,
  title,
  children,
  confirm,
  onConfirm,
  disabled = false,
}: {
  label: string;
  title: string;
  children: ReactNode;
  confirm: string;
  onConfirm: () => unknown | Promise<unknown>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          setOpen(v);
          setError("");
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="ghost" className="min-h-11" disabled={disabled}>
          {label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto rounded-xl border border-border bg-surface p-6 text-fg shadow-border">
          <Dialog.Title className="font-display text-2xl">{title}</Dialog.Title>
          <Dialog.Description asChild>
            <div className="space-y-3 text-sm leading-6 text-muted">{children}</div>
          </Dialog.Description>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11 max-w-full whitespace-normal"
              disabled={busy}
              onClick={() => {
                if (busy) return;
                setBusy(true);
                setError("");
                void Promise.resolve()
                  .then(onConfirm)
                  .then(
                    () => setOpen(false),
                    (e) =>
                      setError(
                        e instanceof Error
                          ? e.message
                          : "The action failed. Your prior saved data was kept.",
                      ),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              {busy ? "Saving…" : confirm}
            </Button>
            <Dialog.Close asChild>
              <Button variant="secondary" className="min-h-11" disabled={busy}>
                Cancel
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
