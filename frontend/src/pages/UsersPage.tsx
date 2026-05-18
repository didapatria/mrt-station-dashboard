import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Trash2, Shield, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/EmptyState";
import { SortableTableHead } from "@/components/SortableTableHead";
import { useUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/use-users";
import { useSortable } from "@/hooks/use-sortable";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/auth.store";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { User } from "@/types";

export default function UsersPage() {
  usePageMeta({ title: "Users", path: "/users" });
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [roleFilter, setRoleFilter] = useState<string>(
    searchParams.get("role") ?? "ALL",
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, roleFilter, page, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const { data, isLoading } = useUsers({
    page,
    search: debouncedSearch || undefined,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    limit: 10,
  });

  const users = data?.users ?? [];
  const meta = data?.meta ?? null;
  const {
    sorted: sortedUsers,
    sortConfig,
    requestSort,
  } = useSortable<User>(users, "name");

  const updateRoleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  const handleRoleChange = async (
    userId: string,
    newRole: "ADMIN" | "OPERATOR",
  ) => {
    try {
      await updateRoleMutation.mutateAsync({ id: userId, role: newRole });
      toast.success("Role updated successfully");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirm(null);
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const totalCount = meta?.total ?? users.length;

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36,
            letterSpacing: "0.04em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          USERS
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
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-muted-foreground)",
          }}
        >
          User Registry · System Access
        </span>
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
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: "var(--color-muted-foreground)",
            }}
          />
          <Input
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="OPERATOR">Operator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
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

          {/* Card Section Header */}
          <div
            style={{
              padding: "18px 24px 14px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                letterSpacing: "0.05em",
                lineHeight: 1,
              }}
            >
              REGISTRY
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-muted-foreground)",
              }}
            >
              All Accounts
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow style={{ background: "rgba(0,0,0,0.02)" }}>
                <SortableTableHead<User>
                  label="User"
                  sortKey="name"
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
                <SortableTableHead<User>
                  label="Email"
                  sortKey="email"
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
                <SortableTableHead<User>
                  label="Role"
                  sortKey="role"
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
                <SortableTableHead<User>
                  label="Joined"
                  sortKey="createdAt"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  className="hidden md:table-cell"
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
                    textAlign: "right",
                    width: 100,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : sortedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/30"
                      style={{
                        transition: "background 0.12s ease",
                        borderLeft:
                          user.role === "ADMIN"
                            ? "2px solid rgba(59,130,246,0.3)"
                            : undefined,
                      }}
                    >
                      <TableCell>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={
                                user.avatarUrl ||
                                `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                              }
                              alt={user.name}
                            />
                            <AvatarFallback
                              style={{
                                background:
                                  user.role === "ADMIN"
                                    ? "rgba(16,185,129,0.15)"
                                    : "rgba(59,130,246,0.15)",
                                color:
                                  user.role === "ADMIN" ? "#10b981" : "#60a5fa",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p
                              style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: 13.5,
                                fontWeight: 500,
                                margin: 0,
                              }}
                            >
                              {user.name}
                            </p>
                            <p
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10.5,
                                color: "var(--color-muted-foreground)",
                                margin: 0,
                              }}
                              className="sm:hidden"
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className="hidden sm:table-cell"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(val) =>
                            handleRoleChange(
                              user.id,
                              val as "ADMIN" | "OPERATOR",
                            )
                          }
                          disabled={user.id === currentUser?.id}
                        >
                          <SelectTrigger className="w-32.5 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Admin
                              </span>
                            </SelectItem>
                            <SelectItem value="OPERATOR">
                              <span className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5" />
                                Operator
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell
                        className="hidden md:table-cell"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        {user.id !== currentUser?.id ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirm(user.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("common.delete")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span
                            style={{
                              background: "rgba(16,185,129,0.1)",
                              border: "1px solid rgba(16,185,129,0.25)",
                              color: "#10b981",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 8.5,
                              padding: "1px 6px",
                              borderRadius: 2,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                          >
                            You
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {sortedUsers.length === 0 && !isLoading && (
        <EmptyState
          icon={UserCog}
          title={debouncedSearch ? "No users found" : "No users yet"}
          description={
            debouncedSearch
              ? `No users match "${debouncedSearch}".`
              : "No user accounts have been created."
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

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22,
                letterSpacing: "0.05em",
              }}
            >
              {t("common.delete")}
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
              }}
            >
              {t("users.deleteConfirm")}
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
