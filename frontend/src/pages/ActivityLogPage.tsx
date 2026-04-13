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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useActivityLogs } from "@/hooks/use-activity-logs";

const actionIcons = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

const actionColors = {
  CREATE:
    "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950",
  UPDATE: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950",
  DELETE: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950",
};

const entityIcons = {
  Station: MapPin,
  Schedule: Clock,
  User: Users,
};

export default function ActivityLogPage() {
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

  useEffect(() => {
    setPage(1);
  }, [entityFilter]);

  const { data, isLoading } = useActivityLogs({
    page,
    entity: entityFilter !== "ALL" ? entityFilter : undefined,
    limit: 20,
  });

  const logs = data?.logs ?? [];
  const meta = data?.meta ?? null;

  const formatTime = (dateStr: string) => {
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
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("activity.title")}
          </h2>
          <p className="text-muted-foreground">{t("activity.subtitle")}</p>
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          : logs.map((log) => {
              const ActionIcon =
                actionIcons[log.action as keyof typeof actionIcons] ?? Activity;
              const actionColor =
                actionColors[log.action as keyof typeof actionColors] ??
                "text-muted-foreground bg-muted";
              const EntityIcon =
                entityIcons[log.entity as keyof typeof entityIcons] ?? Activity;

              return (
                <Card
                  key={log.id}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${actionColor}`}
                      >
                        <ActionIcon className="h-4.5 w-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                              {log.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold">
                            {log.user.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {log.action.toLowerCase()}d a
                          </span>
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <EntityIcon className="h-3 w-3" />
                            {log.entity}
                          </Badge>
                        </div>
                        {log.details && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {log.details}
                          </p>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatTime(log.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
