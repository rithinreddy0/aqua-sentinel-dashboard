// Simulated sensor data utilities for AQUA-SENTINEL

export type SensorStatus = "safe" | "warning" | "danger";
export type TrendDirection = "up" | "down" | "stable";

export interface SensorReading {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  safeRange: [number, number];
  warningRange: [number, number];
  trend: TrendDirection;
  status: SensorStatus;
  icon: string;
}

export interface BuoyData {
  id: string;
  name: string;
  lake: string;
  lat: number;
  lng: number;
  status: "online" | "offline" | "maintenance";
  battery: number;
  signal: number;
  firmware: string;
  lastSeen: string;
  sensors: SensorReading[];
}

export interface AlertData {
  id: string;
  buoyId: string;
  buoyName: string;
  severity: "critical" | "warning" | "info";
  parameter: string;
  value: number;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface PredictionData {
  buoyId: string;
  target: string;
  probability: number;
  confidence: number;
  factors: { param: string; impact: string; reason: string }[];
  forecastWindow: string;
}

function getStatus(value: number, safe: [number, number], warn: [number, number]): SensorStatus {
  if (value >= safe[0] && value <= safe[1]) return "safe";
  if (value >= warn[0] && value <= warn[1]) return "warning";
  return "danger";
}

function getTrend(): TrendDirection {
  const r = Math.random();
  if (r < 0.33) return "up";
  if (r < 0.66) return "down";
  return "stable";
}

function generateSensors(): SensorReading[] {
  const ph = 6.5 + Math.random() * 3;
  const turbidity = 5 + Math.random() * 40;
  const dissolvedO2 = 4 + Math.random() * 8;
  const temp = 18 + Math.random() * 12;

  return [
    {
      label: "pH Level",
      value: ph,
      unit: "pH",
      min: 0,
      max: 14,
      safeRange: [6.5, 8.5],
      warningRange: [5.5, 9.5],
      trend: getTrend(),
      status: getStatus(ph, [6.5, 8.5], [5.5, 9.5]),
      icon: "droplets",
    },
    {
      label: "Turbidity",
      value: turbidity,
      unit: "NTU",
      min: 0,
      max: 100,
      safeRange: [0, 20],
      warningRange: [0, 40],
      trend: getTrend(),
      status: getStatus(turbidity, [0, 20], [0, 40]),
      icon: "eye",
    },
    {
      label: "Dissolved O₂",
      value: dissolvedO2,
      unit: "mg/L",
      min: 0,
      max: 14,
      safeRange: [6, 14],
      warningRange: [4, 14],
      trend: getTrend(),
      status: getStatus(dissolvedO2, [6, 14], [4, 14]),
      icon: "wind",
    },
    {
      label: "Temperature",
      value: temp,
      unit: "°C",
      min: 0,
      max: 40,
      safeRange: [15, 25],
      warningRange: [10, 30],
      trend: getTrend(),
      status: getStatus(temp, [15, 25], [10, 30]),
      icon: "thermometer",
    },
  ];
}

export const lakes = [
  { id: "lake-1", name: "Hussain Sagar", city: "Hyderabad", lat: 17.4239, lng: 78.4738 },
  { id: "lake-2", name: "Powai Lake", city: "Mumbai", lat: 19.1272, lng: 72.9052 },
  { id: "lake-3", name: "Dal Lake", city: "Srinagar", lat: 34.1165, lng: 74.8560 },
  { id: "lake-4", name: "Ulsoor Lake", city: "Bangalore", lat: 12.9828, lng: 77.6206 },
];

export function generateBuoys(): BuoyData[] {
  return lakes.flatMap((lake, li) =>
    Array.from({ length: 2 }, (_, bi) => {
      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;
      const id = `B-${String(li * 2 + bi + 1).padStart(3, "0")}`;
      return {
        id,
        name: `Buoy ${id}`,
        lake: lake.name,
        lat: lake.lat + offsetLat,
        lng: lake.lng + offsetLng,
        status: Math.random() > 0.15 ? "online" as const : Math.random() > 0.5 ? "maintenance" as const : "offline" as const,
        battery: Math.floor(60 + Math.random() * 40),
        signal: Math.floor(50 + Math.random() * 50),
        firmware: "v2.4.1",
        lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        sensors: generateSensors(),
      };
    })
  );
}

export function generateAlerts(buoys: BuoyData[]): AlertData[] {
  const alerts: AlertData[] = [];
  const messages = [
    { param: "pH", msg: "pH level out of safe range" },
    { param: "Turbidity", msg: "Turbidity spike detected" },
    { param: "Dissolved O₂", msg: "Low dissolved oxygen levels" },
    { param: "Temperature", msg: "Abnormal water temperature" },
  ];

  buoys.forEach((buoy) => {
    buoy.sensors.forEach((sensor) => {
      if (sensor.status !== "safe") {
        const m = messages.find((m) => sensor.label.includes(m.param)) || messages[0];
        alerts.push({
          id: `alert-${buoy.id}-${sensor.label}`,
          buoyId: buoy.id,
          buoyName: buoy.name,
          severity: sensor.status === "danger" ? "critical" : "warning",
          parameter: sensor.label,
          value: sensor.value,
          message: m.msg,
          timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          resolved: Math.random() > 0.7,
        });
      }
    });
  });

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generatePredictions(buoys: BuoyData[]): PredictionData[] {
  return buoys.map((buoy) => ({
    buoyId: buoy.id,
    target: "algal_bloom",
    probability: Math.random() * 0.6 + 0.1,
    confidence: Math.random() * 0.3 + 0.7,
    factors: [
      { param: "Temperature", impact: `+${(Math.random() * 15).toFixed(0)}%`, reason: "Surface temperature rising steadily" },
      { param: "pH", impact: `+${(Math.random() * 8).toFixed(0)}%`, reason: "Alkalinity trending above normal" },
      { param: "Dissolved O₂", impact: `-${(Math.random() * 5).toFixed(0)}%`, reason: "Oxygen depletion in deeper layers" },
    ],
    forecastWindow: "24h",
  }));
}

export function generateTimeSeriesData(hours: number = 24) {
  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const t = now - i * 3600000;
    data.push({
      time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: t,
      ph: 7.0 + Math.sin(i * 0.3) * 0.5 + (Math.random() - 0.5) * 0.3,
      turbidity: 15 + Math.sin(i * 0.2) * 8 + (Math.random() - 0.5) * 5,
      dissolvedO2: 7.5 + Math.cos(i * 0.25) * 1.5 + (Math.random() - 0.5) * 0.5,
      temperature: 22 + Math.sin(i * 0.15) * 3 + (Math.random() - 0.5) * 1,
    });
  }
  return data;
}
