const translations = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.requests': 'Requests',
        'nav.inventory': 'Inventory',
        'nav.approvals': 'Approvals',
        'nav.delivery': 'Delivery',
        'nav.history': 'History',
        'nav.logs': 'Logs',
        'nav.profile': 'Profile',
        'nav.new_request': 'New Request',

        // Dashboard Cards
        'card.pending_approvals': 'Pending User Approvals',
        'card.container_requests': 'Container Requests',
        'card.inventory_items': 'Inventory Items',
        'card.pending_requests': 'Pending Requests',
        'card.dispatched': 'Dispatched (Incoming)',
        'card.completed': 'Completed/Returned',

        // Statuses
        'status.pending': 'Pending',
        'status.out_for_delivery': 'Dispatched',
        'status.completed': 'Completed',
        'status.delivered': 'Delivered',
        'status.low_stock': 'Low Stock',
        'status.in_stock': 'In Stock',
        'status.active': 'Active',
        'status.rejected': 'Rejected',

        // Headers & Labels
        'header.dashboard': 'Dashboard',
        'header.clinical_dashboard': 'Clinical Lab Dashboard',
        'header.ward_dashboard': 'Ward Dashboard',
        'label.item': 'Item',
        'label.quantity': 'Qty',
        'label.status': 'Status',
        'label.actions': 'Actions',
        'label.ward': 'Ward/Dept',
        'label.requested_by': 'Requested By',
        'label.date': 'Date',
        'label.first_name': 'First Name',
        'label.last_name': 'Last Name',
        'label.email': 'Email',
        'label.name': 'Name',
        'label.role': 'Role',
        'label.supplier': 'Supplier',
        'label.category': 'Category',
        'label.unit': 'Unit',
        'label.min_stock': 'Min Stock',
        'label.phone': 'Phone',
        'label.vehicle': 'Vehicle Number',
        'label.delivered_by': 'Delivered By',
        'label.destination': 'Destination',
        'label.notes': 'Notes',

        // Table Headers
        'th.item': 'Item',
        'th.qty': 'Qty',
        'th.requested_by': 'Requested By',
        'th.ordered_by': 'Ordered By',
        'th.ward': 'Ward/Dept',
        'th.status': 'Status',
        'th.actions': 'Actions',
        'th.name': 'Name',
        'th.category': 'Category',
        'th.unit': 'Unit',
        'th.min_stock': 'Min Stock',
        'th.supplier': 'Supplier',
        'th.email': 'Email',
        'th.role': 'Role',
        'th.phone': 'Phone',
        'th.vehicle': 'Vehicle',
        'th.destination': 'Destination',
        'th.delivered_by': 'Delivered By',
        'th.notes': 'Notes',
        'th.action': 'Action',
        'th.target': 'Target',
        'th.timestamp': 'Timestamp',

        // Buttons
        'btn.submit': 'Submit Request',
        'btn.save': 'Save Changes',
        'btn.approve': 'Approve',
        'btn.reject': 'Reject',
        'btn.record': 'Record Request',
        'btn.new_order': 'New Order',
        'btn.add_item': '+ Add New Item',
        'btn.assign': 'Assign',
        'btn.unassign': 'Unassign',
        'btn.mark_completed': 'Mark Completed',
        'btn.send_delivery': 'Send for Delivery',
        'btn.record_manual': 'Record Manual Request',

        // Personnel Status
        'p_status.available': 'Available',
        'p_status.on_delivery': 'On Delivery'
    },
    jp: {
        // Navigation
        'nav.dashboard': 'ダッシュボード',
        'nav.requests': 'リクエスト',
        'nav.inventory': '在庫管理',
        'nav.approvals': '承認待ち',
        'nav.delivery': '配送担当',
        'nav.history': '履歴',
        'nav.logs': 'ログ',
        'nav.profile': 'プロフィール',
        'nav.new_request': '新規リクエスト',

        // Dashboard Cards
        'card.pending_approvals': '承認待ちユーザー',
        'card.container_requests': '容器リクエスト',
        'card.inventory_items': '在庫アイテム',
        'card.pending_requests': '保留中のリクエスト',
        'card.dispatched': '配送中 (受取待ち)',
        'card.completed': '完了/返却済み',

        // Statuses
        'status.pending': '保留中',
        'status.out_for_delivery': '配送中',
        'status.completed': '完了',
        'status.delivered': '配達済み',
        'status.low_stock': '在庫少',
        'status.in_stock': '在庫あり',
        'status.active': '有効',
        'status.rejected': '却下',

        // Headers & Labels
        'header.dashboard': 'ダッシュボード',
        'header.clinical_dashboard': '臨床検査室ダッシュボード',
        'header.ward_dashboard': '病棟ダッシュボード',
        'label.item': '品目',
        'label.quantity': '数量',
        'label.status': 'ステータス',
        'label.actions': 'アクション',
        'label.ward': '病棟/部署',
        'label.requested_by': '申請者',
        'label.date': '日付',
        'label.first_name': '名',
        'label.last_name': '姓',
        'label.email': 'メール',
        'label.name': '名前',
        'label.role': '役割',
        'label.supplier': '仕入先',
        'label.category': 'カテゴリ',
        'label.unit': '単位',
        'label.min_stock': '最小在庫',
        'label.phone': '電話番号',
        'label.vehicle': '車両番号',
        'label.delivered_by': '配送担当者',
        'label.destination': '配送先',
        'label.notes': '備考',

        // Table Headers
        'th.item': '品目',
        'th.qty': '数量',
        'th.requested_by': '申請者',
        'th.ordered_by': 'リクエスト者',
        'th.ward': '病棟/部署',
        'th.status': 'ステータス',
        'th.actions': 'アクション',
        'th.name': '名前',
        'th.category': 'カテゴリ',
        'th.unit': '単位',
        'th.min_stock': '最小在庫',
        'th.supplier': '仕入先',
        'th.email': 'メール',
        'th.role': '役割',
        'th.phone': '電話番号',
        'th.vehicle': '車両番号',
        'th.destination': '配送先',
        'th.delivered_by': '配送担当者',
        'th.notes': '備考',
        'th.action': '操作',
        'th.target': '対象',
        'th.timestamp': '日時',

        // Buttons
        'btn.submit': 'リクエスト送信',
        'btn.save': '変更を保存',
        'btn.approve': '承認',
        'btn.reject': '拒否',
        'btn.record': 'リクエスト記録',
        'btn.new_order': '新規注文',
        'btn.add_item': '+ 新規アイテム追加',
        'btn.assign': '割り当て',
        'btn.unassign': '解除',
        'btn.mark_completed': '完了とする',
        'btn.send_delivery': '配送へ回す',
        'btn.record_manual': '手動リクエスト記録',

        // Personnel Status
        'p_status.available': '待機中',
        'p_status.on_delivery': '配送中'
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'jp' : 'en';
    localStorage.setItem('lang', currentLang);
    applyTranslations();
    updateButtonLabel();
}

function updateButtonLabel() {
    const btn = document.getElementById('langBtn');
    if (btn) {
        btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      ${currentLang === 'en' ? 'English' : '日本語'}
    `;
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = t(key);
    });

    // Re-render current view to apply JS-based translations if function exists
    if (typeof showSection === 'function') {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn) {
            showSection(activeBtn.dataset.section);
        }
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateButtonLabel();
    applyTranslations();
});
