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
    maintenance: filteredStations.filter((s) => s.status === "MAINTENANCE").length,
    inactive: filteredStations.filter((s) => s.status === "INACTIVE").length,
  };

  const statusChips = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {[
        { label: t("map.active"), count: statusCounts.active, status: "ACTIVE" },
        { label: t("map.maintenance"), count: statusCounts.maintenance, status: "MAINTENANCE" },
        { label: t("map.inactive"), count: statusCounts.inactive, status: "INACTIVE" },
      ].map(({ label, count, status }) => {
        const led = statusLED(status);
        return (
          <div key={status} className="ops-status-chip">
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="ops-card">
            {isLoading ? (
              <Skeleton style={{ height: 500, width: "100%" }} />
            ) : (
              <div style={{ height: 500 }}>
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
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Station list card */}
          <div
            className="ops-card"
            style={{ display: "flex", flexDirection: "column", height: 500 }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "14px 16px 12px",
                borderBottom: "1px solid var(--color-border)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Train size={13} style={{ color: "var(--color-muted-foreground)" }} />
                <p
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 15,
                    letterSpacing: "0.1em",
                    color: "var(--color-foreground)",
                    margin: 0,
                  }}
                >
                  {t("map.routeOrder")}
                </p>
              </div>
              <p className="ops-mono-xs" style={{ margin: "3px 0 0" }}>
                {withCoords.length} stations mapped
              </p>
            </div>

            {/* Search */}
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid var(--color-border)",
                flexShrink: 0,
              }}
            >
              <div style={{ position: "relative" }}>
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-muted-foreground)",
                  }}
                />
                <Input
                  placeholder={t("common.search")}
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="font-mono text-[11px] tracking-[0.05em]"
                  style={{ height: 32, paddingLeft: 30 }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
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
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        background: isSelected ? "rgba(29,111,232,0.06)" : "transparent",
                        borderLeft: isSelected
                          ? "3px solid var(--color-primary)"
                          : "3px solid transparent",
                        borderTop: "none",
                        borderRight: "none",
                        borderBottom: "1px solid var(--color-border)",
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="ops-map-station-code">{station.code}</span>
                          <span className="ops-map-station-name">{station.name}</span>
                        </div>
                        <p className="ops-map-station-location">{station.location}</p>
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
                <div
                  style={{
                    padding: "14px 16px 12px",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="ops-code-badge">{selectedStation.code}</span>
                    <p
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 16,
                        letterSpacing: "0.05em",
                        color: "var(--color-foreground)",
                        margin: 0,
                      }}
                    >
                      {selectedStation.name}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    {(() => {
                      const led = statusLED(selectedStation.status);
                      return (
                        <>
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: led.color,
                              boxShadow: led.shadow,
                            }}
                          />
                          <span className="ops-mono-data" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
                            {selectedStation.status}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    <MapPin size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 12,
                        color: "var(--color-foreground)",
                      }}
                    >
                      {selectedStation.location}
                    </span>
                  </div>
                  {selectedStation.latitude && selectedStation.longitude && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Navigation size={13} style={{ color: "var(--color-muted-foreground)", flexShrink: 0 }} />
                      <span className="ops-mono-data" style={{ fontSize: 10 }}>
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
