export type Permission = string;

export const PERMISSION_LABELS: Record<string, string> = {
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
  { group: "Dashboard", permissions: ["dashboard.view", "dashboard.export"] },
  {
    group: "Stations",
    permissions: [
      "stations.view",
      "stations.create",
      "stations.edit",
      "stations.delete",
    ],
  },
  {
    group: "Schedules",
    permissions: [
      "schedules.view",
      "schedules.create",
      "schedules.edit",
      "schedules.delete",
    ],
  },
  {
    group: "Users",
    permissions: ["users.view", "users.edit_role", "users.delete"],
  },
  { group: "Activity Logs", permissions: ["activity_logs.view"] },
  { group: "Map", permissions: ["map.view"] },
  { group: "Settings", permissions: ["settings.view", "settings.edit"] },
];
