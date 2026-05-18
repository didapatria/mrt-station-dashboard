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
      <PageHeader title="ROUTE PLANNER" subtitle="Find available schedules between stations" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Terminal-style form card */}
        <div className="ops-card" style={{ marginBottom: 24 }}>
          <div className="ops-accent-line" />
          <div className="ops-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Train
                size={14}
                style={{ color: "var(--color-muted-foreground)" }}
              />
              <p className="ops-card-title" style={{ margin: 0 }}>
                PLAN YOUR ROUTE
              </p>
            </div>
            <p className="ops-card-subtitle" style={{ margin: "4px 0 0" }}>
              Select origin and destination
            </p>
          </div>

          <div
            style={{
              padding: "20px 24px",
              background: "rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row" as const,
                alignItems: "flex-end",
                gap: 16,
                flexWrap: "wrap" as const,
              }}
            >
              {/* FROM */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase" as const,
                    color: "var(--color-muted-foreground)",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      background: "rgba(29,111,232,0.12)",
                      border: "1px solid rgba(29,111,232,0.2)",
                      borderRadius: 3,
                      padding: "1px 6px",
                      color: "#60a5fa",
                      fontSize: 9,
                    }}
                  >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 0",
                  paddingBottom: 10,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 1,
                        height: 4,
                        background: "rgba(59,130,246,0.4)",
                        borderRadius: 1,
                      }}
                    />
                  ))}
                  <div
                    style={{ color: "#3b82f6", fontSize: 10, lineHeight: 1 }}
                  >
                    ▼
                  </div>
                </div>
              </div>

              {/* TO */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase" as const,
                    color: "var(--color-muted-foreground)",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      borderRadius: 3,
                      padding: "1px 6px",
                      color: "#22c55e",
                      fontSize: 9,
                    }}
                  >
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
              <div
                style={{
                  marginTop: 16,
                  padding: "10px 16px",
                  background: "rgba(29,111,232,0.06)",
                  border: "1px solid rgba(29,111,232,0.15)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 14,
                    letterSpacing: "0.1em",
                    color: "#60a5fa",
                  }}
                >
                  {fromStation.code}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  ——————————————
                </span>
                <ArrowRight
                  size={12}
                  style={{ color: "var(--color-primary)" }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  ——————————————
                </span>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 14,
                    letterSpacing: "0.1em",
                    color: "#22c55e",
                  }}
                >
                  {toStation.code}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: "var(--color-muted-foreground)",
                  }}
                >
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock
                  size={14}
                  style={{ color: "var(--color-muted-foreground)" }}
                />
                <p
                  className="ops-card-title"
                  style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span>{fromStation?.code}</span>
                  <span
                    style={{
                      color: "#3b82f6",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                    }}
                  >
                    →
                  </span>
                  <span>{toStation?.code}</span>
                </p>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-muted)",
                    borderRadius: 4,
                    padding: "2px 7px",
                  }}
                >
                  {results.length}
                </span>
              </div>
              <p className="ops-card-subtitle" style={{ margin: "4px 0 0" }}>
                Direct schedule results
              </p>
            </div>

            {results.length === 0 ? (
              <div
                style={{
                  padding: "60px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Clock
                  size={32}
                  style={{
                    color: "var(--color-muted-foreground)",
                    opacity: 0.4,
                  }}
                />
                <p
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 22,
                    letterSpacing: "0.08em",
                    color: "var(--color-muted-foreground)",
                    margin: 0,
                  }}
                >
                  NO ROUTES FOUND
                </p>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    color: "var(--color-muted-foreground)",
                    textTransform: "uppercase",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  No direct schedules from {fromStation?.name} to{" "}
                  {toStation?.name}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ background: "var(--color-muted)" }}>
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
                          <TableCell
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {s.trainNumber}
                          </TableCell>
                          <TableCell>
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <span
                                style={{
                                  fontFamily: "'Sora', sans-serif",
                                  fontSize: 13,
                                }}
                              >
                                {fromStation?.name}
                              </span>
                              <span
                                style={{
                                  color: "#3b82f6",
                                  margin: "0 6px",
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                →
                              </span>
                              <span
                                style={{
                                  fontFamily: "'Sora', sans-serif",
                                  fontSize: 13,
                                }}
                              >
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
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: led.color,
                                  boxShadow: led.shadow,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 10,
                                  letterSpacing: "0.08em",
                                }}
                              >
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
