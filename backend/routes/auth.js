const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('../db');

const router = express.Router();

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('username', sql.NVarChar(100), username.trim())
            .query('SELECT id, username, role, password_hash FROM admin_users WHERE username = @username');
        const user = result.recordset[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        await pool.request()
            .input('id', sql.Int, user.id)
            .query('UPDATE admin_users SET last_login_at = SYSUTCDATETIME() WHERE id = @id');

        const token = jwt.sign(
            { sub: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
