
const starContainer=document.getElementById("stars");

for(let i=0;i<120;i++){

let star=document.createElement("div");
star.className="star";

star.style.top=Math.random()*100+"vh";
star.style.left=Math.random()*100+"vw";
star.style.animationDuration=(Math.random()*3+1)+"s";

starContainer.appendChild(star);

}
