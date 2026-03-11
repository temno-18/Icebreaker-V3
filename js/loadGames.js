const container = document.getElementById("gameContainer");
const search = document.getElementById("search");

function fallbackMarkup(name){
  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return `<div class="thumb-fallback">${letter}</div>`;
}

function createCard(game){
  const card = document.createElement("article");
  card.className = "game-card";

  const safeName = game && game.name ? game.name : "Untitled";
  const safeUrl = game && game.url ? game.url : "#";
  const image = game && game.image ? game.image : "";

  let thumb = image
    ? `<img class="game-thumb" src="${image}" alt="${safeName}" onerror="this.outerHTML='${fallbackMarkup(safeName).replace(/'/g, "&apos;")}'">`
    : fallbackMarkup(safeName);

  card.innerHTML = `
    ${thumb}
    <div class="game-meta">
      <h3 class="game-title">${safeName}</h3>
      <p class="game-url">${safeUrl}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    window.open(safeUrl, "_blank", "noopener,noreferrer");
  });

  return card;
}

function render(list){
  container.innerHTML = "";
  if (!Array.isArray(list) || !list.length) {
    container.innerHTML = `<div class="empty-state">No games matched your search.</div>`;
    return;
  }
  list.forEach(game => container.appendChild(createCard(game)));
}

function searchGames(){
  const q = (search && search.value ? search.value : "").toLowerCase().trim();
  if (!q) return render(games);
  render(games.filter(g => ((g && g.name) ? g.name : "").toLowerCase().includes(q)));
}

render(games);
