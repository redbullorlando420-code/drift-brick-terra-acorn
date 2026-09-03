import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatAgo } from "@/lib/utils";
import { useLibrary } from "@/lib/videos/store";

export function NoticeBell() {
  const notices = useLibrary((s) => s.notices);
  const unread = notices.filter((n) => !n.read).length;
  const markNoticesRead = useLibrary((s) => s.markNoticesRead);
  const notifyPush = useLibrary((s) => s.notifyPush);
  const setNotifyPush = useLibrary((s) => s.setNotifyPush);
  const openVideo = useLibrary((s) => s.openVideo);

  const enablePush = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifyPush(perm === "granted");
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) markNoticesRead();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-danger" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-medium text-fg">Notifications</p>
          <button
            type="button"
            onClick={() => (notifyPush ? setNotifyPush(false) : void enablePush())}
            className="flex items-center gap-1 text-xs text-muted hover:text-fg"
          >
            {notifyPush ? <Bell className="size-3.5" /> : <BellOff className="size-3.5" />}
            {notifyPush ? "Alerts on" : "Enable alerts"}
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notices.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Follow YouTube or Twitch to get live and upload alerts.
            </p>
          ) : (
            notices.slice(0, 20).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => n.videoId && openVideo(n.videoId)}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-elevated",
                  !n.read && "bg-elevated/50",
                )}
              >
                <span className="text-sm text-fg">{n.title}</span>
                <span className="text-xs text-muted">{n.body}</span>
                <span className="font-mono text-xs text-subtle">{formatAgo(n.at)}</span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
