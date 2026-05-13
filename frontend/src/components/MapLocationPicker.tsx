import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

const pickerIcon = L.divIcon({
  className: "map-picker-marker",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      background: #2563eb;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      transform: rotate(-45deg);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6)),
      );
    },
  });
  return null;
}

interface MapLocationPickerProps {
  latitude?: number | string;
  longitude?: number | string;
  onPick: (lat: number, lng: number) => void;
}

const MRT_CENTER: [number, number] = [-6.2088, 106.8456];

export function MapLocationPicker({
  latitude,
  longitude,
  onPick,
}: MapLocationPickerProps) {
  const lat = typeof latitude === "number" ? latitude : parseFloat(String(latitude ?? "")) || null;
  const lng = typeof longitude === "number" ? longitude : parseFloat(String(longitude ?? "")) || null;
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const center: [number, number] = hasCoords ? [lat!, lng!] : MRT_CENTER;

  return (
    <div className="space-y-1">
      <div
        style={{ height: "200px", borderRadius: "8px", overflow: "hidden", border: "1px solid hsl(var(--border))" }}
      >
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
        >
          <TileLayer url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}" />
          <ClickHandler onPick={onPick} />
          {hasCoords && (
            <Marker position={[lat!, lng!]} icon={pickerIcon} />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {hasCoords
          ? `${lat!.toFixed(6)}, ${lng!.toFixed(6)}`
          : "Click map to set coordinates"}
      </p>
    </div>
  );
}
