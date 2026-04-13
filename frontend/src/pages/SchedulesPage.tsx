import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowRight,
  Download,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
        await updateMutation.mutateAsync({
          id: editingSchedule.id,
          data,
        });
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t("schedules.title")}</h2>
          <p className="text-muted-foreground">
            {t("schedules.manage")} ({meta?.total ?? schedules.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          {isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t("schedules.addSchedule")}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={dayTypeFilter} onValueChange={handleDayTypeChange}>
          <SelectTrigger className="w-35">
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
          <SelectTrigger className="w-35">
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

      {/* Schedules Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <SortableTableHead<Schedule>
                    label={t("schedules.trainNumber")}
                    sortKey="trainNumber"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <TableHead>{t("schedules.route")}</TableHead>
                  <SortableTableHead<Schedule>
                    label={t("schedules.time")}
                    sortKey="departureTime"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="hidden sm:table-cell"
                  />
                  <SortableTableHead<Schedule>
                    label={t("schedules.dayType")}
                    sortKey="dayType"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTableHead<Schedule>
                    label={t("stations.status")}
                    sortKey="status"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  {isAdmin && (
                    <TableHead className="text-right w-25">
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
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <p className="font-medium font-mono">
                            {schedule.trainNumber}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-medium">
                                {schedule.departureStation?.code}
                              </p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {schedule.departureTime}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-sm font-medium">
                                {schedule.arrivalStation?.code}
                              </p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {schedule.arrivalTime}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {schedule.departureStation?.name} →{" "}
                            {schedule.arrivalStation?.name}
                          </p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="font-mono text-sm">
                            {schedule.departureTime} — {schedule.arrivalTime}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{schedule.dayType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              schedule.status === "ACTIVE"
                                ? "success"
                                : schedule.status === "DELAYED"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
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
          </CardContent>
        </Card>
      </motion.div>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule
                ? t("schedules.editSchedule")
                : t("schedules.addSchedule")}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule
                ? "Update the schedule details below."
                : "Fill in the details to create a new schedule."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trainNumber">{t("schedules.trainNumber")}</Label>
              <Input
                id="trainNumber"
                {...register("trainNumber")}
                placeholder="MRT-0600-NS"
              />
              {errors.trainNumber && (
                <p className="text-xs text-destructive">
                  {errors.trainNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("schedules.departureStation")}</Label>
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
                <Label>{t("schedules.arrivalStation")}</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureTime">
                  {t("schedules.departureTime")}
                </Label>
                <Input
                  id="departureTime"
                  {...register("departureTime")}
                  placeholder="06:00"
                />
                {errors.departureTime && (
                  <p className="text-xs text-destructive">
                    {errors.departureTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">
                  {t("schedules.arrivalTime")}
                </Label>
                <Input
                  id="arrivalTime"
                  {...register("arrivalTime")}
                  placeholder="06:30"
                />
                {errors.arrivalTime && (
                  <p className="text-xs text-destructive">
                    {errors.arrivalTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("schedules.dayType")}</Label>
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
                <Label>{t("stations.status")}</Label>
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

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isMutating}>
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
