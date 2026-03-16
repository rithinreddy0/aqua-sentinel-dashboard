import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, Waves, Brain, Shield, ChevronRight, Droplets, Thermometer, Wind, Eye } from "lucide-react";
import heroImage from "@/assets/hero-buoy.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
  }),
};

const features = [
  { icon: Droplets, title: "pH Monitoring", desc: "Continuous tracking of water acidity levels with ±0.01 precision" },
  { icon: Eye, title: "Turbidity Sensing", desc: "Real-time water clarity measurement using optical nephelometry" },
  { icon: Wind, title: "Dissolved Oxygen", desc: "Electrochemical sensing of DO levels critical for aquatic life" },
  { icon: Thermometer, title: "Temperature", desc: "Multi-depth thermal profiling with 0.1°C accuracy" },
];

const howItWorks = [
  { step: "01", title: "IoT Buoys Collect Data", desc: "Solar-powered buoys with embedded sensors transmit readings every 30 seconds via LoRaWAN" },
  { step: "02", title: "Cloud Processing", desc: "Data is ingested into time-series databases and processed through validation pipelines" },
  { step: "03", title: "AI Analysis", desc: "LSTM neural networks analyze patterns and predict environmental threats 24 hours ahead" },
  { step: "04", title: "Alert & Respond", desc: "Authorities receive instant alerts with actionable insights for rapid response" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="AQUA-SENTINEL IoT buoy" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 gradient-mesh" />
        </div>

        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-safe">System Online — 8 Buoys Active</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-foreground">Real-Time</span>
              <br />
              <span className="text-gradient-primary">Water Intelligence</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              AI-powered IoT monitoring system protecting urban lakes from pollution and harmful algal blooms. 24/7 surveillance. Predictive analytics. Instant alerts.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 glow-primary"
              >
                Open Dashboard
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-panel-sm text-foreground font-semibold text-sm hover:bg-accent transition-all"
              >
                View Lake Map
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-3 z-10"
        >
          {[
            { label: "Lakes Monitored", value: "4" },
            { label: "Active Buoys", value: "8" },
            { label: "Data Points/Day", value: "2.8M" },
            { label: "Uptime", value: "99.7%" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="glass-panel-sm px-5 py-3 min-w-[160px]"
            >
              <div className="text-2xl font-mono font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-sm mb-6">
              <Waves className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-medium text-warning">THE PROBLEM</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Urban Lakes Are Dying
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Over 70% of India's urban water bodies are polluted beyond safe limits. Industrial discharge, sewage overflow, and agricultural runoff are destroying aquatic ecosystems — often undetected until it's too late.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 group hover:border-primary/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 inline-flex mb-4 group-hover:glow-primary transition-shadow">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative gradient-mesh">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-sm mb-6">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">HOW IT WORKS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              From Sensor to Decision
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-panel p-6 relative"
              >
                <span className="text-5xl font-mono font-bold text-secondary/80 absolute top-4 right-4">
                  {step.step}
                </span>
                <div className="pt-8">
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-sm mb-6">
              <Brain className="h-3.5 w-3.5 text-safe" />
              <span className="text-xs font-medium text-safe">TECHNOLOGY</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Scale & Reliability
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "IoT Hardware", items: ["LoRaWAN connectivity", "Solar-powered", "IP68 waterproof", "Multi-sensor array"] },
              { icon: Brain, title: "AI Engine", items: ["LSTM neural networks", "24h bloom prediction", "Anomaly detection", "Trend analysis"] },
              { icon: Activity, title: "Cloud Platform", items: ["Real-time dashboards", "Multi-lake support", "Automated alerts", "Report generation"] },
            ].map((tech, i) => (
              <motion.div
                key={tech.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6"
              >
                <tech.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-3">{tech.title}</h3>
                <ul className="space-y-2">
                  {tech.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-foreground">AQUA-SENTINEL</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 AQUA-SENTINEL. AI-powered environmental monitoring.
          </p>
        </div>
      </footer>
    </div>
  );
}
