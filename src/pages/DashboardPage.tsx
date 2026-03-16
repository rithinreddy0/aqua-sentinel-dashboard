import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Bell, RefreshCw } from "lucide-react";
import SensorCard from "@/components/SensorCard";
import { generateBuoys, generateAlerts, generateTimeSeriesData, type BuoyData, type AlertData } from "@/lib/sensorData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function DashboardPage() {
  const [buoys, setBuoys] = useState<BuoyData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedBuoy, setSelectedBuoy] = useState<string | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    const b = generateBuoys();
    setBuoys(b);
    setAlerts(generateAlerts(b));
    setTimeSeriesData(generateTimeSeriesData(24));
    if (b.length > 0) setSelectedBuoy(b[0].id);
  }, []);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const b = generateBuoys();
      setBuoys(b);
      setAlerts(generateAlerts(b));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeBuoy = useMemo(() => buoys.find((b) => b.id === selectedBuoy), [buoys, selectedBuoy]);
  const onlineCount = buoys.filter((b) => b.status === "online").length;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && !a.resolved).length;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Monitoring Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time environmental data from all deployed buoys</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-panel-sm px-3 py-2 flex items-center gap-2">
              <div className="status-dot-safe" />
              <span className="text-xs font-mono text-muted-foreground">{onlineCount}/{buoys.length} ONLINE</span>
            </div>
            {criticalAlerts > 0 && (
              <div className="glass-panel-sm px-3 py-2 flex items-center gap-2 glow-danger">
                <Bell className="h-3.5 w-3.5 text-danger" />
                <span className="text-xs font-mono text-danger">{criticalAlerts} CRITICAL</span>
              </div>
            )}
            <button
              onClick={() => {
                const b = generateBuoys();
                setBuoys(b);
                setAlerts(generateAlerts(b));
                setTimeSeriesData(generateTimeSeriesData(24));
              }}
              className="glass-panel-sm p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Buoy selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {buoys.map((buoy) => (
            <button
              key={buoy.id}
              onClick={() => setSelectedBuoy(buoy.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedBuoy === buoy.id
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "glass-panel-sm text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${buoy.status === "online" ? "bg-safe" : buoy.status === "maintenance" ? "bg-warning" : "bg-danger"}`} />
                <span className="font-mono">{buoy.id}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{buoy.lake}</div>
            </button>
          ))}
        </div>

        {/* Sensor Cards */}
        {activeBuoy && (
          <motion.div
            key={activeBuoy.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {activeBuoy.sensors.map((sensor) => (
              <SensorCard key={sensor.label} sensor={sensor} />
            ))}
          </motion.div>
        )}

        {/* Charts + Alerts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Time series chart */}
          <div className="lg:col-span-2 glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">24-Hour Sensor Trends</h3>
              <span className="text-[10px] font-mono text-muted-foreground">LIVE DATA</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis
                  dataKey="time"
                  stroke="hsl(215, 20%, 55%)"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="hsl(215, 20%, 55%)" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222, 47%, 8%)",
                    border: "1px solid hsl(222, 30%, 16%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono",
                  }}
                  labelStyle={{ color: "hsl(210, 40%, 92%)" }}
                />
                <Area type="monotone" dataKey="ph" stroke="hsl(199, 89%, 48%)" fill="url(#phGrad)" strokeWidth={2} name="pH" />
                <Area type="monotone" dataKey="temperature" stroke="hsl(38, 92%, 50%)" fill="url(#tempGrad)" strokeWidth={2} name="Temp °C" />
                <Line type="monotone" dataKey="dissolvedO2" stroke="hsl(142, 71%, 45%)" strokeWidth={1.5} dot={false} name="DO mg/L" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alert feed */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">Recent Alerts</h3>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.severity === "critical"
                      ? "border-danger/30 bg-danger/5"
                      : "border-warning/30 bg-warning/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${alert.severity === "critical" ? "text-danger" : "text-warning"}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-foreground mb-1">{alert.message}</p>
                  <span className="text-[10px] text-muted-foreground font-mono">{alert.buoyName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
