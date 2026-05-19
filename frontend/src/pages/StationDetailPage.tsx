import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, Copy, Clock } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StationMap } from "@/components/StationMap";
import { useStation } from "@/hooks/use-stations";
import { useSchedules } from "@/hooks/use-schedules";

const statusLED = (status: string) => {
  if (status === "ACTIVE")
    return { color: "#22c55e", shadow: "0 0 6px 2px rgba(34,197,94,0.4)" };
  if (status === "MAINTENANCE")
    return { color: "#f59e0b", shadow: "0 0 6px 2px rgba(245,158,11,0.4)" };
  return { color: "#ef4444", shadow: "0 0 6px 2px rgba(239,68,68,0.4)" };
};

const scheduleStatusLED = (status: string) => {
  if (status === "ACTIVE")
    return { color: "#22c55e", shadow: "0 0 6px 2px rgba(34,197,94,0.4)" };
  if (status === "DELAYED")
    return { color: "#f59e0b", shadow: "0 0 6px 2px rgba(245,158,11,0.4)" };
  return { color: "#ef4444", shadow: "0 0 6px 2px rgba(239,68,68,0.4)" };
};

function StatCard({ children }: { children: React.ReactNode }) {
  return <div className="ops-stat-card">{children}</div>;
}

export default function StationDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: station, isLoading } = useStation(id || "");
  const { data: schedulesData } = useSchedules({ stationId: id, limit: 50 });
  const schedules = schedulesData?.schedules ?? [];

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  if (!station)
    return (
      <p className="font-['Sora',sans-serif] text-muted-foreground">
        Station not found.
      </p>
    );

  const led = statusLED(station.status);

  return (
    <div>
      <button onClick={() => navigate("/stations")} className="ops-back-btn">
        <ArrowLeft size={14} />
        {t("stations.title")}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Page header */}
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="font-display text-[40px] tracking-[0.04em] leading-none text-foreground m-0">
              {station.name}
            </h1>
            <span className="bg-[rgba(29,111,232,0.12)] border border-[rgba(29,111,232,0.2)] rounded-lg px-3 py-1 font-display text-[16px] tracking-widest text-[#60a5fa] inline-block shadow-[0_0_12px_rgba(29,111,232,0.25)]">
              {station.code}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-1.75 h-1.75 rounded-full shrink-0"
              style={{ background: led.color, boxShadow: led.shadow }}
            />
            <span className="ops-mono-data text-[11px] tracking-widest">
              {station.status}
            </span>
          </div>
          <div className="ops-divider mt-3 mb-7" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main */}
          <div className="flex flex-col gap-6">
            {/* Info card */}
            <div className="ops-card">
              <div className="ops-accent-line" />
              <div className="ops-card-header">
                <p className="ops-card-title text-[16px]">STATION INFO</p>
                <p className="ops-card-subtitle">
                  Station details &amp; metadata
                </p>
              </div>
              <div
                className="p-[20px_24px] grid gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                }}
              >
                <StatCard>
                  <p className="ops-stat-label">
                    {t("stations.order").toUpperCase()}
                  </p>
                  <p className="ops-stat-value">
                    {String(station.order).padStart(2, "0")}
                  </p>
                </StatCard>

                <StatCard>
                  <p className="ops-stat-label">LOCATION</p>
                  <div className="flex items-start gap-1.5">
                    <MapPin
                      size={13}
                      className="text-muted-foreground mt-0.5 shrink-0"
                    />
                    <p className="font-['Sora',sans-serif] text-[13px] text-foreground m-0 leading-[1.4]">
                      {station.location}
                    </p>
                  </div>
                </StatCard>

                <StatCard>
                  <p className="ops-stat-label">
                    {t("stations.status").toUpperCase()}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.75 h-1.75 rounded-full shrink-0"
                      style={{ background: led.color, boxShadow: led.shadow }}
                    />
                    <span className="ops-mono-data text-[12px] tracking-[0.08em] text-foreground">
                      {station.status}
                    </span>
                  </div>
                </StatCard>

                {station.latitude && station.longitude && (
                  <StatCard>
                    <p className="ops-stat-label mb-2">COORDINATES</p>
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="ops-coord-axis">LAT</span>
                        <span className="ops-mono-data text-[11px]">
                          {station.latitude.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="ops-coord-axis">LNG</span>
                        <span className="ops-mono-data text-[11px]">
                          {station.longitude.toFixed(6)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${station.latitude}, ${station.longitude}`,
                        );
                        toast.success("Coordinates copied");
                      }}
                      className="ops-copy-btn"
                    >
                      <Copy size={9} />
                      COPY
                    </button>
                  </StatCard>
                )}
              </div>
            </div>

            {/* Schedules card */}
            <div className="ops-card">
              <div className="ops-accent-line" />
              <div className="ops-card-header">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <p className="ops-card-title text-[16px]">
                    {t("schedules.title")}
                  </p>
                  <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground bg-muted rounded-lg px-1.75 py-0.5">
                    {schedules.length}
                  </span>
                </div>
                <p className="ops-card-subtitle">
                  Train schedules at this station
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="ops-table-head">
                      {t("schedules.trainNumber")}
                    </TableHead>
                    <TableHead className="ops-table-head">
                      {t("schedules.route")}
                    </TableHead>
                    <TableHead className="ops-table-head">
                      {t("schedules.time")}
                    </TableHead>
                    <TableHead className="ops-table-head">
                      {t("stations.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="ops-mono-data text-center py-8 text-[11px] tracking-[0.08em]"
                      >
                        NO SCHEDULES FOUND
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((s) => {
                      const sled = scheduleStatusLED(s.status);
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="ops-mono-data text-[12px] font-semibold">
                            {s.trainNumber}
                          </TableCell>
                          <TableCell className="ops-mono-data text-[11px]">
                            {s.departureStation?.code} →{" "}
                            {s.arrivalStation?.code}
                          </TableCell>
                          <TableCell className="ops-mono-data text-[11px]">
                            {s.departureTime} — {s.arrivalTime}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-1.75 h-1.75 rounded-full shrink-0"
                                style={{
                                  background: sled.color,
                                  boxShadow: sled.shadow,
                                }}
                              />
                              <span className="ops-mono-data text-[10px] tracking-[0.08em] text-foreground">
                                {s.status}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Sidebar Map */}
          <div>
            {station.latitude && station.longitude && (
              <div className="ops-card">
                <div className="ops-accent-line" />
                <div className="ops-card-header">
                  <p className="ops-card-title text-[16px]">MAP LOCATION</p>
                  <p className="ops-card-subtitle">
                    {station.latitude.toFixed(4)},{" "}
                    {station.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="h-64">
                  <StationMap
                    stations={[station]}
                    selectedStationId={station.id}
                  />
                </div>
                <div className="px-6 py-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(station.code);
                      toast.success(`Copied: ${station.code}`);
                    }}
                    className="w-full bg-[rgba(29,111,232,0.08)] border border-[rgba(29,111,232,0.2)] rounded-md py-2 px-4 cursor-pointer font-mono text-[11px] tracking-widest text-[#60a5fa] flex items-center justify-center gap-1.5"
                  >
                    <Navigation size={11} />
                    COPY STATION CODE — {station.code}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
