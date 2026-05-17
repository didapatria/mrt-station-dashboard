import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  TrainFront,
  AlertTriangle,
  Users,
  Download,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStations } from "@/hooks/use-stations";
import { useSchedules } from "@/hooks/use-schedules";
import { useDashboardStats, useSchedulesByHour } from "@/hooks/use-dashboard";
import { dashboardService } from "@/services/dashboard.service";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { exportDashboardPDF } from "@/lib/export-pdf";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const { data: stationsData } = useStations({ limit: 100 });
  const { data: schedulesData } = useSchedules({ limit: 10 });
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: hourlyData = [] } = useSchedulesByHour();

  const stations = stationsData?.stations ?? [];
  const schedules = schedulesData?.schedules ?? [];
  const isLoading = statsLoading;

  const handleExportStations = async () => {
    try {
      await dashboardService.exportStationsCSV();
      toast.success("Stations exported successfully");
    } catch {
      toast.error("Failed to export stations");
    }
  };

  const handleExportSchedules = async () => {
    try {
      await dashboardService.exportSchedulesCSV();
      toast.success("Schedules exported successfully");
    } catch {
      toast.error("Failed to export schedules");
    }
  };

  const statCards = stats
    ? [
        {
          title: t("dashboard.totalStations"),
          value: stats.totalStations,
          icon: MapPin,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-950",
        },
        {
          title: t("dashboard.activeStations"),
          value: stats.activeStations,
          icon: TrainFront,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-100 dark:bg-emerald-950",
        },
        {
          title: t("dashboard.totalUsers"),
          value: stats.totalUsers,
          icon: Users,
          color: "text-cyan-600 dark:text-cyan-400",
          bg: "bg-cyan-100 dark:bg-cyan-950",
        },
        {
          title: t("dashboard.activeSchedules"),
          value: stats.activeSchedules,
          icon: Clock,
          color: "text-violet-600 dark:text-violet-400",
          bg: "bg-violet-100 dark:bg-violet-950",
        },
        {
          title: t("dashboard.delayedMaintenance"),
          value: stats.delayedSchedules + stats.maintenanceStations,
          icon: AlertTriangle,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-100 dark:bg-amber-950",
        },
        {
          title: t("dashboard.totalSchedules"),
          value: stats.totalSchedules,
          icon: BarChart3,
          color: "text-pink-600 dark:text-pink-400",
          bg: "bg-pink-100 dark:bg-pink-950",
        },
      ]
    : [];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="mb-6 rounded-xl overflow-hidden relative"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0a1628 0%, #0d2248 40%, #0a1a3a 100%)"
            : "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)",
          boxShadow: isDark
            ? "0 4px 24px rgba(10, 22, 40, 0.4)"
            : "0 4px 20px rgba(29, 78, 216, 0.25)",
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glowing accent */}
        <div
          className="absolute right-0 top-0 w-64 h-full pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at right center, rgba(59,130,246,0.18) 0%, transparent 70%)"
              : "radial-gradient(ellipse at right center, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="relative p-6"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "rgba(186, 230, 253, 0.8)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Operations Center
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: 28,
                color: "white",
                lineHeight: 1.1,
                letterSpacing: "0.01em",
              }}
            >
              {greeting.toUpperCase()},{" "}
              {user?.name?.split(" ")[0]?.toUpperCase()}
            </h2>
            <p
              style={{
                color: "rgba(219, 234, 254, 0.75)",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {t("dashboard.subtitle")}
            </p>
          </div>
          {stats && (
            <div className="hidden sm:flex gap-8 text-right">
              <div>
                <p
                  className="font-display"
                  style={{ fontSize: 36, color: "white", lineHeight: 1 }}
                >
                  {stats.totalStations}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(219, 234, 254, 0.65)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {t("dashboard.totalStations")}
                </p>
              </div>
              <div>
                <p
                  className="font-display"
                  style={{
                    fontSize: 36,
                    color: isDark ? "#60a5fa" : "#bfdbfe",
                    lineHeight: 1,
                  }}
                >
                  {stats.activeSchedules}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(219, 234, 254, 0.65)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {t("dashboard.activeSchedules")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl tracking-tight">
            {t("dashboard.title")}
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDashboardPDF(stats, stations, schedules)}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF Report
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportStations}>
            <Download className="h-4 w-4 mr-2" />
            {t("dashboard.exportStations")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSchedules}>
            <Download className="h-4 w-4 mr-2" />
            {t("dashboard.exportSchedules")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8"
        >
          {statCards.map((stat) => (
            <motion.div key={stat.title} variants={item}>
              <Card className="hover:shadow-md transition-all duration-200 overflow-hidden group hover:-translate-y-0.5">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Left accent bar */}
                    <div className={`w-1 shrink-0 ${stat.bg} opacity-80`} />
                    <div className="flex items-center justify-between flex-1 p-5">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {stat.title}
                        </p>
                        <p
                          className="font-display mt-1"
                          style={{
                            fontSize: 40,
                            lineHeight: 1,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`${stat.bg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200`}
                      >
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pie Charts */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-xl tracking-wide">
                {t("dashboard.totalStations")} Breakdown
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Active", value: stats.activeStations },
                      { name: "Maintenance", value: stats.maintenanceStations },
                      { name: "Inactive", value: stats.inactiveStations },
                    ].filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-xl tracking-wide">
                {t("dashboard.totalSchedules")} Breakdown
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Active", value: stats.activeSchedules },
                      { name: "Delayed", value: stats.delayedSchedules },
                      { name: "Cancelled", value: stats.cancelledSchedules },
                    ].filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hourly Schedule Chart with Recharts */}
      {hourlyData.length > 0 && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="mb-8 shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-xl tracking-wide">
                    {t("dashboard.weekdayDistribution")}
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.schedulesPerHour")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {hourlyData.reduce((a, b) => a + b.count, 0)} total
                  </span>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={hourlyData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(v) => v.replace(":00", "")}
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelFormatter={(v) => `${v}`}
                    formatter={(value) => [`${value} schedules`, "Count"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(0.505 0.155 246.87)"
                    radius={[6, 6, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Station & Schedule Data */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Tabs defaultValue="stations">
          <TabsList className="mb-4">
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="schedules">Recent Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="stations">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-15">Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stations.slice(0, 10).map((station) => (
                        <TableRow
                          key={station.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {station.code}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {station.name}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {station.location}
                          </TableCell>
                          <TableCell className="text-right">
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Train</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Time
                        </TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.slice(0, 10).map((schedule) => (
                        <TableRow
                          key={schedule.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="font-medium font-mono">
                            {schedule.trainNumber}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {schedule.departureStation?.name} →{" "}
                              {schedule.arrivalStation?.name}
                            </p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                            {schedule.departureTime} — {schedule.arrivalTime}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                schedule.status === "ACTIVE"
                                  ? "success"
                                  : schedule.status === "DELAYED"
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              {schedule.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
