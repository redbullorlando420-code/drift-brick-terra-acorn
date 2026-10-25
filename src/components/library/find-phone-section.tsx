import { Search } from "lucide-react";
import { HubShell } from './hub-shared';

export function FindPhoneSection() {
  return <HubShell eyebrow="Device recovery" icon={<Search className="size-4"/>} title="Find your phone." copy="Open your device maker’s official locator. Realhub does not collect location data or keep a copy of your account credentials.">
    <section className="mt-6 grid gap-4 md:grid-cols-2"><a href="https://www.google.com/android/find/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Android</p><h2 className="mt-2 font-display text-2xl text-fg">Find My Device</h2><p className="mt-2 text-sm text-muted">Open Google’s official Android device locator in a secure new tab.</p></a><a href="https://www.icloud.com/find/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">iPhone</p><h2 className="mt-2 font-display text-2xl text-fg">Find My</h2><p className="mt-2 text-sm text-muted">Open Apple’s official device locator in a secure new tab.</p></a></section>
  </HubShell>;
}
