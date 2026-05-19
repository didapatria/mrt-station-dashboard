import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Navigation, Search, Train } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { StationMap } from "@/components/StationMap";
import { useStations } from "@/hooks/use-stations";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { Station } from "@/types";

const statusLED = (status: string) => {
  if (status === "ACTIVE")
    return { color: "#22c55e", shadow: "0 0 5px 1px rgba(34,197,94,0.4)" };
  if (status === "MAINTENANCE")
    return { color: "#f59e0b", shadow: "0 0 5px 1px rgba(245,158,11,0.4)" };
  return { color: "#ef4444", shadow: "0 0 5px 1px rgba(239,68,68,0.4)" };
};

export default function MapPage() {
  usePageMeta({ title: "Station Map", path: "/map" });
  const { t } = useTranslation();
  const { data, isLoading } = useStations({ limit: 100 });
  const stations = useMemo(() => data?.stations ?? [], [data]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapSearch, setMapSearch] = useState("");

  const filteredStations = useMemo(() => {
    if (!mapSearch.trim()) return stations;
    const q = mapSearch.toLowerCase();
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q),
    );
  }, [stations, mapSearch]);

  const withCoords = filteredStations.filter((s) => s.latitude && s.longitude);
  const statusCounts = {
    active: filteredStations.filter((s) => s.status === "ACTIVE").length,
    maintenance: filteredStations.filter((s) => s.status === "MAINTENANCE")
      .length,
    inactive: filteredStations.filter((s) => s.status === "INACTIVE").length,
  };

  const statusChips = (
    <div className="flex gap-2 flex-wrap items-center">
      {[
        {
          label: t("map.active"),
          count: statusCounts.active,
          status: "ACTIVE",
        },
        {
          label: t("map.maintenance"),
          count: statusCounts.maintenance,
          status: "MAINTENANCE",
        },
        {
          label: t("map.inactive"),
          count: statusCounts.inactive,
          status: "INACTIVE",
        },
      ].map(({ label, count, status }) => {
        const led = statusLED(status);
        return (
          <div key={status} className="ops-status-chip">
            <div
              className="w-1.75 h-1.75 rounded-full shrink-0"
              style={{ background: led.color, boxShadow: led.shadow }}
            />
            <span className="ops-status-chip-count">{count}</span>
            <span className="ops-status-chip-label">{label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t("map.title")}
        subtitle={`${t("map.subtitle")} — ${withCoords.length} ${t("map.mapped")}`}
        right={statusChips}
      />

      <div
        className="grid gap-5 items-start"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
      >
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="ops-card">
            {isLoading ? (
              <Skeleton className="h-125 w-full" />
            ) : (
              <div className="h-125">
                <StationMap
                  stations={stations}
                  selectedStationId={selectedStation?.id}
                  onStationClick={setSelectedStation}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Station list card */}
          <div className="ops-card flex flex-col h-125">
            {/* Card header */}
            <div className="p-[14px_16px_12px] border-b border-border shrink-0">
              <div className="flex items-center gap-1.5">
                <Train size={13} className="text-muted-foreground" />
                <p className="font-display text-[15px] tracking-widest text-foreground m-0">
                  {t("map.routeOrder")}
                </p>
              </div>
              <p className="ops-mono-xs mt-0.75">
                {withCoords.length} stations mapped
              </p>
            </div>

            {/* Search */}
            <div className="p-[8px_12px] border-b border-border shrink-0">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder={t("common.search")}
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="font-mono text-[11px] tracking-[0.05em] h-8 pl-7.5"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredStations
                .filter((s) => s.latitude && s.longitude)
                .sort((a, b) => a.order - b.order)
                .map((station) => {
                  const led = statusLED(station.status);
                  const isSelected = selectedStation?.id === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => setSelectedStation(station)}
                      className="w-full text-left py-2.5 px-4 flex items-center gap-2.5 cursor-pointer transition-all duration-[0.12s] border-t-0 border-r-0 border-b border-b-border"
                      style={{
                        background: isSelected
                          ? "rgba(29,111,232,0.06)"
                          : "transparent",
                        borderLeft: isSelected
                          ? "3px solid var(--color-primary)"
                          : "3px solid transparent",
                      }}
                    >
                      <div
                        className="w-1.75 h-1.75 rounded-full shrink-0"
                        style={{ background: led.color, boxShadow: led.shadow }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="ops-map-station-code">
                            {station.code}
                          </span>
                          <span className="ops-map-station-name">
                            {station.name}
                          </span>
                        </div>
                        <p className="ops-map-station-location">
                          {station.location}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Selected station detail */}
          {selectedStation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="ops-card">
                <div className="ops-accent-line" />
                <div className="p-[14px_16px_12px] border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="ops-code-badge">
                      {selectedStation.code}
                    </span>
                    <p className="font-display text-[16px] tracking-[0.05em] text-foreground m-0">
                      {selectedStation.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {(() => {
                      const led = statusLED(selectedStation.status);
                      return (
                        <>
                          <div
                            className="w-1.75 h-1.75 rounded-full"
                            style={{
                              background: led.color,
                              boxShadow: led.shadow,
                            }}
                          />
                          <span className="ops-mono-data text-[10px] tracking-widest">
                            {selectedStation.status}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="p-[12px_16px] flex flex-col gap-2">
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin size={13} className="shrink-0 mt-px" />
                    <span className="font-['Sora',sans-serif] text-[12px] text-foreground">
                      {selectedStation.location}
                    </span>
                  </div>
                  {selectedStation.latitude && selectedStation.longitude && (
                    <div className="flex items-center gap-1.5">
                      <Navigation
                        size={13}
                        className="text-muted-foreground shrink-0"
                      />
                      <span className="ops-mono-data text-[10px]">
                        {selectedStation.latitude.toFixed(6)},{" "}
                        {selectedStation.longitude.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
