// AsifTechGlobal Admin Dashboard JavaScript
const API_BASE = '/api';

let currentAdmin = null;

// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const dashboardApp = document.getElementById('dashboard-app');
const adminLoginForm = document.getElementById('admin-login-form');
const logoutBtn = document.getElementById('logout-btn');
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- Auth Token Helpers ---
function getToken() {
    return localStorage.getItem('asiftech_token');
}

function setToken(token) {
    localStorage.setItem('asiftech_token', token);
}

function clearToken() {
    localStorage.removeItem('asiftech_token');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// --- Check Auth on Load ---
async function checkAuth() {
    const token = getToken();
    if (!token) {
        showLogin();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            currentAdmin = data.user;
            unlockDashboard();
        } else {
            clearToken();
            showLogin();
        }
    } catch (e) {
        clearToken();
        showLogin();
    }
}

function showLogin() {
    loginOverlay.classList.remove('hidden');
    dashboardApp.classList.add('hidden');
}

function unlockDashboard() {
    loginOverlay.classList.add('hidden');
    dashboardApp.classList.remove('hidden');
    if (currentAdmin) {
        document.getElementById('admin-display-name').textContent = currentAdmin.name || 'Asif Tech Admin';
    }
    loadOverviewStats();
}

// --- Login Form Handler ---
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (data.success) {
                setToken(data.token);
                currentAdmin = data.user;
                showToast('Welcome back, Admin!', 'success');
                unlockDashboard();
            } else {
                showToast(data.message || 'Login failed', 'error');
            }
        } catch (err) {
            showToast('Unable to connect to server.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Sign In to Dashboard';
        }
    });
}

// --- Logout ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        clearToken();
        currentAdmin = null;
        showToast('Logged out successfully', 'info');
        showLogin();
    });
}

// --- Mobile Sidebar Toggle ---
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.add('open'));
}
if (sidebarClose) {
    sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
}

// --- Tab Navigation ---
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
        if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
        }
    });
});

function switchTab(tabId) {
    navItems.forEach(i => i.classList.remove('active'));
    const activeNav = document.querySelector(`.sidebar-nav .nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const target = document.getElementById(`tab-${tabId}`);
    if (target) {
        target.classList.add('active');
    }

    // Set Title
    const titleMap = {
        overview: 'Dashboard Overview',
        messages: 'Customer Inquiries & Messages',
        blogs: 'Blog Article Management',
        portfolio: 'Portfolio Showcase Management',
        subscribers: 'Newsletter Subscribers List',
        payments: 'Payment Transactions & Invoices',
        settings: 'Admin Security Settings'
    };
    document.getElementById('current-tab-title').textContent = titleMap[tabId] || 'Dashboard';

    // Trigger data loads
    if (tabId === 'overview') loadOverviewStats();
    if (tabId === 'messages') loadMessages();
    if (tabId === 'blogs') loadBlogs();
    if (tabId === 'portfolio') loadPortfolio();
    if (tabId === 'subscribers') loadSubscribers();
    if (tabId === 'payments') loadPayments();
}

// --- 1. OVERVIEW DATA ---
async function loadOverviewStats() {
    try {
        const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
        const json = await res.json();
        if (!json.success) return;

        const d = json.data;
        document.getElementById('stat-total-messages').textContent = d.totalMessages;
        document.getElementById('stat-unread-detail').textContent = `${d.unreadMessages} unread`;
        document.getElementById('badge-unread-count').textContent = d.unreadMessages;
        document.getElementById('stat-total-revenue').textContent = `$${d.totalRevenue}`;
        document.getElementById('stat-payments-detail').textContent = `${d.totalPayments} total orders`;
        document.getElementById('stat-total-blogs').textContent = d.totalBlogs;
        document.getElementById('stat-total-portfolio').textContent = d.totalPortfolio;

        // Recent Inquiries Table
        const msgTbody = document.getElementById('overview-recent-messages');
        if (d.recentMessages.length === 0) {
            msgTbody.innerHTML = '<tr><td colspan="4" class="text-center">No inquiries yet.</td></tr>';
        } else {
            msgTbody.innerHTML = d.recentMessages.map(m => `
                <tr>
                    <td><strong>${escapeHtml(m.name)}</strong></td>
                    <td>${escapeHtml(m.service || 'General')}</td>
                    <td>${new Date(m.created_at).toLocaleDateString()}</td>
                    <td><span class="badge ${m.status}">${m.status}</span></td>
                </tr>
            `).join('');
        }

        // Recent Payments Table
        const payTbody = document.getElementById('overview-recent-payments');
        if (d.recentPayments.length === 0) {
            payTbody.innerHTML = '<tr><td colspan="4" class="text-center">No transactions yet.</td></tr>';
        } else {
            payTbody.innerHTML = d.recentPayments.map(p => `
                <tr>
                    <td><code>${escapeHtml(p.order_id)}</code></td>
                    <td>${escapeHtml(p.client_name)}</td>
                    <td><strong>${p.currency} ${p.amount}</strong></td>
                    <td><span class="badge ${p.status}">${p.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.error('Stats loading error', e);
    }
}

// --- 2. MESSAGES TAB ---
async function loadMessages() {
    const tbody = document.getElementById('messages-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading inquiries...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/contact`, { headers: getAuthHeaders() });
        const json = await res.json();
        if (!json.success || json.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No contact inquiries found.</td></tr>';
            return;
        }

        tbody.innerHTML = json.data.map(item => `
            <tr>
                <td>${new Date(item.created_at).toLocaleString()}</td>
                <td>
                    <strong>${escapeHtml(item.name)}</strong><br>
                    <small class="text-muted">${escapeHtml(item.company || 'Individual')}</small>
                </td>
                <td>
                    <a href="mailto:${item.email}">${escapeHtml(item.email)}</a><br>
                    <small class="text-muted">${escapeHtml(item.phone || 'No phone')}</small>
                </td>
                <td>
                    <strong>${escapeHtml(item.service || 'General')}</strong><br>
                    <small class="text-muted">Budget: ${escapeHtml(item.budget || 'Not specified')}</small>
                </td>
                <td><span class="badge ${item.status}">${item.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon" title="View Message" onclick="viewMessage(${item.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon danger" title="Delete" onclick="deleteMessage(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load messages.</td></tr>';
    }
}

async function viewMessage(id) {
    try {
        const res = await fetch(`${API_BASE}/contact/${id}`, { headers: getAuthHeaders() });
        const json = await res.json();
        if (!json.success) return;

        const m = json.data;
        const modalContent = document.getElementById('message-modal-content');
        modalContent.innerHTML = `
            <div style="margin-bottom: 15px;">
                <p><strong>From:</strong> ${escapeHtml(m.name)} &lt;<a href="mailto:${m.email}">${escapeHtml(m.email)}</a>&gt;</p>
                <p><strong>Phone:</strong> ${escapeHtml(m.phone || 'N/A')}</p>
                <p><strong>Company:</strong> ${escapeHtml(m.company || 'N/A')}</p>
                <p><strong>Service:</strong> ${escapeHtml(m.service)}</p>
                <p><strong>Budget / Timeline:</strong> ${escapeHtml(m.budget || 'N/A')} / ${escapeHtml(m.timeline || 'N/A')}</p>
                <p><strong>Status:</strong> <span class="badge ${m.status}">${m.status}</span></p>
                <p><strong>Received:</strong> ${new Date(m.created_at).toLocaleString()}</p>
            </div>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--border);">
            <div>
                <h4>Inquiry Message:</h4>
                <div style="background: #f8fafc; padding: 14px; border-radius: 8px; margin-top: 8px; white-space: pre-wrap; border: 1px solid var(--border);">${escapeHtml(m.message)}</div>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn-primary btn-sm" onclick="updateMessageStatus(${m.id}, 'replied')">Mark as Replied</button>
                <a href="mailto:${m.email}?subject=Re: AsifTechGlobal Inquiry" class="btn-secondary btn-sm"><i class="fas fa-reply"></i> Reply via Email</a>
            </div>
        `;
        openModal('message-modal');
        loadMessages(); // refresh status badge
    } catch (e) {
        showToast('Error opening message', 'error');
    }
}

async function updateMessageStatus(id, status) {
    try {
        const res = await fetch(`${API_BASE}/contact/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('message-modal');
            loadMessages();
        }
    } catch (e) {
        showToast('Failed to update status', 'error');
    }
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to permanently delete this message?')) return;
    try {
        const res = await fetch(`${API_BASE}/contact/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const json = await res.json();
        if (json.success) {
            showToast(json.message, 'success');
            loadMessages();
        }
    } catch (e) {
        showToast('Failed to delete message', 'error');
    }
}

// Refresh button
const refreshMessagesBtn = document.getElementById('refresh-messages-btn');
if (refreshMessagesBtn) {
    refreshMessagesBtn.addEventListener('click', loadMessages);
}

// --- 3. BLOGS TAB ---
async function loadBlogs() {
    const tbody = document.getElementById('blogs-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading articles...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/blog`);
        const json = await res.json();
        if (!json.success || json.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No blog articles found.</td></tr>';
            return;
        }

        tbody.innerHTML = json.data.map(b => `
            <tr>
                <td><img src="${b.image || 'https://via.placeholder.com/50'}" class="thumb-preview" alt="Thumb"></td>
                <td>
                    <strong>${escapeHtml(b.title)}</strong><br>
                    <small class="text-muted">${escapeHtml(b.excerpt ? b.excerpt.substring(0, 50) + '...' : '')}</small>
                </td>
                <td><span class="badge read">${escapeHtml(b.category)}</span></td>
                <td>${escapeHtml(b.author)}</td>
                <td>${new Date(b.published_at).toLocaleDateString()}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon danger" title="Delete" onclick="deleteBlog(${b.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load articles.</td></tr>';
    }
}

const addBlogBtn = document.getElementById('add-blog-btn');
if (addBlogBtn) {
    addBlogBtn.addEventListener('click', () => {
        document.getElementById('blog-form').reset();
        document.getElementById('blog-id').value = '';
        document.getElementById('blog-modal-title').innerHTML = '<i class="fas fa-pen-nib"></i> Add New Blog Article';
        openModal('blog-modal');
    });
}

const blogForm = document.getElementById('blog-form');
if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('blog-id').value;
        const title = document.getElementById('blog-title').value.trim();
        const category = document.getElementById('blog-category').value;
        const read_time = document.getElementById('blog-read-time').value.trim();
        const excerpt = document.getElementById('blog-excerpt').value.trim();
        const content = document.getElementById('blog-content').value.trim();
        let image = document.getElementById('blog-image-url').value.trim();

        const fileInput = document.getElementById('blog-image-file');
        if (fileInput.files.length > 0) {
            // Upload file first
            const uploadedUrl = await uploadImageFile(fileInput.files[0]);
            if (uploadedUrl) image = uploadedUrl;
        }

        const payload = { title, category, read_time, excerpt, content, image };

        try {
            const url = id ? `${API_BASE}/blog/${id}` : `${API_BASE}/blog`;
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                closeModal('blog-modal');
                loadBlogs();
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            showToast('Error saving article', 'error');
        }
    });
}

async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
        const res = await fetch(`${API_BASE}/blog/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const json = await res.json();
        if (json.success) {
            showToast(json.message, 'success');
            loadBlogs();
        }
    } catch (e) {
        showToast('Error deleting blog post', 'error');
    }
}

// --- 4. PORTFOLIO TAB ---
async function loadPortfolio() {
    const tbody = document.getElementById('portfolio-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading projects...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/portfolio`);
        const json = await res.json();
        if (!json.success || json.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No portfolio projects found.</td></tr>';
            return;
        }

        tbody.innerHTML = json.data.map(p => `
            <tr>
                <td><img src="${p.image || 'https://via.placeholder.com/50'}" class="thumb-preview" alt="Thumb"></td>
                <td><strong>${escapeHtml(p.title)}</strong></td>
                <td><span class="badge replied">${escapeHtml(p.category.toUpperCase())}</span></td>
                <td>${escapeHtml(p.tech_stack || 'N/A')}</td>
                <td>${escapeHtml(p.client || 'Client')}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon danger" title="Delete" onclick="deletePortfolio(${p.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load projects.</td></tr>';
    }
}

const addProjectBtn = document.getElementById('add-project-btn');
if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
        document.getElementById('portfolio-form').reset();
        document.getElementById('portfolio-id').value = '';
        openModal('portfolio-modal');
    });
}

const portfolioForm = document.getElementById('portfolio-form');
if (portfolioForm) {
    portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('portfolio-id').value;
        const title = document.getElementById('portfolio-title').value.trim();
        const category = document.getElementById('portfolio-category').value;
        const client = document.getElementById('portfolio-client').value.trim();
        const tech_stack = document.getElementById('portfolio-tech').value.trim();
        const demo_link = document.getElementById('portfolio-demo').value.trim();
        const github_link = document.getElementById('portfolio-github').value.trim();
        const description = document.getElementById('portfolio-desc').value.trim();
        let image = document.getElementById('portfolio-image-url').value.trim();

        const fileInput = document.getElementById('portfolio-image-file');
        if (fileInput.files.length > 0) {
            const uploadedUrl = await uploadImageFile(fileInput.files[0]);
            if (uploadedUrl) image = uploadedUrl;
        }

        const payload = { title, category, client, tech_stack, demo_link, github_link, description, image };

        try {
            const url = id ? `${API_BASE}/portfolio/${id}` : `${API_BASE}/portfolio`;
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                closeModal('portfolio-modal');
                loadPortfolio();
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            showToast('Error saving project', 'error');
        }
    });
}

async function deletePortfolio(id) {
    if (!confirm('Are you sure you want to delete this portfolio project?')) return;
    try {
        const res = await fetch(`${API_BASE}/portfolio/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const json = await res.json();
        if (json.success) {
            showToast(json.message, 'success');
            loadPortfolio();
        }
    } catch (e) {
        showToast('Error deleting portfolio project', 'error');
    }
}

// --- 5. SUBSCRIBERS TAB ---
async function loadSubscribers() {
    const tbody = document.getElementById('subscribers-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading subscribers...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/newsletter`, { headers: getAuthHeaders() });
        const json = await res.json();
        if (!json.success || json.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No subscribers yet.</td></tr>';
            return;
        }

        tbody.innerHTML = json.data.map(s => `
            <tr>
                <td>#${s.id}</td>
                <td><strong>${escapeHtml(s.email)}</strong></td>
                <td>${new Date(s.subscribed_at).toLocaleString()}</td>
                <td>
                    <button class="btn-icon danger" title="Delete" onclick="deleteSubscriber(${s.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Failed to load subscribers.</td></tr>';
    }
}

async function deleteSubscriber(id) {
    if (!confirm('Remove this subscriber?')) return;
    try {
        const res = await fetch(`${API_BASE}/newsletter/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const json = await res.json();
        if (json.success) {
            showToast(json.message, 'success');
            loadSubscribers();
        }
    } catch (e) {
        showToast('Error deleting subscriber', 'error');
    }
}

const exportSubscribersBtn = document.getElementById('export-subscribers-btn');
if (exportSubscribersBtn) {
    exportSubscribersBtn.addEventListener('click', async () => {
        try {
            const res = await fetch(`${API_BASE}/newsletter`, { headers: getAuthHeaders() });
            const json = await res.json();
            if (!json.success || json.data.length === 0) {
                showToast('No subscribers to export', 'info');
                return;
            }
            let csv = 'ID,Email,SubscribedAt\n';
            json.data.forEach(s => {
                csv += `${s.id},"${s.email}","${s.subscribed_at}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `asiftech_subscribers_${Date.now()}.csv`;
            a.click();
            showToast('Subscriber list exported!', 'success');
        } catch (e) {
            showToast('Export failed', 'error');
        }
    });
}

// --- 6. PAYMENTS TAB ---
async function loadPayments() {
    const tbody = document.getElementById('payments-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading transactions...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/payment/transactions`, { headers: getAuthHeaders() });
        const json = await res.json();
        if (!json.success || json.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No payment transactions found.</td></tr>';
            return;
        }

        tbody.innerHTML = json.data.map(p => `
            <tr>
                <td><code>${escapeHtml(p.order_id)}</code></td>
                <td>
                    <strong>${escapeHtml(p.client_name)}</strong><br>
                    <small class="text-muted">${escapeHtml(p.client_email)}</small>
                </td>
                <td>${escapeHtml(p.service)}</td>
                <td><strong>${p.currency} ${p.amount}</strong></td>
                <td><span class="badge ${p.status}">${p.status}</span></td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                    ${p.status === 'pending' ? `
                        <button class="btn-primary btn-sm" onclick="markPaymentComplete('${p.order_id}')">
                            <i class="fas fa-check"></i> Verify Paid
                        </button>
                    ` : '<span class="text-muted"><i class="fas fa-check-double text-success"></i> Settled</span>'}
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Failed to load transactions.</td></tr>';
    }
}

const createManualOrderBtn = document.getElementById('create-manual-order-btn');
if (createManualOrderBtn) {
    createManualOrderBtn.addEventListener('click', () => {
        document.getElementById('create-order-form').reset();
        openModal('payment-modal');
    });
}

const createOrderForm = document.getElementById('create-order-form');
if (createOrderForm) {
    createOrderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const client_name = document.getElementById('order-client-name').value.trim();
        const client_email = document.getElementById('order-client-email').value.trim();
        const service = document.getElementById('order-service').value.trim();
        const amount = document.getElementById('order-amount').value.trim();
        const currency = document.getElementById('order-currency').value;

        try {
            const res = await fetch(`${API_BASE}/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_name, client_email, service, amount, currency })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Invoice Order ${data.orderId} Created!`, 'success');
                closeModal('payment-modal');
                loadPayments();
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            showToast('Failed to create order', 'error');
        }
    });
}

async function markPaymentComplete(orderId) {
    try {
        const res = await fetch(`${API_BASE}/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId,
                transactionId: 'TXN-MANUAL-' + Date.now(),
                paymentMethod: 'Manual Admin Confirmation'
            })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Order marked as Paid & receipt issued!', 'success');
            loadPayments();
            loadOverviewStats();
        }
    } catch (e) {
        showToast('Error completing order', 'error');
    }
}

// --- 7. SETTINGS / PASSWORD UPDATE ---
const changePassForm = document.getElementById('change-password-form');
if (changePassForm) {
    changePassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-pass').value;
        const newPassword = document.getElementById('new-pass').value;
        const confirmPassword = document.getElementById('confirm-pass').value;

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/password`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Password changed successfully!', 'success');
                changePassForm.reset();
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            showToast('Failed to change password.', 'error');
        }
    });
}

// --- File Upload Helper ---
async function uploadImageFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: formData
        });
        const json = await res.json();
        if (json.success) {
            return json.url;
        } else {
            showToast(json.message || 'Image upload failed', 'error');
            return null;
        }
    } catch (e) {
        showToast('Image upload failed', 'error');
        return null;
    }
}

// --- Modal Helpers ---
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Kickoff initialization
document.addEventListener('DOMContentLoaded', checkAuth);
