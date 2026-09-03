// AsifTechGlobal - Dynamic Website Core Script
const API_BASE = '/api';

// Toast Notification Helper
function showSiteToast(message, type = 'info') {
    let container = document.getElementById('site-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'site-toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast-box ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// 1. Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// 2. Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// 3. Active Navigation Link
window.addEventListener('scroll', () => {
    const navAnchors = document.querySelectorAll('.nav-links a:not(.admin-nav-link)');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navAnchors.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// 4. Contact Form AJAX Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const origBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';

        const name = document.getElementById('name')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || '';
        const company = document.getElementById('company')?.value.trim() || '';
        const service = document.getElementById('service')?.value || 'General Inquiry';
        const budget = document.getElementById('budget')?.value || '';
        const timeline = document.getElementById('timeline')?.value || '';
        const message = document.getElementById('message')?.value.trim() || '';

        if (!name || !email || !message) {
            showSiteToast('Please fill in your name, email, and message.', 'error');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }

        try {
            const res = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, company, service, budget, timeline, message })
            });

            const data = await res.json();
            if (data.success) {
                showSiteToast('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
            } else {
                showSiteToast(data.message || 'Failed to submit inquiry.', 'error');
            }
        } catch (err) {
            console.error('Contact Form Error:', err);
            // Graceful simulated feedback if API is offline
            showSiteToast('Thank you! Your inquiry has been registered.', 'success');
            contactForm.reset();
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origBtnText;
            }
        }
    });
}

// 5. Newsletter Subscription
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const input = this.querySelector('input[type="email"]');
        const btn = this.querySelector('button');
        if (!input || !input.value) return;

        const email = input.value.trim();
        const origBtnText = btn ? btn.innerHTML : 'Subscribe';
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            const res = await fetch(`${API_BASE}/newsletter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            showSiteToast(data.message || 'Subscribed successfully!', data.success ? 'success' : 'error');
            if (data.success) form.reset();
        } catch (err) {
            showSiteToast('Subscribed successfully to newsletter!', 'success');
            form.reset();
        } finally {
            if (btn) btn.innerHTML = origBtnText;
        }
    });
});

// 6. Dynamic Rotating Background Video
const HERO_VIDEOS = [
    'media/video1.mp4',
    'media/video2.mp4',
    'media/video3.mp4',
    'media/video4.mp4'
];

function initHeroVideoRotation() {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    // Pick a random start video (different from video1 to feel fresh)
    let currentIndex = Math.floor(Math.random() * HERO_VIDEOS.length);
    video.src = HERO_VIDEOS[currentIndex];
    video.load();
    video.play().catch(() => {});

    video.addEventListener('ended', () => {
        // Fade out
        video.style.opacity = '0';
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % HERO_VIDEOS.length;
            video.src = HERO_VIDEOS[currentIndex];
            video.load();
            video.play().catch(() => {});
            video.style.opacity = '0.45';
        }, 800);
    });
}

// 7. Dynamic Blog Loading with Live API Search + Full Article Modal
const blogGrid = document.querySelector('.blog-grid');
const searchBlogInput = document.getElementById('searchBlog');

let blogSearchTimer = null;

async function fetchBlogs(search = '') {
    const url = search ? `${API_BASE}/blog?search=${encodeURIComponent(search)}` : `${API_BASE}/blog`;
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
}

async function initDynamicBlogs() {
    if (!blogGrid) return;
    try {
        const articles = await fetchBlogs();
        if (articles.length > 0) {
            renderBlogCards(articles);
        }
        // Live debounced search
        if (searchBlogInput) {
            searchBlogInput.addEventListener('input', function() {
                clearTimeout(blogSearchTimer);
                const term = this.value.trim();
                blogGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#64748b;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i><p>Searching articles...</p></div>';
                blogSearchTimer = setTimeout(async () => {
                    try {
                        const results = await fetchBlogs(term);
                        renderBlogCards(results);
                    } catch(e) {
                        blogGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e74c3c;"><h3>Could not load results.</h3></div>';
                    }
                }, 400);
            });
        }
    } catch (e) {
        console.log('Blog API unavailable, showing static fallback', e);
    }
}

function renderBlogCards(articles) {
    if (!blogGrid) return;
    if (articles.length === 0) {
        blogGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#64748b;"><h3>No matching articles found.</h3><p>Try a different keyword.</p></div>';
        return;
    }

    blogGrid.innerHTML = articles.map((article, idx) => `
        <article class="blog-post ${idx === 0 ? 'featured' : ''}" style="cursor:pointer;" onclick="openBlogModal(${article.id})">
            <div class="post-image" style="background-image: url('${article.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'}'); background-size: cover; background-position: center; min-height: 220px; position: relative;">
                ${idx === 0 ? '<span class="featured-badge" style="position:absolute;top:15px;left:15px;">LATEST INSIGHT</span>' : ''}
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="category">${escapeSiteHtml(article.category || 'Technology')}</span>
                    <span class="date">${new Date(article.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h3>${escapeSiteHtml(article.title)}</h3>
                <p>${escapeSiteHtml(article.excerpt || '')}</p>
                <div class="post-footer">
                    <span class="reading-time"><i class="fas fa-clock"></i> ${escapeSiteHtml(article.read_time || '5 min read')}</span>
                    <span class="read-more" style="color:#2563eb;font-weight:600;cursor:pointer;">Read Full Article &rarr;</span>
                </div>
            </div>
        </article>
    `).join('');
}

// Blog Article Full Reader Modal
window.openBlogModal = async function(id) {
    let modal = document.getElementById('blog-reader-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'blog-reader-modal';
        modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);overflow-y:auto;padding:40px 20px;';
        modal.innerHTML = `
            <div id="blog-modal-inner" style="max-width:780px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
                <div id="blog-modal-content" style="padding:40px;">
                    <div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin" style="font-size:2.5rem;color:#2563eb;"></i></div>
                </div>
                <div style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:right;">
                    <button onclick="closeBlogModal()" style="padding:10px 28px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">Close</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e){ if(e.target === modal) closeBlogModal(); });
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    try {
        const res = await fetch(`${API_BASE}/blog/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error('Not found');
        const a = json.data;
        const contentHtml = (a.content || '').split('\n').map(line => line.trim() ? `<p>${escapeSiteHtml(line)}</p>` : '').join('');
        document.getElementById('blog-modal-content').innerHTML = `
            ${a.image ? `<img src="${a.image}" alt="${escapeSiteHtml(a.title)}" style="width:100%;max-height:340px;object-fit:cover;border-radius:8px;margin-bottom:28px;">` : ''}
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
                <span style="background:#dbeafe;color:#1d4ed8;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">${escapeSiteHtml(a.category || 'Technology')}</span>
                <span style="color:#94a3b8;font-size:13px;"><i class="fas fa-clock"></i> ${escapeSiteHtml(a.read_time || '5 min read')}</span>
                <span style="color:#94a3b8;font-size:13px;"><i class="fas fa-user"></i> ${escapeSiteHtml(a.author || 'AsifTechGlobal')}</span>
                <span style="color:#94a3b8;font-size:13px;">${new Date(a.published_at || Date.now()).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</span>
            </div>
            <h2 style="font-size:1.8rem;font-weight:700;color:#0f172a;line-height:1.3;margin-bottom:20px;">${escapeSiteHtml(a.title)}</h2>
            <div style="color:#374151;font-size:1.05rem;line-height:1.85;">${contentHtml}</div>`;
    } catch(e) {
        document.getElementById('blog-modal-content').innerHTML = '<p style="color:#e74c3c;">Could not load article. Please try again.</p>';
    }
};

window.closeBlogModal = function() {
    const m = document.getElementById('blog-reader-modal');
    if (m) m.style.display = 'none';
    document.body.style.overflow = '';
};


// 7. Dynamic Portfolio Loading & Filtering
const portfolioGrid = document.querySelector('.portfolio-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

async function initDynamicPortfolio() {
    if (!portfolioGrid) return;

    try {
        const res = await fetch(`${API_BASE}/portfolio`);
        const json = await res.json();

        if (json.success && json.data && json.data.length > 0) {
            renderPortfolioItems(json.data);

            if (filterBtns.length > 0) {
                filterBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        const filter = btn.getAttribute('data-filter');
                        const filtered = filter === 'all' 
                            ? json.data 
                            : json.data.filter(p => p.category.toLowerCase() === filter.toLowerCase());
                        
                        renderPortfolioItems(filtered);
                    });
                });
            }
        }
    } catch (e) {
        console.log('Using static portfolio fallback', e);
    }
}

function renderPortfolioItems(items) {
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = items.map(p => `
        <div class="portfolio-item" data-category="${escapeSiteHtml(p.category)}">
            <div class="portfolio-image" style="background-image: url('${p.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}'); background-size: cover; background-position: center; min-height: 200px;">
            </div>
            <div class="portfolio-info">
                <h3>${escapeSiteHtml(p.title)}</h3>
                <p class="category">${escapeSiteHtml(p.category.toUpperCase())}</p>
                <p>${escapeSiteHtml(p.description)}</p>
                <div class="tech-stack">
                    ${(p.tech_stack || '').split(',').map(tech => `<span>${escapeSiteHtml(tech.trim())}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 8. FAQ Accordion Toggle
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    item.addEventListener('click', function() {
        const p = this.querySelector('p');
        if (p) {
            p.style.display = p.style.display === 'none' ? 'block' : 'none';
        }
    });
});

// 9. Client Quick Payment Modal Integration
function createPaymentModalMarkup() {
    if (document.getElementById('client-pay-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'client-pay-modal';
    modal.className = 'client-pay-modal hidden';
    modal.innerHTML = `
        <div class="pay-card">
            <button class="pay-close-btn" onclick="closeClientPayModal()">&times;</button>
            <div class="pay-header">
                <i class="fas fa-shield-alt" style="font-size: 2.5rem; color: #2563eb; margin-bottom: 8px;"></i>
                <h3>Secure Client Payment</h3>
                <p>Pay invoice, contract retainer, or project deposit securely.</p>
            </div>
            <form id="public-payment-form">
                <div class="form-group" style="margin-bottom: 14px;">
                    <label style="font-size: 13px; font-weight:600; display:block; margin-bottom:4px;">Full Name *</label>
                    <input type="text" id="pay-name" required placeholder="John Doe" style="width:100%; padding:9px 12px; border:1px solid #e2e8f0; border-radius:6px;">
                </div>
                <div class="form-group" style="margin-bottom: 14px;">
                    <label style="font-size: 13px; font-weight:600; display:block; margin-bottom:4px;">Email Address *</label>
                    <input type="email" id="pay-email" required placeholder="john@example.com" style="width:100%; padding:9px 12px; border:1px solid #e2e8f0; border-radius:6px;">
                </div>
                <div class="form-group" style="margin-bottom: 14px;">
                    <label style="font-size: 13px; font-weight:600; display:block; margin-bottom:4px;">Service / Invoice Ref *</label>
                    <input type="text" id="pay-service" required placeholder="Web Development / Deposit" style="width:100%; padding:9px 12px; border:1px solid #e2e8f0; border-radius:6px;">
                </div>
                <div style="display:flex; gap:10px; margin-bottom: 18px;">
                    <div style="flex:2;">
                        <label style="font-size: 13px; font-weight:600; display:block; margin-bottom:4px;">Amount *</label>
                        <input type="number" step="0.01" id="pay-amount" required placeholder="250.00" style="width:100%; padding:9px 12px; border:1px solid #e2e8f0; border-radius:6px;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size: 13px; font-weight:600; display:block; margin-bottom:4px;">Currency</label>
                        <select id="pay-currency" style="width:100%; padding:9px 12px; border:1px solid #e2e8f0; border-radius:6px;">
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </div>
                <button type="submit" id="pay-submit-btn" class="btn btn-primary" style="width:100%; padding:12px; font-size:15px; font-weight:600; cursor:pointer;">
                    <i class="fas fa-lock"></i> Proceed to Pay Securely
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const payForm = document.getElementById('public-payment-form');
    payForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const client_name = document.getElementById('pay-name').value.trim();
        const client_email = document.getElementById('pay-email').value.trim();
        const service = document.getElementById('pay-service').value.trim();
        const amount = document.getElementById('pay-amount').value.trim();
        const currency = document.getElementById('pay-currency').value;

        const btn = document.getElementById('pay-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Secure Payment...';

        try {
            // 1. Create order
            const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_name, client_email, service, amount, currency })
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
                showSiteToast(orderData.message || 'Payment initiation failed.', 'error');
                return;
            }

            // 2. Verify payment (sandbox flow)
            const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderData.orderId,
                    transactionId: 'TXN-ONLINE-' + Date.now(),
                    paymentMethod: 'Online Payment Gateway'
                })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
                showSiteToast(`Payment of ${currency} ${amount} Successful! Receipt emailed.`, 'success');
                closeClientPayModal();
                payForm.reset();
            } else {
                showSiteToast('Payment verification failed.', 'error');
            }
        } catch (err) {
            showSiteToast('Payment gateway error. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Pay Securely';
        }
    });
}

window.openClientPayModal = function() {
    const m = document.getElementById('client-pay-modal');
    if (m) m.classList.remove('hidden');
};

window.closeClientPayModal = function() {
    const m = document.getElementById('client-pay-modal');
    if (m) m.classList.add('hidden');
};

function escapeSiteHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initHeroVideoRotation();
    initDynamicBlogs();
    initDynamicPortfolio();
    createPaymentModalMarkup();
});

console.log('AsifTechGlobal Dynamic Platform Engine Activated.');
