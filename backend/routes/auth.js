const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        const admin = db.get('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)', [email.trim()]);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = bcrypt.compareSync(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Authentication successful',
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (err) {
        console.error('[Auth Login Error]:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /api/auth/me (Verify active session)
router.get('/me', verifyToken, (req, res) => {
    try {
        const admin = db.get('SELECT id, name, email, role, created_at FROM admins WHERE id = ?', [req.user.id]);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin account not found.' });
        }
        res.json({ success: true, user: admin });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/auth/password (Change password)
router.put('/password', verifyToken, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new passwords.' });
        }

        const admin = db.get('SELECT * FROM admins WHERE id = ?', [req.user.id]);
        if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
            return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }

        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(newPassword, salt);
        db.run('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
