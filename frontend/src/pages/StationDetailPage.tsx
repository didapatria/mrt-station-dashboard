import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Navigation, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    return <p className="text-muted-foreground">Station not found.</p>;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/stations")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("stations.title")}
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <button
                    className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary hover:bg-primary/20 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(station.code);
                      toast.success(`Copied: ${station.code}`);
                    }}
                  >
                    {station.code}
                  </button>
                  <div>
                    <CardTitle className="text-xl">{station.name}</CardTitle>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "0.25rem",
                      }}
                    >
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
                      <span className="text-sm text-muted-foreground">
                        {t("stations.order")}: {station.order}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-3">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  className="text-sm"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {station.location}
                </div>
                {station.latitude && station.longitude && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    className="text-sm"
                  >
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">
                      {station.latitude.toFixed(6)},{" "}
                      {station.longitude.toFixed(6)}
                    </span>
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${station.latitude}, ${station.longitude}`,
                        );
                        toast.success("Coordinates copied");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedules at this station */}
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-lg"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Clock className="h-4 w-4" />
                  {t("schedules.title")} ({schedules.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t("schedules.trainNumber")}</TableHead>
                      <TableHead>{t("schedules.route")}</TableHead>
                      <TableHead>{t("schedules.time")}</TableHead>
                      <TableHead>{t("stations.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-8"
                        >
                          No schedules
                        </TableCell>
                      </TableRow>
                    ) : (
                      schedules.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono font-medium">
                            {s.trainNumber}
                          </TableCell>
                          <TableCell>
                            {s.departureStation?.code} →{" "}
                            {s.arrivalStation?.code}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {s.departureTime} — {s.arrivalTime}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                s.status === "ACTIVE"
                                  ? "success"
                                  : s.status === "DELAYED"
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Map */}
          <div>
            {station.latitude && station.longitude && (
              <Card className="overflow-hidden">
                <div className="h-64">
                  <StationMap
                    stations={[station]}
                    selectedStationId={station.id}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
