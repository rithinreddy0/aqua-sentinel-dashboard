import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Battery, Wifi, CheckCircle, AlertTriangle, XCircle, Plus, Key, Copy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Device {
  id: string;
  device_id: string;
  device_name: string;
  lake: string;
  latitude: number;
  longitude: number;
  status: string;
  firmware_version: string | null;
  battery: number | null;
  signal_strength: number | null;
  last_seen: string | null;
  sampling_interval: number | null;
  transmission_interval: number | null;
}

interface ApiKey {
  id: string;
  api_key: string;
  is_active: boolean | null;
  created_at: string;
}

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
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey[]>>({});

  // Form state
  const [form, setForm] = useState({
    device_id: "",
    device_name: "",
    lake: "",
    latitude: "",
    longitude: "",
  });

  const fetchDevices = async () => {
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDevices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchApiKeys = async (deviceDbId: string) => {
    const { data } = await supabase
      .from("device_api_keys")
      .select("*")
      .eq("device_id", deviceDbId);
    if (data) setApiKeys((prev) => ({ ...prev, [deviceDbId]: data }));
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("devices").insert({
      device_id: form.device_id,
      device_name: form.device_name,
      lake: form.lake,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      created_by: user?.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Device registered!" });
      setShowAddForm(false);
      setForm({ device_id: "", device_name: "", lake: "", latitude: "", longitude: "" });
      fetchDevices();
    }
  };

  const generateApiKey = async (deviceDbId: string) => {
    const { error } = await supabase
      .from("device_api_keys")
      .insert({ device_id: deviceDbId });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "API key generated!" });
      fetchApiKeys(deviceDbId);
    }
  };

  const deleteDevice = async (id: string) => {
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Device deleted" });
      fetchDevices();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" /> Device Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {devices.length} registered devices
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 glow-primary"
            >
              <Plus className="h-4 w-4" /> Register Device
            </button>
          )}
        </div>

        {/* Add Device Form */}
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddDevice}
            className="glass-panel p-6 mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { key: "device_id", label: "Device ID", placeholder: "BUOY_001" },
              { key: "device_name", label: "Device Name", placeholder: "Lake Alpha Buoy 1" },
              { key: "lake", label: "Lake Name", placeholder: "Hussain Sagar" },
              { key: "latitude", label: "Latitude", placeholder: "17.4239", type: "number" },
              { key: "longitude", label: "Longitude", placeholder: "78.4738", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  step={field.type === "number" ? "any" : undefined}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ))}
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                Register
              </button>
            </div>
          </motion.form>
        )}

        {/* ESP32 API Info */}
        {isAdmin && (
          <div className="glass-panel p-5 mb-6">
            <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> ESP32 API Endpoint
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <code className="text-xs font-mono bg-secondary px-3 py-1.5 rounded-lg text-primary flex-1 overflow-x-auto">
                POST {supabaseUrl}/functions/v1/device-data
              </code>
              <button
                onClick={() => copyToClipboard(`${supabaseUrl}/functions/v1/device-data`)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Header: <code className="bg-secondary px-1 rounded">x-device-api-key: YOUR_API_KEY</code>
            </p>
          </div>
        )}

        {/* Device Grid */}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 glass-panel">
            <Cpu className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No devices registered yet.</p>
            {isAdmin && <p className="text-xs mt-1">Click "Register Device" to add your first ESP32 buoy.</p>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device, i) => {
              const StatusIcon = statusIcon[device.status as keyof typeof statusIcon] || XCircle;
              const sColor = statusColor[device.status as keyof typeof statusColor] || "text-danger";
              const isExpanded = selectedDevice === device.id;

              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground font-mono">{device.device_id}</h3>
                      <span className="text-xs text-muted-foreground">
                        {device.device_name} • {device.lake}
                      </span>
                    </div>
                    <StatusIcon className={`h-5 w-5 ${sColor}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Battery className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase">Battery</span>
                      </div>
                      <span className={`text-lg font-mono font-bold ${(device.battery ?? 100) > 30 ? "text-safe" : "text-danger"}`}>
                        {device.battery ?? "—"}%
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Wifi className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase">Signal</span>
                      </div>
                      <span className="text-lg font-mono font-bold text-primary">
                        {device.signal_strength ?? "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mb-3">
                    <span>FW: {device.firmware_version}</span>
                    <span>
                      {device.last_seen
                        ? `Last: ${new Date(device.last_seen).toLocaleTimeString()}`
                        : "Never seen"}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (isExpanded) {
                            setSelectedDevice(null);
                          } else {
                            setSelectedDevice(device.id);
                            fetchApiKeys(device.id);
                          }
                        }}
                        className="flex-1 text-xs py-1.5 rounded-lg glass-panel-sm text-primary hover:bg-accent transition-colors flex items-center justify-center gap-1"
                      >
                        <Key className="h-3 w-3" /> API Keys
                      </button>
                      <button
                        onClick={() => deleteDevice(device.id)}
                        className="px-3 py-1.5 rounded-lg glass-panel-sm text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* API Keys Panel */}
                  {isExpanded && isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Device API Keys</span>
                        <button
                          onClick={() => generateApiKey(device.id)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          + Generate Key
                        </button>
                      </div>
                      {(apiKeys[device.id] || []).map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary mb-1"
                        >
                          <code className="text-[10px] font-mono text-foreground flex-1 truncate">
                            {key.api_key}
                          </code>
                          <button
                            onClick={() => copyToClipboard(key.api_key)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {(!apiKeys[device.id] || apiKeys[device.id].length === 0) && (
                        <p className="text-[10px] text-muted-foreground">No keys yet. Generate one to connect your ESP32.</p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ESP32 Code Example */}
        {isAdmin && (
          <div className="glass-panel p-6 mt-8">
            <h3 className="font-semibold text-foreground text-sm mb-4">ESP32 Arduino Example</h3>
            <pre className="text-[11px] font-mono text-muted-foreground bg-secondary p-4 rounded-lg overflow-x-auto whitespace-pre">
{`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "${supabaseUrl}/functions/v1/device-data";
const char* apiKey = "YOUR_DEVICE_API_KEY";
const char* deviceId = "BUOY_001";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected to WiFi");
}

void sendSensorData(float ph, float turbidity, float dissolvedO2, float temp, int battery) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-api-key", apiKey);

  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["ph"] = ph;
  doc["turbidity"] = turbidity;
  doc["dissolved_oxygen"] = dissolvedO2;
  doc["temperature"] = temp;
  doc["battery"] = battery;
  doc["signal_strength"] = WiFi.RSSI();

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  Serial.printf("HTTP Response: %d\\n", httpCode);
  http.end();
}

void loop() {
  // Replace with actual sensor readings
  float ph = 7.2 + random(-10, 10) / 100.0;
  float turbidity = 12.0 + random(-5, 5);
  float dissolvedO2 = 6.5 + random(-10, 10) / 10.0;
  float temp = 25.0 + random(-20, 20) / 10.0;
  int battery = 88;

  sendSensorData(ph, turbidity, dissolvedO2, temp, battery);
  delay(30000); // Send every 30 seconds
}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
