(function () {
  const cfg = window.SUPABASE_CONFIG;
  const currentPath = window.location.pathname.toLowerCase();
  if (currentPath.endsWith('/admin.html') || currentPath.endsWith('/blocked.html')) return;
  if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.includes('PASTE_YOUR')) return;

  const deviceId = getDeviceId();
  const clientScript = document.createElement('script');
  clientScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  clientScript.onload = async function () {
    try {
      const supabase = window.supabase.createClient(cfg.url, cfg.anonKey);
      await check(supabase);
      setInterval(() => check(supabase), 30000);
    } catch (err) {
      console.warn('Icebreaker ban service failed to initialize:', err);
    }
  };
  clientScript.onerror = function () {
    console.warn('Could not load the Icebreaker ban service.');
  };
  document.head.appendChild(clientScript);

  async function check(supabase) {
    try {
      const { data, error } = await supabase.rpc('is_icebreaker_banned', { p_device_id: deviceId });
      if (error) throw error;
      if (data === true && !window.location.pathname.toLowerCase().endsWith('/blocked.html')) {
        window.location.replace(getBlockedUrl());
      }
    } catch (err) {
      console.warn('Icebreaker ban check failed:', err);
    }
  }

  function getDeviceId() {
    let id = localStorage.getItem('icebreaker_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('icebreaker_device_id', id);
    }
    return id;
  }

  function getBlockedUrl() {
    const relative = window.location.pathname.replace(/^.*?Icebreaker-V3-main\//i, '');
    const depth = Math.max(0, relative.split('/').length - 1);
    return '../'.repeat(depth) + 'blocked.html';
  }
})();
