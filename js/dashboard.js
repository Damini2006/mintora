// ── DASHBOARD ──
// Tab rendering is triggered from showTab() in app.js
// This file handles any dashboard-specific UI helpers

function renderDashboardGreeting() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const nameEl = document.getElementById('oh-name');
  if (nameEl && S.me) {
    nameEl.textContent = S.me.name.split(' ')[0];
  }
  const greetEl = document.getElementById('oh-greet');
  if (greetEl) greetEl.textContent = greet;
}
