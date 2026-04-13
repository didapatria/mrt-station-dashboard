import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Train, Navigation, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { StationMap } from "@/components/StationMap";
import { useStations } from "@/hooks/use-stations";
import type { Station } from "@/types";

export default function MapPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useStations({ limit: 100 });
  const stations = data?.stations ?? [];
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapSearch, setMapSearch] = useState("");

  const filteredStations = useMemo(() => {
    if (!mapSearch.trim()) return stations;
    const q = mapSearch.toLowerCase();
    return stations.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
    );
  }, [stations, mapSearch]);

  const withCoords = filteredStations.filter((s) => s.latitude && s.longitude);
  const statusCounts = {
    active: filteredStations.filter((s) => s.status === "ACTIVE").length,
    maintenance: filteredStations.filter((s) => s.status === "MAINTENANCE").length,
    inactive: filteredStations.filter((s) => s.status === "INACTIVE").length,
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t("map.title")}</h2>
          <p className="text-muted-foreground">
            {t("map.subtitle")} ({withCoords.length}{" "}
            {t("map.mapped")})
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-success" />
            {statusCounts.active} {t("map.active")}
          </Badge>
          <Badge variant="warning" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-warning" />
            {statusCounts.maintenance} {t("map.maintenance")}
          </Badge>
          <Badge variant="destructive" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {statusCounts.inactive} {t("map.inactive")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Station List Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-125 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Train className="h-4 w-4" />
                {t("map.routeOrder")}
              </CardTitle>
            </CardHeader>
            <div className="px-3 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder={t("common.search")} value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} className="h-8 pl-8 text-sm" />
              </div>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="divide-y">
                {filteredStations
                  .filter((s) => s.latitude && s.longitude)
                  .sort((a, b) => a.order - b.order)
                  .map((station, index) => (
                    <button
                      key={station.id}
                      onClick={() => setSelectedStation(station)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
                        selectedStation?.id === station.id
                          ? "bg-primary/5 border-l-2 border-primary"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-3 w-3 rounded-full border-2 ${
                              station.status === "ACTIVE"
                                ? "border-success bg-success/20"
                                : station.status === "MAINTENANCE"
                                  ? "border-warning bg-warning/20"
                                  : "border-destructive bg-destructive/20"
                            }`}
                          />
                          {index <
                            filteredStations.filter((s) => s.latitude && s.longitude)
                              .length -
                              1 && <div className="w-px h-4 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary">
                              {station.code}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {station.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {station.location}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Station Detail */}
          {selectedStation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {selectedStation.code}
                    </div>
                    <div>
                      <p className="font-medium">{selectedStation.name}</p>
                      <Badge
                        variant={
                          selectedStation.status === "ACTIVE"
                            ? "success"
                            : selectedStation.status === "MAINTENANCE"
                              ? "warning"
                              : "destructive"
                        }
                        className="mt-0.5"
                      >
                        {selectedStation.status}
                      </Badge>
                    </div>
                  </div>
                  <Separator className="mb-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedStation.location}
                    </div>
                    {selectedStation.latitude && selectedStation.longitude && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Navigation className="h-3.5 w-3.5" />
                        <span className="font-mono text-xs">
                          {selectedStation.latitude.toFixed(6)},{" "}
                          {selectedStation.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
