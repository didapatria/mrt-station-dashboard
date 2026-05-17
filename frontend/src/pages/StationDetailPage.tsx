import { useState } from "react";
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
    return {
      color: "#22c55e",
      shadow: "0 0 6px 2px rgba(34,197,94,0.4)",
    };
  if (status === "MAINTENANCE")
    return {
      color: "#f59e0b",
      shadow: "0 0 6px 2px rgba(245,158,11,0.4)",
    };
  return { color: "#ef4444", shadow: "0 0 6px 2px rgba(239,68,68,0.4)" };
};

const scheduleStatusLED = (status: string) => {
  if (status === "ACTIVE")
    return {
      color: "#22c55e",
      shadow: "0 0 6px 2px rgba(34,197,94,0.4)",
    };
  if (status === "DELAYED")
    return {
      color: "#f59e0b",
      shadow: "0 0 6px 2px rgba(245,158,11,0.4)",
    };
  return { color: "#ef4444", shadow: "0 0 6px 2px rgba(239,68,68,0.4)" };
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  overflow: "hidden",
};

const cardHeaderStyle: React.CSSProperties = {
  padding: "18px 24px 14px",
  borderBottom: "1px solid var(--color-border)",
};

const thStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9.5,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--color-muted-foreground)",
};

const ACCENT_LINE = (
  <div
    style={{
      height: 2,
      background: "linear-gradient(90deg, #3b82f6 0%, rgba(59,130,246,0) 100%)",
    }}
  />
);

function StatCard({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--color-background)",
        border: `1px solid ${hovered ? "rgba(59,130,246,0.3)" : "var(--color-border)"}`,
        borderRadius: 8,
        padding: "12px 16px",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </div>
  );
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
      <p
        style={{
          fontFamily: "'Sora', sans-serif",
          color: "var(--color-muted-foreground)",
        }}
      >
        Station not found.
      </p>
    );

  const led = statusLED(station.status);

  return (
    <div>
      <button
        onClick={() => navigate("/stations")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.08em",
          color: "var(--color-muted-foreground)",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: 20,
          padding: "4px 0",
        }}
      >
        <ArrowLeft size={14} />
        {t("stations.title")}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Page header */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 40,
                letterSpacing: "0.04em",
                lineHeight: 1,
                color: "var(--color-foreground)",
                margin: 0,
              }}
            >
              {station.name}
            </h1>
            {/* Station code badge — larger with glow */}
            <span
              style={{
                background: "rgba(29,111,232,0.12)",
                border: "1px solid rgba(29,111,232,0.2)",
                borderRadius: 4,
                padding: "4px 12px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 16,
                letterSpacing: "0.1em",
                color: "#60a5fa",
                display: "inline-block",
                boxShadow: "0 0 12px rgba(29,111,232,0.25)",
              }}
            >
              {station.code}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
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
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "var(--color-muted-foreground)",
              }}
            >
              {station.status}
            </span>
          </div>

          {/* Horizontal fade line below header */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, rgba(59,130,246,0.5) 0%, transparent 60%)",
              marginTop: 12,
              marginBottom: 28,
            }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Info card */}
            <div style={cardStyle}>
              {ACCENT_LINE}
              <div style={cardHeaderStyle}>
                <p
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 16,
                    letterSpacing: "0.1em",
                    color: "var(--color-foreground)",
                    margin: 0,
                  }}
                >
                  STATION INFO
                </p>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: "var(--color-muted-foreground)",
                    textTransform: "uppercase",
                    margin: "4px 0 0",
                  }}
                >
                  Station details &amp; metadata
                </p>
              </div>
              <div
                style={{
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 20,
                }}
              >
                {/* Order */}
                <StatCard>
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: "var(--color-muted-foreground)",
                      margin: "0 0 6px",
                    }}
                  >
                    {t("stations.order").toUpperCase()}
                  </p>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 22,
                      color: "var(--color-foreground)",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {String(station.order).padStart(2, "0")}
                  </p>
                </StatCard>

                {/* Location */}
                <StatCard>
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: "var(--color-muted-foreground)",
                      margin: "0 0 6px",
                    }}
                  >
                    LOCATION
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                    }}
                  >
                    <MapPin
                      size={13}
                      style={{
                        color: "var(--color-muted-foreground)",
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 13,
                        color: "var(--color-foreground)",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {station.location}
                    </p>
                  </div>
                </StatCard>

                {/* Status */}
                <StatCard>
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: "var(--color-muted-foreground)",
                      margin: "0 0 6px",
                    }}
                  >
                    {t("stations.status").toUpperCase()}
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
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
                        fontSize: 12,
                        letterSpacing: "0.08em",
                        color: "var(--color-foreground)",
                      }}
                    >
                      {station.status}
                    </span>
                  </div>
                </StatCard>

                {/* Coordinates — lat/lng on separate labeled lines */}
                {station.latitude && station.longitude && (
                  <StatCard>
                    <p
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        color: "var(--color-muted-foreground)",
                        margin: "0 0 8px",
                      }}
                    >
                      COORDINATES
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 8,
                            letterSpacing: "0.12em",
                            color: "var(--color-muted-foreground)",
                            opacity: 0.6,
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          LAT
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                            color: "var(--color-foreground)",
                          }}
                        >
                          {station.latitude.toFixed(6)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 8,
                            letterSpacing: "0.12em",
                            color: "var(--color-muted-foreground)",
                            opacity: 0.6,
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          LNG
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                            color: "var(--color-foreground)",
                          }}
                        >
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
                      style={{
                        background: "none",
                        border: "1px solid var(--color-border)",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        color: "var(--color-muted-foreground)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Copy size={9} />
                      COPY
                    </button>
                  </StatCard>
                )}
              </div>
            </div>

            {/* Schedules card */}
            <div style={cardStyle}>
              {ACCENT_LINE}
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock
                    size={14}
                    style={{ color: "var(--color-muted-foreground)" }}
                  />
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 16,
                      letterSpacing: "0.1em",
                      color: "var(--color-foreground)",
                      margin: 0,
                    }}
                  >
                    {t("schedules.title")}
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
                    {schedules.length}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: "var(--color-muted-foreground)",
                    textTransform: "uppercase",
                    margin: "4px 0 0",
                  }}
                >
                  Train schedules at this station
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: "var(--color-muted)" }}>
                    <TableHead style={thStyle}>
                      {t("schedules.trainNumber")}
                    </TableHead>
                    <TableHead style={thStyle}>
                      {t("schedules.route")}
                    </TableHead>
                    <TableHead style={thStyle}>{t("schedules.time")}</TableHead>
                    <TableHead style={thStyle}>
                      {t("stations.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: "32px 0",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          letterSpacing: "0.08em",
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        NO SCHEDULES FOUND
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((s) => {
                      const sled = scheduleStatusLED(s.status);
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
                          <TableCell
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 11,
                            }}
                          >
                            {s.departureStation?.code} →{" "}
                            {s.arrivalStation?.code}
                          </TableCell>
                          <TableCell
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 11,
                            }}
                          >
                            {s.departureTime} — {s.arrivalTime}
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
                                  background: sled.color,
                                  boxShadow: sled.shadow,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 10,
                                  letterSpacing: "0.08em",
                                  color: "var(--color-foreground)",
                                }}
                              >
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
              <div style={{ ...cardStyle }}>
                {ACCENT_LINE}
                <div style={cardHeaderStyle}>
                  <p
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 16,
                      letterSpacing: "0.1em",
                      color: "var(--color-foreground)",
                      margin: 0,
                    }}
                  >
                    MAP LOCATION
                  </p>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.14em",
                      color: "var(--color-muted-foreground)",
                      textTransform: "uppercase",
                      margin: "4px 0 0",
                    }}
                  >
                    {station.latitude.toFixed(4)},{" "}
                    {station.longitude.toFixed(4)}
                  </p>
                </div>
                <div style={{ height: 256 }}>
                  <StationMap
                    stations={[station]}
                    selectedStationId={station.id}
                  />
                </div>
                <div style={{ padding: "12px 24px" }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(station.code);
                      toast.success(`Copied: ${station.code}`);
                    }}
                    style={{
                      width: "100%",
                      background: "rgba(29,111,232,0.08)",
                      border: "1px solid rgba(29,111,232,0.2)",
                      borderRadius: 6,
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "#60a5fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
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
