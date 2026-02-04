const translations = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.requests': 'Requests',
        'nav.inventory': 'Inventory',
        'nav.approvals': 'Approvals',
        'nav.delivery': 'Delivery',
        'nav.users': 'Users',
        'nav.history': 'History',
        'nav.logs': 'Logs',
        'nav.profile': 'Profile',
        'nav.new_request': 'New Request',
        'nav.analytics': 'Analytics',
        'label.ward_portal': 'Ward Portal',
        'nav.logout': 'Logout',

        // Login Page
        'login.welcome': 'Welcome back',
        'login.subtitle': 'Sign in to your account',
        'login.tab_user': 'User',
        'login.tab_admin': 'Admin',
        'login.btn_signin': 'Sign In',
        'login.btn_signingin': 'Signing in...',
        'login.toggle_signup': "Don't have an account? Sign up",
        'signup.subtitle': 'Create a new staff account',
        'signup.btn_create': 'Create Account',
        'signup.btn_creating': 'Creating account...',
        'signup.toggle_login': 'Already have an account? Sign in',
        'msg.welcome_redirect': 'Welcome! Redirecting to dashboard...',
        'error.invalid_credentials': 'Invalid credentials',
        'error.connection': 'Connection error. Is the server running?',
        'msg.signup_success': 'Account created! Pending admin approval.',
        'error.signup_failed': 'Signup failed',

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
        'status.out_of_stock': 'Out of Stock',
        'status.in_stock': 'In Stock',
        'status.suspended': 'Suspended',
        'status.active': 'Active',
        'status.rejected': 'Rejected',
        'status.active': 'Active',
        'status.rejected': 'Rejected',
        'status.cancelled': 'Cancelled',
        'status.urgent': 'Urgent',
        'status.normal': 'Normal',

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
        'label.password': 'Password',
        'label.sort_by': 'Sort by:',
        'label.edit_profile': 'Edit Profile',
        'label.usage_ward': 'Inventory Usage by Ward',
        'label.consumption_trends': 'Daily Consumption Trends',

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
        'th.order_id': 'Order ID',
        'th.rider': 'Rider',
        'th.urgency': 'Urgency',
        'th.employee_id': 'Employee ID',
        'th.department': 'Department',

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
        'btn.dispatch': 'Dispatch',
        'btn.complete': 'Complete',
        'btn.restock': '+ Restock',
        'btn.suspend': 'Suspend',
        'btn.delete': 'Delete',
        'btn.reactivate': 'Reactivate',

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
        'error.submit_fail': 'Error submitting request:',
        'msg.submitting': 'Submitting...',

        // Profile
        'profile.title': 'My Profile',
        'profile.update_title': 'Update Profile',
        'profile.employee_id': 'Employee ID',
        'profile.first_name': 'First Name',
        'profile.last_name': 'Last Name',
        'profile.department': 'Department',
        'profile.ward': 'Ward',
        'profile.phone': 'Phone',
        'profile.save': 'Save Changes',
        'profile.success': 'Profile updated successfully!',
        'profile.error': 'Error updating profile:',

        // Admin Prompts & Alerts
        'prompt.item_name': 'Item Name:',
        'prompt.name': 'Name:',
        'prompt.quantity': 'Quantity:',
        'prompt.ordered_by': 'Ordered By (Name):',
        'prompt.department': 'Department/Ward:',
        'prompt.destination': 'Destination (Ward/Department):',
        'prompt.delivered_by': 'Delivered By:',
        'prompt.notes': 'Notes (optional):',
        'prompt.category': 'Category:',
        'prompt.min_stock': 'Min Stock Level:',
        'prompt.unit': 'Unit (e.g., box, pcs):',
        'prompt.supplier': 'Supplier Name:',
        'prompt.phone': 'Phone Number:',
        'prompt.restock': 'Add quantity to "{name}":',
        'msg.order_created': 'Order created!',
        'msg.item_added': 'Item added!',
        'msg.user_approved': 'User approved!',
        'msg.user_rejected': 'User rejected!',
        'msg.delivery_added': 'Delivery person added!',
        'msg.restock_success': 'Added {qty} units to {itemName}',
        'msg.status_updated': 'Order status updated to {status}!',
        'confirm.suspend_user': 'Are you sure you want to suspend {name}? They will not be able to access the system.',
        'confirm.delete_user': '⚠️ WARNING: This will permanently delete {name}.\\n\\nType "DELETE" to confirm:',
        'confirm.reactivate_user': 'Reactivate {name}? They will be able to access the system again.',
        'msg.user_suspended': 'User {name} has been suspended successfully.',
        'msg.user_deleted': 'User {name} has been deleted successfully.',
        'msg.user_reactivated': 'User {name} has been reactivated successfully.',
        'msg.deletion_cancelled': 'Deletion cancelled.',
        'error.suspend_failed': 'Failed to suspend user. Please try again.',
        'error.delete_failed': 'Failed to delete user. Please try again.',
        'error.reactivate_failed': 'Failed to reactivate user. Please try again.',
        'error.insufficient_stock': "Insufficient stock for '{name}'. Requested: {req}, Available: {avail}",
        'error.update_fail': 'Failed to update order:',
        'confirm.stock_warning': 'Warning: Requested quantity ({qty}) exceeds available stock ({stock}). Proceed anyway?',
        'error.valid_qty': 'Please enter a valid quantity',
        'tab.all': 'All',
        'msg.no_orders': 'No orders found',
        'msg.just_now': 'Just now',
        'msg.na': 'N/A'
    },
    jp: {
        // Navigation
        'nav.dashboard': 'ダッシュボード',
        'nav.requests': 'リクエスト',
        'nav.inventory': '在庫管理',
        'nav.approvals': '承認待ち',
        'nav.users': 'ユーザー',
        'nav.delivery': '配送担当',
        'nav.history': '履歴',
        'nav.logs': 'ログ',
        'nav.profile': 'プロフィール',
        'nav.new_request': '新規リクエスト',
        'nav.analytics': '分析',
        'label.ward_portal': '病棟ポータル',
        'nav.logout': 'ログアウト',

        // Login Page
        'login.welcome': 'おかえりなさい',
        'login.subtitle': 'アカウントにサインイン',
        'login.tab_user': 'ユーザー',
        'login.tab_admin': '管理者',
        'login.btn_signin': 'サインイン',
        'login.btn_signingin': 'サインイン中...',
        'login.toggle_signup': 'アカウントをお持ちではありませんか？ 新規登録',
        'signup.subtitle': '新しいスタッフアカウントを作成',
        'signup.btn_create': 'アカウント作成',
        'signup.btn_creating': 'アカウント作成中...',
        'signup.toggle_login': '既にアカウントをお持ちですか？ サインイン',
        'msg.welcome_redirect': 'ようこそ！ダッシュボードへ移動します...',
        'error.invalid_credentials': '資格情報が無効です',
        'error.connection': '接続エラー。サーバーは稼働していますか？',
        'msg.signup_success': 'アカウントが作成されました！管理者の承認待ちです。',
        'error.signup_failed': '新規登録に失敗しました',

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
        'status.out_of_stock': '在庫切れ',
        'status.in_stock': '在庫あり',
        'status.suspended': '停止中',
        'status.active': '有効',
        'status.rejected': '却下',
        'status.cancelled': 'キャンセル済み',
        'status.urgent': '緊急',
        'status.normal': '通常',

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
        'label.password': 'パスワード',
        'label.sort_by': '並び替え:',
        'label.edit_profile': 'プロフィール編集',
        'label.usage_ward': '病棟別在庫使用状況',
        'label.consumption_trends': '日次消費トレンド',

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
        'th.order_id': '注文ID',
        'th.rider': '配送員',
        'th.urgency': '緊急度',
        'th.employee_id': '社員ID',
        'th.department': '部署',

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
        'btn.dispatch': '配送開始',
        'btn.complete': '完了',
        'btn.restock': '+ 在庫追加',
        'btn.suspend': '停止',
        'btn.delete': '削除',
        'btn.reactivate': '再有効化',

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
        'btn.cancel': 'キャンセル',
        'msg.cancel_confirm': 'このリクエストをキャンセルしてもよろしいですか？',
        'msg.cancel_success': 'リクエストをキャンセルしました',
        'error.cancel_fail': 'キャルセルに失敗しました:',

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
        'msg.submitting': '送信中...',

        // Profile
        'profile.title': 'マイプロフィール',
        'profile.update_title': 'プロフィール更新',
        'profile.employee_id': '社員番号',
        'profile.first_name': '名',
        'profile.last_name': '姓',
        'profile.department': '部署',
        'profile.ward': '病棟',
        'profile.phone': '電話番号',
        'profile.save': '変更を保存',
        'profile.success': 'プロフィールを更新しました！',
        'profile.error': 'プロフィール更新エラー:',

        // Admin Prompts & Alerts
        'prompt.item_name': '品目名:',
        'prompt.name': '名前:',
        'prompt.quantity': '数量:',
        'prompt.ordered_by': 'リクエスト者 (氏名):',
        'prompt.department': '部署/病棟:',
        'prompt.destination': '配送先 (病棟/部署):',
        'prompt.delivered_by': '配送担当者:',
        'prompt.notes': '備考 (任意):',
        'prompt.category': 'カテゴリ:',
        'prompt.min_stock': '最小在庫数:',
        'prompt.unit': '単位 (例: 箱, 個):',
        'prompt.supplier': '仕入先名:',
        'prompt.phone': '電話番号:',
        'prompt.restock': '"{name}" に数量を追加:',
        'msg.order_created': 'リクエストが作成されました！',
        'msg.item_added': 'アイテムが追加されました！',
        'msg.user_approved': 'ユーザーが承認されました！',
        'msg.user_rejected': 'ユーザーが却下されました！',
        'msg.delivery_added': '配送員が追加されました！',
        'msg.restock_success': '{itemName} に {qty} 個追加しました',
        'msg.status_updated': 'ステータスを {status} に更新しました！',
        'confirm.suspend_user': '{name} を停止してもよろしいですか？システムにアクセスできなくなります。',
        'confirm.delete_user': '⚠️ 警告: {name} を完全に削除します。\\n\\n確認のため「DELETE」と入力してください:',
        'confirm.reactivate_user': '{name} を再有効化しますか？システムに再度アクセスできるようになります。',
        'msg.user_suspended': 'ユーザー {name} を停止しました。',
        'msg.user_deleted': 'ユーザー {name} を削除しました。',
        'msg.user_reactivated': 'ユーザー {name} を再有効化しました。',
        'msg.deletion_cancelled': '削除がキャンセルされました。',
        'error.suspend_failed': 'ユーザーの停止に失敗しました。もう一度お試しください。',
        'error.delete_failed': 'ユーザーの削除に失敗しました。もう一度お試しください。',
        'error.reactivate_failed': 'ユーザーの再有効化に失敗しました。もう一度お試しください。',
        'error.insufficient_stock': "'{name}' の在庫が不足しています。申請: {req}, 在庫: {avail}",
        'error.update_fail': '注文の更新に失敗しました:',
        'confirm.stock_warning': '警告: リクエスト数量 ({qty}) が現在の在庫 ({stock}) を超えています。続行しますか？',
        'error.valid_qty': '有効な数量を入力してください',
        'tab.all': 'すべて',
        'msg.no_orders': '注文が見つかりませんでした',
        'msg.just_now': 'たった今',
        'msg.na': 'なし'
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

function t(key, params = {}) {
    let str = translations[currentLang][key] || key;
    for (const p in params) {
        str = str.replace(`{${p}}`, params[p]);
    }
    return str;
}

function formatDateTime(dateInput) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');

    return `${yyyy}/${mm}/${dd} ${HH}:${MM}`;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.placeholder) el.placeholder = translated;
        }

        if (el.hasAttribute('title')) {
            el.setAttribute('title', translated);
        }

        // Only update innerText if it's not JUST a container for other elements or if it's specifically for text
        if (el.children.length === 0 || el.hasAttribute('data-i18n-text-only')) {
            el.innerText = translated;
        }
    });

    // Handle special cases
    const imsAdmin = document.querySelector('.nav-brand h3');
    if (imsAdmin) imsAdmin.innerText = currentLang === 'en' ? 'IMS Admin' : 'IMS 管理者';

    const wardPortal = document.querySelector('.nav-brand h3[data-i18n="label.ward_portal"]');
    if (wardPortal) wardPortal.innerText = t('label.ward_portal');

    // Re-render current view to apply JS-based translations if function exists
    if (typeof showSection === 'function') {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn && activeBtn.classList.contains('nav-btn')) {
            showSection(activeBtn.dataset.section);
        }
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateButtonLabel();
    applyTranslations();
});
