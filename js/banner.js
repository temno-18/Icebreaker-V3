(function(){
  const el = document.getElementById("siteBanner");
  if (el && window.SITE_CONFIG) el.textContent = SITE_CONFIG.banner;
})();
