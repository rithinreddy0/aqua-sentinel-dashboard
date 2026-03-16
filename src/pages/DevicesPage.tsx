import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Battery, Wifi, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { generateBuoys, type BuoyData } from "@/lib/sensorData";

const statusIcon = {
  online: CheckCircle,
  maintenance: AlertTriangle,
  offline: XCircle,
};
const statusColor = {
  online: "text-safe",
  maintenance: "text-warning",
  offline: "text-danger",
};

export default function DevicesPage() {
  const [buoys, setBuoys] = useState<BuoyData[]>([]);

  useEffect(() => {
    setBuoys(generateBuoys());
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" /> Device Management
          </h1>
          <p className="text-sm text-muted-foreground">Monitor and manage all deployed IoT buoys</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buoys.map((buoy, i) => {
            const StatusIcon = statusIcon[buoy.status];
            return (
              <motion.div
                key={buoy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground font-mono">{buoy.id}</h3>
                    <span className="text-xs text-muted-foreground">{buoy.name} • {buoy.lake}</span>
                  </div>
                  <StatusIcon className={`h-5 w-5 ${statusColor[buoy.status]}`} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Battery className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase">Battery</span>
                    </div>
                    <span className={`text-lg font-mono font-bold ${buoy.battery > 30 ? "text-safe" : "text-danger"}`}>
                      {buoy.battery}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wifi className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase">Signal</span>
                    </div>
                    <span className={`text-lg font-mono font-bold ${buoy.signal > 40 ? "text-primary" : "text-warning"}`}>
                      {buoy.signal}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>FW: {buoy.firmware}</span>
                  <span>Last: {new Date(buoy.lastSeen).toLocaleTimeString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
