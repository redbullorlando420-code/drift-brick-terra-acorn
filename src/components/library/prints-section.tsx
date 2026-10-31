import { type ReactNode, lazy, Suspense, useEffect, useState } from "react";
import { Box, Eye, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PrintViewerTarget } from "@/lib/prints-blobs";
import { isViewablePrintName, savePrintBlob } from "@/lib/prints-blobs";
import { companionListPrints, companionReadPrint, companionSavePrint } from "@/lib/companion";
import { readHub, writeHub, bytes, HubShell, ServiceLink } from './hub-shared';
import type { LocalItem, HubStore } from './hub-shared';

const PrintModelViewer = lazy(async () => {
  const mod = await import("@/components/library/print-model-viewer");
  return { default: mod.PrintModelViewer };
});

function filesToItems(files: FileList, gamesOnly = false): LocalItem[] {
  return [...files]
    .filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name))
    .filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name))
    .map((file) => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      addedAt: Date.now(),
    }));
}

export function PrintsSection() {
  return (
    <LocalCatalog
      kind="prints"
      eyebrow="Maker shelf"
      icon={<Box className="size-4" />}
      title="3D prints"
      copy="Keep a lightweight catalog of print-ready files. Preview STL, OBJ, GLB/GLTF, and 3MF in an interactive orbit viewer with transform editor, lighting presets, wireframe, grid, and fullscreen; G-code stays list-only for slicers."
      accept=".stl,.obj,.3mf,.gcode,.glb,.gltf"
      footer={
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ServiceLink
            name="Printables"
            href="https://www.printables.com/"
            copy="Browse community-shared printable models."
          />
          <ServiceLink
            name="OpenSCAD"
            href="https://openscad.org/"
            copy="Build and customize open parametric models."
          />
        </div>
      }
    />
  );
}

function LocalCatalog({
  kind,
  eyebrow,
  icon,
  title,
  copy,
  accept,
  directory,
  footer,
}: {
  kind: "prints" | "games";
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  accept?: string;
  directory?: boolean;
  footer?: ReactNode;
}) {
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  const [viewer, setViewer] = useState<PrintViewerTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const [companionNote, setCompanionNote] = useState("");
  useEffect(() => setHub(readHub()), []);
  const items = hub[kind];
  const change = async (files: FileList | null) => {
    if (!files?.length) return;
    if (kind === "prints") {
      setBusy(true);
      try {
        const nextItems: LocalItem[] = [];
        for (const file of [...files]) {
          const blobId = await savePrintBlob(file);
          nextItems.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            size: file.size,
            addedAt: Date.now(),
            id: blobId ?? undefined,
          });
        }
        const next = { ...hub, prints: [...nextItems, ...hub.prints].slice(0, 120) };
        setHub(next);
        writeHub(next);
      } finally {
        setBusy(false);
      }
      return;
    }
    const next = { ...hub, [kind]: filesToItems(files, kind === "games") };
    setHub(next);
    writeHub(next);
  };
  const canView = (item: LocalItem) => Boolean(item.sampleSrc || (item.id && isViewablePrintName(item.name)));
  return (
    <HubShell eyebrow={eyebrow} icon={icon} title={title} copy={copy}>
      <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated">
        <PackageSearch className="size-7 text-accent" />
        <span className="mt-3 text-sm font-medium text-fg">
          {directory ? "Choose Desktop games folder" : busy ? "Saving print files…" : "Add print files"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {directory
            ? "Keeps only game launchers and shortcuts; folders and support files stay out."
            : "STL, OBJ, GLB/GLTF, and 3MF open in the in-app viewer; G-code is catalog-only."}
        </span>
        <input
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          disabled={busy}
          {...(directory ? ({ webkitdirectory: "", directory: "" } as Record<string, string>) : {})}
          onChange={(event) => {
            void change(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {kind === "prints" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void (async () => {
            setBusy(true);
            try {
              const { prints, error } = await companionListPrints(120);
              if(error){setCompanionNote(error);return;}
              if (!prints.length) {
                setCompanionNote("No STL/OBJ/GLB/3MF under approved roots (or Realhub Prints). Add a prints folder to REELCASE_ALLOWED_ROOTS.");
                return;
              }
              const nextItems: LocalItem[] = [];
              for (const row of prints.slice(0, 40)) {
                if (!isViewablePrintName(row.name)) continue;
                const file = await companionReadPrint(row.path);
                if (!file.ok || !file.dataBase64) continue;
                const bytes = Uint8Array.from(atob(file.dataBase64), (c) => c.charCodeAt(0));
                const blob = new File([bytes], file.name || row.name, { type: "application/octet-stream" });
                const blobId = await savePrintBlob(blob);
                nextItems.push({
                  name: row.name,
                  path: row.path,
                  size: row.size,
                  addedAt: Date.now(),
                  id: blobId ?? undefined,
                });
              }
              if (!nextItems.length) {
                setCompanionNote("Companion listed prints, but none could be loaded (size/format).");
                return;
              }
              const next = { ...hub, prints: [...nextItems, ...hub.prints].slice(0, 120) };
              setHub(next);
              writeHub(next);
              setCompanionNote(`Opened ${nextItems.length} print file${nextItems.length === 1 ? "" : "s"} from approved companion folders.`);
            } finally {
              setBusy(false);
            }
          })()}>Open prints from companion folder</Button>
          <Button size="sm" variant="secondary" disabled={busy || !items.some((item) => item.id)} onClick={() => void (async () => {
            setBusy(true);
            try {
              let saved = 0;
              for (const item of items.slice(0, 20)) {
                if (!item.id || !isViewablePrintName(item.name)) continue;
                const { loadPrintBlob } = await import("@/lib/prints-blobs");
                const record = await loadPrintBlob(item.id);
                if (!record?.blob) continue;
                const buffer = new Uint8Array(await record.blob.arrayBuffer());
                let binary = "";
                for (let i = 0; i < buffer.length; i += 1) binary += String.fromCharCode(buffer[i]!);
                const result = await companionSavePrint(item.name, btoa(binary));
                if (result.ok) saved += 1;
              }
              setCompanionNote(saved ? `Saved ${saved} new print file${saved === 1 ? "" : "s"} into the companion Realhub Prints folder.` : "Nothing saved. Existing filenames are preserved; use the viewer’s Save a new model copy workflow for an edited copy. Check the approved Companion folder and connection.");
            } finally {
              setBusy(false);
            }
          })()}>Save open prints to companion</Button>
          {companionNote && <p className="w-full text-xs text-muted">{companionNote}</p>}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg shadow-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-fg">
              {items.length} saved {kind === "prints" ? "print files" : "games"}
            </p>
            <p className="text-xs text-subtle">
              {kind === "prints" ? "Names in localStorage · viewable bytes in IndexedDB" : "Stored as names only"}
            </p>
          </div>
          {items.slice(0, 80).map((item) => (
            <div
              key={`${item.path}:${item.addedAt}`} data-print-name={item.name}
              className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{item.name}</p>
                <p className="truncate text-xs text-muted">{item.path}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {kind === "prints" && (
                  <Button
                    size="sm"
                    variant={canView(item) ? "default" : "secondary"}
                    type="button"
                    disabled={!canView(item)}
                    title={canView(item) ? "Open viewer + editor" : /\.gcode$/i.test(item.name) ? "G-code is not a mesh preview" : "Re-add this file to enable preview"}
                    onClick={() =>
                      setViewer({
                        name: item.name,
                        path: item.path,
                        size: item.size,
                        sampleSrc: item.sampleSrc,
                        blobId: item.id,
                      })
                    }
                  >
                    <Eye className="size-3.5" />
                    View / Edit
                  </Button>
                )}
                <p className="font-mono text-xs text-subtle">{bytes(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {footer}
      {viewer && (
        <Suspense fallback={null}>
          <PrintModelViewer target={viewer} onClose={() => setViewer(null)} />
        </Suspense>
      )}
    </HubShell>
  );
}
