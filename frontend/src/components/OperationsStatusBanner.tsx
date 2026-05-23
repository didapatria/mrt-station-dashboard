import type { OperationsStatus, SystemStatusData } from "@/types";

interface Props {
  status: OperationsStatus | undefined;
  data: SystemStatusData | undefined;
  isLoading?: boolean;
}

const CONFIG: Record<
  OperationsStatus,
  { label: string; sub: string; dot: string; glow: string; bg: string; border: string; text: string }
> = {
  ACTIVE: {
    label: "All Systems Operational",
    sub: "Network running normally",
    dot: "#22c55e",
    glow: "rgba(34,197,94,0.5)",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.2)",
    text: "#16a34a",
  },
  DEGRADED: {
    label: "Degraded Performance",
    sub: "Some services affected",
    dot: "#f59e0b",
    glow: "rgba(245,158,11,0.5)",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.2)",
    text: "#b45309",
  },
  INCIDENT: {
    label: "Service Disruption",
    sub: "Incident in progress",
    dot: "#ef4444",
    glow: "rgba(239,68,68,0.5)",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.2)",
    text: "#dc2626",
  },
};

export function OperationsStatusBanner({ status, data, isLoading }: Props) {
  if (isLoading || !status || !data) {
    return (
      <div className="h-10 rounded-lg bg-muted animate-pulse mb-4" />
    );
  }

  const cfg = CONFIG[status];

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-lg border mb-4 text-sm"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-60"
            style={{ background: cfg.dot }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{
              background: cfg.dot,
              boxShadow: `0 0 6px ${cfg.glow}`,
            }}
          />
        </span>
        <span className="font-semibold" style={{ color: cfg.text }}>
          {cfg.label}
        </span>
        <span className="text-muted-foreground text-xs hidden sm:inline">
          — {cfg.sub}
        </span>
      </div>

      <div className="flex items-center gap-4 font-mono text-[10.5px] text-muted-foreground tracking-wide">
        {data.maintenanceStations > 0 && (
          <span>
            <span className="text-[#f59e0b] font-semibold">
              {data.maintenanceStations}
            </span>{" "}
            maintenance
          </span>
        )}
        {data.cancelledSchedules > 0 && (
          <span>
            <span className="text-[#ef4444] font-semibold">
              {data.cancelledSchedules}
            </span>{" "}
            cancelled
          </span>
        )}
        {data.maintenanceStations === 0 && data.cancelledSchedules === 0 && (
          <span className="text-[#22c55e]">
            {data.totalStations}/{data.totalStations} stations active
          </span>
        )}
      </div>
    </div>
  );
}
