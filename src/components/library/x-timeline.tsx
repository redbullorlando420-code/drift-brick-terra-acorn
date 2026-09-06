import { useEffect, useRef, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type XWidgets = { widgets: { load: (element: HTMLElement) => Promise<unknown> | void } };
let widgetScript: Promise<XWidgets> | undefined;
function loadWidgets() {
  return widgetScript ??= new Promise<XWidgets>((resolve, reject) => {
    const existing = (window as Window & { twttr?: XWidgets }).twttr;
    if (existing?.widgets) { resolve(existing); return; }
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    const timeout = window.setTimeout(() => { script.remove(); reject(new Error("X did not respond")); }, 12000);
    script.onload = () => { clearTimeout(timeout); const api = (window as Window & { twttr?: XWidgets }).twttr; api?.widgets ? resolve(api) : reject(new Error("X unavailable")); };
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error("X unavailable")); };
    document.head.append(script);
  }).catch((error) => { widgetScript = undefined; throw error; });
}

export function XTimeline({ account }: { account: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("Loading public posts…");
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let cancelled = false;
    setStatus("Loading public posts…");
    element.replaceChildren();
    const link = document.createElement("a");
    link.className = "twitter-timeline";
    link.href = `https://twitter.com/${account}`;
    link.dataset.height = "640";
    link.dataset.theme = document.documentElement.dataset.theme === "day" ? "light" : "dark";
    link.dataset.dnt = "true";
    link.textContent = `Public posts by @${account}`;
    element.append(link);
    const timeout = window.setTimeout(() => {
      if (!cancelled) setStatus("X hasn’t supplied a timeline. Open the profile to view posts, or retry.");
    }, 15000);
    const observer = new MutationObserver(() => {
      const frame = element.querySelector("iframe");
      if (frame) frame.addEventListener("load", () => { if (!cancelled) { clearTimeout(timeout); setStatus("Public timeline supplied by X. If posts are unavailable, open the profile."); } }, { once: true });
    });
    observer.observe(element, { childList: true, subtree: true });
    void loadWidgets().then((api) => { if (!cancelled) return api.widgets.load(element); }).catch(() => {
      if (!cancelled) { clearTimeout(timeout); setStatus("X is unavailable here. Your saved accounts are still ready to open."); }
    });
    return () => { cancelled = true; clearTimeout(timeout); observer.disconnect(); element.replaceChildren(); };
  }, [account, attempt]);
  return <section className="mt-5 rounded-lg border border-border bg-elevated p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">@{account}</h2><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setAttempt((value) => value + 1)}><RefreshCw className="size-4" />Retry</Button><a className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg" href={`https://x.com/${account}`} target="_blank" rel="noopener noreferrer">Open profile<ExternalLink className="size-4" /></a></div></div>
    <p role="status" className="my-4 text-sm text-muted">{status}</p><div ref={container} className="min-h-24 overflow-hidden" />
  </section>;
}
