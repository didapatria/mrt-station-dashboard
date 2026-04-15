import { motion } from "framer-motion";
import { ShieldCheck, Shield, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_PERMISSIONS, PERMISSION_LABELS, PERMISSION_GROUPS, type Permission } from "@/lib/permissions";

function hasRole(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export default function AccessManagementPage() {
  const roles = Object.keys(ROLE_PERMISSIONS);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">User Access Management</h2>
        <p className="text-muted-foreground">Role-based permissions and access control matrix</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Role Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role}>
              <CardHeader>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
                  {role === "ADMIN" ? (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{role}</CardTitle>
                    <CardDescription>
                      {role === "ADMIN"
                        ? "Full access to all features and management"
                        : "Read-only access to operational data"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PERMISSIONS[role].map((perm) => (
                    <Badge key={perm} variant={role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                      {PERMISSION_LABELS[perm]}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {ROLE_PERMISSIONS[role].length} permissions assigned
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>Detailed comparison of role permissions across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Module</TableHead>
                    <TableHead className="w-56">Permission</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role} className="text-center w-32">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                          {role === "ADMIN" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                          {role}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSION_GROUPS.map((group) =>
                    group.permissions.map((perm, idx) => (
                      <TableRow key={perm}>
                        {idx === 0 && (
                          <TableCell rowSpan={group.permissions.length} className="font-medium align-top border-r bg-muted/30">
                            {group.group}
                          </TableCell>
                        )}
                        <TableCell className="text-sm">{PERMISSION_LABELS[perm]}</TableCell>
                        {roles.map((role) => (
                          <TableCell key={role} className="text-center">
                            {hasRole(role, perm) ? (
                              <Check className="h-4 w-4 text-success mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
