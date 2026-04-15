export type Permission =
  | "stations.view"
  | "stations.create"
  | "stations.edit"
  | "stations.delete"
  | "schedules.view"
  | "schedules.create"
  | "schedules.edit"
  | "schedules.delete"
  | "users.view"
  | "users.edit_role"
  | "users.delete"
  | "activity_logs.view"
  | "dashboard.view"
  | "dashboard.export"
  | "map.view"
  | "settings.view"
  | "settings.edit";

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    "stations.view",
    "stations.create",
    "stations.edit",
    "stations.delete",
    "schedules.view",
    "schedules.create",
    "schedules.edit",
    "schedules.delete",
    "users.view",
    "users.edit_role",
    "users.delete",
    "activity_logs.view",
    "dashboard.view",
    "dashboard.export",
    "map.view",
    "settings.view",
    "settings.edit",
  ],
  OPERATOR: [
    "stations.view",
    "schedules.view",
    "activity_logs.view",
    "dashboard.view",
    "map.view",
    "settings.view",
    "settings.edit",
  ],
};

export function hasPermission(role: string | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: string | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  "stations.view": "View Stations",
  "stations.create": "Create Stations",
  "stations.edit": "Edit Stations",
  "stations.delete": "Delete Stations",
  "schedules.view": "View Schedules",
  "schedules.create": "Create Schedules",
  "schedules.edit": "Edit Schedules",
  "schedules.delete": "Delete Schedules",
  "users.view": "View Users",
  "users.edit_role": "Change User Roles",
  "users.delete": "Delete Users",
  "activity_logs.view": "View Activity Logs",
  "dashboard.view": "View Dashboard",
  "dashboard.export": "Export Reports (CSV/PDF)",
  "map.view": "View Station Map",
  "settings.view": "View Settings",
  "settings.edit": "Change Settings",
};

export const PERMISSION_GROUPS = [
  { group: "Dashboard", permissions: ["dashboard.view", "dashboard.export"] as Permission[] },
  { group: "Stations", permissions: ["stations.view", "stations.create", "stations.edit", "stations.delete"] as Permission[] },
  { group: "Schedules", permissions: ["schedules.view", "schedules.create", "schedules.edit", "schedules.delete"] as Permission[] },
  { group: "Users", permissions: ["users.view", "users.edit_role", "users.delete"] as Permission[] },
  { group: "Activity Logs", permissions: ["activity_logs.view"] as Permission[] },
  { group: "Map", permissions: ["map.view"] as Permission[] },
  { group: "Settings", permissions: ["settings.view", "settings.edit"] as Permission[] },
];
