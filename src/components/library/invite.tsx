import {
  Download,
  FolderPlus,
  Image,
  Monitor,
  Upload,
  Video,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RECOMMENDED_FOLDERS, type WellKnownStart } from "@/lib/videos/types";

const ICONS: Record<WellKnownStart, typeof Video> = {
  videos: Video,
  downloads: Download,
  desktop: Monitor,
  documents: FileText,
  pictures: Image,
  music: Video,
};

export function InviteStrip({
  onAddFolder,
  onAddFiles,
  onRecommended,
}: {
  onAddFolder: () => void;
  onAddFiles: () => void;
  onRecommended: (id: WellKnownStart) => void;
}) {
  return (
    <section className="mb-8 rounded-xl bg-surface px-5 py-5 shadow-border sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl leading-tight text-fg">
            Pull in the rest of this computer
          </h2>
          <p className="mt-1 text-sm text-muted">
            Start with a recommended folder, or pick any drive. Files are read
            in the browser and never leave the machine.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button onClick={onAddFolder}>
            <FolderPlus className="size-4" />
            Add folder
          </Button>
          <Button variant="secondary" onClick={onAddFiles}>
            <Upload className="size-4" />
            Add files
          </Button>
        </div>
      </div>
      <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-subtle uppercase">
        Recommended folders
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {RECOMMENDED_FOLDERS.map((folder) => {
          const Icon = ICONS[folder.id];
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => onRecommended(folder.id)}
              className="flex h-16 items-center gap-3 rounded-lg bg-elevated px-3 text-left shadow-border transition-[box-shadow,transform] duration-150 hover:shadow-border-hover active:scale-[0.96]"
            >
              <span className="flex size-9 items-center justify-center rounded-sm bg-surface text-fg">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-fg">{folder.label}</span>
                <span className="block truncate text-xs text-muted">{folder.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
