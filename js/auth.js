function checkKey(){
  const input = document.getElementById("keyInput");
  const status = document.getElementById("status");
  const key = (input.value || "").trim();

  if (SITE_CONFIG.userKeys.includes(key)) {
    localStorage.setItem("icebreaker_role", "user");
    localStorage.setItem("icebreaker_key", key);
    window.location.href = SITE_CONFIG.redirectAfterLogin;
    return;
  }

  if (SITE_CONFIG.adminKeys.includes(key)) {
    localStorage.setItem("icebreaker_role", "admin");
    localStorage.setItem("icebreaker_key", key);
    window.location.href = SITE_CONFIG.redirectAfterLogin;
    return;
  }

  status.textContent = "Invalid key.";
}
