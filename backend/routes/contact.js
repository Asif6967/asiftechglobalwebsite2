const express = require('express');
const { sql, getPool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const statuses = ['new', 'read', 'responded', 'archived'];

function pagination(query) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
    return { page, limit, offset: (page - 1) * limit };
}

router.post('/', async (req, res, next) => {
    try {
        const body = req.body || {};
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim();
        const message = String(body.message || '').trim();

        if (!name || !email || !message || !emailPattern.test(email)) {
            return res.status(400).json({ success: false, error: 'Valid name, email, and message are required' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('name', sql.NVarChar(150), name)
            .input('email', sql.NVarChar(255), email)
            .input('phone', sql.NVarChar(50), body.phone ? String(body.phone).trim() : null)
            .input('company', sql.NVarChar(150), body.company ? String(body.company).trim() : null)
            .input('service', sql.NVarChar(100), body.service ? String(body.service).trim() : null)
            .input('budget', sql.NVarChar(50), body.budget ? String(body.budget).trim() : null)
            .input('timeline', sql.NVarChar(50), body.timeline ? String(body.timeline).trim() : null)
            .input('message', sql.NVarChar(sql.MAX), message)
            .query(`INSERT INTO contact_submissions
                (name, email, phone, company, service, budget, timeline, message)
                OUTPUT INSERTED.id
                VALUES (@name, @email, @phone, @company, @service, @budget, @timeline, @message)`);

        return res.status(201).json({ success: true, id: result.recordset[0].id });
    } catch (error) {
        return next(error);
    }
});

router.get('/', requireAuth, async (req, res, next) => {
    try {
        const { page, limit, offset } = pagination(req.query);
        const status = req.query.status ? String(req.query.status) : null;
        const pool = await getPool();
        const listRequest = pool.request()
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset)
            .input('status', sql.NVarChar(20), status);
        const countRequest = pool.request().input('status', sql.NVarChar(20), status);
        const where = status ? ' WHERE status = @status' : '';
        const [itemsResult, countResult] = await Promise.all([
            listRequest.query(`SELECT id, name, email, phone, company, service, budget, timeline, message, status, created_at
                FROM contact_submissions${where}
                ORDER BY created_at DESC, id DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`),
            countRequest.query(`SELECT COUNT(*) AS total FROM contact_submissions${where}`)
        ]);

        return res.json({ items: itemsResult.recordset, total: countResult.recordset[0].total, page, limit });
    } catch (error) {
        return next(error);
    }
});

router.patch('/:id/status', requireAuth, async (req, res, next) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const status = String(req.body?.status || '');
        if (!Number.isInteger(id) || !statuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid id or status' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar(20), status)
            .query('UPDATE contact_submissions SET status = @status WHERE id = @id');
        if (!result.rowsAffected[0]) {
            return res.status(404).json({ success: false, error: 'Contact not found' });
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
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM contact_submissions WHERE id = @id');
        if (!result.rowsAffected[0]) {
            return res.status(404).json({ success: false, error: 'Contact not found' });
        }
        return res.json({ success: true });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
