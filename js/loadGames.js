const container = document.getElementById("gameContainer");
const search = document.getElementById("search");

function createCard(game) {
  const card = document.createElement("article");
  card.className = "game-card";

  const title = game.title || "Untitled";
  const link = game.link || "#";

  // use provided imgSrc OR auto-load jpg from file
  const imgSrc = game.imgSrc || `images/${title.toLowerCase().replace(/\s+/g, "-")}.jpg`;

  const thumb = `
    <img class="game-thumb" src="../${imgSrc}" alt="${title}" onerror="this.style.display='none'">
  `;

  card.innerHTML = `
    ${thumb}
    <div class="game-meta">
      <h3 class="game-title">${title}</h3>
      <p class="game-url">${link}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    window.location.href = "../" + link;
  });

  return card;
}

function renderGames(list) {
  container.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `<div class="empty-state">No games found.</div>`;
    return;
  }

  list.forEach((game) => {
    container.appendChild(createCard(game));
  });
}

function searchGames() {
  const query = (search?.value || "").toLowerCase().trim();

  if (!query) {
    renderGames(games);
    return;
  }

  const filtered = games.filter((game) =>
    (game.title || "").toLowerCase().includes(query)
  );

  renderGames(filtered);
}

renderGames(games);
