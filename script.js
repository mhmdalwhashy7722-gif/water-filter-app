const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzyJFrjJmMXAbTduLb8pSfa-fZmyuLAwa4gs6nudLMSe09zDrwhWi19Rd5yeAcckbTMmw/exec';

let customers = [];
let currentPage = 'home';

async function callAPI(action, params = {}) {
  const url = new URL(SCRIPT_URL);
  url.searchParams.set('action', action);
  for (let key in params) url.searchParams.set(key, params[key]);
  const res = await fetch(url);
  return await res.json();
}

async function loadCustomers() {
  customers = await callAPI('getCustomers');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA');
}

function getMaintenanceStatus(c) {
  if (!c.nextMaintenanceDate) return 'none';
  const next = new Date(c.nextMaintenanceDate);
  const today = new Date(); today.setHours(0,0,0,0);
  if (next < today) return 'overdue';
  if (next.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}

function renderHome() {
  const dueToday = customers.filter(c => getMaintenanceStatus(c) === 'today').length;
  const overdue = customers.filter(c => getMaintenanceStatus(c) === 'overdue').length;
  const sorted = [...customers].sort((a,b) => new Date(a.nextMaintenanceDate) - new Date(b.nextMaintenanceDate));
  const upcomingList = sorted.filter(c => getMaintenanceStatus(c) !== 'overdue').slice(0,5);

  let html = `<h1>?? ≈œ«—… ›·« — «·„Ì«Â</h1>`;
  html += `<div class="card"><input type="text" placeholder="?? »ÕÀ »—ﬁ„ «·ÃÊ«· √Ê «·«”„..." id="searchInput" oninput="searchCustomer(this.value)"></div>`;
  html += `<div class="grid3"><div class="stat"><div class="num">${customers.length}</div><div class="label">≈Ã„«·Ì «·⁄„·«¡</div></div>`;
  html += `<div class="stat"><div class="num">${dueToday}</div><div class="label">„” Õﬁ… «·ÌÊ„</div></div>`;
  html += `<div class="stat"><div class="num">${overdue}</div><div class="label">„ √Œ—…</div></div></div>`;
  html += `<div style="margin:16px 0"><button onclick="switchPage('add')">? ≈÷«›… ⁄„Ì· ÃœÌœ</button></div>`;
  html += `<h3>?? «·√ﬁ—» ··’Ì«‰…</h3><div id="customerList">`;
  upcomingList.forEach(c => html += renderCustomerCard(c));
  html += `</div><div style="margin-top:16px"><button class="outline" onclick="switchPage('due')">?? ⁄—÷ Ã„Ì⁄ «·„” Õﬁ« </button></div>`;
  document.getElementById('app').innerHTML = html;
}

function renderCustomerCard(c) {
  const status = getMaintenanceStatus(c);
  let badge = '', statusText = '';
  if (status === 'overdue') badge = 'overdue', statusText = '„ √Œ—…';
  else if (status === 'today') badge = 'today', statusText = '«·ÌÊ„';
  else if (c.nextMaintenanceDate) badge = 'upcoming', statusText = 'ﬁ«œ„…';
  const badgeHtml = badge ? `<span class="badge ${badge}">${statusText}</span>` : '';
  return `<div class="customer-item"><div class="flex" style="justify-content:space-between"><strong>${c.name}</strong> ${badgeHtml}</div>
    <div style="font-size:0.9rem; color:#64748b">?? ${c.phone} | ?? ${c.neighborhood || '---'}</div>
    <div style="font-size:0.9rem">?? ${c.deviceType} | ??û?? ${c.technicianName}</div>
    ${c.nextMaintenanceDate ? `<div style="margin-top:6px"><strong>«·’Ì«‰… «·ﬁ«œ„…:</strong> ${c.nextMaintenanceDate}</div>` : ''}
  </div>`;
}

function searchCustomer(query) {
  if (!query) return renderHome();
  const filtered = customers.filter(c => c.name.includes(query) || c.phone.includes(query));
  let html = `<h1>?? ‰ «∆Ã «·»ÕÀ</h1><button onclick="switchPage('home')">?? —ÃÊ⁄</button>`;
  if (filtered.length === 0) html += `<p>·«  ÊÃœ ‰ «∆Ã</p>`;
  else filtered.forEach(c => html += renderCustomerCard(c));
  document.getElementById('app').innerHTML = html;
}

function renderAddPage() {
  let html = `<h1>? ≈÷«›… ⁄„Ì·</h1>`;
  html += `<div class="card"><form onsubmit="addCustomer(event)">`;
  html += `<label>«”„ «·⁄„Ì· *</label><input type="text" id="cname" required>`;
  html += `<label>—ﬁ„ «·ÃÊ«· *</label><input type="tel" id="cphone" required>`;
  html += `<label>«·ÕÌ</label><input type="text" id="cneighborhood">`;
  html += `<label>‰Ê⁄ «·ÃÂ«“ *</label><input type="text" id="cdevice" required>`;
  html += `<label> «—ÌŒ «· —ﬂÌ» *</label><input type="date" id="cinstDate" required>`;
  html += `<label>«”„ «·›‰Ì *</label><input type="text" id="ctech" required>`;
  html += `<label>”⁄— «·ÃÂ«“ (—Ì«·)</label><input type="number" id="cprice">`;
  html += `<label>œÊ—… «·’Ì«‰…</label><select id="ccycle"><option value="2">‘Â—Ì‰</option><option value="4">4 √‘Â—</option><option value="6" selected>6 √‘Â—</option><option value="12">”‰…</option></select>`;
  html += `<label>„·«ÕŸ« </label><textarea id="cnotes" rows="2"></textarea>`;
  html += `<button type="submit">?? Õ›Ÿ «·⁄„Ì·</button>`;
  html += `<button type="button" class="outline" onclick="switchPage('home')">? ≈·€«¡</button>`;
  html += `</form></div>`;
  document.getElementById('app').innerHTML = html;
  document.getElementById('cinstDate').value = new Date().toISOString().split('T')[0];
}

async function addCustomer(e) {
  e.preventDefault();
  const name = document.getElementById('cname').value;
  const phone = document.getElementById('cphone').value;
  const neighborhood = document.getElementById('cneighborhood').value;
  const deviceType = document.getElementById('cdevice').value;
  const installationDate = document.getElementById('cinstDate').value;
  const technicianName = document.getElementById('ctech').value;
  const devicePrice = document.getElementById('cprice').value;
  const cycle = parseInt(document.getElementById('ccycle').value);
  const notes = document.getElementById('cnotes').value;
  const nextMaintenance = new Date(installationDate);
  nextMaintenance.setMonth(nextMaintenance.getMonth() + cycle);
  const nextDateStr = nextMaintenance.toISOString().split('T')[0];
  await callAPI('addCustomer', { name, phone, neighborhood, deviceType, installationDate, technicianName, devicePrice, maintenanceCycle: cycle, nextMaintenanceDate: nextDateStr, notes });
  await loadCustomers();
  switchPage('home');
}

function renderDuePage() {
  const today = new Date(); today.setHours(0,0,0,0);
  const overdue = customers.filter(c => getMaintenanceStatus(c) === 'overdue').sort((a,b) => new Date(a.nextMaintenanceDate) - new Date(b.nextMaintenanceDate));
  const todayList = customers.filter(c => getMaintenanceStatus(c) === 'today');
  const upcoming = customers.filter(c => getMaintenanceStatus(c) === 'upcoming').sort((a,b) => new Date(a.nextMaintenanceDate) - new Date(b.nextMaintenanceDate));
  let html = `<h1>?? «·’Ì«‰… «·„” Õﬁ…</h1><button onclick="switchPage('home')">?? —ÃÊ⁄</button>`;
  html += `<div class="grid3" style="margin:16px 0"><div class="stat" onclick="showTab('overdue')"><div class="num">${overdue.length}</div><div class="label">„ √Œ—…</div></div>`;
  html += `<div class="stat" onclick="showTab('today')"><div class="num">${todayList.length}</div><div class="label">«·ÌÊ„</div></div>`;
  html += `<div class="stat" onclick="showTab('upcoming')"><div class="num">${upcoming.length}</div><div class="label">ﬁ«œ„…</div></div></div>`;
  html += `<div id="tabContent"></div>`;
  document.getElementById('app').innerHTML = html;
  window.dueData = { overdue, todayList, upcoming };
  showTab('overdue');
}

function showTab(tab) {
  let list = window.dueData[tab === 'overdue' ? 'overdue' : tab === 'today' ? 'todayList' : 'upcoming'];
  let html = '';
  if (list.length === 0) html = `<p>·«  ÊÃœ ’Ì«‰«  ${tab === 'overdue' ? '„ √Œ—…' : tab === 'today' ? '«·ÌÊ„' : 'ﬁ«œ„…'}</p>`;
  else list.forEach(c => html += renderCustomerCard(c));
  document.getElementById('tabContent').innerHTML = html;
}

async function switchPage(page) {
  currentPage = page;
  if (page === 'home') await loadCustomers(), renderHome();
  else if (page === 'add') renderAddPage();
  else if (page === 'due') renderDuePage();
}

window.onload = async () => { await loadCustomers(); renderHome(); };