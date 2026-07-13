// ── EXPENSES ──
function pickMood(m){
  S.mood=m;
  document.querySelectorAll('.mp').forEach(b=>b.classList.remove('active'));
  document.querySelector('.mp.'+m).classList.add('active');
}
function addExpense(){
  const name=document.getElementById('f-name').value.trim();
  const amt=parseFloat(document.getElementById('f-amt').value);
  const cat=document.getElementById('f-cat').value;
  const date=document.getElementById('f-date').value||td();
  const note=document.getElementById('f-note').value.trim();
  if(!name||!amt||amt<=0){toast('Please fill in name & amount 🌸');return;}
  const e={id:Date.now(),name,amt,cat,mood:S.mood,date,note};
  S.expenses.unshift(e);
  persist();refreshAll();renderQuickChips();
  document.getElementById('f-name').value='';
  document.getElementById('f-amt').value='';
  document.getElementById('f-note').value='';
  // check budget alert
  const total=S.expenses.reduce((s,x)=>s+x.amt,0);
  const spPct=S.me.income>0?(total/S.me.income)*100:0;
  if(spPct>80&&document.getElementById('t-alerts')?.checked){
    setTimeout(()=>toast('⚠️ You\'ve hit 80% of your monthly budget!'),1000);
  }
  if(S.mood==='impulse'&&document.getElementById('t-impulse')?.checked){
    const recentImpulse=S.expenses.slice(0,5).filter(x=>x.mood==='impulse').length;
    if(recentImpulse>=3)setTimeout(()=>toast('⚡ 3 impulse buys in a row! Deep breath? 🧘'),1500);
  }
  toast('📌 "'+name+'" pinned! ₹'+fmt(amt));
}
function delExp(id){
  S.expenses=S.expenses.filter(e=>e.id!==id);
  persist();refreshAll();renderPins();toast('Pin removed 🌸');
}
function renderQuickChips(){
  const recent=[...new Map(S.expenses.slice(0,10).map(e=>[e.name,e])).values()].slice(0,5);
  const el=document.getElementById('quick-chips');
  if(!recent.length){el.innerHTML='';return;}
  el.innerHTML='<div style="font-size:.72rem;font-weight:700;color:var(--t3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">Quick Re-add</div><div class="quick-add">'+
    recent.map(e=>`<span class="qa-chip" onclick="quickAdd(${JSON.stringify(e).replace(/"/g,"&quot;")})">${e.cat.split(' ')[0]} ${e.name} · ₹${fmt(e.amt)}</span>`).join('')+'</div>';
}
function quickAdd(e){
  S.expenses.unshift({...e,id:Date.now(),date:td()});
  persist();refreshAll();toast('📌 "'+e.name+'" re-pinned!');
}

// FILTER & SORT
function filterPins(elBtn,f){
  S.filter=f;
  document.querySelectorAll('.fp').forEach(p=>p.classList.remove('active'));
  elBtn.classList.add('active');
  renderPins();
}
function renderPins(){
  let filtered=S.filter==='all'?[...S.expenses]:S.expenses.filter(e=>e.mood===S.filter);
  const sort=document.getElementById('sort-sel')?.value||'date-desc';
  if(sort==='date-asc')filtered.sort((a,b)=>a.date.localeCompare(b.date));
  else if(sort==='amt-desc')filtered.sort((a,b)=>b.amt-a.amt);
  else if(sort==='amt-asc')filtered.sort((a,b)=>a.amt-b.amt);
  document.getElementById('pc-badge').textContent=filtered.length+' pin'+(filtered.length!==1?'s':'');
  const board=document.getElementById('pins-board');
  if(!filtered.length){
    board.innerHTML=`<div class="no-pins"><div class="ni">📌</div><p>${S.filter==='all'?'No pins yet!':'No '+S.filter+' expenses yet.'}</p><button class="bsm" onclick="showTab('add')">Add Expense →</button></div>`;
    return;
  }
  const g=document.createElement('div');g.className='masonry';
  filtered.forEach((e,i)=>{
    const d=new Date(e.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    const c=document.createElement('div');
    c.className='pin-card '+e.mood;c.style.animationDelay=(i*.04)+'s';
    c.innerHTML=`<button class="pdel" onclick="delExp(${e.id})">✕</button>
      <div class="ptr"><div class="pcico">${e.cat.split(' ')[0]}</div><div class="pamt">₹${fmt(e.amt)}</div></div>
      <div class="pname">${e.name}</div>
      <div class="pctext">${e.cat.slice(e.cat.indexOf(' ')+1)}</div>
      ${e.note?`<div class="pnote">"${e.note}"</div>`:''}
      <div class="pfooter"><span class="ptag">${ml(e.mood)}</span><span class="pdate">${d}</span></div>`;
    g.appendChild(c);
  });
  board.innerHTML='';board.appendChild(g);
}

// REFRESH ALL