// =====================
// 💾 SAVE SYSTEM (STABLE)
// =====================
const SAVE_KEY = "myteam_pwa_save_v2";

let game = load() || {
  vc: 50000,
  cards: [],
  market: [],
  lastClaim: 0
};

function save(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }catch(e){
    console.warn("Save failed:", e);
  }
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

// autosave (safe, not spammy)
setInterval(save, 4000);

// =====================
// 🧠 GAME DATA
// =====================
const rarities = [
  "Basic","Rare","Legendary","Golden","Platinum",
  "Ruby","Sapphire","Amethyst","Diamond","RedDiamond","BlackDiamond"
];

// =====================
// 🎲 UTIL
// =====================
function rand(a,b){
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// =====================
// 🎁 PACK SYSTEM
// =====================
function buyPack(){
  const cost = 5000;
  if(game.vc < cost) return alert("Not enough VC");

  game.vc -= cost;
  game.cards.push(genCard());

  render();
  save();
}

// =====================
// 🏀 CARD GENERATION
// =====================
function genCard(){
  let p = PLAYERS[rand(0, PLAYERS.length - 1)];

  let rarityIndex = rand(0, 6); // capped early packs
  let rarity = rarities[rarityIndex];

  let overall = Math.min(99, p.base + rarityIndex * 3 + rand(0,2));
  let value = Math.floor((p.base / 80) * (rarityIndex + 1) * overall * 900);

  return {
    id: Date.now() + Math.random(),
    name: p.name,
    base: p.base,
    rarity,
    overall,
    value
  };
}

// =====================
// 💰 VC CLAIM SYSTEM
// =====================
function claimVC(){
  let now = Date.now();

  if(now - game.lastClaim < 3600000){
    document.getElementById("claimText").innerText =
      "⏳ Cooldown (1 hour)";
    return;
  }

  let totalValue = game.cards.reduce((a,c)=>a + c.value, 0);
  let reward = Math.floor(totalValue * 0.02);

  game.vc += reward;
  game.lastClaim = now;

  document.getElementById("claimText").innerText =
    `💰 +${reward.toLocaleString()} VC`;

  render();
  save();
}

// =====================
// 🧱 UI RENDERING
// =====================

// MAIN RENDER
function render(){
  document.getElementById("vc").innerText =
    game.vc.toLocaleString();

  renderPacks();
  renderCollection();
  renderMarket();
  bots();
}

// PACK UI (FIXED — THIS WAS MISSING BEFORE)
function renderPacks(){
  let el = document.getElementById("packs");

  el.innerHTML = `
    <h2>🎁 Packs</h2>

    <button onclick="buyPack()">Starter Pack (5k)</button>

    <h3>💰 VC System</h3>
    <button onclick="claimVC()">Claim VC</button>
    <p id="claimText"></p>
  `;
}

// COLLECTION UI
function renderCollection(){
  let el = document.getElementById("collection");

  el.innerHTML = "<h2>📦 Collection</h2>";

  game.cards.forEach(c=>{
    el.innerHTML += `
      <div class="card ${c.rarity}">
        <b>${c.name}</b><br>
        ${c.rarity}<br>
        OVR ${c.overall}<br>
        $${c.value.toLocaleString()}
        <br>
        <button onclick="sell(${c.id})">Sell</button>
      </div>
    `;
  });
}

// MARKET UI
function renderMarket(){
  let el = document.getElementById("market");

  el.innerHTML = "<h2>🏪 Market</h2>";

  game.market.forEach(c=>{
    el.innerHTML += `
      <div class="card ${c.rarity}">
        <b>${c.name}</b><br>
        $${c.price.toLocaleString()}<br>
        <button onclick="buy(${c.id})">Buy</button>
      </div>
    `;
  });
}

// =====================
// 🏪 MARKET ACTIONS
// =====================

// SELL
function sell(id){
  let price = prompt("Set price:");
  price = Number(price);

  let i = game.cards.findIndex(c => c.id === id);
  if(i === -1) return;

  let card = game.cards.splice(i,1)[0];

  game.market.push({
    ...card,
    price
  });

  render();
  save();
}

// BUY
function buy(id){
  let i = game.market.findIndex(c => c.id === id);
  if(i === -1) return;

  let card = game.market[i];

  if(game.vc < card.price) return alert("Not enough VC");

  game.vc -= card.price;
  game.cards.push(card);
  game.market.splice(i,1);

  render();
  save();
}

// =====================
// 🤖 BOT SYSTEM
// =====================
function bots(){
  // generate listings
  if(game.market.length < 12){
    let c = genCard();

    game.market.push({
      ...c,
      price: Math.floor(c.value * (0.8 + Math.random() * 0.4))
    });
  }

  // bots buying (light logic)
  for(let i = game.market.length - 1; i >= 0; i--){
    let c = game.market[i];
    let chance = c.value / c.price;

    if(Math.random() < 0.08 * chance){
      game.market.splice(i,1);
    }
  }
}

// =====================
// 🚀 INITIAL RENDER
// =====================
render();
