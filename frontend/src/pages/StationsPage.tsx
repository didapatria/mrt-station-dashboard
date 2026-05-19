import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  MapPin,
  TrainFront,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/PageHeader";
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
import { useThemeStore } from "@/store/theme.store";
import { usePageMeta } from "@/hooks/use-page-meta";
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

const STATUS_DOT: Record<
  string,
  { color: string; glow: string; label: string }
> = {
  ACTIVE: {
    color: "#22c55e",
    glow: "rgba(34,197,94,0.5)",
    label: "Active",
  },
  MAINTENANCE: {
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.5)",
    label: "Maintenance",
  },
  INACTIVE: {
    color: "#ef4444",
    glow: "rgba(239,68,68,0.5)",
    label: "Inactive",
  },
};

export default function StationsPage() {
  usePageMeta({ title: "Stations", path: "/stations" });
  const { t } = useTranslation();
  const { isAdmin } = useRole();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
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
  const columns = useColumnToggle([
    "order",
    "name",
    "location",
    "coordinates",
    "status",
  ]);
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
    control,
    formState: { errors },
  } = useForm<StationFormData>({
    resolver: zodResolver(stationSchema) as Resolver<StationFormData>,
    defaultValues: { status: "ACTIVE", order: 1 },
  });
  const watchedLatitude = useWatch({ control, name: "latitude" });
  const watchedLongitude = useWatch({ control, name: "longitude" });

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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
      await Promise.all(
        [...selectedIds].map((id) => deleteMutation.mutateAsync(id)),
      );
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      toast.success(`${selectedIds.size} stations deleted`);
    } catch {
      toast.error("Failed to delete some stations");
    }
  };

  const thBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";

  const isTerminalOrder = (order: number) =>
    order === 1 || order === (meta?.total ?? 0);

  return (
    <div className="relative">
      <PageHeader
        title={t("stations.title")}
        subtitle={`N–S Line · Station Registry${meta ? ` · ${meta.total} entries` : ""}`}
        right={
          <div className="flex gap-2 flex-wrap items-center">
            <ColumnToggle
              columns={[
                { key: "order", label: "Order" },
                { key: "location", label: "Location" },
                { key: "coordinates", label: "Coordinates" },
                { key: "status", label: "Status" },
              ]}
              isVisible={columns.isVisible}
              toggle={columns.toggle}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="ops-btn-mono"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              CSV
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCsvImportOpen(true)}
                className="ops-btn-mono"
              >
                Import
              </Button>
            )}
            {isAdmin && (
              <Button size="sm" onClick={openCreate} className="ops-btn-mono">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {t("stations.addStation")}
              </Button>
            )}
          </div>
        }
      />

      {/* ── Filter strip ── */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.25 h-3.25 text-muted-foreground opacity-60" />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="font-['Sora'] text-[13px] pl-8.5 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="ops-btn-mono w-37 h-9">
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

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="ops-card mb-5"
      >
        <div className="ops-accent-line" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow
                className="border-b border-border"
                style={{ background: thBg }}
              >
                {isAdmin && (
                  <TableHead className="w-11 px-4">
                    <Checkbox
                      checked={
                        selectedIds.size === sortedStations.length &&
                        sortedStations.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all stations"
                    />
                  </TableHead>
                )}
                {columns.isVisible("order") && (
                  <SortableTableHead<Station>
                    label="#"
                    sortKey="order"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="ops-table-head w-12"
                  />
                )}
                <SortableTableHead<Station>
                  label={t("stations.stationName")}
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  className="ops-table-head"
                />
                {columns.isVisible("location") && (
                  <SortableTableHead<Station>
                    label={t("stations.location")}
                    sortKey="location"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="ops-table-head hidden md:table-cell"
                  />
                )}
                {columns.isVisible("coordinates") && (
                  <TableHead className="ops-table-head hidden lg:table-cell">
                    Coords
                  </TableHead>
                )}
                {columns.isVisible("status") && (
                  <SortableTableHead<Station>
                    label={t("stations.status")}
                    sortKey="status"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="ops-table-head"
                  />
                )}
                {isAdmin && (
                  <TableHead className="ops-table-head text-right px-4">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && (
                        <TableCell>
                          <Skeleton className="h-3.5 w-3.5" />
                        </TableCell>
                      )}
                      <TableCell>
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-7 w-14 rounded-md" />
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
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Skeleton className="h-7 w-16 ml-auto" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                : sortedStations.map((station) => {
                    const dot =
                      STATUS_DOT[station.status] ?? STATUS_DOT.INACTIVE;
                    const isSelected = selectedIds.has(station.id);
                    const isTerminal = isTerminalOrder(station.order);
                    return (
                      <TableRow
                        key={station.id}
                        className="transition-[background,border-color] duration-120 ease-linear"
                        style={{
                          borderLeft: isSelected
                            ? "3px solid var(--color-primary)"
                            : "3px solid transparent",
                          background: isSelected
                            ? isDark
                              ? "rgba(29,111,232,0.06)"
                              : "rgba(29,111,232,0.04)"
                            : undefined,
                        }}
                      >
                        {isAdmin && (
                          <TableCell className="px-4 w-11">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(station.id)}
                              aria-label={`Select ${station.name}`}
                            />
                          </TableCell>
                        )}

                        {/* Order: circle badge */}
                        {columns.isVisible("order") && (
                          <TableCell className="px-4 py-3 w-11">
                            <div
                              className="rounded-full flex items-center justify-center font-mono text-[10px] font-bold tracking-[0] shrink-0"
                              style={{
                                width: isTerminal ? 24 : 22,
                                height: isTerminal ? 24 : 22,
                                background: isTerminal
                                  ? "var(--color-primary)"
                                  : "transparent",
                                border: isTerminal
                                  ? "none"
                                  : "1.5px solid var(--color-border)",
                                color: isTerminal
                                  ? "white"
                                  : "var(--color-muted-foreground)",
                                boxShadow: isTerminal
                                  ? "0 0 10px rgba(29,111,232,0.45)"
                                  : "none",
                              }}
                            >
                              {station.order}
                            </div>
                          </TableCell>
                        )}

                        {/* Name + code */}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* Code plate */}
                            <div className="ops-station-code">
                              {station.code}
                            </div>
                            <div>
                              <Link
                                to={`/stations/${station.id}`}
                                className="ops-station-link"
                              >
                                {station.name}
                              </Link>
                              <p className="ops-mono-data md:hidden mt-0.5">
                                {station.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Location */}
                        {columns.isVisible("location") && (
                          <TableCell className="ops-mono-data hidden md:table-cell">
                            {station.location}
                          </TableCell>
                        )}

                        {/* Coordinates */}
                        {columns.isVisible("coordinates") && (
                          <TableCell className="hidden lg:table-cell">
                            {station.latitude && station.longitude ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-muted-foreground cursor-help tracking-[0.02em]">
                                      <MapPin className="w-2.5 h-2.5 opacity-50" />
                                      {station.latitude.toFixed(4)},{" "}
                                      {station.longitude.toFixed(4)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Lat: {station.latitude} · Lng:{" "}
                                    {station.longitude}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="font-mono text-[11px] text-muted-foreground opacity-35">
                                —
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Status: LED dot */}
                        {columns.isVisible("status") && (
                          <TableCell>
                            <div className="inline-flex items-center gap-1.75">
                              <span
                                className="inline-block w-1.75 h-1.75 rounded-full shrink-0"
                                style={{
                                  background: dot.color,
                                  boxShadow: `0 0 8px ${dot.glow}`,
                                }}
                              />
                              <span className="font-mono text-[10.5px] text-foreground tracking-[0.06em] uppercase">
                                {dot.label}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {/* Actions */}
                        {isAdmin && (
                          <TableCell className="text-right px-4 py-2">
                            <div className="flex justify-end gap-0.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openEdit(station)}
                                    >
                                      <Pencil className="h-3 w-3" />
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
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() =>
                                        setDeleteConfirm(station.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
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
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Empty state */}
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

      {/* ── Floating bulk action bar ── */}
      <AnimatePresence>
        {isAdmin && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 72, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed z-50 border border-border rounded-[10px] py-2.5 px-4 flex items-center gap-3.5 whitespace-nowrap"
            style={{
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              background: isDark ? "#0f172a" : "white",
              boxShadow:
                "0 -4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1)",
            }}
          >
            <span className="font-mono text-[11px] text-foreground tracking-[0.06em]">
              {selectedIds.size} selected
            </span>
            <div className="w-px h-4.5 bg-border" />
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="flex items-center gap-1.5 rounded-md py-1.25 px-3 font-mono text-[10.5px] font-semibold text-[#ef4444] tracking-widest cursor-pointer transition-[background] duration-[0.12s] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.18)]"
            >
              <Trash2 className="w-2.75 h-2.75" />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center justify-center w-6.5 h-6.5 rounded-md border border-border cursor-pointer text-muted-foreground transition-[background] duration-[0.12s] bg-transparent hover:bg-accent"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-[22px] tracking-[0.06em] font-normal">
              {editingStation
                ? t("stations.editStation")
                : t("stations.addStation")}
            </DialogTitle>
            <DialogDescription className="font-mono text-[10.5px] tracking-[0.08em]">
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
                latitude={watchedLatitude}
                longitude={watchedLongitude}
                onPick={(lat, lng) => {
                  setValue("latitude", lat);
                  setValue("longitude", lng);
                }}
              />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="latitude"
                    className="text-xs text-muted-foreground"
                  >
                    {t("stations.latitude")}
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    className="h-8 text-xs"
                    {...register("latitude")}
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="longitude"
                    className="text-xs text-muted-foreground"
                  >
                    {t("stations.longitude")}
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    className="h-8 text-xs"
                    {...register("longitude")}
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="order"
                    className="text-xs text-muted-foreground"
                  >
                    {t("stations.order")}
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    className="h-8 text-xs"
                    {...register("order")}
                  />
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

      {/* Delete single */}
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

      {/* Bulk delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.delete")} ({selectedIds.size})
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("stations.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBulkDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? t("common.loading")
                : `${t("common.delete")} (${selectedIds.size})`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CSVImportDialog open={csvImportOpen} onOpenChange={setCsvImportOpen} />
    </div>
  );
}
