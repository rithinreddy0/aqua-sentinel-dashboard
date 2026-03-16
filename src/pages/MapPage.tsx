import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { generateBuoys, type BuoyData } from "@/lib/sensorData";
import "leaflet/dist/leaflet.css";

const statusColors: Record<string, string> = {
  safe: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

function getOverallStatus(buoy: BuoyData) {
  if (buoy.sensors.some((s) => s.status === "danger")) return "danger";
  if (buoy.sensors.some((s) => s.status === "warning")) return "warning";
  return "safe";
}

export default function MapPage() {
  const [buoys, setBuoys] = useState<BuoyData[]>([]);

  useEffect(() => {
    setBuoys(generateBuoys());
    const interval = setInterval(() => setBuoys(generateBuoys()), 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Lake Monitoring Map</h1>
          <p className="text-sm text-muted-foreground">Interactive map showing all buoy locations and real-time status</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          {[
            { label: "Safe", color: "bg-safe" },
            { label: "Warning", color: "bg-warning" },
            { label: "Danger", color: "bg-danger" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${l.color}`} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-panel overflow-hidden" style={{ height: "65vh" }}>
          <MapContainer
            center={[22.5, 77.5]}
            zoom={5}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
            className="rounded-xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {buoys.map((buoy) => {
              const status = getOverallStatus(buoy);
              const color = statusColors[status];
              return (
                <CircleMarker
                  key={buoy.id}
                  center={[buoy.lat, buoy.lng]}
                  radius={12}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="font-sans text-xs" style={{ minWidth: 180 }}>
                      <div className="font-bold text-sm mb-1">{buoy.name}</div>
                      <div className="text-gray-500 mb-2">{buoy.lake}</div>
                      <div className="space-y-1">
                        {buoy.sensors.map((s) => (
                          <div key={s.label} className="flex justify-between">
                            <span>{s.label}</span>
                            <span className="font-mono font-bold" style={{ color: statusColors[s.status] }}>
                              {s.value.toFixed(2)} {s.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-between text-gray-400">
                        <span>🔋 {buoy.battery}%</span>
                        <span>📶 {buoy.signal}%</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
