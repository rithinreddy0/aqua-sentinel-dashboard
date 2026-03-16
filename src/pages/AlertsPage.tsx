import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, X, Filter } from "lucide-react";
import { generateBuoys, generateAlerts, type AlertData } from "@/lib/sensorData";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");

  useEffect(() => {
    const b = generateBuoys();
    setAlerts(generateAlerts(b));
  }, []);

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    return a.severity === filter;
  });

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Alerts
            </h1>
            <p className="text-sm text-muted-foreground">
              {alerts.filter((a) => !a.resolved).length} active alerts
            </p>
          </div>
          <div className="flex gap-2">
            {(["all", "critical", "warning"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "glass-panel-sm text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-panel p-4 flex items-start gap-4 ${
                alert.resolved ? "opacity-50" : ""
              }`}
            >
              <div
                className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  alert.severity === "critical"
                    ? "bg-danger/10 text-danger"
                    : "bg-warning/10 text-warning"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      alert.severity === "critical"
                        ? "bg-danger/10 text-danger"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{alert.buoyName}</span>
                  {alert.resolved && (
                    <span className="text-xs text-safe flex items-center gap-1">
                      <Check className="h-3 w-3" /> Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground">{alert.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {alert.parameter}: <strong className="font-mono">{alert.value.toFixed(2)}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
