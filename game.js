const SAVE_KEY = "myteam_save_v3";

let game = load() || {
  vc: 50000,
  cards: [],
  market: [],
  lastClaim: 0
};

function save(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function load(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY));}
  catch{return null;}
}

function manualSave(){ save(); alert("Saved!"); }
setInterval(save, 4000);

const rarities = ["Basic","Rare","Legendary","Golden","Platinum","Ruby","Sapphire","Amethyst","Diamond","RedDiamond","BlackDiamond"];

function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

const packs = {
  starter:{cost:5000,max:3,name:"Starter Pack (Max Gold)"},
  pro:{cost:30000,max:7,name:"Pro Pack (Max Amethyst)"},
  elite:{cost:75000,max:8,name:"Elite Pack (Max Diamond)"},
  goat:{cost:200000,min:8,max:10,name:"🔥 GOAT Pack (Diamond+)"}
};

function genCard(type){
  let p = PLAYERS[rand(0,PLAYERS.length-1)];
  let pack = packs[type];

  let idx = pack.min ? rand(pack.min, pack.max) : rand(0, pack.max);
  if(p.base < 80 && idx >= 8) idx = 7;

  let overall = Math.min(99, p.base + idx*3 + rand(0,2));
  let value = Math.floor((p.base/80)*(idx+1)*overall*1000);

  return {id:Date.now()+Math.random(),name:p.name,rarity:rarities[idx],overall,value};
}

function buyPack(type){
  let p = packs[type];
  if(game.vc < p.cost) return alert("Not enough VC");

  game.vc -= p.cost;
  let card = genCard(type);

  playPackAnimation(card,()=>{
    game.cards.push(card);
    render();
    save();
  });
}

function playPackAnimation(card, done){
  let overlay = document.createElement("div");
  overlay.id="packAnim";

  overlay.innerHTML = `<div class="animBox"><div class="glow ${card.rarity}"></div><p>Opening...</p></div>`;
  document.body.appendChild(overlay);

  setTimeout(()=>{
    overlay.innerHTML = `
      <div class="animBox">
        <div class="card ${card.rarity}">
          <b>${card.name}</b><br>
          ${card.rarity}<br>
          OVR ${card.overall}
        </div>
        <p>Tap to continue</p>
      </div>`;

    overlay.onclick=()=>{
      overlay.remove();
      done();
    };
  },1200);
}

function claimVC(){
  let now = Date.now();
  if(now - game.lastClaim < 3600000){
    document.getElementById("claimText").innerText="Cooldown";
    return;
  }

  let total = game.cards.reduce((a,c)=>a+c.value,0);
  let reward = Math.floor(total*0.02);

  game.vc += reward;
  game.lastClaim = now;

  document.getElementById("claimText").innerText = `+${reward} VC`;
  render(); save();
}

function renderPacks(){
  let el = document.getElementById("packs");
  el.innerHTML = "<h2>Packs</h2>";

  Object.keys(packs).forEach(k=>{
    let p = packs[k];
    el.innerHTML += `<button onclick="buyPack('${k}')">${p.name} - ${p.cost}</button>`;
  });

  el.innerHTML += `<h3>VC</h3><button onclick="claimVC()">Claim</button><p id="claimText"></p>`;
}

function renderCollection(){
  let el = document.getElementById("collection");
  el.innerHTML="<h2>Collection</h2>";

  game.cards.forEach(c=>{
    el.innerHTML+=`
      <div class="card ${c.rarity}">
        ${c.name}<br>${c.rarity}<br>OVR ${c.overall}<br>$${c.value}
        <br><button onclick="sell(${c.id})">Sell</button>
      </div>`;
  });
}

function renderMarket(){
  let el=document.getElementById("market");
  el.innerHTML="<h2>Market</h2>";

  game.market.forEach(c=>{
    el.innerHTML+=`
      <div class="card ${c.rarity}">
        ${c.name}<br>$${c.price}
        <br><button onclick="buy(${c.id})">Buy</button>
      </div>`;
  });
}

function sell(id){
  let price = Number(prompt("Price?"));
  let i = game.cards.findIndex(c=>c.id===id);
  let c = game.cards.splice(i,1)[0];

  game.market.push({...c,price});
  render(); save();
}

function buy(id){
  let i = game.market.findIndex(c=>c.id===id);
  let c = game.market[i];
  if(game.vc < c.price) return;

  game.vc -= c.price;
  game.cards.push(c);
  game.market.splice(i,1);

  render(); save();
}

function bots(){
  if(game.market.length < 12){
    let c = genCard("starter");
    game.market.push({...c,price:Math.floor(c.value*(0.8+Math.random()*0.4))});
  }

  for(let i=game.market.length-1;i>=0;i--){
    let c = game.market[i];
    if(Math.random()<0.05) game.market.splice(i,1);
  }
}

function render(){
  document.getElementById("vc").innerText=game.vc;
  renderPacks();
  renderCollection();
  renderMarket();
  bots();
}

render();
