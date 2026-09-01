const express = require('express');
const { sql, getPool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function bodyValue(body, key) {
    return Object.prototype.hasOwnProperty.call(body, key) ? body[key] : null;
}

router.get('/', async (req, res, next) => {
    try {
        const category = req.query.category ? String(req.query.category) : null;
        const featured = req.query.featured === 'true' ? 1 : null;
        const pool = await getPool();
        const result = await pool.request()
            .input('category', sql.NVarChar(100), category)
            .input('featured', sql.Bit, featured)
            .query(`SELECT id, title, category, client, description, image_url, project_url, technologies,
                completed_on, featured, sort_order, created_at, updated_at
                FROM portfolio_projects
                WHERE (@category IS NULL OR category = @category)
                  AND (@featured IS NULL OR featured = @featured)
                ORDER BY sort_order ASC, id ASC`);
        return res.json(result.recordset);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, error: 'Invalid id' });
        }
        const pool = await getPool();
        const result = await pool.request().input('id', sql.Int, id)
            .query(`SELECT id, title, category, client, description, image_url, project_url, technologies,
                completed_on, featured, sort_order, created_at, updated_at
                FROM portfolio_projects WHERE id = @id`);
        if (!result.recordset[0]) {
            return res.status(404).json({ success: false, error: 'Project not found' });
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
        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }
        const pool = await getPool();
        const result = await pool.request()
            .input('title', sql.NVarChar(255), title)
            .input('category', sql.NVarChar(100), bodyValue(body, 'category'))
            .input('client', sql.NVarChar(150), bodyValue(body, 'client'))
            .input('description', sql.NVarChar(sql.MAX), bodyValue(body, 'description'))
            .input('image_url', sql.NVarChar(500), bodyValue(body, 'image_url'))
            .input('project_url', sql.NVarChar(500), bodyValue(body, 'project_url'))
            .input('technologies', sql.NVarChar(500), bodyValue(body, 'technologies'))
            .input('completed_on', sql.Date, bodyValue(body, 'completed_on') || null)
            .input('featured', sql.Bit, body.featured ? 1 : 0)
            .input('sort_order', sql.Int, Number.parseInt(body.sort_order, 10) || 0)
            .query(`INSERT INTO portfolio_projects
                (title, category, client, description, image_url, project_url, technologies, completed_on, featured, sort_order)
                OUTPUT INSERTED.id
                VALUES (@title, @category, @client, @description, @image_url, @project_url, @technologies,
                    @completed_on, @featured, @sort_order)`);
        return res.status(201).json({ success: true, id: result.recordset[0].id });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, error: 'Invalid id' });
        }
        const body = req.body || {};
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar(255), bodyValue(body, 'title'))
            .input('category', sql.NVarChar(100), bodyValue(body, 'category'))
            .input('client', sql.NVarChar(150), bodyValue(body, 'client'))
            .input('description', sql.NVarChar(sql.MAX), bodyValue(body, 'description'))
            .input('image_url', sql.NVarChar(500), bodyValue(body, 'image_url'))
            .input('project_url', sql.NVarChar(500), bodyValue(body, 'project_url'))
            .input('technologies', sql.NVarChar(500), bodyValue(body, 'technologies'))
            .input('completed_on', sql.Date, bodyValue(body, 'completed_on') || null)
            .input('featured', sql.Bit, bodyValue(body, 'featured') === null ? null : (body.featured ? 1 : 0))
            .input('sort_order', sql.Int, bodyValue(body, 'sort_order') === null ? null : (Number.parseInt(body.sort_order, 10) || 0))
            .query(`UPDATE portfolio_projects SET
                title = COALESCE(@title, title), category = COALESCE(@category, category),
                client = COALESCE(@client, client), description = COALESCE(@description, description),
                image_url = COALESCE(@image_url, image_url), project_url = COALESCE(@project_url, project_url),
                technologies = COALESCE(@technologies, technologies),
                completed_on = COALESCE(@completed_on, completed_on),
                featured = COALESCE(@featured, featured), sort_order = COALESCE(@sort_order, sort_order),
                updated_at = SYSUTCDATETIME()
                WHERE id = @id`);
        if (!result.rowsAffected[0]) {
            return res.status(404).json({ success: false, error: 'Project not found' });
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
            .query('DELETE FROM portfolio_projects WHERE id = @id');
        if (!result.rowsAffected[0]) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        return res.json({ success: true });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
