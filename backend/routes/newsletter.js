const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// POST /api/newsletter (Subscribe)
router.post('/', (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'A valid email address is required.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const existing = db.get('SELECT id FROM subscribers WHERE email = ?', [cleanEmail]);
        if (existing) {
            return res.json({ success: true, message: 'You are already subscribed to our newsletter!' });
        }

        db.run('INSERT INTO subscribers (email) VALUES (?)', [cleanEmail]);
        res.status(201).json({ success: true, message: 'Thank you for subscribing to AsifTechGlobal updates!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/newsletter (Admin Only: List all subscribers)
router.get('/', verifyToken, (req, res) => {
    try {
        const subscribers = db.all('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
        res.json({ success: true, count: subscribers.length, data: subscribers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/newsletter/:id (Admin Only)
router.delete('/:id', verifyToken, (req, res) => {
    try {
        db.run('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Subscriber removed successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
