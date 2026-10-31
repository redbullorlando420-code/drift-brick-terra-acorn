import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { diagnosticText, DIAGNOSTIC_EXCLUDED, type DiagnosticKind } from "@/lib/diagnostic-export";
export function DiagnosticExportPreview({ kind, data }: { kind: DiagnosticKind; data: unknown }) {
  const [text, setText] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    setText("");
    setError("");
  }, [data]);
  return (
    <details
      className="mt-3 rounded-md border border-border p-3"
      aria-label="Diagnostic privacy preview"
    >
      <summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">
        Shareable diagnostic · privacy preview
      </summary>
      <p className="mt-2 text-xs leading-5 text-muted">
        Only listed status categories and measurements are exported. Personal backups are separate
        and contain private data.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-muted">
        {DIAGNOSTIC_EXCLUDED.map((item) => (
          <li key={item}>Excluded: {item}</li>
        ))}
      </ul>
      <Button
        variant="secondary"
        className="mt-3 min-h-11"
        onClick={() => {
          try {
            setText(diagnosticText(kind, data));
            setError("");
          } catch {
            setError("This diagnostic could not be prepared. No raw data was exported.");
          }
        }}
      >
        Preview diagnostic JSON
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-accent">
          {error}
        </p>
      )}
      {text && (
        <textarea
          aria-label="Shareable diagnostic JSON"
          readOnly
          value={text}
          className="mt-3 min-h-44 w-full resize-y rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg"
        />
      )}
    </details>
  );
}
