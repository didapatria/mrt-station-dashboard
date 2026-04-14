import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Train } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { useStations } from "@/hooks/use-stations";
import { useSchedules } from "@/hooks/use-schedules";

export default function RoutePlannerPage() {
  const { t } = useTranslation();
  const { data: stationsData } = useStations({ limit: 100 });
  const stations = stationsData?.stations ?? [];
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  const { data: schedulesData } = useSchedules({ limit: 200 });
  const allSchedules = schedulesData?.schedules ?? [];

  const results = useMemo(() => {
    if (!fromId || !toId || fromId === toId) return [];
    return allSchedules.filter(
      (s) => s.departureStationId === fromId && s.arrivalStationId === toId
    );
  }, [fromId, toId, allSchedules]);

  const fromStation = stations.find((s) => s.id === fromId);
  const toStation = stations.find((s) => s.id === toId);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Route Planner</h2>
        <p className="text-muted-foreground">Find available schedules between stations</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t("schedules.departureStation")}</p>
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>{stations.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-5" />
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{t("schedules.arrivalStation")}</p>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>{stations.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {fromId && toId && fromId !== toId && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                <Train className="h-4 w-4" />
                {fromStation?.code} → {toStation?.code} ({results.length} schedules)
              </CardTitle>
            </CardHeader>
            <Separator />
            {results.length === 0 ? (
              <EmptyState icon={Clock} title="No direct routes" description={`No direct schedules from ${fromStation?.name} to ${toStation?.name}.`} />
            ) : (
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t("schedules.trainNumber")}</TableHead>
                      <TableHead>{t("schedules.departureTime")}</TableHead>
                      <TableHead>{t("schedules.arrivalTime")}</TableHead>
                      <TableHead>{t("schedules.dayType")}</TableHead>
                      <TableHead>{t("stations.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.sort((a, b) => a.departureTime.localeCompare(b.departureTime)).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono font-medium">{s.trainNumber}</TableCell>
                        <TableCell className="font-mono">{s.departureTime}</TableCell>
                        <TableCell className="font-mono">{s.arrivalTime}</TableCell>
                        <TableCell><Badge variant="secondary">{s.dayType}</Badge></TableCell>
                        <TableCell><Badge variant={s.status === "ACTIVE" ? "success" : s.status === "DELAYED" ? "warning" : "destructive"}>{s.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        )}
      </motion.div>
    </div>
  );
}
