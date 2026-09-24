/* Icebreaker device/activity tracker
   Creates a browser-scoped Icebreaker ID and sends a heartbeat to Supabase.
   It does not read hardware identifiers. */
(function () {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase) return;

  let deviceId = localStorage.getItem("icebreaker_device_id");
  if (!deviceId) {
    deviceId = (crypto.randomUUID ? crypto.randomUUID() : "ib-" + Date.now() + "-" + Math.random().toString(36).slice(2));
    localStorage.setItem("icebreaker_device_id", deviceId);
  }

  window.ICEBREAKER_DEVICE_ID = deviceId;

  const client = window.supabase.createClient(cfg.url, cfg.anonKey);
  const heartbeatMs = 30000;

  async function heartbeat() {
    try {
      const key = localStorage.getItem("icebreaker_key");
      const role = localStorage.getItem("icebreaker_role") || "guest";
      await client.from("icebreaker_active_users").upsert({
        device_id: deviceId,
        last_seen: new Date().toISOString(),
        current_path: location.pathname,
        role: role,
        has_access_key: !!key
      }, { onConflict: "device_id" });
    } catch (e) {
      console.warn("Icebreaker activity tracker:", e);
    }
  }

  heartbeat();
  setInterval(heartbeat, heartbeatMs);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) heartbeat();
  });
  window.addEventListener("pagehide", heartbeat);
})();
