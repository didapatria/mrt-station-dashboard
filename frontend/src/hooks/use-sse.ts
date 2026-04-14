import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ActivityEvent {
  action: string;
  entity: string;
  details: string;
  user: { name: string };
}

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();

  const handleEvent = useCallback(
    (data: ActivityEvent) => {
      toast.info(`${data.user.name} ${data.action.toLowerCase()}d a ${data.entity}`, {
        description: data.details,
      });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
    [queryClient]
  );

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "/api";
    const eventSource = new EventSource(`${baseUrl}/events`);

    eventSource.addEventListener("activity", (e) => {
      try {
        handleEvent(JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [handleEvent]);
}
