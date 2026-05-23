import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useStations } from "@/hooks/use-stations";
import { useSystemStatus } from "@/hooks/use-system-status";
import { useRealtimeNotifications } from "@/hooks/use-sse";
import { useActivityFeedStore, type FeedEntry } from "@/store/activity-feed.store";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Skeleton } from "@/components/ui/skeleton";
import type { Station, SystemStatusData, OperationsStatus } from "@/types";

// ── Station tile ──────────────────────────────────────────────────────────────

const STATUS_DOT: Record<Station["status"], { color: string; glow?: string }> = {
  ACTIVE: { color: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  MAINTENANCE: { color: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  INACTIVE: { color: "#6b7280" },
};

function StationTile({ station }: { station: Station }) {
  const dot = STATUS_DOT[station.status];
  return (
    <div className="ops-card relative p-3 flex flex-col gap-1.5 cursor-default select-none hover:bg-muted/30 transition-colors">
      <div className="ops-accent-line" />
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: dot.color,
            boxShadow: dot.glow ? `0 0 6px ${dot.glow}` : undefined,
          }}
        />
        <span className="font-mono text-[10px] font-bold text-primary tracking-[-0.02em]">
          {station.code}
        </span>
      </div>
      <p className="font-['Sora',sans-serif] text-[11.5px] leading-tight line-clamp-2">
        {station.name}
      </p>
      <span
        className="font-mono text-[9px] tracking-wide mt-auto"
        style={{ color: dot.color }}
      >
        {station.status}
      </span>
    </div>
  );
}

// ── System status panel ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OperationsStatus,
  { label: string; dot: string; glow: string }
> = {
  ACTIVE: { label: "ALL SYSTEMS GO", dot: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  DEGRADED: { label: "DEGRADED", dot: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  INCIDENT: { label: "INCIDENT", dot: "#ef4444", glow: "rgba(239,68,68,0.5)" },
};

function SystemStatusPanel({
  data,
  isLoading,
}: {
  data: SystemStatusData | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const cfg = STATUS_CONFIG[data.status];
  const operational = data.totalStations - data.maintenanceStations;

  const statRows = [
    {
      label: "STATIONS",
      value: `${operational}/${data.totalStations}`,
      sub: "operational",
      color: undefined as string | undefined,
    },
    {
      label: "MAINTENANCE",
      value: String(data.maintenanceStations),
      sub: undefined,
      color: data.maintenanceStations > 0 ? "#f59e0b" : undefined,
    },
    {
      label: "CANCELLED",
      value: String(data.cancelledSchedules),
      sub: undefined,
      color: data.cancelledSchedules > 0 ? "#ef4444" : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">
          System Status
        </div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="relative flex h-3 w-3 shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-50"
              style={{ background: cfg.dot }}
            />
            <span
              className="relative inline-flex h-3 w-3 rounded-full"
              style={{ background: cfg.dot, boxShadow: `0 0 8px ${cfg.glow}` }}
            />
          </span>
          <span
            className="font-display text-[20px] leading-none tracking-wide"
            style={{ color: cfg.dot }}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {statRows.map(({ label, value, sub, color }) => (
          <div key={label} className="border border-border rounded-md px-3 py-2">
            <div className="font-mono text-[8.5px] tracking-[0.15em] text-muted-foreground mb-0.5">
              {label}
            </div>
            <div
              className="font-display text-[26px] leading-none"
              style={color ? { color } : undefined}
            >
              {value}
            </div>
            {sub && (
              <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                {sub}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Activity feed ─────────────────────────────────────────────────────────────

function timeAgo(d: Date, now: number): string {
  const s = Math.floor((now - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function ActivityFeed({ events }: { events: FeedEntry[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">
        Activity Feed
      </div>
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Waiting for activity…
        </p>
      ) : (
        <div className="flex flex-col overflow-y-auto">
          {events.map((e) => (
            <div
              key={e.id}
              className="border-b border-border/50 py-2.5 last:border-0"
            >
              <p className="text-[12.5px] font-medium leading-snug">{e.message}</p>
              {e.detail && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {e.detail}
                </p>
              )}
              <p className="font-mono text-[10px] text-muted-foreground mt-1">
                {timeAgo(e.time, now)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  usePageMeta({ title: "Command Center", path: "/command" });
  const { t } = useTranslation();

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const { data: stationsData, isLoading: stationsLoading } = useStations({ limit: 50 });
  const { data: systemStatus, isLoading: systemStatusLoading } = useSystemStatus();
  const { status: sseStatus } = useRealtimeNotifications();
  const feedEvents = useActivityFeedStore((s) => s.events);

  const stations = stationsData?.stations ?? [];

  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const sseDotStyle =
    sseStatus === "connected"
      ? { background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.8)" }
      : sseStatus === "reconnecting"
        ? { background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }
        : { background: "#6b7280" };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-6 py-4 border-b border-border mb-5"
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">
            Operations Terminal · N–S Line · Jakarta MRT
          </div>
          <h1 className="font-display text-[34px] leading-none tracking-[0.04em]">
            {t("nav.commandCenter").toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-mono text-[13px] text-muted-foreground tabular-nums">
            {timeStr}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={sseDotStyle}
            />
            <span className="font-mono text-[10px] text-muted-foreground tracking-[0.12em]">
              {sseStatus === "connected"
                ? "LIVE"
                : sseStatus === "reconnecting"
                  ? "RECONNECTING"
                  : "OFFLINE"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Three-panel body ────────────────────────────────────── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "220px 1fr 260px" }}
      >
        {/* Left: System status */}
        <div>
          <SystemStatusPanel data={systemStatus} isLoading={systemStatusLoading} />
        </div>

        {/* Center: Station grid */}
        <div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-3">
            Station Grid · {stations.length} stations
          </div>
          {stationsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 13 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            >
              {stations.map((station) => (
                <motion.div
                  key={station.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
                  }}
                >
                  <StationTile station={station} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: Activity feed */}
        <div aria-live="polite">
          <ActivityFeed events={feedEvents} />
        </div>
      </div>
    </div>
  );
}
