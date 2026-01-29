/* ===================================
   Configuration & State
   =================================== */
const API_BASE_URL = 'https://ims-ia4p.onrender.com';
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
  document.getElementById('contentArea').innerHTML = '<p>Loading...</p>';

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
   New Request Form
   =================================== */
async function loadNewRequestForm() {
  const items = await api('/user/inventory');

  let optionsHtml = '<option value="">Select Item...</option>';
  items.forEach(i => {
    optionsHtml += `<option value="${i.name}">${i.name} (Available: ${i.quantity} ${i.unit})</option>`;
  });

  document.getElementById('contentArea').innerHTML = `
    <div class="card profile-card">
      <form onsubmit="submitRequest(event)">
        <div class="form-group">
          <label>${t('label.item')}</label>
          <select id="reqItem" class="form-control" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px;" required>
            ${optionsHtml}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>${t('label.quantity')}</label>
            <input type="number" id="reqQty" min="1" value="10" required>
          </div>
          <div class="form-group">
            <label>Urgency</label>
            <select id="reqUrgency" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px;">
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>${t('label.ward')}</label>
          <input type="text" id="reqDept" value="Ward A" placeholder="e.g. ICU, Ward A" required>
        </div>

        <button type="submit" class="btn-primary">${t('btn.submit')}</button>
      </form>
    </div>
  `;
}

async function submitRequest(e) {
  e.preventDefault();

  const item_name = document.getElementById('reqItem').value;
  const quantity = parseInt(document.getElementById('reqQty').value);
  const department = document.getElementById('reqDept').value;

  // Check available stock
  const items = await api('/user/inventory');
  const selectedItem = items.find(i => i.name === item_name);
  if (selectedItem && quantity > selectedItem.quantity) {
    if (!confirm(`Warning: Requested quantity (${quantity}) exceeds available stock (${selectedItem.quantity}).`)) {
      return;
    }
  }

  const body = {
    item_name,
    quantity,
    department,
    ordered_by: currentUser.name,
    ordered_by_id: currentUser.id,
    status: 'pending'
  };

  try {
    await api('/user/requests', 'POST', body);
    alert('Request submitted successfully!');
    showSection('history');
  } catch (err) {
    alert('Error submitting request: ' + (err.detail || 'Insufficient stock or connection error'));
  }
}

/* ===================================
   Request History
   =================================== */
async function loadHistory() {
  const requests = await api(`/user/requests/${currentUser.id}`);

  // Sort by date desc (if I had created_at in response, but assuming mongo order is roughly clear)
  // requests.reverse(); 

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.item')}</th><th>${t('th.qty')}</th><th>${t('th.status')}</th><th>${t('th.timestamp')}</th></tr></thead>
        <tbody>
  `;

  if (requests.length === 0) {
    html += `<tr><td colspan="4" style="text-align:center;color:#6b7280">${t('nav.history')} (0)</td></tr>`;
  }

  requests.forEach(r => {
    const statusClass = r.status === 'completed' ? 'active' : r.status === 'out_for_delivery' ? 'info' : 'warning';
    // Mock date if not present
    const date = r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Just now';

    html += `<tr>
      <td>${r.item_name}</td>
      <td>${r.quantity}</td>
      <td><span class="badge ${statusClass}">${t('status.' + r.status)}</span></td>
      <td>${date}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('contentArea').innerHTML = html;
}
