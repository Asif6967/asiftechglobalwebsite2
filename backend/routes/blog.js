const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Helper to generate clean URL slug
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// GET /api/blog (Public: List all blogs with optional search/category)
router.get('/', (req, res) => {
    try {
        const { search, category } = req.query;
        let sql = 'SELECT id, title, slug, category, excerpt, image, author, read_time, published_at FROM blogs WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            sql += ' AND LOWER(category) = LOWER(?)';
            params.push(category);
        }

        if (search) {
            sql += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(excerpt) LIKE LOWER(?) OR LOWER(content) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term);
        }

        sql += ' ORDER BY published_at DESC';

        const blogs = db.all(sql, params);
        res.json({ success: true, count: blogs.length, data: blogs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/blog/:slugOrId (Public: Get single blog)
router.get('/:slugOrId', (req, res) => {
    try {
        const param = req.params.slugOrId;
        const blog = db.get('SELECT * FROM blogs WHERE slug = ? OR id = ?', [param, param]);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Article not found.' });
        }
        res.json({ success: true, data: blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/blog (Admin Only: Create blog)
router.post('/', verifyToken, (req, res) => {
    try {
        const { title, category, excerpt, content, image, author, read_time } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required.' });
        }

        let slug = slugify(title);
        // Check uniqueness of slug
        const existing = db.get('SELECT id FROM blogs WHERE slug = ?', [slug]);
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        const stmt = `
            INSERT INTO blogs (title, slug, category, excerpt, content, image, author, read_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = db.run(stmt, [
            title.trim(),
            slug,
            category || 'Technology',
            excerpt || title,
            content,
            image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
            author || req.user.name || 'AsifTech Team',
            read_time || '5 min read'
        ]);

        res.status(201).json({
            success: true,
            message: 'Blog post published successfully.',
            blogId: result.lastInsertRowid,
            slug
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/blog/:id (Admin Only: Update blog)
router.put('/:id', verifyToken, (req, res) => {
    try {
        const { title, category, excerpt, content, image, read_time } = req.body;
        const id = req.params.id;

        const existing = db.get('SELECT id FROM blogs WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Blog post not found.' });
        }

        const stmt = `
            UPDATE blogs
            SET title = COALESCE(?, title),
                category = COALESCE(?, category),
                excerpt = COALESCE(?, excerpt),
                content = COALESCE(?, content),
                image = COALESCE(?, image),
                read_time = COALESCE(?, read_time),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(stmt, [title, category, excerpt, content, image, read_time, id]);

        res.json({ success: true, message: 'Blog post updated successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/blog/:id (Admin Only: Delete blog)
router.delete('/:id', verifyToken, (req, res) => {
    try {
        db.run('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Blog post deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
