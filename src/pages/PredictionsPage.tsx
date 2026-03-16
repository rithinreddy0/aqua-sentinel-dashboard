import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import { generateBuoys, generatePredictions, type PredictionData, type BuoyData } from "@/lib/sensorData";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

function RiskGauge({ probability, size = 120 }: { probability: number; size?: number }) {
  const pct = Math.round(probability * 100);
  const color = pct > 60 ? "hsl(0, 84%, 60%)" : pct > 30 ? "hsl(38, 92%, 50%)" : "hsl(142, 71%, 45%)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="100%"
          data={[{ value: pct }]}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" fill={color} cornerRadius={10} background={{ fill: "hsl(222, 30%, 14%)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-mono font-bold text-foreground">{pct}%</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Risk</span>
      </div>
    </div>
  );
}

export default function PredictionsPage() {
  const [buoys, setBuoys] = useState<BuoyData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);

  useEffect(() => {
    const b = generateBuoys();
    setBuoys(b);
    setPredictions(generatePredictions(b));
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Predictions</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            LSTM neural network predictions for algal bloom risk across all monitored buoys
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Shield,
              label: "Avg. Confidence",
              value: predictions.length > 0
                ? `${(predictions.reduce((a, p) => a + p.confidence, 0) / predictions.length * 100).toFixed(1)}%`
                : "—",
              color: "text-primary",
            },
            {
              icon: AlertTriangle,
              label: "High Risk Buoys",
              value: predictions.filter((p) => p.probability > 0.5).length,
              color: "text-danger",
            },
            {
              icon: TrendingUp,
              label: "Forecast Window",
              value: "24h",
              color: "text-safe",
            },
          ].map((card) => (
            <div key={card.label} className="glass-panel p-5 flex items-center gap-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <div>
                <div className="text-xl font-mono font-bold text-foreground">{card.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Prediction cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {predictions.map((pred, i) => {
            const buoy = buoys.find((b) => b.id === pred.buoyId);
            if (!buoy) return null;

            return (
              <motion.div
                key={pred.buoyId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-panel p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{buoy.name}</h3>
                    <span className="text-xs text-muted-foreground">{buoy.lake}</span>
                  </div>
                  <RiskGauge probability={pred.probability} />
                </div>

                <div className="mb-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Algal Bloom Prediction</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-foreground">
                      Confidence: <strong>{(pred.confidence * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                      {pred.forecastWindow} WINDOW
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Contributing Factors</div>
                  {pred.factors.map((f) => (
                    <div key={f.param} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50">
                      <span className="text-xs font-mono font-bold text-warning min-w-[40px]">{f.impact}</span>
                      <div>
                        <div className="text-xs font-medium text-foreground">{f.param}</div>
                        <div className="text-[11px] text-muted-foreground">{f.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
