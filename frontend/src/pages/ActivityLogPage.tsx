import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Activity,
  MapPin,
  Clock,
  Users,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { usePageMeta } from "@/hooks/use-page-meta";

const ACTION_STYLES: Record<
  string,
  { bg: string; color: string; Icon: typeof Activity }
> = {
  CREATE: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", Icon: Plus },
  UPDATE: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", Icon: Pencil },
  DELETE: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", Icon: Trash2 },
};

const ENTITY_ICONS: Record<string, typeof Activity> = {
  Station: MapPin,
  Schedule: Clock,
  User: Users,
};

export default function ActivityLogPage() {
  usePageMeta({ title: "Activity Log", path: "/activity-log" });
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [entityFilter, setEntityFilter] = useState<string>(
    searchParams.get("entity") ?? "ALL",
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (entityFilter !== "ALL") params.set("entity", entityFilter);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [entityFilter, page, setSearchParams]);

  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
    setPage(1);
  };

  const { data, isLoading } = useActivityLogs({
    page,
    entity: entityFilter !== "ALL" ? entityFilter : undefined,
    limit: 20,
  });

  const logs = data?.logs ?? [];
  const meta = data?.meta ?? null;

  const formatRelative = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return null;
  };

  const formatAbsolute = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterExportRight = (
    <div className="ops-card p-[10px_14px] flex flex-row gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const csv = [
            "Time,User,Action,Entity,Details",
            ...logs
              .map(
                (l) =>
                  `${l.createdAt},${l.user.name},${l.action},${l.entity},"${l.details || ""}"`,
              )
              .join("\n"),
          ].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "activity-log.csv";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Activity log exported");
        }}
      >
        <Download className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Select value={entityFilter} onValueChange={handleEntityFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("activity.allTypes")}</SelectItem>
          <SelectItem value="Station">Stations</SelectItem>
          <SelectItem value="Schedule">Schedules</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="ACTIVITY LOG"
        subtitle={`Audit Trail · System Events · ${meta?.total ?? logs.length} entries`}
        right={filterExportRight}
      />

      {/* Log List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="ops-card">
          <div className="ops-accent-line" />

          {/* Card section header */}
          <div className="ops-card-header flex items-baseline gap-2.5">
            <span className="ops-card-title">EVENTS</span>
            <span className="ops-card-subtitle mt-0">Most Recent First</span>
          </div>

          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="py-3.5 px-5 pl-6 border-b border-border flex items-start gap-3"
              >
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-3 w-16 shrink-0" />
              </div>
            ))
          ) : (
            /* Timeline wrapper */
            <div className="relative">
              {/* Vertical timeline connector */}
              <div className="absolute left-10.25 top-0 bottom-0 w-px pointer-events-none bg-[linear-gradient(180deg,rgba(59,130,246,0.2)_0%,rgba(59,130,246,0)_100%)]" />

              {logs.map((log, idx) => {
                const actionStyle = ACTION_STYLES[
                  log.action as keyof typeof ACTION_STYLES
                ] ?? {
                  bg: "rgba(100,116,139,0.1)",
                  color: "var(--color-muted-foreground)",
                  Icon: Activity,
                };
                const { bg, color, Icon: ActionIcon } = actionStyle;
                const EntityIcon =
                  ENTITY_ICONS[log.entity as keyof typeof ENTITY_ICONS] ??
                  Activity;

                const relative = formatRelative(log.createdAt);
                const absolute = formatAbsolute(log.createdAt);

                return (
                  <div
                    key={log.id}
                    className="py-3.5 px-5 pl-6 flex items-start gap-3"
                    style={{
                      borderBottom:
                        idx < logs.length - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                    }}
                  >
                    {/* Action icon circle */}
                    <div
                      className="w-9 h-9 rounded-full border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0 relative z-1"
                      style={{ background: bg }}
                    >
                      <ActionIcon className="w-3.5 h-3.5" style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium">
                          {log.action.charAt(0) +
                            log.action.slice(1).toLowerCase()}
                          d a
                        </span>
                        <span className="ops-entity-chip">
                          <EntityIcon className="w-2.25 h-2.25" />
                          {log.entity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.75 flex-wrap">
                        <span className="ops-mono-label text-[11px] normal-case tracking-[0.04em]">
                          {log.user.name}
                        </span>
                        {log.details && (
                          <span className="text-[11.5px] text-muted-foreground truncate max-w-70">
                            — {log.details}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex flex-col items-end gap-0.5 shrink-0 mt-0.5">
                      <span className="ops-mono-xs opacity-70 whitespace-nowrap">
                        {relative ?? absolute}
                      </span>
                      {relative && (
                        <span className="ops-mono-xs text-[9px] opacity-35 whitespace-nowrap">
                          {absolute}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {logs.length === 0 && !isLoading && (
        <EmptyState
          icon={Activity}
          title={t("activity.noActivity")}
          description={t("activity.noActivityDesc")}
        />
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
