import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  MapPin,
  TrainFront,
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
  useStations,
  useCreateStation,
  useUpdateStation,
  useDeleteStation,
} from "@/hooks/use-stations";
import { SortableTableHead } from "@/components/SortableTableHead";
import { useSortable } from "@/hooks/use-sortable";
import { useDebounce } from "@/hooks/use-debounce";
import { dashboardService } from "@/services/dashboard.service";
import { CSVImportDialog } from "@/components/CSVImport";
import { ColumnToggle } from "@/components/ColumnToggle";
import { useColumnToggle } from "@/hooks/use-column-toggle";
import { useRole } from "@/hooks/use-role";
import { MapLocationPicker } from "@/components/MapLocationPicker";
import type { Station } from "@/types";

const stationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2).max(10),
  location: z.string().min(2, "Location is required"),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]),
  order: z.coerce.number().int().min(1),
});

type StationFormData = z.infer<typeof stationSchema>;

export default function StationsPage() {
  const { t } = useTranslation();
  const { isAdmin } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") ?? "ALL",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const columns = useColumnToggle(["order", "name", "location", "coordinates", "status"]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, statusFilter, page, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const { data, isLoading } = useStations({
    page,
    search: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    limit: 12,
  });

  const stations = data?.stations ?? [];
  const meta = data?.meta ?? null;
  const {
    sorted: sortedStations,
    sortConfig,
    requestSort,
  } = useSortable<Station>(stations, "order");

  const createMutation = useCreateStation();
  const updateMutation = useUpdateStation();
  const deleteMutation = useDeleteStation();

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StationFormData>({
    resolver: zodResolver(stationSchema) as Resolver<StationFormData>,
    defaultValues: { status: "ACTIVE", order: 1 },
  });

  const openCreate = () => {
    setEditingStation(null);
    reset({
      name: "",
      code: "",
      location: "",
      status: "ACTIVE",
      order: stations.length + 1,
    });
    setDialogOpen(true);
  };

  const openEdit = (station: Station) => {
    setEditingStation(station);
    reset({
      name: station.name,
      code: station.code,
      location: station.location,
      latitude: station.latitude ?? "",
      longitude: station.longitude ?? "",
      status: station.status,
      order: station.order,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: StationFormData) => {
    const payload = {
      ...data,
      code: data.code.toUpperCase(),
      latitude: typeof data.latitude === "number" ? data.latitude : undefined,
      longitude:
        typeof data.longitude === "number" ? data.longitude : undefined,
    };

    try {
      if (editingStation) {
        await updateMutation.mutateAsync({
          id: editingStation.id,
          data: payload,
        });
        toast.success("Station updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Station created successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save station");
    }
  };

  const handleExport = async () => {
    try {
      await dashboardService.exportStationsCSV();
      toast.success("Stations exported to CSV");
    } catch {
      toast.error("Failed to export");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirm(null);
      toast.success("Station deleted successfully");
    } catch {
      toast.error("Failed to delete station");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedStations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedStations.map((s) => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all([...selectedIds].map((id) => deleteMutation.mutateAsync(id)));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      toast.success(`${selectedIds.size} stations deleted`);
    } catch {
      toast.error("Failed to delete some stations");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t("stations.title")}</h2>
          <p className="text-muted-foreground">
            {t("stations.manage")} ({meta?.total ?? stations.length} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("common.delete")} ({selectedIds.size})
            </Button>
          )}
          <ColumnToggle columns={[{ key: "order", label: "Order" }, { key: "location", label: "Location" }, { key: "coordinates", label: "Coordinates" }, { key: "status", label: "Status" }]} isVisible={columns.isVisible} toggle={columns.toggle} />
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          {isAdmin && (
            <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
              Import CSV
            </Button>
          )}
          {isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t("stations.addStation")}
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
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.allStatus")}</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stations Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {isAdmin && (
                    <TableHead className="w-10">
                      <input type="checkbox" checked={selectedIds.size === sortedStations.length && sortedStations.length > 0} onChange={toggleSelectAll} className="rounded border-border" />
                    </TableHead>
                  )}
                  <SortableTableHead<Station>
                    label={t("stations.order")}
                    sortKey="order"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="w-15"
                  />
                  <SortableTableHead<Station>
                    label={t("stations.stationName")}
                    sortKey="name"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                  />
                  <SortableTableHead<Station>
                    label={t("stations.location")}
                    sortKey="location"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="hidden md:table-cell"
                  />
                  <TableHead className="hidden lg:table-cell">
                    {t("stations.coordinates")}
                  </TableHead>
                  <SortableTableHead<Station>
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
                          <Skeleton className="h-4 w-6" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-4 w-28" />
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
                  : sortedStations.map((station) => (
                      <TableRow key={station.id} className={selectedIds.has(station.id) ? "bg-primary/5" : ""}>
                        {isAdmin && (
                          <TableCell>
                            <input type="checkbox" checked={selectedIds.has(station.id)} onChange={() => toggleSelect(station.id)} className="rounded border-border" />
                          </TableCell>
                        )}
                        <TableCell className="font-mono text-muted-foreground">
                          {station.order}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {station.code}
                            </div>
                            <div>
                              <Link to={`/stations/${station.id}`} className="font-medium hover:text-primary hover:underline">{station.name}</Link>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {station.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {station.location}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {station.latitude && station.longitude ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1 cursor-help">
                                    <MapPin className="h-3 w-3" />
                                    {station.latitude.toFixed(4)},{" "}
                                    {station.longitude.toFixed(4)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Lat: {station.latitude}, Lng:{" "}
                                    {station.longitude}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              station.status === "ACTIVE"
                                ? "success"
                                : station.status === "MAINTENANCE"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {station.status}
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
                                      onClick={() => openEdit(station)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {t("stations.editStation")}
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
                                        setDeleteConfirm(station.id)
                                      }
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {t("stations.deleteStation")}
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
          </CardContent>
        </Card>
      </motion.div>

      {sortedStations.length === 0 && !isLoading && (
        <EmptyState
          icon={TrainFront}
          title={
            debouncedSearch ? t("common.noResults") : t("stations.noStations")
          }
          description={
            debouncedSearch
              ? t("stations.noStationsSearch", { query: debouncedSearch })
              : t("stations.getStarted")
          }
          action={
            isAdmin && !debouncedSearch
              ? { label: t("stations.addStation"), onClick: openCreate }
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
            <DialogTitle>
              {editingStation
                ? t("stations.editStation")
                : t("stations.addStation")}
            </DialogTitle>
            <DialogDescription>
              {editingStation
                ? "Update the station details below."
                : "Fill in the details to create a new station."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("stations.stationName")}</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t("stations.code")}</Label>
                <Input id="code" {...register("code")} className="uppercase" />
                {errors.code && (
                  <p className="text-xs text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("stations.location")}</Label>
              <Input id="location" {...register("location")} />
              {errors.location && (
                <p className="text-xs text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("stations.coordinates")}</Label>
              <MapLocationPicker
                latitude={watch("latitude")}
                longitude={watch("longitude")}
                onPick={(lat, lng) => {
                  setValue("latitude", lat);
                  setValue("longitude", lng);
                }}
              />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="latitude" className="text-xs text-muted-foreground">{t("stations.latitude")}</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    className="h-8 text-xs"
                    {...register("latitude")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="longitude" className="text-xs text-muted-foreground">{t("stations.longitude")}</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    className="h-8 text-xs"
                    {...register("longitude")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="order" className="text-xs text-muted-foreground">{t("stations.order")}</Label>
                  <Input id="order" type="number" className="h-8 text-xs" {...register("order")} />
                  {errors.order && (
                    <p className="text-xs text-destructive">
                      {errors.order.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("stations.status")}</Label>
              <Select
                defaultValue={editingStation?.status || "ACTIVE"}
                onValueChange={(val) =>
                  setValue(
                    "status",
                    val as "ACTIVE" | "MAINTENANCE" | "INACTIVE",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
                  : editingStation
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
            <AlertDialogTitle>{t("stations.deleteStation")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("stations.deleteConfirm")}
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

      {/* Bulk Delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")} ({selectedIds.size})</AlertDialogTitle>
            <AlertDialogDescription>
              {t("stations.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBulkDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t("common.loading") : `${t("common.delete")} (${selectedIds.size})`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CSVImportDialog open={csvImportOpen} onOpenChange={setCsvImportOpen} />
    </div>
  );
}
