const container = document.getElementById("gameContainer");
const search = document.getElementById("search");

function createCard(game) {
  const card = document.createElement("article");
  card.className = "game-card";
  const title = game.title || "Untitled";
  const link = game.link || "#";
  const imgSrc = game.imgSrc || "";

  card.innerHTML = `
    ${imgSrc ? `<img class="game-thumb" src="../${imgSrc}" alt="${escapeHtml(title)}" loading="lazy">` : ""}
    <div class="game-meta">
      <h3 class="game-title">${escapeHtml(title)}</h3>
      <p class="game-url">Ready to play</p>
    </div>
  `;
  card.addEventListener("click", () => { window.location.href = "../" + link; });
  return card;
}
function renderGames(list) {
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = `<div class="empty-state">No games found.</div>`;
    return;
  }
  list.forEach(game => container.appendChild(createCard(game)));
}
function searchGames() {
  const q = (search?.value || "").toLowerCase().trim();
  renderGames(!q ? games : games.filter(g => (g.title || "").toLowerCase().includes(q)));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
renderGames(games);
