// ── GOALS ──
function pickGoalEmoji(el){
  document.querySelectorAll('#goal-emojis span').forEach(e=>e.style.background='rgba(255,255,255,.5)');
  el.style.background='var(--lav-l)';
  S.goalEmoji=el.dataset.e;
}
function openGoalModal(){document.getElementById('goal-modal').classList.add('open');}
function closeGoalModal(){document.getElementById('goal-modal').classList.remove('open');}
function saveGoal(){
  const name=document.getElementById('gm-name').value.trim();
  const target=parseFloat(document.getElementById('gm-target').value)||0;
  const saved=parseFloat(document.getElementById('gm-saved').value)||0;
  if(!name||!target){toast('Please fill goal name and target 🌸');return;}
  if(!S.me.goals)S.me.goals=[];
  S.me.goals.push({id:Date.now(),name,emoji:S.goalEmoji,target,saved});
  persist();renderGoals();closeGoalModal();
  document.getElementById('gm-name').value='';document.getElementById('gm-target').value='';document.getElementById('gm-saved').value='';
  toast('🎯 Goal "'+name+'" added!');
}
function deleteGoal(id){
  S.me.goals=(S.me.goals||[]).filter(g=>g.id!==id);
  persist();renderGoals();toast('Goal removed 🌸');
}
function addToGoal(id,amount){
  const g=(S.me.goals||[]).find(x=>x.id===id);
  if(g){g.saved=Math.min(g.target,g.saved+amount);persist();renderGoals();toast('₹'+fmt(amount)+' added to goal! 🎯');}
}
function renderGoals(){
  const goals=S.me.goals||[];
  const grid=document.getElementById('goals-grid');
  if(!goals.length){
    grid.innerHTML='<div class="no-pins" style="grid-column:1/-1;"><div class="ni">🎯</div><p>No goals yet! Set a savings target and track your progress.</p></div>';
    return;
  }
  grid.innerHTML=goals.map((g,i)=>{
    const pct=Math.min(100,(g.saved/g.target)*100);
    const rem=g.target-g.saved;
    return `<div class="goal-card" style="animation-delay:${i*.1}s;">
      <div class="goal-header">
        <div style="display:flex;align-items:center;gap:10px;"><div class="goal-icon" style="background:var(--lav-l);">${g.emoji}</div><div><div class="goal-title">${g.name}</div><div class="goal-target">Target: ₹${fmt(g.target)}</div></div></div>
        <button onclick="deleteGoal(${g.id})" style="background:none;border:none;cursor:pointer;font-size:.8rem;color:var(--t4);padding:4px;">✕</button>
      </div>
      <div class="goal-progress">
        <div class="gp-bar"><div class="gp-fill" style="width:${pct}%;background:${pct>=100?'linear-gradient(90deg,var(--mint),#50d890)':'linear-gradient(90deg,var(--mint),var(--lav))'}"></div></div>
        <div class="gp-row"><span class="gp-saved">₹${fmt(g.saved)} saved</span><span class="gp-pct">${Math.round(pct)}%${pct>=100?' ✅ Done!':' · ₹'+fmt(rem)+' to go'}</span></div>
      </div>
      ${pct<100?`<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">
        <button onclick="addToGoal(${g.id},500)" style="flex:1;padding:7px;background:var(--mint-ll);border:1.5px solid var(--mint);border-radius:var(--r-xs);font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:600;color:var(--mint);cursor:pointer;transition:.2s;" onmouseover="this.style.background='var(--mint-l)'" onmouseout="this.style.background='var(--mint-ll)'">+₹500</button>
        <button onclick="addToGoal(${g.id},1000)" style="flex:1;padding:7px;background:var(--mint-ll);border:1.5px solid var(--mint);border-radius:var(--r-xs);font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:600;color:var(--mint);cursor:pointer;transition:.2s;" onmouseover="this.style.background='var(--mint-l)'" onmouseout="this.style.background='var(--mint-ll)'">+₹1K</button>
        <button onclick="addToGoal(${g.id},5000)" style="flex:1;padding:7px;background:var(--mint-ll);border:1.5px solid var(--mint);border-radius:var(--r-xs);font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:600;color:var(--mint);cursor:pointer;transition:.2s;" onmouseover="this.style.background='var(--mint-l)'" onmouseout="this.style.background='var(--mint-ll)'">+₹5K</button>
      </div>`:'<div style="text-align:center;padding:10px 0;font-size:.82rem;color:var(--mint);font-weight:600;">🎉 Goal achieved! Transfer to your savings account!</div>'}
    </div>`;
  }).join('');
}

// BUDGET PLANNER