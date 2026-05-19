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
  FileText,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { usePageMeta } from "@/hooks/use-page-meta";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const ACCENT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
];

export default function DashboardPage() {
  usePageMeta({ title: "Dashboard", path: "/dashboard" });
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
          accent: ACCENT_COLORS[0],
        },
        {
          title: t("dashboard.activeStations"),
          value: stats.activeStations,
          icon: TrainFront,
          accent: ACCENT_COLORS[1],
        },
        {
          title: t("dashboard.totalUsers"),
          value: stats.totalUsers,
          icon: Users,
          accent: ACCENT_COLORS[2],
        },
        {
          title: t("dashboard.activeSchedules"),
          value: stats.activeSchedules,
          icon: Clock,
          accent: ACCENT_COLORS[3],
        },
        {
          title: t("dashboard.delayedMaintenance"),
          value: stats.delayedSchedules + stats.maintenanceStations,
          icon: AlertTriangle,
          accent: ACCENT_COLORS[4],
        },
        {
          title: t("dashboard.totalSchedules"),
          value: stats.totalSchedules,
          icon: BarChart3,
          accent: ACCENT_COLORS[5],
        },
      ]
    : [];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const firstName = user?.name?.split(" ")[0]?.toUpperCase() ?? "";

  const tooltipStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    borderRadius: 6,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
  };

  return (
    <div>
      {/* Pulse bar keyframe */}
      <style>{`
        @keyframes pulse-bar { 0%, 100% { opacity: 0.85; } 50% { opacity: 0.5; } }
      `}</style>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8 relative overflow-hidden rounded-xl"
        style={{
          background: isDark
            ? "linear-gradient(125deg, #050d1a 0%, #091a35 55%, #0a1628 100%)"
            : "linear-gradient(125deg, #0f2057 0%, #1d4ed8 55%, #2563eb 100%)",
          minHeight: 160,
        }}
      >
        {/* Dot matrix background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: isDark ? 0.08 : 0.12,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />
        {/* Secondary pattern: diagonal lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: isDark ? 0.03 : 0.04,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 24px)",
          }}
        />
        {/* Right glow */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "40%",
            background: isDark
              ? "radial-gradient(ellipse at right, rgba(59,130,246,0.14) 0%, transparent 70%)"
              : "radial-gradient(ellipse at right, rgba(255,255,255,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Bottom edge line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.1) 100%)",
          }}
        />

        <div className="relative flex flex-row items-center justify-between px-8 py-7 gap-6">
          {/* Left: greeting */}
          <div className="flex-1 min-w-0">
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9.5,
                letterSpacing: "0.2em",
                color: "rgba(186,230,253,0.65)",
                textTransform: "uppercase",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px rgba(34,197,94,0.8)",
                }}
              />
              Operations Center · Live
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(28px, 3.5vw, 44px)",
                color: "white",
                lineHeight: 1,
                letterSpacing: "0.03em",
                marginBottom: 8,
              }}
            >
              {greeting}, <span style={{ color: "#93c5fd" }}>{firstName}</span>
            </div>
            <p
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 12.5,
                color: "rgba(219,234,254,0.6)",
                lineHeight: 1.5,
                maxWidth: 380,
              }}
            >
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Right: big inline stats */}
          {stats && (
            <div className="hidden sm:flex gap-0 shrink-0 self-stretch">
              {[
                {
                  n: stats.totalStations,
                  label: t("dashboard.totalStations"),
                  color: "#93c5fd",
                },
                {
                  n: stats.activeSchedules,
                  label: t("dashboard.activeSchedules"),
                  color: "white",
                },
              ].map(({ n, label, color }, i) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "right",
                    padding: "0 28px",
                    borderLeft:
                      i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 52,
                      color,
                      lineHeight: 1,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8.5,
                      color: "rgba(186,230,253,0.5)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      marginTop: 3,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Page header + export actions ── */}
      <div className="flex flex-row items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h2 className="font-display text-[28px] tracking-[0.03em] leading-none">
            {t("dashboard.title")}
          </h2>
          <p className="font-mono text-[10.5px] text-muted-foreground tracking-widest uppercase mt-1.25">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.25 h-1.25 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.7)] shrink-0" />
              N–S Line · Real-time Overview
            </span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {stats && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDashboardPDF(stats, stations, schedules)}
              className="ops-btn-mono"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              PDF
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStations}
            className="ops-btn-mono"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("dashboard.exportStations")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSchedules}
            className="ops-btn-mono"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("dashboard.exportSchedules")}
          </Button>
        </div>
      </div>

      {/* ── Stat blocks ── */}
      {statsLoading ? (
        <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-28 rounded-none first:rounded-tl-xl last:rounded-br-xl"
            />
          ))}
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-px md:grid-cols-2 lg:grid-cols-3 mb-8 bg-border rounded-xl overflow-hidden"
        >
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            const isFirst = idx === 0;
            const isLast = idx === statCards.length - 1;
            return (
              <motion.div
                key={stat.title}
                variants={fadeUp}
                style={{
                  background: "var(--color-card)",
                  position: "relative",
                  padding: "22px 24px",
                  overflow: "hidden",
                  cursor: "default",
                  borderRadius: isFirst
                    ? "11px 0 0 0"
                    : isLast
                      ? "0 0 11px 0"
                      : 0,
                  transition: "background 0.15s ease",
                }}
                whileHover={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.01)",
                }}
              >
                {/* Left accent bar with pulse animation */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: stat.accent,
                    animation: "pulse-bar 3s ease-in-out infinite",
                  }}
                />
                {/* Ghost icon */}
                <Icon
                  style={{
                    position: "absolute",
                    right: 16,
                    bottom: 12,
                    width: 52,
                    height: 52,
                    opacity: isDark ? 0.05 : 0.07,
                    color: stat.accent,
                  }}
                />
                <div className="pl-3.5">
                  <p className="ops-table-head mb-1.5">{stat.title}</p>
                  <p className="font-display text-[52px] leading-none tracking-[0.02em]">
                    {stat.value}
                  </p>
                  {/* Accent underline */}
                  <div
                    style={{
                      height: 1.5,
                      width: 28,
                      background: stat.accent,
                      marginTop: 10,
                      opacity: 0.5,
                      borderRadius: 1,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Pie charts ── */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {[
            {
              title: `${t("dashboard.totalStations")} Breakdown`,
              data: [
                { name: "Active", value: stats.activeStations },
                { name: "Maintenance", value: stats.maintenanceStations },
                { name: "Inactive", value: stats.inactiveStations },
              ].filter((d) => d.value > 0),
              colors: ["#22c55e", "#f59e0b", "#ef4444"],
            },
            {
              title: `${t("dashboard.totalSchedules")} Breakdown`,
              data: [
                { name: "Active", value: stats.activeSchedules },
                { name: "Delayed", value: stats.delayedSchedules },
                { name: "Cancelled", value: stats.cancelledSchedules },
              ].filter((d) => d.value > 0),
              colors: ["#3b82f6", "#f59e0b", "#ef4444"],
            },
          ].map(({ title, data, colors }) => (
            <div key={title} className="ops-card">
              {/* Top accent gradient line */}
              <div className="ops-accent-line" />
              <div className="ops-card-header flex items-center justify-between">
                <h3 className="ops-card-title">{title}</h3>
                <div className="flex gap-3">
                  {data.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.25">
                      <div
                        className="w-[7px] h-[7px] rounded-full shrink-0"
                        style={{ background: colors[i] }}
                      />
                      <span className="font-mono text-[9.5px] text-muted-foreground tracking-[0.06em]">
                        {d.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="py-3">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {data.map((_, i) => (
                        <Cell key={i} fill={colors[i]} opacity={0.88} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{
                        color: isDark ? "#e2e8f0" : "#1e293b",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Hourly bar chart ── */}
      {hourlyData.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="ops-card mb-8">
            {/* Top accent gradient line */}
            <div className="ops-accent-line" />
            <div
              className="ops-card-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 className="ops-card-title mb-0.5">
                  {t("dashboard.weekdayDistribution")}
                </h3>
                <p className="ops-card-subtitle">
                  {t("dashboard.schedulesPerHour")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-[5px]">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.06em]">
                  {hourlyData.reduce((a, b) => a + b.count, 0)} total
                </span>
              </div>
            </div>
            <div className="pt-5 pr-4 pb-3 pl-2">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={hourlyData}
                  margin={{ top: 4, right: 8, left: -22, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke={
                      isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"
                    }
                    vertical={false}
                  />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(v) => v.replace(":00", "h")}
                    tick={{
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      fill: isDark
                        ? "rgba(148,163,184,0.6)"
                        : "rgba(71,85,105,0.7)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      fill: isDark
                        ? "rgba(148,163,184,0.6)"
                        : "rgba(71,85,105,0.7)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{
                      color: isDark ? "#e2e8f0" : "#1e293b",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                    }}
                    cursor={{
                      fill: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)",
                      radius: 4,
                    }}
                    labelFormatter={(v) => `${v}`}
                    formatter={(value) => [`${value} schedules`, "Count"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Station & Schedule tables ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Tabs defaultValue="stations">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="stations">
                <MapPin className="w-[13px] h-[13px] mr-1.5" />
                Stations
              </TabsTrigger>
              <TabsTrigger value="schedules">
                <Clock className="w-[13px] h-[13px] mr-1.5" />
                Schedules
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stations">
            <div className="ops-card">
              {/* Top accent gradient line */}
              <div className="ops-accent-line" />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="ops-table-head px-4 py-3">
                        Code
                      </TableHead>
                      <TableHead className="ops-table-head">Name</TableHead>
                      <TableHead className="ops-table-head hidden sm:table-cell">
                        Location
                      </TableHead>
                      <TableHead className="ops-table-head text-right px-4 py-3">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stations.slice(0, 10).map((station) => (
                      <TableRow key={station.id} className="hover:bg-muted/30">
                        <TableCell className="px-4 py-3">
                          <div className="h-[30px] w-[30px] rounded-md bg-primary/10 flex items-center justify-center font-mono text-[10px] font-bold text-primary tracking-[-0.02em]">
                            {station.code}
                          </div>
                        </TableCell>
                        <TableCell className="ops-user-name">
                          {station.name}
                        </TableCell>
                        <TableCell className="ops-mono-data hidden sm:table-cell">
                          {station.location}
                        </TableCell>
                        <TableCell className="text-right px-4 py-3">
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
            </div>
          </TabsContent>

          <TabsContent value="schedules">
            <div className="ops-card">
              {/* Top accent gradient line */}
              <div className="ops-accent-line" />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["Train", "Route", "Time", "Status"].map((h, i) => (
                        <TableHead
                          key={h}
                          className={[
                            "ops-table-head",
                            i === 0 || i === 3 ? "px-4 py-3" : "",
                            i === 2 ? "hidden sm:table-cell" : "",
                            i === 3 ? "text-right" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.slice(0, 10).map((schedule) => (
                      <TableRow key={schedule.id} className="hover:bg-muted/30">
                        <TableCell className="ops-train-cell px-4 py-3">
                          {schedule.trainNumber}
                        </TableCell>
                        <TableCell className="font-['Sora',sans-serif] text-[13px]">
                          <span>{schedule.departureStation?.name}</span>
                          <span className="text-muted-foreground mx-1.5 font-mono text-[11px]">
                            →
                          </span>
                          <span>{schedule.arrivalStation?.name}</span>
                        </TableCell>
                        <TableCell className="ops-mono-data hidden sm:table-cell">
                          {schedule.departureTime}
                          <span className="mx-1 opacity-40">—</span>
                          {schedule.arrivalTime}
                        </TableCell>
                        <TableCell className="text-right px-4 py-3">
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
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
