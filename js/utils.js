// ── UTILS ──
function td(){return new Date().toISOString().split('T')[0];}
function fmt(n){return(n||0).toLocaleString('en-IN');}
function el(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
function bar(id,p){const e=document.getElementById(id);if(e)e.style.width=p+'%';}
function ml(m){return m==='necessary'?'✅ Necessary':m==='impulse'?'⚡ Impulse':'💎 Luxury';}
function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}
