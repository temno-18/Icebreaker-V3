/* Icebreaker access guard. Put on every game/project entry page. */
(function () {
  const cfg = window.SITE_CONFIG;
  if (!cfg) return;

  const key = localStorage.getItem('icebreaker_key');
  const allowed = cfg.userKeys.includes(key) || cfg.adminKeys.includes(key);
  if (!allowed) {
    const here = location.pathname.toLowerCase();
    if (!here.endsWith('/keys.html')) location.replace(getKeysUrl());
  }

  function getKeysUrl() {
    const parts = location.pathname.split('/').filter(Boolean);
    const file = parts.pop() || '';
    const depth = parts.length;
    return '../'.repeat(depth) + 'keys.html';
  }
})();
