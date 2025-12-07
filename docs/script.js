// script.js (simple static behavior)
let PET = null;
let recipes = {};
let harmful = {};

async function loadData() {
  recipes = await fetch('data/recipes.json').then(r=>r.json());
  harmful = await fetch('data/harmful_ingredients.json').then(r=>r.json());
}
loadData();

function choosePet(p) {
  PET = p;
  document.getElementById('home').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('petTitle').innerText = p.toUpperCase();
}

function goHome() {
  document.getElementById('home').classList.remove('hidden');
  document.getElementById('menu').classList.add('hidden');
  hideAll();
}
function goMenu() {
  document.getElementById('menu').classList.remove('hidden');
  hideAll();
}
function hideAll(){
  ['upload','ingredient','tutorial'].forEach(id=>{
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('resultArea').classList.add('hidden');
}

function showTutorial(){
  hideAll();
  document.getElementById('tutorial').classList.remove('hidden');
}

function openUpload(){
  hideAll();
  document.getElementById('upload').classList.remove('hidden');
}

function openIngredientChecker(){
  hideAll();
  document.getElementById('ingredient').classList.remove('hidden');
}

function detectFood(){
  const fileInput = document.getElementById('fileInput');
  if(!fileInput.files || fileInput.files.length===0){
    alert('Please choose an image file first.');
    return;
  }
  const file = fileInput.files[0];
  const url = URL.createObjectURL(file);
  document.getElementById('preview').src = url;
  document.getElementById('resultArea').classList.remove('hidden');

  // simple automatic detection: check filename for keywords
  const name = file.name.toLowerCase();
  let detected = 'unknown';
  const keywords = ['pizza','burger','salmon','rice','cookie','ramen','pasta','chocolate'];
  for(const k of keywords){
    if(name.includes(k)){
      detected = k;
      break;
    }
  }
  document.getElementById('detected').innerText = 'Detected: ' + (detected==='unknown'? 'Unknown' : detected);
  // safety
  const s = computeSafety(detected);
  const safetyEl = document.getElementById('safety');
  if(s.status==='safe') safetyEl.innerHTML = '<div style="color:green">✅ Safe for '+PET+'s</div>';
  else if(s.status==='unsafe') safetyEl.innerHTML = '<div style="color:red">❌ Unsafe: '+s.reasons.join(', ')+'</div>';
  else safetyEl.innerHTML = '<div style="color:orange">⚠️ Caution</div>';

  // show recipe cards if available
  const recipesEl = document.getElementById('recipes');
  recipesEl.innerHTML = '';
  const entry = recipes[detected];
  if(entry){
    const alts = entry.alternatives || [];
    if(alts.length===0){
      recipesEl.innerHTML = '<div class="recipe-card">No alternatives listed.</div>';
    } else {
      alts.forEach(alt=>{
        // alt may be key in recipes[detected].recipes
        const rec = (entry.recipes && entry.recipes[alt]) || recipes[alt];
        if(rec){
          const card = document.createElement('div');
          card.className = 'recipe-card';
          card.innerHTML = `<strong>${rec.title || alt}</strong><div class="small">${rec.ingredients ? rec.ingredients.join(', ') : ''}</div>`;
          card.onclick = ()=>{ alert('Recipe:\\n\\n' + (rec.steps? rec.steps.join('\\n') : 'No steps listed')); };
          recipesEl.appendChild(card);
        }
      });
    }
  } else {
    recipesEl.innerHTML = '<div class="recipe-card">No recipe found in demo dataset.</div>';
  }
}

function computeSafety(foodKey){
  // if foodKey listed under harmful ingredient lists => unsafe
  let reasons = [];
  for(const ing in harmful){
    const arr = harmful[ing];
    if(Array.isArray(arr) && arr.includes(foodKey)){
      reasons.push(ing);
    }
  }
  // also check recipes safe_for
  const rec = recipes[foodKey];
  if(rec && rec.safe_for){
    const petSafe = rec.safe_for[PET];
    if(petSafe===false) return {status:'unsafe', reasons: [rec.reason || 'Listed as unsafe']};
    if(petSafe===true) return {status:'safe', reasons:[]};
  }
  if(reasons.length>0) return {status:'unsafe', reasons: reasons};
  return {status:'caution', reasons: []};
}

function checkIngredient(){
  const ing = document.getElementById('ingInput').value.trim().toLowerCase();
  const el = document.getElementById('ingResult');
  if(!ing){ el.innerText = 'Type an ingredient and press Check.'; return; }
  // harmful is mapping ingredient -> list of foods; if ingredient key exists, it's unsafe
  if(harmful[ing]){
    el.innerHTML = `<div style="color:red">❌ Never give ${ing} to pets. Reason: listed as harmful in DB.</div>`;
  } else {
    el.innerHTML = `<div style="color:green">✅ ${ing} is not listed as harmful in demo DB. Still verify with a vet if unsure.</div>`;
  }
}

