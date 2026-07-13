// ── AUTH ──
function doSignup(){
  const name=document.getElementById('su-name').value.trim();
  const email=document.getElementById('su-email').value.trim();
  const pass=document.getElementById('su-pass').value;
  const err=document.getElementById('su-err'); err.classList.remove('show');
  if(!name||!email||pass.length<6){err.textContent='Fill all fields (password min 6 chars) 🌸';err.classList.add('show');return;}
  if(S.users[email]){err.textContent="That email's taken! 💫";err.classList.add('show');return;}
  S.users[email]={name,email,pass,income:0,savingsGoal:0,expenses:[],goals:[]};
  localStorage.setItem('mintora_v4',JSON.stringify(S.users));
  S.me=S.users[email]; S.expenses=[]; goTo('page-onboard');
}
function doLogin(){
  const email=document.getElementById('li-email').value.trim();
  const pass=document.getElementById('li-pass').value;
  const err=document.getElementById('li-err'); err.classList.remove('show');
  const u=S.users[email];
  if(!u||u.pass!==pass){err.classList.add('show');return;}
  S.me=u; S.expenses=[...(u.expenses||[])];
  if(!u.income){goTo('page-onboard');} else {bootDash();}
}
function doDemo(){
  const today=td();
  const days=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().split('T')[0];};
  S.me={name:'Luna',email:'demo@mintora.app',income:55000,savingsGoal:12000,goals:[
    {id:1,name:'iPhone 16',emoji:'📱',target:80000,saved:24000},
    {id:2,name:'Goa Trip',emoji:'🏖️',target:25000,saved:8500},
    {id:3,name:'Emergency Fund',emoji:'💰',target:100000,saved:42000},
  ],expenses:[
    {id:1,name:'Monthly Rent',amt:15000,cat:'🏠 Housing',mood:'necessary',date:days(0),note:''},
    {id:2,name:'Zomato Dinner',amt:680,cat:'🍵 Food & Drink',mood:'impulse',date:days(0),note:'was craving biryani 😅'},
    {id:3,name:'Netflix',amt:499,cat:'📱 Subscriptions',mood:'luxury',date:days(1),note:''},
    {id:4,name:'Skincare Haul',amt:2200,cat:'💄 Beauty',mood:'luxury',date:days(1),note:'the discount was too good'},
    {id:5,name:'Metro Card',amt:500,cat:'🚌 Transport',mood:'necessary',date:days(2),note:''},
    {id:6,name:'Birthday Outfit',amt:3400,cat:'👗 Fashion',mood:'impulse',date:days(2),note:'slay then pay'},
    {id:7,name:'Groceries',amt:2800,cat:'🛒 Groceries',mood:'necessary',date:days(3),note:''},
    {id:8,name:'Café Hangout',amt:450,cat:'🍵 Food & Drink',mood:'impulse',date:days(3),note:''},
    {id:9,name:'Electricity Bill',amt:1200,cat:'⚡ Utilities',mood:'necessary',date:days(4),note:''},
    {id:10,name:'Spotify',amt:119,cat:'📱 Subscriptions',mood:'luxury',date:days(4),note:''},
    {id:11,name:'Gym Membership',amt:1500,cat:'🏥 Health',mood:'necessary',date:days(5),note:'investing in me 💪'},
    {id:12,name:'Impulse Buy — Earrings',amt:899,cat:'💄 Beauty',mood:'impulse',date:days(6),note:'saw it, needed it'},
  ]};
  S.expenses=[...S.me.expenses];
  bootDash();
}
function doLogout(){
  S.me=null;S.expenses=[];
  document.getElementById('li-email').value='';
  document.getElementById('li-pass').value='';
  goTo('page-login'); toast('Logged out. See you soon! 🌸');
}
function doOnboard(){
  const inc=parseFloat(document.getElementById('ob-income').value)||0;
  const goal=parseFloat(document.getElementById('ob-goal').value)||0;
  S.me.income=inc;S.me.savingsGoal=goal;S.me.expenses=[];S.me.goals=[];S.expenses=[];
  persist();bootDash();toast('Welcome to Mintora! ✨');
}