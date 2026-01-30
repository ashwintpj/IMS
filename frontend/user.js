/* ===================================
   Configuration & State
   =================================== */
const API_BASE_URL = !window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://ims-ia4p.onrender.com';
let currentUser = {
  id: '',
  name: 'Ward Staff',
  role: 'user'
};

/* ===================================
   Initialization
   =================================== */
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token || userType !== 'user') {
    window.location.replace('index.html');
    return;
  }

  // Decode Token to get User ID
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUser.id = payload.sub;
  } catch (e) {
    console.error('Invalid token', e);
    logout();
  }

  showSection('dashboard');
  startLivePolling();
});

let pollingInterval;
function startLivePolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    console.log('Live polling update...');
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn) {
      const sectionId = activeBtn.dataset.section;
      // Refresh current section data in background
      switch (sectionId) {
        case 'dashboard': loadDashboard(); break;
        case 'history': loadHistory(); break;
      }
    }
  }, 30000); // 30 seconds
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  window.location.replace('index.html');
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('active');

  if (menu.children.length === 0) {
    const links = document.querySelector('.nav-links').innerHTML;
    menu.innerHTML = links;
    menu.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => menu.classList.remove('active'));
    });
  }
}

/* ===================================
   Navigation
   =================================== */
function showSection(sectionId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });

  const titles = {
    'dashboard': t('header.ward_dashboard'),
    'new-request': t('nav.new_request'),
    'history': t('nav.history')
  };
  document.getElementById('pageTitle').innerText = titles[sectionId];
  document.getElementById('contentArea').innerHTML = `<p>${t('label.loading')}</p>`;

  switch (sectionId) {
    case 'dashboard': loadDashboard(); break;
    case 'new-request': loadNewRequestForm(); break;
    case 'history': loadHistory(); break;
  }
}

/* ===================================
   API Helper
   =================================== */
async function api(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `API Error ${res.status}`);
  }
  return res.json();
}

/* ===================================
   Dashboard Home
   =================================== */
async function loadDashboard() {
  const requests = await api(`/user/requests/${currentUser.id}`);

  const pending = requests.filter(r => r.status === 'pending').length;
  const dispatch = requests.filter(r => r.status === 'out_for_delivery').length;
  const completed = requests.filter(r => r.status === 'completed').length;

  document.getElementById('contentArea').innerHTML = `
    <div class="dashboard-cards">
      <div class="dashboard-card clickable" onclick="showSection('history')">
        <div class="card-icon pending">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="card-content">
          <div class="card-value ${pending > 0 ? 'alert' : ''}">${pending}</div>
          <div class="card-label">${t('card.pending_requests')}</div>
        </div>
        <div class="card-arrow">→</div>
      </div>

      <div class="dashboard-card clickable" onclick="showSection('history')">
        <div class="card-icon orders">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon></svg>
        </div>
        <div class="card-content">
          <div class="card-value">${dispatch}</div>
          <div class="card-label">${t('card.dispatched')}</div>
        </div>
        <div class="card-arrow">→</div>
      </div>

      <div class="dashboard-card">
        <div class="card-icon inventory">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="card-content">
          <div class="card-value">${completed}</div>
          <div class="card-label">${t('card.completed')}</div>
        </div>
      </div>
    </div>
  `;
}

/* ===================================
   New Multi-Item Request Form
   =================================== */
let currentOrderItems = {}; // { containerId: quantity }
let currentUrgency = 'Normal';

function setUrgency(level) {
  currentUrgency = level;
  document.querySelectorAll('.urgency-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `urg-${level}`);
  });
}

async function loadNewRequestForm() {
  try {
    const containers = await api('/user/containers');
    if (!Array.isArray(containers)) {
      throw new Error('Expected an array of containers but got something else.');
    }
    currentOrderItems = {}; // Reset

    let gridHtml = '';
    containers.forEach(c => {
      const hasQtyClass = (currentOrderItems[c.id] > 0) ? 'has-qty' : '';
      gridHtml += `
        <div class="container-card ${hasQtyClass}" id="card_${c.id}">
          <div class="container-info">
            <div class="barcode-wrapper">
              <img src="${c.barcode_image || 'https://via.placeholder.com/120x60?text=Scan+Code'}" alt="Barcode" class="barcode-img">
            </div>
            <div class="container-details">
              <span class="container-name">${t(c.name)}</span>
              <span class="container-barcode">#${c.barcode_number || 'ST-9921'}</span>
            </div>
          </div>
          <div class="qty-control">
            <button type="button" class="btn-qty" onclick="changeQty('${c.id}', -1)">−</button>
            <input type="number" id="qty_${c.id}" value="${currentOrderItems[c.id] || 0}" min="0" class="qty-input" onchange="updateQtyState('${c.id}', this.value)">
            <button type="button" class="btn-qty" onclick="changeQty('${c.id}', 1)">+</button>
          </div>
        </div>
      `;
    });

    document.getElementById('contentArea').innerHTML = `
      <div class="order-container animate-fade-in">
        <div class="order-header">
          <h3>${t('order.header.title')}</h3>
          <p>${t('order.header.subtitle')}</p>
        </div>
        
        <div class="container-grid">
          ${gridHtml}
        </div>

        <div class="flow-controls">
          <div class="urgency-selector">
            <label class="urgency-label">${t('order.urgency.label')}</label>
            <div class="urgency-options">
              <button class="urgency-btn active" id="urg-Normal" onclick="setUrgency('Normal')">${t('urgency.normal')}</button>
              <button class="urgency-btn" id="urg-Urgent" onclick="setUrgency('Urgent')">${t('urgency.urgent')}</button>
            </div>
          </div>

          <button class="btn-primary" style="padding: 16px; font-weight: 700; border-radius: 12px;" onclick="prepareOrderSummary()">${t('btn.generate_summary')}</button>
          
          <div id="orderSummarySection"></div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Container load error:', err);
    document.getElementById('contentArea').innerHTML = `
      <div class="error-msg" style="color: #dc2626; padding: 20px; background: #fef2f2; border-radius: 8px;">
        <strong>${t('error.load_containers')}</strong> ${err.detail || err.message || 'The backend might not be running or the table is missing.'}
      </div>
    `;
  }
}

function changeQty(id, delta) {
  const input = document.getElementById('qty_' + id);
  let val = (parseInt(input.value) || 0) + delta;
  if (val < 0) val = 0;
  input.value = val;
  updateQtyState(id, val);
}

function updateQtyState(id, val) {
  const qty = parseInt(val);
  const card = document.getElementById('card_' + id);
  if (qty > 0) {
    currentOrderItems[id] = qty;
    if (card) card.classList.add('has-qty');
  } else {
    delete currentOrderItems[id];
    if (card) card.classList.remove('has-qty');
  }
}

function setUrgency(level) {
  currentUrgency = level;
  document.querySelectorAll('.urgency-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `urg-${level}`);
  });
}

async function prepareOrderSummary() {
  const containerIds = Object.keys(currentOrderItems);
  if (containerIds.length === 0) {
    alert(t('msg.select_item'));
    return;
  }

  const containers = await api('/user/containers');
  let summaryHtml = `
    <div class="order-summary-card animate-fade-in">
      <h3 style="margin-bottom: 24px; font-weight: 800; font-size: 1.5rem;">${t('order.summary.title')}</h3>
      <div class="summary-items">
  `;

  let totalItems = 0;
  containerIds.forEach(id => {
    const c = containers.find(item => item.id == id);
    const qty = currentOrderItems[id];
    totalItems += qty;
    summaryHtml += `
      <div class="summary-item">
        <span>${t(c.name)}</span>
        <span style="font-weight: 800; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 8px;">${qty} ${t('label.units')}</span>
      </div>
    `;
  });

  summaryHtml += `
      </div>
      <div class="summary-total">
        <span>${t('order.summary.total_qty')}</span>
        <span>${totalItems}</span>
      </div>
      <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; opacity: 0.8;">${t('order.summary.priority')}</span>
        <span style="font-weight: 800; color: ${currentUrgency === 'Urgent' ? '#fecaca' : '#c7d2fe'}">${t(currentUrgency === 'Urgent' ? 'urgency.urgent' : 'urgency.normal').toUpperCase()}</span>
      </div>
      <button class="btn-confirm" onclick="submitMultiRequest()">${t('btn.confirm_submit')}</button>
    </div>
  `;

  const summaryDiv = document.getElementById('orderSummarySection');
  summaryDiv.innerHTML = summaryHtml;
  summaryDiv.scrollIntoView({ behavior: 'smooth' });
}

async function submitMultiRequest() {
  const profile = await api(`/user/profile/${currentUser.id}`).catch(() => ({}));
  const containers = await api('/user/containers');

  const itemsList = Object.keys(currentOrderItems).map(id => {
    const c = containers.find(item => item.id == id);
    return {
      name: c.name,
      quantity: currentOrderItems[id]
    };
  });

  const body = {
    items: itemsList,
    urgency: currentUrgency,
    ordered_by: currentUser.name,
    ordered_by_id: currentUser.id,
    department: profile.department || 'Ward Staff',
    ward: profile.ward || 'General',
    status: 'pending'
  };

  try {
    await api('/user/requests', 'POST', body);
    alert(t('msg.submit_success'));
    currentOrderItems = {};
    showSection('history');
  } catch (err) {
    alert(t('error.submit_fail') + ' ' + (err.detail || 'Connection error'));
  }
}

/* ===================================
   Request History
   =================================== */
async function loadHistory() {
  const requests = await api(`/user/requests/${currentUser.id}`);

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.history_summary')}</th><th>${t('th.history_items')}</th><th>${t('th.status')}</th><th>${t('th.timestamp')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (requests.length === 0) {
    html += `<tr><td colspan="5" style="text-align:center;color:#6b7280">${t('msg.history_empty')}</td></tr>`;
  }

  requests.forEach(r => {
    const statusClass = r.status === 'completed' ? 'active' : r.status === 'out_for_delivery' ? 'info' : r.status === 'rejected' || r.status === 'cancelled' ? 'danger' : 'warning';
    const date = r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Just now';

    // Build items display string
    const itemsStr = (r.items || []).map(i => `${t(i.name)} (${i.quantity})`).join(', ');

    const actionHtml = r.status === 'pending'
      ? `<button class="btn-sm danger" onclick="cancelRequest('${r.id}')">${t('btn.cancel')}</button>`
      : '-';

    html += `<tr>
      <td>${t('label.order_id')}${r.id || 'N/A'} [${t(r.urgency === 'Urgent' ? 'urgency.urgent' : 'urgency.normal')}]</td>
      <td>${itemsStr}</td>
      <td><span class="badge ${statusClass}">${t('status.' + r.status)}</span></td>
      <td>${date}</td>
      <td>${actionHtml}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('contentArea').innerHTML = html;
}

async function cancelRequest(orderId) {
  if (!confirm(t('msg.cancel_confirm'))) return;

  try {
    await api(`/user/requests/${orderId}/cancel`, 'POST');
    alert(t('msg.cancel_success'));
    loadHistory();
  } catch (err) {
    alert(t('error.cancel_fail') + ' ' + err.message);
  }
}
