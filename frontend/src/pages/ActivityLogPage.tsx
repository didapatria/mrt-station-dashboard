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
    <div
      className="ops-card"
      style={{
        padding: "10px 14px",
        display: "flex",
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
      }}
    >
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
          <div
            className="ops-card-header"
            style={{ display: "flex", alignItems: "baseline", gap: 10 }}
          >
            <span className="ops-card-title">EVENTS</span>
            <span className="ops-card-subtitle" style={{ marginTop: 0 }}>
              Most Recent First
            </span>
          </div>

          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 20px 14px 24px",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-3 w-16 shrink-0" />
              </div>
            ))
          ) : (
            /* Timeline wrapper */
            <div style={{ position: "relative" }}>
              {/* Vertical timeline connector */}
              <div
                style={{
                  position: "absolute",
                  left: 41,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background:
                    "linear-gradient(180deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 100%)",
                  pointerEvents: "none",
                }}
              />

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
                    style={{
                      padding: "14px 20px 14px 24px",
                      borderBottom:
                        idx < logs.length - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    {/* Action icon circle */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: bg,
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <ActionIcon style={{ width: 14, height: 14, color }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="text-[13px] font-medium">
                          {log.action.charAt(0) +
                            log.action.slice(1).toLowerCase()}
                          d a
                        </span>
                        <span className="ops-entity-chip">
                          <EntityIcon style={{ width: 9, height: 9 }} />
                          {log.entity}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 3,
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="ops-mono-label" style={{ fontSize: 11, textTransform: "none", letterSpacing: "0.04em" }}>
                          {log.user.name}
                        </span>
                        {log.details && (
                          <span
                            className="text-[11.5px] text-muted-foreground truncate"
                            style={{ maxWidth: 280 }}
                          >
                            — {log.details}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 2,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <span className="ops-mono-xs" style={{ opacity: 0.7, whiteSpace: "nowrap" }}>
                        {relative ?? absolute}
                      </span>
                      {relative && (
                        <span className="ops-mono-xs" style={{ fontSize: 9, opacity: 0.35, whiteSpace: "nowrap" }}>
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
