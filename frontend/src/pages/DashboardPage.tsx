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

        <div
          className="relative"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 32px",
            gap: 24,
          }}
        >
          {/* Left: greeting */}
          <div style={{ flex: 1, minWidth: 0 }}>
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
              {greeting},{" "}
              <span style={{ color: "#93c5fd" }}>{firstName}</span>
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
            <div
              className="hidden sm:flex"
              style={{ gap: 0, flexShrink: 0, alignSelf: "stretch" }}
            >
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            className="font-display"
            style={{ fontSize: 28, letterSpacing: "0.03em", lineHeight: 1 }}
          >
            {t("dashboard.title")}
          </h2>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              color: "var(--color-muted-foreground)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: 5,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px rgba(34,197,94,0.7)",
                  flexShrink: 0,
                }}
              />
              N–S Line · Real-time Overview
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {stats && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDashboardPDF(stats, stations, schedules)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              PDF
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStations}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("dashboard.exportStations")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSchedules}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
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
            <Skeleton key={i} className="h-28 rounded-none first:rounded-tl-xl last:rounded-br-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-px md:grid-cols-2 lg:grid-cols-3 mb-8"
          style={{
            background: "var(--color-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
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
                  borderRadius: isFirst ? "11px 0 0 0" : isLast ? "0 0 11px 0" : 0,
                  transition: "background 0.15s ease",
                }}
                whileHover={{ backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}
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
                <div style={{ paddingLeft: 14 }}>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      color: "var(--color-muted-foreground)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {stat.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 52,
                      lineHeight: 1,
                      letterSpacing: "0.02em",
                      color: "var(--color-foreground)",
                    }}
                  >
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
            <div
              key={title}
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
                  background: "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0.0) 100%)",
                  borderRadius: "12px 12px 0 0",
                }}
              />
              <div
                style={{
                  padding: "18px 24px 14px",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 18,
                    letterSpacing: "0.05em",
                    color: "var(--color-foreground)",
                  }}
                >
                  {title}
                </h3>
                <div style={{ display: "flex", gap: 12 }}>
                  {data.map((d, i) => (
                    <div
                      key={d.name}
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: colors[i],
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          color: "var(--color-muted-foreground)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {d.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "12px 0" }}>
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
          <div
            className="mb-8"
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
                background: "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0.0) 100%)",
                borderRadius: "12px 12px 0 0",
              }}
            />
            <div
              style={{
                padding: "18px 24px 14px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 18,
                    letterSpacing: "0.05em",
                    color: "var(--color-foreground)",
                    marginBottom: 2,
                  }}
                >
                  {t("dashboard.weekdayDistribution")}
                </h3>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    color: "var(--color-muted-foreground)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("dashboard.schedulesPerHour")}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--color-muted)",
                  borderRadius: 6,
                  padding: "5px 10px",
                }}
              >
                <TrendingUp
                  style={{ width: 12, height: 12, color: "var(--color-muted-foreground)" }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10.5,
                    color: "var(--color-muted-foreground)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {hourlyData.reduce((a, b) => a + b.count, 0)} total
                </span>
              </div>
            </div>
            <div style={{ padding: "20px 16px 12px 8px" }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={hourlyData}
                  margin={{ top: 4, right: 8, left: -22, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(v) => v.replace(":00", "h")}
                    tick={{
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      fill: isDark ? "rgba(148,163,184,0.6)" : "rgba(71,85,105,0.7)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      fill: isDark ? "rgba(148,163,184,0.6)" : "rgba(71,85,105,0.7)",
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
                      fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <TabsList>
              <TabsTrigger value="stations">
                <MapPin style={{ width: 13, height: 13, marginRight: 6 }} />
                Stations
              </TabsTrigger>
              <TabsTrigger value="schedules">
                <Clock style={{ width: 13, height: 13, marginRight: 6 }} />
                Schedules
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stations">
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
                  background: "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0.0) 100%)",
                  borderRadius: "12px 12px 0 0",
                }}
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <TableHead
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                          padding: "12px 16px",
                        }}
                      >
                        Code
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
                        Name
                      </TableHead>
                      <TableHead
                        className="hidden sm:table-cell"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        Location
                      </TableHead>
                      <TableHead
                        style={{
                          textAlign: "right",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--color-muted-foreground)",
                          padding: "12px 16px",
                        }}
                      >
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stations.slice(0, 10).map((station) => (
                      <TableRow key={station.id} className="hover:bg-muted/30">
                        <TableCell style={{ padding: "12px 16px" }}>
                          <div
                            style={{
                              height: 30,
                              width: 30,
                              borderRadius: 6,
                              background: "color-mix(in oklch, var(--color-primary) 10%, transparent)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--color-primary)",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {station.code}
                          </div>
                        </TableCell>
                        <TableCell
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: 13.5,
                            fontWeight: 500,
                          }}
                        >
                          {station.name}
                        </TableCell>
                        <TableCell
                          className="hidden sm:table-cell"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                            color: "var(--color-muted-foreground)",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {station.location}
                        </TableCell>
                        <TableCell style={{ textAlign: "right", padding: "12px 16px" }}>
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
                  background: "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0.0) 100%)",
                  borderRadius: "12px 12px 0 0",
                }}
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {["Train", "Route", "Time", "Status"].map((h, i) => (
                        <TableHead
                          key={h}
                          className={i === 2 ? "hidden sm:table-cell" : ""}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 9.5,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--color-muted-foreground)",
                            padding: i === 0 || i === 3 ? "12px 16px" : undefined,
                            textAlign: i === 3 ? "right" : undefined,
                          }}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.slice(0, 10).map((schedule) => (
                      <TableRow key={schedule.id} className="hover:bg-muted/30">
                        <TableCell
                          style={{
                            padding: "12px 16px",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {schedule.trainNumber}
                        </TableCell>
                        <TableCell
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: "var(--color-foreground)" }}>
                            {schedule.departureStation?.name}
                          </span>
                          <span
                            style={{
                              color: "var(--color-muted-foreground)",
                              margin: "0 6px",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 11,
                            }}
                          >
                            →
                          </span>
                          <span style={{ color: "var(--color-foreground)" }}>
                            {schedule.arrivalStation?.name}
                          </span>
                        </TableCell>
                        <TableCell
                          className="hidden sm:table-cell"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                            color: "var(--color-muted-foreground)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {schedule.departureTime}
                          <span style={{ margin: "0 4px", opacity: 0.4 }}>—</span>
                          {schedule.arrivalTime}
                        </TableCell>
                        <TableCell style={{ textAlign: "right", padding: "12px 16px" }}>
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
