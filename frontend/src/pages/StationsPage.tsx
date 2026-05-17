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
    <div style={{ position: "relative" }}>
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              marginBottom: 6,
            }}
          >
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 36,
                letterSpacing: "0.06em",
                lineHeight: 1,
                color: "var(--color-foreground)",
              }}
            >
              {t("stations.title")}
            </h2>
            {meta && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "var(--color-muted-foreground)",
                  letterSpacing: "0.06em",
                  opacity: 0.7,
                }}
              >
                {meta.total} entries
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "var(--color-muted-foreground)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            N–S Line · Station Registry
          </p>
          {/* Horizontal fade line */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, rgba(59,130,246,0.3) 0%, transparent 70%)",
              marginTop: 12,
            }}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
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
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCsvImportOpen(true)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              Import
            </Button>
          )}
          {isAdmin && (
            <Button
              size="sm"
              onClick={openCreate}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t("stations.addStation")}
            </Button>
          )}
        </div>
      </div>

      {/* ── Filter strip ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 13,
              height: 13,
              color: "var(--color-muted-foreground)",
              opacity: 0.6,
            }}
          />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              paddingLeft: 34,
              fontFamily: "'Sora', sans-serif",
              fontSize: 13,
              height: 36,
            }}
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger
            style={{
              width: 148,
              height: 36,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.06em",
            }}
          >
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
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            height: 2,
            background: "linear-gradient(90deg, #3b82f6 0%, transparent 100%)",
          }}
        />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow
                style={{
                  background: thBg,
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {isAdmin && (
                  <TableHead style={{ width: 44, padding: "0 16px" }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size === sortedStations.length &&
                        sortedStations.length > 0
                      }
                      onChange={toggleSelectAll}
                      style={{
                        width: 14,
                        height: 14,
                        cursor: "pointer",
                        accentColor: "var(--color-primary)",
                      }}
                    />
                  </TableHead>
                )}
                {columns.isVisible("order") && (
                  <SortableTableHead<Station>
                    label="#"
                    sortKey="order"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="w-12"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                    }}
                  />
                )}
                <SortableTableHead<Station>
                  label={t("stations.stationName")}
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.16em",
                    color: "var(--color-muted-foreground)",
                    textTransform: "uppercase",
                  }}
                />
                {columns.isVisible("location") && (
                  <SortableTableHead<Station>
                    label={t("stations.location")}
                    sortKey="location"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    className="hidden md:table-cell"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                    }}
                  />
                )}
                {columns.isVisible("coordinates") && (
                  <TableHead
                    className="hidden lg:table-cell"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                    }}
                  >
                    Coords
                  </TableHead>
                )}
                {columns.isVisible("status") && (
                  <SortableTableHead<Station>
                    label={t("stations.status")}
                    sortKey="status"
                    sortConfig={sortConfig}
                    onSort={requestSort}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                    }}
                  />
                )}
                {isAdmin && (
                  <TableHead
                    style={{
                      textAlign: "right",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                      padding: "0 16px",
                    }}
                  >
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
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
                        style={{
                          borderLeft: isSelected
                            ? "3px solid var(--color-primary)"
                            : "3px solid transparent",
                          background: isSelected
                            ? isDark
                              ? "rgba(29,111,232,0.06)"
                              : "rgba(29,111,232,0.04)"
                            : undefined,
                          transition:
                            "background 0.12s ease, border-color 0.12s ease",
                        }}
                      >
                        {isAdmin && (
                          <TableCell style={{ padding: "0 16px", width: 44 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(station.id)}
                              style={{
                                width: 14,
                                height: 14,
                                cursor: "pointer",
                                accentColor: "var(--color-primary)",
                              }}
                            />
                          </TableCell>
                        )}

                        {/* Order: circle badge */}
                        {columns.isVisible("order") && (
                          <TableCell
                            style={{ padding: "12px 16px", width: 44 }}
                          >
                            <div
                              style={{
                                width: isTerminal ? 24 : 22,
                                height: isTerminal ? 24 : 22,
                                borderRadius: "50%",
                                background: isTerminal
                                  ? "var(--color-primary)"
                                  : "transparent",
                                border: isTerminal
                                  ? "none"
                                  : "1.5px solid var(--color-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10,
                                fontWeight: 700,
                                color: isTerminal
                                  ? "white"
                                  : "var(--color-muted-foreground)",
                                letterSpacing: 0,
                                flexShrink: 0,
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
                        <TableCell style={{ padding: "12px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            {/* Code plate */}
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "2px 8px",
                                borderRadius: 5,
                                background: isDark
                                  ? "rgba(29,111,232,0.12)"
                                  : "rgba(29,111,232,0.08)",
                                border: "1px solid rgba(29,111,232,0.2)",
                                fontFamily: "'Bebas Neue', sans-serif",
                                fontSize: 13,
                                color: "var(--color-primary)",
                                letterSpacing: "0.06em",
                                flexShrink: 0,
                                minWidth: 36,
                                boxShadow: "0 0 8px rgba(29,111,232,0.2)",
                              }}
                            >
                              {station.code}
                            </div>
                            <div>
                              <Link
                                to={`/stations/${station.id}`}
                                style={{
                                  fontFamily: "'Sora', sans-serif",
                                  fontSize: 13.5,
                                  fontWeight: 500,
                                  color: "var(--color-foreground)",
                                  textDecoration: "none",
                                  transition: "color 0.12s ease",
                                }}
                                onMouseEnter={(e) =>
                                  ((e.target as HTMLElement).style.color =
                                    "var(--color-primary)")
                                }
                                onMouseLeave={(e) =>
                                  ((e.target as HTMLElement).style.color =
                                    "var(--color-foreground)")
                                }
                              >
                                {station.name}
                              </Link>
                              <p
                                className="md:hidden"
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 10,
                                  color: "var(--color-muted-foreground)",
                                  marginTop: 2,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {station.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Location */}
                        {columns.isVisible("location") && (
                          <TableCell
                            className="hidden md:table-cell"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 11,
                              color: "var(--color-muted-foreground)",
                              letterSpacing: "0.03em",
                            }}
                          >
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
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        fontFamily:
                                          "'JetBrains Mono', monospace",
                                        fontSize: 10.5,
                                        color: "var(--color-muted-foreground)",
                                        cursor: "help",
                                        letterSpacing: "0.02em",
                                      }}
                                    >
                                      <MapPin
                                        style={{
                                          width: 10,
                                          height: 10,
                                          opacity: 0.5,
                                        }}
                                      />
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
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 11,
                                  color: "var(--color-muted-foreground)",
                                  opacity: 0.35,
                                }}
                              >
                                —
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* Status: LED dot */}
                        {columns.isVisible("status") && (
                          <TableCell>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: dot.color,
                                  boxShadow: `0 0 8px ${dot.glow}`,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 10.5,
                                  color: "var(--color-foreground)",
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                }}
                              >
                                {dot.label}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {/* Actions */}
                        {isAdmin && (
                          <TableCell
                            style={{ textAlign: "right", padding: "8px 16px" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                              }}
                            >
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
            style={{
              position: "fixed",
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              background: isDark ? "#0f172a" : "white",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow:
                "0 -4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1)",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "var(--color-foreground)",
                letterSpacing: "0.06em",
              }}
            >
              {selectedIds.size} selected
            </span>
            <div
              style={{
                width: 1,
                height: 18,
                background: "var(--color-border)",
              }}
            />
            <button
              onClick={() => setBulkDeleteOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 6,
                padding: "5px 12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#ef4444",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "background 0.12s ease",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(239,68,68,0.18)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(239,68,68,0.1)")
              }
            >
              <Trash2 style={{ width: 11, height: 11 }} />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26,
                height: 26,
                borderRadius: 6,
                background: "transparent",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                color: "var(--color-muted-foreground)",
                transition: "background 0.12s ease",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--color-accent)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22,
                letterSpacing: "0.06em",
                fontWeight: 400,
              }}
            >
              {editingStation
                ? t("stations.editStation")
                : t("stations.addStation")}
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                letterSpacing: "0.08em",
              }}
            >
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
