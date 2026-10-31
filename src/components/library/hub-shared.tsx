import { type ReactNode } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from "lucide-react";
import { readHubStore, type HubStore, type LocalItem } from '@/lib/hub-storage';
export type { HubStore, LocalItem } from '@/lib/hub-storage';

export const HUB_KEY = "reelcase.hub.v1";

export function readHub(): HubStore {
  const samples: LocalItem[] = [
    {
      name: "Calibration cube.stl",
      path: "Realhub samples/Calibration cube.stl",
      size: 2618,
      addedAt: 1,
      sampleSrc: "/samples/prints/calibration-cube.stl",
    },
    { name: "Cable clip.3mf", path: "Realhub samples/Cable clip.3mf", size: 94100, addedAt: 2 },
    {
      name: "OpenSCAD phone stand.obj",
      path: "Open-source examples/OpenSCAD phone stand.obj",
      size: 318,
      addedAt: 4,
      sampleSrc: "/samples/prints/phone-stand.obj",
    },
    {
      name: "Gridfinity bin.3mf",
      path: "Open-source examples/Gridfinity bin.3mf",
      size: 784200,
      addedAt: 5,
    },
    {
      name: "Benchy calibration.obj",
      path: "Open-source examples/Benchy calibration.obj",
      size: 236,
      addedAt: 6,
      sampleSrc: "/samples/prints/benchy.obj",
    },
    {
      name: "Parametric drawer label.stl",
      path: "Open-source examples/Parametric drawer label.stl",
      size: 229100,
      addedAt: 7,
    },
    {
      name: "Tool tray.gcode",
      path: "Realhub samples/Tool tray.gcode",
      size: 1248000,
      addedAt: 3,
    },
  ];
  try {
    const raw = localStorage.getItem(HUB_KEY);
    if (!raw) return { prints: samples, games: [] };
    return readHubStore(JSON.parse(raw), { prints: samples, games: [] });
  } catch {
    return { prints: samples, games: [] };
  }
}

export function writeHub(next: HubStore) {
  localStorage.setItem(HUB_KEY, JSON.stringify(next));
}

export function bytes(value: number) {
  if (value <= 0) return "0 B";
  return value < 1024 * 1024
    ? `${Math.max(1, Math.round(value / 1024))} KB`
    : `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function downloadCsv(rows: Array<Array<string | number | boolean>>, filename: string) {
  const quote = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;
  const body = rows.map((row) => row.map(quote).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function HubShell({
  eyebrow,
  icon,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8">
      <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase">
        {icon} {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">{copy}</p>
      {children}
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-elevated px-4 py-4 shadow-border">
      <p className="font-mono text-2xl tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

export function ServiceLink({ name, href, copy }: { name: string; href: string; copy: string }) {
  return (
    <a
      href={href}
      className="rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
    >
      <p className="font-display text-2xl text-fg">{name}</p>
      <p className="mt-1 text-sm text-muted">{copy}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
        Open <ExternalLink className="size-4" />
      </span>
    </a>
  );
}

export function InfoCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <Card className="gap-0 bg-elevated"><CardContent>
      <span className="text-accent">{icon}</span>
      <h2 className="mt-3 font-display text-2xl text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
    </CardContent></Card>
  );
}
