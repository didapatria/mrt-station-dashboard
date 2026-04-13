import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  TrainFront,
  AlertTriangle,
  Users,
  Download,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStationStore } from "@/store/station.store";
import { useScheduleStore } from "@/store/schedule.store";
import {
  dashboardService,
  type DashboardStats,
  type HourlySchedule,
} from "@/services/dashboard.service";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { stations, fetchStations } = useStationStore();
  const { schedules, fetchSchedules } = useScheduleStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, hourlyRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getSchedulesByHour(),
          fetchStations({ limit: 100 }),
          fetchSchedules({ limit: 10 }),
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (hourlyRes.success && hourlyRes.data) setHourlyData(hourlyRes.data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchStations, fetchSchedules]);

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

  const maxHourly = Math.max(...hourlyData.map((d) => d.count), 1);

  const statCards = stats
    ? [
        {
          title: "Total Stations",
          value: stats.totalStations,
          icon: MapPin,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          title: "Active Stations",
          value: stats.activeStations,
          icon: TrainFront,
          color: "text-success",
          bg: "bg-success/10",
        },
        {
          title: "Active Schedules",
          value: stats.activeSchedules,
          icon: Clock,
          color: "text-info",
          bg: "bg-info/10",
        },
        {
          title: "Delayed / Maintenance",
          value: stats.delayedSchedules + stats.maintenanceStations,
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
        },
        {
          title: "Total Schedules",
          value: stats.totalSchedules,
          icon: BarChart3,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          title: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "text-info",
          bg: "bg-info/10",
        },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of MRT Jakarta station operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportStations}>
            <Download className="h-4 w-4 mr-2" />
            Export Stations
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSchedules}>
            <Download className="h-4 w-4 mr-2" />
            Export Schedules
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
                  <Skeleton className="h-12 w-12 rounded-lg" />
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
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.bg} p-3 rounded-lg`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Hourly Schedule Chart */}
      {hourlyData.length > 0 && (
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">
                Weekday Schedule Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40">
                {hourlyData.map((d) => (
                  <div
                    key={d.hour}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-xs text-muted-foreground">
                      {d.count || ""}
                    </span>
                    <div
                      className="w-full bg-primary/80 rounded-t-sm transition-all min-h-[2px]"
                      style={{
                        height: `${(d.count / maxHourly) * 100}%`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground -rotate-45">
                      {d.hour.replace(":00", "")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Station & Schedule Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} initial="hidden" animate="show">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stations.slice(0, 8).map((station) => (
                  <div
                    key={station.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {station.code}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{station.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {station.location}
                        </p>
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules.slice(0, 8).map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {schedule.trainNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.departureStation?.name} →{" "}
                        {schedule.arrivalStation?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">
                        {schedule.departureTime} - {schedule.arrivalTime}
                      </p>
                      <Badge
                        variant={
                          schedule.status === "ACTIVE"
                            ? "success"
                            : schedule.status === "DELAYED"
                              ? "warning"
                              : "destructive"
                        }
                        className="mt-1"
                      >
                        {schedule.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
