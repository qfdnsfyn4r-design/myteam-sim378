const SAVE_KEY = "myteam_pwa_save";

let game = load() || {
  vc: 50000,
  cards: [],
  market: [],
  lastClaim: 0
};

// ---------- SAVE SYSTEM (FIXED) ----------
function save(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function load(){
  try{
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  }catch{
    return null;
  }
}

function manualSave(){
  save();
  alert("Saved!");
}

// autosave
setInterval(save, 3000);

// ---------- TABS ----------
function tab(t){
  ["packs","collection","market"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });
  document.getElementById(t).style.display="block";
  render();
}

// ---------- RARITIES ----------
const rarities = [
"Basic","Rare","Legendary","Golden","Platinum",
"Ruby","Sapphire","Amethyst","Diamond","RedDiamond","BlackDiamond"
];

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}

// ---------- CARD ----------
function genCard(){
  let p = PLAYERS[rand(0,PLAYERS.length-1)];
  let r = rarities[rand(0,3)];

  let idx = rarities.indexOf(r);
  let ovr = Math.min(99, p.base + idx*3 + rand(0,2));

  let value = Math.floor((p.base/80)* (idx+1) * ovr * 1000);

  return {
    id: Date.now()+Math.random(),
    name: p.name,
    base: p.base,
    rarity: r,
    overall: ovr,
    value
  };
}

// ---------- PACK ----------
function buyPack(){
  if(game.vc < 5000) return alert("No VC");

  game.vc -= 5000;
  game.cards.push(genCard());

  render();
  save();
}

// ---------- COLLECTION ----------
function renderCollection(){
  let el = document.getElementById("collection");
  el.innerHTML = "<h2>Collection</h2>";

  game.cards.forEach(c=>{
    el.innerHTML += `
      <div class="card ${c.rarity}">
        <b>${c.name}</b><br>
        ${c.rarity}<br>
        OVR ${c.overall}<br>
        $${c.value}
      </div>`;
  });
}

// ---------- MARKET ----------
function renderMarket(){
  let el = document.getElementById("market");
  el.innerHTML = "<h2>Market</h2>";

  game.market.forEach(c=>{
    el.innerHTML += `
      <div class="card ${c.rarity}">
        <b>${c.name}</b><br>
        $${c.price}
        <button onclick="buy(${c.id})">Buy</button>
      </div>`;
  });
}

// ---------- SELL ----------
function sell(id){
  let price = prompt("Price?");
  let i = game.cards.findIndex(c=>c.id===id);
  let c = game.cards.splice(i,1)[0];

  game.market.push({...c, price:Number(price)});
  render();
  save();
}

// ---------- BUY ----------
function buy(id){
  let i = game.market.findIndex(c=>c.id===id);
  let c = game.market[i];

  if(game.vc < c.price) return;

  game.vc -= c.price;
  game.cards.push(c);
  game.market.splice(i,1);

  render();
  save();
}

// ---------- BOT MARKET ----------
function bots(){
  if(game.market.length < 10){
    let c = genCard();
    game.market.push({
      ...c,
      price: Math.floor(c.value * (0.8 + Math.random()*0.4))
    });
  }
}

// ---------- RENDER ----------
function render(){
  document.getElementById("vc").innerText = game.vc;

  renderCollection();
  renderMarket();
  bots();
}

// INIT
render();