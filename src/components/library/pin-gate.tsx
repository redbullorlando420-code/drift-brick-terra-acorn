import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { isPinShape } from "@/lib/videos/pin";

export function PinGate() {
  const hasPin = useLibrary((s) => Boolean(s.adultPinHash));
  const setAdultPin = useLibrary((s) => s.setAdultPin);
  const unlockAdults = useLibrary((s) => s.unlockAdults);
  const resetAdultPin = useLibrary((s) => s.resetAdultPin);
  const setSource = useLibrary((s) => s.setSource);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (!isPinShape(pin)) {
      setError("Use four digits.");
      return;
    }
    setBusy(true);
    try {
      if (!hasPin) {
        if (pin !== confirm) {
          setError("Those PINs do not match.");
          return;
        }
        await setAdultPin(pin);
        return;
      }
      const ok = await unlockAdults(pin);
      if (!ok) setError("Wrong PIN.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-elevated text-fg shadow-border">
        <Lock className="size-5" />
      </span>
      <h1 className="mt-5 font-display text-3xl text-fg">Adults</h1>
      <p className="mt-2 text-sm text-muted">
        {hasPin
          ? "Enter your PIN. Private folders stay off the rest of the library."
          : "Set a 4-digit PIN. Folders you mark as private only open here."}
      </p>
      <form
        className="mt-6 flex w-full flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          aria-label="PIN"
          placeholder="••••"
          className="text-center font-mono text-lg tracking-[0.4em]"
        />
        {!hasPin && (
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
            aria-label="Confirm PIN"
            placeholder="Confirm"
            className="text-center font-mono text-lg tracking-[0.4em]"
          />
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {hasPin ? "Unlock" : "Set PIN"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setSource("home")}>
          Back to Home
        </Button>
        {hasPin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetAdultPin();
              setPin("");
              setConfirm("");
              setError(null);
            }}
          >
            Reset PIN
          </Button>
        )}
      </div>
      <p className="mt-6 max-w-sm text-xs text-subtle">
        Nothing is uploaded. The PIN stays on this browser. Resetting it keeps
        private folders hidden until you set a new one.
      </p>
    </div>
  );
}
