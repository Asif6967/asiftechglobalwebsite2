const API_BASE = window.APP_API_BASE || (window.location.origin + '/api');
const TOKEN_KEY = 'asiftechglobal_admin_token';
const state = { blog: [], portfolio: [] };

const $ = (selector) => document.querySelector(selector);
const loginView = $('#loginView');
const dashboardView = $('#dashboardView');
const modal = $('#modal');

function setMessage(element, message, success = false) {
    element.textContent = message || '';
    element.classList.toggle('success', success);
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    dashboardView.hidden = true;
    loginView.hidden = false;
}

async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY) || ''}`);
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await fetch(API_BASE + path, { ...options, headers });
    if (response.status === 401) {
        logout();
        throw new Error('Your session has expired. Please sign in again.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}

function cell(text, className) {
    const element = document.createElement('td');
    element.textContent = text == null ? '' : String(text);
    if (className) element.className = className;
    return element;
}

function actionButton(label, action, id, danger = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `small-button${danger ? ' danger' : ''}`;
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = id;
    return button;
}

function renderContacts(items) {
    const body = $('#contactsBody');
    body.replaceChildren();
    items.forEach((item) => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        row.append(cell(`${item.name}\n${item.email}`));
        row.append(cell(item.company || '—'));
        row.append(cell(item.service || '—'));
        row.append(cell(item.message, 'contact-message'));
        const statusCell = document.createElement('td');
        const select = document.createElement('select');
        ['new', 'read', 'responded', 'archived'].forEach((status) => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            option.selected = item.status === status;
            select.append(option);
        });
        select.dataset.contactStatus = item.id;
        statusCell.append(select);
        row.append(statusCell, cell(new Date(item.created_at).toLocaleString()));
        const actions = document.createElement('td');
        actions.className = 'row-actions';
        actions.append(actionButton('Delete', 'delete-contact', item.id, true));
        row.append(actions);
        body.append(row);
    });
}

function renderBlog(items) {
    const body = $('#blogBody');
    body.replaceChildren();
    items.forEach((item) => {
        const row = document.createElement('tr');
        row.append(cell(item.title), cell(item.category || '—'), cell(item.status), cell(item.published_at ? new Date(item.published_at).toLocaleDateString() : '—'));
        const actions = document.createElement('td');
        actions.className = 'row-actions';
        actions.append(actionButton('Edit', 'edit-blog', item.id), actionButton('Delete', 'delete-blog', item.id, true));
        row.append(actions);
        body.append(row);
    });
}

function renderPortfolio(items) {
    const body = $('#portfolioBody');
    body.replaceChildren();
    items.forEach((item) => {
        const row = document.createElement('tr');
        row.append(cell(item.title), cell(item.category || '—'), cell(item.featured ? 'Yes' : 'No'), cell(item.sort_order));
        const actions = document.createElement('td');
        actions.className = 'row-actions';
        actions.append(actionButton('Edit', 'edit-portfolio', item.id), actionButton('Delete', 'delete-portfolio', item.id, true));
        row.append(actions);
        body.append(row);
    });
}

async function loadDashboard() {
    try {
        const [contacts, blog, portfolio] = await Promise.all([
            apiFetch('/contact?limit=100'),
            apiFetch('/blog?limit=100'),
            apiFetch('/portfolio')
        ]);
        state.blog = blog.items || [];
        state.portfolio = Array.isArray(portfolio) ? portfolio : (portfolio.items || []);
        renderContacts(contacts.items || []);
        renderBlog(state.blog);
        renderPortfolio(state.portfolio);
        $('#totalContacts').textContent = contacts.total || 0;
        $('#newContacts').textContent = (contacts.items || []).filter((item) => item.status === 'new').length;
        $('#totalPosts').textContent = blog.total || state.blog.length;
        $('#totalProjects').textContent = state.portfolio.length;
        setMessage($('#dashboardMessage'), '');
    } catch (error) {
        setMessage($('#dashboardMessage'), error.message);
    }
}

function field(label, name, value = '', type = 'text', full = false) {
    const wrapper = document.createElement('label');
    if (full) wrapper.className = 'full';
    wrapper.textContent = label;
    const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    input.name = name;
    input.type = type === 'textarea' ? 'text' : type;
    input.value = value == null ? '' : value;
    if (type === 'textarea') input.rows = 5;
    wrapper.append(input);
    return wrapper;
}

function openContentModal(type, item = {}) {
    const form = $('#contentForm');
    form.replaceChildren();
    const grid = document.createElement('div');
    grid.className = 'form-grid';
    const fields = type === 'blog'
        ? [
            ['Title', 'title', item.title, 'text', false], ['Slug', 'slug', item.slug, 'text', false],
            ['Excerpt', 'excerpt', item.excerpt, 'textarea', true], ['Content', 'content', item.content, 'textarea', true],
            ['Category', 'category', item.category, 'text', false], ['Author', 'author', item.author, 'text', false],
            ['Image URL', 'image_url', item.image_url, 'url', false], ['Published at', 'published_at', item.published_at ? item.published_at.slice(0, 16) : '', 'datetime-local', false]
        ]
        : [
            ['Title', 'title', item.title, 'text', false], ['Category', 'category', item.category, 'text', false],
            ['Client', 'client', item.client, 'text', false], ['Description', 'description', item.description, 'textarea', true],
            ['Image URL', 'image_url', item.image_url, 'url', false], ['Project URL', 'project_url', item.project_url, 'url', false],
            ['Technologies', 'technologies', item.technologies, 'text', true], ['Completed on', 'completed_on', item.completed_on, 'date', false],
            ['Sort order', 'sort_order', item.sort_order || 0, 'number', false]
        ];
    fields.forEach((args) => grid.append(field(...args)));
    if (type === 'blog') {
        const status = field('Status', 'status', item.status || 'draft');
        const select = status.querySelector('input');
        const replacement = document.createElement('select');
        ['draft', 'published'].forEach((value) => {
            const option = document.createElement('option');
            option.value = value; option.textContent = value; option.selected = value === (item.status || 'draft');
            replacement.append(option);
        });
        status.replaceChild(replacement, select);
        grid.append(status);
    } else {
        const featured = field('Featured', 'featured', '', 'checkbox');
        featured.className += ' checkbox-label';
        featured.querySelector('input').checked = Boolean(item.featured);
        grid.append(featured);
    }
    form.append(grid);
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button'; cancel.className = 'button outline'; cancel.textContent = 'Cancel'; cancel.dataset.closeModal = 'true';
    const save = document.createElement('button');
    save.type = 'submit'; save.className = 'button primary'; save.textContent = item.id ? 'Save changes' : 'Create';
    actions.append(cancel, save);
    form.append(actions);
    $('#modalTitle').textContent = item.id ? `Edit ${type === 'blog' ? 'post' : 'project'}` : `New ${type === 'blog' ? 'post' : 'project'}`;
    form.dataset.type = type;
    form.dataset.id = item.id || '';
    modal.hidden = false;
}

function closeModal() { modal.hidden = true; }

$('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage($('#loginMessage'), 'Signing in…');
    const form = new FormData(event.currentTarget);
    try {
        const response = await fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: form.get('username'), password: form.get('password') })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to sign in');
        localStorage.setItem(TOKEN_KEY, data.token);
        loginView.hidden = true; dashboardView.hidden = false;
        event.currentTarget.reset();
        await loadDashboard();
    } catch (error) {
        setMessage($('#loginMessage'), error.message);
    }
});

$('#logoutButton').addEventListener('click', logout);
$('#closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((button) => button.classList.toggle('active', button === tab));
    ['contacts', 'blog', 'portfolio'].forEach((name) => { $(`#${name}Panel`).hidden = name !== tab.dataset.tab; });
}));
$('#newBlogButton').addEventListener('click', () => openContentModal('blog'));
$('#newPortfolioButton').addEventListener('click', () => openContentModal('portfolio'));

document.querySelector('#contactsBody').addEventListener('change', async (event) => {
    if (!event.target.dataset.contactStatus) return;
    try {
        await apiFetch(`/contact/${event.target.dataset.contactStatus}/status`, { method: 'PATCH', body: JSON.stringify({ status: event.target.value }) });
    } catch (error) { setMessage($('#dashboardMessage'), error.message); }
});

document.querySelectorAll('#contactsBody, #blogBody, #portfolioBody').forEach((body) => body.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    try {
        if (button.dataset.action === 'delete-contact' || button.dataset.action === 'delete-blog' || button.dataset.action === 'delete-portfolio') {
            if (!window.confirm('Delete this item?')) return;
            const path = button.dataset.action === 'delete-contact' ? `/contact/${id}` : button.dataset.action === 'delete-blog' ? `/blog/${id}` : `/portfolio/${id}`;
            await apiFetch(path, { method: 'DELETE' });
        } else if (button.dataset.action === 'edit-blog') {
            openContentModal('blog', state.blog.find((item) => item.id === id));
            return;
        } else if (button.dataset.action === 'edit-portfolio') {
            openContentModal('portfolio', state.portfolio.find((item) => item.id === id));
            return;
        }
        await loadDashboard();
    } catch (error) { setMessage($('#dashboardMessage'), error.message); }
}));

$('#contentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (event.currentTarget.dataset.type === 'portfolio') payload.featured = form.get('featured') === 'on';
    if (event.currentTarget.dataset.type === 'blog' && !payload.published_at) payload.published_at = null;
    const type = event.currentTarget.dataset.type;
    const id = event.currentTarget.dataset.id;
    try {
        await apiFetch(`/${type}${id ? `/${id}` : ''}`, {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });
        closeModal();
        await loadDashboard();
    } catch (error) { setMessage($('#dashboardMessage'), error.message); }
});

document.addEventListener('click', (event) => { if (event.target.dataset.closeModal) closeModal(); });

if (localStorage.getItem(TOKEN_KEY)) {
    loginView.hidden = true;
    dashboardView.hidden = false;
    loadDashboard();
}
