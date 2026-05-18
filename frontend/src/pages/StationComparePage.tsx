import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, Navigation, Hash, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStations } from "@/hooks/use-stations";
import { useSchedules } from "@/hooks/use-schedules";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { Station } from "@/types";

const statusLED = (status: string) => {
  if (status === "ACTIVE")
    return { color: "#22c55e", shadow: "0 0 6px 2px rgba(34,197,94,0.4)" };
  if (status === "MAINTENANCE")
    return { color: "#f59e0b", shadow: "0 0 6px 2px rgba(245,158,11,0.4)" };
  return { color: "#ef4444", shadow: "0 0 6px 2px rgba(239,68,68,0.4)" };
};


interface StationCardProps {
  station: Station | undefined;
  scheduleCount: number;
  otherScheduleCount: number;
}

function StationCard({
  station,
  scheduleCount,
  otherScheduleCount,
}: StationCardProps) {
  if (!station) {
    return (
      <div className="ops-card">
        <div className="ops-accent-line" />
        <div
          style={{
            padding: "60px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <p
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18,
              letterSpacing: "0.1em",
              color: "var(--color-muted-foreground)",
              margin: 0,
            }}
          >
            SELECT A STATION
          </p>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
              color: "var(--color-muted-foreground)",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Choose from the dropdown above
          </p>
        </div>
      </div>
    );
  }

  const led = statusLED(station.status);
  const schedulesWin = scheduleCount >= otherScheduleCount;

  const rows: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
  }[] = [
    {
      icon: (
        <Hash size={13} style={{ color: "var(--color-muted-foreground)" }} />
      ),
      label: "ORDER",
      value: (
        <span
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}
        >
          {String(station.order).padStart(2, "0")}
        </span>
      ),
    },
    {
      icon: (
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
      ),
      label: "STATUS",
      value: (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
          }}
        >
          {station.status}
        </span>
      ),
    },
    {
      icon: (
        <Calendar
          size={13}
          style={{ color: "var(--color-muted-foreground)" }}
        />
      ),
      label: "SCHEDULES",
      value: (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            color: schedulesWin ? "#22c55e" : "var(--color-foreground)",
            fontWeight: schedulesWin ? 700 : 400,
          }}
        >
          {scheduleCount}
        </span>
      ),
      highlight: schedulesWin,
    },
    {
      icon: (
        <MapPin size={13} style={{ color: "var(--color-muted-foreground)" }} />
      ),
      label: "LOCATION",
      value: (
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12 }}>
          {station.location}
        </span>
      ),
    },
    {
      icon: (
        <Navigation
          size={13}
          style={{ color: "var(--color-muted-foreground)" }}
        />
      ),
      label: "COORDINATES",
      value: (
        <span
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
        >
          {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
        </span>
      ),
    },
  ];

  return (
    <div className="ops-card">
      <div className="ops-accent-line" />
      <div className="ops-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="ops-code-badge">{station.code}</span>
        </div>
        <p
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            letterSpacing: "0.04em",
            color: "var(--color-foreground)",
            margin: "6px 0 0",
            lineHeight: 1.1,
          }}
        >
          {station.name}
        </p>
        <p className="ops-card-subtitle" style={{ margin: "4px 0 0" }}>
          {station.location}
        </p>
      </div>
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 8px",
              borderBottom:
                i < rows.length - 1 ? "1px solid var(--color-border)" : "none",
              background: row.highlight
                ? "rgba(34,197,94,0.05)"
                : "transparent",
              borderLeft: row.highlight
                ? "2px solid rgba(34,197,94,0.4)"
                : "2px solid transparent",
              borderRadius: row.highlight ? 4 : 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                width: 100,
                flexShrink: 0,
              }}
            >
              {row.icon}
              <span className="ops-table-head">{row.label}</span>
            </div>
            <div style={{ flex: 1, color: "var(--color-foreground)" }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StationComparePage() {
  usePageMeta({ title: "Compare Stations", path: "/compare" });
  useTranslation();
  const { data: stationsData } = useStations({ limit: 100 });
  const stations = stationsData?.stations ?? [];
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  const { data: leftSchedules } = useSchedules({
    stationId: leftId || undefined,
    limit: 100,
  });
  const { data: rightSchedules } = useSchedules({
    stationId: rightId || undefined,
    limit: 100,
  });

  const left = stations.find((s) => s.id === leftId);
  const right = stations.find((s) => s.id === rightId);
  const leftCount = leftSchedules?.schedules?.length ?? 0;
  const rightCount = rightSchedules?.schedules?.length ?? 0;

  return (
    <div>
      <PageHeader title="STATION COMPARE" subtitle="Side-by-side station analysis" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Selector area */}
        <div className="ops-card" style={{ marginBottom: 24 }}>
          <div className="ops-accent-line" />
          <div style={{ padding: "20px 24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <p className="ops-table-head" style={{ margin: "0 0 8px" }}>
                  Station A
                </p>
                <Select value={leftId} onValueChange={setLeftId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  flexShrink: 0,
                  paddingTop: 20,
                }}
              >
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: "rgba(59,130,246,0.3)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 22,
                    color: "rgba(148,163,184,0.4)",
                    letterSpacing: "0.1em",
                  }}
                >
                  VS
                </span>
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: "rgba(59,130,246,0.3)",
                  }}
                />
              </div>

              <div>
                <p className="ops-table-head" style={{ margin: "0 0 8px" }}>
                  Station B
                </p>
                <Select value={rightId} onValueChange={setRightId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
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
          </div>
        </div>

        {/* Comparison cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <StationCard
            station={left}
            scheduleCount={leftCount}
            otherScheduleCount={rightCount}
          />
          <StationCard
            station={right}
            scheduleCount={rightCount}
            otherScheduleCount={leftCount}
          />
        </div>
      </motion.div>
    </div>
  );
}
