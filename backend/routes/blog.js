const express = require('express');
const { sql, getPool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const blogStatuses = ['draft', 'published'];

function pagination(query) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
    return { page, limit, offset: (page - 1) * limit };
}

function bodyValue(body, key) {
    return Object.prototype.hasOwnProperty.call(body, key) ? body[key] : null;
}

router.get('/', async (req, res, next) => {
    try {
        const { page, limit, offset } = pagination(req.query);
        const category = req.query.category ? String(req.query.category) : null;
        const searchTerm = req.query.search ? String(req.query.search) : null;
        const search = searchTerm ? '%' + searchTerm + '%' : null;
        const pool = await getPool();
        const request = pool.request()
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset)
            .input('category', sql.NVarChar(100), category)
            .input('search', sql.NVarChar(500), search);
        const filters = ['status = \'published\''];
        if (category) filters.push('category = @category');
        if (search) filters.push('(title LIKE @search OR excerpt LIKE @search)');
        const result = await request.query(`SELECT id, title, slug, excerpt, content, category, author, image_url,
                status, published_at, created_at, updated_at
            FROM blog_posts
            WHERE ${filters.join(' AND ')}
            ORDER BY published_at DESC, id DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`);
        const countResult = await pool.request()
            .input('category', sql.NVarChar(100), category)
            .input('search', sql.NVarChar(500), search)
            .query(`SELECT COUNT(*) AS total FROM blog_posts WHERE ${filters.join(' AND ')}`);
        return res.json({ items: result.recordset, total: countResult.recordset[0].total, page, limit });
    } catch (error) {
        return next(error);
    }
});

router.get('/:slug', async (req, res, next) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('slug', sql.NVarChar(255), req.params.slug)
            .query(`SELECT id, title, slug, excerpt, content, category, author, image_url, status,
                published_at, created_at, updated_at
                FROM blog_posts WHERE slug = @slug AND status = 'published'`);
        if (!result.recordset[0]) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        return res.json(result.recordset[0]);
    } catch (error) {
        return next(error);
    }
});

router.post('/', requireAuth, async (req, res, next) => {
    try {
        const body = req.body || {};
        const title = String(body.title || '').trim();
        const slug = String(body.slug || '').trim();
        const status = body.status || 'draft';
        if (!title || !slug || !blogStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Title, slug, and valid status are required' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('title', sql.NVarChar(255), title)
            .input('slug', sql.NVarChar(255), slug)
            .input('excerpt', sql.NVarChar(500), bodyValue(body, 'excerpt'))
            .input('content', sql.NVarChar(sql.MAX), bodyValue(body, 'content'))
            .input('category', sql.NVarChar(100), bodyValue(body, 'category'))
            .input('author', sql.NVarChar(150), bodyValue(body, 'author'))
            .input('image_url', sql.NVarChar(500), bodyValue(body, 'image_url'))
            .input('status', sql.NVarChar(20), status)
            .input('published_at', sql.DateTime2, bodyValue(body, 'published_at') || null)
            .query(`INSERT INTO blog_posts
                (title, slug, excerpt, content, category, author, image_url, status, published_at)
                OUTPUT INSERTED.id
                VALUES (@title, @slug, @excerpt, @content, @category, @author, @image_url, @status, @published_at)`);
        return res.status(201).json({ success: true, id: result.recordset[0].id });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const body = req.body || {};
        const status = body.status || null;
        if (!Number.isInteger(id) || (status && !blogStatuses.includes(status))) {
            return res.status(400).json({ success: false, error: 'Invalid id or status' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar(255), bodyValue(body, 'title'))
            .input('slug', sql.NVarChar(255), bodyValue(body, 'slug'))
            .input('excerpt', sql.NVarChar(500), bodyValue(body, 'excerpt'))
            .input('content', sql.NVarChar(sql.MAX), bodyValue(body, 'content'))
            .input('category', sql.NVarChar(100), bodyValue(body, 'category'))
            .input('author', sql.NVarChar(150), bodyValue(body, 'author'))
            .input('image_url', sql.NVarChar(500), bodyValue(body, 'image_url'))
            .input('status', sql.NVarChar(20), status)
            .input('published_at', sql.DateTime2, bodyValue(body, 'published_at'))
            .query(`UPDATE blog_posts SET
                title = COALESCE(@title, title), slug = COALESCE(@slug, slug), excerpt = COALESCE(@excerpt, excerpt),
                content = COALESCE(@content, content), category = COALESCE(@category, category),
                author = COALESCE(@author, author), image_url = COALESCE(@image_url, image_url),
                status = COALESCE(@status, status), published_at = @published_at, updated_at = SYSUTCDATETIME()
                WHERE id = @id`);
        if (!result.rowsAffected[0]) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        return res.json({ success: true });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, error: 'Invalid id' });
        }
        const pool = await getPool();
        const result = await pool.request().input('id', sql.Int, id)
            .query('DELETE FROM blog_posts WHERE id = @id');
        if (!result.rowsAffected[0]) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        return res.json({ success: true });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
