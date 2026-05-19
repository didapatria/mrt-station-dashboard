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
        <div className="p-[60px_24px] flex flex-col items-center justify-center gap-3">
          <p className="font-display text-[18px] tracking-widest text-muted-foreground m-0">
            SELECT A STATION
          </p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground m-0 uppercase">
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
      icon: <Hash size={13} className="text-muted-foreground" />,
      label: "ORDER",
      value: (
        <span className="font-mono text-[14px]">
          {String(station.order).padStart(2, "0")}
        </span>
      ),
    },
    {
      icon: (
        <div
          className="w-1.75 h-1.75 rounded-full shrink-0"
          style={{ background: led.color, boxShadow: led.shadow }}
        />
      ),
      label: "STATUS",
      value: (
        <span className="font-mono text-[11px] tracking-[0.08em]">
          {station.status}
        </span>
      ),
    },
    {
      icon: <Calendar size={13} className="text-muted-foreground" />,
      label: "SCHEDULES",
      value: (
        <span
          className="font-mono text-[14px]"
          style={{
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
      icon: <MapPin size={13} className="text-muted-foreground" />,
      label: "LOCATION",
      value: (
        <span className="font-['Sora',sans-serif] text-[12px]">
          {station.location}
        </span>
      ),
    },
    {
      icon: <Navigation size={13} className="text-muted-foreground" />,
      label: "COORDINATES",
      value: (
        <span className="font-mono text-[10px]">
          {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
        </span>
      ),
    },
  ];

  return (
    <div className="ops-card">
      <div className="ops-accent-line" />
      <div className="ops-card-header">
        <div className="flex items-center gap-2.5">
          <span className="ops-code-badge">{station.code}</span>
        </div>
        <p className="font-display text-[22px] tracking-[0.04em] text-foreground mt-1.5 mb-0 leading-[1.1]">
          {station.name}
        </p>
        <p className="ops-card-subtitle mt-1">{station.location}</p>
      </div>
      <div className="p-[16px_24px] flex flex-col">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 p-[12px_8px]"
            style={{
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
            <div className="flex items-center gap-1.5 w-25 shrink-0">
              {row.icon}
              <span className="ops-table-head">{row.label}</span>
            </div>
            <div className="flex-1 text-foreground">{row.value}</div>
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
      <PageHeader
        title="STATION COMPARE"
        subtitle="Side-by-side station analysis"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Selector area */}
        <div className="ops-card mb-6">
          <div className="ops-accent-line" />
          <div className="p-[20px_24px]">
            <div
              className="grid items-center gap-4"
              style={{ gridTemplateColumns: "1fr auto 1fr" }}
            >
              <div>
                <p className="ops-table-head mb-2">Station A</p>
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

              <div className="flex flex-col items-center gap-1 shrink-0 pt-5">
                <div className="w-px h-5 bg-[rgba(59,130,246,0.3)]" />
                <span className="font-display text-[22px] text-[rgba(148,163,184,0.4)] tracking-widest">
                  VS
                </span>
                <div className="w-px h-5 bg-[rgba(59,130,246,0.3)]" />
              </div>

              <div>
                <p className="ops-table-head mb-2">Station B</p>
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
        <div className="grid grid-cols-2 gap-4">
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
