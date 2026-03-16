import { motion } from "framer-motion";
import type { SensorReading } from "@/lib/sensorData";
import { Droplets, Eye, Wind, Thermometer } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  droplets: Droplets,
  eye: Eye,
  wind: Wind,
  thermometer: Thermometer,
};

const statusColorMap = {
  safe: "status-safe",
  warning: "status-warning",
  danger: "status-danger",
};

const statusDotMap = {
  safe: "status-dot-safe",
  warning: "status-dot-warning",
  danger: "status-dot-danger",
};

const glowMap = {
  safe: "glow-safe",
  warning: "glow-warning",
  danger: "glow-danger",
};

export default function SensorCard({ sensor }: { sensor: SensorReading }) {
  const Icon = iconMap[sensor.icon] || Droplets;
  const pct = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] } }}
      className={`glass-panel p-5 ${glowMap[sensor.status]}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary">
            <Icon className={`h-4 w-4 ${statusColorMap[sensor.status]}`} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {sensor.label}
          </span>
        </div>
        <div className={statusDotMap[sensor.status]} />
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-mono font-bold tracking-tighter text-foreground">
          {sensor.value.toFixed(2)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{sensor.unit}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-secondary mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className={`h-full rounded-full ${
            sensor.status === "safe"
              ? "bg-safe"
              : sensor.status === "warning"
              ? "bg-warning"
              : "bg-danger"
          }`}
        />
      </div>

      <div className="flex items-center justify-between">
        <div
          className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary ${statusColorMap[sensor.status]}`}
        >
          {sensor.status.toUpperCase()}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          TREND: {sensor.trend.toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
}
