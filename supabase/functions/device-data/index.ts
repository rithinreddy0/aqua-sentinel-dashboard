import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const apiKey = req.headers.get("x-device-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing x-device-api-key header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate API key
    const { data: keyData, error: keyError } = await supabase
      .from("device_api_keys")
      .select("device_id, is_active, devices!inner(device_id)")
      .eq("api_key", apiKey)
      .single();

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive API key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      device_id,
      ph,
      turbidity,
      dissolved_oxygen,
      temperature,
      battery,
      signal_strength,
      timestamp,
    } = body;

    // Verify device_id matches the API key's device
    const expectedDeviceId = (keyData as any).devices?.device_id;
    if (device_id && expectedDeviceId && device_id !== expectedDeviceId) {
      return new Response(
        JSON.stringify({ error: "device_id does not match API key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const actualDeviceId = device_id || expectedDeviceId;

    // Insert sensor data
    const { error: insertError } = await supabase.from("sensor_data").insert({
      device_id: actualDeviceId,
      ph,
      turbidity,
      dissolved_oxygen,
      temperature,
      battery,
      signal_strength,
      recorded_at: timestamp || new Date().toISOString(),
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store sensor data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update device status
    await supabase
      .from("devices")
      .update({
        status: "online",
        last_seen: new Date().toISOString(),
        battery: battery ?? undefined,
        signal_strength: signal_strength ?? undefined,
      })
      .eq("device_id", actualDeviceId);

    // Check thresholds and create alerts
    const alertChecks = [
      { param: "pH", value: ph, check: (v: number) => v < 6.5 || v > 8.5, severity: v => (v < 5.5 || v > 9.5) ? "critical" : "warning", msg: "pH level out of safe range" },
      { param: "Turbidity", value: turbidity, check: (v: number) => v > 20, severity: v => v > 40 ? "critical" : "warning", msg: "Turbidity spike detected" },
      { param: "Dissolved O₂", value: dissolved_oxygen, check: (v: number) => v < 6, severity: v => v < 4 ? "critical" : "warning", msg: "Low dissolved oxygen levels" },
      { param: "Temperature", value: temperature, check: (v: number) => v < 15 || v > 25, severity: v => (v < 10 || v > 30) ? "critical" : "warning", msg: "Abnormal water temperature" },
    ];

    for (const ac of alertChecks) {
      if (ac.value != null && ac.check(ac.value)) {
        await supabase.from("alerts").insert({
          device_id: actualDeviceId,
          severity: ac.severity(ac.value),
          parameter: ac.param,
          value: ac.value,
          message: ac.msg,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, device_id: actualDeviceId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("device-data error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
