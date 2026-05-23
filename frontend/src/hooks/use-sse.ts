import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import type { SseStatus } from "@/types";

export type { SseStatus };

interface ActivityEvent {
  action: string;
  entity: string;
  details: string;
  user: { name: string };
  simulated?: boolean;
}

export interface RealtimeResult {
  status: SseStatus;
  lastActivityAt: Date | null;
}

export function useRealtimeNotifications(): RealtimeResult {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const [status, setStatus] = useState<SseStatus>("disconnected");
  const [lastActivityAt, setLastActivityAt] = useState<Date | null>(null);

  // Mutable ref avoids stale-closure issues across reconnect attempts
  const stateRef = useRef({
    active: false,
    attempts: 0,
    es: null as EventSource | null,
    timer: null as ReturnType<typeof setTimeout> | null,
  });

  const handleActivity = useCallback(
    (data: ActivityEvent) => {
      if (!data.simulated) {
        toast.info(
          `${data.user.name} ${data.action.toLowerCase()}d a ${data.entity}`,
          { description: data.details },
        );
      }
      setLastActivityAt(new Date());
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!token) {
      setStatus("disconnected");
      return;
    }

    const state = stateRef.current;
    state.active = true;
    state.attempts = 0;

    function openConnection() {
      if (!state.active) return;
      state.es?.close();
      state.es = null;

      const baseUrl = import.meta.env.VITE_API_URL || "/api";
      const es = new EventSource(`${baseUrl}/events?token=${token}`);
      state.es = es;

      es.onopen = () => {
        if (!state.active) return;
        setStatus("connected");
        state.attempts = 0;
      };

      es.addEventListener("activity", (e) => {
        if (!state.active) return;
        try {
          handleActivity(JSON.parse(e.data) as ActivityEvent);
        } catch {
          /* ignore malformed payloads */
        }
      });

      es.addEventListener("station.updated", () => {
        if (!state.active) return;
        queryClient.invalidateQueries({ queryKey: ["stations"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["system-status"] });
        setLastActivityAt(new Date());
      });

      es.addEventListener("schedule.updated", () => {
        if (!state.active) return;
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["system-status"] });
        setLastActivityAt(new Date());
      });

      // Heartbeat — confirms stream is alive; no action needed
      es.addEventListener("ping", () => {
        /* keep-alive */
      });

      es.onerror = () => {
        if (!state.active) return;
        es.close();
        state.es = null;
        setStatus("reconnecting");

        // Exponential backoff: 1s, 2s, 4s, 8s … capped at 30s
        const delay = Math.min(1_000 * 2 ** state.attempts, 30_000);
        state.attempts += 1;
        state.timer = setTimeout(() => {
          if (state.active) openConnection();
        }, delay);
      };
    }

    openConnection();

    return () => {
      state.active = false;
      state.es?.close();
      state.es = null;
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      setStatus("disconnected");
    };
  }, [token, handleActivity, queryClient]);

  return { status, lastActivityAt };
}
