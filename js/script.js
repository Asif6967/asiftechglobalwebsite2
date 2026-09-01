const API_BASE = window.APP_API_BASE || (window.location.origin + '/api');

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Active Navigation Link
window.addEventListener('scroll', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';

    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// Portfolio Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Contact Form Validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const payload = Object.fromEntries(new FormData(contactForm).entries());
        const existingMessage = contactForm.querySelector('.form-message');
        const feedback = existingMessage || document.createElement('p');
        feedback.className = 'form-message';
        feedback.setAttribute('role', 'status');
        if (!existingMessage) contactForm.appendChild(feedback);

        fetch(API_BASE + '/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(async response => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || 'Unable to send your message.');
                return data;
            })
            .then(() => {
                feedback.textContent = 'Thank you for reaching out! We will get back to you soon.';
                feedback.style.color = '#15803d';
                contactForm.reset();
            })
            .catch(() => {
                feedback.textContent = 'We could not send your message right now. Please try again or email us directly.';
                feedback.style.color = '#b91c1c';
            });
    });
}

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            alert('Thank you for subscribing!');
            this.reset();
        }
    });
}

// Blog Search
const searchBlog = document.getElementById('searchBlog');
if (searchBlog) {
    searchBlog.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const blogPosts = document.querySelectorAll('.blog-post');

        blogPosts.forEach(post => {
            const title = post.querySelector('h2, h3')?.textContent.toLowerCase() || '';
            const content = post.querySelector('p')?.textContent.toLowerCase() || '';

            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    });
}

// Scroll to Top Button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        // Show scroll to top button if needed
    }
});

// Initialize animations on page load
window.addEventListener('load', () => {
    // Add any animations or effects here
    document.body.style.opacity = '1';
});

// FAQ Toggle
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    item.addEventListener('click', function() {
        const p = this.querySelector('p');
        p.style.display = p.style.display === 'none' ? 'block' : 'none';
    });
});

// Add loading state to forms
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function() {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            setTimeout(() => {
                submitBtn.textContent = 'Send Message';
                submitBtn.disabled = false;
            }, 1500);
        }
    });
});

// Lazy Loading for Images
if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}

// Prevent form submission default behavior
document.addEventListener('DOMContentLoaded', () => {
    const allForms = document.querySelectorAll('form');
    allForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // Form handling is done above
        });
    });
});

console.log('AsifTechGlobal - Premium Website Loaded Successfully!');
