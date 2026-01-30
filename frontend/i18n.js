const translations = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.requests': 'Requests',
        'nav.inventory': 'Inventory',
        'nav.approvals': 'Approvals',
        'nav.delivery': 'Delivery',
        'nav.history': 'Request History',
        'nav.logs': 'Logs',
        'nav.profile': 'Profile',
        'nav.new_request': 'New Request',
        'label.ward_portal': 'Ward Portal',

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
        'label.loading': 'Loading...',

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
        'p_status.on_delivery': 'On Delivery',

        // Order Flow
        'order.header.title': 'Collection Containers',
        'order.header.subtitle': 'Choose your items and specify quantities below',
        'order.urgency.label': 'Urgency Level',
        'urgency.normal': 'Normal',
        'urgency.urgent': 'Urgent',
        'btn.generate_summary': 'Generate Order Summary',
        'order.summary.title': 'Review Your Request',
        'label.units': 'units',
        'order.summary.total_qty': 'Total Quantity',
        'order.summary.priority': 'Priority:',
        'btn.confirm_submit': 'Confirm & Submit to Lab',
        'msg.select_item': 'Please select at least one item.',
        'error.load_containers': 'Error loading containers:',
        'btn.cancel': 'Cancel Request',
        'msg.cancel_confirm': 'Are you sure you want to cancel this request?',
        'msg.cancel_success': 'Request cancelled successfully!',
        'error.cancel_fail': 'Failed to cancel request:',

        // Containers (Dynamic Data)
        'Blood Collection Tube (EDTA)': 'Blood Collection Tube (EDTA)',
        'Blood Collection Tube (SST)': 'Blood Collection Tube (SST)',
        'Urine Container (24-hour)': 'Urine Container (24-hour)',
        'Stool Sample Container': 'Stool Sample Container',
        'Sputum Container': 'Sputum Container',
        'Swab (Throat)': 'Swab (Throat)',
        'Swab (Nasal)': 'Swab (Nasal)',
        'Synovial Fluid Container': 'Synovial Fluid Container',
        'CSF Container': 'CSF Container',
        'Sterile Urine Cup': 'Sterile Urine Cup',

        // History & Submission
        'th.history_summary': 'Summary',
        'th.history_items': 'Items',
        'msg.history_empty': 'No request history (0)',
        'label.order_id': 'Order #',
        'msg.submit_success': 'Multi-item request submitted successfully!',
        'error.submit_fail': 'Error submitting request:'
    },
    jp: {
        // Navigation
        'nav.dashboard': 'ダッシュボード',
        'nav.requests': 'リクエスト',
        'nav.inventory': '在庫管理',
        'nav.approvals': '承認待ち',
        'nav.delivery': '配送担当',
        'nav.history': 'リクエスト履歴',
        'nav.logs': 'ログ',
        'nav.profile': 'プロフィール',
        'nav.new_request': '新規リクエスト',
        'label.ward_portal': '病棟ポータル',

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
        'status.cancelled': 'キャンセル済み',

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
        'label.loading': '読み込み中...',

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
        'btn.cancel': 'キャンセル',

        // Personnel Status
        'p_status.available': '待機中',
        'p_status.on_delivery': '配送中',

        // Order Flow
        'order.header.title': '検体容器',
        'order.header.subtitle': '項目を選択し、数量を指定してください。',
        'order.urgency.label': '緊急度',
        'urgency.normal': '通常',
        'urgency.urgent': '緊急',
        'btn.generate_summary': '注文サマリーを作成',
        'order.summary.title': '注文内容の確認',
        'label.units': '個',
        'order.summary.total_qty': '合計数量',
        'order.summary.priority': '優先度:',
        'btn.confirm_submit': '確定してラボに送信',
        'msg.select_item': '少なくとも1つのアイテムを選択してください。',
        'error.load_containers': '容器の読み込みエラー:',

        // Containers (Dynamic Data)
        'Blood Collection Tube (EDTA)': '採血管 (EDTA)',
        'Blood Collection Tube (SST)': '採血管 (SST)',
        'Urine Container (24-hour)': '蓄尿容器 (24時間)',
        'Stool Sample Container': '検便容器',
        'Sputum Container': '喀痰容器',
        'Swab (Throat)': 'スワブ (咽頭)',
        'Swab (Nasal)': 'スワブ (鼻腔)',
        'Synovial Fluid Container': '関節液容器',
        'CSF Container': '髄液容器',
        'Sterile Urine Cup': '滅菌尿カップ',

        // History & Submission
        'th.history_summary': '概要',
        'th.history_items': '品目',
        'msg.history_empty': 'リクエスト履歴はありません (0)',
        'label.order_id': '注文 #',
        'msg.submit_success': 'リクエストを送信しました！',
        'error.submit_fail': 'リクエスト送信エラー:',
        'msg.cancel_confirm': 'このリクエストをキャンセルしてもよろしいですか？',
        'msg.cancel_success': 'リクエストをキャンセルしました',
        'error.cancel_fail': 'キャルセルに失敗しました:'
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
