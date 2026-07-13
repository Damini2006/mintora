// ── APP STATE & ROUTING ──

const S={
  users:JSON.parse(localStorage.getItem('mintora_v4')||'{}'),
  me:null,expenses:[],mood:'necessary',filter:'all',goalEmoji:'🎯'
};
function persist(){
  if(!S.me||S.me.email==='demo@mintora.app') return;
  S.me.expenses=S.expenses;
  S.users[S.me.email]=S.me;
  localStorage.setItem('mintora_v4',JSON.stringify(S.users));
}

// ROUTING
let _cur='page-login';
function goTo(id){
  const prev=document.getElementById(_cur);
  const next=document.getElementById(id);
  prev.classList.remove('active'); prev.classList.add('exit');
  setTimeout(()=>prev.classList.remove('exit'),400);
  next.classList.add('active'); _cur=id;
  const mc=document.getElementById('main'); if(mc) mc.scrollTop=0;
}

// AUTH
function bootDash(){
  const n=S.me.name.split(' ')[0];
  document.getElementById('sn-uname').textContent=n;
  document.getElementById('oh-name').textContent=n;
  document.getElementById('s-email').textContent=S.me.email;
  document.getElementById('f-date').value=td();
  document.getElementById('s-income').value=S.me.income||'';
  document.getElementById('s-goal').value=S.me.savingsGoal||'';
  showTab('overview'); goTo('page-dashboard'); refreshAll();
  toast('Welcome back, '+n+'! ✨');
}

// TABS
function showTab(tab){
  document.querySelectorAll('.sub-page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  const ni=document.getElementById('nav-'+tab);
  if(ni)ni.classList.add('active');
  document.getElementById('main').scrollTop=0;
  if(tab==='overview')refreshOverview();
  if(tab==='pins')renderPins();
  if(tab==='insights')renderInsights();
  if(tab==='goals')renderGoals();
  if(tab==='budget')renderBudget();
  if(tab==='add')renderQuickChips();
}

// EXPENSE
function refreshAll(){refreshOverview();if(document.getElementById('tab-pins').classList.contains('active'))renderPins();if(document.getElementById('tab-insights').classList.contains('active'))renderInsights();if(document.getElementById('tab-goals').classList.contains('active'))renderGoals();if(document.getElementById('tab-budget').classList.contains('active'))renderBudget();}

function refreshOverview(){
  const {income,savingsGoal}=S.me;
  const total=S.expenses.reduce((s,e)=>s+e.amt,0);
  const rem=income-total;
  const spPct=income>0?Math.min(100,(total/income)*100):0;
  const savPct=savingsGoal>0?Math.min(100,(Math.max(0,rem)/savingsGoal)*100):0;
  el('ov-income','₹'+fmt(income));el('ov-spent','₹'+fmt(total));el('ov-rem','₹'+fmt(rem));
  el('ov-spent-pct',Math.round(spPct)+'% of income');el('ov-sav-pct',Math.round(savPct)+'%');el('ov-sav-goal','Goal: ₹'+fmt(savingsGoal));
  setTimeout(()=>{bar('bar-spent',spPct);bar('bar-sav',savPct);},100);
  const rl=document.getElementById('recent-list');
  if(!S.expenses.length){rl.innerHTML='<div style="text-align:center;padding:26px 0;color:var(--t4);font-size:.83rem;">No expenses yet. <a style="color:var(--lav);cursor:pointer;font-weight:600;" onclick="showTab(\'add\')">Add your first →</a></div>';}
  else{rl.innerHTML=S.expenses.slice(0,6).map(e=>`<div class="act-item"><div class="act-ico ${e.mood}">${e.cat.split(' ')[0]}</div><div class="act-inf"><div class="act-n">${e.name}</div><div class="act-c">${e.cat.slice(e.cat.indexOf(' ')+1)}</div></div><div class="act-r"><div class="act-a">₹${fmt(e.amt)}</div><span class="moodtag ${e.mood}">${ml(e.mood)}</span></div></div>`).join('');}
  const mT={necessary:0,impulse:0,luxury:0};
  S.expenses.forEach(e=>mT[e.mood]=(mT[e.mood]||0)+e.amt);
  const bkl=document.getElementById('bk-list');
  if(!total){bkl.innerHTML='<div style="text-align:center;padding:18px 0;color:var(--t4);font-size:.8rem;">Add expenses to see breakdown ✨</div>';}
  else{bkl.innerHTML=[{k:'necessary',l:'Necessary',e:'✅'},{k:'impulse',l:'Impulse',e:'⚡'},{k:'luxury',l:'Luxury',e:'💎'}].map(x=>{
    const v=mT[x.k]||0,p=total?(v/total)*100:0;
    return `<div class="bki"><div class="bkrow"><span class="bkn">${x.e} ${x.l}</span><span class="bkv">₹${fmt(v)}</span></div><div class="bkb"><div class="bkf ${x.k}" style="width:${p}%"></div></div><div class="bkp">${Math.round(p)}% of spending</div></div>`;
  }).join('');}
}

// ── INSIGHT PERIOD ──