import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Shield, Check, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERMISSION_GROUPS, PERMISSION_LABELS } from "@/lib/permissions";
import { useAllPermissions } from "@/hooks/use-permissions";
import { useRole } from "@/hooks/use-role";
import { usePageMeta } from "@/hooks/use-page-meta";

const ROLES = ["ADMIN", "OPERATOR"];

const ROLE_CONFIG: Record<
  string,
  {
    accentColor: string;
    bgColor: string;
    description: string;
    glowShadow: string;
  }
> = {
  ADMIN: {
    accentColor: "#3b82f6",
    bgColor: "rgba(59,130,246,0.1)",
    description: "Full access to all features and management",
    glowShadow:
      "0 0 0 1px rgba(59,130,246,0.15), inset 0 1px 0 rgba(59,130,246,0.1)",
  },
  OPERATOR: {
    accentColor: "#10b981",
    bgColor: "rgba(16,185,129,0.1)",
    description: "Read-only access to operational data",
    glowShadow:
      "0 0 0 1px rgba(16,185,129,0.15), inset 0 1px 0 rgba(16,185,129,0.1)",
  },
};

export default function AccessManagementPage() {
  usePageMeta({ title: "Access Management", path: "/access", noIndex: true });
  const { isAdmin } = useRole();
  const { data: permissions = [], isLoading } = useAllPermissions();

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  function hasRole(role: string, permName: string): boolean {
    const perm = permissions.find((p) => p.name === permName);
    return perm?.roles.includes(role) ?? false;
  }

  function getRolePermissions(role: string): string[] {
    return permissions.filter((p) => p.roles.includes(role)).map((p) => p.name);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground">
          LOADING PERMISSIONS...
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="ACCESS CONTROL" subtitle="RBAC · Permission Matrix" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        {/* Role Summary Cards */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {ROLES.map((role) => {
            const rolePerms = getRolePermissions(role);
            const cfg = ROLE_CONFIG[role];
            return (
              <div
                key={role}
                className="ops-card"
                style={{
                  borderLeft: `3px solid ${cfg.accentColor}`,
                  boxShadow: cfg.glowShadow,
                }}
              >
                <div className="ops-accent-line" />

                {/* Card header */}
                <div className="px-5 pt-4.5 pb-3.5">
                  <div className="flex flex-row items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: cfg.bgColor }}
                    >
                      {role === "ADMIN" ? (
                        <ShieldCheck
                          className="w-5 h-5"
                          style={{ color: cfg.accentColor }}
                        />
                      ) : (
                        <Shield
                          className="w-5 h-5"
                          style={{ color: cfg.accentColor }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-[18px] tracking-[0.06em] leading-none m-0">
                        {role}
                      </p>
                      <p className="font-['Sora',sans-serif] text-[12px] text-muted-foreground mt-0.75 mb-0">
                        {cfg.description}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Permissions list */}
                <div className="p-[14px_20px_18px]">
                  <div className="flex flex-wrap gap-1.25">
                    {rolePerms.map((perm) => (
                      <span
                        key={perm}
                        className="font-mono text-[9px] px-1.75 py-0.5 rounded-[3px] tracking-[0.08em] uppercase"
                        style={{
                          background: cfg.bgColor,
                          border: `1px solid ${cfg.accentColor}30`,
                          color: cfg.accentColor,
                        }}
                      >
                        {PERMISSION_LABELS[perm] ?? perm}
                      </span>
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mt-2.5 opacity-70">
                    {rolePerms.length} permissions assigned
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Permission Matrix */}
        <div className="ops-card">
          <div className="ops-accent-line" />
          <div className="ops-card-header flex items-baseline gap-2.5">
            <span className="ops-card-title">PERMISSION MATRIX</span>
            <span className="ops-card-subtitle">
              Detailed comparison across modules
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <Table className="w-full table-fixed">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[44%]" />
                {ROLES.map((role) => (
                  <col key={role} style={{ width: `${34 / ROLES.length}%` }} />
                ))}
              </colgroup>
              <TableHeader>
                <TableRow className="bg-black/2">
                  <TableHead className="ops-table-head">Module</TableHead>
                  <TableHead className="ops-table-head">Permission</TableHead>
                  {ROLES.map((role) => {
                    const cfg = ROLE_CONFIG[role];
                    return (
                      <TableHead
                        key={role}
                        className="text-center font-mono text-[9.5px] tracking-[0.14em] uppercase"
                        style={{ color: cfg.accentColor }}
                      >
                        <div className="flex flex-row items-center justify-center gap-1.5">
                          {role === "ADMIN" ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {role}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_GROUPS.map((group) =>
                  group.permissions.map((perm, idx) => {
                    // Compute global row index for alternating backgrounds
                    const groupStart = PERMISSION_GROUPS.slice(
                      0,
                      PERMISSION_GROUPS.indexOf(group),
                    ).reduce((acc, g) => acc + g.permissions.length, 0);
                    const globalIdx = groupStart + idx;
                    const isOdd = globalIdx % 2 !== 0;

                    return (
                      <TableRow
                        key={perm}
                        style={{
                          background: isOdd
                            ? "rgba(255,255,255,0.015)"
                            : "transparent",
                        }}
                      >
                        {idx === 0 && (
                          <TableCell
                            rowSpan={group.permissions.length}
                            className="font-display text-[14px] tracking-widest uppercase align-top border-r border-border bg-black/1.5 text-muted-foreground"
                          >
                            {group.group}
                          </TableCell>
                        )}
                        <TableCell className="font-mono text-[11px]">
                          {PERMISSION_LABELS[perm] ?? perm}
                        </TableCell>
                        {ROLES.map((role) => (
                          <TableCell key={role} className="text-center">
                            {hasRole(role, perm) ? (
                              <Check className="w-3.75 h-3.75 text-[#22c55e] mx-auto" />
                            ) : (
                              <X className="w-3.75 h-3.75 text-[#ef4444] opacity-35 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  }),
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
