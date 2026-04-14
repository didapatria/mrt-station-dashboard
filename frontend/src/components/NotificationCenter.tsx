import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: string;
  message: string;
  detail?: string;
  time: Date;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const addNotification = useCallback((msg: string, detail?: string) => {
    const n: Notification = { id: crypto.randomUUID(), message: msg, detail, time: new Date() };
    setNotifications((prev) => [n, ...prev].slice(0, 20));
    setUnread((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "/api";
    const es = new EventSource(`${baseUrl}/events`);
    es.addEventListener("activity", (e) => {
      try {
        const data = JSON.parse(e.data);
        addNotification(`${data.user.name} ${data.action.toLowerCase()}d a ${data.entity}`, data.details);
      } catch { /* ignore */ }
    });
    es.onerror = () => es.close();
    return () => es.close();
  }, [addNotification]);

  const markRead = () => setUnread(0);

  const timeAgo = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) markRead(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 font-semibold text-sm">Notifications</div>
        <Separator />
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="px-3 py-2.5 border-b last:border-0 hover:bg-muted/50">
                <p className="text-sm font-medium">{n.message}</p>
                {n.detail && <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.detail}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.time)}</p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
