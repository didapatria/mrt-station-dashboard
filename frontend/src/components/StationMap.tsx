import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import type { Station } from "@/types";

const createStationIcon = (status: Station["status"]) => {
  const colors = {
    ACTIVE: "#22c55e",
    MAINTENANCE: "#f59e0b",
    INACTIVE: "#ef4444",
  };
  const color = colors[status];

  return L.divIcon({
    className: "custom-station-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

function FitBounds({ stations }: { stations: Station[] }) {
  const map = useMap();

  useEffect(() => {
    const withCoords = stations.filter((s) => s.latitude && s.longitude);
    if (withCoords.length === 0) return;

    const bounds = L.latLngBounds(
      withCoords.map((s) => [s.latitude!, s.longitude!]),
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, stations]);

  return null;
}

interface StationMapProps {
  stations: Station[];
  selectedStationId?: string | null;
  onStationClick?: (station: Station) => void;
}

export function StationMap({
  stations,
  selectedStationId,
  onStationClick,
}: StationMapProps) {
  const withCoords = stations.filter((s) => s.latitude && s.longitude);

  const sortedStations = [...withCoords].sort((a, b) => a.order - b.order);
  const routeLine: [number, number][] = sortedStations.map((s) => [
    s.latitude!,
    s.longitude!,
  ]);

  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords[0].latitude!, withCoords[0].longitude!]
      : [-6.2088, 106.8456];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full rounded-lg min-h-100"
      attributionControl={false}
    >
      <TileLayer url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}" />

      <FitBounds stations={stations} />

      {routeLine.length > 1 && (
        <Polyline
          positions={routeLine}
          pathOptions={{
            color: "#0066cc",
            weight: 4,
            opacity: 0.7,
            dashArray: "8, 8",
          }}
        />
      )}

      {withCoords.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude!, station.longitude!]}
          icon={createStationIcon(station.status)}
          eventHandlers={{
            click: () => onStationClick?.(station),
          }}
          opacity={
            selectedStationId && selectedStationId !== station.id ? 0.5 : 1
          }
        >
          <Popup>
            <div className="min-w-45">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">{station.code}</span>
                <Badge
                  variant={
                    station.status === "ACTIVE"
                      ? "success"
                      : station.status === "MAINTENANCE"
                        ? "warning"
                        : "destructive"
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {station.status}
                </Badge>
              </div>
              <p className="font-medium text-sm">{station.name}</p>
              <p className="text-xs text-muted-foreground">
                {station.location}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                {station.latitude?.toFixed(6)}, {station.longitude?.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
