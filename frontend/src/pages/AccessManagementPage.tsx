import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Shield, Check, X } from "lucide-react";
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 256,
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--color-muted-foreground)",
          }}
        >
          LOADING PERMISSIONS...
        </p>
      </div>
    );
  }

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
          ACCESS CONTROL
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
          RBAC · Permission Matrix
        </span>
      </div>

      {/* Horizontal fade line below header */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, rgba(59,130,246,0.5) 0%, transparent 60%)",
          marginTop: 12,
          marginBottom: 28,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        {/* Role Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {ROLES.map((role) => {
            const rolePerms = getRolePermissions(role);
            const cfg = ROLE_CONFIG[role];
            return (
              <div
                key={role}
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  borderLeft: `3px solid ${cfg.accentColor}`,
                  boxShadow: cfg.glowShadow,
                }}
              >
                {/* Top accent gradient line */}
                <div
                  style={{
                    height: 2,
                    background:
                      "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0) 100%)",
                  }}
                />

                {/* Card header */}
                <div style={{ padding: "18px 20px 14px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: cfg.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {role === "ADMIN" ? (
                        <ShieldCheck
                          style={{ width: 20, height: 20, color: cfg.accentColor }}
                        />
                      ) : (
                        <Shield
                          style={{ width: 20, height: 20, color: cfg.accentColor }}
                        />
                      )}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: 18,
                          letterSpacing: "0.06em",
                          lineHeight: 1,
                          margin: 0,
                        }}
                      >
                        {role}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Sora', sans-serif",
                          fontSize: 12,
                          color: "var(--color-muted-foreground)",
                          margin: "3px 0 0",
                        }}
                      >
                        {cfg.description}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Permissions list */}
                <div style={{ padding: "14px 20px 18px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {rolePerms.map((perm) => (
                      <span
                        key={perm}
                        style={{
                          background: `${cfg.bgColor}`,
                          border: `1px solid ${cfg.accentColor}30`,
                          color: cfg.accentColor,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          padding: "2px 7px",
                          borderRadius: 3,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {PERMISSION_LABELS[perm] ?? perm}
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "var(--color-muted-foreground)",
                      marginTop: 10,
                      opacity: 0.7,
                    }}
                  >
                    {rolePerms.length} permissions assigned
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Permission Matrix */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Top accent gradient line */}
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0) 100%)",
            }}
          />

          {/* Card section header */}
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
              PERMISSION MATRIX
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
              Detailed comparison across modules
            </span>
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table style={{ width: "100%", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "44%" }} />
                {ROLES.map((role) => (
                  <col
                    key={role}
                    style={{ width: `${34 / ROLES.length}%` }}
                  />
                ))}
              </colgroup>
              <TableHeader>
                <TableRow style={{ background: "rgba(0,0,0,0.02)" }}>
                  <TableHead
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    Module
                  </TableHead>
                  <TableHead
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    Permission
                  </TableHead>
                  {ROLES.map((role) => {
                    const cfg = ROLE_CONFIG[role];
                    return (
                      <TableHead
                        key={role}
                        style={{
                          textAlign: "center",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: cfg.accentColor,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          {role === "ADMIN" ? (
                            <ShieldCheck style={{ width: 12, height: 12 }} />
                          ) : (
                            <Shield style={{ width: 12, height: 12 }} />
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
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 14,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              verticalAlign: "top",
                              borderRight: "1px solid var(--color-border)",
                              background: "rgba(0,0,0,0.015)",
                              color: "var(--color-muted-foreground)",
                            }}
                          >
                            {group.group}
                          </TableCell>
                        )}
                        <TableCell
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                          }}
                        >
                          {PERMISSION_LABELS[perm] ?? perm}
                        </TableCell>
                        {ROLES.map((role) => (
                          <TableCell
                            key={role}
                            style={{ textAlign: "center" }}
                          >
                            {hasRole(role, perm) ? (
                              <Check
                                style={{
                                  width: 15,
                                  height: 15,
                                  color: "#22c55e",
                                  margin: "0 auto",
                                }}
                              />
                            ) : (
                              <X
                                style={{
                                  width: 15,
                                  height: 15,
                                  color: "#ef4444",
                                  opacity: 0.35,
                                  margin: "0 auto",
                                }}
                              />
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
