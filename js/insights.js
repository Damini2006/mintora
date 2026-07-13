// ── AI INSIGHTS ──
let insightPeriod='month';
function setInsightPeriod(p,btn){
  insightPeriod=p;
  document.querySelectorAll('.ip-pill').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderInsights();
}
function getFilteredExpenses(){
  const now=new Date();
  if(insightPeriod==='week'){const d=new Date();d.setDate(d.getDate()-7);return S.expenses.filter(e=>new Date(e.date)>=d);}
  if(insightPeriod==='month'){const y=now.getFullYear(),mo=now.getMonth();return S.expenses.filter(e=>{const d=new Date(e.date);return d.getFullYear()===y&&d.getMonth()===mo;});}
  return S.expenses;
}

// ── AI CHAT ──
let aiChatHistory=[];
let aiChatOpen=false;

async function runAIAnalysis(){
  const btn=document.getElementById('ai-refresh-btn');
  document.getElementById('ai-btn-icon').textContent='⏳';
  document.getElementById('ai-btn-text').textContent='Analysing…';
  btn.classList.add('loading');
  openAIChat();
  const exps=getFilteredExpenses();
  const {income,savingsGoal}=S.me;
  const total=exps.reduce((s,e)=>s+e.amt,0);
  const mT={necessary:0,impulse:0,luxury:0};
  exps.forEach(e=>mT[e.mood]=(mT[e.mood]||0)+e.amt);
  const cats={};exps.forEach(e=>cats[e.cat]=(cats[e.cat]||0)+e.amt);
  const topCats=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const rem=income-total;
  const spPct=income>0?Math.round((total/income)*100):0;
  const sys=`You are Mintora's AI money coach — warm, Gen Z-friendly, casual with occasional emojis. Give specific, actionable advice. Keep responses to 2-3 short paragraphs max. Use ₹ for amounts.`;
  const userMsg=`My ${insightPeriod==='month'?'monthly':insightPeriod==='week'?'weekly':'all-time'} spending:\n- Total: ₹${total.toLocaleString('en-IN')} (${spPct}% of ₹${income.toLocaleString('en-IN')} income)\n- Remaining: ₹${rem.toLocaleString('en-IN')}\n- Savings goal: ₹${savingsGoal.toLocaleString('en-IN')}\n- Necessary ₹${mT.necessary.toLocaleString('en-IN')}, Impulse ₹${mT.impulse.toLocaleString('en-IN')}, Luxury ₹${mT.luxury.toLocaleString('en-IN')}\n- Top categories: ${topCats.map(([c,v])=>c.slice(c.indexOf(' ')+1)+' ₹'+v.toLocaleString('en-IN')).join(', ')}\n- Transactions: ${exps.length}\n\nGive me a personalised financial health check with 2-3 specific insights and one actionable tip!`;
  aiChatHistory=[{role:'user',content:userMsg}];
  await callClaude(sys,aiChatHistory);
  btn.classList.remove('loading');
  document.getElementById('ai-btn-icon').textContent='✨';
  document.getElementById('ai-btn-text').textContent='Ask AI Coach';
}

function openAIChat(){
  const panel=document.getElementById('ai-chat-panel');
  panel.style.display='block';
  aiChatOpen=true;
  const qpDiv=document.getElementById('ai-quick-prompts');
  if(!qpDiv.children.length){
    ['Where can I cut spending? ✂️','How to hit my savings goal? 🎯','Analyse my impulse buys ⚡','Budget plan for next month? 📅','Am I spending too much? 🤔'].forEach(q=>{
      const b=document.createElement('button');b.className='ai-qp';b.textContent=q;
      b.onclick=()=>askQuickPrompt(q);qpDiv.appendChild(b);
    });
  }
}
function closeAIChat(){document.getElementById('ai-chat-panel').style.display='none';aiChatOpen=false;}
function askQuickPrompt(q){document.getElementById('ai-chat-input').value=q;sendAIMessage();}

async function sendAIMessage(){
  const inp=document.getElementById('ai-chat-input');
  const msg=inp.value.trim();if(!msg)return;
  inp.value='';
  if(!aiChatOpen)openAIChat();
  const body=document.getElementById('ai-chat-body');
  const uDiv=document.createElement('div');uDiv.className='ai-msg user';uDiv.textContent=msg;
  body.appendChild(uDiv);body.scrollTop=body.scrollHeight;
  const exps=getFilteredExpenses();
  const {income,savingsGoal}=S.me;
  const total=exps.reduce((s,e)=>s+e.amt,0);
  const mT={necessary:0,impulse:0,luxury:0};exps.forEach(e=>mT[e.mood]=(mT[e.mood]||0)+e.amt);
  const cats={};exps.forEach(e=>cats[e.cat]=(cats[e.cat]||0)+e.amt);
  const topCats=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const sys=`You are Mintora's AI money coach. Context: Income ₹${income.toLocaleString('en-IN')}, Goal ₹${savingsGoal.toLocaleString('en-IN')}, Spent ₹${total.toLocaleString('en-IN')}, Cats: ${topCats.map(([c,v])=>c.slice(c.indexOf(' ')+1)+' ₹'+v.toLocaleString('en-IN')).join(', ')}, Necessary ₹${mT.necessary.toLocaleString('en-IN')}, Impulse ₹${mT.impulse.toLocaleString('en-IN')}, Luxury ₹${mT.luxury.toLocaleString('en-IN')}. Be warm, concise (1-2 paras). Use ₹.`;
  aiChatHistory.push({role:'user',content:msg});
  await callClaude(sys,aiChatHistory);
}

async function callClaude(sys,messages){
  const body=document.getElementById('ai-chat-body');
  const thinking=document.getElementById('ai-thinking');
  thinking.style.display='flex';body.scrollTop=body.scrollHeight;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,system:sys,messages:messages})
    });
    const data=await res.json();
    thinking.style.display='none';
    const reply=data.content?.[0]?.text||'Hmm, couldn\'t reach my brain right now! Try again 🌸';
    aiChatHistory.push({role:'assistant',content:reply});
    const mDiv=document.createElement('div');mDiv.className='ai-msg assistant';
    mDiv.innerHTML=reply.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    body.appendChild(mDiv);body.scrollTop=body.scrollHeight;
  }catch(e){
    thinking.style.display='none';
    const eDiv=document.createElement('div');eDiv.className='ai-msg assistant';
    eDiv.textContent='Having trouble connecting right now. Check your network and try again! 🌸';
    body.appendChild(eDiv);body.scrollTop=body.scrollHeight;
  }
}

// ── TIPS ──
let tipIdx=0;
const allTips=[
  'Automate savings on payday — transfer before you can spend it! 🏦',
  'The 50/30/20 rule: 50% needs, 30% wants, 20% savings. Check yours!',
  'Unsubscribe from shopping emails — out of sight, out of cart! 🛒',
  'Before impulse buys, ask: "Will this bring me joy in 6 months?" 🤔',
  'Track your small spends — daily ₹100-200 adds up to thousands!',
  'Review subscriptions monthly — you might be paying for forgotten ones 📱',
  'Meal prep on Sundays — #1 way Gen Z cuts food spending 🥗',
  'Use the "one in, one out" rule for fashion 👗',
  'Set up fun money — guilt-free spending within a fixed budget 🎉',
  '₹200/day coffee = ₹6,000/month = ₹72,000/year ☕ Think about it!',
  'Pay yourself first — save BEFORE lifestyle spending 💰',
  'Use cash-back cards responsibly — earn while you spend 💳',
  'The 24-hour rule: wait a day before purchases over ₹1000 ⏰',
  'Your savings rate matters more than your income level 📈',
  'Comparison shopping takes 5 mins and saves ₹500+ 🔍'
];
function nextTip(){tipIdx=(tipIdx+1)%allTips.length;document.getElementById('tip-text').textContent=allTips[tipIdx];}

// ── RENDER INSIGHTS ──
function renderInsights(){
  const expenses=getFilteredExpenses();
  const total=expenses.reduce((s,e)=>s+e.amt,0);
  const {income,savingsGoal}=S.me;
  const mT={necessary:0,impulse:0,luxury:0};
  expenses.forEach(e=>mT[e.mood]=(mT[e.mood]||0)+e.amt);
  const igEl=document.getElementById('ig');
  const statRow=document.getElementById('ins-stat-row');

  if(!expenses.length){
    document.getElementById('hero-title').textContent='Ready to analyse! 🌱';
    document.getElementById('hero-desc').textContent='Add your first expense and I\'ll generate your full financial health report.';
    document.getElementById('hero-badges').innerHTML='';
    igEl.innerHTML='<div class="ins-card" style="grid-column:1/-1;text-align:center;padding:32px;"><div class="ai-badge">✨ AI</div><h3 style="margin:14px 0 8px;">No data yet</h3><p>Your insights appear here after logging expenses. Hit <strong>Ask Claude</strong> for personalised advice anytime!</p><button class="bsm" onclick="showTab(\'add\')" style="margin-top:16px;">+ Add First Expense</button></div>';
    statRow.innerHTML='';
    ['weekly-chart','sf-panel','trend-panel','smart-recs'].forEach(id=>document.getElementById(id).style.display='none');
    const tipEl=document.getElementById('tip-strip');tipEl.style.display='flex';
    tipIdx=Math.floor(Math.random()*allTips.length);
    document.getElementById('tip-text').textContent=allTips[tipIdx];
    document.getElementById('score-ring').style.strokeDashoffset=239;
    document.getElementById('score-num').textContent='—';
    return;
  }

  // Score
  const spPct=income>0?(total/income)*100:0;
  const impPct=total?(mT.impulse/total)*100:0;
  const luxPct=total?(mT.luxury/total)*100:0;
  const rem=income-total;
  let score=100;
  if(spPct>90)score-=35;else if(spPct>75)score-=20;else if(spPct>60)score-=10;else if(spPct>45)score-=5;
  if(impPct>50)score-=25;else if(impPct>35)score-=15;else if(impPct>20)score-=8;
  if(luxPct>40)score-=15;else if(luxPct>25)score-=8;
  if((S.me.goals||[]).length>0)score+=5;
  if(savingsGoal>0&&rem>=savingsGoal)score+=8;
  score=Math.max(10,Math.min(100,score));
  const scoreColor=score>=75?'#7bbf9a':score>=50?'#f4a76f':'#e8829a';
  const scoreLabel=score>=80?'Excellent 🌟':score>=65?'Good 💚':score>=50?'Fair ⚡':score>=35?'Needs Work 🌱':'Critical 🚨';
  document.getElementById('score-num').textContent=score;
  document.getElementById('score-num').style.color=scoreColor;
  const ring=document.getElementById('score-ring');
  ring.style.strokeDashoffset=239;ring.style.stroke=scoreColor;
  setTimeout(()=>ring.style.strokeDashoffset=239-(score/100)*239,200);
  document.getElementById('hero-title').textContent=score>=75?'Your finances are glowing! ✨':score>=50?'Doing okay — room to grow 🌱':'Time for a financial reset 🚨';
  document.getElementById('hero-desc').textContent=`Health Score: ${score}/100 — ${scoreLabel}. ${score>=75?'Crushing your money goals!':score>=50?'A few tweaks and you\'ll be in great shape.':'Let\'s work together to get back on track.'}`;
  const badges=[];
  if(impPct<20)badges.push({t:'Mindful Spender 🧘',c:'good'});
  if(spPct<60)badges.push({t:'Budget Champion 🏆',c:'good'});
  if(savingsGoal>0&&rem>=savingsGoal)badges.push({t:'Savings Goal Hit! 🎯',c:'good'});
  if(impPct>40)badges.push({t:'Impulse Alert ⚡',c:'alert'});
  if(spPct>80)badges.push({t:'Over Budget ⚠️',c:'warn'});
  document.getElementById('hero-badges').innerHTML=badges.map(b=>`<span class="hero-badge hb-${b.c}">${b.t}</span>`).join('');

  // Stat row
  const avgTxn=expenses.length>0?Math.round(total/expenses.length):0;
  const today0=new Date().getDate();
  const dailyAvg=today0>0?Math.round(total/today0):0;
  statRow.innerHTML=[
    {v:'₹'+fmt(total),l:'Total Spent',s:''},
    {v:'₹'+fmt(rem<0?0:rem),l:'Remaining',s:rem<0?'color:var(--blush)':'color:var(--mint)'},
    {v:expenses.length,l:'Transactions',s:''},
    {v:'₹'+fmt(dailyAvg),l:'Daily Avg',s:''}
  ].map((s,i)=>`<div class="ins-stat" style="animation-delay:${i*.07}s"><div class="ins-stat-val" style="${s.s}">${s.v}</div><div class="ins-stat-lbl">${s.l}</div></div>`).join('');

  // Insight cards
  const cats={};expenses.forEach(e=>cats[e.cat]=(cats[e.cat]||0)+e.amt);
  const topCats=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
  const impulseCount=expenses.filter(e=>e.mood==='impulse').length;
  const avgImpulse=impulseCount>0?Math.round(mT.impulse/impulseCount):0;
  const cards=[];
  if(spPct>90)cards.push({sev:'alert',i:'🚨',t:'Budget Crisis Mode',p:`Spent <strong>${Math.round(spPct)}%</strong> of income. Only ₹${fmt(Math.max(0,rem))} left. Pause non-essential spending immediately.`});
  else if(spPct>75)cards.push({sev:'warn',i:'⚠️',t:'High Spending Alert',p:`At <strong>${Math.round(spPct)}%</strong> budget used. ₹${fmt(rem)} remaining. Stick to essentials only.`});
  else if(spPct>55)cards.push({sev:'warn',i:'📊',t:'Steady — Watch It',p:`<strong>${Math.round(spPct)}%</strong> of income spent. Keep remaining under ₹${fmt(income*0.25)}.`});
  else cards.push({sev:'good',i:'🌟',t:'Budget Champion!',p:`Only <strong>${Math.round(spPct)}%</strong> of income spent. Pacing beautifully!`});
  if(impPct>40)cards.push({sev:'alert',i:'⚡',t:'Impulse Spending High',p:`<strong>${Math.round(impPct)}%</strong> impulse (${impulseCount} txns, avg ₹${fmt(avgImpulse)}). Try the 24-hour rule for items over ₹500.`});
  else if(impPct>25)cards.push({sev:'warn',i:'⚡',t:'Impulse Check',p:`${impulseCount} impulse buys totalling ₹${fmt(mT.impulse)}. Avg: ₹${fmt(avgImpulse)} each. Ask: need or want?`});
  else cards.push({sev:'good',i:'🧘',t:'Mindful Spender!',p:`Only <strong>${Math.round(impPct)}%</strong> impulse spending — incredibly intentional! ${impulseCount} buys averaging ₹${fmt(avgImpulse)}.`});
  if(topCats.length>0){
    const [t1,t2]=topCats;
    const t1p=total?(t1[1]/total)*100:0;
    cards.push({sev:t1p>40?'warn':'good',i:'📊',t:'Category Deep Dive',p:`Top: <strong>${t1[0].slice(t1[0].indexOf(' ')+1)}</strong> ₹${fmt(t1[1])} (${Math.round(t1p)}%)${t2?`. Runner-up: <strong>${t2[0].slice(t2[0].indexOf(' ')+1)}</strong> ₹${fmt(t2[1])}`:''}. ${t1p>40?'Consider spreading across categories.':'Healthy distribution!'}`});
  }
  if(savingsGoal>0){
    const today2=new Date().getDate();
    const projEOM=income-(total/Math.max(today2,1))*30;
    if(rem>=savingsGoal)cards.push({sev:'good',i:'🎯',t:'Savings Goal Hit!',p:`On track to save <strong>₹${fmt(rem)}</strong> — exceeds ₹${fmt(savingsGoal)} goal by ₹${fmt(rem-savingsGoal)}! Transfer to savings NOW 💪`});
    else if(projEOM>=savingsGoal)cards.push({sev:'good',i:'📈',t:'Savings Reachable',p:`Projected: ~₹${fmt(Math.round(projEOM))} left at month-end. Need ₹${fmt(savingsGoal-rem)} more. Tighten this week!`});
    else cards.push({sev:'warn',i:'💰',t:'Savings Goal At Risk',p:`May miss ₹${fmt(savingsGoal)} goal. Need to cut ₹${fmt(Math.abs(savingsGoal-rem))} more spending.`});
  }
  if(luxPct>0)cards.push({sev:luxPct>35?'warn':'good',i:'💎',t:'Luxury Lens',p:`₹${fmt(mT.luxury)} on luxury (${Math.round(luxPct)}%). ${luxPct>35?'Consider which luxuries truly spark joy.':'Balanced treating!'} Budget one luxury/month for guilt-free spending.`});
  const last7=expenses.filter(e=>(new Date()-new Date(e.date))/(864e5)<=7);
  if(last7.length>0){const w7=last7.reduce((s,e)=>s+e.amt,0);cards.push({sev:'good',i:'📅',t:'Last 7 Days',p:`<strong>₹${fmt(w7)}</strong> over ${last7.length} transactions (~₹${fmt(Math.round(w7/7))}/day). ${w7>income*0.5?'That weekly rate exceeds monthly budget — slow down!':'Looking sustainable!'}`});}
  igEl.innerHTML=cards.slice(0,6).map((c,i)=>`<div class="ins-card" style="animation-delay:${i*.07}s"><div class="ai-badge"><span class="severity sev-${c.sev}"></span>✨ Insight</div><h3>${c.i} ${c.t}</h3><p>${c.p}</p></div>`).join('');

  // Weekly chart
  const wc=document.getElementById('weekly-chart');wc.style.display='block';
  const days7=[0,1,2,3,4,5,6].map(n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().split('T')[0];}).reverse();
  const dayLabels=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayAmts=days7.map(d=>S.expenses.filter(e=>e.date===d).reduce((s,e)=>s+e.amt,0));
  const maxAmt=Math.max(...dayAmts,1);
  document.getElementById('wc-total').textContent='₹'+fmt(dayAmts.reduce((a,b)=>a+b,0))+' this week';
  document.getElementById('wc-bars').innerHTML=days7.map((d,i)=>{
    const pct=(dayAmts[i]/maxAmt)*100;
    const dayName=dayLabels[new Date(d+'T00:00:00').getDay()];
    const isMax=dayAmts[i]===Math.max(...dayAmts)&&dayAmts[i]>0;
    return `<div class="wc-bar-wrap"><div class="wc-amt">${dayAmts[i]>0?'₹'+fmt(dayAmts[i]):''}</div><div class="wc-bar" style="height:${Math.max(pct,4)}%;background:${isMax?'linear-gradient(180deg,var(--blush),var(--peach))':'linear-gradient(180deg,var(--lav),var(--mint))'}"></div><div class="wc-day">${dayName}</div></div>`;
  }).join('');

  // Trend comparison
  const trend=document.getElementById('trend-panel');
  if(S.expenses.length>=3){
    trend.style.display='block';
    const now=new Date();
    const [cm,cy]=[now.getMonth(),now.getFullYear()];
    const pm=cm===0?11:cm-1,py=cm===0?cy-1:cy;
    const thisT=S.expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===cm&&d.getFullYear()===cy;}).reduce((s,e)=>s+e.amt,0);
    const prevT=S.expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===pm&&d.getFullYear()===py;}).reduce((s,e)=>s+e.amt,0);
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const mxT=Math.max(thisT,prevT,1);
    const change=prevT>0?Math.round(((thisT-prevT)/prevT)*100):null;
    document.getElementById('trend-content').innerHTML=`
      ${prevT>0?`<div class="trend-bar-row"><div class="trend-label">${months[pm]}</div><div class="trend-bar-outer"><div class="trend-bar-inner" style="width:${(prevT/mxT)*100}%;background:linear-gradient(90deg,rgba(155,141,218,.5),rgba(123,191,154,.5))"></div></div><div class="trend-val">₹${fmt(prevT)}</div></div>`:''}
      <div class="trend-bar-row"><div class="trend-label">${months[cm]} (now)</div><div class="trend-bar-outer"><div class="trend-bar-inner" style="width:${(thisT/mxT)*100}%;background:linear-gradient(90deg,var(--lav),var(--mint))"></div></div><div class="trend-val">₹${fmt(thisT)}</div></div>
      ${change!==null?`<div style="margin-top:12px;padding:10px;background:${change<=0?'rgba(123,191,154,.1)':'rgba(232,130,154,.08)'};border-radius:var(--r-xs);font-size:.8rem;color:${change<=0?'var(--mint)':'var(--blush)'};font-weight:500;">${change<=0?'📉 Spending down '+Math.abs(change)+'% vs last month! 🎉':'📈 Spending up '+Math.abs(change)+'% vs last month. Let\'s tighten up!'}</div>`:''}`;
  }else{trend.style.display='none';}

  // Forecast
  const sf=document.getElementById('sf-panel');sf.style.display='block';
  const today2=new Date().getDate();
  const dailyAvgFc=today2>0?total/today2:0;
  const projected=Math.round(dailyAvgFc*30);
  const safeDailyLimit=income>0?Math.round((income-(savingsGoal||0))/30):0;
  document.getElementById('sf-content').innerHTML=`
    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;text-align:center;padding:14px;background:rgba(255,255,255,.5);border-radius:var(--r-sm);">
        <div style="font-size:.63rem;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">Projected Month</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.4rem;color:${projected>income?'var(--blush)':'var(--mint)'}">₹${fmt(projected)}</div>
        <div style="font-size:.7rem;color:var(--t3);">${projected>income?'Over budget ⚠️':'On track ✅'}</div>
      </div>
      <div style="flex:1;min-width:100px;text-align:center;padding:14px;background:rgba(255,255,255,.5);border-radius:var(--r-sm);">
        <div style="font-size:.63rem;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">Daily Average</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--lav)">₹${fmt(Math.round(dailyAvgFc))}</div>
        <div style="font-size:.7rem;color:var(--t3);">per day</div>
      </div>
      <div style="flex:1;min-width:100px;text-align:center;padding:14px;background:rgba(255,255,255,.5);border-radius:var(--r-sm);">
        <div style="font-size:.63rem;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">Safe Daily</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.4rem;color:${safeDailyLimit>0&&dailyAvgFc>safeDailyLimit?'var(--blush)':'var(--mint)'}">₹${fmt(safeDailyLimit)}</div>
        <div style="font-size:.7rem;color:var(--t3);">${safeDailyLimit>0&&dailyAvgFc>safeDailyLimit?'Currently over 😬':'to hit savings goal'}</div>
      </div>
    </div>
    ${topCats.slice(0,5).map(([cat,amt])=>{const proj=Math.round(amt/Math.max(today2,1)*30);const pct=Math.min(100,(proj/Math.max(income,1))*100);return `<div class="sf-bar-wrap"><span class="sf-label">${cat.split(' ')[0]} ${cat.slice(cat.indexOf(' ')+1).substring(0,9)}</span><div class="sf-bar"><div class="sf-fill" style="width:${pct}%;background:${pct>30?'linear-gradient(90deg,var(--blush),var(--peach))':'linear-gradient(90deg,var(--lav),var(--mint))'}"></div></div><span class="sf-val">₹${fmt(proj)}</span></div>`;}).join('')}`;

  // Smart recs
  const srPanel=document.getElementById('smart-recs');srPanel.style.display='block';
  const recs=[];
  if(impPct>25)recs.push({t:'Set an Impulse Budget',b:`You've spent ₹${fmt(mT.impulse)} impulsively. Try a monthly impulse budget of ₹${fmt(Math.round(income*0.05))} to stay mindful.`,cls:'warn',action:'View Budget',tab:'budget'});
  if(spPct<50&&savingsGoal>0&&rem>savingsGoal)recs.push({t:'Invest Your Surplus! 📈',b:`You have ₹${fmt(rem-savingsGoal)} extra beyond your savings goal! Consider SIPs or FDs for compound growth.`,cls:'good',action:'View Goals',tab:'goals'});
  if(topCats[0]&&(topCats[0][1]/total)>0.4)recs.push({t:'Diversify Spending',b:`${topCats[0][0].slice(topCats[0][0].indexOf(' ')+1)} takes ${Math.round((topCats[0][1]/total)*100)}% of budget. Try capping it at 30%.`,cls:'warn',action:'Budget Planner',tab:'budget'});
  if(expenses.length>0&&safeDailyLimit>0&&dailyAvgFc>safeDailyLimit)recs.push({t:'Daily Limit Alert 🚦',b:`Spending ₹${fmt(Math.round(dailyAvgFc))}/day but need ₹${fmt(safeDailyLimit)}/day to hit savings goal.`,cls:'alert',action:'Set Goal',tab:'goals'});
  if(score>=80)recs.push({t:'You\'re a Money Star! ⭐',b:'Excellent financial health! Level-up: max your SIP, build a 6-month emergency fund, or explore index funds.',cls:'good',action:null,tab:null});
  if(!recs.length)recs.push({t:'Keep Going! 🌱',b:'Log more expenses for personalised recommendations. More data = smarter insights!',cls:'good',action:'Add Expense',tab:'add'});
  document.getElementById('smart-recs-content').innerHTML=recs.slice(0,4).map(r=>`<div class="smart-rec-item"><div class="sr-ico sr-${r.cls}">${r.cls==='good'?'✅':r.cls==='warn'?'⚠️':'🚨'}</div><div style="flex:1;"><div class="sr-title">${r.t}</div><div class="sr-body">${r.b}</div>${r.action?`<button class="sr-action" onclick="showTab('${r.tab}')">${r.action} →</button>`:''}</div></div>`).join('');

  // Tip
  const tipEl=document.getElementById('tip-strip');
  if(document.getElementById('t-tips')?.checked!==false){
    tipEl.style.display='flex';
    tipIdx=(expenses.length+new Date().getDate())%allTips.length;
    document.getElementById('tip-text').textContent=allTips[tipIdx];
  }
}


// GOALS