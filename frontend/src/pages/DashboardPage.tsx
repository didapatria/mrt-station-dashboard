import { useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, TrainFront, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStationStore } from "@/store/station.store";
import { useScheduleStore } from "@/store/schedule.store";

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

  useEffect(() => {
    fetchStations({ limit: 100 });
    fetchSchedules({ limit: 100 });
  }, [fetchStations, fetchSchedules]);

  const activeStations = stations.filter((s) => s.status === "ACTIVE").length;
  const maintenanceStations = stations.filter((s) => s.status === "MAINTENANCE").length;
  const activeSchedules = schedules.filter((s) => s.status === "ACTIVE").length;
  const delayedSchedules = schedules.filter((s) => s.status === "DELAYED").length;

  const stats = [
    {
      title: "Total Stations",
      value: stations.length,
      icon: MapPin,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Stations",
      value: activeStations,
      icon: TrainFront,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Active Schedules",
      value: activeSchedules,
      icon: Clock,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "Delayed / Maintenance",
      value: delayedSchedules + maintenanceStations,
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of MRT Jakarta station operations
        </p>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
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

      {/* Recent Stations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} initial="hidden" animate="show">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stations.slice(0, 6).map((station) => (
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
                {schedules.slice(0, 6).map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {schedule.trainNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.departureStation?.name} → {schedule.arrivalStation?.name}
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
