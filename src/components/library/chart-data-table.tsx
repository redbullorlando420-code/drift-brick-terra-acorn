import { useState, type ReactElement } from "react";
import { chartTable } from "@/lib/chart-table";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
export function ChartDataTable({ chart, title }: { chart: ReactElement; title: string }) {
  const [open, setOpen] = useState(false),
    [page, setPage] = useState(0),
    data = chartTable(chart),
    last = Math.max(0, Math.ceil(data.rows.length / 20) - 1),
    current = Math.min(page, last);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setPage(0);
      }}
    >
      <Dialog.Trigger asChild>
        <Button
          variant="secondary"
          className="min-h-11"
          aria-label={"Read " + title + " data table"}
        >
          Read chart data
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/80" />
        <Dialog.Content className="fixed inset-4 z-50 mx-auto flex max-w-3xl flex-col gap-3 overflow-auto rounded-xl border border-border bg-surface p-5 text-fg">
          <Dialog.Title className="text-xl font-medium">{title} · data table</Dialog.Title>
          <Dialog.Description className="text-sm leading-6 text-muted">
            Same completed snapshot and selected range as the chart. Counts are titles unless a
            column names another unit. Unknown or unavailable values appear as unavailable. This
            table does not require chart animation or pointer hover.
          </Dialog.Description>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="py-2 text-left text-muted">
                {data.rows.length} plotted categories · rows{" "}
                {data.rows.length ? current * 20 + 1 : 0}–
                {Math.min(data.rows.length, (current + 1) * 20)}
              </caption>
              <thead>
                <tr>
                  {data.columns.map((c) => (
                    <th key={c.key} scope="col" className="border-b border-border p-2">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(current * 20, (current + 1) * 20).map((r, i) => (
                  <tr key={current * 20 + i}>
                    {data.columns.map((c, n) =>
                      n === 0 ? (
                        <th
                          scope="row"
                          className="break-words border-b border-border p-2 font-normal"
                          key={c.key}
                        >
                          {String(r[c.key] ?? "Unavailable")}
                        </th>
                      ) : (
                        <td key={c.key} className="border-b border-border p-2 tabular-nums">
                          {typeof r[c.key] === "number" && Number.isFinite(r[c.key])
                            ? String(r[c.key])
                            : "Unavailable"}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.rows.length && <p>No plotted categories in this snapshot.</p>}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={current === 0}
              variant="secondary"
              onClick={() => setPage(current - 1)}
            >
              Previous data rows
            </Button>
            <Button
              disabled={current === last}
              variant="secondary"
              onClick={() => setPage(current + 1)}
            >
              Next data rows
            </Button>
            <Dialog.Close asChild>
              <Button>Close data table</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
