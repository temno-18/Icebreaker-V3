
const container = document.getElementById("gameContainer");

function displayGames(list){
container.innerHTML="";

list.forEach(game=>{

let card=document.createElement("div");
card.className="gameCard";

card.innerHTML=`<p>${game.name}</p>`;

card.onclick=()=>{
window.open(game.url,"_blank");
};

container.appendChild(card);

});
}

displayGames(games);

function searchGames(){

let input=document.getElementById("search").value.toLowerCase();

let filtered=games.filter(game =>
game.name.toLowerCase().includes(input)
);

displayGames(filtered);

}
