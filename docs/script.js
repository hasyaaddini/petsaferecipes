/* script.js — UI behavior (pixel UI) */
/* expects data files at ./data/recipes.json and ./data/harmful_ingredients.json */

let PET = null;
let recipes = {};
let harmful = {};

async function loadData() {
  try {
    recipes = await fetch('./data/recipes.json').then(r=>r.json());
    harmful = await fetch('./data/harmful_ingredients.json').then(r=>r.json());
  } catch(e) {
    console.warn('Could not load data files. Make sure data/recipes.json exists. Error:', e);
    recipes = {};
    harmful = {};
  }
}
loadData();

function choosePet(p){
  PET = p;
  document.getElementById('home').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('petLabel').innerText = p.toUpperCase();
}

function goHome(){
  document.getElementById('home').classList.remove('hidden');
  hideAllScreens();
  document.getElementById('menu').classList.add('hidden');
}
function goMenu(){
  document.getElementById('menu').classList.remove('hidden');
  hideAllScreens();
}
function hideAllScreens(){
  ['upload','ingredient','tutorial'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('resultArea').classList.add('hidden');
}

function openUpload(){
  hideAllScreens();
  document.getElementById('upload').classList.remove('hidden');
}
function openIngredientChecker(){
  hideAllScreens();
  document.getElementById('ingredient').classList.remove('hidden');
}
function showTutorial(){
  hideAllScreens();
  document.getElementById('tutorial').classList.remove('hidden');
}

/* ========== Detection logic ========== */
/* Primary: filename keyword detection (fast + works client-side)
   Secondary: basic color-average heuristic for fallback (very rough).
   This is client-only and works offline on GitHub Pages.
*/

function keywordDetect(filename){
  const name = filename.toLowerCase();
  const keywords = ['pizza','burger','salmon','rice','cookie','ramen','pasta','chocolate','cake','chicken','salad'];
  for(const k of keywords){
    if(name.includes(k)) return k;
  }
  return 'unknown';
}

function averageColorFromImage(file, callback){
  const img = new Image();
  img.onload = function(){
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0,80,80);
    const data = ctx.getImageData(0,0,80,80).data;
    let r=0,g=0,b=0,c=0;
    for(let i=0;i<data.length;i+=4){
      r += data[i]; g += data[i+1]; b += data[i+2]; c++;
    }
    r = Math.round(r/c); g = Math.round(g/c); b = Math.round(b/c);
    callback({r,g,b});
  };
  img.onerror = function(){ callback(null); };
  img.src = URL.createObjectURL(file);
}

function colorHeuristicDetect(avg){
  // Very rough mapping: orange -> pizza/burger, pink -> salmon, white -> rice
  if(!avg) return 'unknown';
  const {r,g,b} = avg;
  if(r>150 && g>100 && b<120) return 'pizza';
  if(r>160 && g>90 && b>90) return 'burger';
  if(r>150 && g<120 && b>120) return 'salmon';
  if(r>200 && g>200 && b>200) return 'plain_rice';
  return 'unknown';
}

/* ========== UI handlers ========== */

async function detectFood(){
  const input = document.getElementById('fileInput');
  if(!input.files || input.files.length===0){
    alert('Please choose an image first.');
    return;
  }
  const file = input.files[0];
  const preview = document.getElementById('preview');
  preview.src = URL.createObjectURL(file);
  document.getElementById('resultArea').classList.remove('hidden');

  // try keyword detection first
  let detected = keywordDetect(file.name);
  let confidence = 0.0;
  if(detected !== 'unknown'){
    confidence = 0.92;
  } else {
    // fallback to color heuristic
    averageColorFromImage(file, (avg)=> {
      let byColor = colorHeuristicDetect(avg);
      if(byColor !== 'unknown'){
        detected = byColor;
        confidence = 0.55;
      } else {
        detected = 'unknown';
        confidence = 0.4;
      }
      showDetectionResult(detected, confidence);
    });
    return;
  }
  showDetectionResult(detected, confidence);
}

function showDetectionResult(detected, confidence){
  document.getElementById('detected').innerText = 'Detected: ' + (detected==='unknown'? 'Unknown' : detected);
  // compute safety
  let safetyBox = document.getElementById('safety');
  let status = computeSafety(detected);
  if(status.status === 'safe'){
    safetyBox.innerHTML = '<div style="color:green">✅ Safe for ' + (PET || 'pet') + 's</div>';
  } else if(status.status === 'unsafe'){
    safetyBox.innerHTML = '<div style="color:red">❌ Unsafe: ' + (status.reasons.join(', ') || 'Listed as harmful') + '</div>';
  } else {
    safetyBox.innerHTML = '<div style="color:orange">⚠️ Caution</div>';
  }
  // nutrition
  const nut = (recipes[detected] && recipes[detected].nutrition) || null;
  const nutEl = document.getElementById('nutrition');
  if(nut){
    nutEl.innerText = `Calories: ${nut.calories || 'N/A'} kcal — Protein: ${nut.protein || 'N/A'} g`;
  } else {
    nutEl.innerText = 'Nutrition: not available in demo dataset';
  }
  // show recipe cards
  renderRecipeCards(detected);
}

function computeSafety(foodKey){
  // check harmful mapping
  let reasons = [];
  for(const ing in harmful){
    const arr = harmful[ing];
    if(Array.isArray(arr) && arr.includes(foodKey)){
      reasons.push(ing);
    }
  }
  // check recipes metadata
  const entry = recipes[foodKey];
  if(entry && entry.safe_for){
    const petSafe = entry.safe_for[(PET||'dog').toLowerCase()];
    if(petSafe === false) return {status:'unsafe', reasons: [entry.reason || 'Listed unsafe']};
    if(petSafe === true) return {status:'safe', reasons: []};
  }
  if(reasons.length>0) return {status:'unsafe', reasons: reasons};
  return {status:'caution', reasons: reasons};
}

function renderRecipeCards(foodKey){
  const container = document.getElementById('recipeCards');
  container.innerHTML = '';
  const entry = recipes[foodKey];
  if(entry && entry.alternatives){
    entry.alternatives.forEach(alt=>{
      const r = (entry.recipes && entry.recipes[alt]) || recipes[alt] || null;
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `<strong>${r ? (r.title || alt) : alt}</strong>
                        <div class="small">${r ? (r.ingredients||[]).slice(0,3).join(', ') : ''}</div>`;
      card.onclick = ()=>{ showRecipeDetail(r || {title: alt, steps: ['No steps listed']}); };
      container.appendChild(card);
    });
  } else {
    // fallback: suggest some safe recipes (first 2 items in recipes that are safe)
    let count=0;
    for(const k in recipes){
      if(count>=3) break;
      const e = recipes[k];
      if(e && e.safe_for && e.safe_for[(PET||'dog').toLowerCase()]){
        const c = document.createElement('div');
        c.className = 'recipe-card';
        c.innerHTML = `<strong>${e.pet_safe || e.title || k}</strong><div class="small">${(e.recipes ? Object.keys(e.recipes).slice(0,1).join(',') : '')}</div>`;
        c.onclick = ()=>{ showRecipeDetail(e.recipes ? e.recipes[Object.keys(e.recipes)[0]] : e); };
        container.appendChild(c);
        count++;
      }
    }
    if(count===0){
      container.innerHTML = '<div class="recipe-card">No alternatives found in demo dataset.</div>';
    }
  }
}

function showRecipeDetail(recipe){
  if(!recipe){ alert('No recipe details available.'); return; }
  let text = `${recipe.title || 'Recipe'}\n\nIngredients:\n`;
  (recipe.ingredients||[]).forEach(i=> text += '- '+i + '\n');
  text += '\nSteps:\n';
  (recipe.steps||[]).forEach((s,idx)=> text += `${idx+1}. ${s}\n`);
  alert(text);
}

/* Ingredient checker */
function checkIngredient(){
  const ing = (document.getElementById('ingInput').value || '').trim().toLowerCase();
  const out = document.getElementById('ingResult');
  if(!ing){ out.innerText = 'Type an ingredient and press Check.'; return; }
  if(harmful[ing]){
    out.innerHTML = `<div style="color:red">❌ Never give ${ing} to pets. Listed as harmful.</div>`;
  } else {
    out.innerHTML = `<div style="color:green">✅ ${ing} is not listed in demo harmful DB. Verify with a vet for special cases.</div>`;
  }
}
