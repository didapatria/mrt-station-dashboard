import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStations } from "@/hooks/use-stations";
import { useSchedules } from "@/hooks/use-schedules";

export default function StationComparePage() {
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

  const renderStation = (
    station: typeof left,
    schedules: typeof leftSchedules,
  ) => {
    if (!station)
      return (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          Select a station
        </div>
      );
    const count = schedules?.schedules?.length ?? 0;
    return (
      <div className="space-y-4">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
            {station.code}
          </div>
          <div>
            <p className="font-semibold">{station.name}</p>
            <p className="text-xs text-muted-foreground">{station.location}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Status</p>
            <Badge
              variant={station.status === "ACTIVE" ? "success" : "warning"}
            >
              {station.status}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Order</p>
            <p className="font-medium">{station.order}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Schedules</p>
            <p className="font-medium">{count}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Coordinates</p>
            <p className="font-mono text-xs">
              {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Station Comparison
        </h2>
        <p className="text-muted-foreground">
          Compare two stations side by side
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] items-start">
          <Card>
            <CardHeader>
              <Select value={leftId} onValueChange={setLeftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>{renderStation(left, leftSchedules)}</CardContent>
          </Card>
          <div className="flex items-center justify-center pt-12">
            <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <Card>
            <CardHeader>
              <Select value={rightId} onValueChange={setRightId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>{renderStation(right, rightSchedules)}</CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
