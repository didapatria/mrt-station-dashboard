import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { ArrowRight, Clock, Train } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePageMeta } from "@/hooks/use-page-meta";

const statusLED = (status: string) => {
  if (status === "ACTIVE")
    return { color: "#22c55e", shadow: "0 0 6px 2px rgba(34,197,94,0.4)" };
  if (status === "DELAYED")
    return { color: "#f59e0b", shadow: "0 0 6px 2px rgba(245,158,11,0.4)" };
  return { color: "#ef4444", shadow: "0 0 6px 2px rgba(239,68,68,0.4)" };
};

export default function RoutePlannerPage() {
  usePageMeta({ title: "Route Planner", path: "/route-planner" });
  const { t } = useTranslation();
  const { data: stationsData } = useStations({ limit: 100 });
  const stations = useMemo(() => stationsData?.stations ?? [], [stationsData]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  const { data: schedulesData } = useSchedules({ limit: 200 });

  const results = useMemo(() => {
    const allSchedules = schedulesData?.schedules ?? [];
    if (!fromId || !toId || fromId === toId) return [];
    return allSchedules.filter(
      (s) => s.departureStationId === fromId && s.arrivalStationId === toId,
    );
  }, [fromId, toId, schedulesData]);

  const fromStation = stations.find((s) => s.id === fromId);
  const toStation = stations.find((s) => s.id === toId);

  return (
    <div>
      <PageHeader
        title="ROUTE PLANNER"
        subtitle="Find available schedules between stations"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Terminal-style form card */}
        <div className="ops-card mb-6">
          <div className="ops-accent-line" />
          <div className="ops-card-header">
            <div className="flex items-center gap-2">
              <Train size={14} className="text-muted-foreground" />
              <p className="ops-card-title m-0">PLAN YOUR ROUTE</p>
            </div>
            <p className="ops-card-subtitle mt-1">
              Select origin and destination
            </p>
          </div>

          <div className="p-[20px_24px] bg-black/4">
            <div className="flex flex-row items-end gap-4 flex-wrap">
              {/* FROM */}
              <div className="flex-1 min-w-50">
                <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <span className="bg-[rgba(29,111,232,0.12)] border border-[rgba(29,111,232,0.2)] rounded-[3px] px-1.5 py-px text-[#60a5fa] text-[9px]">
                    FROM
                  </span>
                  {t("schedules.departureStation")}
                </div>
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Animated dotted connector */}
              <div className="flex items-center justify-center pt-1 pb-2.5 shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-px h-1 bg-[rgba(59,130,246,0.4)] rounded-[1px]"
                    />
                  ))}
                  <div className="text-[#3b82f6] text-[10px] leading-none">
                    ▼
                  </div>
                </div>
              </div>

              {/* TO */}
              <div className="flex-1 min-w-50">
                <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <span className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-[3px] px-1.5 py-px text-[#22c55e] text-[9px]">
                    TO
                  </span>
                  {t("schedules.arrivalStation")}
                </div>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrival station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Route preview when both selected */}
            {fromStation && toStation && fromId !== toId && (
              <div className="mt-4 p-[10px_16px] bg-[rgba(29,111,232,0.06)] border border-[rgba(29,111,232,0.15)] rounded-lg flex items-center gap-2.5">
                <span className="font-display text-[14px] tracking-widest text-[#60a5fa]">
                  {fromStation.code}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ——————————————
                </span>
                <ArrowRight size={12} className="text-primary" />
                <span className="font-mono text-[10px] text-muted-foreground">
                  ——————————————
                </span>
                <span className="font-display text-[14px] tracking-widest text-[#22c55e]">
                  {toStation.code}
                </span>
                <span className="ml-auto font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                  {results.length} SCHEDULES
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {fromId && toId && fromId !== toId && (
          <div className="ops-card">
            <div className="ops-accent-line" />
            <div className="ops-card-header">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-muted-foreground" />
                <p className="ops-card-title m-0 flex items-center gap-1.5">
                  <span>{fromStation?.code}</span>
                  <span className="text-[#3b82f6] font-mono text-[13px]">
                    →
                  </span>
                  <span>{toStation?.code}</span>
                </p>
                <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground bg-muted rounded-lg px-1.75 py-0.5">
                  {results.length}
                </span>
              </div>
              <p className="ops-card-subtitle mt-1">Direct schedule results</p>
            </div>

            {results.length === 0 ? (
              <div className="p-[60px_24px] flex flex-col items-center gap-2.5">
                <Clock size={32} className="text-muted-foreground opacity-40" />
                <p className="font-display text-[22px] tracking-[0.08em] text-muted-foreground m-0">
                  NO ROUTES FOUND
                </p>
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase m-0 text-center">
                  No direct schedules from {fromStation?.name} to{" "}
                  {toStation?.name}
                </p>
              </div>
            ) : (
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
                      {t("schedules.departureTime")}
                    </TableHead>
                    <TableHead className="ops-table-head">
                      {t("schedules.arrivalTime")}
                    </TableHead>
                    <TableHead className="ops-table-head">
                      {t("schedules.dayType")}
                    </TableHead>
                    <TableHead className="ops-table-head">
                      {t("stations.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results
                    .sort((a, b) =>
                      a.departureTime.localeCompare(b.departureTime),
                    )
                    .map((s) => {
                      const led = statusLED(s.status);
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="ops-mono-data text-[12px] font-semibold">
                            {s.trainNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="ops-station-ref">
                                {fromStation?.name}
                              </span>
                              <span className="text-[#3b82f6] mx-1.5 font-mono">
                                →
                              </span>
                              <span className="ops-station-ref">
                                {toStation?.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="ops-mono-data">
                            {s.departureTime}
                          </TableCell>
                          <TableCell className="ops-mono-data">
                            {s.arrivalTime}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{s.dayType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-1.75 h-1.75 rounded-full shrink-0"
                                style={{
                                  background: led.color,
                                  boxShadow: led.shadow,
                                }}
                              />
                              <span className="ops-mono-data text-[10px] tracking-[0.08em]">
                                {s.status}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
