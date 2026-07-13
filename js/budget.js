// ── BUDGET ──
function renderBudget(){
  const total=S.expenses.reduce((s,e)=>s+e.amt,0);
  const cats={};S.expenses.forEach(e=>cats[e.cat]=(cats[e.cat]||0)+e.amt);
  const sortedCats=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
  const catColors=['#7bbf9a','#9b8dda','#e8829a','#f4a76f','#74b9e8','#c5b8f8','#a8eac4','#fde0e7'];
  const bcEl=document.getElementById('budget-cats');
  if(!sortedCats.length){bcEl.innerHTML='<div style="text-align:center;padding:24px 0;color:var(--t4);font-size:.82rem;">No spending data yet</div>';}
  else{bcEl.innerHTML=sortedCats.map(([cat,amt],i)=>{
    const pct=total?(amt/total)*100:0;
    return `<div class="budget-cat-row"><div class="bc-ico" style="background:${catColors[i%catColors.length]}22;">${cat.split(' ')[0]}</div><div class="bc-info"><div class="bc-name">${cat.slice(cat.indexOf(' ')+1)}</div><div class="bc-pb"><div class="bc-fill" style="width:${pct}%;background:${catColors[i%catColors.length]}"></div></div></div><div class="bc-right"><div class="bc-amt">₹${fmt(amt)}</div><div class="bc-pct">${Math.round(pct)}%</div></div></div>`;
  }).join('');}
  const {income,savingsGoal}=S.me;
  const rem=income-total;
  const bsEl=document.getElementById('budget-summary');
  bsEl.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(180,170,220,.1);"><span style="font-size:.84rem;color:var(--t2);">Monthly Income</span><span style="font-size:.92rem;font-weight:600;color:var(--mint);">₹${fmt(income)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(180,170,220,.1);"><span style="font-size:.84rem;color:var(--t2);">Total Spent</span><span style="font-size:.92rem;font-weight:600;color:var(--blush);">−₹${fmt(total)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(180,170,220,.1);"><span style="font-size:.84rem;color:var(--t2);">Savings Goal</span><span style="font-size:.92rem;font-weight:600;color:var(--lav);">₹${fmt(savingsGoal)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;"><span style="font-size:.84rem;font-weight:600;color:var(--t1);">Remaining</span><span style="font-size:1.05rem;font-weight:700;color:${rem>=0?'var(--mint)':'var(--blush)'};">₹${fmt(rem)}</span></div>
      <div style="padding:12px;background:${rem>=savingsGoal?'rgba(123,191,154,.1)':'rgba(232,130,154,.07)'};border-radius:var(--r-xs);font-size:.8rem;color:${rem>=savingsGoal?'var(--mint)':'var(--blush)'};font-weight:500;text-align:center;">
        ${rem>=savingsGoal?'🎯 Savings goal is achievable this month!':'⚠️ Reduce spending to hit your savings goal'}
      </div>
    </div>`;
  const mT={necessary:0,impulse:0,luxury:0};
  S.expenses.forEach(e=>mT[e.mood]=(mT[e.mood]||0)+e.amt);
  const mwEl=document.getElementById('mood-wheel');
  const moods=[{k:'necessary',e:'✅',l:'Necessary',c:'var(--mint)'},{k:'impulse',e:'⚡',l:'Impulse',c:'var(--blush)'},{k:'luxury',e:'💎',l:'Luxury',c:'var(--lav)'}];
  mwEl.innerHTML=moods.map(m=>{
    const v=mT[m.k]||0,p=total?(v/total)*100:0;
    return `<div class="mw-item"><span class="mw-emoji">${m.e}</span><div class="mw-label" style="color:${m.c}">${m.l}</div><div class="mw-amt">₹${fmt(v)}</div><div class="mw-pct">${Math.round(p)}%</div></div>`;
  }).join('');
}

// SETTINGS
function saveSettings(){
  S.me.income=parseFloat(document.getElementById('s-income').value)||0;
  S.me.savingsGoal=parseFloat(document.getElementById('s-goal').value)||0;
  persist();refreshAll();toast('Settings saved! ✨');
}
function clearAll(){
  if(!confirm('Clear all pins? This cannot be undone.'))return;
  S.expenses=[];persist();refreshAll();renderPins();toast('All pins cleared 🧹');
}

// UTILS