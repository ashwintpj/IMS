/* ===================================
   Configuration
   =================================== */
const API_BASE_URL = 'http://localhost:8000';

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

  // Populate if empty
  if (menu.children.length === 0) {
    const links = document.querySelector('.nav-links').innerHTML;
    menu.innerHTML = links;

    // Add click listeners to close menu on selection
    menu.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        menu.classList.remove('active');
      });
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
    'dashboard': t('header.clinical_dashboard'),
    'profile': t('nav.profile'),
    'orders': t('card.container_requests'),
    'stock': t('nav.inventory'),
    'approvals': t('nav.approvals'),
    'delivery': t('nav.delivery'),
    'distributions': t('nav.history'),
    'logs': t('nav.logs')
  };
  document.getElementById('pageTitle').innerText = titles[sectionId] || t('header.dashboard');
  document.getElementById('contentArea').innerHTML = '<p>Loading...</p>';

  switch (sectionId) {
    case 'dashboard': loadDashboard(); break;
    case 'profile': loadProfile(); break;
    case 'orders': loadOrders(); break;
    case 'stock': loadStock(); break;
    case 'approvals': loadApprovals(); break;
    case 'delivery': loadDeliveryPersonnel(); break;
    case 'distributions': loadDistributions(); break;
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
  return res.json();
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
          <div class="card-value">${items.length}</div>
          <div class="card-label">${t('card.inventory_items')}</div>
          <div class="card-sub">
            <span class="badge ${items.filter(i => i.quantity < i.min_stock).length > 0 ? 'inactive' : 'active'}">
              ${items.filter(i => i.quantity < i.min_stock).length} ${t('status.low_stock')}
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
  // For now, show editable form with placeholder data
  document.getElementById('contentArea').innerHTML = `
    <div class="card profile-card">
      <h3>Edit Profile</h3>
      <form onsubmit="saveProfile(event)">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" id="profileFirstName" value="Admin" required>
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" id="profileLastName" value="User" required>
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="profileEmail" value="admin@test.com" required>
        </div>
        <button type="submit" class="btn-primary">Save Changes</button>
      </form>
    </div>
  `;
}

function saveProfile(e) {
  e.preventDefault();
  alert('Profile updated successfully!');
}

/* ===================================
   Requests - Tabs: Pending, Dispatched, Delivered
   =================================== */
let allOrders = [];

async function loadOrders(filter = 'all') {
  if (filter === 'all') {
    allOrders = await api('/admin/orders');
  }

  const filtered = filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter);

  const counts = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    out_for_delivery: allOrders.filter(o => o.status === 'out_for_delivery').length,
    completed: allOrders.filter(o => o.status === 'completed').length
  };

  let html = `
    <div class="tabs-bar">
      <button class="tab-btn ${filter === 'all' ? 'active' : ''}" onclick="loadOrders('all')">All (${allOrders.length})</button>
      <button class="tab-btn ${filter === 'pending' ? 'active' : ''}" onclick="filterOrders('pending')">${t('status.pending')} (${counts.pending})</button>
      <button class="tab-btn ${filter === 'out_for_delivery' ? 'active' : ''}" onclick="filterOrders('out_for_delivery')">${t('status.out_for_delivery')} (${counts.out_for_delivery})</button>
      <button class="tab-btn ${filter === 'completed' ? 'active' : ''}" onclick="filterOrders('completed')">${t('status.completed')} (${counts.completed})</button>
    </div>
    <div class="action-bar">
      <button class="btn-primary" onclick="addOrder()">${t('btn.record_manual')}</button>
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>Order ID</th><th>${t('th.item')}</th><th>${t('th.qty')}</th><th>${t('th.requested_by')}</th><th>${t('th.ward')}</th><th>Urgency</th><th>Rider</th><th>${t('th.status')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (filtered.length === 0) {
    html += '<tr><td colspan="9" style="text-align:center;color:#6b7280">No orders found</td></tr>';
  }

  filtered.forEach(o => {
    const statusClass = o.status === 'completed' ? 'active' : o.status === 'out_for_delivery' ? 'info' : 'warning';
    const riderName = o.assigned_rider || '-';
    const urgencyBadge = o.urgency === 'Urgent' ? '<span class="badge" style="background:#dc2626;color:white;">Urgent</span>' : '<span class="badge" style="background:#d1d5db;">Normal</span>';
    const actions = o.status === 'pending' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'out_for_delivery')">Dispatch</button>
    ` : o.status === 'out_for_delivery' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'completed')">Complete</button>
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

  let html = `
    <div class="tabs-bar">
      <button class="tab-btn ${filter === 'all' ? 'active' : ''}" onclick="loadOrders('all')">All (${allOrders.length})</button>
      <button class="tab-btn ${filter === 'pending' ? 'active' : ''}" onclick="filterOrders('pending')">Pending (${counts.pending})</button>
      <button class="tab-btn ${filter === 'out_for_delivery' ? 'active' : ''}" onclick="filterOrders('out_for_delivery')">Out for Delivery (${counts.out_for_delivery})</button>
      <button class="tab-btn ${filter === 'completed' ? 'active' : ''}" onclick="filterOrders('completed')">Completed (${counts.completed})</button>
    </div>
    <div class="action-bar">
      <button class="btn-primary" onclick="addOrder()">+ New Order</button>
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>Order ID</th><th>Item</th><th>Qty</th><th>Ordered By</th><th>Department</th><th>Urgency</th><th>Rider</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
  `;

  if (filtered.length === 0) {
    html += '<tr><td colspan="9" style="text-align:center;color:#6b7280">No orders found</td></tr>';
  }

  filtered.forEach(o => {
    const statusClass = o.status === 'completed' ? 'active' : o.status === 'out_for_delivery' ? 'info' : 'warning';
    const riderName = o.assigned_rider || '-';
    const urgencyBadge = o.urgency === 'Urgent' ? '<span class="badge" style="background:#dc2626;color:white;">Urgent</span>' : '<span class="badge" style="background:#d1d5db;">Normal</span>';
    const actions = o.status === 'pending' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'out_for_delivery')">Dispatch</button>
    ` : o.status === 'out_for_delivery' ? `
      <button class="btn-sm btn-approve" onclick="updateOrderStatus('${o.id}', 'completed')">Complete</button>
    ` : '-';

    html += `<tr>
      <td>#${o.id}</td>
      <td>${o.item_name}</td>
      <td>${o.quantity}</td>
      <td>${o.ordered_by}</td>
      <td>${o.department}</td>
      <td>${urgencyBadge}</td>
      <td>${riderName}</td>
      <td><span class="badge ${statusClass}">${o.status}</span></td>
      <td>${actions}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('contentArea').innerHTML = html;
}

async function updateOrderStatus(orderId, newStatus) {
  await api(`/admin/orders/${orderId}/status?status=${newStatus}`, 'PUT');
  alert(`Order status updated to ${newStatus.replace('_', ' ')}!`);
  loadOrders('all');
}

async function addOrder() {
  const item_name = prompt("Item Name:");
  if (!item_name) return;
  const quantity = parseInt(prompt("Quantity:"), 10);
  if (isNaN(quantity) || quantity <= 0) return;

  const ordered_by = prompt("Ordered By (Name):");
  const department = prompt("Department/Ward:");

  // Check stock
  const items = await api('/admin/inventory');
  const selectedItem = items.find(i => i.name === item_name);
  if (selectedItem && quantity > selectedItem.quantity) {
    if (!confirm(`Warning: Requested quantity (${quantity}) exceeds available stock (${selectedItem.quantity}). Proceed anyway?`)) {
      return;
    }
  }

  try {
    await api('/admin/orders', 'POST', { item_name, quantity, ordered_by, department, status: 'pending' });
    alert('Order created!');
    loadOrders('all');
  } catch (err) {
    alert('Error creating order: ' + (err.detail || 'Insufficient stock or connection error'));
  }
}

/* ===================================
   Stock / Inventory
   =================================== */
async function loadStock() {
  const items = await api('/admin/inventory');

  let html = `
    <div class="action-bar">
      <button class="btn-primary" onclick="addItem()">${t('btn.add_item')}</button>
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.name')}</th><th>${t('th.category')}</th><th>${t('th.qty')}</th><th>${t('th.unit')}</th><th>${t('th.min_stock')}</th><th>${t('th.supplier')}</th><th>${t('th.status')}</th><th>Actions</th></tr></thead>
        <tbody>
  `;

  items.forEach(i => {
    const status = i.quantity < i.min_stock ? `<span class="badge inactive">${t('status.low_stock')}</span>` : `<span class="badge active">${t('status.in_stock')}</span>`;
    html += `<tr>
      <td>${i.name}</td>
      <td>${i.category}</td>
      <td>${i.quantity}</td>
      <td>${i.unit}</td>
      <td>${i.min_stock}</td>
      <td>${i.supplier}</td>
      <td>${status}</td>
      <td><button class="btn-sm btn-approve" onclick="restockItem(${i.id}, '${i.name}')">+ Restock</button></td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('contentArea').innerHTML = html;
}

async function restockItem(itemId, itemName) {
  const qty = parseInt(prompt(`Add quantity to "${itemName}":`), 10);
  if (isNaN(qty) || qty <= 0) {
    alert('Please enter a valid quantity');
    return;
  }

  await api(`/admin/inventory/${itemId}/restock?quantity=${qty}`, 'PUT');
  alert(`Added ${qty} units to ${itemName}`);
  loadStock();
}

async function addItem() {
  const name = prompt("Item Name:");
  if (!name) return;
  const category = prompt("Category:");
  const quantity = parseInt(prompt("Quantity:"), 10);
  const min_stock = parseInt(prompt("Min Stock Level:"), 10);
  const unit = prompt("Unit (e.g., box, pcs):");
  const supplier = prompt("Supplier Name:");

  await api('/admin/inventory', 'POST', { name, category, quantity, min_stock, unit, supplier });
  alert('Item added!');
  loadStock();
}

/* ===================================
   User Approvals
   =================================== */
async function loadApprovals() {
  const users = await api('/admin/pending-users');

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
  document.getElementById('contentArea').innerHTML = html;
}

async function approveUser(id) {
  await api(`/admin/approve-user/${id}`, 'PUT');
  alert('User approved!');
  loadApprovals();
}

async function rejectUser(id) {
  await api(`/admin/reject-user/${id}`, 'PUT');
  alert('User rejected!');
  loadApprovals();
}

/* ===================================
   Delivery Personnel - Assigned vs Available
   =================================== */
async function loadDeliveryPersonnel() {
  const personnel = await api('/admin/delivery-personnel');

  const available = personnel.filter(p => p.status === 'available');
  const assigned = personnel.filter(p => p.status === 'on_delivery');

  let html = `
    <div class="action-bar">
      <button class="btn-primary" onclick="addDeliveryPerson()">+ Add Personnel</button>
    </div>
    
    <div class="section-header">${t('p_status.available')} (${available.length})</div>
    <div class="table-container" style="margin-bottom: 24px;">
      <table>
        <thead><tr><th>${t('th.name')}</th><th>${t('th.phone')}</th><th>${t('th.vehicle')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (available.length === 0) {
    html += `<tr><td colspan="4" style="text-align:center;color:#6b7280">${t('p_status.available')} (0)</td></tr>`;
  }
  available.forEach(p => {
    html += `<tr>
      <td>${p.name}</td>
      <td>${p.phone}</td>
      <td>${p.vehicle_number}</td>
      <td><button class="btn-sm btn-reject" onclick="setDeliveryStatus('${p.id}', 'on_delivery')">${t('btn.assign')}</button></td>
    </tr>`;
  });

  html += `</tbody></table></div>
    
    <div class="section-header">${t('p_status.on_delivery')} (${assigned.length})</div>
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.name')}</th><th>${t('th.phone')}</th><th>${t('th.vehicle')}</th><th>${t('th.actions')}</th></tr></thead>
        <tbody>
  `;

  if (assigned.length === 0) {
    html += `<tr><td colspan="4" style="text-align:center;color:#6b7280">${t('p_status.on_delivery')} (0)</td></tr>`;
  }
  assigned.forEach(p => {
    html += `<tr>
      <td>${p.name}</td>
      <td>${p.phone}</td>
      <td>${p.vehicle_number}</td>
      <td><button class="btn-sm btn-approve" onclick="setDeliveryStatus('${p.id}', 'available')">${t('btn.unassign')}</button></td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('contentArea').innerHTML = html;
}

async function setDeliveryStatus(personId, status) {
  await api(`/admin/delivery-personnel/${personId}/status?status=${status}`, 'PUT');
  loadDeliveryPersonnel();
}

async function addDeliveryPerson() {
  const name = prompt("Name:");
  if (!name) return;
  const phone = prompt("Phone Number:");
  const vehicle_number = prompt("Vehicle Number:");

  await api('/admin/delivery-personnel', 'POST', { name, phone, vehicle_number, status: 'available' });
  alert('Delivery person added!');
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

  let html = `
    <div class="action-bar">
      <button class="btn-primary" onclick="recordDistribution()">${t('btn.record_manual')}</button>
    </div>
  `;

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
        <td>${d.timestamp ? new Date(d.timestamp).toLocaleString() : '-'}</td>
        <td>${d.delivered_by}</td>
        <td>${d.notes || '-'}</td>
      </tr>`;
    });
    html += '</tbody></table></div>';
  });

  document.getElementById('contentArea').innerHTML = html;
}

async function recordDistribution() {
  const item_name = prompt("Item Name:");
  if (!item_name) return;
  const quantity = parseInt(prompt("Quantity:"), 10);
  if (isNaN(quantity) || quantity <= 0) return;

  const destination = prompt("Destination (Ward/Department):");
  const delivered_by = prompt("Delivered By:");
  const notes = prompt("Notes (optional):");

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
async function loadLogs() {
  const logs = await api('/admin/logs');
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  let html = `
    <div class="table-container">
      <table>
        <thead><tr><th>${t('th.timestamp')}</th><th>${t('th.role')}</th><th>${t('th.action')}</th><th>${t('th.notes')}</th></tr></thead>
        <tbody>
  `;

  logs.forEach(l => {
    html += `<tr>
      <td>${new Date(l.timestamp).toLocaleString()}</td>
      <td>${l.actor_type}</td>
      <td>${l.action}</td>
      <td>${l.details || '-'}</td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  document.getElementById('contentArea').innerHTML = html;
}
