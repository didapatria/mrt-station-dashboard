import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Download, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/hooks/use-schedules";
import { useStations } from "@/hooks/use-stations";
import { SortableTableHead } from "@/components/SortableTableHead";
import { useSortable } from "@/hooks/use-sortable";
import { useDebounce } from "@/hooks/use-debounce";
import { dashboardService } from "@/services/dashboard.service";
import { useRole } from "@/hooks/use-role";
import type { Schedule } from "@/types";

const scheduleSchema = z.object({
  trainNumber: z.string().min(1, "Train number is required"),
  departureStationId: z.string().min(1, "Select departure station"),
  arrivalStationId: z.string().min(1, "Select arrival station"),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:mm"),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:mm"),
  dayType: z.enum(["WEEKDAY", "WEEKEND", "HOLIDAY"]),
  status: z.enum(["ACTIVE", "CANCELLED", "DELAYED"]),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const STATUS_LED: Record<
  string,
  { color: string; glow: string; label: string }
> = {
  ACTIVE: {
    color: "#22c55e",
    glow: "rgba(34,197,94,0.4)",
    label: "ACTIVE",
  },
  DELAYED: {
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.4)",
    label: "DELAYED",
  },
  CANCELLED: {
    color: "#ef4444",
    glow: "rgba(239,68,68,0.4)",
    label: "CANCELLED",
  },
};

function StatusLED({ status }: { status: string }) {
  const cfg = STATUS_LED[status] ?? STATUS_LED["ACTIVE"];
  return (
    <>
      <style>{"@keyframes pulse-led { 0%,100%{opacity:1} 50%{opacity:0.5} }"}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: cfg.color,
            boxShadow: `0 0 6px ${cfg.glow}`,
            animation: status === "ACTIVE" ? "pulse-led 2s ease-in-out infinite" : undefined,
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: cfg.color,
          }}
        >
          {cfg.label}
        </span>
      </div>
    </>
  );
}

export default function SchedulesPage() {
  const { t } = useTranslation();
  const { isAdmin } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [dayTypeFilter, setDayTypeFilter] = useState<string>(
    searchParams.get("dayType") ?? "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") ?? "ALL",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (dayTypeFilter !== "ALL") params.set("dayType", dayTypeFilter);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, dayTypeFilter, statusFilter, page, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDayTypeChange = (value: string) => {
    setDayTypeFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const { data, isLoading } = useSchedules({
    page,
    search: debouncedSearch || undefined,
    dayType: dayTypeFilter !== "ALL" ? dayTypeFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    limit: 15,
  });

  const schedules = data?.schedules ?? [];
  const meta = data?.meta ?? null;
  const {
    sorted: sortedSchedules,
    sortConfig,
    requestSort,
  } = useSortable<Schedule>(schedules, "trainNumber");

  const { data: stationsData } = useStations({ limit: 100 });
  const stations = stationsData?.stations ?? [];

  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { dayType: "WEEKDAY", status: "ACTIVE" },
  });

  const openCreate = () => {
    setEditingSchedule(null);
    reset({
      trainNumber: "",
      departureStationId: "",
      arrivalStationId: "",
      departureTime: "",
      arrivalTime: "",
      dayType: "WEEKDAY",
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const openEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    reset({
      trainNumber: schedule.trainNumber,
      departureStationId: schedule.departureStationId,
      arrivalStationId: schedule.arrivalStationId,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      dayType: schedule.dayType,
      status: schedule.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({ id: editingSchedule.id, data });
        toast.success("Schedule updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Schedule created successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save schedule");
    }
  };

  const handleExport = async () => {
    try {
      await dashboardService.exportSchedulesCSV(
        dayTypeFilter !== "ALL" ? dayTypeFilter : undefined,
      );
      toast.success("Schedules exported to CSV");
    } catch {
      toast.error("Failed to export");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirm(null);
      toast.success("Schedule deleted successfully");
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  const totalCount = meta?.total ?? schedules.length;

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 36,
              lineHeight: 1,
              letterSpacing: "0.04em",
              margin: 0,
            }}
          >
            {t("schedules.title")}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "#60a5fa",
                padding: "2px 8px",
                borderRadius: 4,
                letterSpacing: "0.08em",
                marginLeft: 10,
                verticalAlign: "middle",
              }}
            >
              {totalCount} entries
            </span>
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-muted-foreground)",
              marginTop: 6,
            }}
          >
            N–S LINE · SCHEDULE REGISTRY
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            variant="outline"
            onClick={handleExport}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          {isAdmin && (
            <Button
              onClick={openCreate}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("schedules.addSchedule")}
            </Button>
          )}
        </div>
      </div>

      {/* Accent line */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0.0) 60%)",
          marginTop: 12,
          marginBottom: 28,
        }}
      />

      {/* Filter Bar */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--color-muted-foreground)" }}
          />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            style={{ fontFamily: "'Sora', sans-serif", fontSize: 13 }}
          />
        </div>
        <Select value={dayTypeFilter} onValueChange={handleDayTypeChange}>
          <SelectTrigger
            className="w-35"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
          >
            <SelectValue placeholder="Day Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Days</SelectItem>
            <SelectItem value="WEEKDAY">Weekday</SelectItem>
            <SelectItem value="WEEKEND">Weekend</SelectItem>
            <SelectItem value="HOLIDAY">Holiday</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger
            className="w-35"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.allStatus")}</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="DELAYED">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Schedules View */}
      <Tabs defaultValue="table" className="mb-4">
        <TabsList>
          <TabsTrigger
            value="table"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
            }}
          >
            TABLE
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
            }}
          >
            TIMELINE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Card top accent */}
            <div
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0) 100%)",
              }}
            />
            <div
              style={{
                padding: "18px 24px 14px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20,
                  letterSpacing: "0.05em",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                TIMELINE VIEW
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-muted-foreground)",
                  marginTop: 4,
                }}
              >
                SCHEDULE CALENDAR
              </p>
            </div>
            <ScheduleCalendar schedules={sortedSchedules} />
          </div>
        </TabsContent>

        <TabsContent value="table">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Card top accent */}
              <div
                style={{
                  height: 2,
                  background:
                    "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0) 100%)",
                }}
              />
              <div
                style={{
                  padding: "18px 24px 14px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 20,
                    letterSpacing: "0.05em",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  SCHEDULE REGISTRY
                </p>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-muted-foreground)",
                    marginTop: 4,
                  }}
                >
                  {totalCount} RECORDS · NORTH–SOUTH LINE
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <SortableTableHead<Schedule>
                        label={t("schedules.trainNumber")}
                        sortKey="trainNumber"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                        }}
                      />
                      <TableHead
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        {t("schedules.route")}
                      </TableHead>
                      <SortableTableHead<Schedule>
                        label={t("schedules.time")}
                        sortKey="departureTime"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        className="hidden sm:table-cell"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                        }}
                      />
                      <SortableTableHead<Schedule>
                        label={t("schedules.dayType")}
                        sortKey="dayType"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                        }}
                      />
                      <SortableTableHead<Schedule>
                        label={t("stations.status")}
                        sortKey="status"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                        }}
                      />
                      {isAdmin && (
                        <TableHead
                          className="text-right w-25"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 9.5,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--color-muted-foreground)",
                          }}
                        >
                          {t("common.actions")}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-40" />
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Skeleton className="h-4 w-28" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-16 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-16 rounded-full" />
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <Skeleton className="h-8 w-16 ml-auto" />
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      : sortedSchedules.map((schedule) => (
                          <TableRow
                            key={schedule.id}
                            style={{ transition: "background 0.12s ease" }}
                          >
                            <TableCell
                              style={{
                                padding: "12px 16px",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 12,
                                fontWeight: 600,
                                background: "rgba(59,130,246,0.05)",
                              }}
                            >
                              {schedule.trainNumber}
                            </TableCell>
                            <TableCell>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "'Sora', sans-serif",
                                    fontSize: 13,
                                  }}
                                >
                                  {schedule.departureStation?.code}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 11,
                                    color: "var(--color-muted-foreground)",
                                  }}
                                >
                                  →
                                </span>
                                <span
                                  style={{
                                    fontFamily: "'Sora', sans-serif",
                                    fontSize: 13,
                                  }}
                                >
                                  {schedule.arrivalStation?.code}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontFamily: "'Sora', sans-serif",
                                  fontSize: 11,
                                  color: "var(--color-muted-foreground)",
                                  marginTop: 2,
                                }}
                              >
                                {schedule.departureStation?.name}
                                <span
                                  style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    margin: "0 4px",
                                    color: "var(--color-muted-foreground)",
                                  }}
                                >
                                  →
                                </span>
                                {schedule.arrivalStation?.name}
                              </p>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 11,
                                }}
                              >
                                {schedule.departureTime}
                                {" — "}
                                {schedule.arrivalTime}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 10,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                  color: "var(--color-muted-foreground)",
                                }}
                              >
                                {schedule.dayType}
                              </span>
                            </TableCell>
                            <TableCell>
                              <StatusLED status={schedule.status} />
                            </TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 4,
                                  }}
                                >
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => openEdit(schedule)}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t("schedules.editSchedule")}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() =>
                                            setDeleteConfirm(schedule.id)
                                          }
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t("schedules.deleteSchedule")}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {sortedSchedules.length === 0 && !isLoading && (
        <EmptyState
          icon={Clock}
          title={
            debouncedSearch ? t("common.noResults") : t("schedules.noSchedules")
          }
          description={
            debouncedSearch
              ? t("schedules.noSchedulesSearch", { query: debouncedSearch })
              : t("schedules.getStarted")
          }
          action={
            isAdmin && !debouncedSearch
              ? { label: t("schedules.addSchedule"), onClick: openCreate }
              : undefined
          }
        />
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {editingSchedule
                ? t("schedules.editSchedule")
                : t("schedules.addSchedule")}
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {editingSchedule
                ? "UPDATE THE SCHEDULE DETAILS BELOW."
                : "FILL IN THE DETAILS TO CREATE A NEW SCHEDULE."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="trainNumber"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {t("schedules.trainNumber")}
              </Label>
              <Input
                id="trainNumber"
                {...register("trainNumber")}
                placeholder="MRT-0600-NS"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
              />
              {errors.trainNumber && (
                <p className="text-xs text-destructive">
                  {errors.trainNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("schedules.departureStation")}
                </Label>
                <Select
                  defaultValue={editingSchedule?.departureStationId}
                  onValueChange={(val) => setValue("departureStationId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departureStationId && (
                  <p className="text-xs text-destructive">
                    {errors.departureStationId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("schedules.arrivalStation")}
                </Label>
                <Select
                  defaultValue={editingSchedule?.arrivalStationId}
                  onValueChange={(val) => setValue("arrivalStationId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.arrivalStationId && (
                  <p className="text-xs text-destructive">
                    {errors.arrivalStationId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="departureTime"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("schedules.departureTime")}
                </Label>
                <div className="relative">
                  <Input
                    id="departureTime"
                    type="time"
                    className="w-full pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                    {...register("departureTime")}
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.departureTime && (
                  <p className="text-xs text-destructive">
                    {errors.departureTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="arrivalTime"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("schedules.arrivalTime")}
                </Label>
                <div className="relative">
                  <Input
                    id="arrivalTime"
                    type="time"
                    className="w-full pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                    {...register("arrivalTime")}
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.arrivalTime && (
                  <p className="text-xs text-destructive">
                    {errors.arrivalTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("schedules.dayType")}
                </Label>
                <Select
                  defaultValue={editingSchedule?.dayType || "WEEKDAY"}
                  onValueChange={(val) =>
                    setValue(
                      "dayType",
                      val as "WEEKDAY" | "WEEKEND" | "HOLIDAY",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKDAY">Weekday</SelectItem>
                    <SelectItem value="WEEKEND">Weekend</SelectItem>
                    <SelectItem value="HOLIDAY">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("stations.status")}
                </Label>
                <Select
                  defaultValue={editingSchedule?.status || "ACTIVE"}
                  onValueChange={(val) =>
                    setValue(
                      "status",
                      val as "ACTIVE" | "CANCELLED" | "DELAYED",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="DELAYED">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                paddingTop: 8,
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isMutating}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                }}
              >
                {isMutating
                  ? t("common.loading")
                  : editingSchedule
                    ? t("common.update")
                    : t("common.create")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("schedules.deleteSchedule")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("schedules.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? t("common.loading")
                : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
