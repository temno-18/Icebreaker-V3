/* Icebreaker global ban checker. Runs on every protected page. */
(function () {
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/admin.html') || path.endsWith('/blocked.html')) return;

  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase) return;

  let deviceId = localStorage.getItem('icebreaker_device_id');
  if (!deviceId) {
    deviceId = (crypto.randomUUID ? crypto.randomUUID() : 'ib-' + Date.now() + '-' + Math.random().toString(36).slice(2));
    localStorage.setItem('icebreaker_device_id', deviceId);
  }

  const db = window.supabase.createClient(cfg.url, cfg.anonKey);
  let redirecting = false;

  async function checkBan() {
    if (redirecting) return;
    try {
      const { data, error } = await db.rpc('is_icebreaker_banned', { p_device_id: deviceId });
      if (error) throw error;
      if (data === true) {
        redirecting = true;
        location.replace(getBlockedUrl());
      }
    } catch (err) {
      console.warn('Icebreaker ban check failed:', err);
    }
  }

  function getBlockedUrl() {
    const parts = location.pathname.split('/').filter(Boolean);
    parts.pop();
    return '../'.repeat(parts.length) + 'blocked.html';
  }

  checkBan();
  setInterval(checkBan, 30000);
})();
