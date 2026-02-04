/* ===================================
   Configuration
   =================================== */
const API_BASE_URL = 'https://ims-ia4p.onrender.com';
let currentAdminId = '';

/* ===================================
   Initialization
   =================================== */
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token || userType !== 'admin') {
    window.location.replace('index.html');
    return;
  }

  // Decode token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentAdminId = payload.sub;
  } catch (e) {
    console.error('Invalid token', e);
    logout();
  }

  // Initial Load
  showSection('dashboard');
  startLivePolling();
});

let pollingInterval;
function startLivePolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    console.log('Live polling update...');
    const activeBtn = document.querySelector('.nav-links .nav-btn.active');
    if (activeBtn) {
      const sectionId = activeBtn.dataset.section;
      // Refresh current section data in background
      switch (sectionId) {
        case 'dashboard': loadDashboard(); break;
        case 'orders': loadOrders('all'); break;
        case 'stock': loadStock(); break;
        case 'approvals': loadPendingUsers(); break;
        case 'delivery': loadDeliveryPersonnel(); break;
        case 'distributions': loadDistributions(); break;
        case 'logs': loadLogs(); break;
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

  // Always refresh content to update language label
  const links = document.querySelector('.nav-links').innerHTML;
  const currentLang = localStorage.getItem('lang') || 'en';
  const langLabel = currentLang === 'en' ? '🌐 日本語に切替' : '🌐 Switch to English';

  menu.innerHTML = links + `
    <button class="nav-btn lang-mobile" onclick="toggleLanguage(); document.getElementById('mobileMenu').classList.remove('active');" style="border-top:1px solid #e5e7eb; margin-top:8px; padding-top:16px;">
      🌐 ${currentLang === 'en' ? '日本語に切替' : 'Switch to English'}
    </button>
    <button class="nav-btn logout-mobile" onclick="logout()" style="color:#dc2626;">
      🚪 ${t('nav.logout')}
    </button>
  `;

  // Add click listeners to close menu on selection
  menu.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      menu.classList.remove('active');
    });
  });
}

/* ===================================
   Navigation
   =================================== */
function showSection(sectionId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });

  const titles = {
    'dashboard': t('header.clinical_dashboard'),
    'profile': t('nav.profile'),
    'orders': t('card.container_requests'),
    'stock': t('nav.inventory'),
    'approvals': t('nav.approvals'),
    'users': t('nav.users'),
    'delivery': t('nav.delivery'),
    'distributions': t('nav.history'),
    'logs': t('nav.logs')
  };
  document.getElementById('pageTitle').innerText = titles[sectionId] || t('header.dashboard');
  document.getElementById('dynamicHeader').innerHTML = ''; // Clear tools by default
  document.getElementById('contentArea').innerHTML = `<p>${t('label.loading')}</p>`;

  switch (sectionId) {
    case 'dashboard': loadDashboard(); break;
    case 'profile': loadProfile(); break;
    case 'orders': loadOrders(); break;
    case 'stock': loadStock(); break;
    case 'approvals': loadApprovals(); break;
    case 'users': loadUsers(); break;
    case 'delivery': loadDeliveryPersonnel(); break;
    case 'distributions': loadDistributions(); break;
    case 'analytics': loadAnalytics(); break;
    case 'logs': loadLogs(); break;
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
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.detail || data.message || 'API Error');
    error.detail = data.detail; // Attach detail for access
    throw error;
  }

  return data;
}

/* ===================================
   Dashboard - 3 Clickable Cards
   =================================== */
async function loadDashboard() {
  const [items, orders, pending] = await Promise.all([
    api('/admin/inventory'),
    api('/admin/orders'),
    api('/admin/pending-users')
  ]);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const outForDelivery = orders.filter(o => o.status === 'out_for_delivery').length;

  document.getElementById('contentArea').innerHTML = `
    <div class="dashboard-cards">
      <div class="dashboard-card clickable" onclick="showSection('approvals')">
        <div class="card-icon pending">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        </div>
        <div class="card-content">
          <div class="card-value ${pending.length > 0 ? 'alert' : ''}">${pending.length}</div>
          <div class="card-label">${t('card.pending_approvals')}</div>
        </div>
        <div class="card-arrow">→</div>
      </div>

      <div class="dashboard-card clickable" onclick="showSection('orders')">
        <div class="card-icon orders">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <div class="card-content">
          <div class="card-value">${orders.length}</div>
          <div class="card-label">${t('card.container_requests')}</div>
          <div class="card-sub">
            <span class="badge warning">${pendingOrders} ${t('status.pending')}</span>
            <span class="badge active">${outForDelivery} ${t('status.out_for_delivery')}</span>
          </div>
        </div>
        <div class="card-arrow">→</div>
      </div>

      <div class="dashboard-card clickable" onclick="showSection('stock')">
        <div class="card-icon inventory">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
        <div class="card-content">
          <div class="card-value ${items.filter(i => i.quantity === 0).length > 0 ? 'alert' : ''}">${items.length}</div>
          <div class="card-label">${t('card.inventory_items')}</div>
          <div class="card-sub">
            ${items.filter(i => i.quantity === 0).length > 0 ? `<span class="badge inactive">${items.filter(i => i.quantity === 0).length} ${t('status.out_of_stock')}</span>` : ''}
            <span class="badge ${items.filter(i => i.quantity > 0 && i.quantity < i.min_stock).length > 0 ? 'warning' : 'active'}">
              ${items.filter(i => i.quantity > 0 && i.quantity < i.min_stock).length} ${t('status.low_stock')}
            </span>
          </div>
        </div>
        <div class="card-arrow">→</div>
      </div>
    </div>
  `;
}

/* ===================================
   Profile - Editable
   =================================== */
async function loadProfile() {
  try {
    const profile = await api(`/admin/profile/${currentAdminId}`);

    document.getElementById('contentArea').innerHTML = `
      <div class="card profile-card">
        <h3>${t('label.edit_profile')}</h3>
        <form onsubmit="saveProfile(event)">
          <div class="form-row">
            <div class="form-group">
              <label>${t('label.first_name')}</label>
              <input type="text" id="profileFirstName" value="${profile.first_name || ''}" required>
            </div>
            <div class="form-group">
              <label>${t('label.last_name')}</label>
              <input type="text" id="profileLastName" value="${profile.last_name || ''}" required>
            </div>
          </div>
          <div class="form-group">
            <label>${t('label.email')}</label>
            <input type="email" id="profileEmail" value="${profile.email || ''}" required>
          </div>
          <button type="submit" class="btn-primary">${t('btn.save')}</button>
        </form>
      </div>
    `;
  } catch (err) {
    document.getElementById('contentArea').innerHTML = `<p style="color:red">${t('profile.error')} ${err.message}</p>`;
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const data = {
    first_name: document.getElementById('profileFirstName').value,
    last_name: document.getElementById('profileLastName').value,
    email: document.getElementById('profileEmail').value
  };

  try {
    await api(`/admin/profile/${currentAdminId}`, 'PUT', data);
    alert(t('profile.success'));
    const adminName = document.getElementById('adminName');
    if (adminName) adminName.innerText = `${data.first_name} ${data.last_name}`;
  } catch (err) {
    alert(t('profile.error') + ' ' + (err.message || 'Unknown error'));
  }
}

/* ===================================
   Requests - Tabs: Pending, Dispatched, Delivered
   =================================== */
let allOrders = [];

async function loadOrders(filter = 'all') {
  if (filter === 'all') {
    allOrders = await api('/admin/orders');
    allOrders.sort((a, b) => b.id - a.id);
  }

  const filtered = filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter);

  const counts = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    out_for_delivery: allOrders.filter(o => o.status === 'out_for_delivery').length,
    completed: allOrders.filter(o => o.status === 'completed').length
  };

  const headerHtml = `
    <div class="tabs-bar">
      <button class="tab-btn ${filter === 'all' ? 'active' : ''}" onclick="loadOrders('all')">${t('tab.all')} (${allOrders.length})</button>
      <button class="tab-btn ${filter === 'pending' ? 'active' : ''}" onclick="filterOrders('pending')">${t('status.pending')} (${counts.pending})</button>
      <button class="tab-btn ${filter === 'out_for_delivery' ? 'active' : ''}" onclick="filterOrders('out_for_delivery')">${t('status.out_for_delivery')} (${counts.out_for_delivery})</button>
      <button class="tab-btn ${filter === 'completed' ? 'active' : ''}" onclick="filterOrders('completed')">${t('status.completed')} (${counts.completed})</button>
    </div>
    <div class="action-bar">
      <button class="btn-primary" onclick="addOrder()">${t('btn.record_manual')}</button>
    </div>
  `;

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.order_id')}</th><th>${t('th.item')}</th><th>${t('th.qty')}</th><th>${t('th.requested_by')}</th><th>${t('th.ward')}</th><th>${t('th.urgency')}</th><th>${t('th.rider')}</th><th>${t('th.status')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (filtered.length === 0) {
    html += '<tr><td colspan="9" style="text-align:center;color:#6b7280">No orders found</td></tr>';
  }

  filtered.forEach(o => {
    const statusClass = o.status === 'completed' ? 'active' : o.status === 'out_for_delivery' ? 'info' : 'warning';
    const riderName = o.assigned_rider || '-';
    const urgencyBadge = o.urgency === 'Urgent' ? `<span class="badge" style="background:#dc2626;color:white;">${t('urgency.urgent')}</span>` : `<span class="badge" style="background:#d1d5db;">${t('urgency.normal')}</span>`;
    const actions = o.status === 'pending' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'out_for_delivery')">${t('btn.dispatch')}</button>
    ` : o.status === 'out_for_delivery' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'completed')">${t('btn.complete')}</button>
    ` : '-';

    html += `<tr>
      <td>#${o.id}</td>
      <td>${o.item_name}</td>
      <td>${o.quantity}</td>
      <td>${o.ordered_by}</td>
      <td>${o.department}</td>
      <td>${urgencyBadge}</td>
      <td>${riderName}</td>
      <td><span class="badge ${statusClass}">${t('status.' + o.status)}</span></td>
      <td>${actions}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

function filterOrders(status) {
  const filtered = allOrders.filter(o => o.status === status);
  loadOrdersFiltered(status, filtered);
}

function loadOrdersFiltered(filter, filtered) {
  const counts = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    out_for_delivery: allOrders.filter(o => o.status === 'out_for_delivery').length,
    completed: allOrders.filter(o => o.status === 'completed').length
  };

  const headerHtml = `
    <div class="tabs-bar">
      <button class="tab-btn ${filter === 'all' ? 'active' : ''}" onclick="loadOrders('all')">${t('tab.all')} (${allOrders.length})</button>
      <button class="tab-btn ${filter === 'pending' ? 'active' : ''}" onclick="filterOrders('pending')">${t('status.pending')} (${counts.pending})</button>
      <button class="tab-btn ${filter === 'out_for_delivery' ? 'active' : ''}" onclick="filterOrders('out_for_delivery')">${t('status.out_for_delivery')} (${counts.out_for_delivery})</button>
      <button class="tab-btn ${filter === 'completed' ? 'active' : ''}" onclick="filterOrders('completed')">${t('status.completed')} (${counts.completed})</button>
    </div>
    <div class="action-bar">
      <button class="btn-primary" onclick="addOrder()">${t('btn.record_manual')}</button>
    </div>
  `;

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.order_id')}</th><th>${t('th.item')}</th><th>${t('th.qty')}</th><th>${t('th.requested_by')}</th><th>${t('th.ward')}</th><th>${t('th.urgency')}</th><th>${t('th.rider')}</th><th>${t('th.status')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (filtered.length === 0) {
    html += '<tr><td colspan="9" style="text-align:center;color:#6b7280">No orders found</td></tr>';
  }

  filtered.forEach(o => {
    const statusClass = o.status === 'completed' ? 'active' : o.status === 'out_for_delivery' ? 'info' : 'warning';
    const riderName = o.assigned_rider || '-';
    const urgencyBadge = o.urgency === 'Urgent' ? `<span class="badge" style="background:#dc2626;color:white;">${t('urgency.urgent')}</span>` : `<span class="badge" style="background:#d1d5db;">${t('urgency.normal')}</span>`;

    let itemDisplay = o.item_name;
    // Check if multiple items exist (either by items array or checking string pattern)
    if (o.items && o.items.length > 1) {
      itemDisplay = `<span onclick="showOrderItems('${o.id}')" style="cursor:pointer; color:#4f46e5; text-decoration:underline;">${o.item_name}</span>`;
    }

    const actions = o.status === 'pending' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'out_for_delivery')">${t('btn.dispatch')}</button>
    ` : o.status === 'out_for_delivery' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'completed')">${t('btn.complete')}</button>
    ` : '-';

    html += `<tr>
      <td>#${o.id}</td>
      <td>${itemDisplay}</td>
      <td>${o.quantity}</td>
      <td>${o.ordered_by}</td>
      <td>${o.department}</td>
      <td>${urgencyBadge}</td>
      <td>${riderName}</td>
      <td><span class="badge ${statusClass}">${t('status.' + o.status)}</span></td>
      <td>${actions}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await api(`/admin/orders/${orderId}/status?status=${newStatus}`, 'PUT');
    alert(t('msg.status_updated', { status: t('status.' + newStatus) }));
    loadOrders('all');
  } catch (err) {
    alert(t('error.update_fail') + ' ' + (err.detail || err.message || 'Unknown error'));
  }
}

function showOrderItems(orderId) {
  // Use loose equality to match string ID with number ID if needed
  const order = allOrders.find(o => o.id == orderId);
  if (!order || !order.items) return;

  let msg = '📦 Order Details:\n\n';
  order.items.forEach(i => {
    msg += `• ${i.name} (x${i.quantity})\n`;
  });
  alert(msg);
}

async function addOrder() {
  const item_name = prompt(t('prompt.item_name'));
  if (!item_name) return;
  const quantity = parseInt(prompt(t('prompt.quantity')), 10);
  if (isNaN(quantity) || quantity <= 0) return;

  const ordered_by = prompt(t('prompt.ordered_by'));
  const department = prompt(t('prompt.department'));

  // Check stock
  const items = await api('/admin/inventory');
  const selectedItem = items.find(i => i.name === item_name);
  if (selectedItem && quantity > selectedItem.quantity) {
    if (!confirm(t('confirm.stock_warning', { qty: quantity, stock: selectedItem.quantity }))) {
      return;
    }
  }

  try {
    await api('/admin/orders', 'POST', { item_name, quantity, ordered_by, department, status: 'pending' });
    alert(t('msg.order_created'));
    loadOrders('all');
  } catch (err) {
    alert(t('error.submit_fail') + ' ' + (err.detail || 'Insufficient stock or connection error'));
  }
}

/* ===================================
   Stock / Inventory
   =================================== */
let cachedStock = [];

async function loadStock() {
  const items = await api('/admin/inventory');
  cachedStock = items;
  renderStockTable(items);
}

function renderStockTable(items) {
  const headerHtml = `
    <div class="action-bar" style="display: flex; gap: 10px; align-items: center;">
      <button class="btn-primary" onclick="addItem()">${t('btn.add_item')}</button>
      <div style="margin-left: auto; display: flex; gap: 8px;">
        <span style="font-size: 0.9em; color: #6b7280; align-self: center;">${t('label.sort_by')}</span>
        <button class="btn-sm" onclick="sortStock('name')" style="background: white; border: 1px solid #d1d5db;">${t('th.name')}</button>
        <button class="btn-sm" onclick="sortStock('status')" style="background: white; border: 1px solid #d1d5db;">${t('th.status')}</button>
      </div>
    </div>
  `;

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.name')}</th><th>${t('th.category')}</th><th>${t('th.qty')}</th><th>${t('th.unit')}</th><th>${t('th.min_stock')}</th><th>${t('th.supplier')}</th><th>${t('th.status')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  items.forEach(i => {
    let statusKey = 'status.in_stock';
    let badgeClass = 'active';

    if (i.quantity === 0) {
      statusKey = 'status.out_of_stock';
      badgeClass = 'inactive';
    } else if (i.quantity < i.min_stock) {
      statusKey = 'status.low_stock';
      badgeClass = 'warning';
    }

    const status = `<span class="badge ${badgeClass}">${t(statusKey)}</span>`;
    html += `<tr>
      <td>${i.name}</td>
      <td>${i.category}</td>
      <td>${i.quantity}</td>
      <td>${i.unit}</td>
      <td>${i.min_stock}</td>
      <td>${i.supplier}</td>
      <td>${status}</td>
      <td><button class="btn-sm btn-approve" onclick="restockItem(${i.id}, '${i.name}')">${t('btn.restock')}</button></td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

function sortStock(criteria) {
  if (!cachedStock || cachedStock.length === 0) return;

  if (criteria === 'name') {
    cachedStock.sort((a, b) => a.name.localeCompare(b.name));
  } else if (criteria === 'status') {
    // Sort by actual quantity: lowest to highest
    cachedStock.sort((a, b) => a.quantity - b.quantity);
  }

  renderStockTable(cachedStock);
}

async function restockItem(itemId, itemName) {
  const qty = parseInt(prompt(t('prompt.restock', { name: itemName })), 10);
  if (isNaN(qty) || qty <= 0) {
    alert(t('error.valid_qty'));
    return;
  }

  await api(`/admin/inventory/${itemId}/restock?quantity=${qty}`, 'PUT');
  alert(t('msg.restock_success', { itemName, qty }));
  loadStock();
}

async function addItem() {
  const name = prompt(t('prompt.item_name'));
  if (!name) return;
  const category = prompt(t('prompt.category'));
  const quantity = parseInt(prompt(t('prompt.quantity')), 10);
  const min_stock = parseInt(prompt(t('prompt.min_stock')), 10);
  const unit = prompt(t('prompt.unit'));
  const supplier = prompt(t('prompt.supplier'));

  await api('/admin/inventory', 'POST', { name, category, quantity, min_stock, unit, supplier });
  alert(t('msg.item_added'));
  loadStock();
}

/* ===================================
   User Approvals
   =================================== */
async function loadApprovals() {
  const users = await api('/admin/pending-users');

  const headerHtml = `
    <div class="action-bar" style="justify-content: flex-start;">
      <h3 style="margin:0;">${t('nav.approvals')}</h3>
    </div>
  `;

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>Employee ID</th><th>${t('th.name')}</th><th>${t('th.email')}</th><th>${t('th.role')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (users.length === 0) {
    html += `<tr><td colspan="5" style="text-align:center;color:#6b7280">${t('card.pending_approvals')} (0)</td></tr>`;
  }

  users.forEach(u => {
    html += `<tr>
      <td>${u.employee_id}</td>
      <td>${u.first_name} ${u.last_name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>
        <button class="btn-sm btn-approve" onclick="approveUser('${u.id}')">${t('btn.approve')}</button>
        <button class="btn-sm btn-reject" onclick="rejectUser('${u.id}')">${t('btn.reject')}</button>
      </td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

async function approveUser(id) {
  await api(`/admin/approve-user/${id}`, 'PUT');
  alert(t('msg.user_approved'));
  loadApprovals();
}

async function rejectUser(id) {
  await api(`/admin/reject-user/${id}`, 'PUT');
  alert(t('msg.user_rejected'));
  loadApprovals();
}

/* ===================================
   USER MANAGEMENT
   =================================== */
async function loadUsers() {
  console.log('Loading users...');
  const users = await api('/admin/users');
  console.log('Users loaded:', users);

  const headerHtml = `
    <div class="action-bar" style="justify-content: flex-start;">
      <h3 style="margin:0;">${t('nav.users')}</h3>
    </div>
  `;

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.employee_id')}</th><th>${t('th.name')}</th><th>${t('th.email')}</th><th>${t('th.department')}</th><th>${t('th.ward')}</th><th>${t('th.status')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (users.length === 0) {
    html += `<tr><td colspan="7" style="text-align:center;color:#6b7280">${t('nav.users')} (0)</td></tr>`;
  }

  users.forEach(u => {
    let statusBadge = '';
    if (u.status === 'active') {
      statusBadge = `<span class="badge active">${t('status.active')}</span>`;
    } else if (u.status === 'pending') {
      statusBadge = `<span class="badge warning">${t('status.pending')}</span>`;
    } else if (u.status === 'suspended') {
      statusBadge = `<span class="badge inactive">${t('status.suspended')}</span>`;
    } else if (u.status === 'rejected') {
      statusBadge = `<span class="badge inactive">${t('status.rejected')}</span>`;
    }

    let actions = '';
    if (u.status === 'active') {
      actions = `<button class="btn-sm btn-reject" onclick="suspendUser('${u.id}', '${u.full_name || u.first_name}')">${t('btn.suspend')}</button>`;
    } else if (u.status === 'suspended') {
      actions = `<button class="btn-sm btn-approve" onclick="reactivateUser('${u.id}', '${u.full_name || u.first_name}')">${t('btn.reactivate')}</button>`;
    }
    actions += ` <button class="btn-sm" style="background:#dc2626;color:white;" onclick="deleteUser('${u.id}', '${u.full_name || u.first_name}')">${t('btn.delete')}</button>`;

    html += `<tr>
      <td>${u.employee_id || '-'}</td>
      <td>${u.full_name || u.first_name + ' ' + u.last_name}</td>
      <td>${u.email || '-'}</td>
      <td>${u.department || '-'}</td>
      <td>${u.ward || '-'}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

async function suspendUser(id, name) {
  if (!confirm(t('confirm.suspend_user', { name }))) {
    return;
  }

  try {
    console.log(`Suspending user ${id}...`);
    const result = await api(`/admin/users/${id}/suspend`, 'PUT');
    console.log('Suspend result:', result);
    alert(t('msg.user_suspended', { name }));
    console.log('Reloading users...');
    await loadUsers();
    console.log('Users reloaded');
  } catch (error) {
    console.error('Suspend error:', error);
    alert(t('error.suspend_failed'));
  }
}

async function deleteUser(id, name) {
  const confirmation = prompt(t('confirm.delete_user', { name }));
  if (confirmation !== 'DELETE') {
    alert(t('msg.deletion_cancelled'));
    return;
  }

  try {
    console.log(`Deleting user ${id}...`);
    const result = await api(`/admin/users/${id}`, 'DELETE');
    console.log('Delete result:', result);
    alert(t('msg.user_deleted', { name }));
    console.log('Reloading users...');
    await loadUsers();
    console.log('Users reloaded');
  } catch (error) {
    console.error('Delete error:', error);
    alert(t('error.delete_failed'));
  }
}

async function reactivateUser(id, name) {
  if (!confirm(t('confirm.reactivate_user', { name }))) {
    return;
  }

  try {
    console.log(`Reactivating user ${id}...`);
    const result = await api(`/admin/users/${id}/reactivate`, 'PUT');
    console.log('Reactivate result:', result);
    alert(t('msg.user_reactivated', { name }));
    console.log('Reloading users...');
    await loadUsers();
    console.log('Users reloaded');
  } catch (error) {
    console.error('Reactivate error:', error);
    alert(t('error.reactivate_failed'));
  }
}

/* ===================================
   Delivery Personnel - Assigned vs Available
   =================================== */
async function loadDeliveryPersonnel() {
  const personnel = await api('/admin/delivery-personnel');

  const available = personnel.filter(p => p.status === 'available');
  const assigned = personnel.filter(p => p.status === 'on_delivery');

  const headerHtml = `
    <div class="action-bar">
      <button class="btn-primary" onclick="addDeliveryPerson()">+ ${t('nav.delivery')}</button>
    </div>
  `;

  let html = `
    <div class="section-header">${t('p_status.available')} (${available.length})</div>
    <div class="table-container" style="margin-bottom: 24px;">
      <table>
        <thead><tr><th>${t('th.name')}</th><th>${t('th.phone')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (available.length === 0) {
    html += `<tr><td colspan="3" style="text-align:center;color:#6b7280">${t('p_status.available')} (0)</td></tr>`;
  }
  available.forEach(p => {
    html += `<tr>
      <td>${p.name}</td>
      <td>${p.phone}</td>

      <td><button class="btn-sm btn-reject" onclick="setDeliveryStatus('${p.id}', 'on_delivery')">${t('btn.assign')}</button></td>
    </tr>`;
  });

  html += `</tbody></table></div>
    
    <div class="section-header">${t('p_status.on_delivery')} (${assigned.length})</div>
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.name')}</th><th>${t('th.phone')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (assigned.length === 0) {
    html += `<tr><td colspan="3" style="text-align:center;color:#6b7280">${t('p_status.on_delivery')} (0)</td></tr>`;
  }
  assigned.forEach(p => {
    html += `<tr>
      <td>${p.name}</td>
      <td>${p.phone}</td>

      <td><button class="btn-sm btn-approve" onclick="setDeliveryStatus('${p.id}', 'available')">${t('btn.unassign')}</button></td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

async function setDeliveryStatus(personId, status) {
  await api(`/admin/delivery-personnel/${personId}/status?status=${status}`, 'PUT');
  loadDeliveryPersonnel();
}

async function addDeliveryPerson() {
  const name = prompt(t('prompt.name') || 'Name:');
  if (!name) return;
  const phone = prompt(t('prompt.phone') || 'Phone Number:');
  const vehicle_number = "-";

  await api('/admin/delivery-personnel', 'POST', { name, phone, vehicle_number, status: 'available' });
  alert(t('msg.delivery_added'));
  loadDeliveryPersonnel();
}

/* ===================================
   Distribution History - Grouped by Ward/Department
   =================================== */
async function loadDistributions() {
  const distributions = await api('/admin/distributions');

  // Group by destination (ward/department)
  const grouped = {};
  distributions.forEach(d => {
    if (!grouped[d.destination]) grouped[d.destination] = [];
    grouped[d.destination].push(d);
  });

  const headerHtml = `
    <div class="action-bar">
      <button class="btn-primary" onclick="recordDistribution()">${t('btn.record_manual')}</button>
    </div>
  `;

  let html = '';

  const destinations = Object.keys(grouped);
  if (destinations.length === 0) {
    html += `<div class="card"><p style="color:#6b7280">${t('nav.history')} (0)</p></div>`;
  }

  destinations.forEach(dest => {
    html += `
      <div class="section-header">${dest}</div>
      <div class="table-container" style="margin-bottom: 24px;">
        <table>
          <thead><tr><th>${t('th.item')}</th><th>${t('th.qty')}</th><th>Ordered By</th><th>Date</th><th>${t('th.delivered_by')}</th><th>${t('th.notes')}</th></tr></thead>
          <tbody>
    `;
    grouped[dest].forEach(d => {
      html += `<tr>
        <td>${d.item_name}</td>
        <td>${d.quantity}</td>
        <td>${d.ordered_by || '-'}</td>
        <td>${d.timestamp ? formatDateTime(d.timestamp) : '-'}</td>
        <td>${d.delivered_by}</td>
        <td>${d.notes || '-'}</td>
      </tr>`;
    });
    html += '</tbody></table></div>';
  });

  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

async function recordDistribution() {
  const item_name = prompt(t('prompt.item_name'));
  if (!item_name) return;
  const quantity = parseInt(prompt(t('prompt.quantity')), 10);
  if (isNaN(quantity) || quantity <= 0) return;

  const destination = prompt(t('prompt.destination'));
  const delivered_by = prompt(t('prompt.delivered_by'));
  const notes = prompt(t('prompt.notes'));

  // Check stock
  const items = await api('/admin/inventory');
  const selectedItem = items.find(i => i.name === item_name);
  if (selectedItem && quantity > selectedItem.quantity) {
    if (!confirm(`Warning: Distribution quantity (${quantity}) exceeds available stock (${selectedItem.quantity}). Proceed anyway?`)) {
      return;
    }
  }

  try {
    await api('/admin/distributions', 'POST', { item_name, quantity, destination, delivered_by, notes });
    loadDistributions();
  } catch (err) {
    alert('Error recording distribution: ' + (err.detail || 'Insufficient stock or connection error'));
  }
}

/* ===================================
   Audit Logs
   =================================== */
let cachedLogs = [];

async function loadLogs() {
  const logs = await api('/admin/logs');
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  cachedLogs = logs; // Cache for export

  const headerHtml = `
    <div class="action-bar" style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0;">${t('nav.logs')}</h3>
      <button onclick="exportLogsToExcel()" style="background:#059669; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:8px;">
        📥 ${t('nav.logs')} Export
      </button>
    </div>
  `;

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.timestamp')}</th><th>${t('th.role')}</th><th>${t('th.action')}</th><th>${t('th.notes')}</th></tr></thead>
        <tbody>
  `;

  logs.forEach(l => {
    html += `<tr>
      <td>${formatDateTime(l.timestamp)}</td>
      <td>${l.actor_type.toUpperCase()} <span style="color:#6b7280; font-size:0.9em">(${l.actor_name || 'Unknown'})</span></td>
      <td>${l.action}</td>
      <td>${l.details || '-'}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('dynamicHeader').innerHTML = headerHtml;
  document.getElementById('contentArea').innerHTML = html;
}

function exportLogsToExcel() {
  if (!cachedLogs || cachedLogs.length === 0) {
    alert(t('msg.history_empty'));
    return;
  }

  // Prepare data for Excel
  const data = cachedLogs.map(l => ({
    'Timestamp': formatDateTime(l.timestamp),
    'Actor Type': l.actor_type.toUpperCase(),
    'Actor Name': l.actor_name || 'Unknown',
    'Action': l.action,
    'Details': l.details || '-'
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');

  // Generate filename with date
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `audit_logs_${today}.xlsx`);
}

/* ===================================
   Analytics
   =================================== */
async function loadAnalytics() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px;">
      <div class="card" style="padding: 24px; border-radius: 12px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 20px; color: #1f2937;">${t('label.usage_ward')}</h3>
        <div style="height: 400px; position: relative;">
            <canvas id="wardChart"></canvas>
        </div>
      </div>
      <div class="card" style="padding: 24px; border-radius: 12px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 20px; color: #1f2937;">${t('label.consumption_trends')}</h3>
        <div style="height: 400px; position: relative;">
            <canvas id="trendChart"></canvas>
        </div>
      </div>
    </div>
  `;

  try {
    const data = await api('/admin/analytics');

    // --- 1. Ward Chart (Stacked Bar) ---
    const wards = Object.keys(data.usage_by_ward || {});
    // Get all unique items
    const allItems = new Set();
    Object.values(data.usage_by_ward || {}).forEach(w => Object.keys(w).forEach(i => allItems.add(i)));
    const itemsArray = Array.from(allItems);

    const wardDatasets = itemsArray.map((item, index) => ({
      label: item,
      data: wards.map(w => (data.usage_by_ward[w] || {})[item] || 0),
      backgroundColor: getColor(index),
      stack: 'Stack 0'
    }));

    // Check if we have data
    if (wards.length === 0) {
      document.getElementById('wardChart').parentNode.innerHTML = '<p style="text-align:center; color:#6b7280; margin-top:150px;">No usage data recorded yet.</p>';
    } else {
      new Chart(document.getElementById('wardChart'), {
        type: 'bar',
        data: { labels: wards, datasets: wardDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
      });
    }

    // --- 2. Trend Chart (Line) ---
    const dates = Object.keys(data.daily_trends || {}).sort();
    const trendDatasets = itemsArray.map((item, index) => ({
      label: item,
      data: dates.map(d => (data.daily_trends[d] || {})[item] || 0),
      borderColor: getColor(index),
      backgroundColor: getColor(index),
      fill: false,
      tension: 0.3
    }));

    if (dates.length === 0) {
      document.getElementById('trendChart').parentNode.innerHTML = '<p style="text-align:center; color:#6b7280; margin-top:150px;">No trend data available yet.</p>';
    } else {
      new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: { labels: dates, datasets: trendDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

  } catch (err) {
    content.innerHTML = `<div style="padding:20px; color:red;">
        <h3>Error loading analytics</h3>
        <p>${err.message}</p>
        <p>Please ensure you have created the <code>distribution_history</code> table in Supabase.</p>
    </div>`;
  }
}

function getColor(index) {
  const colors = [
    '#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#0ea5e9'
  ];
  return colors[index % colors.length];
}
