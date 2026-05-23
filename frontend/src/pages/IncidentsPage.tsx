import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, AlertTriangle, CheckCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { OpsCard } from "@/components/OpsCard";
import { SkeletonTable } from "@/components/Skeleton";
import { usePublicStations } from "@/hooks/use-stations";
import { usePermission } from "@/hooks/use-permission";
import { usePageMeta } from "@/hooks/use-page-meta";
import {
  useIncidents,
  useCreateIncident,
  useUpdateIncident,
  useResolveIncident,
  useDeleteIncident,
} from "@/hooks/use-incidents";
import type { Incident } from "@/types";

const SEVERITY_COLORS = {
  CRITICAL: {
    text: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
  },
  HIGH: {
    text: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.3)",
  },
  MEDIUM: {
    text: "#eab308",
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.3)",
  },
  LOW: {
    text: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
  },
} as const;

const STATUS_COLORS = {
  OPEN: {
    text: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
  },
  MONITORING: {
    text: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
  RESOLVED: {
    text: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    border: "rgba(107,114,128,0.3)",
  },
} as const;

function SeverityBadge({
  severity,
}: {
  severity: keyof typeof SEVERITY_COLORS;
}) {
  const c = SEVERITY_COLORS[severity];
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wide"
      style={{ color: c.text, background: c.bg, borderColor: c.border }}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: keyof typeof STATUS_COLORS }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wide"
      style={{ color: c.text, background: c.bg, borderColor: c.border }}
    >
      {status}
    </span>
  );
}

function formatRelative(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  stationId: z.string().optional(),
});
type FormValues = z.infer<typeof createSchema>;

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const row = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.18 } },
};

const MotionTableBody = motion(TableBody);
const MotionTableRow = motion(TableRow);

export default function IncidentsPage() {
  usePageMeta({ title: "Incidents", path: "/incidents" });
  const { t } = useTranslation();
  const { can } = usePermission();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Incident | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);

  const { data, isLoading } = useIncidents({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
  });

  const { data: stationsData } = usePublicStations();
  const stations = stationsData ?? [];

  const createMutation = useCreateIncident();
  const updateMutation = useUpdateIncident();
  const resolveMutation = useResolveIncident();
  const deleteMutation = useDeleteIncident();

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "MEDIUM",
      stationId: "none",
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "MEDIUM",
      stationId: "none",
    },
  });

  function openEdit(incident: Incident) {
    setEditTarget(incident);
    editForm.reset({
      title: incident.title,
      description: incident.description ?? "",
      severity: incident.severity,
      stationId: incident.stationId ?? "none",
    });
  }

  async function handleCreate(values: FormValues) {
    await createMutation.mutateAsync({
      title: values.title,
      description: values.description || undefined,
      severity: values.severity,
      stationId:
        values.stationId && values.stationId !== "none"
          ? values.stationId
          : null,
    });
    setCreateOpen(false);
    form.reset();
  }

  async function handleEdit(values: FormValues) {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      id: editTarget.id,
      data: {
        title: values.title,
        description: values.description || undefined,
        severity: values.severity,
        stationId:
          values.stationId && values.stationId !== "none"
            ? values.stationId
            : null,
      },
    });
    setEditTarget(null);
  }

  async function handleResolve() {
    if (!resolveTarget) return;
    await resolveMutation.mutateAsync(resolveTarget.id);
    setResolveTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  const incidents = data?.incidents ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("incidents.title")}
        subtitle={t("incidents.subtitle")}
        right={
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            {t("incidents.reportIncident")}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={severityFilter}
          onValueChange={(v) => {
            setSeverityFilter(v === "ALL" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-8 text-xs font-mono">
            <SelectValue placeholder={t("incidents.severity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            <SelectItem value="CRITICAL">CRITICAL</SelectItem>
            <SelectItem value="HIGH">HIGH</SelectItem>
            <SelectItem value="MEDIUM">MEDIUM</SelectItem>
            <SelectItem value="LOW">LOW</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "ALL" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-8 text-xs font-mono">
            <SelectValue placeholder={t("incidents.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="OPEN">OPEN</SelectItem>
            <SelectItem value="MONITORING">MONITORING</SelectItem>
            <SelectItem value="RESOLVED">RESOLVED</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="w-52 h-8 text-xs"
          placeholder={t("incidents.searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {(search || statusFilter || severityFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setSeverityFilter("");
              setPage(1);
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <OpsCard>
        {isLoading ? (
          <SkeletonTable rows={6} columns={7} />
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 opacity-30" />
            <p className="text-sm">{t("incidents.noIncidents")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-24">
                  {t("incidents.severity")}
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                  Title
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-32">
                  {t("incidents.station")}
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-28">
                  {t("incidents.status")}
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-28">
                  {t("incidents.reporter")}
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-24">
                  Time
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest w-24 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <MotionTableBody variants={stagger} initial="hidden" animate="show">
              <AnimatePresence>
                {incidents.map((incident) => (
                  <MotionTableRow
                    key={incident.id}
                    variants={row}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <SeverityBadge severity={incident.severity} />
                    </TableCell>
                    <TableCell className="max-w-60 truncate text-sm">
                      {incident.title}
                    </TableCell>
                    <TableCell>
                      {incident.station ? (
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {incident.station.code}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t("incidents.systemWide")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={incident.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {incident.reportedBy.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatRelative(incident.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {can("incidents.resolve") &&
                          incident.status !== "RESOLVED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Resolve"
                              onClick={() => setResolveTarget(incident)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            </Button>
                          )}
                        {can("incidents.edit") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Edit"
                            onClick={() => openEdit(incident)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {can("incidents.delete") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Delete"
                            onClick={() => setDeleteTarget(incident)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </MotionTableRow>
                ))}
              </AnimatePresence>
            </MotionTableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </OpsCard>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("incidents.createIncident")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleCreate)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="create-title">Title *</Label>
              <Input id="create-title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                {...form.register("description")}
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("incidents.severity")} *</Label>
              <Controller
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="LOW">LOW</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.severity && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.severity.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("incidents.station")}</Label>
              <Controller
                control={form.control}
                name="stationId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("incidents.systemWide")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("incidents.systemWide")}
                      </SelectItem>
                      {stations.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} — {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? "Reporting..."
                  : t("incidents.reportIncident")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("incidents.editIncident")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEdit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title *</Label>
              <Input id="edit-title" {...editForm.register("title")} />
              {editForm.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                {...editForm.register("description")}
                rows={3}
              />
              {editForm.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("incidents.severity")} *</Label>
              <Controller
                control={editForm.control}
                name="severity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="LOW">LOW</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {editForm.formState.errors.severity && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.severity.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("incidents.station")}</Label>
              <Controller
                control={editForm.control}
                name="stationId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("incidents.systemWide")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("incidents.systemWide")}
                      </SelectItem>
                      {stations.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} — {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resolve AlertDialog */}
      <AlertDialog
        open={!!resolveTarget}
        onOpenChange={(open) => !open && setResolveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("incidents.confirmResolve")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("incidents.resolveWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolve}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? "Resolving..." : "Resolve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("incidents.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("incidents.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
